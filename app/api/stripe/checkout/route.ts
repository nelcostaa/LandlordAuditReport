import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { checkoutLimiter, getClientIP } from "@/lib/rate-limiter";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia"
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    const rateLimitResult = checkoutLimiter.check(clientIP);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again later." },
        { 
          status: 429,
          headers: checkoutLimiter.getHeaders(rateLimitResult),
        }
      );
    }

    const body = await req.json();
    const priceId = body.priceId;
    const email = body.email;
    const name = body.name;
    const address = body.address || body.propertyAddress;

    // Validate required fields
    if (!priceId || !email || !name || !address) {
      return NextResponse.json(
        { error: "Missing required fields: priceId, email, name, address" },
        { status: 400 }
      );
    }

    // Validate price exists and is active in Stripe
    let price: Stripe.Price;
    try {
      price = await stripe.prices.retrieve(priceId);
      if (!price.active) {
        return NextResponse.json(
          { error: "This product is no longer available." },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid price. Please refresh and try again." },
        { status: 400 }
      );
    }

    // Resolve service type from product metadata or default
    const productId = typeof price.product === 'string' ? price.product : price.product?.toString();
    const serviceType = productId || "online";

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "https://landlord-audit.vercel.app";

    // Create Stripe Checkout Session using the registered price
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?canceled=true`,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        customer_name: name,
        customer_email: email,
        property_address: address,
        service_type: serviceType,
      },
      payment_intent_data: {
        metadata: {
          customer_name: name,
          customer_email: email,
          property_address: address,
          service_type: serviceType,
        },
      },
    });

    return NextResponse.json(
      { 
        url: session.url,
        sessionId: session.id,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";
import { sendQuestionnaireEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Stripe webhook secret from dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json(
          { error: "Webhook signature verification failed" },
          { status: 400 }
        );
      }
    } else {
      // For development without webhook secret - parse event directly
      // WARNING: Do not use this in production!
      console.warn("STRIPE_WEBHOOK_SECRET not set - skipping signature verification");
      event = JSON.parse(body) as Stripe.Event;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        // Stripe Checkout redirect flow completed
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session completed: ${session.id}`);
        
        // Ensure payment was successful before provisioning
        if (session.payment_status === "paid") {
          console.log(`Session ${session.id} paid, processing audit creation`);
          await handlePaymentSuccess(session);
        } else {
          console.log(`Session ${session.id} completed but payment status is: ${session.payment_status}`);
        }
        break;
      }

      case "payment_intent.succeeded": {
        // We log this, but handle the actual provisioning in checkout.session.completed
        // because Checkout Sessions hold the metadata in the new flow
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed for ${paymentIntent.id}:`, paymentIntent.last_payment_error?.message);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  
  // Extract customer information from session metadata
  const customerName = metadata.customer_name;
  const customerEmail = metadata.customer_email;
  const propertyAddress = metadata.property_address;
  const serviceType = metadata.service_type;

  // The Payment Intent ID is attached to the session
  // For checkout sessions this is a string, handle typing safely
  const paymentIntentId = typeof session.payment_intent === 'string' 
    ? session.payment_intent 
    : session.payment_intent?.id || session.id;

  if (!customerName || !customerEmail || !propertyAddress || !serviceType) {
    console.error("Missing metadata in checkout session:", session.id, "Metadata:", metadata);
    return;
  }

  // Determine tier based on service type
  const tier = "tier_0";

  // Generate unique token for the audit
  const token = randomUUID();

  try {
    // Check if audit already exists for this payment intent or session
    const existingAudit = await sql`
      SELECT id FROM audits WHERE payment_intent_id = ${paymentIntentId}
    `;

    if (existingAudit.rows.length > 0) {
      console.log(`Audit already exists for payment ${paymentIntentId}`);
      return;
    }

    // Create the audit record
    const result = await sql`
      INSERT INTO audits (
        auditor_id,
        token,
        client_name,
        landlord_email,
        property_address,
        risk_audit_tier,
        conducted_by,
        payment_intent_id,
        payment_status,
        payment_amount,
        service_type,
        created_at
      )
      VALUES (
        NULL,
        ${token},
        ${customerName},
        ${customerEmail},
        ${propertyAddress},
        ${tier},
        'Self-Service',
        ${paymentIntentId},
        'paid',
        ${session.amount_total || 5000},
        ${serviceType},
        NOW()
      )
      RETURNING id, token
    `;

    console.log(`Created audit ${result.rows[0].id} for payment ${paymentIntentId}`);

    // Send email notification to customer with audit link
    try {
      await sendQuestionnaireEmail(
        customerEmail,
        result.rows[0].token,
        customerName,
        propertyAddress
      );
      console.log(`Sent questionnaire email to ${customerEmail}`);
    } catch (emailError) {
      // Log email error but don't fail the webhook - audit was created successfully
      console.error(`Failed to send email to ${customerEmail}:`, emailError);
    }

  } catch (error) {
    console.error("Failed to create audit from payment:", error);
    
    // Log failed payment for manual recovery
    try {
      await sql`
        INSERT INTO failed_payments (
          payment_intent_id,
          customer_name,
          customer_email,
          property_address,
          service_type,
          payment_amount,
          error_message,
          created_at
        )
        VALUES (
          ${paymentIntentId},
          ${customerName},
          ${customerEmail},
          ${propertyAddress},
          ${serviceType},
          ${session.amount_total || 5000},
          ${error instanceof Error ? error.message : 'Unknown error'},
          NOW()
        )
        ON CONFLICT (payment_intent_id) DO UPDATE SET
          retry_count = failed_payments.retry_count + 1,
          last_retry_at = NOW(),
          error_message = EXCLUDED.error_message
      `;
      console.log(`Logged failed payment ${paymentIntentId} for recovery`);
    } catch (logError) {
      console.error("Failed to log failed payment:", logError);
    }
    
    // Re-throw to trigger Stripe retry
    throw error;
  }
}

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

/**
 * GET /api/stripe/products
 * Returns active Stripe products with their prices.
 * Used by the frontend to dynamically render pricing cards.
 */
export async function GET() {
  try {
    // Fetch all active products with their default prices expanded
    const products = await stripe.products.list({
      active: true,
      limit: 20,
      expand: ['data.default_price'],
    });

    const productData = products.data.map(product => {
      const defaultPrice = product.default_price as Stripe.Price | null;
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        metadata: product.metadata,
        images: product.images,
        defaultPrice: defaultPrice ? {
          id: defaultPrice.id,
          unit_amount: defaultPrice.unit_amount,
          currency: defaultPrice.currency,
          type: defaultPrice.type,
          recurring: defaultPrice.recurring,
        } : null,
      };
    });

    // Also fetch all active prices for completeness
    const prices = await stripe.prices.list({
      active: true,
      limit: 50,
      expand: ['data.product'],
    });

    const priceData = prices.data.map(price => ({
      id: price.id,
      product: typeof price.product === 'string' ? price.product : (price.product as Stripe.Product)?.name,
      product_id: typeof price.product === 'string' ? price.product : (price.product as Stripe.Product)?.id,
      unit_amount: price.unit_amount,
      currency: price.currency,
      type: price.type,
      recurring: price.recurring,
      metadata: price.metadata,
    }));

    return NextResponse.json({
      products: productData,
      prices: priceData,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

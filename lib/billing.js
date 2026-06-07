let stripeClient = null;

function getStripe() {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const Stripe = require('stripe');
  stripeClient = new Stripe(key);
  return stripeClient;
}

async function createCheckoutSession({ lineItems, origin }) {
  const stripe = getStripe();
  if (!stripe) {
    return {
      configured: false,
      message: 'Set STRIPE_SECRET_KEY in env vars to enable real checkout. Until then, the order flow simulates success.',
    };
  }
  const sessionObj = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems.map((li) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: li.name, images: li.image ? [li.image] : [] },
        unit_amount: li.price,
      },
      quantity: li.quantity,
    })),
    success_url: `${origin}/?ordered=1`,
    cancel_url: `${origin}/cart.html`,
  });
  return { configured: true, url: sessionObj.url };
}

module.exports = { createCheckoutSession };

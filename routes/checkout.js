const express = require('express');
const products = require('../lib/products');
const billing = require('../lib/billing');

const router = express.Router();

router.post('/checkout', async (req, res) => {
  try {
    const cart = (req.session && req.session.cart) || [];
    if (!cart.length) return res.status(400).json({ error: 'cart_empty' });
    const lineItems = cart.map((i) => {
      const p = products.getById(i.productId);
      return p && { name: p.name, image: p.image, price: p.price, quantity: i.quantity };
    }).filter(Boolean);
    const origin = `${req.protocol}://${req.get('host')}`;
    const result = await billing.createCheckoutSession({ lineItems, origin });
    if (result.configured) {
      req.session.cart = [];
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'checkout_failed', detail: err.message });
  }
});

module.exports = router;

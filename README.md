# E-commerce Starter

A real storefront scaffold: products API, session-backed cart, and a Stripe-ready checkout. 8 sample products across 4 categories. No database required.

## What's inside

```
ecommerce/
  server.js                   # express + session + /api routes
  lib/products.js             # 8 hardcoded products w/ Unsplash images
  lib/billing.js              # Stripe wrapper (lazy-loads when STRIPE_SECRET_KEY is set)
  routes/products.js          # GET /api/products?category=, /api/products/:slug
  routes/cart.js              # GET/POST/PATCH/DELETE /api/cart (session-keyed)
  routes/checkout.js          # POST /api/checkout (creates Stripe session or returns config-hint)
  public/index.html           # product grid w/ category filter
  public/product.html         # product detail
  public/cart.html            # cart view + checkout
  public/app.js               # frontend wiring
  public/styles.css           # design system
```

## Start it locally

```bash
npm install
npm start
```

Open http://localhost:3000.

## Enabling Stripe checkout

Set `STRIPE_SECRET_KEY` as an env var (in VibeKit: `/env`). The checkout endpoint will then create a real Stripe session and redirect.

## Ask the agent

- "Replace the hardcoded products with my Shopify catalog."
- "Add inventory tracking — each product needs a stock count."
- "Add a wishlist that persists across sessions."

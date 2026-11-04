# Beige Store (React)

React + Vite version of the Beige skin, body and hair care storefront.

## Run it

```bash
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build into dist/
```

Requires Node.js 18+.

## Structure

```
src/
  main.jsx               entry point
  App.jsx                page layout + all shared state (cart, wishlist, filters, modal)
  styles.css             all styles (same design as the original HTML)
  data/products.js       product catalogue, categories, price formatter
  components/
    Header.jsx           top bar, logo, nav, login / wishlist / bag buttons
    Hero.jsx             hero banner
    ServiceStrip.jsx     shipping / Razorpay strip
    Shop.jsx             category tabs, search, product grid
    ProductCard.jsx      single product tile (+ ProductArt placeholder)
    Closing.jsx          closing banner
    Footer.jsx
    Modal.jsx            reusable overlay (Esc / click outside closes)
    modals/              Cart, Wishlist, Product detail, Login, Skin test, Try-on
```

## Common changes

- **Products / prices:** edit `src/data/products.js`. Products without an `image` show a beige bottle placeholder (`kind`: `bottle`, `jar` or `tall`).
- **Free shipping threshold:** `FREE_SHIPPING_THRESHOLD` in `products.js`.
- **Colours / fonts:** CSS variables at the top of `styles.css`.

## Not wired up yet (placeholders with `TODO` comments)

- Checkout / Razorpay payment — `modals/CartModal.jsx`
- Login / authentication — `modals/LoginModal.jsx`
- Skin & hair test recommendations — `modals/SkinTestModal.jsx`
- AI makeup try-on — `modals/TryOnModal.jsx`

Cart and wishlist live in React state only, so they reset on page reload.
Product and hero images are hot-linked sample images and should be replaced with your own.

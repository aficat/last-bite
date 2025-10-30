# LastBite (Demo)

LastBite is a small PWA that showcases last-hour bakery deals. It lets you switch between Consumer and Vendor views with no sign-in.

## Features
- Consumer: Available Now vs Coming Soon tabs, per‑shop favorites (heart) and subscriptions (bell), filters for mystery packs, coupons, and distance.
- Vendor: set closing time, choose sale window, toggle open for sales, pick logistics metric (item/weight), add Mystery Packs by size, sell Coupon Packages.
- PWA: manifest + service worker for offline after first load.

## Run
- Python
  ```bash
  python3 -m http.server 8000
  ```
  Open http://localhost:8000
- Node
  ```bash
  npx serve . -p 5173 --single
  ```

## Assets
Put 3D bakery illustrations in `assets/` with these names:
- cake.png (hero)
- roll.png (mystery)
- loaf.png (coupon)
- bread.png (fallback)
- buns.png, baguette.png, braid.png, eggs.png, oven.png (optional)

Update `app.js` → `assetByKind` to change mappings.

## Files
- index.html, styles.css, app.js
- manifest.webmanifest, service-worker.js

## Notes
Demo only. No real auth, payments, or backend push. Use your own licensed assets.

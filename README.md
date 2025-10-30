# LastBite

LastBite is a small PWA that showcases last-hour bakery deals to reduce food wastage. 
For demo purposes: It lets you switch between Consumer and Vendor views with no sign-in.

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

---

## Product Requirements Document (PRD) – LastBite

### Product Name
LastBite

### Tagline
Grab the last, save more

### 1. Purpose
LastBite is a Progressive Web App (PWA) that helps small food vendors sell perishable items during their final hour of operation. It reduces food wastage, increases last-minute sales, and offers consumers affordable access to fresh meals and bakery goods through mystery boxes or discounted items.

### 2. Problem Statement
Small food vendors, including bakeries, cafés, delis, and market stalls, frequently end the day with unsold perishable items. This leads to lost revenue and unnecessary food waste. Traditional markdowns or last-minute promotions are manual, inconsistent, and often unnoticed by customers.

### 3. Objectives
- Help vendors recover costs from unsold perishable items.
- Offer consumers affordable, last-hour food options in a convenient, engaging format.
- Reduce food waste and promote sustainable consumption.
- Build a local community of users motivated by deals and eco-conscious habits.

### 4. Target Users
#### A. Vendor Side
- Bakeries / Pastry Shops – Bread, cakes, pastries.
- Cafés / Coffee Shops – Sandwiches, salads, ready-to-eat meals, limited shelf-life drinks.
- Delis / Prepared Meal Stores – Bento boxes, salads, cooked meals.
- Small Grocery / Market Vendors – Fruits, vegetables, dairy that must sell within the day.

#### B. Consumer Side
- Bargain hunters and budget-conscious customers.
- Urban consumers seeking convenient, grab-and-go food.
- Eco-conscious buyers motivated by sustainability.
- Curious customers drawn to the excitement of mystery boxes.

### 5. Unique Features
#### A. Vendor Features
- Last-Hour Triggered Sales: Promotions automatically activate during the store’s final hour of operation; vendors can set a custom window (e.g., last 1–2 hours).
- Mystery Box Creation: Vendors package leftover items into mystery boxes; define box size and discounted price.
- Individual Item Discounts: Apply percentage discounts (e.g., 50% off) to selected items nearing expiry.
- Real-Time Inventory Management: Track available boxes and discounted items; dashboard shows items sold, revenue recovered, and estimated waste prevented.
- Customer Notifications: Notify nearby registered users when last-hour deals go live; configurable radius and frequency.
- Analytics and Insights: Daily/weekly reports on sales recovery and waste reduction; insights into high-performing items.

#### B. Consumer Features
- Nearby Vendor Discovery: Map and list views of active deals; filters for mystery boxes or individual discounts.
- Mystery Box Purchase: Buy without selecting specific items; optional pick-up or delivery (if supported).
- Item-Level Discount Purchase: Browse and buy discounted items directly; real-time availability to prevent overselling.
- Secure Payments: Cards, Apple Pay, Google Pay, or in-app wallet (future integration).
- Loyalty and Rewards: Points for purchases/referrals; share mystery box “unboxing” for bonuses.
- Personalised Notifications: Alerts for nearby deals within chosen distance and user preferences.

### 6. User Flow
Vendor uploads leftover items → sets mystery box or discount → activates last-hour promotion → app sends notifications → customer browses and buys → pickup/delivery → feedback and loyalty points → vendor reviews analytics.

### 7. Technology Requirements
- Progressive Web App (mobile and desktop).
- Real-time inventory via WebSocket/REST.
- Push notifications for users and vendors.
- Secure payment gateway integration.
- Vendor dashboard with analytics and item management.
- Location-based discovery (GPS).

### 8. Success Metrics
- Daily food wastage reduction (%).
- Mystery boxes and discounted items sold.
- Customer repeat purchase rate.
- Vendor adoption and satisfaction.
- Revenue recovered from unsold goods.

### 9. Future Enhancements
- Subscription Model (daily/weekly mystery boxes).
- AI Recommendations (box sizes, pricing, timing).
- Dynamic Pricing based on inventory levels.
- Community Features (ratings, reviews, social sharing).
- Charity Integration for unsold donations.

### 10. Unique Selling Proposition (USP)
LastBite combines last-hour perishables, mystery boxes, and real-time discounts into one platform—turning potential food waste into win–win opportunities for vendors and consumers: fun, urgent, sustainable, and rewarding.

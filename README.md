# Lampwick Stationers - Mini Shop (Project 05)

**Option chosen:** the shop (catalogue + cart). All products are made up.

## Run it
Open the folder in VS Code and start **Live Server** on `index.html`
(or `python3 -m http.server` and visit http://localhost:8000).

## How totals are calculated (for your submission note)
- Prices are stored as plain numbers (rupees) and only formatted for display with
  `toLocaleString("en-IN", { style: "currency", currency: "INR" })`.
- The cart is an object `{ productId: quantity }`. Products are always found by `id`, never by array position.
- Subtotal = sum of `price x quantity`, computed with `reduce`.
- Discount: 10% off when subtotal is Rs 2,000 or more (rounded to a whole rupee).
- Delivery: Rs 40 when subtotal is above 0 and below Rs 500, otherwise free.
- Total = subtotal - discount + delivery.
- The cart is saved to `localStorage`; on load, unknown ids and bad quantities are discarded.
- Checkout preview is a `<dialog>` labelled as a demonstration. No payment details are asked for.

## Files
- `index.html` - page shell, cart table and dialog
- `style.css` - responsive layout
- `script.js` - data array, cart state, totals, rendering, events

## Test checklist
Add, increase, decrease to zero, remove, remove the last item (empty message returns),
reload (cart persists), filter by category, open checkout at each delivery/discount level.

## Publish with GitHub Pages
Upload the files to a repo, then Settings -> Pages -> `main` / root. Submit the live and repo links.

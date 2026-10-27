"use strict";

/* ---------- Data: everything on the page is rendered from this array ---------- */
const products = [
  { id: 1,  name: "Notebook, A5 ruled",    price: 120,  category: "Paper",       imageText: "A5 Ruled" },
  { id: 2,  name: "Sketchbook, 40 sheets", price: 240,  category: "Paper",       imageText: "Sketch" },
  { id: 3,  name: "Sticky notes, 6 pack",  price: 90,   category: "Paper",       imageText: "Sticky" },
  { id: 4,  name: "Pen pack, blue (10)",   price: 80,   category: "Writing",     imageText: "10 Pens" },
  { id: 5,  name: "Fountain pen",          price: 450,  category: "Writing",     imageText: "Fountain" },
  { id: 6,  name: "Pencil set, 12 HB",     price: 110,  category: "Writing",     imageText: "12 HB" },
  { id: 7,  name: "Desk lamp",             price: 650,  category: "Desk",        imageText: "Lamp" },
  { id: 8,  name: "Desk organiser",        price: 380,  category: "Desk",        imageText: "Organiser" },
  { id: 9,  name: "Leather pen pouch",     price: 520,  category: "Accessories", imageText: "Pouch" },
  { id: 10, name: "Cotton tote bag",       price: 300,  category: "Accessories", imageText: "Tote" }
];

/* ---------- Business rules ---------- */
const DELIVERY_FEE = 40;
const FREE_DELIVERY_AT = 500;      // delivery is free once subtotal reaches this
const DISCOUNT_AT = 2000;          // 10% off once subtotal reaches this
const DISCOUNT_RATE = 0.10;
const STORAGE_KEY = "lampwick-cart";

/* ---------- State: { [productId]: quantity } ---------- */
let cart = loadCart();
let activeCategory = "All";

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const clean = {};
    // keep only valid ids with positive whole quantities (storage can be edited or stale)
    Object.keys(raw).forEach(function (id) {
      const qty = Number(raw[id]);
      if (findProduct(id) && Number.isInteger(qty) && qty > 0) clean[id] = qty;
    });
    return clean;
  } catch (e) {
    return {};
  }
}

function findProduct(id) {
  return products.find(function (p) { return p.id === Number(id); });
}

function formatMoney(n) {
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

/* ---------- Cart actions ---------- */
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  save();
}
function changeQuantity(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  save();
}
function removeItem(id) {
  delete cart[id];
  save();
}
function clearCart() {
  cart = {};
  save();
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) { /* storage blocked */ }
  renderCart();
}

/* ---------- Totals ---------- */
function itemCount() {
  return Object.keys(cart).reduce(function (n, id) { return n + cart[id]; }, 0);
}
function totals() {
  const subtotal = Object.keys(cart).reduce(function (sum, id) {
    return sum + findProduct(id).price * cart[id];
  }, 0);
  const discount = subtotal >= DISCOUNT_AT ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const delivery = subtotal > 0 && subtotal < FREE_DELIVERY_AT ? DELIVERY_FEE : 0;
  return { subtotal: subtotal, discount: discount, delivery: delivery, total: subtotal - discount + delivery };
}

/* ---------- DOM helpers (text always via textContent) ---------- */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function byId(id) { return document.getElementById(id); }

/* ---------- Rendering: catalogue ---------- */
function renderFilters() {
  const names = ["All"].concat(products.map(function (p) { return p.category; })
    .filter(function (c, i, all) { return all.indexOf(c) === i; }));
  const box = byId("filters");
  box.replaceChildren();
  names.forEach(function (name) {
    const b = el("button", "chip", name);
    b.type = "button";
    b.dataset.category = name;
    b.setAttribute("aria-pressed", String(name === activeCategory));
    box.appendChild(b);
  });
}

function renderCatalogue() {
  const list = byId("catalogue");
  list.replaceChildren();
  products
    .filter(function (p) { return activeCategory === "All" || p.category === activeCategory; })
    .forEach(function (p) {
      const card = el("article", "card");
      const thumb = el("div", "thumb", p.imageText);
      thumb.dataset.cat = p.category;
      const body = el("div", "card-body");
      body.appendChild(el("h3", "", p.name));
      body.appendChild(el("p", "cat", p.category));
      body.appendChild(el("p", "price", formatMoney(p.price)));
      const add = el("button", "primary", "Add to cart");
      add.type = "button";
      add.dataset.id = p.id;
      add.setAttribute("aria-label", "Add " + p.name + " to cart");
      body.appendChild(add);
      card.append(thumb, body);
      list.appendChild(card);
    });
}

/* ---------- Rendering: cart ---------- */
function renderCart() {
  const ids = Object.keys(cart);
  const t = totals();
  byId("count").textContent = itemCount();
  byId("empty").hidden = ids.length > 0;
  byId("cart-body").hidden = ids.length === 0;

  const rows = byId("cart-rows");
  rows.replaceChildren();
  ids.forEach(function (id) {
    const p = findProduct(id);
    const tr = el("tr");

    const nameCell = el("td");
    nameCell.appendChild(el("span", "", p.name));
    const rm = el("button", "remove", "Remove");
    rm.type = "button";
    rm.dataset.action = "remove";
    rm.dataset.id = id;
    rm.setAttribute("aria-label", "Remove " + p.name + " from cart");
    nameCell.appendChild(rm);

    const qtyCell = el("td");
    const qty = el("div", "qty");
    const minus = el("button", "", "\u2212");
    minus.type = "button"; minus.dataset.action = "dec"; minus.dataset.id = id;
    minus.setAttribute("aria-label", "Decrease quantity of " + p.name);
    const plus = el("button", "", "+");
    plus.type = "button"; plus.dataset.action = "inc"; plus.dataset.id = id;
    plus.setAttribute("aria-label", "Increase quantity of " + p.name);
    qty.append(minus, el("span", "", String(cart[id])), plus);
    qtyCell.appendChild(qty);

    tr.append(nameCell, qtyCell, el("td", "num", formatMoney(p.price * cart[id])));
    rows.appendChild(tr);
  });

  byId("subtotal").textContent = formatMoney(t.subtotal);
  byId("discount-row").hidden = t.discount === 0;
  byId("discount").textContent = "\u2212" + formatMoney(t.discount);
  byId("delivery").textContent = t.delivery === 0 ? "Free" : formatMoney(t.delivery);
  byId("total").textContent = formatMoney(t.total);

  // Tell the shopper how close they are to the next saving
  let nudge = "";
  if (t.subtotal > 0 && t.subtotal < FREE_DELIVERY_AT) {
    nudge = "Add " + formatMoney(FREE_DELIVERY_AT - t.subtotal) + " more for free delivery.";
  } else if (t.subtotal >= FREE_DELIVERY_AT && t.subtotal < DISCOUNT_AT) {
    nudge = "Add " + formatMoney(DISCOUNT_AT - t.subtotal) + " more to get 10% off.";
  } else if (t.discount > 0) {
    nudge = "10% discount applied.";
  }
  byId("nudge").textContent = nudge;
}

/* ---------- Checkout preview (dialog) ---------- */
function openCheckout() {
  if (itemCount() === 0) return;
  const t = totals();
  const list = byId("summary");
  list.replaceChildren();
  Object.keys(cart).forEach(function (id) {
    const p = findProduct(id);
    const li = el("li");
    li.append(el("span", "", cart[id] + " \u00D7 " + p.name), el("span", "", formatMoney(p.price * cart[id])));
    list.appendChild(li);
  });

  const sums = byId("dialog-sums");
  sums.replaceChildren();
  function line(label, value, cls) {
    const row = el("div", cls);
    row.append(el("dt", "", label), el("dd", "", value));
    sums.appendChild(row);
  }
  line("Subtotal", formatMoney(t.subtotal));
  if (t.discount > 0) line("Discount (10%)", "\u2212" + formatMoney(t.discount));
  line("Delivery", t.delivery === 0 ? "Free" : formatMoney(t.delivery));
  line("Total", formatMoney(t.total), "grand");

  byId("dialog").showModal();
}

/* ---------- Events (delegated, using data attributes) ---------- */
byId("filters").addEventListener("click", function (e) {
  const b = e.target.closest("button[data-category]");
  if (!b) return;
  activeCategory = b.dataset.category;
  renderFilters();
  renderCatalogue();
});

byId("catalogue").addEventListener("click", function (e) {
  const b = e.target.closest("button[data-id]");
  if (b) addToCart(b.dataset.id);
});

byId("cart-rows").addEventListener("click", function (e) {
  const b = e.target.closest("button[data-action]");
  if (!b) return;
  const id = b.dataset.id;
  if (b.dataset.action === "inc") changeQuantity(id, 1);
  if (b.dataset.action === "dec") changeQuantity(id, -1);
  if (b.dataset.action === "remove") removeItem(id);
});

byId("checkout").addEventListener("click", openCheckout);
byId("clear").addEventListener("click", clearCart);
byId("close").addEventListener("click", function () { byId("dialog").close(); });
byId("dialog").addEventListener("click", function (e) {
  if (e.target === e.currentTarget) e.currentTarget.close();   // click on backdrop
});

/* ---------- Start ---------- */
renderFilters();
renderCatalogue();
renderCart();

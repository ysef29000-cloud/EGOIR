(() => {
  "use strict";
  const S = window.STORE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => `${Math.round(n).toLocaleString("en-US")} ${S.currency}`;
  const byId = id => S.products.find(p => p.id === id);
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  const GOVS = ["القاهرة","الجيزة","الإسكندرية","القليوبية","الدقهلية","الشرقية","الغربية","المنوفية","البحيرة","كفر الشيخ","دمياط","بورسعيد","الإسماعيلية","السويس","الفيوم","بني سويف","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان","البحر الأحمر","مطروح","الوادي الجديد","شمال سيناء","جنوب سيناء"];

  /* ---------- placeholder art (لحد ما تحط صورك) ---------- */
  const SHAPES = {
    "تيشيرتات": "M60 20l25-10h30l25 10 40 30-22 32-18-12v120H60V70L42 82 20 50z",
    "هوديز": "M70 30q30-30 60 0l45 25-18 40-17-10v125H60V85L43 95 25 55zM85 30q15 25 30 0",
    "بناطيل": "M60 10h80l15 200h-45l-10-130-10 130H45z",
    "جاكيتات": "M65 20l20-8h30l20 8 45 30-15 150h-35V90l-5 120H75l-5-120v110H35L20 50zM100 14v190"
  };
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f));
    return `rgb(${c.join(",")})`;
  };
  function art(p) {
    if (p.image) return `<img src="${p.image}" alt="${p.name}" loading="lazy">`;
    const c = p.colors[0] || "#222";
    const bg = `linear-gradient(160deg, ${shade(c, .82)}, ${shade(c, .6)})`;
    return `<div class="ph" style="background:${bg}"><svg viewBox="0 0 200 230"><path d="${SHAPES[p.category] || SHAPES["تيشيرتات"]}" fill="${c}" stroke="${shade(c, -.25)}" stroke-width="2" stroke-linejoin="round"/><text x="100" y="120" text-anchor="middle" font-family="Archivo Black" font-size="16" fill="${shade(c, c === "#efe9df" ? -.5 : .5)}">${S.brand}</text></svg></div>`;
  }
  const stars = r => "★★★★★".slice(0, Math.round(r)) + "☆☆☆☆☆".slice(0, 5 - Math.round(r));

  /* ---------- state ---------- */
  let cart = store.get("egoir_cart", []);          // [{id,size,qty}]
  let filter = "الكل";
  const chosen = {};                                  // productId -> size
  let checkoutItems = null;                           // items for current checkout
  let coupon = null;

  const saveCart = () => { store.set("egoir_cart", cart); renderCart(); };
  const sizeFor = p => chosen[p.id] || p.sizes[Math.min(1, p.sizes.length - 1)];

  /* ---------- toasts ---------- */
  let tt;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("on");
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2200);
  }

  /* ---------- overlay / panels ---------- */
  const panels = ["#cartDrawer", "#checkout", "#productModal", "#successModal"];
  function open(sel) {
    panels.forEach(p => $(p).classList.toggle("on", p === sel));
    $("#overlay").classList.add("on"); document.body.classList.add("lock");
  }
  function closeAll() {
    panels.forEach(p => $(p).classList.remove("on"));
    $("#overlay").classList.remove("on"); document.body.classList.remove("lock");
  }
  $("#overlay").onclick = closeAll;
  document.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeAll(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

  /* ---------- promo + timer ---------- */
  $("#promoText").textContent = S.offer.text;
  $("#promoCode").textContent = S.offer.code;
  $("#promoCode").onclick = () => { navigator.clipboard?.writeText(S.offer.code); toast("تم نسخ الكود ✓"); };
  let end = store.get("egoir_offer_end", 0);
  if (!end || end < Date.now()) { end = Date.now() + S.offer.hours * 3600e3; store.set("egoir_offer_end", end); }
  const tick = () => {
    const ms = Math.max(0, end - Date.now()), h = Math.floor(ms / 36e5), m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
    $("#timer").textContent = [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
  };
  tick(); setInterval(tick, 1000);

  /* ---------- static sections ---------- */
  $("#trustShip").textContent = `${S.shipping.days} • مجاني فوق ${money(S.shipping.freeOver)}`;
  $("#year").textContent = new Date().getFullYear();
  $("#waFloat").href = `https://wa.me/${S.whatsapp}`;
  $("#reviewsGrid").innerHTML = S.reviews.map(r => `
    <div class="review"><div class="stars">${stars(r.stars)}</div><p>"${r.text}"</p><small>${r.name} — ${r.city} • مشتري موثّق ✓</small></div>`).join("");
  $("#faqList").innerHTML = S.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("");
  $("#footerLinks").innerHTML = Object.entries(S.social).map(([k, v]) => `<a href="${v}" target="_blank" rel="noopener">${k[0].toUpperCase() + k.slice(1)}</a>`).join("");
  $("#fCity").innerHTML = `<option value="">اختار المحافظة</option>` + GOVS.map(g => `<option>${g}</option>`).join("");

  /* ---------- shop grid ---------- */
  function renderFilters() {
    $("#filters").innerHTML = S.categories.map(c => `<button class="chip ${c === filter ? "on" : ""}" data-cat="${c}">${c}</button>`).join("");
  }
  $("#filters").onclick = e => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    filter = b.dataset.cat; renderFilters(); renderGrid();
  };

  function priceHTML(p) {
    const save = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    return `<div class="price"><b>${money(p.price)}</b>${p.oldPrice ? `<s>${money(p.oldPrice)}</s><span class="save">وفّر ${save}%</span>` : ""}</div>`;
  }
  function sizesHTML(p) {
    const cur = sizeFor(p);
    return `<div class="sizes">${p.sizes.map(s => `<button class="size ${s === cur ? "on" : ""}" data-size="${s}" data-id="${p.id}">${s}</button>`).join("")}</div>`;
  }

  function renderGrid() {
    const list = S.products.filter(p => filter === "الكل" || p.category === filter);
    $("#grid").innerHTML = list.map(p => `
      <article class="card" data-id="${p.id}">
        <div class="media" data-view="${p.id}">
          ${art(p)}
          ${p.badge ? `<span class="badge ${/محدود|خصم/.test(p.badge) ? "hot" : ""}">${p.badge}</span>` : ""}
          ${p.stock <= 5 ? `<span class="stock">باقي ${p.stock} قطع بس!</span>` : ""}
        </div>
        <div class="info">
          <h3>${p.name}</h3>
          <div class="stars">${stars(p.rating)}<small>${p.rating} (${p.reviews})</small></div>
          ${priceHTML(p)}
          ${sizesHTML(p)}
          <div class="actions">
            <button class="btn btn-dark" data-buy="${p.id}">اطلب الآن</button>
            <button class="add" data-add="${p.id}" aria-label="أضف للسلة">+</button>
          </div>
        </div>
      </article>`).join("");
  }

  // delegation for grid + modal
  document.addEventListener("click", e => {
    const sz = e.target.closest("[data-size]");
    if (sz) {
      chosen[sz.dataset.id] = sz.dataset.size;
      $$(`[data-size][data-id="${sz.dataset.id}"]`).forEach(b => b.classList.toggle("on", b.dataset.size === sz.dataset.size));
      return;
    }
    const buy = e.target.closest("[data-buy]");
    if (buy) { const p = byId(buy.dataset.buy); buyNow(p); return; }          // ← الضغطة الأولى
    const add = e.target.closest("[data-add]");
    if (add) { addToCart(byId(add.dataset.add)); return; }
    const view = e.target.closest("[data-view]");
    if (view) { openProduct(byId(view.dataset.view)); return; }
  });

  /* ---------- product modal ---------- */
  function openProduct(p) {
    const viewers = 6 + Math.floor(Math.random() * 18);
    $("#productModal").innerHTML = `
      <div class="pm">
        <button class="x" data-close>✕</button>
        <div class="media">${art(p)}${p.badge ? `<span class="badge hot">${p.badge}</span>` : ""}</div>
        <div class="pm-body">
          <div class="stars">${stars(p.rating)}<small>${p.rating} • ${p.reviews} تقييم</small></div>
          <h2>${p.name}</h2>
          ${priceHTML(p)}
          ${S.socialProof ? `<span class="viewers">👀 ${viewers} شخص بيتفرجوا على المنتج ده دلوقتي</span>` : ""}
          <div><b style="font-size:14px">المقاس</b></div>
          ${sizesHTML(p)}
          <button class="link" id="sgToggle">📏 دليل المقاسات</button>
          <table class="size-guide" id="sg">
            <tr><th>المقاس</th><th>الوزن</th><th>الطول</th></tr>
            <tr><td>S</td><td>55-65 كجم</td><td>160-170</td></tr>
            <tr><td>M</td><td>65-75 كجم</td><td>170-178</td></tr>
            <tr><td>L</td><td>75-85 كجم</td><td>175-185</td></tr>
            <tr><td>XL</td><td>85-95 كجم</td><td>180-190</td></tr>
          </table>
          <button class="btn btn-dark btn-big" data-buy="${p.id}">اطلب الآن — ادفع عند الاستلام</button>
          <button class="btn btn-outline" data-add="${p.id}">أضف للسلة</button>
          <div class="pm-meta">
            <span>🚚 يوصلك خلال ${S.shipping.days}</span>
            <span>🔁 تبديل واسترجاع مجاني خلال 14 يوم</span>
            ${p.stock <= 5 ? `<span style="color:var(--accent);font-weight:700">🔥 باقي ${p.stock} قطع بس</span>` : ""}
          </div>
        </div>
      </div>`;
    $("#sgToggle").onclick = () => $("#sg").classList.toggle("on");
    open("#productModal");
  }

  /* ---------- cart ---------- */
  function addToCart(p, silent) {
    const size = sizeFor(p);
    const line = cart.find(l => l.id === p.id && l.size === size);
    line ? line.qty++ : cart.push({ id: p.id, size, qty: 1 });
    saveCart();
    const c = $("#cartCount"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
    if (!silent) { renderCart(); open("#cartDrawer"); }
  }
  const subtotal = items => items.reduce((s, l) => s + byId(l.id).price * l.qty, 0);

  function shipBar(sub) {
    const left = S.shipping.freeOver - sub, pct = Math.min(100, sub / S.shipping.freeOver * 100);
    return (left > 0 ? `فاضلك <b>${money(left)}</b> وتاخد <b>شحن مجاني</b> 🚚` : `🎉 مبروك! الشحن عليك مجاني`) + `<div class="bar"><i style="width:${pct}%"></i></div>`;
  }

  function renderCart() {
    const count = cart.reduce((s, l) => s + l.qty, 0);
    $("#cartCount").textContent = count;
    const sub = subtotal(cart);
    $("#shipBar").innerHTML = shipBar(sub);
    $("#cartTotal").textContent = money(sub);
    $("#checkoutFromCart").disabled = !cart.length;
    $("#cartItems").innerHTML = cart.length ? cart.map((l, i) => {
      const p = byId(l.id);
      return `<div class="ci"><div class="ci-img">${art(p)}</div>
        <div><h4>${p.name}</h4><small>مقاس ${l.size}</small>
          <div class="qty"><button data-q="${i}" data-d="-1">−</button><b>${l.qty}</b><button data-q="${i}" data-d="1">+</button></div></div>
        <div style="text-align:left"><b>${money(p.price * l.qty)}</b><br><button class="rm" data-rm="${i}">حذف</button></div></div>`;
    }).join("") : `<div class="empty">السلة فاضية<br><br><button class="btn btn-dark" data-close>ابدأ التسوق</button></div>`;

    // upsell: منتج من فئة مختلفة مش في السلة
    const inCart = new Set(cart.map(l => l.id)), cats = new Set(cart.map(l => byId(l.id).category));
    const pick = cart.length && (S.products.find(p => !inCart.has(p.id) && !cats.has(p.category)) || S.products.find(p => !inCart.has(p.id)));
    $("#upsell").innerHTML = pick ? `<div class="upsell-card"><div class="ci-img">${art(pick)}</div>
      <div><small>كمّل اللوك 🔥</small><b>${pick.name}</b>${money(pick.price)}</div>
      <button data-up="${pick.id}">أضف</button></div>` : "";
  }
  $("#cartDrawer").addEventListener("click", e => {
    const q = e.target.closest("[data-q]"), rm = e.target.closest("[data-rm]"), up = e.target.closest("[data-up]");
    if (q) { const l = cart[q.dataset.q]; l.qty += +q.dataset.d; if (l.qty < 1) cart.splice(q.dataset.q, 1); saveCart(); }
    if (rm) { cart.splice(rm.dataset.rm, 1); saveCart(); }
    if (up) { addToCart(byId(up.dataset.up), true); renderCart(); toast("اتضاف للسلة ✓"); }
  });
  $("#cartBtn").onclick = () => { renderCart(); open("#cartDrawer"); };
  $("#checkoutFromCart").onclick = () => startCheckout(cart.map(l => ({ ...l })), "cart");

  /* ---------- checkout (2 clicks) ---------- */
  function buyNow(p) { startCheckout([{ id: p.id, size: sizeFor(p), qty: 1 }], "now"); }

  let mode = "now";
  function startCheckout(items, m) {
    checkoutItems = items; mode = m;
    const saved = store.get("egoir_customer", null);
    if (saved) { $("#fName").value = saved.name; $("#fPhone").value = saved.phone; $("#fCity").value = saved.city; $("#fAddress").value = saved.address; }
    if (!coupon && sessionStorage.getItem("egoir_coupon")) { coupon = sessionStorage.getItem("egoir_coupon"); $("#fCoupon").value = coupon; }
    renderCheckout();
    open("#checkout");
    if (!saved) setTimeout(() => $("#fName").focus({ preventScroll: true }), 350);
  }

  function calc(items) {
    const sub = subtotal(items);
    const disc = coupon === S.offer.code && sub >= S.offer.minTotal && Date.now() < end ? sub * S.offer.percent / 100 : 0;
    const ship = sub >= S.shipping.freeOver ? 0 : S.shipping.cost;
    return { sub, disc, ship, total: sub - disc + ship };
  }

  function renderCheckout() {
    const items = checkoutItems;
    $("#coSummary").innerHTML = items.map((l, i) => {
      const p = byId(l.id);
      return `<div class="co-line"><div class="ci-img">${art(p)}</div><span>${p.name}<br><small>مقاس ${l.size} × ${l.qty}</small></span><b>${money(p.price * l.qty)}</b></div>`;
    }).join("");
    const t = calc(items);
    const left = S.shipping.freeOver - t.sub;
    $("#coTotals").innerHTML = `
      <div><span>المنتجات</span><span>${money(t.sub)}</span></div>
      ${t.disc ? `<div class="disc"><span>خصم (${coupon})</span><span>− ${money(t.disc)}</span></div>` : ""}
      <div><span>الشحن</span><span>${t.ship ? money(t.ship) : "مجاني 🎉"}</span></div>
      ${left > 0 && mode === "now" ? `<div style="color:var(--muted);font-size:12px">زوّد ${money(left)} وخد شحن مجاني</div>` : ""}
      <div class="grand"><span>الإجمالي</span><span>${money(t.total)}</span></div>`;
    $("#placeOrder").textContent = `تأكيد الطلب • ${money(t.total)}`;
  }

  $("#applyCoupon").onclick = () => {
    const v = $("#fCoupon").value.trim().toUpperCase();
    if (v !== S.offer.code) { coupon = null; toast("الكود ده مش صحيح"); }
    else if (subtotal(checkoutItems) < S.offer.minTotal) { coupon = v; toast(`الكود بيشتغل على الأوردرات فوق ${money(S.offer.minTotal)}`); }
    else { coupon = v; sessionStorage.setItem("egoir_coupon", v); toast("تم تطبيق الخصم ✓"); }
    renderCheckout();
  };

  $("#coForm").addEventListener("submit", e => {                                // ← الضغطة التانية
    e.preventDefault();
    const f = e.target;
    let ok = true;
    ["name", "phone", "city", "address"].forEach(n => {
      const el = f.elements[n], valid = el.checkValidity() && el.value.trim().length > 1;
      el.closest(".field").classList.toggle("err", !valid);
      if (!valid && ok) { el.focus(); ok = false; }
    });
    if (!ok) { toast(f.elements.phone.validity.patternMismatch ? "اكتب رقم موبايل مصري صحيح (11 رقم)" : "كمّل بياناتك"); return; }

    const customer = { name: f.name.value.trim(), phone: f.phone.value.trim(), city: f.city.value, address: f.address.value.trim() };
    store.set("egoir_customer", customer);
    const t = calc(checkoutItems);
    const order = {
      id: "EG" + Date.now().toString().slice(-6),
      date: new Date().toISOString(),
      customer, payment: f.pay.value, coupon: t.disc ? coupon : "",
      items: checkoutItems.map(l => ({ name: byId(l.id).name, size: l.size, qty: l.qty, price: byId(l.id).price })),
      subtotal: t.sub, discount: t.disc, shipping: t.ship, total: t.total
    };

    const msg = [
      `🛍️ *طلب جديد ${order.id}*`, "",
      ...order.items.map(i => `• ${i.name} — مقاس ${i.size} × ${i.qty} = ${money(i.price * i.qty)}`), "",
      order.discount ? `خصم: −${money(order.discount)}` : "",
      `الشحن: ${order.shipping ? money(order.shipping) : "مجاني"}`,
      `*الإجمالي: ${money(order.total)}*`, `الدفع: ${order.payment}`, "",
      `👤 ${customer.name}`, `📞 ${customer.phone}`, `📍 ${customer.city} — ${customer.address}`
    ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
    const waUrl = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;

    if (S.orderEndpoint) {
      fetch(S.orderEndpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(order), keepalive: true }).catch(() => {});
    } else {
      window.open(waUrl, "_blank", "noopener");
    }

    const orders = store.get("egoir_orders", []); orders.push(order); store.set("egoir_orders", orders);
    if (mode === "cart") { cart = []; saveCart(); }
    coupon = null; sessionStorage.removeItem("egoir_coupon"); $("#fCoupon").value = "";
    if (typeof window.fbq === "function") window.fbq("track", "Purchase", { value: order.total, currency: "EGP" });
    if (typeof window.gtag === "function") window.gtag("event", "purchase", { transaction_id: order.id, value: order.total, currency: "EGP" });

    $("#successModal").innerHTML = `
      <div class="check">✓</div>
      <h3>طلبك اتأكد يا ${customer.name.split(" ")[0]}! 🎉</h3>
      <p>رقم الطلب <b>${order.id}</b><br>هنكلمك على ${customer.phone} لتأكيد الشحن.<br>الإجمالي ${money(order.total)} — ${order.payment}</p>
      <a class="btn btn-outline btn-block" href="${waUrl}" target="_blank" rel="noopener">تابع طلبك على واتساب</a>
      <button class="btn btn-dark btn-block" data-close>كمّل تسوق</button>`;
    open("#successModal");
  });
  $("#coForm").addEventListener("input", e => e.target.closest(".field")?.classList.remove("err"));

  /* ---------- social proof popups ---------- */
  const NAMES = ["محمد", "مريم", "عمر", "نور", "كريم", "هنا", "مصطفى", "سلمى", "زياد", "فرح"];
  function proof() {
    const p = S.products[Math.floor(Math.random() * S.products.length)];
    const n = NAMES[Math.floor(Math.random() * NAMES.length)], g = GOVS[Math.floor(Math.random() * 8)];
    const el = $("#proofToast");
    el.innerHTML = `<div class="ci-img">${art(p)}</div><div><b>${n} من ${g}</b> اشترى<br><span dir="ltr">${p.name}</span><small>من ${2 + Math.floor(Math.random() * 40)} دقيقة</small></div>`;
    el.classList.add("on"); setTimeout(() => el.classList.remove("on"), 5000);
  }
  if (S.socialProof) setTimeout(() => { proof(); setInterval(proof, 22000); }, 9000);

  renderFilters(); renderGrid(); renderCart();
})();

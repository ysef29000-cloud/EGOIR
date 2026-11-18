(() => {
  "use strict";
  const EG = window.EG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = EG.root || "/";

  /* ---------- money ---------- */
  function money(cents) {
    const fmt = EG.moneyFormat || "{{amount}}";
    const n = cents / 100;
    const group = (x, d, sep, dec) => {
      const [i, f] = x.toFixed(d).split(".");
      return i.replace(/\B(?=(\d{3})+(?!\d))/g, sep) + (f ? dec + f : "");
    };
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, (_, k) => {
      if (k === "amount_no_decimals") return group(n, 0, ",", ".");
      if (k === "amount_with_comma_separator") return group(n, 2, ".", ",");
      if (k === "amount_no_decimals_with_comma_separator") return group(n, 0, ".", ",");
      if (k === "amount_with_apostrophe_separator") return group(n, 2, "'", ".");
      return group(n, 2, ",", ".");
    });
  }

  /* ---------- toast ---------- */
  let tt;
  function toast(msg) {
    const t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("on");
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2200);
  }

  /* ---------- promo: copy code + real countdown ---------- */
  $$("[data-copy]").forEach(b => b.addEventListener("click", () => {
    navigator.clipboard?.writeText(b.dataset.copy); toast("تم نسخ الكود ✓");
  }));
  $$("[data-ends]").forEach(el => {
    const end = new Date(el.dataset.ends).getTime();
    if (!end || isNaN(end)) return;
    const tick = () => {
      const ms = end - Date.now();
      if (ms <= 0) { el.hidden = true; return false; }
      const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
      el.textContent = (d ? d + "ي " : "") + [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
      el.hidden = false; return true;
    };
    if (tick()) { const iv = setInterval(() => { if (!tick()) clearInterval(iv); }, 1000); }
  });

  /* ---------- category filter ---------- */
  $$("[data-filters]").forEach(bar => bar.addEventListener("click", e => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    $$(".chip", bar).forEach(c => c.classList.toggle("on", c === b));
    const grid = bar.closest("section").querySelector(".grid");
    $$("[data-product]", grid).forEach(card => { card.hidden = b.dataset.cat && card.dataset.type !== b.dataset.cat; });
  }));

  /* ---------- variant selection (cards + product page) ---------- */
  function variantsOf(scope) {
    if (!scope._variants) {
      const el = $("[data-variants]", scope);
      try { scope._variants = el ? JSON.parse(el.textContent) : []; } catch { scope._variants = []; }
    }
    return scope._variants;
  }
  function selected(scope) {
    const sel = [];
    $$(".sizes", scope).forEach((g, i) => {
      const on = $(".size.on", g); sel[i] = on ? on.dataset.value : null;
    });
    return sel;
  }
  function findVariant(scope, sel) {
    const vs = variantsOf(scope);
    const match = v => sel.every((val, i) => val == null || v.options[i] === val);
    return vs.find(v => match(v) && v.available) || vs.find(match);
  }
  function applyVariant(scope, v) {
    if (!v) return;
    const off = !v.available;
    $$("[data-buy]", scope).forEach(a => { a.href = `${root}cart/${v.id}:1`; a.classList.toggle("is-off", off); });
    $$("[data-add]", scope).forEach(b => { b.dataset.id = v.id; b.disabled = off; });
    const hid = $("[data-variant-id]", scope); if (hid) hid.value = v.id;
    $$("[data-price]", scope).forEach(p => {
      $("[data-price-now]", p).textContent = money(v.price);
      const old = $("[data-price-old]", p), save = $("[data-price-save]", p);
      const has = v.compare > v.price;
      if (old) { old.hidden = !has; if (has) old.textContent = money(v.compare); }
      if (save) { save.hidden = !has; if (has) save.textContent = `وفّر ${Math.round((1 - v.price / v.compare) * 100)}%`; }
    });
    const st = $("[data-stock]", scope), low = parseInt(st?.dataset.low || "5", 10);
    if (st) {
      const show = v.qty != null && v.qty > 0 && v.qty <= (window.EG.lowStock || low);
      st.hidden = !show; if (show) $("[data-stock-qty]", st).textContent = v.qty;
    }
    const so = $("[data-soldout]", scope); if (so) so.hidden = !off;
    if (scope.matches("[data-pdp]")) {
      const url = new URL(location.href); url.searchParams.set("variant", v.id);
      history.replaceState(null, "", url);
    }
  }
  document.addEventListener("click", e => {
    const b = e.target.closest(".size[data-value]"); if (!b || b.disabled) return;
    const scope = b.closest("[data-product]"); if (!scope) return;
    $$(".size", b.parentElement).forEach(x => x.classList.toggle("on", x === b));
    const lbl = $(`[data-opt-label="${b.dataset.opt}"]`, scope); if (lbl) lbl.textContent = b.dataset.value;
    applyVariant(scope, findVariant(scope, selected(scope)));
  });

  /* ---------- cart drawer ---------- */
  const drawer = $("#cart-drawer"), overlay = $("[data-overlay]");
  const openDrawer = () => { drawer.classList.add("on"); drawer.setAttribute("aria-hidden", "false"); overlay.classList.add("on"); document.body.classList.add("lock"); };
  const closeDrawer = () => { drawer.classList.remove("on"); drawer.setAttribute("aria-hidden", "true"); overlay.classList.remove("on"); document.body.classList.remove("lock"); };
  overlay?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
  drawer?.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeDrawer(); });
  $$("[data-open-cart]").forEach(a => a.addEventListener("click", async e => { e.preventDefault(); await renderCart(); openDrawer(); }));

  const api = (path, body) => fetch(root + path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined
  }).then(async r => { const j = await r.json(); if (!r.ok) throw j; return j; });

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const img = (src, w) => src ? `<img src="${src}${src.includes("?") ? "&" : "?"}width=${w}" alt="" loading="lazy">` : "";

  async function renderCart() {
    if (!drawer) return;
    const cart = await api("cart.js");
    $$("[data-cart-count]").forEach(c => { c.textContent = cart.item_count; c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); });
    $("[data-cart-total]", drawer).innerHTML = money(cart.total_price);

    const bar = $("[data-ship-bar]", drawer);
    if (EG.freeShip > 0 && cart.item_count) {
      const left = EG.freeShip - cart.total_price, pct = Math.min(100, cart.total_price / EG.freeShip * 100);
      bar.innerHTML = (left > 0 ? `فاضلك <b>${money(left)}</b> وتاخد <b>شحن مجاني</b> 🚚` : `🎉 مبروك! الشحن عليك مجاني`) + `<div class="bar"><i style="width:${pct}%"></i></div>`;
    } else bar.innerHTML = "";

    const items = $("[data-cart-items]", drawer);
    items.innerHTML = cart.items.length ? cart.items.map(it => `
      <div class="ci" data-key="${esc(it.key)}">
        <div class="ci-img">${img(it.image, 160)}</div>
        <div><h4>${esc(it.product_title)}</h4>${it.product_has_only_default_variant ? "" : `<small>${esc(it.variant_title)}</small>`}
          <div class="qty"><button type="button" data-q="-1" aria-label="أقل">−</button><b>${it.quantity}</b><button type="button" data-q="1" aria-label="أكتر">+</button></div></div>
        <div class="end"><b>${money(it.final_line_price)}</b><br><button type="button" class="rm" data-rm>حذف</button></div>
      </div>`).join("") : `<div class="empty">السلة فاضية<br><br><button type="button" class="btn btn-dark" data-close>ابدأ التسوق</button></div>`;

    const co = $("[data-checkout]", drawer);
    co.classList.toggle("is-off", !cart.item_count);
    co.href = root + "checkout" + (EG.offerCode && cart.total_price >= EG.offerMin ? `?discount=${encodeURIComponent(EG.offerCode)}` : "");

    renderUpsell(cart);
    return cart;
  }

  async function renderUpsell(cart) {
    const box = $("[data-upsell]", drawer); box.innerHTML = "";
    if (!cart.items.length) return;
    try {
      const inCart = new Set(cart.items.map(i => i.product_id));
      const r = await api(`recommendations/products.json?product_id=${cart.items[0].product_id}&limit=6`);
      const p = (r.products || []).find(x => !inCart.has(x.id) && x.available);
      if (!p) return;
      const v = p.variants.find(x => x.available);
      box.innerHTML = `<div class="upsell-card"><div class="ci-img">${img(p.featured_image, 120)}</div>
        <div><small>كمّل اللوك 🔥</small><b>${esc(p.title)}</b>${money(p.price)}</div>
        <button type="button" data-up="${v.id}">أضف</button></div>`;
    } catch { /* recommendations not available yet */ }
  }

  drawer?.addEventListener("click", async e => {
    const row = e.target.closest("[data-key]"), q = e.target.closest("[data-q]"), rm = e.target.closest("[data-rm]"), up = e.target.closest("[data-up]");
    try {
      if (row && (q || rm)) {
        const cur = parseInt($(".qty b", row).textContent, 10);
        row.classList.add("loading");
        await api("cart/change.js", { id: row.dataset.key, quantity: rm ? 0 : Math.max(0, cur + parseInt(q.dataset.q, 10)) });
        await renderCart();
      }
      if (up) { up.disabled = true; await api("cart/add.js", { items: [{ id: +up.dataset.up, quantity: 1 }] }); await renderCart(); toast("اتضاف للسلة ✓"); }
    } catch (err) { toast(err?.description || "حصل خطأ، جرّب تاني"); renderCart(); }
  });

  /* ---------- add to cart (AJAX) ---------- */
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-add]"); if (!b || b.disabled || !drawer) return;
    e.preventDefault();
    const scope = b.closest("[data-product]");
    const id = +(b.dataset.id || $("[data-variant-id]", scope)?.value);
    if (!id) return;
    b.classList.add("loading");
    try {
      await api("cart/add.js", { items: [{ id, quantity: 1 }] });
      await renderCart(); openDrawer();
    } catch (err) { toast(err?.description || "المقاس ده مش متاح"); }
    b.classList.remove("loading");
  });

  /* ---------- sticky buy bar on mobile product page ---------- */
  const pdp = $("[data-pdp]"), sticky = $(".sticky-buy");
  const mainBuy = pdp && $(".pdp-form [data-buy]", pdp);
  if (sticky && mainBuy && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => sticky.classList.toggle("on", !en.isIntersecting && en.boundingClientRect.top < 0)).observe(mainBuy);
  }
})();

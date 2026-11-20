(() => {
  "use strict";
  const EG = window.EG || {};
  const root = EG.root || "/";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  // elements that belong to this product scope (not to a nested one, e.g. the set box inside the product page)
  const own = (scope, sel) => $$(sel, scope).filter(el => el.closest("[data-product]") === scope);
  const own1 = (scope, sel) => own(scope, sel)[0];

  /* ---------- money ---------- */
  function money(cents) {
    const n = cents / 100;
    const group = (x, d, sep, dec) => {
      const [i, f] = x.toFixed(d).split(".");
      return i.replace(/\B(?=(\d{3})+(?!\d))/g, sep) + (f ? dec + f : "");
    };
    return (EG.moneyFormat || "{{amount}}").replace(/\{\{\s*(\w+)\s*\}\}/, (_, k) => {
      if (k === "amount_no_decimals") return group(n, 0, ",", ".");
      if (k === "amount_with_comma_separator") return group(n, 2, ".", ",");
      if (k === "amount_no_decimals_with_comma_separator") return group(n, 0, ".", ",");
      if (k === "amount_with_apostrophe_separator") return group(n, 2, "'", ".");
      return group(n, 2, ",", ".");
    });
  }
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sized = (src, w) => {
    if (!src || src.startsWith("data:")) return src || "";
    return /[?&]width=\d+/.test(src) ? src.replace(/([?&])width=\d+/, "$1width=" + w) : src + (src.includes("?") ? "&" : "?") + "width=" + w;
  };

  let tt;
  function toast(msg) {
    const t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("on");
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2400);
  }

  /* ---------- mobile menu ---------- */
  const menuBtn = $("[data-menu-toggle]"), nav = $("[data-nav]");
  menuBtn?.addEventListener("click", () => {
    const hdr = $("[data-header]");
    document.documentElement.style.setProperty("--hdr", hdr.getBoundingClientRect().bottom + "px");
    const on = nav.classList.toggle("on");
    menuBtn.setAttribute("aria-expanded", on);
    document.body.classList.toggle("lock", on);
  });

  /* ---------- product scopes (product page, set items) ---------- */
  function variants(scope) {
    if (!scope._vs) {
      const el = own1(scope, "script[data-variants]");
      try { scope._vs = el ? JSON.parse(el.textContent) : []; } catch { scope._vs = []; }
    }
    return scope._vs;
  }
  const groups = scope => own(scope, ".opt[data-group]");
  function selection(scope) {
    return groups(scope).map(g => { const on = $(".on[data-value]", g); return on ? on.dataset.value : null; });
  }
  function current(scope) {
    const vs = variants(scope), sel = selection(scope);
    if (!sel.length) return vs[0];
    return vs.find(v => sel.every((val, i) => v.options[i] === val)) || null;
  }
  function markAvailability(scope) {
    const vs = variants(scope), sel = selection(scope);
    groups(scope).forEach((g, gi) => {
      $$("[data-value]", g).forEach(b => {
        const test = sel.slice(); test[gi] = b.dataset.value;
        const ok = vs.some(v => v.available && test.every((val, i) => val == null || v.options[i] === val));
        b.classList.toggle("na", !ok);
      });
    });
  }

  function update(scope) {
    markAvailability(scope);
    const v = current(scope);
    scope._v = v;
    const off = !v || !v.available;
    groups(scope).forEach(g => { const l = $("[data-opt-label]", g), on = $(".on", g); if (l && on) l.textContent = on.dataset.value; });
    if (v) {
      own(scope, "[data-buy]").forEach(a => { a.href = `${root}cart/${v.id}:1`; });
      own(scope, "[data-add]").forEach(b => { b.dataset.id = v.id; });
      const hid = own1(scope, "[data-variant-id]"); if (hid) hid.value = v.id;
      own(scope, "[data-price]").forEach(p => {
        $("[data-price-now]", p).textContent = money(v.price);
        const old = $("[data-price-old]", p), save = $("[data-price-save]", p), has = v.compare > v.price;
        if (old) { old.hidden = !has; if (has) old.textContent = money(v.compare); }
        if (save) save.hidden = !has;
      });
      const st = own1(scope, "[data-stock]");
      if (st) { const show = EG.lowStock > 0 && v.qty != null && v.qty > 0 && v.qty <= EG.lowStock; st.hidden = !show; if (show) $("[data-stock-qty]", st).textContent = v.qty; }
      // image for this colour
      const vimg = own1(scope, "[data-variant-img]");
      if (vimg && v.img) {
        const next = sized(v.img, 500);
        if (vimg.getAttribute("src") !== next) {
          vimg.classList.add("is-swapping");
          setTimeout(() => {
            vimg.onload = () => vimg.classList.remove("is-swapping");
            vimg.src = next; vimg.removeAttribute("srcset");
          }, 200);
        }
      }
      const gal = own1(scope, "[data-gallery]");
      if (gal && v.media && scope._lastMedia !== v.media) {
        const item = $(`[data-media-id="${v.media}"]`, gal);
        if (item && scope._lastMedia !== undefined) {
          gal.classList.add("is-swapping");
          setTimeout(() => { gal.prepend(item); gal.scrollTo({ left: 0 }); gal.classList.remove("is-swapping"); }, 250);
        }
        scope._lastMedia = v.media;
      }
      const sv = own1(scope, "[data-sticky-variant]"); if (sv) sv.textContent = v.options.join(" / ");
      if (scope.matches("[data-pdp]") && scope._ready) {
        const url = new URL(location.href); url.searchParams.set("variant", v.id); history.replaceState(null, "", url);
      }
    }
    own(scope, "[data-buy]").forEach(a => a.classList.toggle("is-off", off));
    own(scope, "[data-add]").forEach(b => { b.disabled = off; });
    const so = own1(scope, "[data-soldout]"); if (so) so.hidden = !off;
    scope._ready = true;
    // refresh any set box this scope belongs to
    const box = scope.closest("[data-set]") || $("[data-set]", scope);
    if (box) updateSet(box);
  }

  document.addEventListener("click", e => {
    const b = e.target.closest(".opt [data-value]"); if (!b) return;
    const scope = b.closest("[data-product]"); if (!scope) return;
    $$("[data-value]", b.parentElement).forEach(x => x.classList.toggle("on", x === b));
    update(scope);
  });

  /* ---------- the set (hoodie + pants) ---------- */
  function setScopes(box) {
    const items = $$("[data-product]", box);
    if (items.length < 2) { const host = box.closest("[data-product]"); if (host) items.unshift(host); }
    return items;
  }
  function updateSet(box) {
    const scopes = setScopes(box);
    const vs = scopes.map(s => s._v);
    const ok = vs.length === 2 && vs.every(v => v && v.available);
    const sum = vs.reduce((t, v) => t + (v ? v.price : 0), 0);
    const pct = EG.setPct || 0;
    const now = Math.round(sum * (100 - pct) / 100);
    const p = $("[data-set-price]", box), o = $("[data-set-old]", box);
    if (p) p.textContent = money(now);
    if (o) { o.textContent = pct ? money(sum) : ""; }
    const buy = $("[data-set-buy]", box), add = $("[data-set-add]", box);
    if (buy) { buy.classList.toggle("is-off", !ok); if (ok) buy.href = `${root}cart/${vs.map(v => v.id + ":1").join(",")}`; }
    if (add) add.disabled = !ok;
  }
  document.addEventListener("click", async e => {
    const add = e.target.closest("[data-set-add]"); if (!add) return;
    const box = add.closest("[data-set]");
    const vs = setScopes(box).map(s => s._v);
    if (vs.some(v => !v || !v.available)) return;
    add.classList.add("loading");
    try {
      await api("cart/add.js", { items: vs.map(v => ({ id: v.id, quantity: 1 })) });
      await renderCart(); openDrawer();
    } catch (err) { toast(err?.description || "Couldn't add the set"); }
    add.classList.remove("loading");
  });

  /* ---------- card colour dots ---------- */
  document.addEventListener("mouseover", e => {
    const d = e.target.closest(".dot[data-swap]"); if (!d) return;
    const img = $("[data-card-img]", d.closest("[data-card]"));
    if (img && img.dataset.swapped !== d.dataset.swap) { img.src = d.dataset.swap; img.removeAttribute("srcset"); img.dataset.swapped = d.dataset.swap; }
  });

  /* ---------- gallery dots (mobile) ---------- */
  $$("[data-gallery]").forEach(g => {
    const dots = $$("[data-gallery-dots] i", g.parentElement);
    if (!dots.length) return;
    const mark = () => { const i = Math.round(g.scrollLeft / g.clientWidth); dots.forEach((d, j) => d.classList.toggle("on", j === Math.abs(i))); };
    g.addEventListener("scroll", () => requestAnimationFrame(mark), { passive: true }); mark();
  });

  /* ---------- sticky buy bar ---------- */
  const sticky = $("[data-sticky]"), mainBuy = $(".pdp-form [data-buy]");
  if (sticky && mainBuy && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => sticky.classList.toggle("on", !en.isIntersecting && en.boundingClientRect.top < 0)).observe(mainBuy);
  }

  /* ---------- cart ---------- */
  const drawer = $("#cart-drawer"), overlay = $("[data-overlay]");
  function openDrawer() { if (!drawer) return; drawer.classList.add("on"); drawer.setAttribute("aria-hidden", "false"); overlay.classList.add("on"); document.body.classList.add("lock"); }
  function closeDrawer() { if (!drawer) return; drawer.classList.remove("on"); drawer.setAttribute("aria-hidden", "true"); overlay.classList.remove("on"); document.body.classList.remove("lock"); }
  overlay?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
  drawer?.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeDrawer(); });
  $$("[data-open-cart]").forEach(a => a.addEventListener("click", async e => { e.preventDefault(); await renderCart(); openDrawer(); }));

  function api(path, body) {
    return fetch(root + path, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: body ? JSON.stringify(body) : undefined
    }).then(async r => { const j = await r.json(); if (!r.ok) throw j; return j; });
  }

  function setNudge(cart) {
    const [A, B] = EG.setProducts || [];
    if (!A || !B || !EG.setPct) return "";
    const count = id => cart.items.filter(i => i.product_id === id).reduce((t, i) => t + i.quantity, 0);
    const a = count(A.id), b = count(B.id);
    if (a === b) return "";
    const need = a > b ? B : A, have = a > b ? A : B;
    const from = Math.min(...need.variants.filter(v => v.available).map(v => v.price).concat([Infinity]));
    if (!isFinite(from)) return "";
    return `<div class="nudge">
      <a class="ci-img" href="${esc(need.url)}">${need.image ? `<img src="${esc(need.image)}" alt="" loading="lazy">` : ""}</a>
      <div><b>Make it a set</b>Add the ${esc(need.title)}. ${EG.setPct}% off both.</div>
      <a href="${esc(need.url)}">Add</a>
    </div>`;
  }

  async function renderCart() {
    const cart = await api("cart.js");
    $$("[data-cart-count]").forEach(c => { c.textContent = cart.item_count; c.hidden = !cart.item_count; c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); });
    if (!drawer) return cart;
    $("[data-cart-count-inline]", drawer).textContent = cart.item_count ? `(${cart.item_count})` : "";
    $("[data-cart-total]", drawer).textContent = money(cart.total_price);

    const bar = $("[data-ship-bar]", drawer);
    if (EG.freeShip > 0 && cart.item_count) {
      const left = EG.freeShip - cart.total_price, pct = Math.min(100, cart.total_price / EG.freeShip * 100);
      bar.innerHTML = (left > 0 ? `You're <b>${money(left)}</b> away from free shipping` : `You've got free shipping`) + `<div class="bar"><i style="width:${pct}%"></i></div>`;
    } else bar.innerHTML = "";

    $("[data-cart-items]", drawer).innerHTML = cart.items.length ? cart.items.map(it => `
      <div class="ci" data-key="${esc(it.key)}">
        <a class="ci-img" href="${esc(it.url)}">${it.image ? `<img src="${esc(sized(it.image, 240))}" alt="" loading="lazy">` : ""}</a>
        <div><a class="ci-title" href="${esc(it.url)}">${esc(it.product_title)}</a>${it.product_has_only_default_variant ? "" : `<small>${esc(it.variant_title)}</small>`}
          ${(it.line_level_discount_allocations || []).map(d => `<small class="disc">${esc(d.discount_application.title)}</small>`).join("")}
          <div class="qty"><button type="button" data-q="-1" aria-label="Decrease">−</button><b>${it.quantity}</b><button type="button" data-q="1" aria-label="Increase">+</button></div></div>
        <div class="end">${money(it.final_line_price)}${it.original_line_price > it.final_line_price ? `<br><s>${money(it.original_line_price)}</s>` : ""}<br><button type="button" class="rm" data-rm>Remove</button></div>
      </div>`).join("") : `<div class="empty">Your bag is empty. Fix that.<br><br><button type="button" class="btn btn-dark" data-close>Shop the drop</button></div>`;

    $("[data-set-nudge]", drawer).innerHTML = setNudge(cart);
    const saving = $("[data-set-saving]", drawer);
    saving.hidden = !(cart.total_discount > 0);
    if (cart.total_discount > 0) saving.textContent = `You're saving ${money(cart.total_discount)}`;
    $("[data-checkout]", drawer).classList.toggle("is-off", !cart.item_count);
    return cart;
  }

  drawer?.addEventListener("click", async e => {
    const row = e.target.closest("[data-key]"), q = e.target.closest("[data-q]"), rm = e.target.closest("[data-rm]");
    if (!row || !(q || rm)) return;
    const cur = parseInt($(".qty b", row).textContent, 10);
    row.classList.add("loading");
    try { await api("cart/change.js", { id: row.dataset.key, quantity: rm ? 0 : Math.max(0, cur + parseInt(q.dataset.q, 10)) }); }
    catch (err) { toast(err?.description || "Something went wrong"); }
    renderCart();
  });

  // single "Add to bag"
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-add]"); if (!b || b.disabled || !drawer) return;
    e.preventDefault();
    const scope = b.closest("[data-product]");
    const id = +(b.dataset.id || own1(scope, "[data-variant-id]")?.value);
    if (!id) return;
    b.classList.add("loading");
    try { await api("cart/add.js", { items: [{ id, quantity: 1 }] }); await renderCart(); openDrawer(); }
    catch (err) { toast(err?.description || "This option is sold out"); }
    b.classList.remove("loading");
  });

  /* ---------- smooth reveal on scroll ---------- */
  const REVEAL = [
    ".section-title", ".card", ".the-set-media", ".the-set-body", ".split-media", ".split-body",
    ".insta-grid > *", ".faq .acc", ".features > div", ".pdp-body", ".gallery-item",
    ".news-form", ".footer-cols", ".page-wrap > *"
  ].join(",");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    const groups = new Map();
    $$(REVEAL).forEach(el => {
      // stagger siblings in the same row (cards, insta photos, faq rows)
      const p = el.parentElement, i = groups.get(p) || 0; groups.set(p, i + 1);
      el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
      el.setAttribute("data-reveal", "");
      io.observe(el);
    });
  }

  /* ---------- init ---------- */
  $$("[data-product]").forEach(update);
  $$("[data-set]").forEach(updateSet);
})();

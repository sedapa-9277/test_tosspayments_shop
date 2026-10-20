/* =========================================================
   공통: 헤더/푸터, 장바구니 저장소, 상품 일러스트, 카드 렌더링
   ========================================================= */

/* ---------- 포맷 ---------- */
const won = (n) => Number(n).toLocaleString("ko-KR");

/* ---------- 장바구니 (localStorage) ---------- */
const Cart = {
  KEY: "aperture_cart",
  read() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; }
  },
  write(items) {
    try { localStorage.setItem(this.KEY, JSON.stringify(items)); } catch (e) {}
    updateCartBadge();
  },
  add(id, qty = 1) {
    const items = this.read();
    const found = items.find((i) => i.id === id);
    if (found) found.qty = Math.min(99, found.qty + qty);
    else items.push({ id, qty });
    this.write(items);
  },
  setQty(id, qty) {
    const items = this.read().map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i));
    this.write(items);
  },
  remove(id) { this.write(this.read().filter((i) => i.id !== id)); },
  clear() { this.write([]); },
  /** 상품 정보가 합쳐진 목록 */
  detailed() {
    return this.read()
      .map((i) => ({ ...i, product: findProduct(i.id) }))
      .filter((i) => i.product);
  },
  count() { return this.read().reduce((s, i) => s + i.qty, 0); },
};

/* 바로구매: 장바구니와 별도로 1개 상품만 결제 */
const BuyNow = {
  KEY: "aperture_buynow",
  set(id) { try { sessionStorage.setItem(this.KEY, JSON.stringify([{ id, qty: 1 }])); } catch (e) {} },
  get() { try { return JSON.parse(sessionStorage.getItem(this.KEY)); } catch (e) { return null; } },
  clear() { try { sessionStorage.removeItem(this.KEY); } catch (e) {} },
};

/* ---------- 아이콘 ---------- */
const ICON = {
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  mark: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="#000" stroke-width="3"/><path d="M16 4l4 9M28 16l-9 4M16 28l-4-9M4 16l9-4" stroke="#000" stroke-width="2.4"/></svg>',
};

/* ---------- 헤더 / 푸터 ---------- */
function renderHeader() {
  const page = document.body.dataset.page || "";
  const link = (href, label, key) =>
    `<a href="${href}" class="${page === key ? "active" : ""}">${label}</a>`;

  const html = `
  <div class="util-bar">
    <div class="container">
      <span>전 상품 무료배송 · 정품 2년 보증</span>
      <nav id="authNav"><a href="#">고객센터</a><a href="#">정품등록</a><a href="login.html">로그인/가입</a></nav>
    </div>
  </div>
  <header class="site-header">
    <div class="container">
      <a href="index.html" class="logo" aria-label="APERTURE 홈">
        <span class="logo-mark">${ICON.mark}</span>
        <span class="logo-text">APERTURE</span>
      </a>
      <nav class="gnb" id="gnb">
        ${link("cameras.html", "카메라", "camera")}
        ${link("lenses.html", "렌즈", "lens")}
        ${link("accessories.html", "액세서리", "accessory")}
        ${link("cart.html", "장바구니", "cart")}
      </nav>
      <div class="header-actions">
        <button class="icon-btn" aria-label="검색">${ICON.search}</button>
        <a href="orders.html" class="icon-btn" aria-label="내 주문">${ICON.user}</a>
        <a href="cart.html" class="icon-btn" aria-label="장바구니">${ICON.cart}<span class="cart-count" data-count="0">0</span></a>
        <button class="icon-btn menu-toggle" aria-label="메뉴" aria-expanded="false">${ICON.menu}</button>
      </div>
    </div>
  </header>`;
  document.getElementById("header").outerHTML = html;

  const toggle = document.querySelector(".menu-toggle");
  const gnb = document.getElementById("gnb");
  toggle.addEventListener("click", () => {
    const open = gnb.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
}

function renderFooter() {
  const el = document.getElementById("footer");
  if (!el) return;
  el.outerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div>
          <a href="index.html" class="logo"><span class="logo-mark">${ICON.mark}</span><span class="logo-text">APERTURE</span></a>
          <p>빛을 기록하는 모든 순간을 위해.<br>프로페셔널 카메라 & 렌즈 전문 스토어</p>
        </div>
        <div><h4>SHOP</h4><ul>
          <li><a href="cameras.html">카메라 본체</a></li>
          <li><a href="lenses.html">렌즈</a></li>
          <li><a href="accessories.html">액세서리</a></li>
        </ul></div>
        <div><h4>SUPPORT</h4><ul>
          <li><a href="#">주문·배송 조회</a></li>
          <li><a href="#">교환·반품</a></li>
          <li><a href="#">A/S 센터</a></li>
        </ul></div>
        <div><h4>CONTACT</h4><ul>
          <li>1588-0000</li>
          <li>평일 09:00 - 18:00</li>
          <li>help@aperture.example</li>
        </ul></div>
      </div>
      <div class="footer-bottom">
        <span>상호: (주)어퍼처 · 대표: 홍길동 · 사업자등록번호: 000-00-00000 (예시)</span>
        <span>© 2026 APERTURE. All rights reserved.</span>
      </div>
    </div>
  </footer>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}

function updateCartBadge() {
  const el = document.querySelector(".cart-count");
  if (!el) return;
  const n = Cart.count();
  el.textContent = n > 99 ? "99+" : n;
  el.dataset.count = n;
}

let toastTimer;
function toast(html) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.innerHTML = html;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

/* =========================================================
   상품 일러스트 (SVG) — 이미지 파일 없이 렌더링
   ========================================================= */
let artUid = 0;
function productArt(type) {
  const u = "a" + ++artUid;
  const defs = `
    <defs>
      <linearGradient id="${u}body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a3a3a"/><stop offset=".45" stop-color="#1c1c1c"/><stop offset="1" stop-color="#0b0b0b"/>
      </linearGradient>
      <linearGradient id="${u}barrel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2b2b2b"/><stop offset=".3" stop-color="#4a4a4a"/><stop offset=".55" stop-color="#1e1e1e"/><stop offset="1" stop-color="#090909"/>
      </linearGradient>
      <linearGradient id="${u}silver" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f4f4f4"/><stop offset=".5" stop-color="#bdbdbd"/><stop offset="1" stop-color="#8d8d8d"/>
      </linearGradient>
      <radialGradient id="${u}glass" cx=".38" cy=".35" r=".75">
        <stop offset="0" stop-color="#6f86a8"/><stop offset=".35" stop-color="#25324a"/><stop offset=".7" stop-color="#0b0f18"/><stop offset="1" stop-color="#000"/>
      </radialGradient>
      <radialGradient id="${u}shadow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
  const shadow = (cx = 200, cy = 272, rx = 150) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="12" fill="url(#${u}shadow)"/>`;
  const glass = (cx, cy, r) => `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0a0a0a"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.86}" fill="#151515" stroke="#2c2c2c" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="url(#${u}glass)"/>
    <ellipse cx="${cx - r * 0.25}" cy="${cy - r * 0.28}" rx="${r * 0.22}" ry="${r * 0.12}" fill="#fff" opacity=".35" transform="rotate(-30 ${cx - r * 0.25} ${cy - r * 0.28})"/>
    <circle cx="${cx + r * 0.22}" cy="${cy + r * 0.2}" r="${r * 0.06}" fill="#9fb4d6" opacity=".5"/>`;

  const wrap = (inner) =>
    `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${defs}${inner}</svg>`;

  /* ----- 카메라 본체 (정면) ----- */
  const camera = ({ prism = 44, h = 130, top = 95, grip = true, vgrip = false, retro = false, w = 300, lensR = 52 }) => {
    const x = 200 - w / 2;
    const bodyFill = `url(#${u}body)`;
    const topPlate = retro
      ? `<rect x="${x}" y="${top}" width="${w}" height="34" rx="8" fill="url(#${u}silver)"/>
         <rect x="${x + 22}" y="${top - 16}" width="44" height="18" rx="4" fill="url(#${u}silver)"/>
         <rect x="${x + w - 72}" y="${top - 16}" width="48" height="18" rx="4" fill="url(#${u}silver)"/>
         ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${x + 25 + i * 7}" y="${top - 14}" width="2" height="14" fill="#888"/>`).join("")}
         ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${x + w - 69 + i * 7}" y="${top - 14}" width="2" height="14" fill="#888"/>`).join("")}`
      : "";
    const vg = vgrip ? `<rect x="${x + 8}" y="${top + h - 6}" width="${w - 16}" height="44" rx="12" fill="${bodyFill}"/>
       <rect x="${x + 40}" y="${top + h + 14}" width="40" height="8" rx="3" fill="#2a2a2a"/>` : "";
    return wrap(`
      ${shadow(200, top + h + (vgrip ? 50 : 12), w / 2 + 10)}
      ${vg}
      <path d="M${200 - prism - 20} ${top + 2} L${200 - prism + 6} ${top - prism} H${200 + prism - 6} L${200 + prism + 20} ${top + 2} Z" fill="${retro ? `url(#${u}silver)` : bodyFill}"/>
      <rect x="${200 - 18}" y="${top - prism + 12}" width="36" height="10" rx="2" fill="${retro ? "#555" : "#0a0a0a"}"/>
      <rect x="${x}" y="${top}" width="${w}" height="${h}" rx="18" fill="${bodyFill}"/>
      ${topPlate}
      ${grip ? `<path d="M${x} ${top + 18} Q${x - 4} ${top + h / 2} ${x} ${top + h - 18} L${x + 62} ${top + h - 4} L${x + 62} ${top + 4} Z" fill="#141414"/>
      <rect x="${x + 50}" y="${top + 18}" width="5" height="${h - 40}" rx="2" fill="#ffe100"/>` : ""}
      <rect x="${x + 6}" y="${top - 10}" width="34" height="12" rx="4" fill="#2a2a2a"/>
      <circle cx="${x + w - 30}" cy="${top + 22}" r="7" fill="#c9302c" opacity=".85"/>
      <text x="${x + w - 24}" y="${top + h - 16}" font-family="Arial" font-weight="900" font-size="15" fill="${retro ? "#888" : "#bbb"}" text-anchor="end" letter-spacing="2">APX</text>
      <circle cx="200" cy="${top + h / 2 + 6}" r="${lensR + 14}" fill="#0e0e0e" stroke="#3a3a3a" stroke-width="2"/>
      <circle cx="200" cy="${top + h / 2 + 6}" r="${lensR + 6}" fill="none" stroke="#777" stroke-width="2" opacity=".6"/>
      ${glass(200, top + h / 2 + 6, lensR)}
    `);
  };

  /* ----- 렌즈 (측면) ----- */
  const lens = ({ len = 220, d = 120, frontD, rings = 3, hood = false, collar = false, white = false }) => {
    frontD = frontD || d;
    const x0 = 200 - len / 2, cy = 150;
    const fill = white ? `url(#${u}silver)` : `url(#${u}barrel)`;
    const ringXs = Array.from({ length: rings }, (_, i) => x0 + 40 + (i * (len - 70)) / rings);
    return wrap(`
      ${shadow(200, cy + Math.max(d, frontD) / 2 + 22, len / 2 + 20)}
      <rect x="${x0 - 18}" y="${cy - d / 2 + 14}" width="22" height="${d - 28}" rx="3" fill="url(#${u}silver)"/>
      <rect x="${x0 - 6}" y="${cy - d / 2 + 6}" width="14" height="${d - 12}" fill="#111"/>
      <path d="M${x0} ${cy - d / 2} H${x0 + len - 20} L${x0 + len} ${cy - frontD / 2} V${cy + frontD / 2} L${x0 + len - 20} ${cy + d / 2} H${x0} Z" fill="${fill}"/>
      ${ringXs.map((rx, i) => `
        <rect x="${rx}" y="${cy - d / 2 - 2}" width="${i === 0 ? 46 : 30}" height="${d + 4}" rx="4" fill="#161616"/>
        ${Array.from({ length: i === 0 ? 14 : 9 }, (_, k) => `<rect x="${rx + 3 + k * 3}" y="${cy - d / 2}" width="1.4" height="${d}" fill="#2d2d2d"/>`).join("")}
      `).join("")}
      <rect x="${x0 + len - 60}" y="${cy - d / 2}" width="4" height="${d}" fill="#ffe100"/>
      <text x="${x0 + 18}" y="${cy + 5}" font-family="Arial" font-size="11" font-weight="700" fill="${white ? "#555" : "#9a9a9a"}" letter-spacing="1">AX</text>
      ${collar ? `<rect x="${x0 + len * 0.35}" y="${cy + d / 2 - 4}" width="40" height="34" rx="6" fill="#151515"/><rect x="${x0 + len * 0.35 - 6}" y="${cy + d / 2 + 26}" width="52" height="10" rx="3" fill="#222"/>` : ""}
      ${hood ? `<path d="M${x0 + len} ${cy - frontD / 2} L${x0 + len + 38} ${cy - frontD / 2 - 18} V${cy + frontD / 2 + 18} L${x0 + len} ${cy + frontD / 2} Z" fill="#141414"/>` : ""}
      <ellipse cx="${x0 + len + (hood ? 38 : 0)}" cy="${cy}" rx="${hood ? 14 : 12}" ry="${frontD / 2 + (hood ? 18 : 0)}" fill="#0a0a0a"/>
      <ellipse cx="${x0 + len + (hood ? 38 : 0)}" cy="${cy}" rx="${hood ? 9 : 8}" ry="${frontD / 2 - 8 + (hood ? 18 : 0)}" fill="url(#${u}glass)"/>
    `);
  };

  switch (type) {
    case "camera": return camera({});
    case "camera-pro": return camera({ vgrip: true, top: 80, prism: 50, lensR: 54 });
    case "camera-retro": return camera({ retro: true, grip: false, prism: 38, lensR: 46 });
    case "camera-compact": return camera({ w: 250, h: 110, top: 110, prism: 30, lensR: 40 });
    case "camera-dslr": return camera({ prism: 60, h: 140, top: 100, lensR: 56 });

    case "lens-zoom": return lens({ len: 230, d: 112, rings: 3 });
    case "lens-tele": return lens({ len: 300, d: 110, frontD: 124, rings: 3, collar: true, white: true });
    case "lens-wide": return lens({ len: 170, d: 104, frontD: 120, rings: 2, hood: true });
    case "lens-prime": return lens({ len: 160, d: 120, rings: 1 });
    case "lens-macro": return lens({ len: 200, d: 96, rings: 2 });
    case "lens-pancake": return lens({ len: 100, d: 100, rings: 1 });

    case "battery": return wrap(`${shadow()}
      <rect x="110" y="70" width="180" height="190" rx="14" fill="url(#${u}body)"/>
      <rect x="130" y="54" width="60" height="22" rx="4" fill="#222"/><rect x="140" y="58" width="10" height="12" fill="#c9a33a"/><rect x="160" y="58" width="10" height="12" fill="#c9a33a"/>
      <rect x="110" y="200" width="180" height="10" fill="#ffe100"/>
      <text x="200" y="150" text-anchor="middle" font-family="Arial" font-weight="900" font-size="26" fill="#ddd" letter-spacing="2">LB-15</text>
      <text x="200" y="176" text-anchor="middle" font-family="Arial" font-size="12" fill="#888">Li-ion 7.0V 2280mAh</text>`);
    case "charger": return wrap(`${shadow()}
      <rect x="70" y="130" width="260" height="120" rx="20" fill="url(#${u}body)"/>
      <rect x="100" y="110" width="90" height="70" rx="8" fill="#0d0d0d"/><rect x="210" y="110" width="90" height="70" rx="8" fill="#0d0d0d"/>
      <circle cx="130" cy="220" r="6" fill="#ffe100"/><circle cx="270" cy="220" r="6" fill="#3ccf6e"/>
      <text x="200" y="226" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#888">LC-25</text>`);
    case "card": return wrap(`${shadow(200, 270, 110)}
      <path d="M120 40 H260 L290 70 V260 H120 Z" fill="url(#${u}body)"/>
      <rect x="120" y="190" width="170" height="70" fill="#ffe100"/>
      <text x="205" y="120" text-anchor="middle" font-family="Arial" font-weight="900" font-size="22" fill="#fff">CFexpress</text>
      <text x="205" y="148" text-anchor="middle" font-family="Arial" font-size="13" fill="#999">TYPE B</text>
      <text x="205" y="238" text-anchor="middle" font-family="Arial" font-weight="900" font-size="34" fill="#000">256GB</text>`);
    case "strap": return wrap(`${shadow()}
      <path d="M60 80 C 120 280, 280 280, 340 80" fill="none" stroke="#5a3a22" stroke-width="30" stroke-linecap="round"/>
      <path d="M60 80 C 120 280, 280 280, 340 80" fill="none" stroke="#7a5233" stroke-width="22" stroke-linecap="round" stroke-dasharray="2 8" opacity=".6"/>
      <rect x="44" y="40" width="32" height="40" rx="6" fill="#222"/><rect x="324" y="40" width="32" height="40" rx="6" fill="#222"/>
      <rect x="170" y="218" width="60" height="22" rx="4" fill="#111"/><text x="200" y="234" text-anchor="middle" font-family="Arial" font-size="11" font-weight="900" fill="#ffe100">APX</text>`);
    case "bag": return wrap(`${shadow()}
      <path d="M130 90 Q130 40 200 40 Q270 40 270 90" fill="none" stroke="#222" stroke-width="14"/>
      <rect x="70" y="90" width="260" height="170" rx="18" fill="#2a2a2a"/>
      <rect x="70" y="90" width="260" height="70" rx="18" fill="#1a1a1a"/>
      <rect x="180" y="150" width="40" height="26" rx="4" fill="#ffe100"/>
      <rect x="95" y="190" width="210" height="50" rx="8" fill="#222" stroke="#333" stroke-dasharray="4 4"/>`);
    case "tripod": return wrap(`${shadow(200, 278, 140)}
      <circle cx="200" cy="40" r="22" fill="url(#${u}body)"/><rect x="170" y="56" width="60" height="22" rx="6" fill="#1a1a1a"/>
      <rect x="194" y="78" width="12" height="70" fill="url(#${u}silver)"/>
      <rect x="180" y="140" width="40" height="22" rx="4" fill="#111"/>
      <path d="M190 160 L80 275" stroke="#1a1a1a" stroke-width="12" stroke-linecap="round"/>
      <path d="M210 160 L320 275" stroke="#1a1a1a" stroke-width="12" stroke-linecap="round"/>
      <path d="M200 162 L200 280" stroke="#222" stroke-width="12" stroke-linecap="round"/>
      <rect x="130" y="210" width="10" height="14" fill="#ffe100" transform="rotate(-45 135 217)"/><rect x="262" y="210" width="10" height="14" fill="#ffe100" transform="rotate(45 267 217)"/>`);
    case "flash": return wrap(`${shadow()}
      <rect x="150" y="160" width="100" height="100" rx="10" fill="url(#${u}body)"/>
      <rect x="160" y="140" width="80" height="26" rx="4" fill="#111"/>
      <rect x="120" y="40" width="160" height="100" rx="12" fill="url(#${u}body)"/>
      <rect x="134" y="54" width="132" height="72" rx="6" fill="#eee" opacity=".85"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${140 + i * 21}" y="58" width="14" height="64" fill="#fff" opacity=".7"/>`).join("")}
      <rect x="160" y="250" width="80" height="16" rx="3" fill="#333"/><circle cx="200" cy="200" r="8" fill="#ffe100"/>`);
    case "filter": return wrap(`${shadow(200, 272, 120)}
      <circle cx="200" cy="145" r="110" fill="#111"/>
      <circle cx="200" cy="145" r="100" fill="#1d1d1d" stroke="#444" stroke-width="2"/>
      <circle cx="200" cy="145" r="92" fill="url(#${u}glass)" opacity=".85"/>
      <ellipse cx="160" cy="105" rx="40" ry="16" fill="#fff" opacity=".25" transform="rotate(-35 160 105)"/>
      <text x="200" y="52" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#aaa" letter-spacing="2">CLEARPRO 77mm</text>`);
    default: return wrap(shadow());
  }
}

/* ---------- 상품 카드 ---------- */
function ratingLine(id) {
  const s = typeof reviewStats !== "undefined" ? reviewStats[id] : null;
  const label = s ? `<span class="stars">★</span> ${s.avg.toFixed(1)} <span class="rv-count">리뷰 ${s.count}</span>` : "리뷰 보기";
  return `<button type="button" class="card-rating" data-action="reviews">${label}</button>`;
}

function productCard(p) {
  return `
  <article class="card" data-id="${p.id}">
    <div class="card-media">
      ${p.badge ? `<span class="badge ${p.badge}">${p.badge}</span>` : ""}
      ${productArt(p.art)}
    </div>
    <div class="card-body">
      <span class="card-sub">${p.sub}</span>
      <h3 class="card-name">${p.name}</h3>
      ${ratingLine(p.id)}
      <ul class="card-specs">${p.specs.map((s) => `<li>${s}</li>`).join("")}</ul>
      <div class="card-foot">
        <span class="price">${won(p.price)}<small>원</small></span>
        <div class="card-actions">
          <button class="add-btn" data-action="add" aria-label="${p.name} 장바구니 담기">${ICON.plus}</button>
          <button class="buy-btn" data-action="buy">바로구매</button>
        </div>
      </div>
    </div>
  </article>`;
}

/* 카드 버튼 이벤트 위임 */
function bindCardActions(root) {
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = btn.closest(".card").dataset.id;
    const p = findProduct(id);
    if (btn.dataset.action === "add") {
      Cart.add(id);
      toast(`<span><b>${p.name}</b> 상품을 장바구니에 담았습니다.</span><a href="cart.html">장바구니 보기 →</a>`);
    } else if (btn.dataset.action === "reviews") {
      if (typeof openReviews === "function") openReviews(id);
    } else if (btn.dataset.action === "buy") {
      BuyNow.set(id);
      location.href = "checkout.html?mode=buynow";
    }
  });
}

/* ---------- 초기화 ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  updateCartBadge();
  renderAuthNav();
});

/* 헤더 로그인 상태: 로그인 전 "로그인/가입", 후 "내 주문 · 로그아웃" */
async function renderAuthNav() {
  const nav = document.getElementById("authNav");
  if (!nav || typeof Auth === "undefined") return;
  const user = await Auth.user();
  if (!user) return;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  nav.innerHTML = `<span class="who">${esc(Auth.name(user))}님</span><a href="orders.html">내 주문</a><a href="#" id="logoutBtn">로그아웃</a>`;
  document.getElementById("logoutBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    await sb.auth.signOut();
    try { sessionStorage.removeItem("aperture_pending_order"); } catch (err) {}
    location.href = "index.html";
  });
}

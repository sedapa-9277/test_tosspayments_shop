/* =========================================================
   상품 상세 페이지 (product.html?id=...)
   설명/특장점/스펙표는 products.detail(JSON)에서 가져옵니다.
   ========================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  await productsReady;
  const root = document.getElementById("productRoot");
  const p = findProduct(new URLSearchParams(location.search).get("id"));

  if (!p) {
    root.innerHTML = `<div class="cart-empty"><h2>상품을 찾을 수 없습니다</h2>
      <a href="cameras.html" class="btn btn-black">쇼핑하러 가기 <span class="arrow">→</span></a></div>`;
    return;
  }

  const meta = CATEGORY_META[p.category];
  const d = p.detail || {};
  const highlights = d.highlights && d.highlights.length ? d.highlights : p.specs.map((s) => [s, ""]);
  const specRows = d.specs && d.specs.length ? d.specs : p.specs.map((s, i) => [`특징 ${i + 1}`, s]);
  document.title = `${p.name} | APERTURE`;

  root.innerHTML = `
    <nav class="crumbs"><a href="index.html">홈</a> › <a href="${meta.page}">${meta.label}</a> › <span>${esc(p.name)}</span></nav>

    <div class="pd-top card" data-id="${p.id}">
      <div class="pd-media">${p.badge ? `<span class="badge ${p.badge}">${p.badge}</span>` : ""}${productArt(p.art)}</div>
      <div class="pd-info">
        <span class="card-sub">${esc(p.sub)}</span>
        <h1>${esc(p.name)}</h1>
        ${ratingLine(p.id)}
        <p class="pd-summary">${esc(d.summary || "")}</p>
        <ul class="card-specs">${p.specs.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
        <div class="pd-price"><span class="price">${won(p.price)}<small>원</small></span><small>전 상품 무료배송 · 정품 2년 보증</small></div>
        <div class="pd-actions">
          <button class="btn btn-outline" data-action="add">장바구니 담기</button>
          <button class="btn btn-yellow" data-action="buy">바로구매 <span class="arrow">→</span></button>
        </div>
      </div>
    </div>

    <section class="pd-section">
      <h2>주요 특징</h2>
      <div class="pd-highlights">
        ${highlights.map(([t, x], i) => `<div><span class="n">0${i + 1}</span><b>${esc(t)}</b>${x ? `<p>${esc(x)}</p>` : ""}</div>`).join("")}
      </div>
    </section>

    <section class="pd-section">
      <h2>상세 사양</h2>
      <table class="result-table pd-specs">
        ${specRows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}
      </table>
      <p class="pd-note">APERTURE 브랜드와 상품은 가상이며, 표시된 사양은 예시입니다.</p>
    </section>

    <section class="pd-section">
      <h2>리뷰</h2>
      <p>구매한 회원은 리뷰를 작성하고, 다른 회원의 리뷰에 좋아요를 누를 수 있습니다.</p>
      <button type="button" class="btn btn-black" data-action="reviews">리뷰 보기 / 작성하기</button>
    </section>`;

  bindCardActions(root);
});

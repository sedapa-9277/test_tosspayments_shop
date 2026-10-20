/* =========================================================
   카테고리 상품 목록 페이지 (카메라 / 렌즈 / 액세서리)
   body[data-page] 값으로 카테고리를 결정
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const category = document.body.dataset.page;
  const all = PRODUCTS.filter((p) => p.category === category);

  const grid = document.getElementById("productGrid");
  const tagBox = document.getElementById("tagFilters");
  const priceInput = document.getElementById("priceMax");
  const priceOut = document.getElementById("priceOut");
  const sortSelect = document.getElementById("sort");
  const resultCount = document.getElementById("resultCount");

  const heroArt = document.getElementById("heroArt");
  if (heroArt) heroArt.innerHTML = productArt(heroArt.dataset.art);

  /* 태그 필터 생성 */
  const tagCounts = {};
  all.forEach((p) => p.tags.forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)));
  tagBox.innerHTML = Object.entries(tagCounts)
    .map(([t, n]) => `
      <label class="filter-option">
        <input type="checkbox" value="${t}"> ${t} <span class="count">${n}</span>
      </label>`)
    .join("");

  /* 가격 슬라이더 범위 */
  const maxPrice = Math.max(...all.map((p) => p.price));
  const step = maxPrice > 1000000 ? 100000 : 10000;
  const ceil = Math.ceil(maxPrice / step) * step;
  priceInput.max = ceil;
  priceInput.step = step;
  priceInput.value = ceil;

  function render() {
    const tags = [...tagBox.querySelectorAll("input:checked")].map((i) => i.value);
    const limit = Number(priceInput.value);
    priceOut.textContent = `${won(limit)}원 이하`;

    let list = all.filter((p) => p.price <= limit && (tags.length === 0 || tags.some((t) => p.tags.includes(t))));
    switch (sortSelect.value) {
      case "low": list.sort((a, b) => a.price - b.price); break;
      case "high": list.sort((a, b) => b.price - a.price); break;
      case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      // 추천순(기본) = 데이터 순서 그대로
    }

    resultCount.textContent = list.length;
    grid.innerHTML = list.length
      ? list.map(productCard).join("")
      : `<p class="empty">조건에 맞는 상품이 없습니다.</p>`;
  }

  tagBox.addEventListener("change", render);
  priceInput.addEventListener("input", render);
  sortSelect.addEventListener("change", render);
  document.getElementById("resetFilters").addEventListener("click", () => {
    tagBox.querySelectorAll("input").forEach((i) => (i.checked = false));
    priceInput.value = ceil;
    sortSelect.value = "recommend";
    render();
  });
  document.querySelector(".filter-toggle").addEventListener("click", () => {
    document.querySelector(".filters").classList.toggle("open");
  });

  bindCardActions(grid);
  render();
});

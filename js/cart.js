/* =========================================================
   장바구니 페이지
   ========================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  await productsReady;
  const root = document.getElementById("cartRoot");

  function render() {
    const items = Cart.detailed();

    if (!items.length) {
      root.innerHTML = `
        <div class="cart-empty">
          ${ICON.cart}
          <h2>장바구니가 비어 있습니다</h2>
          <p>마음에 드는 장비를 담아보세요.</p>
          <a href="cameras.html" class="btn btn-black">쇼핑 계속하기 <span class="arrow">→</span></a>
        </div>`;
      return;
    }

    const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);

    root.innerHTML = `
      <div class="order-layout">
        <div class="panel">
          <h2>주문 상품 <span class="sub">${items.length}종 · ${count}개</span></h2>
          ${items.map(({ product: p, qty }) => `
            <div class="cart-item" data-id="${p.id}">
              <div class="cart-thumb">${productArt(p.art)}</div>
              <div class="cart-info">
                <span class="card-sub">${CATEGORY_META[p.category].label} · ${p.sub}</span>
                <h3>${p.name}</h3>
                <div class="qty">
                  <button type="button" data-qty="-1" aria-label="수량 감소">−</button>
                  <input type="number" value="${qty}" min="1" max="99" aria-label="수량">
                  <button type="button" data-qty="1" aria-label="수량 증가">+</button>
                </div>
              </div>
              <div class="cart-right">
                <span class="price">${won(p.price * qty)}<small>원</small></span>
                <button type="button" class="remove-btn">삭제</button>
              </div>
            </div>`).join("")}
          <div style="margin-top:24px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
            <a href="cameras.html" class="btn btn-outline">쇼핑 계속하기</a>
            <button type="button" class="reset-btn" id="clearCart">장바구니 비우기</button>
          </div>
        </div>

        <aside class="summary">
          <h2>결제 예정 금액</h2>
          <div class="summary-row"><span>상품 금액</span><span>${won(total)}원</span></div>
          <div class="summary-row"><span>배송비</span><span>무료</span></div>
          <div class="summary-row total"><span>총 결제금액</span><b>${won(total)}원</b></div>
          <a href="checkout.html" class="btn btn-yellow btn-block">주문하기 <span class="arrow">→</span></a>
          <p class="note">토스페이먼츠 결제위젯으로 안전하게 결제됩니다.</p>
        </aside>
      </div>`;
  }

  root.addEventListener("click", (e) => {
    const row = e.target.closest(".cart-item");
    if (e.target.id === "clearCart") {
      if (confirm("장바구니를 비우시겠습니까?")) { Cart.clear(); render(); }
      return;
    }
    if (!row) return;
    const id = row.dataset.id;
    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      const input = row.querySelector("input");
      Cart.setQty(id, Number(input.value) + Number(qtyBtn.dataset.qty));
      render();
    } else if (e.target.closest(".remove-btn")) {
      Cart.remove(id);
      render();
    }
  });

  root.addEventListener("change", (e) => {
    if (e.target.matches(".qty input")) {
      Cart.setQty(e.target.closest(".cart-item").dataset.id, parseInt(e.target.value, 10) || 1);
      render();
    }
  });

  render();
});

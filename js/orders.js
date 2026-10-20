/* =========================================================
   내 주문 내역 (orders.html): 목록, 상세, 환불/취소
   ========================================================= */
const ORDER_STATUS = { pending: "결제대기", paid: "결제완료", canceled: "취소완료", failed: "결제실패" };

document.addEventListener("DOMContentLoaded", async () => {
  const user = await Auth.require();
  if (!user) return;
  await productsReady;
  const root = document.getElementById("ordersRoot");
  const fmt = (d) => (d ? new Date(d).toLocaleString("ko-KR") : "-");

  async function load() {
    const { data, error } = await sb.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (error) { root.innerHTML = `<p class="empty">주문 내역을 불러오지 못했습니다.</p>`; return; }
    if (!data.length) {
      root.innerHTML = `<div class="cart-empty"><h2>주문 내역이 없습니다</h2><p>마음에 드는 장비를 주문해 보세요.</p>
        <a href="cameras.html" class="btn btn-black">쇼핑하러 가기 <span class="arrow">→</span></a></div>`;
      return;
    }
    root.innerHTML = data.map((o) => `
      <details class="order-card" data-id="${esc(o.id)}">
        <summary>
          <span class="o-date">${new Date(o.created_at).toLocaleDateString("ko-KR")}</span>
          <span class="o-name"><b>${esc(o.order_name)}</b><small>${esc(o.id)}</small></span>
          <span class="o-amount">${won(o.amount)}원</span>
          <span class="o-status s-${o.status}">${ORDER_STATUS[o.status]}</span>
        </summary>
        <div class="o-detail">
          <table class="result-table">
            ${o.order_items.map((i) => `<tr><th>${esc(i.name)}</th><td>${won(i.price)}원 × ${i.qty}개 = <b>${won(i.price * i.qty)}원</b>
              ${o.status === "paid" ? ` <button type="button" class="o-link" data-review="${esc(i.product_id)}">리뷰 쓰기</button>` : ""}</td></tr>`).join("")}
            <tr><th>결제 수단</th><td>${esc(o.method || "-")}</td></tr>
            <tr><th>결제 시각</th><td>${fmt(o.paid_at)}</td></tr>
            ${o.status === "canceled" ? `<tr><th>취소 시각</th><td>${fmt(o.canceled_at)}</td></tr><tr><th>취소 사유</th><td>${esc(o.cancel_reason)}</td></tr>` : ""}
            ${o.status === "failed" ? `<tr><th>실패 사유</th><td>${esc(o.fail_reason || "-")}</td></tr>` : ""}
          </table>
          ${o.status === "paid" ? `<button type="button" class="btn btn-outline" data-cancel>환불/취소</button>` : ""}
        </div>
      </details>`).join("");
  }

  root.addEventListener("click", async (e) => {
    const rv = e.target.closest("[data-review]");
    if (rv) { openReviews(rv.dataset.review); return; }
    const c = e.target.closest("[data-cancel]");
    if (!c) return;
    const id = c.closest(".order-card").dataset.id;
    const reason = prompt("환불/취소 사유를 입력해 주세요.");
    if (!reason || !reason.trim()) return;
    if (!confirm("주문 전체가 취소되고 결제 금액이 환불됩니다. 진행할까요?")) return;
    c.disabled = true;
    try {
      await Auth.call("cancel-order", { orderId: id, reason: reason.trim() });
      toast("<span>주문이 취소되었습니다.</span>");
      await load();
    } catch (err) {
      alert(err.message || "취소에 실패했습니다.");
      c.disabled = false;
    }
  });

  load();
});

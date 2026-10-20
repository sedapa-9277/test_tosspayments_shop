/* =========================================================
   결제 결과 페이지 (success.html / fail.html)

   토스페이먼츠 리다이렉트 파라미터
   - 성공: ?paymentType=NORMAL&orderId=...&paymentKey=...&amount=...
   - 실패: ?code=...&message=...&orderId=...

   ※ 성공 페이지로 돌아온 시점은 "결제 인증"까지 완료된 상태입니다.
     실제 결제를 확정하려면 서버에서 10분 이내에 결제 승인 API를 호출해야 합니다.
     POST https://api.tosspayments.com/v1/payments/confirm
     Authorization: Basic base64("{시크릿키}:")
     Body: { "paymentKey": "...", "orderId": "...", "amount": 0 }
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const root = document.getElementById("resultRoot");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let pending = null;
  try { pending = JSON.parse(sessionStorage.getItem("aperture_pending_order")); } catch (e) {}

  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>';
  const CROSS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  const actions = `
    <div class="result-actions">
      <a href="index.html" class="btn btn-outline">홈으로</a>
      <a href="cameras.html" class="btn btn-black">쇼핑 계속하기</a>
    </div>`;

  /* ---------- 실패 ---------- */
  if (document.body.dataset.page === "fail") {
    const code = params.get("code");
    const canceled = code === "PAY_PROCESS_CANCELED";
    root.innerHTML = `
      <div class="result-icon fail">${CROSS}</div>
      <h1>${canceled ? "결제를 취소했습니다" : "결제에 실패했습니다"}</h1>
      <p>${esc(params.get("message") || "결제 처리 중 문제가 발생했습니다.")}</p>
      <table class="result-table">
        <tr><th>에러 코드</th><td>${esc(code || "-")}</td></tr>
        <tr><th>주문번호</th><td>${esc(params.get("orderId") || (pending && pending.orderId) || "-")}</td></tr>
      </table>
      <div class="result-actions">
        <a href="${pending && pending.isBuyNow ? "checkout.html?mode=buynow" : "checkout.html"}" class="btn btn-yellow">다시 결제하기</a>
        <a href="cart.html" class="btn btn-outline">장바구니로</a>
      </div>`;
    return;
  }

  /* ---------- 성공 ---------- */
  const orderId = params.get("orderId");
  const paymentKey = params.get("paymentKey");
  const amount = Number(params.get("amount"));

  if (!orderId || !paymentKey) {
    root.innerHTML = `
      <div class="result-icon fail">${CROSS}</div>
      <h1>잘못된 접근입니다</h1>
      <p>결제 정보를 찾을 수 없습니다.</p>${actions}`;
    return;
  }

  // 결제 요청 금액과 리다이렉트된 금액이 같은지 확인 (최종 검증은 반드시 서버에서)
  const mismatch = pending && pending.orderId === orderId && pending.amount !== amount;
  if (mismatch) {
    root.innerHTML = `
      <div class="result-icon fail">${CROSS}</div>
      <h1>결제 금액이 일치하지 않습니다</h1>
      <p>요청 금액(${won(pending.amount)}원)과 결제 금액(${won(amount)}원)이 다릅니다. 고객센터로 문의해 주세요.</p>${actions}`;
    return;
  }

  const order = pending && pending.orderId === orderId ? pending : null;
  if (order) {
    // 주문 완료 → 장바구니 / 바로구매 정리 (새로고침 시 중복 처리를 막기 위해 1회만)
    if (!order.done) {
      if (order.isBuyNow) BuyNow.clear(); else Cart.clear();
      order.done = true;
      try { sessionStorage.setItem("aperture_pending_order", JSON.stringify(order)); } catch (e) {}
    }
  }

  const itemRows = order
    ? order.items.map((i) => {
        const p = findProduct(i.id);
        return p ? `${esc(p.name)} × ${i.qty}` : "";
      }).filter(Boolean).join("<br>")
    : "-";

  root.innerHTML = `
    <div class="result-icon ok">${CHECK}</div>
    <h1>주문이 완료되었습니다</h1>
    <p>${order ? `${esc(order.customer.name)}님, ` : ""}APERTURE를 이용해 주셔서 감사합니다.<br>주문 내역은 입력하신 이메일로 발송됩니다.</p>
    <table class="result-table">
      <tr><th>주문번호</th><td>${esc(orderId)}</td></tr>
      <tr><th>주문상품</th><td>${itemRows}</td></tr>
      <tr><th>결제금액</th><td><b>${won(amount)}원</b></td></tr>
      ${order ? `<tr><th>배송지</th><td>${esc(order.customer.address)}</td></tr>` : ""}
      <tr><th>결제키</th><td style="font-size:12px;color:#767676">${esc(paymentKey)}</td></tr>
    </table>
    <div class="notice" style="text-align:left">
      <b>개발자 안내</b> — 현재는 결제 인증까지 완료된 상태입니다. 실제 결제를 확정하려면 서버에서
      <code>POST /v1/payments/confirm</code> 을 <code>paymentKey · orderId · amount</code> 로 10분 이내에 호출하세요.
    </div>
    ${actions}`;
});

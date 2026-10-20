/* =========================================================
   결제 결과 페이지 (success.html / fail.html)

   토스페이먼츠 리다이렉트 파라미터
   - 성공: ?paymentType=NORMAL&orderId=...&paymentKey=...&amount=...
   - 실패: ?code=...&message=...&orderId=...

   성공 페이지에 도착한 시점은 "결제 인증"까지만 끝난 상태입니다.
   Edge Function(confirm-payment)이 금액을 DB 주문과 비교한 뒤 토스 결제 승인 API를 호출해 확정합니다.
   ========================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  const root = document.getElementById("resultRoot");

  let pending = null;
  try { pending = JSON.parse(sessionStorage.getItem("aperture_pending_order")); } catch (e) {}

  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>';
  const CROSS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  const actions = `
    <div class="result-actions">
      <a href="index.html" class="btn btn-outline">홈으로</a>
      <a href="cameras.html" class="btn btn-black">쇼핑 계속하기</a>
    </div>`;
  const failView = (title, msg) => {
    root.innerHTML = `
      <div class="result-icon fail">${CROSS}</div>
      <h1>${esc(title)}</h1>
      <p>${esc(msg)}</p>${actions}`;
  };

  /* ---------- 실패 ---------- */
  if (document.body.dataset.page === "fail") {
    const code = params.get("code");
    const canceled = code === "PAY_PROCESS_CANCELED";
    const orderId = params.get("orderId") || (pending && pending.orderId);
    root.innerHTML = `
      <div class="result-icon fail">${CROSS}</div>
      <h1>${canceled ? "결제를 취소했습니다" : "결제에 실패했습니다"}</h1>
      <p>${esc(params.get("message") || "결제 처리 중 문제가 발생했습니다.")}</p>
      <table class="result-table">
        <tr><th>에러 코드</th><td>${esc(code || "-")}</td></tr>
        <tr><th>주문번호</th><td>${esc(orderId || "-")}</td></tr>
      </table>
      <div class="result-actions">
        <a href="${pending && pending.isBuyNow ? "checkout.html?mode=buynow" : "checkout.html"}" class="btn btn-yellow">다시 결제하기</a>
        <a href="cart.html" class="btn btn-outline">장바구니로</a>
      </div>`;
    // 주문을 "결제실패"로 기록 (실패해도 화면에는 영향 없음)
    if (orderId) Auth.call("confirm-payment", { fail: true, orderId, reason: params.get("message") || code }).catch(() => {});
    return;
  }

  /* ---------- 성공: 결제 확정 ---------- */
  const orderId = params.get("orderId");
  const paymentKey = params.get("paymentKey");
  const amount = Number(params.get("amount"));

  if (!orderId || !paymentKey) return failView("잘못된 접근입니다", "결제 정보를 찾을 수 없습니다.");
  if (!(await Auth.user())) return failView("로그인이 필요합니다", "로그인 후 내 주문 내역에서 결제 상태를 확인해 주세요.");

  root.innerHTML = `<p class="empty">결제를 확정하는 중입니다...</p>`;
  let order;
  try {
    ({ order } = await Auth.call("confirm-payment", { paymentKey, orderId, amount }));
  } catch (err) {
    return failView("결제를 확정하지 못했습니다", err.message || "잠시 후 내 주문 내역에서 상태를 확인해 주세요.");
  }

  // 주문 완료 → 장바구니 / 바로구매 정리 (확정 후 1회, 새로고침해도 서버가 중복 승인을 막음)
  if (pending && pending.orderId === orderId && !pending.done) {
    if (pending.isBuyNow) BuyNow.clear(); else Cart.clear();
    pending.done = true;
    try { sessionStorage.setItem("aperture_pending_order", JSON.stringify(pending)); } catch (e) {}
  }

  const { data: rows } = await sb.from("order_items").select("name,qty").eq("order_id", orderId);
  const itemRows = (rows || []).map((i) => `${esc(i.name)} × ${i.qty}`).join("<br>") || "-";
  const c = order.customer || {};

  root.innerHTML = `
    <div class="result-icon ok">${CHECK}</div>
    <h1>주문이 완료되었습니다</h1>
    <p>${esc(c.name || "")}님, APERTURE를 이용해 주셔서 감사합니다.</p>
    <table class="result-table">
      <tr><th>주문번호</th><td>${esc(order.id)}</td></tr>
      <tr><th>주문상품</th><td>${itemRows}</td></tr>
      <tr><th>결제금액</th><td><b>${won(order.amount)}원</b></td></tr>
      <tr><th>결제수단</th><td>${esc(order.method || "-")}</td></tr>
      <tr><th>배송지</th><td>${esc(c.address || "-")}</td></tr>
    </table>
    <div class="result-actions">
      <a href="orders.html" class="btn btn-yellow">내 주문 내역</a>
      <a href="cameras.html" class="btn btn-black">쇼핑 계속하기</a>
    </div>`;
});

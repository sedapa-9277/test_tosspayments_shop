/* =========================================================
   주문/결제 페이지 — 토스페이먼츠 결제위젯(SDK v2) 연동
   문서: https://docs.tosspayments.com/sdk/v2/js/payment-widget
   ========================================================= */
const PENDING_KEY = "aperture_pending_order";

document.addEventListener("DOMContentLoaded", async () => {
  const isBuyNow = new URLSearchParams(location.search).get("mode") === "buynow";
  const raw = isBuyNow ? BuyNow.get() || [] : Cart.read();
  const items = raw.map((i) => ({ ...i, product: findProduct(i.id) })).filter((i) => i.product);

  const root = document.getElementById("checkoutRoot");
  const payBtn = document.getElementById("payBtn");
  const notice = document.getElementById("envNotice");

  /* 주문 상품이 없으면 안내 */
  if (!items.length) {
    root.innerHTML = `
      <div class="cart-empty" style="grid-column:1/-1">
        ${ICON.cart}
        <h2>주문할 상품이 없습니다</h2>
        <p>장바구니에 상품을 담은 뒤 주문해 주세요.</p>
        <a href="cameras.html" class="btn btn-black">쇼핑하러 가기 <span class="arrow">→</span></a>
      </div>`;
    return;
  }

  /* 주문 요약 */
  const amount = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  document.getElementById("miniItems").innerHTML = items.map(({ product: p, qty }) => `
    <div class="mini-item">
      <div class="cart-thumb">${productArt(p.art)}</div>
      <div><b>${p.name}</b><span>${qty}개</span></div>
      <strong>${won(p.price * qty)}원</strong>
    </div>`).join("");
  document.getElementById("subtotal").textContent = `${won(amount)}원`;
  document.getElementById("total").textContent = `${won(amount)}원`;
  payBtn.textContent = `${won(amount)}원 결제하기`;

  /* 주소 검색 (다음 우편번호) */
  document.getElementById("addrSearch").addEventListener("click", () => {
    if (!window.daum || !daum.Postcode) {
      alert("주소 검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    new daum.Postcode({
      oncomplete(data) {
        document.getElementById("zipcode").value = data.zonecode;
        document.getElementById("address").value = data.roadAddress || data.jibunAddress;
        setError("zipcode", "");
        document.getElementById("addressDetail").focus();
      },
    }).open();
  });

  /* 실행 환경 확인: 결제 후 돌아올 successUrl 은 http(s) 주소여야 함 */
  if (location.protocol === "file:") {
    notice.innerHTML = `<div class="notice warn">
      파일(file://)로 열면 결제 후 돌아올 주소를 만들 수 없습니다. 로컬 서버로 실행해 주세요.
      (예: 프로젝트 폴더에서 <code>python -m http.server 5500</code> 실행 후 http://localhost:5500 접속)</div>`;
  }
  if (TOSS_CONFIG.clientKey.startsWith("test_")) {
    notice.insertAdjacentHTML("beforeend", `<div class="notice">
      <b>테스트 모드</b> — 실제로 결제되지 않습니다. 테스트 카드로 결제 흐름을 확인할 수 있습니다.</div>`);
  }

  /* ---------- 토스페이먼츠 결제위젯 ---------- */
  if (typeof TossPayments !== "function") {
    document.getElementById("payment-method").innerHTML =
      `<p class="toss-loading">결제 모듈을 불러오지 못했습니다. 네트워크 상태를 확인해 주세요.</p>`;
    return;
  }

  const tossPayments = TossPayments(TOSS_CONFIG.clientKey);
  // 비회원 결제: ANONYMOUS. 회원제라면 회원별 고유 customerKey(UUID 등)를 사용하세요.
  const widgets = tossPayments.widgets({ customerKey: TossPayments.ANONYMOUS });

  try {
    await widgets.setAmount({ currency: "KRW", value: amount });
    document.getElementById("payment-method").innerHTML = "";
    await Promise.all([
      widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
      widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
    ]);
    payBtn.disabled = false;
  } catch (err) {
    console.error(err);
    document.getElementById("payment-method").innerHTML =
      `<p class="toss-loading">결제위젯을 불러오지 못했습니다.<br>${err.message || ""}</p>`;
    return;
  }

  /* ---------- 결제 요청 ---------- */
  document.getElementById("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const form = e.target;
    const orderId = createOrderId();
    const first = items[0].product.name;
    const orderName = items.length > 1 ? `${first} 외 ${items.length - 1}건` : first;

    // 결제 성공 페이지에서 금액 검증·주문 표시에 사용
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({
        orderId, orderName, amount, isBuyNow,
        items: items.map(({ id, qty }) => ({ id, qty })),
        customer: {
          name: form.buyerName.value.trim(),
          phone: form.phone.value.replace(/\D/g, ""),
          email: form.email.value.trim(),
          address: `(${form.zipcode.value}) ${form.address.value} ${form.addressDetail.value}`.trim(),
          memo: form.memo.value,
        },
      }));
    } catch (err) {}

    payBtn.disabled = true;
    try {
      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: new URL("success.html", location.href).href,
        failUrl: new URL("fail.html", location.href).href,
        customerName: form.buyerName.value.trim(),
        customerEmail: form.email.value.trim(),
        customerMobilePhone: form.phone.value.replace(/\D/g, ""),
      });
    } catch (err) {
      // 사용자가 결제창을 닫는 등 리다이렉트 전에 발생한 오류
      console.error(err);
      if (err.code !== "USER_CANCEL") alert(err.message || "결제 요청 중 오류가 발생했습니다.");
      payBtn.disabled = false;
    }
  });

  /* ---------- 유틸 ---------- */
  function createOrderId() {
    // 영문, 숫자, -, _, = 로 6~64자
    const rand = Math.random().toString(36).slice(2, 10);
    return `APT-${Date.now()}-${rand}`;
  }

  function setError(id, msg) {
    const field = document.getElementById(id).closest(".field");
    field.classList.toggle("error", !!msg);
    field.querySelector(".msg").textContent = msg;
  }

  function validate() {
    const f = document.getElementById("orderForm");
    const rules = [
      ["buyerName", f.buyerName.value.trim().length >= 2, "이름을 입력해 주세요."],
      ["phone", /^01\d{8,9}$/.test(f.phone.value.replace(/\D/g, "")), "올바른 휴대폰 번호를 입력해 주세요."],
      ["email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()), "올바른 이메일을 입력해 주세요."],
      ["zipcode", !!f.zipcode.value, "주소를 검색해 주세요."],
    ];
    let firstBad = null;
    rules.forEach(([id, ok, msg]) => {
      setError(id, ok ? "" : msg);
      if (!ok && !firstBad) firstBad = id;
    });
    if (firstBad) {
      const el = document.getElementById(firstBad);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (!el.readOnly) el.focus();
      return false;
    }
    return true;
  }
});

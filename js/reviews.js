/* =========================================================
   상품 리뷰 모달: 목록(최신/좋아요순), 작성, 수정, 삭제, 좋아요
   ========================================================= */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function openReviews(productId) {
  const product = findProduct(productId);
  if (!product || !sb) return;

  let dlg = document.getElementById("reviewDlg");
  if (!dlg) {
    dlg = document.createElement("dialog");
    dlg.id = "reviewDlg";
    document.body.appendChild(dlg);
  }
  let sort = "latest";
  const user = await Auth.user();

  async function render() {
    const [rv, purchased] = await Promise.all([
      sb.from("reviews").select("*, review_likes(user_id)").eq("product_id", productId),
      user ? sb.rpc("has_purchased", { pid: productId }) : Promise.resolve({ data: false }),
    ]);
    const list = (rv.data || []).map((r) => ({ ...r, likes: r.review_likes.length, liked: user && r.review_likes.some((l) => l.user_id === user.id) }));
    list.sort(sort === "likes" ? (a, b) => b.likes - a.likes || b.id - a.id : (a, b) => new Date(b.created_at) - new Date(a.created_at));

    const mine = user && list.find((r) => r.user_id === user.id);
    reviewStats[productId] = list.length ? { avg: list.reduce((s, r) => s + r.rating, 0) / list.length, count: list.length } : undefined;
    if (!list.length) delete reviewStats[productId];
    refreshCardRating(productId);
    const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
    const avg = list.length ? (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1) : "-";

    let writeBox;
    if (!user) writeBox = `<p class="rv-note">리뷰를 쓰려면 <a href="login.html?next=${encodeURIComponent(location.pathname.split("/").pop())}">로그인</a>해 주세요.</p>`;
    else if (mine) writeBox = `<p class="rv-note">이미 이 상품의 리뷰를 작성했습니다. 아래에서 수정하거나 삭제할 수 있어요.</p>`;
    else if (!purchased.data) writeBox = `<p class="rv-note">이 상품을 구매(결제완료)한 회원만 리뷰를 쓸 수 있습니다.</p>`;
    else writeBox = `
      <form class="rv-form" id="rvForm">
        <div class="rv-rate" id="rvRate">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" aria-label="${n}점">★</button>`).join("")}</div>
        <textarea id="rvText" maxlength="1000" placeholder="상품 사용 후기를 10자 이상 남겨 주세요." required></textarea>
        <p class="msg" id="rvMsg"></p>
        <button class="btn btn-black" type="submit">리뷰 등록</button>
      </form>`;

    dlg.innerHTML = `
      <div class="rv-head">
        <div><b>${esc(product.name)}</b><span class="rv-avg"><span class="stars">★</span> ${avg} · 리뷰 ${list.length}개</span></div>
        <button type="button" class="rv-close" aria-label="닫기">×</button>
      </div>
      ${writeBox}
      <div class="rv-sort">
        <button type="button" data-sort="latest" class="${sort === "latest" ? "on" : ""}">최신순</button>
        <button type="button" data-sort="likes" class="${sort === "likes" ? "on" : ""}">좋아요순</button>
      </div>
      <ul class="rv-list">
        ${list.length ? list.map((r) => `
          <li data-id="${r.id}">
            <div class="rv-top"><span class="stars">${stars(r.rating)}</span><b>${esc(r.author_name)}</b><time>${new Date(r.created_at).toLocaleDateString("ko-KR")}</time></div>
            <p>${esc(r.content)}</p>
            <div class="rv-bottom">
              <button type="button" class="rv-like ${r.liked ? "on" : ""}" data-act="like">♥ ${r.likes}</button>
              ${user && r.user_id === user.id ? `<button type="button" data-act="edit">수정</button><button type="button" data-act="del">삭제</button>` : ""}
            </div>
          </li>`).join("") : `<li class="rv-empty">아직 리뷰가 없습니다.</li>`}
      </ul>`;

    let rating = 0;
    const rate = dlg.querySelector("#rvRate");
    if (rate) rate.addEventListener("click", (e) => {
      const b = e.target.closest("[data-n]");
      if (!b) return;
      rating = Number(b.dataset.n);
      rate.querySelectorAll("button").forEach((x) => x.classList.toggle("on", Number(x.dataset.n) <= rating));
    });
    const form = dlg.querySelector("#rvForm");
    if (form) form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const content = dlg.querySelector("#rvText").value.trim();
      const msg = dlg.querySelector("#rvMsg");
      if (!rating) { msg.textContent = "별점을 선택해 주세요."; return; }
      if (content.length < 10) { msg.textContent = "내용을 10자 이상 입력해 주세요."; return; }
      const { error } = await sb.from("reviews").insert({ product_id: productId, rating, content });
      if (error) { msg.textContent = "등록하지 못했습니다. 구매 내역을 확인해 주세요."; return; }
      render();
    });
  }

  dlg.onclick = async (e) => {
    if (e.target === dlg || e.target.closest(".rv-close")) { dlg.close(); return; }
    const s = e.target.closest("[data-sort]");
    if (s) { sort = s.dataset.sort; render(); return; }
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const li = btn.closest("li");
    const id = Number(li.dataset.id);
    if (btn.dataset.act === "like") {
      if (!user) { toast("<span>좋아요는 로그인 후 누를 수 있어요.</span><a href=\"login.html\">로그인 →</a>"); return; }
      const on = btn.classList.contains("on");
      const { error } = on
        ? await sb.from("review_likes").delete().eq("review_id", id).eq("user_id", user.id)
        : await sb.from("review_likes").insert({ review_id: id });
      if (error) { toast("<span>본인 리뷰에는 좋아요를 누를 수 없습니다.</span>"); return; }
      render();
    } else if (btn.dataset.act === "del") {
      if (!confirm("리뷰를 삭제하시겠습니까?")) return;
      await sb.from("reviews").delete().eq("id", id);
      render();
    } else if (btn.dataset.act === "edit") {
      const cur = li.querySelector("p").textContent;
      const text = prompt("리뷰 내용을 수정하세요. (10~1000자)", cur);
      if (text === null) return;
      if (text.trim().length < 10) { alert("10자 이상 입력해 주세요."); return; }
      await sb.from("reviews").update({ content: text.trim() }).eq("id", id);
      render();
    }
  };

  await render();
  if (!dlg.open) dlg.showModal();
}

/** 열린 카드의 평점 표시를 갱신 */
function refreshCardRating(id) {
  document.querySelectorAll(`.card[data-id="${id}"] .card-rating`).forEach((el) => {
    el.outerHTML = ratingLine(id);
  });
}

/* =========================================================
   쇼핑 상담 챗봇 위젯 (모든 페이지 우측 하단)
   답변은 Edge Function `chat` (Claude API)에서 받아 옵니다.
   ========================================================= */
(function () {
  if (typeof Auth === "undefined") return;

  const HISTORY_KEY = "aperture_chat";
  const GREETING = "안녕하세요, APERTURE 상담 챗봇입니다. 상품 추천이나 배송·환불·결제가 궁금하시면 편하게 물어보세요.";
  const SUGGEST = ["입문용 카메라 추천해줘", "100만원대 렌즈 보여줘", "환불은 어떻게 해요?", "배송비가 있나요?"];

  const e = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* 마크다운 링크 [텍스트](product.html?id=...) 만 링크로 바꾸고 나머지는 이스케이프 */
  function format(text) {
    return e(text).replace(/\[([^\]]+)\]\(((?:product|orders|cart|cameras|lenses|accessories)\.html(?:\?id=[\w-]+)?)\)/g,
      '<a href="$2">$1</a>').replace(/\n/g, "<br>");
  }

  let history = [];
  try { history = JSON.parse(sessionStorage.getItem(HISTORY_KEY)) || []; } catch (err) {}
  let busy = false;

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.createElement("div");
    root.className = "chatbot";
    root.innerHTML = `
      <button type="button" class="cb-fab" aria-label="상담 챗봇 열기">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>
      </button>
      <section class="cb-panel" role="dialog" aria-label="상담 챗봇" hidden>
        <header><b>APERTURE 상담</b><button type="button" class="cb-close" aria-label="닫기">×</button></header>
        <div class="cb-log" aria-live="polite"></div>
        <div class="cb-suggest"></div>
        <form class="cb-form">
          <input type="text" maxlength="500" placeholder="궁금한 점을 입력하세요" aria-label="메시지" autocomplete="off">
          <button type="submit">보내기</button>
        </form>
      </section>`;
    document.body.appendChild(root);

    const panel = root.querySelector(".cb-panel");
    const log = root.querySelector(".cb-log");
    const input = root.querySelector("input");
    const suggest = root.querySelector(".cb-suggest");

    function add(role, text, extra = "") {
      const d = document.createElement("div");
      d.className = `cb-msg ${role} ${extra}`;
      d.innerHTML = role === "bot" ? format(text) : e(text);
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    }

    function renderAll() {
      log.innerHTML = "";
      add("bot", GREETING);
      history.forEach((m) => add(m.role === "user" ? "user" : "bot", m.content));
      suggest.hidden = history.length > 0;
    }
    suggest.innerHTML = SUGGEST.map((s) => `<button type="button">${e(s)}</button>`).join("");

    async function send(text) {
      text = text.trim();
      if (!text || busy) return;
      busy = true;
      suggest.hidden = true;
      history.push({ role: "user", content: text });
      add("user", text);
      const wait = add("bot", "답변을 작성하고 있어요...", "wait");
      try {
        const { reply } = await Auth.call("chat", { messages: history.slice(-12) });
        wait.remove();
        history.push({ role: "assistant", content: reply });
        add("bot", reply);
      } catch (err) {
        wait.remove();
        history.pop(); // 실패한 질문은 기록에서 제외
        const net = /Edge Function|fetch/i.test(err.message || "");
        add("bot", net || !err.message ? "챗봇 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." : err.message, "err");
      } finally {
        busy = false;
        try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-20))); } catch (err) {}
      }
    }

    root.querySelector(".cb-fab").addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) { renderAll(); input.focus(); }
    });
    root.querySelector(".cb-close").addEventListener("click", () => (panel.hidden = true));
    root.querySelector(".cb-form").addEventListener("submit", (ev) => { ev.preventDefault(); const t = input.value; input.value = ""; send(t); });
    suggest.addEventListener("click", (ev) => { const b = ev.target.closest("button"); if (b) send(b.textContent); });
  });
})();

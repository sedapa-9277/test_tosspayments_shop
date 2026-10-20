/* =========================================================
   로그인 / 회원가입 페이지 (login.html, signup.html)
   ========================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  const isSignup = document.body.dataset.page === "signup";
  const form = document.getElementById("authForm");
  const msg = document.getElementById("authMsg");
  const btn = form.querySelector("button[type=submit]");

  // 내부 페이지로만 돌아가게 제한 (오픈 리다이렉트 방지)
  const nextRaw = new URLSearchParams(location.search).get("next") || "index.html";
  const next = /^[\w.-]+\.html(\?[\w=&%.-]*)?$/.test(nextRaw) ? nextRaw : "index.html";
  document.querySelectorAll("[data-keep-next]").forEach((a) => (a.href += `?next=${encodeURIComponent(next)}`));

  if (await Auth.user()) { location.replace(next); return; }

  const show = (t, ok) => { msg.textContent = t; msg.className = "auth-msg" + (ok ? " ok" : ""); };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    show("");
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show("올바른 이메일을 입력해 주세요.");
    if (password.length < 8) return show("비밀번호는 8자 이상이어야 합니다.");

    btn.disabled = true;
    try {
      if (isSignup) {
        const name = form.userName.value.trim();
        if (name.length < 2) return show("이름을 2자 이상 입력해 주세요.");
        if (form.password2.value !== password) return show("비밀번호 확인이 일치하지 않습니다.");
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
        if (error) return show(/registered|already/i.test(error.message) ? "이미 가입된 이메일입니다." : error.message);
        // 이미 가입된 이메일은 identities 가 비어 돌아온다
        if (data.user && data.user.identities && !data.user.identities.length) return show("이미 가입된 이메일입니다.");
        if (data.session) location.href = next;
        else show("가입 확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.", true);
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) return show(/confirm/i.test(error.message) ? "이메일 인증을 완료해 주세요." : "이메일 또는 비밀번호가 올바르지 않습니다.");
        location.href = next;
      }
    } finally {
      btn.disabled = false;
    }
  });
});

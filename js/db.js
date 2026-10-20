/* =========================================================
   Supabase 연결: 클라이언트, 인증 도우미, 상품/평점 로딩
   로드 순서: supabase-js(CDN) → config.js → products.js → db.js → common.js
   ========================================================= */
const sb = window.supabase
  ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  : null;

/* ---------- 인증 ---------- */
const Auth = {
  async user() {
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    return data.session ? data.session.user : null;
  },
  /** 로그인이 필요한 페이지: 비회원이면 로그인 화면으로 보내고, 로그인 후 돌아온다 */
  async require() {
    const user = await this.user();
    if (!user) {
      const back = location.pathname.split("/").pop() + location.search;
      location.replace(`login.html?next=${encodeURIComponent(back)}`);
      return null;
    }
    return user;
  },
  name(user) {
    return (user && user.user_metadata && user.user_metadata.name) || (user && user.email) || "";
  },
  /** Edge Function 호출 (로그인 토큰이 자동으로 붙는다) */
  async call(fn, body) {
    const { data, error } = await sb.functions.invoke(fn, { body });
    if (error) {
      let msg = error.message;
      try { const j = await error.context.json(); if (j && j.error) msg = j.error; } catch (e) {}
      throw new Error(msg);
    }
    if (data && data.error) throw new Error(data.error);
    return data;
  },
};

/* ---------- 상품 / 평점 ---------- */
const reviewStats = {}; // product_id → { avg, count }

/** DB의 상품으로 PRODUCTS 를 교체한다. 실패하면 products.js 의 기본 데이터를 그대로 쓴다. */
const productsReady = (async () => {
  if (!sb) return;
  try {
    const [prod, rev] = await Promise.all([
      sb.from("products").select("*").order("sort_order"),
      sb.from("reviews").select("product_id,rating"),
    ]);
    if (!prod.error && prod.data && prod.data.length) {
      PRODUCTS.length = 0;
      prod.data.forEach((p) => PRODUCTS.push({
        id: p.id, category: p.category, art: p.art, name: p.name, sub: p.sub,
        price: p.price, badge: p.badge || undefined, tags: p.tags, specs: p.specs,
      }));
    }
    if (!rev.error && rev.data) {
      const sums = {};
      rev.data.forEach((r) => {
        const s = (sums[r.product_id] = sums[r.product_id] || { sum: 0, count: 0 });
        s.sum += r.rating; s.count++;
      });
      Object.entries(sums).forEach(([id, s]) => (reviewStats[id] = { avg: s.sum / s.count, count: s.count }));
    }
  } catch (e) {
    console.error("상품 데이터를 불러오지 못했습니다.", e);
  }
})();

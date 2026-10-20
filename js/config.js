/**
 * 외부 서비스 설정 (프론트엔드에 공개되어도 되는 값만 둡니다)
 *
 * 토스페이먼츠
 * - 아래 키는 토스페이먼츠 문서에 공개된 결제위젯 테스트용 클라이언트 키입니다.
 * - 실제 서비스에서는 개발자센터(https://developers.tosspayments.com/my/api-keys)에서
 *   발급받은 본인의 위젯 클라이언트 키(test_gck_... / live_gck_...)로 교체하세요.
 * - 시크릿 키는 절대 프론트엔드 코드에 넣지 마세요. (Edge Function 환경변수 TOSS_SECRET_KEY)
 *
 * Supabase
 * - anon(공개) 키만 사용합니다. service_role 키는 절대 넣지 마세요.
 */
const TOSS_CONFIG = {
  clientKey: "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm",
};

const SUPABASE_CONFIG = {
  url: "https://slgiczbxvmgvtookcplp.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZ2ljemJ4dm1ndnRvb2tjcGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NTY5NzYsImV4cCI6MjEwODAzMjk3Nn0.JmlDm_aSD-8KdpYAv0yLOasAZJLT4HD17JiBlF8M7N0",
};

/**
 * 토스페이먼츠 설정
 * - 아래 키는 토스페이먼츠 문서에 공개된 결제위젯 테스트용 클라이언트 키입니다.
 * - 실제 서비스에서는 개발자센터(https://developers.tosspayments.com/my/api-keys)에서
 *   발급받은 본인의 위젯 클라이언트 키(test_gck_... / live_gck_...)로 교체하세요.
 * - 시크릿 키는 절대 프론트엔드 코드에 넣지 마세요. (결제 승인 API는 서버에서 호출)
 */
const TOSS_CONFIG = {
  clientKey: "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm",
};

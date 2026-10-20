# APERTURE — 카메라 쇼핑몰 (토스페이먼츠 연동)

HTML / CSS / JavaScript로 만든 카메라 쇼핑몰 퍼블리싱입니다. 토스페이먼츠 결제위젯(SDK v2)으로 결제까지 연동되어 있습니다.

## 페이지

| 파일 | 설명 |
| --- | --- |
| `index.html` | 메인 (히어로, 카테고리, 베스트 상품) |
| `cameras.html` | 카메라 본체 상품 |
| `lenses.html` | 렌즈 상품 |
| `accessories.html` | 기타 액세서리 상품 |
| `cart.html` | 장바구니 (localStorage) |
| `checkout.html` | 주문서 + 토스페이먼츠 결제위젯 |
| `success.html` / `fail.html` | 결제 성공 / 실패 |

## 실행

결제 후 돌아올 URL이 필요하므로 `file://`이 아닌 로컬 서버로 열어야 합니다.

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

http://localhost:5500 접속. (Node나 Python이 있으면 `npx serve` / `python -m http.server 5500`도 됩니다.)

## 토스페이먼츠 설정

- `js/config.js`의 `clientKey`는 토스페이먼츠 문서에 공개된 **테스트용** 위젯 클라이언트 키입니다. 실제 결제는 일어나지 않습니다.
- 운영 시 [개발자센터](https://developers.tosspayments.com/my/api-keys)에서 발급받은 본인 키로 교체하세요.
- `success.html`에 도착한 시점은 **결제 인증** 완료 상태입니다. 결제를 확정하려면 서버에서 10분 이내에 결제 승인 API를 호출해야 합니다.

```
POST https://api.tosspayments.com/v1/payments/confirm
Authorization: Basic base64("{시크릿키}:")
Content-Type: application/json

{ "paymentKey": "...", "orderId": "...", "amount": 89000 }
```

시크릿 키는 절대 프론트엔드 코드나 저장소에 올리지 마세요.

## 참고

- 브랜드명, 상품명, 상품 이미지(SVG 일러스트)는 모두 예시용입니다.
- `.mcp.json`: Claude Code용 토스페이먼츠 연동 가이드 MCP 설정

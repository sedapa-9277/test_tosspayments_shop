# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

순수 HTML / CSS / JavaScript로 만든 카메라 쇼핑몰 퍼블리싱입니다. 토스페이먼츠 결제위젯(SDK v2)으로 결제를 연동했습니다. 빌드 도구, 패키지 매니저, 린터, 테스트는 없고, 서버 측 코드도 없습니다.

- 디자인은 니콘 홈페이지 스타일(검정 헤더, 노란색 `#ffe100` 포인트)을 **참고만** 했습니다. 브랜드명(APERTURE)과 상품명(APX, AX, LB-15 등)은 모두 가상입니다. 실제 니콘 상표, 로고, 제품명은 쓰지 않습니다.
- 화면 문구는 한국어입니다.

## 실행

결제 후 토스가 `successUrl` / `failUrl`(절대 URL)로 리다이렉트하므로 `file://`로 열면 결제가 동작하지 않습니다. 반드시 HTTP로 서빙하세요.

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

- http://localhost:5500 에서 열립니다. `-Port`로 포트를 바꿀 수 있습니다.
- Claude 브라우저 미리보기: `.claude/launch.json`의 `camera-shop` 설정을 쓰세요.
- 이 PC에는 Node.js와 Python이 없습니다(`python`은 Microsoft Store 스텁). 그래서 정적 서버를 PowerShell `HttpListener`(`serve.ps1`)로 만들었습니다.
- Git은 `C:\Program Files\Git\cmd\git.exe`에 있습니다. 설치 전에 시작된 셸에서는 PATH에 없을 수 있으니 전체 경로로 호출하세요. 원격 저장소는 `origin` = https://github.com/sedapa-9277/test_tosspayments_shop.git (`main`)입니다.

## 구조

### 스크립트 로드 순서와 페이지 초기화

모든 페이지는 `js/products.js` → `js/common.js` → 페이지 전용 스크립트 순서로 불러옵니다. `js/config.js`(토스 클라이언트 키)는 `checkout.html`에서만 불러옵니다.

- `common.js`는 `DOMContentLoaded`에서 `#header`, `#footer` 자리표시자를 `outerHTML`로 교체합니다. 장바구니 배지와 토스트도 이 함수가 만듭니다. 페이지 스크립트도 `DOMContentLoaded`에 등록되는데, 등록 순서상 헤더/푸터가 먼저 그려집니다.
- `<body data-page="...">` 값으로 현재 메뉴 표시와 동작이 정해집니다. 값: `home`, `camera`, `lens`, `accessory`, `cart`, `checkout`, `success`, `fail`
- 카테고리 페이지 3개(`cameras.html`, `lenses.html`, `accessories.html`)는 구조가 같고 모두 `js/shop.js`를 씁니다. `shop.js`는 `data-page`로 `PRODUCTS`를 걸러 필터, 정렬, 카드 목록을 그립니다. 앞의 두 파일은 `cameras.html`을 복사해 만든 것이므로, 공통 마크업을 고칠 때는 세 파일을 함께 고치세요.
- `success.html`과 `fail.html`은 둘 다 `js/result.js` 하나를 쓰고, `data-page`로 분기합니다.

### 상품 데이터와 이미지

- 상품은 `js/products.js`의 `PRODUCTS` 배열에 있습니다. `category`는 `camera`, `lens`, `accessory` 중 하나입니다. `tags`로 필터 체크박스가 자동 생성됩니다.
- 이미지 파일은 없습니다. 각 상품의 `art` 키에 맞춰 `common.js`의 `productArt(type)`가 인라인 SVG를 그립니다(`switch` 문). 새 `art` 값을 추가하면 이 `switch`에도 분기를 추가해야 합니다. 같은 페이지에 SVG가 여러 개 들어가므로 그라디언트 id에는 `artUid`로 고유 접두어를 붙입니다.
- 상품 카드는 `productCard(p)`가 만듭니다. 담기/바로구매 버튼은 `bindCardActions(root)`로 이벤트를 위임해 처리합니다.

### 저장소 키 (페이지 간 상태)

| 키 | 저장소 | 쓰는 곳 → 읽는 곳 |
| --- | --- | --- |
| `aperture_cart` / `aperture_cart_{회원id}` | localStorage | `Cart` 객체 (`common.js`). 비회원과 회원별로 분리 |
| `aperture_buynow` | sessionStorage | 바로구매 → `checkout.html?mode=buynow` |
| `aperture_pending_order` | sessionStorage | `checkout.js`가 `requestPayment` 직전에 저장 → `result.js`가 읽음 |

`result.js`는 `aperture_pending_order`를 보고 리다이렉트된 `amount`가 주문 금액과 같은지 확인합니다. 주문이 완료되면 장바구니(또는 바로구매)를 한 번만 비우고 `done: true`로 표시해, 새로고침해도 다시 비우지 않습니다.

### 토스페이먼츠 결제 흐름 (`js/checkout.js`)

1. `TossPayments(clientKey).widgets({ customerKey: TossPayments.ANONYMOUS })`
2. `widgets.setAmount()`를 **먼저** 호출한 뒤 `renderPaymentMethods("#payment-method")`와 `renderAgreement("#agreement")`를 호출합니다.
3. `widgets.requestPayment({ orderId, orderName, successUrl, failUrl, ... })`는 리다이렉트 방식입니다. URL은 `new URL("success.html", location.href)`로 만들어 하위 경로에서도 동작합니다. `orderId`는 `APT-{timestamp}-{rand}` 형식이고 6~64자입니다.
4. 성공 리다이렉트 쿼리는 `paymentKey`, `orderId`, `amount`, `paymentType`이고, 실패 리다이렉트 쿼리는 `code`, `message`, `orderId`입니다.

주의할 점:
- `success.html`에 도착한 시점은 **결제 인증까지만** 완료된 상태입니다. 결제를 확정하려면 서버에서 10분 이내에 `POST https://api.tosspayments.com/v1/payments/confirm`을 시크릿 키로 호출해야 하는데, 이 부분은 구현하지 않았습니다(퍼블리싱 범위).
- `js/config.js`의 키는 토스 문서에 공개된 테스트 키(`test_gck_docs_...`)입니다. 시크릿 키는 프론트엔드에 넣지 않습니다.
- 위젯 쪽 입력 오류(카드사 미선택, 할부 미선택 등)가 있으면 `requestPayment`가 예외를 던집니다. 이 예외는 `checkout.js`의 `catch`에서 처리합니다.
- 샌드박스에서는 기본으로 선택되는 퀵계좌이체가 금액이 크면 한도 초과(`TOSS_QUICK_PAY_AMOUNT_LIMIT_EXCEEDED...`)로 실패합니다. 카드 결제로 테스트하세요.
- 이름 입력 필드의 id/name은 `buyerName`입니다. `name`으로 하면 `HTMLFormElement.name` 속성과 충돌하므로 바꾸지 마세요.

### CSS (`css/style.css`)

- 단일 파일입니다. 색상과 레이아웃 값은 `:root` 변수(`--yellow`, `--black`, `--gray-*`, `--header-h` 등)로 관리합니다.
- 반응형 구간은 `1100px`, `960px`(햄버거 메뉴로 전환, 필터 접힘), `600px`(1열)입니다.
- 모바일 메뉴(`.gnb`)는 닫혀 있을 때 `visibility: hidden`입니다. `transform`만으로 숨기면 상단 유틸바를 덮어 버립니다.

## 기타

- `.mcp.json`에 토스페이먼츠 연동 가이드 MCP 서버(`@tosspayments/integration-guide-mcp`)가 설정되어 있습니다. `npx`로 실행되므로 Node.js를 설치해야 동작합니다.
- 이 PC에는 `claude` CLI가 없어 `claude plugin ...` 명령을 쓸 수 없습니다. 플러그인은 앱의 Customize → Plugins에서 설치합니다. `claude-md-management`는 설치되어 있습니다.

## Supabase 연동 (`PRD.md`)

프로젝트 `aperture-shop`(ref `slgiczbxvmgvtookcplp`, ap-northeast-2)에 구현되어 있습니다. 스크립트 로드 순서는 supabase-js(CDN) → `config.js` → `products.js` → `db.js` → `common.js` → `reviews.js` → 페이지 스크립트입니다.

- `js/db.js`: `sb`(클라이언트), `Auth`(user/require/call), `productsReady`(DB 상품으로 `PRODUCTS` 교체 + 평점 로드). 페이지 스크립트는 시작할 때 `await productsReady` 합니다. `products.js`는 DB 실패 시 쓰는 기본 데이터입니다.
- 테이블: `products`, `orders`, `order_items`, `reviews`, `review_likes` (RLS 적용). 주문 쓰기는 프론트에서 불가, Edge Function(service_role)만 가능합니다. `has_purchased(pid)` RPC가 리뷰 작성 자격(결제완료 구매)을 판정합니다.
- Edge Function(모두 `verify_jwt`): `create-order`(서버가 가격으로 금액 계산), `confirm-payment`(금액 검증 후 토스 승인, `fail: true`면 결제실패 기록), `cancel-order`(토스 취소). 소스는 저장소에 없고 Supabase에 배포되어 있습니다. 토스 시크릿 키는 함수 환경변수 `TOSS_SECRET_KEY`이며, 없으면 토스 공개 테스트 키를 씁니다.
- 상품 상세: `product.html?id=`(`product.js`). 설명/특징/스펙표는 `products.detail`(jsonb: summary, highlights, specs)에서 읽고, 카드 이미지·이름이 이 페이지로 링크됩니다.
- 새 페이지: `login.html`, `signup.html`(`auth.js`), `orders.html`(`orders.js`). 구매는 로그인 필수(`Auth.require()`), 로그인 후 `?next=`로 복귀합니다.
- 저장소 키 `aperture_pending_order`는 이제 `{orderId, isBuyNow, done}`만 담습니다.
- 주의: Supabase 기본 설정은 이메일 인증이 켜져 있고 `example.com` 같은 도메인은 가입이 거부됩니다. PRD 기본안(인증 없음)대로 하려면 대시보드 Authentication → Providers → Email에서 "Confirm email"을 끄세요.
- 프론트에는 `anon` 키만 `js/config.js`에 둡니다. `service_role` 키와 토스 시크릿 키는 넣지 않습니다.

## 챗봇 (`js/chatbot.js`)

- 모든 페이지 우측 하단에 뜨는 상담 위젯입니다(`reviews.js` 다음에 로드). 대화 기록은 sessionStorage `aperture_chat`에 저장합니다.
- 답변은 Edge Function `chat`(소스: `supabase/functions/chat/index.ts`)이 OpenAI API로 만듭니다. 상품 목록은 DB에서 읽어 시스템 프롬프트에 넣고, 배송·환불·결제 안내문도 이 파일의 `POLICY`에 있습니다. 정책이 바뀌면 이 상수를 고치고 재배포하세요.
- 필요한 시크릿: `OPENAI_API_KEY`(Supabase Edge Functions → Secrets). 없으면 함수가 503을 돌려주고 위젯은 연결 오류 문구를 보여 줍니다. 모델은 `CHAT_MODEL`(기본 `gpt-4o-mini`).
- 사용량 제한(레이트 리밋)은 아직 없습니다. 공개 배포 전에 추가하세요.

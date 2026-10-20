/**
 * 상품 데이터
 * category: camera | lens | accessory
 * art: 상품 일러스트 종류 (common.js 의 productArt 참고)
 */
const PRODUCTS = [
  /* ---------- 카메라 본체 ---------- */
  {
    id: "cam-z9x", category: "camera", art: "camera-pro",
    name: "APX X9", sub: "플래그십 미러리스",
    price: 6890000, badge: "NEW", tags: ["풀프레임", "프로"],
    specs: ["4,571만 화소 적층형 센서", "초당 120연사", "8K 60p 동영상"],
  },
  {
    id: "cam-z8", category: "camera", art: "camera-pro",
    name: "APX X8", sub: "하이엔드 미러리스",
    price: 4990000, badge: "BEST", tags: ["풀프레임", "프로"],
    specs: ["4,571만 화소", "피사체 인식 AF", "8K 30p 동영상"],
  },
  {
    id: "cam-z6", category: "camera", art: "camera",
    name: "APX X6 III", sub: "올라운드 미러리스",
    price: 3290000, tags: ["풀프레임"],
    specs: ["2,450만 화소 부분 적층형", "6K 60p RAW", "5축 손떨림 보정"],
  },
  {
    id: "cam-z5", category: "camera", art: "camera",
    name: "APX X5 II", sub: "엔트리 풀프레임",
    price: 2190000, tags: ["풀프레임", "입문"],
    specs: ["2,450만 화소", "저조도 AF -10EV", "듀얼 SD 슬롯"],
  },
  {
    id: "cam-zf", category: "camera", art: "camera-retro",
    name: "APX XR", sub: "헤리티지 디자인",
    price: 2790000, badge: "HOT", tags: ["풀프레임", "클래식"],
    specs: ["클래식 다이얼 조작계", "흑백 전용 모드", "2,450만 화소"],
  },
  {
    id: "cam-z50", category: "camera", art: "camera-compact",
    name: "APX X50 II", sub: "APS-C 미러리스",
    price: 1290000, tags: ["APS-C", "입문"],
    specs: ["2,088만 화소", "4K 60p", "가변형 모니터"],
  },
  {
    id: "cam-zfc", category: "camera", art: "camera-retro",
    name: "APX XC", sub: "APS-C 클래식",
    price: 1090000, tags: ["APS-C", "클래식"],
    specs: ["필름 카메라 감성 디자인", "4K 30p", "셀피 모니터"],
  },
  {
    id: "cam-d850", category: "camera", art: "camera-dslr",
    name: "APX D85", sub: "DSLR 풀프레임",
    price: 3590000, tags: ["풀프레임", "DSLR"],
    specs: ["4,575만 화소", "광학 뷰파인더", "초당 9연사"],
  },

  /* ---------- 렌즈 ---------- */
  {
    id: "lens-2470", category: "lens", art: "lens-zoom",
    name: "AX 24-70mm F2.8 PRO II", sub: "표준 줌",
    price: 3190000, badge: "NEW", tags: ["줌", "풀프레임"],
    specs: ["F2.8 고정 조리개", "경량 675g", "나노 반사방지 코팅"],
  },
  {
    id: "lens-70200", category: "lens", art: "lens-tele",
    name: "AX 70-200mm F2.8 OS PRO", sub: "망원 줌",
    price: 3490000, badge: "BEST", tags: ["줌", "망원", "풀프레임"],
    specs: ["5.5단 손떨림 보정", "방진 방적", "빠르고 정숙한 AF"],
  },
  {
    id: "lens-1430", category: "lens", art: "lens-wide",
    name: "AX 14-30mm F4 PRO", sub: "광각 줌",
    price: 1690000, tags: ["줌", "광각", "풀프레임"],
    specs: ["82mm 필터 장착 가능", "485g 경량", "풍경·건축 최적"],
  },
  {
    id: "lens-50", category: "lens", art: "lens-prime",
    name: "AX 50mm F1.8 PRO", sub: "표준 단렌즈",
    price: 690000, tags: ["단렌즈", "풀프레임"],
    specs: ["F1.8 밝은 조리개", "선명한 보케", "415g"],
  },
  {
    id: "lens-85", category: "lens", art: "lens-prime",
    name: "AX 85mm F1.2 PRO", sub: "인물 단렌즈",
    price: 3290000, badge: "HOT", tags: ["단렌즈", "풀프레임"],
    specs: ["F1.2 초대구경", "인물 사진 특화", "멀티 포커싱"],
  },
  {
    id: "lens-105", category: "lens", art: "lens-macro",
    name: "AX Macro 105mm F2.8 OS", sub: "매크로",
    price: 1390000, tags: ["단렌즈", "매크로", "풀프레임"],
    specs: ["1:1 등배 촬영", "손떨림 보정", "정밀 근접 촬영"],
  },
  {
    id: "lens-180600", category: "lens", art: "lens-tele",
    name: "AX 180-600mm F5.6-6.3 OS", sub: "초망원 줌",
    price: 2190000, tags: ["줌", "망원", "풀프레임"],
    specs: ["600mm 초망원", "야생·스포츠", "내부 줌 방식"],
  },
  {
    id: "lens-dx1650", category: "lens", art: "lens-pancake",
    name: "AX DC 16-50mm F3.5-6.3 OS", sub: "APS-C 표준 줌",
    price: 390000, tags: ["줌", "APS-C"],
    specs: ["초경량 135g", "침동식 구조", "손떨림 보정"],
  },

  /* ---------- 기타 부수물건 ---------- */
  {
    id: "acc-battery", category: "accessory", art: "battery",
    name: "LB-15 배터리", sub: "충전식 리튬이온",
    price: 89000, badge: "BEST", tags: ["배터리·충전"],
    specs: ["USB-C 충전 지원", "2,280mAh", "APX X 시리즈 호환"],
  },
  {
    id: "acc-charger", category: "accessory", art: "charger",
    name: "LC-25 듀얼 충전기", sub: "듀얼 충전",
    price: 69000, tags: ["배터리·충전"],
    specs: ["2시간 35분 완충", "LED 상태 표시", "프리볼트"],
  },
  {
    id: "acc-sd", category: "accessory", art: "card",
    name: "CFexpress Type B 256GB", sub: "메모리 카드",
    price: 329000, badge: "NEW", tags: ["메모리"],
    specs: ["읽기 1,700MB/s", "8K 녹화 지원", "내충격 설계"],
  },
  {
    id: "acc-strap", category: "accessory", art: "strap",
    name: "레더 넥 스트랩", sub: "천연 가죽",
    price: 59000, tags: ["스트랩·가방"],
    specs: ["이탈리아 소가죽", "길이 조절", "퀵 릴리즈"],
  },
  {
    id: "acc-bag", category: "accessory", art: "bag",
    name: "프로 숄더백 M", sub: "카메라 가방",
    price: 189000, tags: ["스트랩·가방"],
    specs: ["바디+렌즈 3개 수납", "생활 방수", "13인치 노트북 칸"],
  },
  {
    id: "acc-tripod", category: "accessory", art: "tripod",
    name: "카본 트래블 삼각대", sub: "4단 카본",
    price: 349000, badge: "HOT", tags: ["삼각대"],
    specs: ["무게 1.3kg", "최대 하중 10kg", "볼헤드 포함"],
  },
  {
    id: "acc-flash", category: "accessory", art: "flash",
    name: "SL-700 스피드라이트", sub: "외장 플래시",
    price: 429000, tags: ["조명"],
    specs: ["가이드 넘버 28", "무선 TTL", "바운스·스윙"],
  },
  {
    id: "acc-filter", category: "accessory", art: "filter",
    name: "CLEARPRO 보호 필터 77mm", sub: "렌즈 필터",
    price: 99000, tags: ["필터"],
    specs: ["반사율 0.1%", "발수·발유 코팅", "슬림 프레임"],
  },
];

const CATEGORY_META = {
  camera: { label: "카메라 본체", en: "CAMERAS", page: "cameras.html" },
  lens: { label: "렌즈", en: "LENSES", page: "lenses.html" },
  accessory: { label: "기타 액세서리", en: "ACCESSORIES", page: "accessories.html" },
};

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

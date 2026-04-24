## 청약 공고 알리미 (독립형 MVP)

PRD 기준으로 먼저 독립 실행 가능한 사이트로 구성한 버전입니다.

### 포함 기능

- 지역/월 기준 청약 공고 조회
- 체크박스 필터(공급유형, 주거형태, 청약상태)
- 청약 카드 UI + 청약홈 이동 버튼
- 카드별 네이버 블로그 상위 3건 lazy-load
- 서버 프록시 API 2종
  - `GET /api/cheongyak`
  - `GET /api/blog-search`

### 실행 방법

```bash
npm install
cp .env.example .env.local
npm run dev
```

### 환경 변수

- `PUBLIC_DATA_SERVICE_KEY`: 공공데이터포털 일반 인증키
- `PUBLIC_DATA_API_URLS`: 공공데이터 API 엔드포인트 2개를 콤마(`,`)로 연결
  - 예: `https://api.odcloud.kr/api/...1,https://api.odcloud.kr/api/...2`
- `PUBLIC_DATA_EXTRA_QUERY`(선택): API 공통 쿼리 파라미터
- `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`: 네이버 검색 API 인증값

### 단계별 적용 전략

1. 현재 저장소의 `cheongyak-alert`를 독립 사이트로 완성도 검증
2. 검증 후 기존 "우리동네 혜택 알리미"에 `청약 공고` 탭으로 라우팅 통합

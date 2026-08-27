# Weather Activity Dashboard

Vue 3 수업에서 실습한 문법, Composition API, Component, Vue Router, Pinia, Axios, UI Library를 하나의 날씨 대시보드에 단계적으로 적용한 프로젝트입니다.

기본 날씨 정보 조회에서 더 나아가, 사용자가 선호하는 기온·풍속·강수 기준을 반영해 러닝, 산책, 자전거, 빨래, 피크닉, 실내 활동의 적합도를 계산하도록 Customization했습니다.

## 주요 기능

- 서울, 안성, 대전, 대구, 광주, 부산, 판교, 제주의 실시간 날씨
- OpenWeather Geocoding API를 이용한 대한민국 도시 검색
- `강릉` 같이 `시·군·구`가 생략된 한국 지명 검색 보정
- 고정 도시와 검색 도시의 상세 날씨 라우팅
- 섭씨/화씨 단위 전환
- 선호 기온, 허용 풍속, 비 감점 여부 설정
- 날씨와 사용자 설정을 결합한 활동 적합도 계산
- 활동별 점수 산정 근거 상세 페이지
- Element Plus를 활용한 로딩, 오류, 빈 결과, Progress UI

## 기술 스택

Vue 3, Composition API, Vue Router, Pinia, Axios, Element Plus, Vite, ESLint, Prettier, OpenWeather API, Vercel

## 실행 방법

```sh
npm install
```

`.env.example`을 참고해 `package.json`과 같은 위치에 `.env.local`을 생성합니다.

```env
VITE_OPENWEATHER_API_KEY=YOUR_API_KEY
```

```sh
npm run dev
```

## 품질 검사와 빌드

```sh
npx eslint .
npx prettier --check src
npm run build
```

## 단원별 개인 Customization

### 1. Vue 문법과 날씨 Mockup

기본 예제의 3개 도시를 그대로 유지하지 않고 서울·안성·대전·대구·광주·부산·판교·제주 8개 도시로 확장했습니다.

- `v-for`와 `:key`로 도시 카드 반복 렌더링
- `v-if`, `v-else-if`, `v-else`로 로딩·오류·성공 상태 분기
- 입력값을 반응형 상태와 연결해 도시 필터링
- 카드 선택과 상세보기 이벤트 분리

도시 데이터를 `src/data/defaultCities.js`로 분리한 이유는 API 로직과 개인 데이터를 섞지 않고, 도시 추가 시 하나의 파일만 수정하기 위해서입니다.

### 2. Composition API

검색어, 날씨 배열, 선택 도시, 로딩 상태를 `ref`로 관리했습니다. 전체 데이터를 직접 변경하지 않고 `computed`로 검색 결과, 현재 선택 도시, 활동 추천 순위를 계산했습니다. `watch`는 검색어를 URL Query String과 동기화하고, `watchEffect`는 선택 도시에 따라 Browser 탭 제목을 자동 변경하는 데 사용했습니다.

온도 변환은 `useTemperature.js`, 활동 점수는 `useActivityScore.js`로 분리했습니다. 메인과 상세 화면이 동일한 계산 기준을 재사용하기 위한 선택입니다.

### 3. Component

기본 Component에 다음 개인 Component를 추가했습니다.

- `UnitToggler`: 온도 단위 전환
- `ActivityPreferencePanel`: 사용자의 활동 판단 기준 입력
- `ActivityScoreCard`: 활동별 점수, Progress, 상세 이동 표시

`ActivityScoreCard`는 Props로 점수 객체를 받고, `view-detail` Emits로 부모에 상세 이동을 요청합니다. 데이터는 부모가 자식에게 내리고 사용자 이벤트는 자식이 부모에게 올리는 Vue Component 통신 방식을 적용했습니다.

### 4. Vue Router

- `/weather/:cityId`: 고정 도시와 Geocoding 검색 도시 상세
- `/activity/:activityId`: 활동별 점수 산정 근거
- Catch-all Route: 잘못된 경로를 404로 전환

검색 도시는 `geo_위도_경도`를 동적 ID로 사용했습니다. 상세 화면을 새로고침해도 ID에서 좌표를 해석해 API를 다시 호출하기 위한 구조입니다.

### 5. Pinia

기본 `configStore`의 온도 단위 설정 외에 `activityStore`를 추가했습니다.

- State: 선호 최저/최고 기온, 비 감점 여부, 허용 풍속
- Getter: 선호 기온 범위 문구
- Action: 선호 기온 범위와 풍속 수정

메인과 활동 상세 화면이 같은 기준을 공유하고, 설정이 바뀌면 `computed`가 자동으로 추천 점수를 다시 계산합니다.

### 6. Axios와 외부 API

Current Weather API에 Geocoding API를 추가했습니다.

1. 도시명을 Geocoding API에 전달
2. 위도·경도 확보
3. 좌표로 Current Weather API 호출
4. API 응답을 공통 날씨 객체로 변환

OpenWeather가 `강릉`대신 `강릉시`를 인식하는 사례를 고려해, 시·군·구를 생략하면 후보 검색어를 만들어 조회하도록 보정했습니다.

기본 도시 8개는 `Promise.allSettled()`로 요청합니다. 하나의 도시가 실패해도 성공한 도시를 표시하기 위해 `Promise.all()` 대신 선택했습니다.

### 7. 날씨 활동 추천 알고리즘

흔한 날씨 조회 기능과 차별화하기 위해 API 데이터를 활동 의사결정에 사용했습니다.

- 기온이 선호 범위를 벗어나면 거리에 비례해 감점
- 활동별 습도·풍속 기준 초과 시 감점
- 비·눈·뇌우 상태에서 야외 활동 감점
- 야외 조건이 나쁘면 실내 활동 점수 상승
- 최종 점수를 0~100 범위로 제한하고 순위 정렬

감점 근거를 `breakdown`에 함께 저장해 상세 화면에서 결과가 나온 이유를 확인할 수 있게 했습니다.

### 8. Element Plus UI Library

버튼 하나만 바꾸지 않고 다음 Component를 상태와 입력 용도에 맞게 적용했습니다.

- `el-input`, `el-button`: 도시 검색
- `el-switch`: 온도 단위, 비 감점
- `el-slider`: 선호 기온과 풍속
- `el-progress`: 활동 적합도
- `el-alert`: API 오류
- `el-skeleton`: API 로딩
- `el-empty`: 검색 결과 없음

### 9. 품질 관리와 배포

- API Key를 `.env.local`에 저장하고 Git에 포함하지 않음
- `.env.example`에는 변수명과 예시 값만 기록
- ESLint, Prettier, Vite Production Build 검증
- Vercel 정적 Hosting과 Git Push 기반 자동 배포
- `vercel.json` Rewrite로 SPA 상세 URL 새로고침 지원

## AI 활용 내역

프로젝트를 직접 구현하는 과정에서 이해가 부족하거나 해결이 어려웠던 부분에 대해 AI의 도움을 받았습니다.

1. **개념 이해 보조**: Composition API, Props와 Emits, Pinia의 역할처럼 헷갈리는 Vue 개념을 질문하고 설명을 참고했습니다.
2. **오류 해결 도움**: import 경로, 환경변수 설정, Router 이동 등에서 오류가 발생했을 때 원인과 확인 방법을 안내받았습니다.
3. **API 검색 보정 조언**: OpenWeather에서 `강릉`과 `강릉시`의 검색 결과가 다르게 나타나는 문제를 설명하고 해결 방향에 대한 도움을 받았습니다.
4. **기능 아이디어 구체화**: 날씨 정보에 사용자 선호 기준을 결합해 활동 적합도를 보여 주는 아이디어를 구체화할 때 의견을 참고했습니다.
5. **코드 개선 조언**: 중복되는 로직을 Composable로 분리하고 Component, Store, View의 역할을 정리하는 방법에 대해 도움을 받았습니다.
6. **검토와 문서 작성 보조**: 작성한 코드의 오타와 구조를 점검하고, 프로젝트의 기능과 학습 내용을 README에 이해하기 쉽게 표현하는 데 도움을 받았습니다.

AI의 답변을 그대로 사용하기보다는 내용을 이해한 뒤 프로젝트에 필요한 부분만 직접 선택해 수정·적용했습니다. 최종 기능 구성, 코드 반영 및 실행 결과 확인은 직접 수행했으며, API Key와 같은 민감한 정보는 AI에 제공하거나 Git에 포함하지 않았습니다.


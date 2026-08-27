# Weather Dashboard 코드 학습 가이드

이 문서는 프로젝트 소개가 아니라 **Vue 코드가 어떻게 연결되고, 왜 이런 구조로 작성되었는지**를 익히기 위한 학습자용 가이드입니다.

## 1. 전체 데이터 흐름

```text
사용자 입력
  ↓
WeatherDashboard.vue
  ↓                   ↓
weatherApi.js          activityStore.js
  ↓                   ↓
OpenWeather API        사용자 선호 기준
  ↓                   ↓
날씨 객체 ──────→ useActivityScore.js
                          ↓
                    활동별 점수
                          ↓
                   ActivityScoreCard.vue
```

- Component: 화면 표시와 사용자 이벤트
- Service: 외부 API 요청과 응답 변환
- Store: 여러 화면이 공유하는 상태
- Composable: Vue 반응성을 포함한 재사용 로직
- View: Router가 표시하는 페이지 단위 Component

역할을 나누면 파일 하나가 너무 길어지지 않고, 같은 로직을 다른 화면에서 재사용할 수 있습니다.

## 2. Application 시작점

`src/main.js`의 역할은 Plugin을 등록하고 Vue를 HTML에 연결하는 것입니다.

```js
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
```

Plugin은 `mount()` 이전에 등록해야 하위 Component에서 사용할 수 있습니다.

## 3. `ref`, `computed`, `watch`

### `ref`: 변경되는 값

```js
const weatherList = ref([])
const isLoading = ref(false)
```

JavaScript 영역에서는 `.value`로 접근합니다.

```js
weatherList.value = await fetchWeatherList()
```

Template에서는 Vue가 자동으로 값을 꺼내므로 `.value`를 쓰지 않습니다.

### `computed`: 원본에서 계산한 값

```js
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(query))
})
```

원본 `weatherList`를 직접 줄이지 않기 때문에 검색어를 지우면 전체 목록이 다시 나옵니다. 의존하는 값이 바뀌면 Vue가 자동으로 다시 계산합니다.

### `watch`: 변경 후 작업

```js
watch(searchQuery, (value) => {
  router.replace({
    query: { ...route.query, search: value || undefined },
  })
})
```

`watch`는 값을 계산하기보다 상태 변경 후 URL 변경, 로그 작성, API 호출 같은 부수 효과를 실행할 때 사용합니다.

`watchEffect`는 콜백 안에서 사용한 반응형 값을 자동 추적합니다. 이 프로젝트에서는 선택 도시가 바뀌면 Browser 탭 제목을 자동으로 변경합니다.

## 4. Props와 Emits

Props는 부모에서 자식으로 데이터를 내립니다.

```js
const props = defineProps({
  recommendation: { type: Object, required: true },
})
```

```vue
<ActivityScoreCard :recommendation="recommendation" />
```

Emits는 자식에서 부모로 이벤트를 올립니다.

```js
const emit = defineEmits(['view-detail'])
```

```vue
<el-button @click="emit('view-detail', props.recommendation.id)">
  점수 산정 보기
</el-button>
```

자식 Component는 Router와 선택 도시 정보를 모두 알 필요가 없습니다. 사용자 이벤트만 알리고, 전체 상태를 아는 부모가 이동을 처리합니다.

## 5. Slot

```vue
<BaseDashboardCard>
  <template #title><h2>활동 추천 기준</h2></template>
  <ActivityPreferencePanel />
</BaseDashboardCard>
```

`BaseDashboardCard`는 테두리·배경·여백을 담당하고 내용은 Slot으로 받습니다. 같은 디자인을 검색, 날씨, 설정, 추천 영역에 반복해 작성할 필요가 없습니다.

## 6. Pinia Store

`src/stores/activityStore.js`에는 메인과 상세 화면이 공유할 설정이 있습니다.

```js
export const useActivityStore = defineStore('activity', () => {
  const preferredMinTemp = ref(15)
  const avoidRain = ref(true)

  function setPreferredRange([min, max]) {
    preferredMinTemp.value = min
    preferredMaxTemp.value = max
  }

  return { preferredMinTemp, avoidRain, setPreferredRange }
})
```

- State: 저장할 상태
- Getter/Computed: State로 계산한 값
- Action/Function: State를 변경하는 규칙

Store를 사용하면 페이지마다 같은 설정을 별도로 복사하지 않아도 됩니다.

## 7. Composable

```js
const { recommendations } = useActivityScore(activeCity)
```

Composable은 Vue 반응성을 포함한 로직을 재사용하는 함수입니다. `activeCity`나 Pinia 설정이 바뀌면 추천 결과가 자동으로 다시 계산됩니다.

`useActivityScore`를 Component에서 분리했기 때문에 메인과 `ActivityDetailView`가 동일한 점수 규칙을 사용합니다. `useTemperature`도 같은 이유로 재사용합니다.

## 8. Axios Service

Component에서 Axios를 직접 호출하지 않고 `src/services/weatherApi.js`에 모았습니다.

```js
const weatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5/weather',
  timeout: 7000,
})
```

API의 기본 주소와 Timeout을 공통 설정합니다. `normalizeWeather()`는 OpenWeather의 큰 응답을 Component에 필요한 공통 객체로 변환합니다.

### `Promise.allSettled()`

```js
const results = await Promise.allSettled(
  DEFAULT_CITIES.map(async (city) => {
    const data = await requestWeather(city)
    return normalizeWeather(city, data)
  }),
)
```

`Promise.all()`은 하나가 실패하면 전체가 실패합니다. 도시 8개는 서로 독립적이므로 `allSettled()`로 성공한 도시만 남깁니다.

## 9. 검색 도시의 동적 ID

고정 도시는 `city_01`, 검색 도시는 좌표를 포함한 ID를 사용합니다.

```js
id: `geo_${location.lat}_${location.lon}`
```

```text
geo_37.7525313_128.8759523
```

상세 페이지를 새로고침하면 메인 페이지의 검색 객체는 사라집니다. ID에서 위도·경도를 다시 해석해 API를 호출하면 새로고침 후에도 상세 날씨를 복구할 수 있습니다.

## 10. 활동 점수 계산

활동의 정적 규칙은 `src/data/activities.js`, 계산은 `src/composables/useActivityScore.js`에 있습니다.

```js
{
  id: 'cycling',
  label: '자전거',
  humidityLimit: 75,
  windLimit: 6,
  rainPenalty: 55,
}
```

야외 활동은 100점에서 부적합한 조건을 감점합니다.

```text
최종 점수
= 100
- 기온 범위 초과 감점
- 습도 초과 감점
- 풍속 초과 감점
- 강수 감점
```

각 감점은 `breakdown`에 저장합니다. 그래야 상세 View에서 점수와 산정 근거를 함께 표시할 수 있습니다.

## 11. Router

```js
{
  path: '/activity/:activityId',
  name: 'ActivityDetail',
  component: () => import('@/views/ActivityDetailView.vue'),
}
```

- `:activityId`: URL에서 변하는 Parameter
- `name`: 경로 문자열 대신 이름으로 이동
- `() => import(...)`: 필요할 때 View를 불러오는 Lazy Loading

```js
router.push({
  name: 'ActivityDetail',
  params: { activityId },
  query: { cityId: activeCity.value.id },
})
```

`params`는 경로의 필수 값, `query`는 선택 도시 같은 부가 정보에 사용합니다.

## 12. Element Plus의 Props와 Event

```vue
<el-slider
  :model-value="maxWind"
  :min="1"
  :max="15"
  @update:model-value="activityStore.setMaxWind"
/>
```

- `:model-value`: 현재 값을 Props로 전달
- `@update:model-value`: 사용자가 값을 바꿀 때 Event 수신
- `v-model`: `model-value`와 `update:model-value`를 합친 양방향 Binding

Element Plus도 결국 Vue Component이므로 수업에서 배운 Props, Emits, Slot 방식으로 사용합니다.

## 13. 환경변수

`.env.local`에는 값만 작성합니다.

```env
VITE_OPENWEATHER_API_KEY=실제_API_KEY
```

JavaScript 파일에서는 다음과 같이 읽습니다.

```js
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
```

이 두 줄은 같은 파일에 작성하지 않습니다. Vite의 `VITE_` 변수는 Browser Bundle에 포함되므로 수업용 Client Application에서만 지시된 방식으로 사용하고, 서버의 민감한 Secret을 저장해서는 안 됩니다.

## 14. 기능 확장 방법

### 기본 도시 추가

`src/data/defaultCities.js`에 객체를 추가합니다. Router의 유효 ID도 이 배열에서 자동 생성되므로 다른 파일을 수정할 필요가 없습니다.

### 활동 추가

`src/data/activities.js`에 규칙 객체를 추가합니다. `useActivityScore`가 배열 전체를 `map()`하므로 추천 대상에 자동으로 포함됩니다.

### 점수 규칙 추가

`calculateRecommendation()`에 조건을 추가하고, 감점 이유를 `breakdown.push()`로 기록합니다. 그래야 상세 페이지의 산정 근거도 함께 변경됩니다.

## 15. 문제 확인 순서

1. Browser Console에서 JavaScript 오류 확인
2. Network Tab에서 API Status Code 확인
3. `.env.local`이 `package.json`과 같은 폴더인지 확인
4. 환경변수 수정 후 개발 서버 재시작
5. `npx eslint .`로 미정의 변수와 문법 오류 확인
6. `npx prettier --check src`로 형식 확인
7. `npm run build`로 Production 환경 확인

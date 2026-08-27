<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useActivityScore } from '@/composables/useActivityScore'
import { fetchWeatherList, searchCityWeather } from '@/services/weatherApi'

import ActivityPreferencePanel from '@/components/activity/ActivityPreferencePanel.vue'
import ActivityScoreCard from '@/components/activity/ActivityScoreCard.vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const router = useRouter()
const route = useRoute()

function goDetail(city) {
  router.push({
    name: 'WeatherDetail',
    params: { cityId: city.id },
    query: { name: city.name },
  })
}

const weatherList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const isSearching = ref(false)
const searchErrorMessage = ref('')
const selectedCityInfo = ref('도시 카드를 선택해 보세요.')
const selectedCity = ref(null)

const searchQuery = ref(
  typeof route.query.search === 'string' ? route.query.search : '',
)

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(query))
})

const activeCity = computed(
  () => selectedCity.value ?? filteredWeatherList.value[0] ?? null,
)
const { recommendations } = useActivityScore(activeCity)
const topRecommendations = computed(() => recommendations.value.slice(0, 3))

function selectCity(city) {
  selectedCity.value = city
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}

function goActivityDetail(activityId) {
  if (!activeCity.value) return

  router.push({
    name: 'ActivityDetail',
    params: { activityId },
    query: {
      cityId: activeCity.value.id,
      cityName: activeCity.value.name,
    },
  })
}

watch(selectedCityInfo, (message) => console.log('[watch]', message))

watch(searchQuery, (value) => {
  router.replace({
    query: { ...route.query, search: value || undefined },
  })
})

watchEffect(() => {
  document.title = activeCity.value
    ? `${activeCity.value.name} 날씨 | Weather Activity Dashboard`
    : 'Weather Activity Dashboard'
})

async function loadWeather() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    weatherList.value = await fetchWeatherList()
  } catch (error) {
    console.error(error)
    errorMessage.value =
      '날씨 정보를 불러오지 못했습니다. API Key와 네트워크 상태를 확인하세요.'
  } finally {
    isLoading.value = false
  }
}

async function handleCitySearch() {
  const query = searchQuery.value.trim()

  if (!query || isSearching.value) return

  isSearching.value = true
  searchErrorMessage.value = ''

  try {
    const searchedCity = await searchCityWeather(query)

    if (!searchedCity) {
      searchErrorMessage.value = `'${query}'에 해당하는 국내 도시를 찾지 못했습니다.`
      return
    }

    const cityAlreadyExists = weatherList.value.some(
      (city) => city.name === searchedCity.name,
    )

    if (!cityAlreadyExists) {
      weatherList.value.unshift(searchedCity)
    }

    selectedCity.value = searchedCity
    selectedCityInfo.value = `${searchedCity.name}의 날씨를 불러왔습니다.`
  } catch (error) {
    console.error(error)
    searchErrorMessage.value =
      '도시를 검색하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    isSearching.value = false
  }
}

onMounted(loadWeather)
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <template #title><h2>도시 검색</h2></template>
      <SearchBar
        :current-query="searchQuery"
        :is-searching="isSearching"
        @update-query="(value) => (searchQuery = value)"
        @search-city="handleCitySearch"
      />

      <el-alert
        v-if="searchErrorMessage"
        :title="searchErrorMessage"
        type="warning"
        show-icon
        :closable="false"
      />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <template #title><h2>활동 추천 기준</h2></template>
      <ActivityPreferencePanel />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <template #title><h2>지역별 날씨 현황</h2></template>
      <el-skeleton v-if="isLoading" :rows="6" animated />
      <el-alert
        v-else-if="errorMessage"
        :title="errorMessage"
        type="error"
        show-icon
        :closable="false"
      />

      <template v-else>
        <WeatherCard
          v-for="city in filteredWeatherList"
          :key="city.id"
          :city-item="city"
          @select-card="selectCity"
          @click-detail="goDetail"
        />

        <el-empty
          v-if="filteredWeatherList.length === 0"
          description="검색 결과가 없습니다. 검색 버튼을 눌러 도시를 불러오세요."
        />
      </template>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <template #title>
        <h2>
          {{ activeCity ? `${activeCity.name} 활동 추천` : '활동 추천' }}
        </h2>
      </template>

      <div v-if="activeCity" class="activity-grid">
        <ActivityScoreCard
          v-for="recommendation in topRecommendations"
          :key="recommendation.id"
          :recommendation="recommendation"
          @view-detail="goActivityDetail"
        />
      </div>
      <el-empty v-else description="날씨 데이터를 먼저 불러와 주세요." />
    </BaseDashboardCard>

    <p class="status-bar">{{ selectedCityInfo }}</p>
  </div>
</template>

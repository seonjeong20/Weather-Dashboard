<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchWeatherList, searchCityWeather } from '@/services/weatherApi'

import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const router = useRouter()
const route = useRoute()

function goDetail(cityId) {
  router.push({ name: 'WeatherDetail', params: { cityId } })
}

const weatherList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const isSearching = ref(false)
const searchErrorMessage = ref('')
const selectedCityInfo = ref('도시 카드를 선택해 보세요.')

const searchQuery = ref(
  typeof route.query.search === 'string' ? route.query.search : '',
)

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(query))
})

watch(selectedCityInfo, (message) => console.log('[watch]', message))

watch(searchQuery, (value) => {
  router.replace({
    query: { ...route.query, search: value || undefined },
  })
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

      <p v-if="searchErrorMessage">{{ searchErrorMessage }}</p>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <template #title><h2>지역별 날씨 현황</h2></template>
      <p v-if="isLoading">날씨 정보를 불러오는 중입니다...</p>
      <p v-else-if="errorMessage">{{ errorMessage }}</p>

      <template v-else>
        <WeatherCard
          v-for="city in filteredWeatherList"
          :key="city.id"
          :city-item="city"
          @select-card="(message) => (selectedCityInfo = message)"
          @click-detail="goDetail"
        />

        <p v-if="filteredWeatherList.length === 0">검색 결과가 없습니다.</p>
      </template>
    </BaseDashboardCard>

    <p class="status-bar">{{ selectedCityInfo }}</p>
  </div>
</template>

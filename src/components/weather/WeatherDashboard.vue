<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const router = useRouter()
const route = useRoute()

function goDetail(cityId) {
  router.push({ name: 'WeatherDetail', params: { cityId } })
}

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

const searchQuery = ref('')
const selectedCityInfo = ref('도시 카드를 선택해 보세요.')

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(query))
})

watch(selectedCityInfo, (message) => console.log('[watch]', message))

</script>

<template>
  <div>
    <BaseDashboardCard>
      <template #title><h2>도시 검색</h2></template>
      <SearchBar
        :current-query="searchQuery"
        @update-query="(value) => (searchQuery = value)"
      />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <template #title><h2>지역별 날씨 현황</h2></template>
      <WeatherCard
        v-for="city in filteredWeatherList"
        :key="city.id"
        :city-item="city"
        @select-card="(message) => (selectedCityInfo = message)"
        @click-detail="goDetail"
      />
      <p v-if="filteredWeatherList.length === 0">검색 결과가 없습니다.</p>
    </BaseDashboardCard>

    <p class="status-bar">{{ selectedCityInfo }}</p>
  </div>
</template>

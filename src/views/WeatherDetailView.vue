<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTemperature } from '@/composables/useTemperature'
import { fetchWeatherDetail } from '@/services/weatherApi'

const route = useRoute()
const router = useRouter()
const cityData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const { displayTemp, unitSymbol } = useTemperature(
  () => cityData.value?.temp ?? 0,
)

async function loadWeatherDetail() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    cityData.value = await fetchWeatherDetail(String(route.params.cityId))
    if (!cityData.value) errorMessage.value = '등록되지 않은 도시입니다.'
  } catch (error) {
    console.error(error)
    errorMessage.value = '상세 날씨 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadWeatherDetail)
</script>

<template>
  <section>
    <h2>상세 날씨</h2>
    <p v-if="isLoading">데이터를 불러오는 중입니다...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>

    <div v-else-if="cityData">
      <h3>{{ cityData.name }}</h3>
      <p>기온: {{ displayTemp }}{{ unitSymbol }}</p>
      <p>날씨: {{ cityData.status }}</p>
      <p>습도: {{ cityData.humidity }}%</p>
      <p>풍속: {{ cityData.wind }}m/s</p>
    </div>
    <button @click="router.push({ name: 'WeatherHome' })">
      홈으로 돌아가기
    </button>
  </section>
</template>

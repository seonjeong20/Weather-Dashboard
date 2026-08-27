<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findActivity } from '@/data/activities'
import { useActivityScore } from '@/composables/useActivityScore'
import { fetchWeatherDetail } from '@/services/weatherApi'

const route = useRoute()
const router = useRouter()
const cityData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const activityId = String(route.params.activityId)
const activity = findActivity(activityId)
const { findRecommendation } = useActivityScore(cityData)
const recommendation = findRecommendation(activityId)

async function loadActivityDetail() {
  if (!activity) {
    errorMessage.value = '등록되지 않은 활동입니다.'
    return
  }

  const cityId =
    typeof route.query.cityId === 'string' ? route.query.cityId : 'city_01'
  const cityName =
    typeof route.query.cityName === 'string' ? route.query.cityName : ''

  isLoading.value = true
  errorMessage.value = ''

  try {
    cityData.value = await fetchWeatherDetail(cityId, cityName)
    if (!cityData.value) errorMessage.value = '도시 정보를 찾지 못했습니다.'
  } catch (error) {
    console.error(error)
    errorMessage.value = '활동 적합도를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadActivityDetail)
</script>

<template>
  <section class="activity-detail">
    <el-skeleton v-if="isLoading" :rows="6" animated />

    <el-alert
      v-else-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      :closable="false"
    />

    <template v-else-if="recommendation && cityData">
      <header class="activity-detail__header">
        <span>{{ recommendation.icon }}</span>
        <div>
          <p>{{ cityData.name }} 현재 날씨 기준</p>
          <h2>{{ recommendation.label }} 적합도</h2>
        </div>
        <strong>{{ recommendation.score }}점</strong>
      </header>

      <el-progress
        :percentage="recommendation.score"
        :status="recommendation.progressStatus"
        :stroke-width="16"
      />

      <p class="activity-detail__description">
        {{ recommendation.description }}
      </p>

      <h3>점수 산정 근거</h3>
      <ul class="score-breakdown">
        <li v-for="item in recommendation.breakdown" :key="item.label">
          <span>{{ item.label }}</span>
          <strong :class="{ penalty: item.value < 0 }">
            {{ item.value === 0 ? '유지' : item.value }}
          </strong>
        </li>
      </ul>

      <div class="activity-detail__actions">
        <el-button type="primary" @click="router.push({ name: 'WeatherHome' })">
          대시보드로 돌아가기
        </el-button>
        <el-button
          @click="
            router.push({
              name: 'WeatherDetail',
              params: { cityId: cityData.id },
              query: { name: cityData.name },
            })
          "
        >
          도시 날씨 보기
        </el-button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.activity-detail {
  display: grid;
  gap: 24px;
}

.activity-detail__header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 18px;
  align-items: center;
}

.activity-detail__header > span {
  font-size: 3rem;
}

.activity-detail__header h2,
.activity-detail__header p {
  margin: 0;
}

.activity-detail__header strong {
  color: var(--primary);
  font-size: 2rem;
}

.activity-detail__description {
  padding: 16px;
  border-radius: 14px;
  background: #f3f7fd;
}

.score-breakdown {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.score-breakdown li {
  display: flex;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #e4ebf5;
}

.score-breakdown strong {
  color: #2e8b57;
}

.score-breakdown .penalty {
  color: #d94b4b;
}

.activity-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 560px) {
  .activity-detail__header {
    grid-template-columns: auto 1fr;
  }

  .activity-detail__header strong {
    grid-column: 1 / -1;
  }
}
</style>

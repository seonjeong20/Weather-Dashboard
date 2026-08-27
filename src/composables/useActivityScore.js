import { computed, toValue } from 'vue'
import { ACTIVITIES } from '@/data/activities'
import { useActivityStore } from '@/stores/activityStore'

const RAIN_PATTERN = /비|소나기|뇌우|눈|rain|drizzle|thunderstorm|snow/i

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function getLevel(score) {
  if (score >= 85) return { label: '매우 좋음', status: 'success' }
  if (score >= 70) return { label: '좋음', status: 'success' }
  if (score >= 50) return { label: '보통', status: 'warning' }
  return { label: '비추천', status: 'exception' }
}

function calculateRecommendation(activity, weather, preferences) {
  const breakdown = []
  let score = activity.outdoor ? 100 : 45
  const isRaining = RAIN_PATTERN.test(weather.status)

  if (activity.outdoor) {
    if (weather.temp < preferences.minTemp) {
      const penalty = Math.min(35, (preferences.minTemp - weather.temp) * 3)
      score -= penalty
      breakdown.push({
        label: '선호 기온보다 낮음',
        value: -Math.round(penalty),
      })
    } else if (weather.temp > preferences.maxTemp) {
      const penalty = Math.min(35, (weather.temp - preferences.maxTemp) * 3)
      score -= penalty
      breakdown.push({
        label: '선호 기온보다 높음',
        value: -Math.round(penalty),
      })
    } else {
      breakdown.push({ label: '선호 기온 범위', value: 0 })
    }

    if (weather.humidity > activity.humidityLimit) {
      const penalty = Math.min(
        25,
        (weather.humidity - activity.humidityLimit) / 2,
      )
      score -= penalty
      breakdown.push({ label: '습도가 높음', value: -Math.round(penalty) })
    } else {
      breakdown.push({ label: '적절한 습도', value: 0 })
    }

    const windLimit = Math.min(activity.windLimit, preferences.maxWind)
    if (weather.wind > windLimit) {
      const penalty = Math.min(30, (weather.wind - windLimit) * 5)
      score -= penalty
      breakdown.push({ label: '바람이 강함', value: -Math.round(penalty) })
    } else {
      breakdown.push({ label: '안정적인 풍속', value: 0 })
    }

    if (isRaining && preferences.avoidRain) {
      score -= activity.rainPenalty
      breakdown.push({ label: '강수 상태', value: -activity.rainPenalty })
    } else {
      breakdown.push({ label: '강수 영향 없음', value: 0 })
    }
  } else {
    const badOutdoorWeather =
      isRaining ||
      weather.temp < preferences.minTemp ||
      weather.temp > preferences.maxTemp ||
      weather.wind > preferences.maxWind

    if (badOutdoorWeather) {
      score += 45
      breakdown.push({ label: '야외 활동 대안', value: 45 })
    } else {
      breakdown.push({ label: '야외 활동도 가능', value: 0 })
    }
  }

  const finalScore = clampScore(score)
  const level = getLevel(finalScore)

  return {
    ...activity,
    score: finalScore,
    level: level.label,
    progressStatus: level.status,
    breakdown,
    reason:
      breakdown.find((item) => item.value < 0)?.label ?? activity.description,
  }
}

export function useActivityScore(weatherSource) {
  const activityStore = useActivityStore()

  const recommendations = computed(() => {
    const weather = toValue(weatherSource)
    if (!weather) return []

    const preferences = {
      minTemp: activityStore.preferredMinTemp,
      maxTemp: activityStore.preferredMaxTemp,
      avoidRain: activityStore.avoidRain,
      maxWind: activityStore.maxWind,
    }

    return ACTIVITIES.map((activity) =>
      calculateRecommendation(activity, weather, preferences),
    ).sort((a, b) => b.score - a.score)
  })

  function findRecommendation(activityId) {
    return computed(
      () =>
        recommendations.value.find((item) => item.id === activityId) ?? null,
    )
  }

  return { recommendations, findRecommendation }
}

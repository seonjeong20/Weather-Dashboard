import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useActivityStore = defineStore('activity', () => {
  const preferredMinTemp = ref(15)
  const preferredMaxTemp = ref(26)
  const avoidRain = ref(true)
  const maxWind = ref(8)

  const preferredRangeLabel = computed(
    () => `${preferredMinTemp.value}℃ ~ ${preferredMaxTemp.value}℃`,
  )

  function setPreferredRange([min, max]) {
    preferredMinTemp.value = min
    preferredMaxTemp.value = max
  }

  function setMaxWind(value) {
    maxWind.value = value
  }

  return {
    preferredMinTemp,
    preferredMaxTemp,
    preferredRangeLabel,
    avoidRain,
    maxWind,
    setPreferredRange,
    setMaxWind,
  }
})

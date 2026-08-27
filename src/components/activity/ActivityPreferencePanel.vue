<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useActivityStore } from '@/stores/activityStore'

const activityStore = useActivityStore()
const { avoidRain, maxWind, preferredRangeLabel } = storeToRefs(activityStore)

const temperatureRange = computed({
  get: () => [activityStore.preferredMinTemp, activityStore.preferredMaxTemp],
  set: (range) => activityStore.setPreferredRange(range),
})
</script>

<template>
  <div class="preference-panel">
    <div class="preference-panel__item">
      <div>
        <strong>선호 기온</strong>
        <span>{{ preferredRangeLabel }}</span>
      </div>
      <el-slider
        v-model="temperatureRange"
        range
        :min="-5"
        :max="40"
        :step="1"
      />
    </div>

    <div class="preference-panel__item">
      <div>
        <strong>허용 풍속</strong>
        <span>{{ maxWind }}m/s 이하</span>
      </div>
      <el-slider
        :model-value="maxWind"
        :min="1"
        :max="15"
        :step="1"
        @update:model-value="activityStore.setMaxWind"
      />
    </div>

    <label class="preference-panel__switch">
      <span>비 오는 날 야외 활동 감점</span>
      <el-switch v-model="avoidRain" />
    </label>
  </div>
</template>

<style scoped>
.preference-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 34px;
}

.preference-panel__item > div,
.preference-panel__switch {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.preference-panel__item span,
.preference-panel__switch {
  color: var(--muted);
  font-size: 0.9rem;
}

.preference-panel__switch {
  grid-column: 1 / -1;
  align-items: center;
  margin: 0;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f5f8fd;
}

@media (max-width: 680px) {
  .preference-panel {
    grid-template-columns: 1fr;
  }

  .preference-panel__switch {
    grid-column: auto;
  }
}
</style>

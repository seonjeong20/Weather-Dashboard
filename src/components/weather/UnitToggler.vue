<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

function handleChange() {
  configStore.toggleUnit()
}
</script>

<template>
  <div class="unit-toggler">
    <span>온도 단위</span>
    <el-switch
      :model-value="configStore.unit === 'fahrenheit'"
      active-text="℉"
      inactive-text="℃"
      @change="handleChange"
    />
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  color: #66748c;
  font-size: 0.9rem;
  font-weight: 700;
}
</style>

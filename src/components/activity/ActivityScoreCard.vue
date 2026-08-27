<script setup>
const props = defineProps({
  recommendation: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['view-detail'])
</script>

<template>
  <article class="activity-card">
    <div class="activity-card__heading">
      <span class="activity-card__icon">{{ props.recommendation.icon }}</span>
      <div>
        <h3>{{ props.recommendation.label }}</h3>
        <p>{{ props.recommendation.level }}</p>
      </div>
      <strong>{{ props.recommendation.score }}점</strong>
    </div>

    <el-progress
      :percentage="props.recommendation.score"
      :status="props.recommendation.progressStatus"
    />

    <p class="activity-card__reason">{{ props.recommendation.reason }}</p>

    <el-button
      type="primary"
      plain
      @click="emit('view-detail', props.recommendation.id)"
    >
      점수 산정 보기
    </el-button>
  </article>
</template>

<style scoped>
.activity-card {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid #dbe7f6;
  border-radius: 18px;
  background: linear-gradient(145deg, #fff, #f6faff);
}

.activity-card__heading {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
}

.activity-card__icon {
  font-size: 1.8rem;
}

.activity-card h3,
.activity-card p {
  margin: 0;
}

.activity-card h3 {
  color: #173b72;
}

.activity-card__heading p,
.activity-card__reason {
  color: var(--muted);
  font-size: 0.9rem;
}

.activity-card__heading strong {
  color: var(--primary);
  font-size: 1.25rem;
}

.activity-card .el-button {
  justify-self: start;
}
</style>

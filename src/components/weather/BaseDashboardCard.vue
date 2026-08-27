<template>
  <section class="dashboard-card">
    <header v-if="$slots.title" class="dashboard-card__title">
      <slot name="title" />
    </header>

    <slot />
  </section>
</template>

<style scoped>
.dashboard-card {
  padding: clamp(20px, 4vw, 30px);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 48px rgba(47, 91, 151, 0.1);
  backdrop-filter: blur(16px);
}

.dashboard-card__title {
  margin-bottom: 20px;
}

.dashboard-card__title :deep(h2) {
  margin: 0;
  color: #173b72;
  font-size: 1.35rem;
  letter-spacing: -0.035em;
}

.dashboard-card:has(.weather-card) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.dashboard-card:has(.weather-card) .dashboard-card__title,
.dashboard-card:has(.weather-card) > p {
  grid-column: 1 / -1;
}

@media (max-width: 820px) {
  .dashboard-card:has(.weather-card) {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup>
import { provide } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from './components/weather/UnitToggler.vue'

provide('appTitle', 'Vue Weather Dashboard')
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Vue Weather Dashboard</h1>
      <nav>
        <RouterLink to="/">날씨</RouterLink>
        <RouterLink to="/about">서비스 소개</RouterLink>
      </nav>
      <UnitToggler />
    </header>

    <RouterView />
  </div>
</template>

<script setup>
const props = defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
  isSearching: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update-query', 'search-city'])
</script>

<template>
  <div class="search-bar">
    <el-input
      :model-value="props.currentQuery"
      placeholder="검색할 도시 이름을 입력하세요."
      clearable
      @update:model-value="emit('update-query', $event)"
      @keyup.enter="emit('search-city')"
    >
      <template #append>
        <el-button :loading="props.isSearching" @click="emit('search-city')">
          검색
        </el-button>
      </template>
    </el-input>
  </div>
</template>

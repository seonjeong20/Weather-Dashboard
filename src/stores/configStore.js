import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () =>{
    //여러화면에서 공유할 온도 단위를 상태로 보관합니다.
    const unit = ref('celsius')

    //현재 상태에 맞는 단위 기호를 계산합니다.
    const unitSymbol = computed(() => (unit.value === 'celsius' ? '℃' : '℉'))

    //버튼 클릭 시 섭씨와 화씨를 서로 전환합니다.
    function toggleUnit() {
        unit.value = unit.value ==='celsius' ? 'fahrenheit' : 'celsius'
    }

    return { unit, unitSymbol, toggleUnit }
})
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

export function useTemparature(getCelsius) {
    const configStore = useConfigStore()

    //원본 섭씨 값을 Store의 단위 설정에 맞춰 표시용 값으로 변환합니다.
    const displayTemp = computed(() => {
        const celsius = Number(getCelsius())

        if (configStore.unit)//6.3
    })
}
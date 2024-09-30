import { useToggle } from '@vueuse/core'
import { ref } from 'vue'

const isAsideOpen = ref(false)

export const useAside = () => {
    const toggleAside = useToggle(isAsideOpen)

    return { toggleAside, isAsideOpen }
}

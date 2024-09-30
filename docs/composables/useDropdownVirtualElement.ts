import type { VvDropdown } from '@volverjs/ui-vue/components'
import { type Ref, ref, onMounted } from 'vue'

const findScrollContainer = (element: HTMLElement | null) => {
    if (!element) {
        return undefined
    }
    let parent = element.parentElement
    while (parent) {
        const { overflow } = window.getComputedStyle(parent)
        if (overflow.split(' ').every(item => item === 'auto' || item === 'scroll')) {
            return parent
        }
        parent = parent.parentElement
    }

    return document.documentElement
}

export const useDropdownVirtualElement = (dropdownEl: Ref<typeof VvDropdown>) => {
    const x = ref(0)
    const y = ref(0)
    onMounted(() => {
        const scrollableContainer = findScrollContainer(dropdownEl.value.$el)
        let scrollXDelta = 0
        let scrollYDelta = 0
        let lastScrollTop = 0
        let lastScrollLeft = 0
        if (scrollableContainer) {
            scrollableContainer.addEventListener('scroll', () => {
                scrollXDelta = scrollableContainer.scrollLeft - lastScrollLeft
                scrollYDelta = scrollableContainer.scrollTop - lastScrollTop
                y.value = y.value - scrollYDelta
                x.value = x.value - scrollXDelta
                lastScrollLeft = scrollableContainer.scrollLeft
                lastScrollTop = scrollableContainer.scrollTop
            })
        }
        if (dropdownEl.value) {
            dropdownEl.value.init({
                getBoundingClientRect: () => ({
                    width: 0,
                    height: 0,
                    x: x.value,
                    y: y.value,
                    top: y.value,
                    left: x.value,
                    right: x.value,
                    bottom: y.value,
                }),
            })
        }
    })
    return { x, y }
}

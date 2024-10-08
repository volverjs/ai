<script setup lang="ts">
import PjProgress from '@/components/PjProgress.vue'
import { useDropdownVirtualElement } from '@/composables/useDropdownVirtualElement'
import { VvDropdown, VvDropdownItem, VvIcon } from '@volverjs/ui-vue/components'
import { ref } from 'vue'
import { useTranslator } from '~/vue'

const { translate, init, isReady, progress } = useTranslator({
    global: true,
})
const { result, isLoading, execute } = translate(undefined, {
    from: 'eng_Latn',
    to: 'ita_Latn',
    immediate: false,
})
init()

// context menu
const dropdownEl = ref()
const isDropdownExpanded = ref(false)
const { x, y } = useDropdownVirtualElement(dropdownEl)
const onContextmenu = (event: MouseEvent) => {
    const selection = window.getSelection()?.toString()
    if (selection) {
        execute(selection)
        x.value = event.pageX
        y.value = event.pageY
        event.preventDefault()
        isDropdownExpanded.value = true
    }
}
</script>

<template>
    <VvDropdown ref="dropdownEl" v-model="isDropdownExpanded" :offset="20" arrow auto-placement>
        <div class="p-16 font-serif text-md leading-normal flex flex-col gap-lg" @contextmenu="onContextmenu">
            <p class="initial-letter">
                The color of animals is by no means a matter of chance; it depends on many considerations, but in the majority of cases tends to protect the animal from danger by rendering it less conspicuous. Perhaps it may be said that if coloring is mainly protective, there ought to be but few brightly colored animals. There are, however, not a few cases in which vivid colors are themselves protective. The kingfisher itself, though so brightly colored, is by no means easy to see. The blue harmonizes with the water, and the bird as it darts along the stream looks almost like a flash of sunlight.
            </p>
            <p>
                Desert animals are generally the color of the desert. Thus, for instance, the lion, the antelope, and the wild donkey are all sand-colored. “Indeed,” says Canon Tristram, “in the desert, where neither trees, brushwood, nor even undulation of the surface afford the slightest protection to its foes, a modification of color assimilated to that of the surrounding country is absolutely necessary. Hence, without exception, the upper plumage of every bird, and also the fur of all the smaller mammals and the skin of all the snakes and lizards, is of one uniform sand color.”
            </p>
            <p>
                The next point is the color of the mature caterpillars, some of which are brown. This probably makes the caterpillar even more conspicuous among the green leaves than would otherwise be the case. Let us see, then, whether the habits of the insect will throw any light upon the riddle. What would you do if you were a big caterpillar? Why, like most other defenseless creatures, you would feed by night, and lie concealed by day. So do these caterpillars. When the morning light comes, they creep down the stem of the food plant, and lie concealed among the thick herbage and dry sticks and leaves, near the ground, and it is obvious that under such circumstances the brown color really becomes a protection. It might indeed be argued that the caterpillars, having become brown, concealed themselves on the ground, and that we were reversing the state of things. But this is not so, because, while we may say as a general rule that large caterpillars feed by night and lie concealed by day, it is by no means always the case that they are brown; some of them still retaining the green color. We may then conclude that the habit of concealing themselves by day came first, and that the brown color is a later adaptation.
            </p>
        </div>
        <template #items>
            <VvDropdownItem class="w-300 p-md">
                <PjProgress v-if="!isReady" :progress />
                <small v-if="isLoading && !result" class="text-smaller text-word-3">Loading translation...</small>
                <div v-else>
                    <small class="text-smaller text-word-3 mb-xs flex items-center gap-4">English <VvIcon name="akar-icons:arrow-right" /> Italian</small>
                    <p>
                        {{ result }}
                    </p>
                </div>
            </VvDropdownItem>
        </template>
    </VvDropdown>
</template>

<style lang="scss">
.initial-letter {
    &::first-letter {
        initial-letter: 3;
        margin-right: .75em;
    }
}
</style>

<script setup lang="ts">
import PjLanguageSelector from '@/components/PjLanguageSelector.vue'
import PjProgress from '@/components/PjProgress.vue'
import { VvTextarea, VvButton, VvButtonGroup } from '@volverjs/ui-vue/components'
import { ref, watch } from 'vue'
import { useTranslator } from '~/vue'

const text = ref(`Imagine there's no heaven, it's easy if you try, no hell below us, above us, only sky.`)
const from = ref('eng_Latn')
const to = ref('ita_Latn')
const { translate } = useTranslator({
    global: true,
})
const { result, isLoading, progress } = translate(text, {
    from,
    to,
})
watch(from, () => {
    text.value = ''
})
const onClickClear = () => {
    text.value = ''
}
const onClickPaste = () => {
    navigator.clipboard.readText().then((clipText) => {
        text.value = clipText
    })
}
const onClickCopy = () => {
    navigator.clipboard.writeText(result.value)
}
const onClickLanguageSwitch = () => {
    const temp = from.value
    from.value = to.value
    to.value = temp
}
</script>

<template>
    <div class="flex gap-xs items-center mb-md">
        <PjLanguageSelector v-model="from" name="from" searchable class="flex-1 mb-0" />
        <VvButton icon="akar-icons:arrow-right-left" title="Switch languages" class="shrink-0" modifiers="action-quiet" @click="onClickLanguageSwitch" />
        <PjLanguageSelector v-model="to" name="to" searchable class="flex-1 mb-0" />
    </div>
    <div class="md:grid grid-cols-2 gap-md mb-md">
        <div>
            <VvTextarea v-model="text" name="text" rows="5" count />
            <VvButtonGroup>
                <VvButton modifiers="action" icon="akar-icons:clipboard" label="Paste" @click="onClickPaste" />
                <VvButton modifiers="action-quiet" icon="akar-icons:x-small" label="Clear" @click="onClickClear" />
            </VvButtonGroup>
        </div>
        <div>
            <VvTextarea v-model="result" name="result" rows="5" readonly :loading="isLoading" loading-label="" />
            <VvButton modifiers="action" icon="akar-icons:copy" label="Copy" :disabled="isLoading" @click="onClickCopy" />
        </div>
    </div>
    <PjProgress :progress />
</template>

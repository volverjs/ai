<script setup lang="ts">
import yamlExample from '@/assets/yaml/example.yaml?raw'
import PjProgress from '@/components/PjProgress.vue'
import { VvCard, VvButton, VvButtonGroup } from '@volverjs/ui-vue/components'
import { highlight, languages } from 'prismjs'
import { ref, watch, computed } from 'vue'
import { PrismEditor } from 'vue-prism-editor'
import { parse, stringify } from 'yaml'
import { useTranslator } from '~/vue'
import 'prismjs/components/prism-yaml'
import 'vue-prism-editor/dist/prismeditor.min.css'

const yamlSource = ref(yamlExample)
const parsedData = ref<Map<string, string>>(new Map())
watch(yamlSource, (newValue) => {
    try {
        parsedData.value = new Map(Object.entries(parse(newValue)))
    }
    catch (error) {
        console.error(error)
    }
}, {
    immediate: true,
})
const resultData = ref<Map<string, string>>(new Map())
const yamlResult = computed(() => {
    if (!resultData.value.size) {
        return ''
    }
    try {
        return stringify(resultData.value).trim()
    }
    catch (error) {
        console.error(error)
        return ''
    }
})
let timeout: NodeJS.Timeout
const { translator, progress } = useTranslator({
    model: 'Xenova/opus-mt-en-it',
})
const isLoading = ref(false)
watch(parsedData, async (newValue, oldValue) => {
    if (timeout) {
        clearTimeout(timeout)
    }
    timeout = setTimeout(async () => {
        isLoading.value = true
        const toReturn = new Map<string, string>()
        for (const [key, value] of newValue) {
            if (oldValue?.get(key) === value && resultData.value.has(key)) {
                toReturn.set(key, resultData.value.get(key) as string)
                continue
            }
            const result = await translator.translate(value, {
                from: 'en',
                to: 'it',
            })
            toReturn.set(key, result.output)
            resultData.value.set(key, result.output)
        }
        resultData.value = toReturn
        isLoading.value = false
    }, 500)
}, {
    immediate: true,
})
const highlighter = (code: string) => highlight(code, languages.yaml, 'yaml')

const onClickPaste = () => {
    navigator.clipboard.readText().then((clipText) => {
        yamlSource.value = clipText
    })
}
const onClickClear = () => {
    yamlSource.value = ''
}
const onClickCopy = () => {
    navigator.clipboard.writeText(yamlResult.value)
}
</script>

<template>
    <div class="flex flex-col md:grid grid-cols-2 gap-md mb-md">
        <div class="flex flex-col items-start">
            <VvCard class="flex-1 w-full mb-md">
                <template #header>
                    YAML Source (English)
                </template>
                <template #content>
                    <PrismEditor v-model="yamlSource" :highlight="highlighter" />
                </template>
            </VvCard>
            <VvButtonGroup>
                <VvButton modifiers="action" icon="akar-icons:clipboard" label="Paste" @click="onClickPaste" />
                <VvButton modifiers="action-quiet" icon="akar-icons:x-small" label="Clear" @click="onClickClear" />
            </VvButtonGroup>
        </div>
        <div class="flex flex-col items-start">
            <VvCard :modifiers="isLoading ? 'loading' : undefined" class="flex-1 w-full mb-md">
                <template #header>
                    YAML Result (Italian)
                </template>
                <template #content>
                    <PrismEditor :model-value="yamlResult" :highlight="highlighter" />
                </template>
            </VvCard>
            <VvButton modifiers="action" icon="akar-icons:copy" label="Copy" :disabled="isLoading" @click="onClickCopy" />
        </div>
    </div>
    <PjProgress :progress />
</template>

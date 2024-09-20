import { RemoveBackground } from 'src/RemoveBackground'
import { computed, type Ref, ref, unref } from 'vue'

let instance: RemoveBackground
const ready = ref(false)

const useTranslator = () => {
    if (!instance) {
        instance = new RemoveBackground()
    }
    const init = () => {
        const progress = ref<Record<string, number>>({})
        if (ready.value) {
            return { progress, promise: Promise.resolve() }
        }
        const promise = instance
            .init((data) => {
                progress.value[data.file] = data.progress
            })
            .then(() => {
                ready.value = true
            })
        return { progress, promise }
    }

    const translate = (url: string, config: { canvas?: HTMLCanvasElement | Ref<HTMLCanvasElement>, type?: 'image/jpeg' | 'image/png' | 'image/webp', quality?: number }) => {
        const result = ref<Blob>()
        const resultUrl = computed(() => {
            return result.value ? URL.createObjectURL(result.value) : undefined
        })
        const isLoading = ref(true)
        const error = ref<Error>()
        const promise = instance
            .predict(url, {
                canvas: unref(config.canvas),
                type: config.type,
                quality: config.quality,
            })
            .then((data) => {
                result.value = data.output
            })
            .catch((e) => {
                error.value = e
            })
            .finally(() => {
                isLoading.value = false
            })
        return { result, resultUrl, isLoading, error, promise }
    }

    return { init, translate, ready }
}

export { useTranslator }

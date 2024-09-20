import { ref } from 'vue'
import { Translator } from '../Translator'

let instance: Translator
const ready = ref(false)

const useTranslator = () => {
    if (!instance) {
        instance = new Translator()
    }
    const init = (model?: string) => {
        const progress = ref<Record<string, number>>({})
        if (ready.value) {
            return { progress, promise: Promise.resolve() }
        }
        const promise = instance
            .init(model, (data) => {
                progress.value[data.file] = data.progress
            })
            .then(() => {
                ready.value = true
            })
        return { progress, promise }
    }

    const translate = (text: string, config: { from: string, to: string }) => {
        const result = ref('')
        const loading = ref(true)
        const error = ref<Error>()
        const promise = instance
            .translate(text, {
                ...config,
                updateCallback: (data) => {
                    result.value = data.output
                },
            })
            .then((data) => {
                result.value = data.output
            })
            .catch((e) => {
                error.value = e
            })
            .finally(() => {
                loading.value = false
            })
        return { result, loading, error, promise }
    }

    return { init, translate, ready }
}

export { useTranslator }

import { type Ref, ref, unref, watch, computed, onBeforeUnmount } from 'vue'
import { Translator } from '~/Translator'
import { type WorkerProgressEvent, WorkerStatus } from '~/types'

let globalTranslator: Translator

const useTranslator = (config?: { model?: string, global?: boolean }) => {
    if (!globalTranslator && config?.global) {
        globalTranslator = new Translator({ model: config.model })
    }

    // translator
    const translator = config?.global ? globalTranslator : new Translator({ model: config?.model })

    // progress
    const progress = ref<Record<string, number>>({})
    const onProgress = (data: WorkerProgressEvent) => {
        if (data.progress === 100) {
            delete progress.value[data.file]
            return
        }
        progress.value[data.file] = data.progress
    }

    // ready
    const isReady = ref(translator.ready)
    translator.on(WorkerStatus.Ready, {
        handler: () => {
            isReady.value = true
        },
    })

    const init = () => {
        if (isReady.value) {
            return { progress, promise: Promise.resolve() }
        }
        const promise = translator
            .init({ onProgress })
        return { isReady, progress, promise }
    }

    const translate = (text: Ref<string> | string | undefined, {
        from,
        to,
        immediate = true,
        debounce = 500,
    }: { from: Ref<string> | string, to: Ref<string> | string, immediate?: boolean, debounce?: number }) => {
        const result = ref('')
        const isLoading = ref(false)
        const error = ref<Error>()
        const isError = computed(() => !!error.value)
        const promise = ref<Promise<string | void>>()

        const normalizedText = computed(() => unref(text))
        const normalizedFrom = computed(() => unref(from))
        const normalizedTo = computed(() => unref(to))

        let controller: AbortController | undefined
        const execute = (text?: string) => {
            const source = text ?? normalizedText.value
            error.value = undefined
            if (!source) {
                promise.value = Promise.resolve('')
                result.value = ''
                return promise.value
            }
            if (controller) {
                controller.abort()
            }
            controller = new AbortController()
            isLoading.value = true
            promise.value = translator
                .translate(source, {
                    from: normalizedFrom.value,
                    to: normalizedTo.value,
                    onUpdate: (data) => {
                        result.value = data.output
                    },
                    onProgress,
                    signal: controller.signal,
                })
                .then((data) => {
                    result.value = data.output
                    return data.output
                })
                .catch((e) => {
                    error.value = e
                })
                .finally(() => {
                    isLoading.value = false
                    controller = undefined
                })
            return promise.value
        }

        let timeout: NodeJS.Timeout
        watch([normalizedText, normalizedFrom, normalizedTo], () => {
            if (timeout) {
                clearTimeout(timeout)
            }
            timeout = setTimeout(() => {
                execute()
            }, debounce)
        })
        onBeforeUnmount(() => {
            if (controller) {
                controller.abort()
            }
            if (timeout) {
                clearTimeout(timeout)
            }
        })
        if (immediate) {
            execute()
        }
        return { result, isLoading, error, isError, isReady, promise, progress, execute }
    }

    onBeforeUnmount(() => {
        if (!config?.global) {
            translator.teminate()
        }
    })

    return { init, translate, isReady, translator, progress }
}

export { useTranslator }

import { type Ref, computed, ref, unref, onBeforeUnmount, watch, onMounted } from 'vue'
import { RemoveBackground } from '~/RemoveBackground'
import { type WorkerProgressEvent, WorkerStatus } from '~/types'

let globalBackgroundRemover: RemoveBackground
const ready = ref(false)

const useRemoveBackground = (config?: {
    global?: boolean
}) => {
    if (!globalBackgroundRemover && config?.global) {
        globalBackgroundRemover = new RemoveBackground()
    }

    // background remover
    const backgroundRemover = config?.global ? globalBackgroundRemover : new RemoveBackground()

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
    const isReady = ref(backgroundRemover.ready)
    backgroundRemover.on(WorkerStatus.Ready, {
        handler: () => {
            isReady.value = true
        },
    })

    const init = (config?: {
        canvas?: HTMLCanvasElement | Ref<HTMLCanvasElement | undefined>
    }) => {
        if (ready.value) {
            return { progress, promise: Promise.resolve() }
        }
        const promise = backgroundRemover
            .init({ onProgress, canvas: unref(config?.canvas) })
        return { progress, promise }
    }

    const predict = (url: Ref<string | File> | string | File | undefined, {
        canvas,
        type,
        quality,
        immediate = true,
    }: { canvas?: HTMLCanvasElement | Ref<HTMLCanvasElement | undefined>, type?: 'image/jpeg' | 'image/png' | 'image/webp', quality?: number, immediate?: boolean } = {}) => {
        const result = ref<Blob>()
        const isLoading = ref(false)
        const error = ref<Error>()
        const isError = computed(() => !!error.value)
        const promise = ref<Promise<Blob | void>>()

        const resultUrl = computed(() => {
            return result.value ? URL.createObjectURL(result.value) : undefined
        })

        const normalizedUrl = computed(() => {
            const toReturn = unref(url)
            if (toReturn instanceof File) {
                return URL.createObjectURL(toReturn)
            }
            return toReturn
        })

        let controller: AbortController | undefined
        const execute = (url?: string) => {
            const source = url ?? normalizedUrl.value
            error.value = undefined
            if (!source) {
                promise.value = Promise.resolve()
                result.value = undefined
                return promise.value
            }
            if (controller) {
                controller.abort()
            }
            controller = new AbortController()
            isLoading.value = true
            promise.value = backgroundRemover
                .predict(source, {
                    canvas: unref(canvas),
                    type,
                    quality,
                    onProgress,
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
        watch(normalizedUrl, execute)

        if (immediate) {
            if (canvas) {
                onMounted(() => {
                    execute()
                })
            }
            else {
                execute()
            }
        }
        onBeforeUnmount(() => {
            if (controller) {
                controller.abort()
            }
        })
        return { result, resultUrl, isLoading, error, isError, isReady, promise, progress }
    }

    onBeforeUnmount(() => {
        if (!config?.global) {
            backgroundRemover.teminate()
        }
    })

    return { init, predict, ready, isReady, progress }
}

export { useRemoveBackground }

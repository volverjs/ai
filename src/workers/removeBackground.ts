import { AutoModel, AutoProcessor, env, type Processor, RawImage, type PreTrainedModel } from '@xenova/transformers'
import {
    type WorkerProgressEvent,
    type WorkerReadyEvent,
    type WorkerInitiateEvent,
    type WorkerDoneEvent,
    type RemoveBackgroundInputEvent,
    RemoveBackgroundAction,
    WorkerStatus,
} from '../types'

env.allowLocalModels = false

env.backends.onnx.wasm.proxy = true

let model: PreTrainedModel
let processor: Processor

const init = async (options?: {
    progress_callback: (
        data:
            | WorkerReadyEvent
            | WorkerProgressEvent
            | WorkerInitiateEvent
            | WorkerDoneEvent
    ) => void
}) => {
    model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
        config: { model_type: 'custom' },
        progress_callback: options?.progress_callback,
    })

    processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
        config: {
            do_normalize: true,
            do_pad: false,
            do_rescale: true,
            do_resize: true,
            image_mean: [0.5, 0.5, 0.5],
            feature_extractor_type: 'ImageFeatureExtractor',
            image_std: [1, 1, 1],
            resample: 2,
            rescale_factor: 0.00392156862745098,
            size: { width: 1024, height: 1024 },
        },
    })

    globalThis.postMessage({
        status: WorkerStatus.Ready,
    })
}

const predict = async (
    url: string,
    canvas?: OffscreenCanvas,
    config?: {
        type?: 'image/jpeg' | 'image/png' | 'image/webp'
        quality?: number
    },
) => {
    if (!model || !processor) {
        await init()
    }
    const image = await RawImage.fromURL(url)

    // preprocess image
    const { pixel_values } = await processor(image)

    // predict alpha matte
    const { output } = await model({ input: pixel_values })

    // resize mask back to original size
    const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height)

    if (!canvas) {
        canvas = new OffscreenCanvas(image.width, image.height)
    }
    else {
        canvas.width = image.width
        canvas.height = image.height
    }
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image.toCanvas(), 0, 0)

    const pixelData = ctx.getImageData(0, 0, image.width, image.height)
    for (let i = 0; i < mask.data.length; ++i) {
        pixelData.data[4 * i + 3] = mask.data[i]
    }
    ctx.putImageData(pixelData, 0, 0)
    return await canvas.convertToBlob(config)
}

globalThis.addEventListener(
    'message',
    async (event: MessageEvent<RemoveBackgroundInputEvent>) => {
        if (event.data.action === RemoveBackgroundAction.Init) {
            await init({
                progress_callback: globalThis.postMessage,
            })
        }
        if (event.data.action === RemoveBackgroundAction.Predict) {
            try {
                const output = await predict(event.data.url, event.data.canvas, event.data.config)
                globalThis.postMessage({
                    status: WorkerStatus.Result,
                    output,
                    key: event.data.key,
                })
            }
            catch (error) {
                globalThis.postMessage({
                    status: WorkerStatus.Error,
                    error,
                    key: event.data.key,
                })
            }
        }
    },
)

import {
    env,
    pipeline,
    type PretrainedOptions,
    type Tensor,
    type TextGenerationConfig,
    type TranslationPipeline,
} from '@xenova/transformers'
import {
    type WorkerProgressEvent,
    type WorkerReadyEvent,
    type WorkerInitiateEvent,
    type WorkerDoneEvent,
    type TranslatorInputEvent,
    TranslatorAction,
    WorkerStatus,
} from '../types'

env.allowLocalModels = false

let translator: TranslationPipeline

const init = async (
    model: string = 'Xenova/nllb-200-distilled-600M',
    options?: PretrainedOptions & {
        progress_callback: (
            data:
                | WorkerReadyEvent
                | WorkerProgressEvent
                | WorkerInitiateEvent
                | WorkerDoneEvent
        ) => void
    },
) => {
    translator = (await pipeline(
        'translation',
        model,
        options,
    )) as TranslationPipeline
}

const translate = async (
    text: string,
    config: TextGenerationConfig & {
        tgt_lang?: string
        src_lang?: string
        callback_function?: (
            data: { output_token_ids: number[] | Tensor }[]
        ) => void
    },
) => {
    if (!translator) {
        await init()
    }
    const output = await translator(text, config)
    return Array.isArray(output[0])
        ? output[0].map(item => item.translation_text).join(' ')
        : output[0].translation_text
}

globalThis.addEventListener(
    'message',
    async (event: MessageEvent<TranslatorInputEvent>) => {
        if (event.data.action === TranslatorAction.Init) {
            await init(event.data.model, {
                ...event.data.options,
                progress_callback: globalThis.postMessage,
            })
        }
        if (event.data.action === TranslatorAction.Translate) {
            try {
                const output = await translate(event.data.text, {
                    ...event.data.config,
                    callback_function: (data) => {
                        globalThis.postMessage({
                            status: WorkerStatus.Update,
                            output: translator.tokenizer.decode(
                                data[0].output_token_ids,
                                { skip_special_tokens: true },
                            ),
                            // @ts-expect-error typescript error
                            key: event.data.key,
                        })
                    },
                })
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

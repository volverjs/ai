import type {
    PretrainedOptions,
    TextGenerationConfig,
} from '@xenova/transformers'

export enum TranslatorAction {
    Init = 'init',
    Translate = 'translate',
}

export type TranslatorInitEvent = {
    action: TranslatorAction.Init
    model?: string
    options?: Omit<PretrainedOptions, 'progress_callback'>
}

export type TranslatorTranslateEvent = {
    action: TranslatorAction.Translate
    text: string
    config: Omit<
        TextGenerationConfig & {
            tgt_lang?: string
            src_lang?: string
        },
        'callback_function'
    >
    key: string
}

export type TranslatorInputEvent =
    | TranslatorInitEvent
    | TranslatorTranslateEvent

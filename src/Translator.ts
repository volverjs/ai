import {
    TranslatorAction,
    WorkerStatus,
    type WorkerOutputEvent,
    type WorkerProgressEvent,
    type WorkerReadyEvent,
    type WorkerResultEvent,
    type WorkerUpdateEvent,
} from './types'
import { WorkerProxy } from './WorkerProxy'
import TranslatorWorker from './workers/translator?worker'

export class Translator extends WorkerProxy {
    private _initialized = false
    private _model?: string

    constructor(config?: {
        model?: string
    }) {
        super(new TranslatorWorker())
        this._model = config?.model
    }

    public async init(config?: {
        onProgress?: (progress: WorkerProgressEvent) => void
        signal?: AbortSignal
    }) {
        return new Promise<WorkerReadyEvent>((resolve) => {
            if (this.ready) {
                return resolve({
                    status: WorkerStatus.Ready,
                })
            }
            // add progress callback
            const progressCallback = {
                handler: (data?: WorkerOutputEvent) => {
                    if (data?.status === WorkerStatus.Progress) {
                        config?.onProgress?.(data)
                    }
                },
            }
            this.on(WorkerStatus.Progress, progressCallback)
            config?.signal?.addEventListener('abort', () => {
                this.off(WorkerStatus.Progress, progressCallback)
            })

            // add ready callback
            this.on(WorkerStatus.Ready, {
                handler: (data) => {
                    if (data?.status === WorkerStatus.Ready) {
                        resolve(data)
                        this.off(WorkerStatus.Progress, progressCallback)
                    }
                },
            })

            // send init request
            if (!this._initialized) {
                this.worker.postMessage({
                    action: TranslatorAction.Init,
                    model: this._model,
                })
                this._initialized = true
            }
        })
    }

    public async translate(
        text: string,
        config: {
            from: string
            to: string
            onProgress?: (progress: WorkerProgressEvent) => void
            onUpdate?: (update: WorkerUpdateEvent) => void
            signal?: AbortSignal
        },
    ) {
        return new Promise<WorkerResultEvent<string>>((resolve, reject) => {
            const key = crypto.randomUUID()

            // add update callback
            const updateCallback = {
                handler: (data?: WorkerOutputEvent) => {
                    if (data?.status === WorkerStatus.Update) {
                        config.onUpdate?.(data)
                    }
                },
                key,
            }
            this.on(
                WorkerStatus.Update,
                updateCallback,
            )

            // add error callback
            const errorCallback = {
                handler: (data?: WorkerOutputEvent) => {
                    if (data?.status === WorkerStatus.Error) {
                        reject(data.error)
                        this.off(WorkerStatus.Update, key)
                        this.off(WorkerStatus.Result, key)
                    }
                },
                key,
            }
            this.on(
                WorkerStatus.Error,
                errorCallback,
            )

            // add result callback
            const resultCallback = {
                handler: (data?: WorkerOutputEvent) => {
                    if (data?.status === WorkerStatus.Result) {
                        resolve(data)
                        this.off(WorkerStatus.Update, key)
                        this.off(WorkerStatus.Error, key)
                    }
                },
                key,
            }

            this.on(
                WorkerStatus.Result,
                resultCallback,
            )

            config?.signal?.addEventListener('abort', () => {
                this.off(WorkerStatus.Update, key)
                this.off(WorkerStatus.Result, key)
                this.off(WorkerStatus.Error, key)
            })

            // send translate request after init
            this.init({
                onProgress: config.onProgress,
            }).then(() => {
                this.worker.postMessage({
                    action: TranslatorAction.Translate,
                    text,
                    config: {
                        src_lang: config.from,
                        tgt_lang: config.to,
                    },
                    key,
                })
            })
        })
    }
}

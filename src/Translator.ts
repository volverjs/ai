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

    constructor() {
        super(new TranslatorWorker())
    }

    public async init(
        model?: string,
        downloadCallback?: (progress: WorkerProgressEvent) => void,
    ) {
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
                        downloadCallback?.(data)
                    }
                },
            }
            this.addCallback(WorkerStatus.Progress, progressCallback)

            // add ready callback
            this.addCallback(WorkerStatus.Ready, {
                handler: (data) => {
                    if (data?.status === WorkerStatus.Ready) {
                        resolve(data)
                        this.deleteCallback(WorkerStatus.Progress, progressCallback)
                    }
                },
            })

            // send init request
            if (!this._initialized) {
                this.worker.postMessage({
                    action: TranslatorAction.Init,
                    model,
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
            updateCallback?: (progress: WorkerUpdateEvent) => void
        },
    ) {
        return new Promise<WorkerResultEvent<string>>((resolve, reject) => {
            const key = crypto.randomUUID()

            // add update callback
            const updateCallback = {
                handler: (data?: WorkerOutputEvent) => {
                    if (data?.status === WorkerStatus.Update) {
                        config.updateCallback?.(data)
                    }
                },
                key,
            }
            this.addCallback(
                WorkerStatus.Update,
                updateCallback,
            )

            // add result callback
            this.addCallback(
                WorkerStatus.Result,
                {
                    handler: (data) => {
                        if (data?.status === WorkerStatus.Result) {
                            resolve(data)
                            this.deleteCallback(WorkerStatus.Update, updateCallback)
                        }
                    },
                    key,
                },
            )

            // add error callback
            this.addCallback(
                WorkerStatus.Error,
                {
                    handler: (data) => {
                        if (data?.status === WorkerStatus.Error) {
                            reject(data.error)
                            this.deleteCallback(WorkerStatus.Update, updateCallback)
                        }
                    },
                    key,
                },
            )

            // send translate request after init
            this.init().then(() => {
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

import {
    RemoveBackgroundAction,
    WorkerStatus,
    type WorkerOutputEvent,
    type WorkerProgressEvent,
    type WorkerReadyEvent,
    type RemoveBackgroundResult,
    type WorkerResultEvent,
} from './types'
import { WorkerProxy } from './WorkerProxy'
import RemoveBackgroundWorker from './workers/removeBackground?worker'

export class RemoveBackground extends WorkerProxy<RemoveBackgroundResult> {
    private _initialized = false

    constructor() {
        super(new RemoveBackgroundWorker())
    }

    public async init(
        config?: {
            onProgress?: (progress: WorkerProgressEvent) => void
            signal?: AbortSignal
            canvas?: HTMLCanvasElement
        },
    ) {
        return new Promise<WorkerReadyEvent>((resolve) => {
            if (this.ready) {
                return resolve({
                    status: WorkerStatus.Ready,
                })
            }
            // add progress callback
            const progressCallback = {
                handler: (data?: WorkerOutputEvent<RemoveBackgroundResult>) => {
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
                const canvas = config?.canvas?.transferControlToOffscreen()
                this.worker.postMessage({
                    action: RemoveBackgroundAction.Init,
                    canvas,
                }, canvas ? [canvas] : [])
                this._initialized = true
            }
        })
    }

    public async predict(
        url: string,
        config?: {
            canvas?: HTMLCanvasElement
            type?: 'image/jpeg' | 'image/png' | 'image/webp'
            quality?: number
            onProgress?: (progress: WorkerProgressEvent) => void
            signal?: AbortSignal
        },
    ) {
        return new Promise<WorkerResultEvent<RemoveBackgroundResult>>((resolve, reject) => {
            const key = crypto.randomUUID()

            // add result callback
            this.on(
                WorkerStatus.Result,
                {
                    handler: (data) => {
                        if (data?.status === WorkerStatus.Result) {
                            resolve(data)
                        }
                    },
                    key,
                },
            )

            // add error callback
            this.on(
                WorkerStatus.Error,
                {
                    handler: (data) => {
                        if (data?.status === WorkerStatus.Error) {
                            reject(data.error)
                        }
                    },
                    key,
                },
            )

            config?.signal?.addEventListener('abort', () => {
                this.off(WorkerStatus.Result, key)
                this.off(WorkerStatus.Error, key)
            })

            // send translate request after init
            this.init({
                onProgress: config?.onProgress,
                canvas: config?.canvas,
            }).then(() => {
                this.worker.postMessage({
                    action: RemoveBackgroundAction.Predict,
                    url,
                    config: {
                        type: config?.type,
                        quality: config?.quality,
                    },
                    key,
                })
            })
        })
    }
}

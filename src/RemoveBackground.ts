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
                handler: (data?: WorkerOutputEvent<RemoveBackgroundResult>) => {
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
                    action: RemoveBackgroundAction.Init,
                })
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
        },
    ) {
        return new Promise<WorkerResultEvent<RemoveBackgroundResult>>((resolve, reject) => {
            const key = crypto.randomUUID()

            // add result callback
            this.addCallback(
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
            this.addCallback(
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

            // send translate request after init
            this.init().then(() => {
                const offscreen = config?.canvas?.transferControlToOffscreen()
                this.worker.postMessage({
                    action: RemoveBackgroundAction.Predict,
                    url,
                    canvas: offscreen,
                    config: {
                        type: config?.type,
                        quality: config?.quality,
                    },
                    key,
                }, offscreen ? [offscreen] : [])
            })
        })
    }
}

export enum RemoveBackgroundAction {
    Init = 'init',
    Predict = 'predict',
}

export type RemoveBackgroundInitEvent = {
    action: RemoveBackgroundAction.Init
    model?: string
    canvas?: OffscreenCanvas
}

export type RemoveBackgroundPredictEvent = {
    action: RemoveBackgroundAction.Predict
    url: string
    config?: {
        type?: 'image/jpeg' | 'image/png' | 'image/webp'
        quality?: number
    }
    key: string
}

export type RemoveBackgroundInputEvent =
    | RemoveBackgroundInitEvent
    | RemoveBackgroundPredictEvent

export type RemoveBackgroundResult = Blob

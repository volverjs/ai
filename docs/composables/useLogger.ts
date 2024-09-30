const isDev = import.meta.env.DEV

export const useLogger = () => {
    const log = (message: string) => {
        if (isDev)
            // eslint-disable-next-line no-console
            console.log(`[Logger] ${message}`)
    }
    const error = (error: Error) => {
        if (isDev)
            console.error(error)
    }
    return { log, error }
}

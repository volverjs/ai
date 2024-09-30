import { useDark, useToggle } from '@vueuse/core'

const isThemeDark = useDark({
    attribute: 'class',
    valueDark: 'theme theme--dark',
    valueLight: 'theme theme--light',
})

export const useTheme = () => {
    const toggleDark = useToggle(isThemeDark)

    return { toggleDark, isThemeDark }
}

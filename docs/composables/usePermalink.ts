import { type Ref, computed, isRef } from 'vue'

const getPermalink = (source: string) => {
    const [anchor, label] = source.split('</a>')
    return {
        hash: `#${/href="(.*?)"/.exec(anchor)?.[1].split('#')[1]}`,
        label: label.trim(),
    }
}

export const usePermalink = () => {
    const permalinkToPath = (source: string | Ref<string>) => {
        if (isRef(source)) {
            return computed(() => getPermalink(source.value))
        }
        return getPermalink(source)
    }
    return { permalinkToPath }
}

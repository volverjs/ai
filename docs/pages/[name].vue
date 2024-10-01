<script setup>
import PjFooter from '@/components/PjFooter.vue'
import PjHeader from '@/components/PjHeader.vue'
import { useLogger } from '@/composables/useLogger'
import { usePermalink } from '@/composables/usePermalink'
import { useHead } from '@unhead/vue'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { error: logError } = useLogger()

const route = useRoute()
const router = useRouter()
const section = ref('')
const title = ref('')
const description = ref('')
const hero = ref(false)
const permalinks = ref([])
const { permalinkToPath } = usePermalink()
let MainContent
try {
    const { attributes, toc, VueComponentWith } = await import(
        `@/contents/${route.params.name}.md`
    )
    section.value = attributes.section
    title.value = attributes.title
    description.value = attributes.description
    hero.value = attributes.hero
    permalinks.value = toc.map(({ content }) => permalinkToPath(content))
    MainContent = VueComponentWith()
}
catch (error) {
    logError(error)
    router.replace({ name: '/[name]', params: {
        name: 'setup',
    } })
}
const scrollIntoView = (hash) => {
    router.replace({ ...route, hash })
}
useHead({
    title,
    meta: [
        {
            name: 'description',
            content: description,
        },
    ],
})
const wrapperEl = ref()
</script>

<template>
    <div v-if="hero" class="relative border-b border-surface-3 bg-gray-darken-4 overflow-hidden flex justify-center">
        <div class="inset-0 absolute opacity-50 bg-grid bg-blend-screen bg-gray-darken-4" />
        <div class="w-full lg:w-10/12 xl:w-11/12 xxl:w-9/12">
            <div class="flex flex-col sm:flex-row text-center sm:text-left items-center gap-lg px-16 py-lg relative">
                <img
                    src="/volverjs-ai-reduced.svg"
                    alt="@volverjs/ai"
                    width="200"
                    height="200"
                >
                <div>
                    <h1 class="vv-text vv-text--size-1 vv-text--headline font-bold text-gray-lighten-5 block">
                        <span class="text-warning">@volverjs/ai</span><br>
                        Powerful AI Tools Made Easy
                    </h1>
                    <h2 class="vv-text vv-text--size-3 mb-md text-gray-lighten-5 max-w-screen-xs">
                        An Hugging Face Transformers.js wrapper with Web Workers.
                    </h2>
                </div>
            </div>
        </div>
    </div>
    <div ref="wrapperEl" class="flex flex-1 justify-center">
        <div class="w-full lg:w-10/12 xl:w-9/12 xxl:w-7/12 pr-3/12 p-16">
            <PjHeader
                v-if="section || title || description"
                :section
                :title
                :description
            />
            <div class="preflight">
                <Suspense>
                    <MainContent />
                </Suspense>
            </div>
            <PjFooter class="mt-lg" />
        </div>
        <aside
            v-if="permalinks.length"
            class="none xl:block xl:w-2/12 py-16 px-24 right-0"
        >
            <div class="my-lg sticky top-lg">
                <nav class="vv-nav vv-nav--aside">
                    <ul class="vv-nav__menu">
                        <li class="vv-nav__item">
                            <span
                                id="in-this-page-heading"
                                class="vv-nav__heading-label"
                                aria-hidden="true"
                            >
                                On this page
                            </span>
                            <ul
                                class="vv-nav__menu"
                                role="menu"
                                aria-labelledby="in-this-page-heading"
                            >
                                <li
                                    v-for="(
                                        { label, hash }, index
                                    ) in permalinks"
                                    :key="index"
                                    role="presentation"
                                    class="vv-nav__item"
                                >
                                    <a
                                        class="vv-nav__item-label"
                                        role="menuitem"
                                        tabindex="0"
                                        :href="hash"
                                        :class="{
                                            current: route.hash === hash,
                                        }"
                                        @click.prevent="scrollIntoView(hash)"
                                    >
                                        {{ label }}
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    </div>
</template>

<route lang="yaml">
meta:
    layout: default
</route>

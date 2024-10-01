<script setup lang="ts">
import PjProgress from '@/components/PjProgress.vue'
import { VvButton, VvButtonGroup } from '@volverjs/ui-vue/components'
import { ref } from 'vue'
import { useRemoveBackground } from '~/vue'

const DEFAULT_IMAGES = ['https://images.unsplash.com/photo-1494697536454-6f39e2cc972d?q=80&w=1024', 'https://images.unsplash.com/photo-1600352774373-7b992e5189de?q=80&w=1024', 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?q=80&w=1024', 'https://images.unsplash.com/photo-1558981001-792f6c0d5068?q=80&w=1024']

const canvasEl = ref<HTMLCanvasElement>()
const inputEl = ref<HTMLInputElement>()
const { predict, progress } = useRemoveBackground()

const selectedUrl = ref()
const { isLoading, resultUrl } = predict(selectedUrl, {
    canvas: canvasEl,
})

const onClickDownload = () => {
    const a = document.createElement('a')
    a.href = resultUrl.value as string
    a.download = 'result.png'
    a.click()
}
const onClickClear = () => {
    selectedUrl.value = undefined
}
const onClickUpload = () => {
    const input = document.getElementById('droparea') as HTMLInputElement
    input.click()
}
const readFile = (file?: File) => {
    if (!file) {
        return
    }
    const reader = new FileReader()
    reader.onload = () => {
        selectedUrl.value = reader.result as string
    }
    reader.readAsDataURL(file)
}
const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    readFile(target.files?.[0])
}
const isDragging = ref(false)
function onDragenter() {
    isDragging.value = true
}

function onDragleave() {
    isDragging.value = false
}

function onDrop(event: DragEvent) {
    if (!event.dataTransfer?.files) {
        return
    }
    isDragging.value = false
    readFile(event.dataTransfer?.files?.[0])
}
</script>

<template>
    <div
        class="vv-input-file vv-input-file--hidden"
        :class="{ 'vv-input-file--loading': isLoading, 'vv-input-file--dragging': isDragging }"
    >
        <label for="droparea" class="mb-sm">Select an image (from <a href="https://unsplash.com" target="_blank" class="text-brand">Unsplash</a>):</label>
        <ul class="grid grid-cols-4 gap-md mb-md">
            <li v-for="src in DEFAULT_IMAGES" :key="src">
                <button type="button" title="Select" class="cursor-pointer" @click="selectedUrl = src">
                    <img :src="src" alt="Image" class="aspect-square object-cover">
                </button>
            </li>
        </ul>
        <div
            class="vv-input-file__drop-area aspect-photo overflow-visible" @dragenter.prevent.stop="onDragenter"
            @dragleave.prevent.stop="onDragleave"
            @drop.prevent.stop="onDrop"
            @dragover.prevent.stop
        >
            <VvButton v-if="!selectedUrl" label="Click to upload a picture" class="relative z-1" icon="upload" @click="onClickUpload" />
            <picture class="vv-input-file__preview">
                <div class="relative h-full">
                    <canvas
                        ref="canvasEl" class="absolute inset-0 w-full" :class="{
                            'opacity-0': isLoading || !selectedUrl,
                        }"
                    />
                    <img
                        class="h-full"
                        :src="selectedUrl" :class="{
                            'opacity-0': !isLoading,
                        }"
                    >
                </div>
            </picture>
        </div>
        <div class="vv-input-file__wrapper">
            <input
                id="droparea"
                ref="inputEl"
                type="file"
                accept="image/*"
                name="droparea"
                placeholder="Placeholder text"
                aria-describedby="droparea-hint"
                @change="onChange"
            >
        </div>
        <small v-if="isLoading" id="droparea-hint" class="vv-input-file__hint">
            Loading...
        </small>
    </div>
    <VvButtonGroup v-if="resultUrl">
        <VvButton label="Download" icon="akar-icons:download" modifiers="action" :disabled="isLoading" @click="onClickDownload" />
        <VvButton v-if="selectedUrl" modifiers="action-quiet" icon="akar-icons:x-small" label="Clear" :disabled="isLoading" @click="onClickClear" />
    </VvButtonGroup>
    <PjProgress :progress />
</template>

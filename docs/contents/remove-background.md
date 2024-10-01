---
index: 1
section: Get Started
title: Remove Background
description: 'Remove the background from an image using a state-of-the-art background removal AI model, designed to effectively separate foreground from background in a range of categories and image types.'
---

### Create an instance

`@volverjs/ai` uses [briaai/RMBG-1.4](https://huggingface.co/briaai/RMBG-1.4) model.

```typescript
import { RemoveBackground } from '@volverjs/ai'

const removeBackground = new RemoveBackground()
```

### Process an image

To remove the background from an image, use the `predict` method passing the image URL.

```typescript
const sourceImageURL = 'https://example.com/image.jpg'
const result = await removeBackground.predict(sourceImageURL)
```

The URL could be a local file or a remote file. The library automatically downloads the image and processes it.

You can customize the quality and the type of the output image using the `quality` and `type` options.
The `quality` option accepts a number from 0 to 1, and the `type` option accepts the image MIME type.

```typescript
const resultImageBlob = await removeBackground.predict(sourceImageURL, {
    quality: 0.5,
    type: 'image/webp'
})
const resultImageURL = URL.createObjectURL(resultImageBlob)
```

### Canvas

You can pass a canvas element in the DOM to the `predict` method to draw the result directly on the canvas.

```typescript
const canvas = document.getElementById('canvas') as HTMLCanvasElement
removeBackground.predict(sourceImageURL, { canvas })
```

<div class="vv-alert vv-alert--callout vv-alert--info mb-lg">
  <div class="vv-alert__header">
    <div class="vv-alert__title">Info</div>
  </div>
  <div class="vv-alert__content">
    <code>@volverjs/ai</code> use the <a href="https://web.dev/articles/offscreen-canvas" target="_blank">OffscreenCanvas API</a> to delegate the image processing in the canvas to the worker thread.
  </div>
</div>

### Vue.js

If you are using Vue.js, you can use the Composition API to create a reactive background removal.

```markup
<script lang="ts" setup>
import { useRemoveBackground } from '@volverjs/ai/vue'
import { ref } from 'vue'

const sourceImageURL = ref('https://example.com/image.jpg')
const { predict } = useRemoveBackground()
const { resultUrl } = predict(sourceImageURL)
</script>

<template>
    <img :src="sourceImageURL" alt="Source Image">
    <img v-if="resultUrl" :src="resultUrl" alt="Result Image">
</template>
```
The `resultUrl` reactive property contains the URL of the processed image. Change the `sourceImageURL` to trigger the background removal process.

To use a canvas element, pass the canvas element to the `predict` method.

```markup
<script lang="ts" setup>
import { useRemoveBackground } from '@volverjs/ai/vue'
import { ref } from 'vue'

const sourceImageURL = ref('https://example.com/image.jpg')
const canvasEl = ref<HTMLCanvasElement>()
const { predict } = useRemoveBackground()
predict(sourceImageURL, {
    canvas: canvasEl
})
</script>

<template>
    <img :src="sourceImageURL" alt="Source Image">
    <canvas ref="canvasEl"></canvas>
</template>
```

By default, a new worker is created for each `useRemoveBackground` call. You can share the worker across multiple components by passing `global` option.

```typescript
const { predict } = useRemoveBackground({
    global: true
})
```

The model is initialized automatically when you use the `translate` function.
To monitor the download progress, you can use the `progress` reactive property.

```typescript
const { resultUrl, progress } = predict(sourceImageURL)
watch(progress, ({ file, progress: value }) => {
    console.log(`Download of file ${file} with progress: ${value}%`)
})
```

To initialize the model manually, you can use the `init` method.

```typescript
const { init } = useRemoveBackground()
const canvasEl = ref<HTMLCanvasElement>()
onMounted(() => {
    init({
        canvas: canvasEl
    })
})
```

Below is a complete example of a Vue.js component that uses the `useRemoveBackground` function.

```markup
<script lang="ts" setup>
import { useRemoveBackground } from '@volverjs/ai/vue'
import { ref, watch } from 'vue'

const sourceImageURL = ref('https://example.com/image.jpg')
const canvasEl = ref<HTMLCanvasElement>()
const { predict } = useRemoveBackground()
const {
    // Ref<Blob | undefined>
    // the processed image blob
    result,
    // Ref<string | undefined>
    // the processed image URL
    resultUrl,
    // Ref<{file: string, progress: number}[]>
    // the download progress of the model
    progress,
    // Ref<Error | undefined>
    // the error object if an error occurs
    error,
    // Ref<boolean>
    // is true when an error occurs
    isError,
    // Ref<boolean>
    // is true when the model is downloading
    isLoading,
    // Ref<boolean>
    // is true when the model is ready
    isReady,
    // Promise<string>
    // the promise that resolves when the removal is completed
    promise,
    // (sourceUrl?: string) => <Promise<Blob | undefined>>
    // manually execute the removal
    execute
} = predict(
    // Ref<string> | string | undefined
    // the source image URL
    sourceImageURL,
    {
        // the source language
        canvas: canvasEl,
        // the target language
        type: 'image/webp',
        // number (default: 0.5)
        // the quality of the output image
        quality: 0.5,
        // boolean (default: true)
        // set to false to disable the first removal execution
        immediate: true,
    }
)
</script>

<template>
    <img :src="sourceImageURL" alt="Source Image">
    <canvas ref="canvasEl"></canvas>
</template>
```

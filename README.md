<div align="center">

[![volverjs](public/volverjs.svg)](https://volverjs.github.io/ai)

## @volverjs/ai

`ai` `transformers.js` `translation` `offline` `web worker`\
`remove background` `offscreen canvas`

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=volverjs_ai&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=volverjs_ai) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=volverjs_ai&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=volverjs_ai) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=volverjs_ai&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=volverjs_ai)

<br>

maintained with ❤️ by

<br>

[![8 Wave](public/8wave.svg)](https://8wave.it)

<br>

</div>

## Get Started
Volver AI is a Transformers.js wrapper for add AI capabilities to your web applications in a simple way with multithreading support.

### Install

Add the library to your project using your favorite package manager.

```bash
# pnpm
pnpm add @volverjs/ai

# yarn
yarn add @volverjs/ai

# npm
npm i -s @volverjs/ai
```

Then you can import and instantiate the AI functionality you need.

```typescript
import { Translator, RemoveBackground } from '@volverjs/ai'

const translator = new Translator()
const removeBackground = new RemoveBackground()
```

The library automatically downloads and run the model inside a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker).
Using a Web Worker allows the library to run the model in a separate thread, preventing the main thread from blocking.

> [!WARNING]
> Any instance of the AI classes initializes a new Web Worker with the model and manages the communication between the main thread and the worker. If you need to use the same worker in multiple places, you can create a single instance and share it across your application.

### Model initialization

The first time you instantiate the model, it will download the model files from [Hugging Face Hub](https://huggingface.co/docs/hub/index). This process can take a few seconds or minutes depending on the model size and your internet connection.

```typescript
await translator.init()
```

Otherwise the model is initialized automatically when you call any method that requires the model to be loaded.

### Download progress

You can listen to the download progress of the model using the `progress` event.

```typescript
translator.on('progress', ({ file, progrees }) => {
    console.log(`Download progress of ${file} is ${progress}%`)
})
```

Or with `onProgress` initialization option.

```typescript
translator.init({
    onProgress: ({ file, progress }) => {
        console.log(`Download progress of ${file} is ${progress}%`)
    }
})
```

## Translator
Translator allows to convert text from one language to another with the AI model of your choice

### Choose a model

By default, the library uses the [Xenova/nllb-200-distilled-600M](https://huggingface.co/Xenova/nllb-200-distilled-600M) model to translate text.

```typescript
import { Translator } from '@volverjs/ai'

const translator = new Translator()
```
You can change the model by passing the `model` option to the constructor. You can find a list of available models [here](https://huggingface.co/models?pipeline_tag=translation&library=transformers.js&sort=downloads).

```typescript
const translator = new Translator({
    model: 'Xenova/opus-mt-it-en'
})
```

### Translate text

To translate text, use the `translate` method passing the text to translate and the `from` and `to` options with the language codes of the source and target languages.

```typescript
const text = 'Ciao, come stai?'
const translated = await translator.translate(text, {
    from: 'ita_Latn',
    to: 'eng_Latn'
})
```

For `Xenova/nllb-200-distilled-600M` model you can find the full list of supported languages [here](https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200).

### Listen updates

During the translation process, you can get the partial translation using the `onUpdate` option.

```typescript
const text = 'How are you?'
const translated = await translator.translate(text, {
    from: 'eng_Latn',
    to: 'ita_Latn',
    onUpdate: ({ output }) => {
        console.log(`Partial translation: ${output}`)
    }
})
```

### Vue.js

If you are using Vue.js, you can use the Composition API to create a reactive translation.

```vue
<script lang="ts" setup>
import { useTranslator } from '@volverjs/ai/vue'
import { ref } from 'vue'

const text = ref('')
const { translate } = useTranslator()
const { result } = translate(text, {
    from: 'eng_Latn',
    to: 'ita_Latn'
})
</script>

<template>
    <input v-model="text" type="text" name="from">
    <p>{{ result }}</p>
</template>
```

> [!TIP]
> The `result` reactive property contains the partial translation during process and the final result when the translation is completed.

You can use a custom model by passing the `model` option to the `useTranslator` function.

```typescript
const { translate } = useTranslator({
    model: 'Xenova/opus-mt-it-en'
})
```

By default, a new worker is created for each `useTranslator` call. You can share the worker across multiple components by passing `global` option.

```typescript
const { translate } = useTranslator({
    global: true
})
```

The model is initialized automatically when you use the `translate` function.
To monitor the download progress, you can use the `progress` reactive property.

```typescript
const { result, progress } = translate(text, {
    from: 'eng_Latn',
    to: 'ita_Latn'
})
watch(progress, ({ file, progress: value }) => {
    console.log(`Download of file ${file} with progress: ${value}%`)
})
```

To initialize the model manually, you can use the `init` method.

```typescript
const { init } = useTranslator()
const { isReady, progress } = init()
```

Below is a complete example of a Vue.js component that uses the `useTranslator` function.

```vue
<script lang="ts" setup>
import { useTranslator } from '@volverjs/ai/vue'
import { ref, watch } from 'vue'

const text = ref('')
const { translate } = useTranslator()
const {
    // Ref<string>
    // the partial translation and the final result
    result,
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
    // the promise that resolves when the translation is completed
    promise,
    // (text?: string) => Promise<string | undefined>
    // manually execute the translation
    execute
} = translate(
    // Ref<string> | string | undefined
    // the text to translate
    text,
    {
        // the source language
        from: 'eng_Latn',
        // the target language
        to: 'ita_Latn',
        // boolean (default: true)
        // set to false to disable the first translation execution
        immediate: true,
        // number (default: 500)
        // the debounce time in milliseconds to wait before executing the translation
        debounce: 800
    }
)
</script>

<template>
    <input v-model="text" type="text" name="from">
    <p>{{ result }}</p>
</template>
```

## Remove Background
Remove the background from an image using a state-of-the-art background removal AI model, designed to effectively separate foreground from background in a range of categories and image types.

### Create an instance

`@volverjs/ai` uses [briaai/RMBG-1.4](https://huggingface.co/briaai/RMBG-1.4) model to remove the background from an image.

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

> [!TIP]
> `@volverjs/ai` use the [OffscreenCanvas API](https://web.dev/articles/offscreen-canvas) to delegate the image processing in the canvas to the worker thread.

### Vue.js

If you are using Vue.js, you can use the Composition API to create a reactive background removal.

```vue
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

```vue
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
    <canvas ref="canvasEl" />
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

```vue
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
    <canvas ref="canvasEl" />
</template>
```

## Documentation
To learn more about `@volverjs/ai`, check [its documentation](https://volverjs.github.io/ai).

## License
[MIT](http://opensource.org/licenses/MIT)

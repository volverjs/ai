---
index: 1
section: Get Started
title: Translator
description: 'Translator allows to convert text from one language to another with the AI model of your choice.'
---

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

```markup
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
<div class="vv-alert vv-alert--callout vv-alert--info mb-md">
  <div class="vv-alert__header">
    <div class="vv-alert__title">Info</div>
  </div>
  <div class="vv-alert__content">The <code>result</code> reactive property contains the <strong>partial translation</strong> during process
   and the <strong>final result</strong> when the translation is completed.</div>
</div>

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

```markup
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

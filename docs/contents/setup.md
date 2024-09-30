---
index: 0
section: Get Started
title: Setup
description: 'Volver AI is a Transformers.js wrapper for add AI capabilities to your web applications in a simple way with multithreading support.'
---

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
import { Translator } from '@volverjs/ai'

const translator = new Translator()
```

The library automatically downloads and run the model inside a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker).
Using a Web Worker allows the library to run the model in a separate thread, preventing the main thread from blocking.

<div class="vv-alert vv-alert--callout vv-alert--info mb-lg">
  <div class="vv-alert__header">
    <div class="vv-alert__title">Info</div>
  </div>
  <div class="vv-alert__content">Any instance of the AI classes initializes a new Web Worker with the model and manages the communication between the main thread and the worker. If you need to use the same worker in multiple places, you can create a single instance and share it across your application.</div>
</div>

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

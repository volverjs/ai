<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import { useTranslator } from '../../src/vue'

// const { translate } = useTranslator()
// const { result } = translate('Massimale', {
//     from: 'ita_Latn',
//     to: 'eng_Latn',
// })
// watch(result, (val) => {
//     console.log(val)
// })

import { RemoveBackground } from '../../src'

const URL = 'https://images.unsplash.com/photo-1670509295484-df0c2512fec4?q=80&w=1024'

const item = new RemoveBackground()

const canvasEl = ref()
const src = ref()

onMounted(async () => {
    const { output } = await item.predict(URL, {
        canvas: canvasEl.value,
        type: 'image/jpeg',
    })
    src.value = window.URL.createObjectURL(output)
})
</script>

<template>
    <div>
        <canvas ref="canvasEl" />
        <img :src>
    </div>
</template>

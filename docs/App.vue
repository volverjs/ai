<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
    titleTemplate: title =>
        title ? `${title} | @volverjs/ai` : '@volverjs/ai',
})
</script>

<template>
    <RouterView />
</template>

<script setup lang="ts">
defineProps<{
    section?: string
    title?: string
    description?: string
}>()
</script>

<template>
    <header class="my-lg">
        <span
            v-if="section"
            class="vv-text vv-text--size-5 font-semibold text-brand capitalize"
        >
            {{ section }}
        </span>
        <h1
            v-if="title"
            class="vv-text vv-text--size-1 font-bold flex-1 mr-auto"
        >
            {{ title }}
        </h1>
        <h2
            v-if="description"
            class="vv-text vv-text--size-4 text-word-2 max-w-prose"
        >
            {{ description }}
        </h2>
    </header>
</template>

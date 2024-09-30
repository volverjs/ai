<script setup lang="ts">
import { VvProgress } from '@volverjs/ui-vue/components'

defineProps<{
    progress: Record<string, number>
}>()
</script>

<template>
    <ul class="flex flex-col gap-md">
        <li v-for="(value, label) in progress" :key="label">
            <label :for="label" class="flex text-xs items-baseline text-word-3 mb-xs text-ellipsis">
                {{ label }}
                <small class="ml-auto text-smaller">{{ Math.floor(value) }}%</small>
            </label>
            <VvProgress :id="label" max="100" :value :label />
        </li>
    </ul>
</template>

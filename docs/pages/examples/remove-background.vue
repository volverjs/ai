<script setup lang="ts">
import PjFooter from '@/components/PjFooter.vue'
import PjHeader from '@/components/PjHeader.vue'
import PjRemoveBackgroundExample from '@/components/PjRemoveBackgroundExample.vue'
</script>

<template>
    <div class="flex flex-1 justify-center">
        <div class="w-full lg:w-10/12 xl:w-9/12 xxl:w-7/12 pr-3/12 p-16">
            <PjHeader
                section="Examples"
                title="Remove Background"
                description="Here are some examples of how to use the remove background feature."
            />
            <div class="preflight mb-lg">
                <h3>Preview and Download</h3>
                <p>
                    This example shows how to use <code>@volverjs/ai</code> to remove background of an image with <a href="https://huggingface.co/briaai/RMBG-1.4" target="_blank"><code>briaai/RMBG-1.4</code></a>.
                    Choose one from the available images or upload your own. The result will be displayed below and you can download it.
                </p>
            </div>
            <PjRemoveBackgroundExample />
            <PjFooter class="mt-lg" />
        </div>
    </div>
</template>

<style lang="scss">
.initial-letter {
    &::first-letter {
        initial-letter: 3;
        margin-right: .75em;
    }
}
</style>

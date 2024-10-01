<script setup lang="ts">
import PjFooter from '@/components/PjFooter.vue'
import PjHeader from '@/components/PjHeader.vue'
import PjTranslatorInlineExample from '@/components/PjTranslatorInlineExample.vue'
import PjTranslatorTextExample from '@/components/PjTranslatorTextExample.vue'
import PjTranslatorYamlExample from '@/components/PjTranslatorYamlExample.vue'
</script>

<template>
    <div class="flex flex-1 justify-center">
        <div class="w-full lg:w-10/12 xl:w-9/12 xxl:w-7/12 pr-3/12 p-16">
            <PjHeader
                section="Examples"
                title="Translator"
                description="Here are some examples of how to use the translator."
            />
            <div class="preflight">
                <h3>Google-like Translator</h3>
                <p>
                    This example shows how to use <code>@volverjs/ai</code> to translate text with <a href="https://huggingface.co/Xenova/nllb-200-distilled-600M" target="_blank"><code>Xenova/nllb-200-distilled-600M</code></a>. Choose the languages you want to translate from and to, then paste the text you want to translate. The result will be displayed in the right textarea.
                </p>
            </div>
            <div class="vv-alert vv-alert--callout vv-alert--warning mb-md">
                <div class="vv-alert__header">
                    <div class="vv-alert__title">
                        Warning
                    </div>
                </div>
                <div class="vv-alert__content">
                    <strong class="font-bold block">Mobile devices may experience performance issues.</strong>
                    This example uses a large model that may take from a few seconds to a few minutes to load, please be patient.
                    For a faster experience, you can use a smaller model as shown in the next example.
                </div>
            </div>
            <PjTranslatorTextExample />
            <div class="preflight">
                <h3>YAML Translator</h3>
                <p>
                    Test of the smaller model <a href="https://huggingface.co/Xenova/opus-mt-en-it" target="_blank"><code>Xenova/opus-mt-en-it</code></a> to translate a YAML file from English to Italian. The result will be displayed in the right code editor.
                </p>
            </div>
            <PjTranslatorYamlExample />
            <div class="preflight">
                <h3>Context Menu Translator</h3>
                <p>
                    Select a text from the paragraph below and right-click to translate it. The translation will be displayed in a dropdown menu.
                </p>
            </div>
            <PjTranslatorInlineExample />
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

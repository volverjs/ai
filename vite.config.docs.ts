import path from 'node:path'
import ESLint from '@nabla/vite-plugin-eslint'
import vue from '@vitejs/plugin-vue'
import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItPrism from 'markdown-it-prism'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import { plugin as Markdown, Mode } from 'vite-plugin-markdown'
import Stylelint from 'vite-plugin-stylelint'
import Layouts from 'vite-plugin-vue-layouts'
import packageJson from './package.json'

export default defineConfig({
    resolve: {
        alias: {
            '~/': `${path.resolve(__dirname, 'src')}/`,
            '@/': `${path.resolve(__dirname, 'docs')}/`,
        },
    },

    build: {
        outDir: 'dist-docs',
    },

    plugins: [
        // https://github.com/vitejs/vite-plugin-vue
        vue(),

        // https://github.com/posva/unplugin-vue-router
        VueRouter({
            root: './docs',
            routesFolder: 'pages',
            routeBlockLang: 'yaml',
        }),

        // https://github.com/ModyQyW/vite-plugin-stylelint
        Stylelint(),

        // https://github.com/hmsk/vite-plugin-markdown
        Markdown({
            mode: [Mode.HTML, Mode.VUE, Mode.TOC],
            markdownIt: MarkdownIt({ html: true, linkify: true })
                .use(MarkdownItPrism)
                .use(MarkdownItAnchor, {
                    permalink: MarkdownItAnchor.permalink.ariaHidden({
                        placement: 'before',
                        renderAttrs: () => ({ tabindex: -1 }),
                    }),
                }),
        }),

        // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
        Layouts({
            layoutsDirs: 'docs/layouts',
            pagesDirs: 'docs/pages',
        }),

        // https://github.com/gxmari007/vite-plugin-eslint
        ESLint(),
    ],

    define: {
        __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
    },

    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "./docs/assets/scss/settings" as *;`,
                silenceDeprecations: ['color-functions', 'legacy-js-api'],
            },
        },
    },
})

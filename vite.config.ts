import path from 'node:path'
import ESLint from '@nabla/vite-plugin-eslint'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default () => {
    return defineConfig({
        base: './',

        publicDir: false,

        resolve: {
            alias: {
                '~/': `${path.resolve(__dirname, 'src')}/`,
            },
        },

        test: {
            globals: true,
            environment: 'happy-dom',
            setupFiles: ['@vitest/web-worker'],
            testTimeout: 100000000,
        },

        build: {
            lib: {
                name: '@volverjs/ai',
                formats: ['es'],
                entry: {
                    'index': path.resolve(__dirname, 'src/index.ts'),
                    'vue/index': path.resolve(__dirname, 'src/vue/index.ts'),
                },
                fileName: (_format, entryName) => `${entryName}.js`,
            },
            rollupOptions: {
                external: ['vue'],
                output: {
                    exports: 'named',
                    globals: {
                        vue: 'Vue',
                    },
                },
            },
        },
        plugins: [
            // https://github.com/vitejs/vite-plugin-vue
            Vue({
                include: [/\.vue$/],
            }),

            // https://github.com/nabla/vite-plugin-eslint
            ESLint(),
        ],
    })
}

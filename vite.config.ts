import path from 'node:path'
import ESLint from '@nabla/vite-plugin-eslint'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default () => {
    return defineConfig({
        base: './',
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
                fileName: (format, entryName) => `${entryName}.js`,
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

            // https://github.com/gxmari007/vite-plugin-eslint
            ESLint(),
        ],
    })
}

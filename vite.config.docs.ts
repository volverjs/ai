import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
    root: 'docs',
    build: {
        outDir: '../dist-docs',
    },
    plugins: [vue()],
})

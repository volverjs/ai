import { createHead } from '@unhead/vue'
import { VolverPlugin } from '@volverjs/ui-vue'
import { normal } from '@volverjs/ui-vue/icons'
import { setupLayouts } from 'virtual:generated-layouts'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'

// create app
const app = createApp(App)

// setup head
const head = createHead()
app.use(head)

// setup router
routes.push({
    path: '/',
    redirect: '/setup',
})
const router = createRouter({
    history: createWebHistory(),
    routes: setupLayouts(routes),
    linkActiveClass: 'selected',
    linkExactActiveClass: 'current',
    scrollBehavior() {
        document.getElementById('main')?.scroll({
            top: 0,
            behavior: 'smooth',
        })
    },
})
app.use(router)

/*
 * Setup Volver
 * https://volver.github.io/ui-vue/
 */
app.use(VolverPlugin, {
    iconsCollections: [normal],
})

app.mount('#app')

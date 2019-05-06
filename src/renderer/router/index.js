import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

function lazyLoadView (name) {
    return () => import(/* webpackChunkName: 'view-[request]' */ `@/views/${name}.vue`)
}

function lazyLoadComp (name, parent) {
    return () => import(/* webpackChunkName: 'comp-[request]' */ `@/components/${parent}/${name}.vue`)
}

export default new Router({
    routes: [
        {
            path: '/',
            component: lazyLoadView('Trackspane')
        },
        {
            path: '/settings',
            component: lazyLoadView('Settings'),
            children: [
                {
                    path: '/',
                    name: 'general-settings',
                    component: lazyLoadComp('General', 'Settings')
                },
                {
                    path: 'ui',
                    name: 'ui-settings',
                    component: lazyLoadComp('UI', 'Settings')
                },
                {
                    path: 'audio',
                    name: 'audio-settings',
                    component: lazyLoadComp('Audio', 'Settings')
                },
            ]
        }
    ]
})

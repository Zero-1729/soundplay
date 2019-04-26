import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            component: require('@/views/Soundpane').default
        },
        {
            path: '/settings',
            component: require('@/views/Settings').default,
            children: [
                {
                    path: '/',
                    component: require('@/components/Settings/General').default
                },
                {
                    path: 'ui',
                    component: require('@/components/Settings/UI').default
                },
                {
                    path: 'audio',
                    component: require('@/components/Settings/Audio').default
                }
            ]
        }
    ]
})

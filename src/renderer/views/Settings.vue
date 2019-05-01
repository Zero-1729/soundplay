<template>
    <div class="main-panel">
        <div class="headings">
            <router-link to="/settings/">
                <h4 :class="{'active-setting': currentSetting == '/'}"
                @click="handle_route_change('/')">
                    General
                </h4>
            </router-link>
            <router-link to="/settings/ui">
                <h4 :class="{'active-setting': currentSetting == 'ui'}"
                @click="handle_route_change('ui')">
                    Interface
                </h4>
            </router-link>
            <router-link to="/settings/audio">
                <h4 :class="{'active-setting': currentSetting == 'audio'}"
                @click="handle_route_change('audio')">
                    Audio
                </h4>
            </router-link>
        </div>

        <!-- Switches between settings routes -->
        <transition :name="transition" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    export default {
        name: 'settings',
        data() {
            return {
                transition: ''
            }
        },
        watch: {
            '$route' (to, from) {
                let routes = ['/', '/ui', '/audio']
                let last = from.path.slice(from.path.lastIndexOf('/'), from.path.length)
                let next = to.path.slice(to.path.lastIndexOf('/'), to.path.length)

                this.transition = routes.indexOf(next) > routes.indexOf(last) ? 'slide-to-right' : 'slide-to-left'
            }
        },
        methods: {
            ...mapActions([
                'setCurrentSetting',
                'cacheRoute'
            ]),

            handle_route_change(childName) {
                this.cacheRoute({
                    type: 'child',
                    name: this.joinRoute('/settings', childName)
                })

                this.setCurrentSetting(childName)
            },

            joinRoute(main, child) {
                return child != '/' ? main + '/' + child : main + child
            }
        },
        computed: {
            ...mapGetters([
                'currentSetting'
            ])
        }
    }
</script>

<style lang="stylus">
    .main-panel
        position absolute
        height 100%
        top 0
        z-index -99999
        width 100%
        user-select none

    .headings
        position absolute
        top 18vh
        width 100%
        display flex
        justify-content space-around
        left 6vw
        h4
            cursor pointer
        h4:hover
            opacity 0.6

    a
        text-decoration none
        text-decoration-color none
        cursor default

    .tight-main
        position absolute
        width 100%
        height 100%
        left 8vw
        top 25vh

    .main-panel .headings h4
        margin-top 0

    .title
        display table-cell
        line-height 1.3
        transition all .3s ease-out
        border-bottom solid transparent 3px

    .option
        width 100%
        position relative
        display inline-block
        transition all .3s ease-out

    .option-item .info
        display flex

    .option-item .info p, .option-item p.info
        margin-top 8px
        font-size 11px

    .option-item .info b
        margin-right 5px

    .option-item input
        height 15px
        margin 5px

    .slide-to-right-enter-active, .slide-to-right-leave-active, .slide-to-left-enter-active, .slide-to-left-leave-active
        opacity 1
        transition all .2s

    .slide-to-right-enter, .slide-to-right-leave-to
        opacity 0
        transform translateX(10px)

    .slide-to-left-enter, .slide-to-left-leave-to
        opacity 0
        transform translateX(-10px)
</style>

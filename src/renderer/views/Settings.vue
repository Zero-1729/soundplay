<template>
    <div class="main-panel">
        <!-- Switches between settings (child) routes -->
        <transition :name="transition" mode="out-in">
            <router-view
                :appLoading="appIsLoading"
                @loadTheme="trigger_load_theme"
                @mutatePlayingCriteria="mutatePlayingCriteria"
                @lockHotKey="lockHotKey"
                @unlockHotKey="unlockHotKey"
                @mutateStatusMessage="mutateStatusMessage"
                @clearJobsFn="handle_clearJobs"
                @setJobsFn="handle_setJobs"
                @appLoading="push_loading_state"
                @syncFiles="handle_sync_files">
            </router-view>
        </transition>
    </div>
</template>

<script>
    export default {
        inheritAttrs: false,
        props: ['appIsLoading'],
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

                // Change transition depending on the depth of the routes
                // ... higher index -> slide from right (next)
                // ... and lower index -> slide from left (previous)
                this.transition = routes.indexOf(next) > routes.indexOf(last) ? 'slide-to-right' : 'slide-to-left'
            }
        },
        methods: {
            trigger_load_theme () {
                this.$emit('loadTheme')
            },

            push_loading_state (arg) {
                this.$emit('appLoading', arg)
            },

            handle_sync_files () {
                this.$emit('syncFiles')
            },

            handle_clearJobs () {
                this.$emit('clearJobsFn', null)
            },

            handle_setJobs (arg) {
                this.$emit('setJobsFn', arg)
            },

            mutatePlayingCriteria (arg) {
                this.$emit('mutatePlayingCriteria', arg)
            },

            mutateStatusMessage (arg) {
                this.$emit('mutateStatusMessage', arg)
            },

            lockHotKey(val) {
                this.$emit('lockHotKey', val)
            },

            unlockHotKey(val) {
                this.$emit('unlockHotKey', val)
            }
        }
    }
</script>

<style lang="stylus">
    .main-panel
        position absolute
        height 100%
        top 0
        left 250px
        z-index -99999
        width 100%
        user-select none

    .tight-main
        position absolute
        width 100%
        height 100%
        left 30px
        top 18vh

    .main-panel .headings h4
        margin-top 0

    .title
        display table-cell
        line-height 1.3
        transition all .3s ease-out
        border-bottom solid transparent 3px

    select:hover, button:hover, .flex .switch:hover
        cursor pointer

    .option
        width 100%
        position relative
        display inline-block
        transition all .3s ease-out

    .option-item
        margin-bottom 18px
        width 68vw

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

    .flex
        display flex
        h3
            margin-bottom 4px
        p
            margin-top 0
        .dialog-button-alt
            margin-left 18px
            width unset

    input#settings-input
        height 22px
        margin-top 7px
        padding-top 0
        align-self center
        border-top none
        border-right none
        border-left none
        border-bottom-width 2px
        border-bottom-style solid
        margin-left 20px
        background transparent
        transition all 0.2s ease-out

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

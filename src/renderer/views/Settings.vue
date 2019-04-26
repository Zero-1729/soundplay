<template>
    <div class="main-panel">
        <div class="headings">
            <router-link to="/settings/">
                <h4 :class="{'active-setting': currentSetting == 'general'}"
                @click="setCurrentSetting('general')">
                    General
                </h4>
            </router-link>
            <router-link to="/settings/ui">
                <h4 :class="{'active-setting': currentSetting == 'ui'}"
                @click="setCurrentSetting('ui')">
                    Interface
                </h4>
            </router-link>
            <router-link to="/settings/audio">
                <h4 :class="{'active-setting': currentSetting == 'audio'}"
                @click="setCurrentSetting('audio')">
                    Audio
                </h4>
            </router-link>
        </div>

        <!-- Switches between settings routes -->
        <router-view></router-view>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    export default {
        name: 'settings',
        watch: {},
        methods: {
            ...mapActions([
                'setCurrentSetting'
            ])
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
</style>

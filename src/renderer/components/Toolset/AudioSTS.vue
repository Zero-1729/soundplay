<template>
    <div class="main-toolset-container-alt">
        <div class="item settings-icon" :class="{ activeIcon: settingsOpen }">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="11.581 465.338 14.7 14.697" width="14.7" height="14.697" @click="toggleSettings">
                <path d=" M 18.468 470.242 C 18.372 470.145 18.372 469.99 18.468 469.894 L 18.781 469.58 C 18.81 469.551 18.844 469.531 18.88 469.52 C 18.756 468.43 19.118 467.288 19.962 466.445 C 21.071 465.336 22.696 465.059 24.044 465.621 L 21.591 468.074 L 21.586 468.73 L 22.889 470.034 L 23.546 470.029 L 25.999 467.576 C 26.561 468.924 26.284 470.549 25.175 471.658 C 24.332 472.502 23.19 472.864 22.1 472.74 C 22.089 472.775 22.069 472.81 22.04 472.839 L 21.726 473.152 C 21.63 473.248 21.474 473.248 21.378 473.152 L 21.422 473.196 Q 20.033 473.46 18.917 474.658 Q 17.263 476.311 13.95 479.625 C 13.406 480.169 12.527 480.172 11.987 479.633 L 11.987 479.633 C 11.448 479.093 11.446 478.209 11.983 477.659 Q 14.482 475.101 16.962 472.703 Q 17.871 471.794 18.424 470.198 L 18.468 470.242 Z " fill-rule="evenodd" />
            </svg>
        </div>
        <div class="item equiliser-icon" :class="{ activeIcon: appAudioEQ.enabled }">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="10.957 462 15.948 16.379" width="15.948" height="16.379" @click="toggleAudioEQVisibility">
                <path d=" M 15.483 463.724 L 15.483 463.724 C 16.078 463.724 16.561 464.377 16.561 465.181 L 16.561 475.198 C 16.561 476.002 16.078 476.655 15.483 476.655 L 15.483 476.655 C 14.888 476.655 14.406 476.002 14.406 475.198 L 14.406 465.181 C 14.406 464.377 14.888 463.724 15.483 463.724 L 15.483 463.724 L 15.483 463.724 L 15.483 463.724 Z  M 18.931 462 L 18.931 462 C 19.526 462 20.009 462.653 20.009 463.457 L 20.009 476.922 C 20.009 477.726 19.526 478.379 18.931 478.379 L 18.931 478.379 C 18.337 478.379 17.854 477.726 17.854 476.922 L 17.854 463.457 C 17.854 462.653 18.337 462 18.931 462 L 18.931 462 L 18.931 462 L 18.931 462 Z  M 22.38 464.586 L 22.38 464.586 C 22.975 464.586 23.457 465.239 23.457 466.043 L 23.457 474.336 C 23.457 475.14 22.975 475.793 22.38 475.793 L 22.38 475.793 C 21.785 475.793 21.302 475.14 21.302 474.336 L 21.302 466.043 C 21.302 465.239 21.785 464.586 22.38 464.586 L 22.38 464.586 L 22.38 464.586 Z  M 25.828 466.741 L 25.828 466.741 C 26.423 466.741 26.906 467.394 26.906 468.199 L 26.906 472.181 C 26.906 472.985 26.423 473.638 25.828 473.638 L 25.828 473.638 C 25.233 473.638 24.75 472.985 24.75 472.181 L 24.75 468.199 C 24.75 467.394 25.233 466.741 25.828 466.741 L 25.828 466.741 Z  M 12.035 466.741 L 12.035 466.741 C 12.63 466.741 13.113 467.394 13.113 468.199 L 13.113 472.181 C 13.113 472.985 12.63 473.638 12.035 473.638 L 12.035 473.638 C 11.44 473.638 10.957 472.985 10.957 472.181 L 10.957 468.199 C 10.957 467.394 11.44 466.741 12.035 466.741 Z " fill-rule="evenodd"/>
            </svg>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    export default {
        name: 'audio-s-ts',
        watch: {
            settingsOpen (cur, prev) {
                if (cur) {
                    this.$router.push('/settings')

                    // cache the route for next session
                    this.$emit('cacheRoute', {type: 'main', name: '/settings'})

                    this.$emit('cacheRoute', {type: 'child', name: '/settings/'})

                    this.setCurrentSetting('/')
                } else {
                    this.$router.push('/')

                    this.$emit('cacheRoute', {type: 'main', name: '/'})
                }
            }
        },
        methods: {
            ...mapActions([
                'toggleSettings',
                'toggleAudioEQVisibility',
                'setCurrentSetting'
            ])
        },
        computed: {
            ...mapGetters([
                'settingsOpen',
                'appAudioEQ'
            ])
        }
    }
</script>

<style lang="stylus" scoped>
    .main-toolset-container-alt
        position absolute
        top 410px
        left 0
        width 50px
        height 100px
        border-top-right-radius 5px
        border-bottom-right-radius 5px

    .item
        padding 15px

        svg
            height 20px
            width 20px

        svg:active
            transform scale(0.9)

    .icon
        cursor pointer
</style>

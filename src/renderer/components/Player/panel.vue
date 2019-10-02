<template>
    <div class="player-container">
        <div class="panel-holder">
            <div class="image-holder">
                <img v-show="currentTrack.img" id="album-art">
                <svg class="default-album-art" v-show="!track" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="56 56 400 400" width="82.5pt" height="82.5pt"><path d=" M 56 256 C 56 145.617 145.617 56 256 56 C 366.383 56 456 145.617 456 256 C 456 366.383 366.383 456 256 456 C 145.617 456 56 366.383 56 256 Z  M 206 256 C 206 228.404 228.404 206 256 206 C 283.596 206 306 228.404 306 256 C 306 283.596 283.596 306 256 306 C 228.404 306 206 283.596 206 256 Z " fill-rule="evenodd" fill="none"/></svg>
            </div>
            <div class="center-panel">
            <div class="track-info">
                <h4 class="t-title">{{ currentTrack.title }}</h4>
                <h4 class="t-artist">{{ currentTrack.artist }}</h4>

                <div class="middle">
                    <div class="duration">
                        <p>{{ currentTrack.duration ? pos + ' / ' + currentTrack.duration : '- / -'}}</p>
                    </div>
                    <div class="controls">
                        <svg class="shuffle-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 50 50" width="35pt" height="35pt" :class="{on: appAudioPrefs.shuffle}">
                            <path class="stroked" d=" M 26.148 27.236 C 28.417 29.615 28.873 29.386 31.511 29.386 Q 36.716 29.386 35.511 29.386" fill="none" vector-effect="non-scaling-stroke" stroke-width="1" stroke-linejoin="miter" stroke-linecap="round" stroke-miterlimit="3"/>
                            <path class="stroked" d=" M 23 23 C 22.219 22.188 21.209 21 18.571 21 Q 12.366 21 13.571 21" fill="none" vector-effect="non-scaling-stroke" stroke-width="1" stroke-linejoin="miter" stroke-linecap="round" stroke-miterlimit="3"/>
                            <path class="stroked" d=" M 13.398 29 Q 13.552 29 19.398 29 C 25.154 29 23.937 21 30.398 21 Q 35.603 21 34.398 21" fill="none" vector-effect="non-scaling-stroke" stroke-width="1" stroke-linejoin="miter" stroke-linecap="round" stroke-miterlimit="3"/>
                            <path class="filled" d=" M 34.702 22.458 L 34.702 21 L 34.702 19.542 C 34.702 19.373 34.82 19.305 34.967 19.389 L 36.229 20.118 L 37.492 20.847 C 37.638 20.932 37.638 21.068 37.492 21.153 L 36.229 21.882 L 34.967 22.611 C 34.82 22.695 34.702 22.627 34.702 22.458 Z "/>
                            <path class="filled" d=" M 34.702 30.458 L 34.702 29 L 34.702 27.542 C 34.702 27.373 34.82 27.305 34.967 27.389 L 36.229 28.118 L 37.492 28.847 C 37.638 28.932 37.638 29.068 37.492 29.153 L 36.229 29.882 L 34.967 30.611 C 34.82 30.695 34.702 30.627 34.702 30.458 Z "/>
                        </svg>
                        <div class="loop">
                            <svg class="loop-icon" @click="setLoop('single')" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 50 50" width="35pt" height="35pt" :class="{show: !appAudioPrefs.loopSingle && !appAudioPrefs.loopAll, hide: appAudioPrefs.loopAll, on: appAudioPrefs.loopSingle}">
                                <path class="filled" d=" M 23.75 21 L 19.05 21 L 19.05 21 C 16.263 21 14 22.904 14 25.25 L 14 25.25 C 14 27.596 16.263 29.5 19.05 29.5 L 30.95 29.5 C 33.737 29.5 36 27.596 36 25.25 L 36 25.25 C 36 22.904 33.737 21 30.95 21 L 28 21 L 28 20 L 23.75 20 L 23.75 21 Z  M 18.862 20 L 31.138 20 C 34.373 20 37 22.352 37 25.25 L 37 25.25 C 37 28.148 34.373 30.5 31.138 30.5 L 18.862 30.5 C 15.627 30.5 13 28.148 13 25.25 L 13 25.25 C 13 22.352 15.627 20 18.862 20 L 18.862 20 Z " fill-rule="evenodd"/>
                                <path class="filled" d=" M 23 22.254 L 23 20.491 L 23 18.728 C 23 18.524 23.143 18.442 23.319 18.544 L 24.844 19.425 L 26.368 20.306 C 26.544 20.408 26.544 20.574 26.368 20.676 L 24.844 21.557 L 23.319 22.438 C 23.143 22.54 23 22.457 23 22.254 Z "/>
                            </svg>
                            <svg class="loop-icon alt" @click="setLoop('all')"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 50 50" width="35pt" height="35pt" :class="{show: !appAudioPrefs.loopSingle && appAudioPrefs.loopAll, hide: appAudioPrefs.loopSingle || !appAudioPrefs.loopAll, on: appAudioPrefs.loopAll}">
                                <path class="filled" d=" M 19.75 30.5 L 18.862 30.5 C 15.627 30.5 13 28.148 13 25.25 L 13 25.25 C 13 22.352 15.627 20 18.862 20 L 18.862 20 L 25.75 20 L 25.75 21 L 19.05 21 L 19.05 21 C 16.263 21 14 22.904 14 25.25 L 14 25.25 C 14 27.596 16.263 29.5 19.05 29.5 L 30.95 29.5 C 33.737 29.5 36 27.596 36 25.25 L 36 25.25 C 36 22.904 33.737 21 30.95 21 L 30 21 L 30 20 L 31.138 20 C 34.373 20 37 22.352 37 25.25 L 37 25.25 C 37 28.148 34.373 30.5 31.138 30.5 L 24 30.5 L 24 29.5 L 19.75 29.5 L 19.75 30.5 Z " fill-rule="evenodd"/>
                                <path class="filled" d=" M 24 22.254 L 24 20.491 L 24 18.728 C 24 18.524 24.143 18.442 24.319 18.544 L 25.844 19.425 L 27.368 20.306 C 27.544 20.408 27.544 20.574 27.368 20.676 L 25.844 21.557 L 24.319 22.438 C 24.143 22.54 24 22.457 24 22.254 Z "/>
                                <path class="filled" d=" M 26 31.772 L 26 30.009 L 26 28.246 C 26 28.043 25.857 27.96 25.681 28.062 L 24.156 28.943 L 22.632 29.824 C 22.456 29.926 22.456 30.092 22.632 30.194 L 24.156 31.075 L 25.681 31.956 C 25.857 32.058 26 31.976 26 31.772 Z "/>
                            </svg>
                        </div>
                    </div>
                    <div class="volume">
                        <svg @click="handleMute" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 50 50" width="35pt" height="35pt">
                            <g :class="{off: appAudioPrefs.mute}">
                                <path class="filled" d=" M 16.754 22.025 L 18.069 22.025 L 23.302 19.068 C 24.743 18.254 25.914 18.937 25.914 20.592 L 25.914 29.408 C 25.914 31.063 24.743 31.746 23.302 30.932 L 18.069 27.975 L 16.754 27.975 C 16.614 27.975 16.5 27.862 16.5 27.721 L 16.5 22.279 C 16.5 22.138 16.614 22.025 16.754 22.025 Z "/>
                                <path class="stroked" d=" M 29 22.414 Q 30.38 23.364 30.38 25 Q 30.38 26.636 29 27.586" fill="none" vector-effect="non-scaling-stroke" stroke-width="0.8" stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="3"/>
                                <path class="stroked" d=" M 30.379 19.483 Q 33.138 21.51 33.138 25 Q 33.138 28.49 30.379 30.517" fill="none" vector-effect="non-scaling-stroke" stroke-width="0.8" stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="3"/>
                            </g>
                            <g :class="{on: appAudioPrefs.mute, triggered: appAudioPrefs.mute, off: !appAudioPrefs.mute}">
                                <path class="stroked" d=" M 29.375 22.846 L 31.375 25 L 33.375 27.154 L 29.375 22.846 Z  M 29.375 27.154 L 31.375 25 L 33.375 22.846 L 29.375 27.154 Z " fill-rule="evenodd" fill="none" vector-effect="non-scaling-stroke" stroke-width="0.8" stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="3"/>
                                <path class="filled" d=" M 16.879 22.025 L 18.194 22.025 L 23.427 19.068 C 24.868 18.254 26.039 18.937 26.039 20.592 L 26.039 29.408 C 26.039 31.063 24.868 31.746 23.427 30.932 L 18.194 27.975 L 16.879 27.975 C 16.739 27.975 16.625 27.862 16.625 27.721 L 16.625 22.279 C 16.625 22.138 16.739 22.025 16.879 22.025 Z "/>
                            </g>
                        </svg>
                        <input type="range" min="0" max="100" step="6.25" value="appAudioPrefs.volume" class="slider" @change="handleVolume">
                    </div>
                </div>
            </div>
            <div class="lower">
                <div class="waveform" id="waveform" :class="{hide: track == null}"></div>
            </div>
        </div>
        </div>
    </div>
</template>

<script>
    import { mapActions,
            mapGetters } from 'vuex'

    export default {
        props: [
            'track',
            'pos',
            'player'
        ],
        mounted() {
            window.$vue = this
        },
        watch: {
            appAudioPrefs (cur,prev) {
                console.log(cur)
            },
            deepWatch: true
        },
        methods: {
            ...mapActions([
                'toggleMute',
                'setVolume',
                'updateVolume',
                'restoreVolume',
                'setLoop'
            ]),
            handleMute(ev) {
                this.toggleMute()

                // If muted we make volume nil,
                // ... if not we restore the last volume level befor the mute
                if (!this.appAudioPrefs.mute) {
                    this.restoreVolume()
                    this.player.updateVolume(this.appAudioPrefs.lastVolume)
                } else {
                    this.setVolume(0)
                    this.player.mute()
                }
            },
            handleVolume(ev) {
                let volume = ev.target.value / 100

                if (this.appAudioPrefs.mute && volume > 0) {
                    this.toggleMute(false)
                }

                // We only mutate the value when its not mutated
                if (!this.appAudioPrefs.mute) {
                    this.updateVolume(volume)
                    this.player.updateVolume(volume)
                }
            }
        },
        computed: {
            ...mapGetters([
                'appAudioPrefs'
            ]),
            currentTrack() {
                return this.track ? this.track : {
                    title: '-',
                    artist: '-',
                    img: null,
                    duraction: '-'
                }
            },
            volume() {
                return this.appAudioPrefs.volume
            }
        }
    }
</script>

<style lang="stylus">
    .player-container
        width calc(100% - 250px)
        height 110px
        position absolute
        top 0
        left 250px
        display flex
        .panel-holder
            position relative
            width 100%
            height 100%
            display flex
            .image-holder
                width 120px
                height 110px
                margin-right 10px
                img
                    height 110px
                    width 110px
                .default-album-art
                    position absolute
                    height 80px
                    padding 15px 5px
            .center-panel
                display flex
                flex-flow column
                width 100%
                position relative
                .track-info
                    width 100%
                    height 70%
                    position absolute
                    h4
                        text-align center
                        margin-right 120px
                    h4.t-title
                        margin-top 20px
                        margin-bottom 10px
                    h4.t-artist
                        margin-top 0
                .middle
                    position absolute
                    align-items center
                    bottom 0px
                    display flex
                    width 100%
                    .duration
                        margin-right 20px
                        align-self center
                        p
                            font-size 11px
                    .controls
                        display flex
                        .loop
                            position relative
                            .loop-icon
                                cursor pointer
                            svg
                                position absolute
                            svg.show
                                opacity 1
                                z-index 999
                            svg.hide
                                opacity 0
                            svg.on
                                path
                                    fill dodgerblue
                .lower
                    position absolute
                    width calc(100% - 160px)
                    height 32.5px
                    bottom 0
                    .waveform
                        height 100%
                        width 100%
                    .waveform.hide
                        wave
                            opacity 0
                .volume
                    display flex
                    position absolute
                    align-self center
                    right 25px
                    svg
                        align-self center
                        g
                            transition all 0.1s ease-in
                            cursor pointer
                        g.on
                            opacity 1
                        g.on.triggered
                            path
                                fill dodgerblue
                        g.off
                            opacity 0
                    input
                        width 90px
                        height 5px
                        cursor pointer
                        align-self center
                        outline none
</style>

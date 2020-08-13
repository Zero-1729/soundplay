<template>
    <div class="player-container" :class="{collapsed: collapsePane}">
        <div class="panel-holder">
            <div class="image-holder" :class="{darken: loading}">
                <!-- nouveau controls -->
                <!-- prev/play/next -->
                <svg @click="trigger_prev" :class="{moved: showArt}" class="prev" v-if="displayMediaControls" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 25 25" width="25pt" height="25pt"><polygon points="20,25,20,0,0,12.5" fill="rgb(116,116,116)"/><polygon points="25,25,25,0,5,12.5" fill="rgb(116,116,116)"/></svg>

                <svg @click="trigger_playpause" :class="{moved: showArt}" class="play" v-if="displayMediaControls" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 25 25" width="25pt" height="25pt">
                    <polygon points="0,25,0,0,25,12.5" fill="rgb(116,116,116)"/>
                </svg>

                <svg @click="trigger_next" class="next" v-if="displayMediaControls" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 25 25" width="25pt" height="25pt">
                    <polygon points="5,25,5,0,25,12.5" fill="rgb(116,116,116)"/><polygon points="0,25,0,0,20,12.5" fill="rgb(116,116,116)"/>
                </svg>

                <!-- ART -->
                <img id="album-art" :class="{show: showArt}">

                <!-- default ART -->
                <svg class="default-album-art" :class="{show: !showArt, hide: showArt}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="56 56 400 400" width="82.5pt" height="82.5pt">
                    <path d=" M 56 256 C 56 145.617 145.617 56 256 56 C 366.383 56 456 145.617 456 256 C 456 366.383 366.383 456 256 456 C 145.617 456 56 366.383 56 256 Z  M 206 256 C 206 228.404 228.404 206 256 206 C 283.596 206 306 228.404 306 256 C 306 283.596 283.596 306 256 306 C 228.404 306 206 283.596 206 256 Z " fill-rule="evenodd" fill="none"/>
                </svg>
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
                        <svg class="shuffle-icon" @click="toggleShuffle" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 27 14" width="19pt" height="14pt" :class="{on: appAudioPrefs.shuffle}">
                            <path class="stroked" d=" M 14.16 9.236 C 16.429 11.615 16.884 11.386 19.523 11.386 Q 24.728 11.386 23.523 11.386" fill="none" vector-effect="non-scaling-stroke" stroke-width="1" stroke-linejoin="miter" stroke-linecap="round" stroke-miterlimit="3"/>
                            <path class="stroked" d=" M 11.012 5 C 10.23 4.188 9.221 3 6.582 3 Q 0.377 3 1.582 3" fill="none" vector-effect="non-scaling-stroke" stroke-width="1" stroke-linejoin="miter" stroke-linecap="round" stroke-miterlimit="3"/>
                            <path class="stroked" d=" M 1.41 11 Q 1.564 11 7.41 11 C 13.166 11 11.948 3 18.41 3 Q 23.615 3 22.41 3" fill="none" vector-effect="non-scaling-stroke" stroke-width="1" stroke-linejoin="miter" stroke-linecap="round" stroke-miterlimit="3"/>
                            <path class="filled" d=" M 22.714 4.458 L 22.714 3 L 22.714 1.542 C 22.714 1.373 22.832 1.305 22.978 1.389 L 24.241 2.118 L 25.504 2.847 C 25.65 2.932 25.65 3.068 25.504 3.153 L 24.241 3.882 L 22.978 4.611 C 22.832 4.695 22.714 4.627 22.714 4.458 Z " />
                            <path class="filled" d=" M 22.714 12.458 L 22.714 11 L 22.714 9.542 C 22.714 9.373 22.832 9.305 22.978 9.389 L 24.241 10.118 L 25.504 10.847 C 25.65 10.932 25.65 11.068 25.504 11.153 L 24.241 11.882 L 22.978 12.611 C 22.832 12.695 22.714 12.627 22.714 12.458 Z " />
                        </svg>
                        <div class="loop">
                            <svg class="loop-icon" @click="setLoop('single')" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 26 15" width="20pt" height="14pt" :class="{show: !appAudioPrefs.loopSingle && !appAudioPrefs.loopAll, hide: appAudioPrefs.loopAll, on: appAudioPrefs.loopSingle}">
                                    <path class="filled" d=" M 11.75 3.85 L 7.05 3.85 L 7.05 3.85 C 4.263 3.85 2 5.754 2 8.1 L 2 8.1 C 2 10.446 4.263 12.35 7.05 12.35 L 18.95 12.35 C 21.737 12.35 24 10.446 24 8.1 L 24 8.1 C 24 5.754 21.737 3.85 18.95 3.85 L 16 3.85 L 16 2.85 L 11.75 2.85 L 11.75 3.85 Z  M 6.862 2.85 L 19.138 2.85 C 22.373 2.85 25 5.202 25 8.1 L 25 8.1 C 25 10.998 22.373 13.35 19.138 13.35 L 6.862 13.35 C 3.627 13.35 1 10.998 1 8.1 L 1 8.1 C 1 5.202 3.627 2.85 6.862 2.85 L 6.862 2.85 Z " fill-rule="evenodd" />
                                    <path class="filled" d=" M 11 5.104 L 11 3.341 L 11 1.578 C 11 1.374 11.143 1.292 11.319 1.394 L 12.844 2.275 L 14.368 3.156 C 14.544 3.258 14.544 3.424 14.368 3.526 L 12.844 4.407 L 11.319 5.288 C 11.143 5.39 11 5.307 11 5.104 Z " />
                                </svg>
                            <svg class="loop-icon alt" @click="setLoop('all')" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 1 26 12" width="20pt" height="14pt" :class="{show: !appAudioPrefs.loopSingle && appAudioPrefs.loopAll, hide: appAudioPrefs.loopSingle || !appAudioPrefs.loopAll, on: appAudioPrefs.loopAll}">
                                <path class="filled" d=" M 7.75 12.75 L 6.862 12.75 C 3.627 12.75 1 10.398 1 7.5 L 1 7.5 C 1 4.602 3.627 2.25 6.862 2.25 L 6.862 2.25 L 13.75 2.25 L 13.75 3.25 L 7.05 3.25 L 7.05 3.25 C 4.263 3.25 2 5.154 2 7.5 L 2 7.5 C 2 9.846 4.263 11.75 7.05 11.75 L 18.95 11.75 C 21.737 11.75 24 9.846 24 7.5 L 24 7.5 C 24 5.154 21.737 3.25 18.95 3.25 L 18 3.25 L 18 2.25 L 19.138 2.25 C 22.373 2.25 25 4.602 25 7.5 L 25 7.5 C 25 10.398 22.373 12.75 19.138 12.75 L 12 12.75 L 12 11.75 L 7.75 11.75 L 7.75 12.75 Z " fill-rule="evenodd" />
                                <path class="filled" d=" M 12 4.504 L 12 2.741 L 12 0.978 C 12 0.774 12.143 0.692 12.319 0.794 L 13.844 1.675 L 15.368 2.556 C 15.544 2.658 15.544 2.824 15.368 2.926 L 13.844 3.807 L 12.319 4.688 C 12.143 4.79 12 4.707 12 4.504 Z " />
                                <path class="filled" d=" M 14 14.022 L 14 12.259 L 14 10.496 C 14 10.293 13.857 10.21 13.681 10.312 L 12.156 11.193 L 10.632 12.074 C 10.456 12.176 10.456 12.342 10.632 12.444 L 12.156 13.325 L 13.681 14.206 C 13.857 14.308 14 14.226 14 14.022 Z " />
                            </svg>
                        </div>
                    </div>
                    <div class="volume">
                        <svg @click="handleMute" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 19 14" width="13pt" height="10pt">
                            <g :class="{off: appAudioPrefs.mute}">
                                <path class="filled" d=" M 1.254 4.025 L 2.569 4.025 L 7.802 1.068 C 9.243 0.254 10.414 0.937 10.414 2.592 L 10.414 11.408 C 10.414 13.063 9.243 13.746 7.802 12.932 L 2.569 9.975 L 1.254 9.975 C 1.114 9.975 1 9.862 1 9.721 L 1 4.279 C 1 4.138 1.114 4.025 1.254 4.025 Z " />
                                <path class="stroked" d=" M 13.5 4.414 Q 14.88 5.364 14.88 7 Q 14.88 8.636 13.5 9.586" fill="none" vector-effect="non-scaling-stroke" stroke-width="0.8" stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="3"/>
                                <path class="stroked" d=" M 14.879 1.483 Q 17.638 3.51 17.638 7 Q 17.638 10.49 14.879 12.517" fill="none" vector-effect="non-scaling-stroke" stroke-width="0.8" stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="3"/>
                            </g>
                            <g :class="{on: appAudioPrefs.mute, triggered: appAudioPrefs.mute, off: !appAudioPrefs.mute}">
                                <path class="stroked" d=" M 13.75 4.846 L 15.75 7 L 17.75 9.154 L 13.75 4.846 Z  M 13.75 9.154 L 15.75 7 L 17.75 4.846 L 13.75 9.154 Z " fill-rule="evenodd" fill="none" vector-effect="non-scaling-stroke" stroke-width="0.8" stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="3"/>
                                <path class="filled" d=" M 1.254 4.025 L 2.569 4.025 L 7.802 1.068 C 9.243 0.254 10.414 0.937 10.414 2.592 L 10.414 11.408 C 10.414 13.063 9.243 13.746 7.802 12.932 L 2.569 9.975 L 1.254 9.975 C 1.114 9.975 1 9.862 1 9.721 L 1 4.279 C 1 4.138 1.114 4.025 1.254 4.025 Z " />
                            </g>
                        </svg>
                        <input type="range" min="0" max="100" step="6.25" v-model="volume" class="slider">
                    </div>
                </div>
            </div>
            <div class="lower" :class="{darken: loading}">
                <div class="waveform" id="waveform" :class="{hide: track == null}"></div>
            </div>
        </div>
        </div>
    </div>
</template>

<script>
    import { mapActions,
            mapGetters } from 'vuex'

    const { Id }         = require('./../../utils/htmlQuery')

    export default {
        props: [
            'track',
            'pos',
            'player',
            'loading',
            'foundArt'
        ],
        watch: {
            'appAudioPrefs.playbackRate' (cur, prev) {
                this.player.setPlaybackRate(cur)
            },

            foundArt (cur, prev) {
                if (cur) {
                    // Redraw waveform here
                    if (this.player) this.player.device.drawBuffer()
                }
            }
        },
        methods: {
            ...mapActions([
                'setLoop',
                'toggleMute',
                'toggleShuffle',
                'updateVolume'
            ]),

            // Controls
            // Prev, Play/Pause, Next
            trigger_prev() {
                this.$emit("prev")
            },

            trigger_playpause() {
                this.$emit("playpause")
            },

            trigger_next() {
                this.$emit("next")
            },

            handleMute(ev) {
                this.toggleMute()
            },

            handleVolume(val) {
                let volume = val / 100

                if (this.appAudioPrefs.mute && volume > 0) {
                    this.toggleMute(false)
                }

                // We only mutate the value when its not mutated
                if (!this.appAudioPrefs.mute) {
                    this.updateVolume(volume)
                }
            }
        },
        computed: {
            ...mapGetters([
                'appAudioPrefs',
                'displayMediaControls',
                'collapsePane'
            ]),

            currentTrack() {
                return this.track && !this.loading? this.track : {
                    title: '-',
                    artist: '-',
                    img: null,
                    duraction: '-'
                }
            },
            showArt() {
                return this.foundArt && this.player ? (!this.player.cleared) : false
            },
            volume: {
                set(val) {
                    this.handleVolume(val)
                },
                get() {
                    return this.appAudioPrefs.volume * 100
                }
            }
        }
    }
</script>

<style lang="stylus">
    .darken
        opacity 0.2

    div.player-container.collapsed
        width calc(100% - 76px)
        left 76px

    .player-container
        width calc(100% - 274px)
        height 110px
        position absolute
        top 0
        left 274px
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
                display flex
                position relative
                z-index 9999
                #album-art.show
                    opacity 1
                #album-art
                    opacity 0
                    height 110px
                .default-album-art.show
                    opacity 1
                .default-album-art.hide
                    opacity 0
                .default-album-art
                    position absolute
                    height 80px
                    padding 15px 5px
                svg.prev, svg.play, svg.next
                    position absolute
                    opacity 0
                    transition all 0.4s ease
                    z-index 99999
                svg.prev:hover, svg.play:hover, svg.next:hover
                    opacity 1
                    cursor pointer
                svg.prev, svg.play, svg.next
                    align-self center
                svg.prev, svg.next
                    height 15px
                svg.prev
                    left 15px
                svg.prev.moved
                    left 0px
                svg.next
                    right 0px
                svg.play
                    left 48px
                    height 30px
                svg.play.moved
                    left 40px
                    height 25px
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
                        font-weight 100
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
                        .shuffle-icon
                            cursor pointer
                            margin-right 14px
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
                .lower
                    position absolute
                    width calc(100% - 160px)
                    height 32.5px
                    bottom 0
                    .waveform
                        height 100%
                        width 100%
                        wave
                            cursor pointer
                    .waveform.hide
                        wave
                            opacity 0
                            cursor default
                .volume
                    display flex
                    position absolute
                    align-self center
                    right 25px
                    svg
                        align-self center
                        cursor pointer
                        margin-right 8px
                        g
                            transition all 0.1s ease-in
                        g.on
                            opacity 1
                        g.off
                            opacity 0
                    input[type="range"]
                        overflow hidden
                        width 90px
                        height 5px
                        cursor pointer
                        align-self center
                        outline none
                        -webkit-appearance none
                        border-radius 25px
                    input[type="range"]::-webkit-slider-runnable-track
                        -webkit-appearance none
                    input[type="range"]::-webkit-slider-thumb
                        -webkit-appearance none
                        width 12px
                        height 5px
</style>

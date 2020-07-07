<template>
    <div class="tight-main">
        <div class="option">
            <div class="option-item">
                <div class="flex">
                    <h3>
                        Audio playback rate
                    </h3>

                    <p class="pushed">{{ playbackRate }}</p>
                    <div class="arrow-btns">
                        <button class="arrow-down-btn arrow" @click="handle_playbackrate(-1)">-</button>
                        <button class="arrow-up-btn arrow" @click="handle_playbackrate(1)">+</button>
                    </div>
                </div>
                <p class="info">
                    Speed up or slowdown the player playback. Default is 1.00 (i.e. normal speed).
                </p>
            </div>

             <div class="option-item">
                <div class="flex">
                    <h3>
                        Playback behavior
                    </h3>

                    <select class="further" v-model="currentBehaviour">
                        <option v-for="behaviour in behaviours" v-bind:value="behaviour">
                            {{ behaviour }}
                        </option>
                    </select>
                </div>
                <p class="info">
                    Set whether player should be cleared or player cursor reset when playback finished.
                </p>
            </div>

            <div class="option-item">
                <div class="flex">
                    <h3>
                        Persisted play history
                    </h3>
                    <label class="switch further" :class="{checked: persistedHistory}">
                        <input type="checkbox" v-model="persistedHistory"/>
                        <span class="slider" :class="{checked: persistedHistory}"></span>
                    </label>
                </div>
                <p class="info">
                    Keep track of played track history outside shuffle mode.
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions }         from 'vuex'

    export default {
        name: 'audio-settings',
        data() {
            return {
                behaviours: [
                    'clear',
                    'reset'
                ]
            }
        },
        methods: {
            ...mapActions([
                'setAudioPlayback',
                'setAudioPlaybackBehaviour',
                'setPersistedHistory'
            ]),

            handle_playbackrate(val) {
                let oldval = this.appAudioPrefs.playbackRate

                if (val == 1) {
                    // Increase
                    this.setAudioPlayback((oldval < 2) ? oldval + 0.25 : oldval)
                } else {
                    // Reduce
                    this.setAudioPlayback((oldval > 0.5) ? oldval - 0.25 : oldval)
                }
            }
        },
        computed: {
            ...mapGetters([
                'appAudioPrefs',
                'appAudioPlaybackBehaviour'
            ]),

            playbackRate () {
                return this.appAudioPrefs.playbackRate.toFixed(2)
            },

            persistedHistory: {
                get() {
                    return this.appAudioPrefs.persistedHistory
                },
                set(value) {
                    this.setPersistedHistory(value)
                }
            },

            currentBehaviour: {
                get() {
                    return this.appAudioPlaybackBehaviour
                },
                set(value) {
                    this.setAudioPlaybackBehaviour(value)
                }
            }
        }
    }
</script>

<style lang='stylus' scoped>
    select.further
        margin-left 324px
        width 62px
        margin-top 14px
        height 24px

    input#settings-input
        margin-left 300px

    .flex .switch.further
        margin-left 328px
        .slider
            transition left .4s

    p.pushed
        margin-left 292px
        margin-bottom 10px
        align-self flex-end

    .arrow-btns
        display flex
        margin-left 15px
        button
            height 20px
            border none
            align-self center
        button:hover
            opacity 0.9
    
    .arrow-up-btn
        border-top-right-radius 5px
        border-bottom-right-radius 5px
        margin-left 1px

    .arrow-down-btn
        border-top-left-radius 5px
        border-bottom-left-radius 5px
</style>

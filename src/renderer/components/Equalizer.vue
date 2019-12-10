<template>
    <div class="eq-container" :class="{invisible: !appAudioEQ.visible}">
        <div class="preset-container">
            <h4 class="heading">Equalizer</h4>

            <!-- Only appears when 'EQ channels are mutated' -->
            <h4 class="reset-text" :class="{'visible-reset-text': channelMutex == false, 'invisible-reset-text': channelMutex == true}"
            @click="resetChannels">
                Reset
            </h4>

            <h4 class="enable-text">Enable</h4>
            <input type="checkbox" class="enable-checkbox" @click="handler_toggleAudioEQ" :checked="appAudioEQ.enabled">

            <div class="preset-input">
                <select @change="setEQ()" :disabled="appAudioEQ.enabled == false">
                    <option v-for="preset in presets">
                        {{ preset }}
                    </option>
                </select>
            </div>
        </div>
        <div class="eq-inner-container" :class="{'disabled': appAudioEQ.enabled == false, 'enabled': appAudioEQ.enabled == true}">
            <div class="eq">
                <div class="preamp-container">
                    <input type="range" class="preamp" v-model="Preamp" :disabled="appAudioEQ.enabled == false">
                    <div class="etches">
                        <!-- I know its not the best solution -->
                        <p>- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+20 dB</p>
                        <p>-</p>
                        <p>-</p>
                        <p>-</p>
                        <p>- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0 dB</p>
                        <p>-</p>
                        <p>-</p>
                        <p>-</p>
                        <p>- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-20 dB</p>
                    </div>
                </div>
                <p class="preamp-text">Preamp</p>

                <div class="Hz-container">
                    <label class="label-three">600</label>
                    <input type="range" class="Hz-item" :disabled="appAudioEQ.enabled == false" v-model="Hz_600">

                    <label class="label-three">310</label>
                    <input type="range" class="Hz-item" :disabled="appAudioEQ.enabled == false" v-model="Hz_310">

                    <label class="label-three">170</label>
                    <input type="range" class="Hz-item" :disabled="appAudioEQ.enabled == false" v-model="Hz_170">

                    <label class="label-two">60</label>
                    <input type="range" class="Hz-item" :disabled="appAudioEQ.enabled == false" v-model="Hz_60">
                </div>
                <div class="KHz-container">
                    <label class="label-three">16K</label>
                    <input type="range" class="KHz-item" :disabled="appAudioEQ.enabled == false" v-model="KHz_16">

                    <label class="label-three">14K</label>
                    <input type="range" class="KHz-item" :disabled="appAudioEQ.enabled == false" v-model="KHz_14">

                    <label class="label-three">12K</label>
                    <input type="range" class="KHz-item" :disabled="appAudioEQ.enabled == false" v-model="KHz_12">

                    <label class="label-two">6K</label>
                    <input type="range" class="KHz-item" :disabled="appAudioEQ.enabled == false" v-model="KHz_6">

                    <label class="label-two">3K</label>
                    <input type="range" class="KHz-item" :disabled="appAudioEQ.enabled == false" v-model="KHz_3">

                    <label class="label-two">1K</label>
                    <input type="range" class="KHz-item" :disabled="appAudioEQ.enabled == false" v-model="KHz_1">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions,
            mapGetters }        from 'vuex'

    import { TagNameSingle,
            ClassNameSingle }   from './../utils/htmlQuery'

    const presetEQs  = require('./../data/preset_eqs.json')

    export default {
        props: [
            'player'
        ],
        data() {
            return {
                presets: [
                    'Flat',
                    'Headphones',
                    'Bass Boost',
                    'Treble Boost',
                    'Bass + Treble Boost',
                    'Pop',
                    'Rock',
                    'Soft Rock',
                    'Dance',
                    'Techno',
                    'Reggae',
                    'Ska',
                    'Soft',
                    'Classical',
                    'Large Hall',
                    'Live',
                    'Party',
                    'Club'
                ],
                channelMutex: true
            }
        },

        watch: {
            'appAudioEQ.enabled' (cur, prev) {
                if (cur) {
                    this.player.initEQ(this.appAudioEQ.channels)
                } else { this.player.resetEQ() }
            }
        },

        methods: {
            ...mapActions([
                'toggleAudioEQ',
                'setAudioEQLevel',
                'setAllAudioEQChannels'
            ]),

            handler_toggleAudioEQ() {
                this.toggleAudioEQ(event.target.checked)
            },

            resetChannels() {
                this.channelMutex = true

                this.setEQ(TagNameSingle('select').value)
            },

            setEQLevel(range, level, value) {
                // For individual EQ channel setting
                this.setAudioEQLevel({
                    channel: level != null ? range + '_' + level : range,
                    value: this.translateValue(value)
                })

                // Unlock mutex
                this.channelMutex = false
            },

            setEQ(value) {
                // Setting preset for EQ
                let preset = !value ? event.target.value : value

                this.setAllAudioEQChannels({preset: preset, channels: presetEQs[preset]})

                // Also sync setting with player
                this.player.initEQ(presetEQs[preset])
            },

            flipValue(val) {
                // Remember our 'range' inputs are upside down
                // ... so we need to sanitize our values
                // ... and the max is '20' not '100', while the min is '-20' not '0'
                return 100 - val
            },

            translateValue(val) {
                // Translate values from the '0-100' scale into '-20 - 20' scale
                return ((this.flipValue(val) * 2) / 5) - 20
            },

            reverseValue(val) {
                return this.flipValue(((val + 20) * 5) / 2)
            }
        },
        computed: {
            ...mapGetters([
                'appAudioEQ'
            ]),

            // EQ channels
            Preamp: {
                get() {
                    return this.reverseValue(this.appAudioEQ.channels.preamp)
                },
                set (value) {
                    this.setEQLevel('preamp', null, value)
                }
            },

            Hz_60: {
                get() {
                    return this.reverseValue(this.appAudioEQ.channels.Hz_60)
                },
                set(value) {
                    this.setEQLevel('Hz', 60, value)
                }
            },

            Hz_170: {
                get() {
                    return this.reverseValue(this.appAudioEQ.channels.Hz_170)
                },
                set(value) {
                    this.setEQLevel('Hz', 170, value)
                }
            },

            Hz_310: {
                get() {
                    return this.reverseValue(this.appAudioEQ.channels.Hz_310)
                },
                set(value) {
                    this.setEQLevel('Hz', 310, value)
                }
            },

            Hz_600: {
                get() {
                    return this.reverseValue(this.appAudioEQ.channels.Hz_600)
                },
                set(value) {
                    this.setEQLevel('Hz', 600, value)
                }
            },

            KHz_1: {
                get() {
                    return this.reverseValue(this.appAudioEQ.channels.KHz_1)
                },
                set(value) {
                    this.setEQLevel('KHz', 1, value)
                }
            },

            KHz_3: {
                get() {
                    return this.reverseValue(this.appAudioEQ.channels.KHz_3)
                },
                set(value) {
                    this.setEQLevel('KHz', 3, value)
                }
            },

            KHz_6: {
                get() {
                    return this.reverseValue(this.appAudioEQ.channels.KHz_6)
                },
                set(value) {
                    this.setEQLevel('KHz', 6, value)
                }
            },

            KHz_12: {
                get() {
                    return this.reverseValue(this.appAudioEQ.channels.KHz_12)
                },
                set(value) {
                    this.setEQLevel('KHz', 12, value)
                }
            },

            KHz_14: {
                get() {
                    return this.reverseValue(this.appAudioEQ.channels.KHz_14)
                },
                set(value) {
                    this.setEQLevel('KHz', 14, value)
                }
            },

            KHz_16: {
                get() {
                    return this.reverseValue(this.appAudioEQ.channels.KHz_16)
                },
                set(value) {
                    this.setEQLevel('KHz', 16, value)
                }
            }
        }
    }
</script>

<style lang="stylus">
    .eq-container
        display flex
        flex-flow column
        position absolute
        width 500px
        top 35vh
        left 33vw
        height 250px
        font-size 11px
        border-radius 2.5px
        h4
            user-select none
        .preset-container
            position relative
            display flex
            height 15%
            padding-top 25px
            h4
                position absolute
                margin 0
            h4.reset-text
                right 246px
                z-index 999
                cursor pointer
            h4.heading
                left 32px
                margin 0
            h4.enable-text
                right 172px
            input
                position absolute
                margin 1.3px 0 0
                right 216px
                cursor pointer

            .preset-input
                position absolute
                margin-top -2px
                right 32px
                z-index 99
                select
                    border-radius 2.5px
                    padding 2px
        .eq-inner-container
            height 72%
            display flex
            .eq
                width 65%
                padding-left 2%
                display flex
                input.preamp, .Hz-container input.Hz-item, .KHz-container input.KHz-item
                    height 3px
                    -webkit-appearance none
                    border-radius 5px
                input.preamp::-webkit-slider-thumb, .Hz-container input.Hz-item::-webkit-slider-thumb, .KHz-container input.KHz-item::-webkit-slider-thumb
                    -webkit-appearance none
                    border-radius 100%
                    height 12px
                    width 12px
                .preamp-container
                    height 25%
                    margin 50px -40px 0 -50px
                    transform rotate(90deg)
                    .etches
                        right 39px
                        transform rotate(270deg)
                        position absolute
                        bottom -8px
                        p
                            margin 5.8px
                            font-size 8px
                p.preamp-text
                    height 0px
                    margin 0
                    position absolute
                    bottom 40px
                    left 36px
                label
                    position absolute
                    transform rotate(270deg)
                    user-select none
                    z-index -999999
                .Hz-container
                    margin 12px 66px 0
                    height 65%
                    transform rotate(90deg)
                    input.Hz-item
                        margin 15px
                    .label-two
                        margin-top -147px
                        padding-top 312px
                    .label-three
                        padding-top 304px
                        margin-top -143px
                .KHz-container
                    height 65%
                    margin 12px 12px 0 -10px
                    transform rotate(90deg)
                    input.KHz-item
                        margin 15px
                    .label-two
                        margin-top -144px
                        padding-top 308px
                    .label-three
                        padding-top 300px
                        margin-top -141px

    .visible-reset-text
        display block

    .invisible-reset-text
        display none

    .disabled
        opacity 0.4

    .enabled
        opacity 1

    .invisible
        display none
</style>

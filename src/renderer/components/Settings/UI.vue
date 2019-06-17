<template>
    <div class="tight-main">
        <div class="option">
            <div class="option-item">
                <div class="flex">
                    <h3>
                        Theme
                    </h3>
                    <select class="furthest" v-model="currentTheme">
                        <option v-for="theme in themes" v-bind:value="theme">
                            {{ theme }}
                        </option>
                    </select>
                </div>
                <p class="info">
                    App's current theme
                </p>
            </div>
        </div>
        <div class="option">
            <div class="option-item">
                <div class="flex">
                    <h3>
                        Night mode theme
                    </h3>
                    <select class="further" v-model="currentNightModeTheme">
                        <option v-for="theme in nightThemes" v-bind:value="theme">
                            {{ theme }}
                        </option>
                    </select>
                </div>
                <p class="info">
                    Night mode theme
                </p>
            </div>
        </div>
        <div class="option">
            <div class="option-item">
                <div class="flex">
                    <h3>
                        Night mode
                    </h3>
                    <label class="switch" :class="{checked: currentNightMode}">
                        <input type="checkbox" v-model="currentNightMode"/>
                        <span class="slider" :class="{checked: currentNightMode}"></span>
                    </label>
                </div>
                <p class="info">
                    Toggle night mode
                </p>
            </div>
        </div>
        <div class="option">
            <div class="option-item">
                <div class="flex">
                    <h3>
                        Auto Night mode
                    </h3>
                    <label class="switch further" :class="{checked: currentAutoNightMode}">
                        <input type="checkbox" v-model="currentAutoNightMode"/>
                        <span class="slider" :class="{checked: currentAutoNightMode}"></span>
                    </label>
                </div>
                <div class="info">
                    <p>
                        Switch to night mode when time is between
                    </p>
                    <input class="info-input-field-nm" v-model="autoNightModeAm" @keydown.up.prevent="handle_input_inc('am')" @keydown.down.prevent="handle_input_dec('am')">
                    <p><b>am</b> and </p>
                    <input class="info-input-field-nm" v-model="autoNightModePm" @keydown.up.prevent="handle_input_inc('pm')" @keydown.down.prevent="handle_input_dec('pm')">
                    <p><b>pm</b></p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions }         from 'vuex'

    import { isNightTime, reformatTo24Hours } from './../../utils/time'

    const schedule = require('node-schedule')

    export default {
        name: 'ui-settings',
        data() {
            return {
                themes: [
                    'light',
                    'night',
                    'dark'
                ],
                nightThemes: [
                    'night',
                    'dark'
                ]
            }
        },
        watch: {
            appNightModeTheme() {
                if (this.appNightMode) {
                    this.loadTheme()
                }
            },
            appAutoNightModeTime(cur, old) {
                let vm = this

                // Check whether in night mode time
                if (this.appAutoNightMode) {
                    let {am, pm} = cur

                    // Reschedule here
                    this.clearJobsFn()

                    this.setJobsFn({
                        start: schedule.scheduleJob({hour: pm, minute: 0}, function () {
                            if (vm.appAutoNightMode) {
                                if (!vm.appNightMode) {
                                    vm.setNightMode(true)
                                }
                            }
                        }),
                        end: schedule.scheduleJob({hour: am, minute: 0}, function () {
                            if (vm.appAutoNightMode) {
                                if (vm.appNightMode) {
                                    vm.setNightMode(false)
                                }
                            }
                        })
                    })

                    if (isNightTime(new Date().getHours(), reformatTo24Hours(pm), am)) {
                        if (!this.appNightMode) {
                            // If the current time after change is in the night
                            // ... turn on night mode
                            this.setNightMode(true)
                        }
                    } else {
                        if (this.appNightMode) {
                            // Otherwise we turn it off
                            this.setNightMode(false)
                        }
                    }
                }
            },
            currentAutoNightMode(cur, old) {
                // Check if autoNightMode is set
                if (cur) {
                    // check whether we are in the night and adjust theme accordingly
                    let { am, pm } = this.appAutoNightModeTime
                    let time = new Date().getHours()

                    if (isNightTime(time, reformatTo24Hours(pm), am) && !this.appNightMode) {
                        this.setNightMode(true)
                    }
                }
            }
        },
        methods: {
            ...mapActions([
                'loadTheme',
                'changeTheme',
                'setNightTheme',
                'toggleNightMode',
                'toggleAutoNightMode',
                'setAutoNightModeAm',
                'setAutoNightModePm',
                'setNightMode',
                'setJobsFn',
                'clearJobsFn'
            ]),
            handle_input_inc(period) {
                let time = Number(event.target.value)

                if (period == 'am') {
                    this.setAutoNightModeAm(time >= 1 && time < 12 ? time + 1 : time)
                } else {
                    this.setAutoNightModePm(time >= 1 && time < 12 ? time + 1: time)
                }
            },
            handle_input_dec(period) {
                let time = Number(event.target.value)

                if (period == 'am') {
                    this.setAutoNightModeAm(time > 1 ? time - 1: time)
                } else {
                    this.setAutoNightModePm(time > 1 ? time - 1: time)
                }
            }
        },
        computed: {
            ...mapGetters([
                'appTheme',
                'appNightMode',
                'appNightModeTheme',
                'appAutoNightMode',
                'appAutoNightModeTime',
                'appScheduleJobs'
            ]),
            currentTheme: {
                get() {
                    return this.appTheme
                },
                set(value) {
                    // If we change back to night mode we have to also toggle out from night mode
                    // ... we need to keep 'nightmode' toggle aware of the current theme
                    if (value == 'light') {
                        this.setNightMode(false)
                    }

                    this.changeTheme(value)
                }
            },
            currentNightModeTheme: {
                get() {
                    return this.appNightModeTheme
                },
                set(value) {
                    this.setNightTheme(value)

                    // If we are in night mode
                    // ... then changing the night mode theme
                    // ... should change the current theme
                    if (this.appNightMode) {
                        this.changeTheme(value)
                    }
                }
            },
            currentNightMode: {
                get() {
                    return this.appNightMode
                },
                set(value) {
                    // Auto night mode is disabled if user toggles out of dark mode
                    if (!value && this.appAutoNightMode) {
                        this.toggleAutoNightMode()
                    }

                    this.toggleNightMode()
                }
            },
            currentAutoNightMode: {
                get() {
                    return this.appAutoNightMode
                },
                set() {
                    this.toggleAutoNightMode()
                }
            },
            autoNightModeAm: {
                get() {
                    return this.appAutoNightModeTime.am
                },
                set(value) {
                    this.setAutoNightModeAm(Number(value))
                }
            },
            autoNightModePm: {
                get() {
                    return this.appAutoNightModeTime.pm
                },
                set(value) {
                    this.setAutoNightModePm(Number(value))
                }
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .flex select
        height 25px
        margin-top auto
        margin-bottom 4px
        width 70px
        border-radius 2.5px
        border none
        cursor pointer

    .flex .furthest
        margin-left 213px

    .flex .further
        margin-left 135px

    label.switch.further
        margin-left 145px

    .flex .switch
        position relative
        display inline-block
        width 45px
        height 20px
        border-radius 34px
        margin-top 12px
        margin-left 180px
        margin-right 110px
        cursor pointer

    .flex .switch input
        opacity 0
        width 0
        height 0

    .flex .slider
        position absolute
        width 20px
        top 0
        left 0
        right 0
        bottom 0
        border-radius 34px
        transition .4s

    .flex .slider.checked
        left 25px

    .info-input-field-nm
        width 20px
        background transparent
        border-top 0
        border-left 0
        border-right 0
        text-align center

    .info-input-field-nm:focus
        border-bottom 2px solid dodgerblue
</style>

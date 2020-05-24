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
                    <label class="switch shorter" :class="{checked: currentNightMode}">
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
            <div class="option-item anm-red">
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
        <div class="option">
            <div class="option-item">
                <div class="flex">
                    <h3>
                        Notifications
                    </h3>
                    <label class="switch" :class="{checked: notifs}">
                        <input type="checkbox" v-model="notifs"/>
                        <span class="slider" :class="{checked: notifs}"></span>
                    </label>
                </div>
                <p class="info">
                    Display App Notifications such as current playing track.
                </p>
            </div>
        </div>
        <div class="option">
            <div class="option-item">
                <div class="flex">
                    <h3>
                        Media controls
                    </h3>
                    <label class="switch media" :class="{checked: showMediaControls}">
                        <input type="checkbox" v-model="showMediaControls"/>
                        <span class="slider" :class="{checked: showMediaControls}"></span>
                    </label>
                </div>
                <p class="info">
                    Display media controls on album art.
                </p>
            </div>
        </div>
        <div class="option">
            <div class="option-item">
                <div class="flex">
                    <h3>
                        Turn on sleep blocker
                    </h3>
                    <label class="switch tsb-red" :class="{checked: lowPowerBlocker}">
                        <input type="checkbox" v-model="lowPowerBlocker"/>
                        <span class="slider" :class="{checked: lowPowerBlocker}"></span>
                    </label>
                </div>
                <p class="info">
                    Prevent the computer from going into lower-power mode (i.e. sleep mode).
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions }  from 'vuex'

    const { isNightTime,
             formatTo24Hours,
             getCurrentTime }          = require('./../../utils/time')

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
                    this.$emit('loadTheme')
                }
            },
            appAutoNightModeTime(cur, old) {
                this.reschedule()
            },

            currentAutoNightMode(cur, old) {
                // Check if autoNightMode is set
                if (cur) {
                    // check whether we are in the night and adjust theme accordingly
                    let { am, pm } = this.appAutoNightModeTime
                    let time = new Date().getHours()

                    if (isNightTime(time, formatTo24Hours(pm), am) && !this.appNightMode) {
                        this.setNightMode(true)
                    }
                }
            },

            lowPowerBlocker(cur, old) {
                this.$emit('handle_sleep_blocker_update', cur)
            }
        },
        methods: {
            ...mapActions([
                'changeTheme',
                'toggleNightMode',
                'toggleAutoNightMode',
                'setNightTheme',
                'setAutoNightModeAm',
                'setAutoNightModePm',
                'setNightMode',
                'displayNotif',
                'setSleepBlocker',
                'setDisplayMediaControls'
            ]),

            reschedule() {
                let vm = this

                // Check whether in night mode time
                if (this.appAutoNightMode) {
                    let {am, pm} = this.appAutoNightModeTime
                    let [hrs, min, sec] = getCurrentTime()

                    // Reschedule here
                    this.$emit('clearJobsFn', null)

                    this.$emit('setJobsFn', {
                        start: schedule.scheduleJob({hour: formatTo24Hours(pm), minute: 10}, function () {
                            if (vm.appAutoNightMode) {
                                if (!vm.appNightMode) {
                                    vm.setNightMode(true)
                                }
                            }
                        }),
                        end: schedule.scheduleJob({hour: am, minute: 10}, function () {
                            if (vm.appAutoNightMode) {
                                if (vm.appNightMode) {
                                    vm.setNightMode(false)
                                }
                            }
                        })
                    })

                    if (isNightTime(hrs, formatTo24Hours(pm), am)) {
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
                'appNotifs',
                'sleepBlocker',
                'displayMediaControls'
            ]),

            currentTheme: {
                get() {
                    return this.appTheme
                },
                set(value) {
                    // The night mode toggle should only be triggered if we change to the 'nightmode' theme
                    // ... else, we toggle it off, to ensure it is (theme) responsive
                    if (this.currentNightModeTheme != value) {
                        this.setNightMode(false)
                    } else {
                        // Force night mode to be toggled
                        // ... that is, if it matches the night mode theme
                        if (this.currentNightModeTheme == value) {
                            this.setNightMode(true)
                        }
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
            },
            notifs: {
                get() {
                    return this.appNotifs
                },
                set(value) {
                    this.displayNotif(value)
                }
            },
            showMediaControls: {
                get() {
                    return this.displayMediaControls
                },
                set(value) {
                    this.setDisplayMediaControls(value)
                }
            },
            lowPowerBlocker: {
                get() {
                    return this.sleepBlocker
                },
                set(value) {
                    this.setSleepBlocker(value)
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
        border none

    .flex .furthest
        margin-left 308px

    .flex .further
        margin-left 236px

    label.switch.further
        margin-left 272px

    .flex .switch.shorter
        margin-left 304px

    .option-item.anm-red
        margin-bottom 6px

    .switch.tsb-red
        margin-left 246px

    .info-input-field-nm
        width 12px
        margin-top 6px
        border none
        background transparent
        text-align center

    .info-input-field-nm:focus
        border-bottom 2px solid dodgerblue
</style>

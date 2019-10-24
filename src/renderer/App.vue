<template>
    <div id="app" @dragover.prevent @drop.prevent="addFiles" @click="closeModals">
        <Panel
            :track="vars.currentTrack"
            :pos="vars.currentPos"
            :player="player"
            :loading="vars.loadingTrack"
            :foundArt="vars.foundArt">
        </Panel>
        <Search
            :filteredPool="filteredPool"
            @lockHotKey="lockHotKey"
            @unlockHotKey="unlockHotKey"
            @mutatePool="updatePool">
        </Search>
        <AudioTS
            :playingCriteria="vars.playingCriteria"
            @mutatePlayingCriteria="updatePlayingCriteria"
            @cacheRoute="cacheRoute">
        </AudioTS>
        <AudioSTS @cacheRoute="cacheRoute"></AudioSTS>
        <Sidepane
            :playingTarget="vars.playingTarget"
            :playingCriteria="vars.playingCriteria"
            @caheRoute="cacheRoute"
            @lockHotKey="lockHotKey"
            @unlockHotKey="unlockHotKey">
        </Sidepane>

        <span>
            <transition name="faded-slide-in">
                <router-view
                    :player="player"
                    :filteredPool="filteredPool"
                    :index="vars.index"
                    :openPlaylistModal="vars.modals.playlist"
                    :backspaceLock="vars.lock.backspace"
                    :enterLock="vars.lock.enter"
                    :playingCriteria="vars.playingCriteria"
                    :currentTrack="vars.currentTrack"
                    @appLoading="setAppLoading"
                    @mutateIndex="updateIndex"
                    @setPlaylistModal="setPlaylistModal"
                    @lockHotKey="lockHotKey"
                    @unlockHotKey="unlockHotKey"
                    @updateStatusMessage="updateStatusMessage"
                    @mutatePool="updatePool"
                    @mutateCurrentTrack="updateCurrentTrack"
                    @clearCurrentTrack="clearCurrentTrack"
                    @mutatePlayingTarget="updatePlayingTarget"
                    @mutatePlayingCriteria="updatePlayingCriteria"
                    @clearStatusMessage="clearStatusMessage"
                    @clearErrorMessage="clearErrorMessage"
                    @clearWarnMessage="clearWarnMessage"
                    @clearFailMessage="clearFailMessage">
                </router-view>
            </transition>
        </span>

        <!-- App EQ Component -->
        <equalizer></equalizer>

        <transition name="rise">
            <div class="status-message" v-show="!vars.reporter.status.isEmpty">
                <div class="cancel-btn" @click="clearStatusMessage">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 40 40" width="15" height="15"><path d=" M 20 17.879 L 7.979 5.858 C 7.394 5.272 6.443 5.272 5.858 5.858 L 5.858 5.858 C 5.272 6.443 5.272 7.394 5.858 7.979 L 17.879 20 L 5.858 32.021 C 5.272 32.606 5.272 33.557 5.858 34.142 L 5.858 34.142 C 6.443 34.728 7.394 34.728 7.979 34.142 L 20 22.121 L 32.021 34.142 C 32.606 34.728 33.557 34.728 34.142 34.142 L 34.142 34.142 C 34.728 33.557 34.728 32.606 34.142 32.021 L 22.121 20 L 34.142 7.979 C 34.728 7.394 34.728 6.443 34.142 5.858 L 34.142 5.858 C 33.557 5.272 32.606 5.272 32.021 5.858 L 20 17.879 Z " fill-rule="evenodd" /></svg>
                </div>
                <h4>
                    {{ vars.reporter.status.heading }}
                </h4>
            </div>
        </transition>

        <transition name="rise">
            <div class="error-message" v-show="!vars.reporter.error.isEmpty">
                <div class="cancel-btn" @click="clearAllErrorMessage">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 40 40" width="15" height="15"><path d=" M 20 17.879 L 7.979 5.858 C 7.394 5.272 6.443 5.272 5.858 5.858 L 5.858 5.858 C 5.272 6.443 5.272 7.394 5.858 7.979 L 17.879 20 L 5.858 32.021 C 5.272 32.606 5.272 33.557 5.858 34.142 L 5.858 34.142 C 6.443 34.728 7.394 34.728 7.979 34.142 L 20 22.121 L 32.021 34.142 C 32.606 34.728 33.557 34.728 34.142 34.142 L 34.142 34.142 C 34.728 33.557 34.728 32.606 34.142 32.021 L 22.121 20 L 34.142 7.979 C 34.728 7.394 34.728 6.443 34.142 5.858 L 34.142 5.858 C 33.557 5.272 32.606 5.272 32.021 5.858 L 20 17.879 Z " fill-rule="evenodd" /></svg>
                </div>
                <h4>
                    {{ vars.reporter.error.heading }}
                </h4>
                <p>
                    {{ vars.reporter.error.message }}
                </p>

                <div class="tight-listing">
                    <p v-for="item in vars.reporter.error.items">{{ item }}</p>
                </div>
            </div>
        </transition>

        <transition name="rise">
            <div class="warn-message" v-show="!vars.reporter.warning.isEmpty">
                <div class="cancel-btn" @click="clearAllWarnMessage">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 40 40" width="15" height="15"><path d=" M 20 17.879 L 7.979 5.858 C 7.394 5.272 6.443 5.272 5.858 5.858 L 5.858 5.858 C 5.272 6.443 5.272 7.394 5.858 7.979 L 17.879 20 L 5.858 32.021 C 5.272 32.606 5.272 33.557 5.858 34.142 L 5.858 34.142 C 6.443 34.728 7.394 34.728 7.979 34.142 L 20 22.121 L 32.021 34.142 C 32.606 34.728 33.557 34.728 34.142 34.142 L 34.142 34.142 C 34.728 33.557 34.728 32.606 34.142 32.021 L 22.121 20 L 34.142 7.979 C 34.728 7.394 34.728 6.443 34.142 5.858 L 34.142 5.858 C 33.557 5.272 32.606 5.272 32.021 5.858 L 20 17.879 Z " fill-rule="evenodd" /></svg>
                </div>
                <h4>
                    {{ vars.reporter.warning.heading }}
                </h4>
                <p>
                    {{ vars.reporter.warning.message }}
                </p>

                <div class="tight-listing">
                    <p v-for="item in vars.reporter.warning.items">{{ item }}</p>
                </div>
            </div>
        </transition>

        <transition name="rise">
            <div class="fail-message" v-show="!vars.reporter.failure.isEmpty">
                <div class="cancel-btn" @click="clearAllFailMessage">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 40 40" width="15" height="15"><path d=" M 20 17.879 L 7.979 5.858 C 7.394 5.272 6.443 5.272 5.858 5.858 L 5.858 5.858 C 5.272 6.443 5.272 7.394 5.858 7.979 L 17.879 20 L 5.858 32.021 C 5.272 32.606 5.272 33.557 5.858 34.142 L 5.858 34.142 C 6.443 34.728 7.394 34.728 7.979 34.142 L 20 22.121 L 32.021 34.142 C 32.606 34.728 33.557 34.728 34.142 34.142 L 34.142 34.142 C 34.728 33.557 34.728 32.606 34.142 32.021 L 22.121 20 L 34.142 7.979 C 34.728 7.394 34.728 6.443 34.142 5.858 L 34.142 5.858 C 33.557 5.272 32.606 5.272 32.021 5.858 L 20 17.879 Z " fill-rule="evenodd" /></svg>
                </div>
                <h4>
                    {{ vars.reporter.failure.heading }}
                </h4>
                <p>
                    {{ vars.reporter.failure.message }}
                </p>

                <div class="tight-listing">
                    <p v-for="item in vars.reporter.failure.items">{{ item }}</p>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import Panel                from './components/Player/Panel.vue'
    import AudioTS              from './components/Toolset/AudioTS.vue'
    import AudioSTS             from './components/Toolset/AudioSTS.vue'
    import Search               from './components/Search/SearchBar.vue'
    import Sidepane             from './components/Sidepane/Sidepane.vue'
    import Equalizer            from './components/Equalizer.vue'

    import { mapActions,
            mapGetters }        from 'vuex'

    import FS                   from './utils/dirwalker'

    import Player               from './utils/player'

    import { add }              from './utils/list'

    import { Id,
            ClassName,
            ClassNameSingle,
            QuerySelectorAll }  from './utils/htmlQuery'

    import { isNightTime,
            reformatTo24Hours } from './utils/time'

    import { getIndexFromKey }  from './utils/object'

    const {
            remote,
            dialog,
            ipcRenderer } = require('electron')

    const jsm             = require('jsmediatags')
    const schedule        = require('node-schedule')

    const fs              = require('fs')
    const path            = require('path')

    const waveColors      = require('./data/wavecolors.json')

    export default {
        components: {
            Panel,
            Search,
            AudioTS,
            AudioSTS,
            Sidepane,
            Equalizer
        },
        data() {
            return {
                error_imports: [],
                imported_folders: [],
                failed_imports: [],
                imports: 0,
                imports_count: 0,
                player: null,
                pool: [],
                vars: {
                    index: -1,
                    currentPos: '-',
                    currentTrack: null,
                    playingTarget: null,
                    playingCriteria: null,
                    loadingTrack: false,
                    appIsLoading: false,
                    lock: {
                        'backspace': false,
                        'enter': false
                    },
                    modals: {
                        playlist: false
                    },
                    cached: {
                        mainRoute: '/',
                        childRoute: '/'
                    },
                    reporter: {
                        status: {
                            heading: null,
                            isEmpty: true
                        },
                        error: {
                            heading: null,
                            message: null,
                            items: [],
                            isEmpty: true
                        },
                        warning: {
                            heading: null,
                            message: null,
                            items: [],
                            isEmpty: true
                        },
                        failure: {
                            heading: null,
                            message: null,
                            items: [],
                            isEmpty: true
                        }
                    },
                    foundArt: false
                }
            }
        },
        created() {
            // Print Welcome message
            console.log("Welcome to Soundplay v0.2.0 (Alpha)")

            // Hide App Audio EQ if it was opened in a previous session
            if (this.appAudioEQ.visible) {
                this.toggleAudioEQVisibility()
            }

            // Clear jobs
            this.setJobsFn({start: null, end: null})

            // - End of session clearing -

            // Lets watch for 'spacebar' event to trigger player's 'play/pause'
            window.addEventListener('keydown', (ev) => {
                if (ev.code == 'Space') {
                    this.triggerPlaypause(ev)
                }

                if (ev.code == 'ArrowUp' || ev.code == 'ArrowDown') {
                    // Only check tbody activeTrack to scroll if it exists
                    // That way we don't block any future use of 'Up'/'Down'
                    if (ClassNameSingle('activeTrack')) {
                        this.handleTBScroll(ev)
                    }
                }
            })

            // Watch for window resizing to ensure thead's ths aligns properly with the tbody's tds
            // Lets resisze it if the scrollbars are visible on landing
            // and ellipses should be visible aswell
            window.addEventListener('resize', this.handle_window_resize)

            // Request startup args from Main
            ipcRenderer.send('request-startup-process-args')

            ipcRenderer.on('ack-startup-process-args', (event, arg) => {
                // Only begin parsing arg if sound path or folder path injected
                if (arg.startup_args.length > 0 || arg.trigger_files.length > 0) {
                    this.addFiles(arg.startup_args.length > 0 ? arg.startup_args : arg.trigger_files)
                }

                // Trigger play when done parsing

                ipcRenderer.send('clear-open-files', null)
            })

            // Handle events thrown from main renderer (App Menu)
            ipcRenderer.on('import-tracks', (event, arg) => {
                let vm = this
                remote.dialog.showOpenDialog({
                    properties: ['openFile', 'multiSelections']
                }, (items) => {
                    if (items) {
                        // Log number of files to import
                        this.imports += items.length
                        this.imports_count += items.length

                        // Make sure we check whether the user canceled the dialog first
                        // ... before we start performing any actions
                        if (items.length > 0) {
                            // Only make App display load effect when tracks
                            // ... actually inmported
                            vm.appIsLoading = true

                            for (var i = 0;i < items.length;i++) {
                                vm.deref(items[i])
                            }
                        }
                    }
                })
            })

            // Check fn for infinte loops
            ipcRenderer.on('import-folder', (event, arg) => {
                let vm = this
                remote.dialog.showOpenDialog({
                    properties: ['openDirectory', 'multiSelections']
                }, (items) => {
                    if (items) {
                        if (items.length > 0) {
                            for (var i = 0;i < items.length;i++) {
                                let tracks = vm.crawl(items[i])
                                // Log number files to import
                                vm.imports += tracks.length
                                vm.imports_count += tracks.length

                                // We now activate App loading effect
                                vm.appIsLoading = true

                                for (var j = 0;j < tracks.length;j++) {
                                    vm.deref(tracks[j])
                                }
                            }
                        }
                    }
                })
            })

            ipcRenderer.on('toggle-settings', (event, arg) => {
                this.toggleSettings()
            })

            ipcRenderer.on('toggle-night-mode', (event, arg) => {
                this.toggleNightMode()
            })

            // Load style files
            this.loadTheme()

            // Resume last route
            if (this.vars.cached.mainRoute == '/settings') {
                this.$router.push(this.vars.cached.childRoute)
            } else {
                this.$router.push(this.vars.cached.mainRoute)
            }

            // Create autoNightMode scheduler
            let vm = this

            // Reschedule here
            this.setJobsFn({
                start: schedule.scheduleJob({hour: this.appAutoNightModeTime.pm, minute: 0}, function () {
                    if (vm.appAutoNightMode) {
                        if (!vm.appNightMode) {
                            vm.setNightMode(true)
                        }
                    }
                }),
                end: schedule.scheduleJob({hour: this.appAutoNightModeTime.am, minute: 0}, function () {
                    if (vm.appAutoNightMode) {
                        if (vm.appNightMode) {
                            vm.setNightMode(false)
                        }
                    }
                })
            })

            // Check if autoNightMode is set
            if (this.appAutoNightMode) {
                // check whether we are in the night and adjust theme accordingly
                let { am, pm } = this.appAutoNightModeTime
                let time = new Date().getHours()

                if (isNightTime(time, reformatTo24Hours(pm), am) && !this.appNightMode) {
                    this.setNightMode(true)
                }
            }

            // Media controls
            // Playback
            ipcRenderer.on('media-playpause', (event, arg) => {
                this.triggerPlay()
            })

            ipcRenderer.on('media-prev', (event, arg) => {
                let cindex = getIndexFromKey(this.filteredPool, 'source', this.vars.currentTrack.source)

                if (cindex > 0) {
                    if (this.appAudioPrefs.shuffle) {
                        cindex = this.player.playHistory.pop()
                    } else { cindex = cindex - 1 }

                    this.updateCurrentTrack(this.filteredPool[cindex])
                    this.player.playNew(this.vars.currentTrack.source)
                }
            })

            ipcRenderer.on('media-next', (event, arg) => {
                // Get index of current playing track
                let cindex

                if (this.appAudioPrefs.shuffle) {
                    // If shuffled, then grab next random index to play
                    cindex = this.player.getNextRandom(this.vars.currentTrack, this.filteredPool)
                } else {
                    // Set to normal next track index from current track
                    cindex = getIndexFromKey(this.filteredPool, 'source', this.vars.currentTrack.source)+1
                }

                // Check if a next track exists
                if (cindex < this.filteredPool.length-1) {
                    // If true, we just play it!
                    this.updateCurrentTrack(this.filteredPool[cindex])
                    this.player.playNew(this.vars.currentTrack.source)
                }
            })

            ipcRenderer.on('toggle-shuffle', (event, arg) => {
                this.toggleShuffle()
            })

            ipcRenderer.on('toggle-loop', (event, arg) => {
                if (arg == 'single') {
                    this.setLoop('single')
                } else {
                    this.setLoop('all')
                }
            })

            // Audio
            ipcRenderer.on('toggle-mute', (event, arg) => {
                this.toggleMute()
            })

            ipcRenderer.on('volume', (event, arg) => {
                // store current Volume
                let cv = this.appAudioPrefs.volume
                let newVal = arg == -1 ? cv - 0.0625 : cv + 0.0625

                // Step is 6.25, 16 volume bars (as in MacOS)
                if (arg == -1) {
                    this.updateVolume(newVal < 0 ? 0 : newVal)
                } else {
                    this.updateVolume(newVal > 1 ? 1 : newVal)
                }
            })
        },
        mounted() {
            // Create new player
            this.player = new Player(this.vars.currentTrack, {
                window: window,
                volume: this.appAudioPrefs.volume,
                loop: this.appAudioPrefs.loop,
                mute: this.appAudioPrefs.mute,
                shuffle: this.appAudioPrefs.shuffle,
                progressColor: waveColors[this.appTheme].progressColor,
                cursorColor:  waveColors[this.appTheme].cursorColor,
                waveColor:  waveColors[this.appTheme].waveColor
            })

            this.player.device.on('ready', () => {
                // When track fully loaded
                // We set the loading flag here
                this.vars.loadingTrack = true

                if (!this.player.activated) {
                    this.player.activate(this.vars.currentTrack, this.filteredPool)
                }

                new jsm.Reader(this.vars.currentTrack.source).setTagsToRead(['picture']).read({
                    onSuccess: (tag) => {
                        if (tag.tags.picture) {
                            Id('album-art').src = "data:image;base64," + Buffer(tag.tags.picture.data).base64Slice()

                            this.vars.foundArt = true
                        } else {
                            this.vars.foundArt = false
                        }

                        // Only add track meta when track doesn't have 'duration set'
                        if (!this.vars.currentTrack.duration) {
                            this.editTrack({
                                id: this.vars.currentTrack.id,
                                meta: 'duration',
                                value: this.player.getDuration()
                            })
                        }

                        // We immediately play track
                        this.player.device.play()

                        // We update the tracks peeks here

                        // Unset 'loading' flag here
                        this.vars.loadingTrack = false
                    },
                    onError: (err) => {
                        // Decide What do to with error later
                        console.log(err)
                    }
                })
            })

            this.player.device.on('audioprocess', () => {
                // When track playing

                // So we update the current track position

                this.vars.currentPos = this.player.getCurrentPos()
            })

            this.player.device.on('finish', () => {
                // When track is done playing
                this.player.reset()
                // We reset the waveform cursor to the begining
                this.vars.currentPos = this.player.getCurrentPos()

                // Store index of currentTrack
                let cindex = getIndexFromKey(this.filteredPool, 'source', this.vars.currentTrack.source)

                let loopAllLock = false
                let loopSingleLock = false

                // Loop code here
                if (this.appAudioPrefs.loopSingle || this.appAudioPrefs.loopAll) {
                    // So if loop (single) enabled, we simply play again
                    if (this.appAudioPrefs.loopSingle) {
                        // Lock so that we only keep looping current track
                        loopSingleLock = true

                        this.player.play()
                    } else {
                        // I.e. Loop All
                        // If last track, we simply reset to first
                        if ((cindex == this.filteredPool.length - 1) && this.filteredPool.length > 0) {
                            this.updateCurrentTrack(this.filteredPool[0])
                            this.player.playNew(this.vars.currentTrack.source)

                            // Only lock when we are sure we need to poceed to
                            // play the next
                            loopAllLock = true
                        }
                    }
                } else {
                    // I.e. If no loops we go ahead and play the next track

                    // When track is finished playing and all tracks in pool cleared?
                    if (this.filteredPool.length == 0) {
                        // Player cleared and current Track
                        this.player.clear()
                        this.updateCurrentTrack(null)
                    }
                }

                // Possibly our shuffle code as well, or we updated/replace pool
                // ... from the player
                if (this.appAudioPrefs.shuffle) {
                    cindex = this.player.getNextRandom(this.vars.currentTrack, this.filteredPool)
                }

                // If not cleared, and havent hit the floor of the pool
                // ... i.e. last track, we proceed to play the next
                if ((cindex < this.filteredPool.length - 1) &&
                    (this.filteredPool.length > 0) &&
                    !loopAllLock &&
                    !loopSingleLock) {
                    this.updateCurrentTrack(this.filteredPool[cindex+1])
                    this.player.playNew(this.vars.currentTrack.source)
                }
            })
        },
        watch: {
            '$route' (cur, old) {
                if (cur.path == '/') {
                    this.redrawWaveform()

                    if (!this.vars.reporter.status.isEmpty) {
                        this.clearStatusMessage()
                    }
                }
            },

            'appAudioPrefs.mute' (cur, prev) {
                // If muted we make volume nil,
                // ... if not we restore the last volume level befor the mute
                if (!cur) {
                    this.restoreVolume()
                } else {
                    this.setVolume(0)
                }
            },

            'appAudioPrefs.volume' (cur, prev) {
                this.player.updateVolume(cur)
            },

            'appAudioPrefs.shuffle' (cur, prev) {
                if (cur) {
                    // create random indexes array for shuffled tracks
                    this.player.fillRandoms(this.vars.currentTrack, this.filteredPool)
                } else {
                    this.player.emptyRandoms()
                }
            },

            'vars.currentTrack' (cur, old) {
                if (cur) {
                    let ret = this.player.playNew(cur.source)

                    if (!ret) {
                        // If track has been renamed or deleted on the machine
                        // ... We delete it for now
                        this.deleteTrack(cur)
                        this.clearCurrentTrack()
                    }
                }
            },

            filteredPool (cur, prev) {
                if (this.vars.currentTrack) {
                    // recalc randoms
                    this.player.fillRandoms(this.vars.currentTrack, cur)
                }
            },

            appTheme (cur, old) {
                // reload theme after every theme change
                this.loadTheme()

                // Light -> #ffffff
                // Dark -> #2f2f2f2
                // Night -> #0e2c42
                let color = cur == 'light' ? '#fff' :
                    cur == 'night' ? '#0e2c42' : '#2f2f2f'

                ipcRenderer.send('sync-background-color', color)

                this.player.setProgressColor(waveColors[cur].progressColor)
                this.player.setCursorColor(waveColors[cur].cursorColor)
                this.player.setWaveColor(waveColors[cur].waveColor)
            },

            imports (cur, old) {
                if (cur == 0 || cur < 0) {
                    // Removing App loading effect when all tracks imported
                    this.vars.appIsLoading = false

                    // Log the number of imports that had issues
                    let import_issues_count = this.failed_imports.length - this.error_imports.length - this.vars.reporter.failure.items.length

                    // ... and obtain the number of actual imported items
                    let successful_imports_count = import_issues_count > 0 ? this.imports_count - import_issues_count : this.imports_count + import_issues_count

                    // Only display a success message if at least 1 or more non duplicates were imported
                    // ... and there are at least 1 or more files without errors or warnings
                    if (successful_imports_count > 0) {
                        this.updateStatusMessage({
                            heading: `Successfully imported ${successful_imports_count} sounds`,
                            isEmpty: false
                        })
                    }

                    this.imports_count = 0

                    // We want to show issues with folders first
                    if (this.imported_folders.length > 0) {
                        this.updateWarnMessage({heading: 'Encountered folder(s) during file(s) scan', message: 'Detected and scanned ' + this.imported_folders.length + ' Folder(s):', items: this.imported_folders})
                    }

                    if (this.failed_imports.length > 0) {
                        // Then issues with non sound files
                        this.updateFailMessage({heading: 'Error during file(s) scan', message: 'Detected ' + this.failed_imports.length + ' non sound file(s):', items: this.failed_imports})
                    }

                    // In case duplicated files are droped
                    if (this.failed_imports.length == 0 && this.vars.reporter.failure.items.length > 0) {
                        this.updateFailMessage({
                            heading: 'Detected potential sound file(s) duplication',
                            message: `Discovered ${this.vars.reporter.failure.items.length} duplicate track(s)`,
                            items: this.vars.reporter.failure.items
                        })
                    }


                    if (this.error_imports.length > 0) {
                        // And problematic sound files
                        this.updateErrorMessage({heading: 'Error during sound scan', message: 'Could not retrieve media tag from (' + this.error_imports.length + ') sound file(s): ', items: this.error_imports})
                    }
                }
            }
        },
        methods: {
            ...mapActions([
                'addTrack',
                'editTrack',
                'deleteTrack',
                'updateVolume',
                'setVolume',
                'restoreVolume',
                'toggleMute',
                'toggleShuffle',
                'toggleSettings',
                'loadTheme',
                'toggleNightMode',
                'setNightMode',
                'setJobsFn',
                'setLoop',
                'toggleAudioEQVisibility'
            ]),

            updateCurrentTrack (track) {
                this.vars.currentTrack = track
            },

            clearCurrentTrack () {
                this.vars.currentTrack = null
            },

            updatePool (tracks) {
                this.pool = tracks
            },

            updatePlayingTarget (item) {
                this.vars.playingTarget = item
            },

            updatePlayingCriteria (criteria) {
                this.vars.playingCriteria = criteria
            },

            updateStatusMessage (meta) {
                this.vars.reporter.status.heading = meta.heading
                this.vars.reporter.status.isEmpty = false
            },

            updateErrorMessage (meta) {
                this.vars.reporter.error.heading = meta.heading
                this.vars.reporter.error.message = meta.message
                this.vars.reporter.error.items   = meta.items

                this.vars.reporter.error.isEmpty = false
            },

            updateWarnMessage (meta) {
                this.vars.reporter.warning.heading = meta.heading
                this.vars.reporter.warning.message = meta.message
                this.vars.reporter.warning.items   = meta.items

                this.vars.reporter.warning.isEmpty = false
            },

            updateFailMessage (meta) {
                this.vars.reporter.failure.heading = meta.heading
                this.vars.reporter.failure.message = meta.message
                this.vars.reporter.failure.items   = meta.items

                this.vars.reporter.failure.isEmpty = false
            },

            clearStatusMessage () {
                this.vars.reporter.status.heading = null
                this.vars.reporter.status.isEmpty = true
            },

            clearErrorMessage () {
                this.vars.reporter.error.heading = null
                this.vars.reporter.error.message = null
                this.vars.reporter.error.items   = []

                this.vars.reporter.error.isEmpty = true
            },

            clearWarnMessage () {
                this.vars.reporter.warning.heading = null
                this.vars.reporter.warning.message = null
                this.vars.reporter.warning.items   = []

                this.vars.reporter.warning.isEmpty = true
            },

            clearFailMessage () {
                this.vars.reporter.failure.heading = null
                this.vars.reporter.failure.message = null
                this.vars.reporter.failure.items   = []

                this.vars.reporter.failure.isEmpty = true
            },

            lockHotKey (hotkey) {
                // So we can override the global hotkeys
                this.vars.lock[hotkey] = true
            },

            unlockHotKey (hotkey) {
                this.vars.lock[hotkey] = false
            },

            cacheRoute(obj) {
                if (obj.type == 'main') {
                    this.vars.cached.mainRoute = obj.name
                } else {
                    this.vars.cached.childRoute = obj.name
                }
            },

            triggerPlay() {
                if (this.player.activated && !this.player.cleared) {
                    this.player.playpause()
                } else {
                    if (this.vars.index == -1) {
                        // Set current track to first track if newly launched
                        this.updateCurrentTrack(this.filteredPool[0])
                        this.player.playNew(this.vars.currentTrack.source)
                    } else {
                        // We only attempt to play a new track if it does exist
                        if (this.filteredPool.length > 0) {
                            // If not we play the track currently active (indexed)
                            this.updateCurrentTrack(this.filteredPool[this.vars.index])
                            this.player.playNew(this.vars.currentTrack.source)
                        }
                    }
                }
            },

            triggerPlaypause(ev) {
                // Find out if any input field are currently in use
                // if not we go ahead and trigger play
                if (!(this.vars.lock.enter && this.vars.lock.backspace)) {
                    ev.preventDefault()
                    // Remember the 'enter/backspace' is locked when any input is currently focused
                    this.triggerPlay()
                }
            },

            updateIndex(val) {
                this.vars.index = val
            },

            handleTBScroll(ev) {
                // Avoid performing default behaviour of scrolling in tbody
                ev.preventDefault()

                // Grab 'activeTrack' & 'tbody' props
                let t  = ClassNameSingle('activeTrack').getBoundingClientRect()
                let tl = ClassNameSingle('trackslist').getBoundingClientRect()

                // log top & bottom distance difference
                let scrollTopDiff    = tl.top - t.top
                let scrollBottomDiff = tl.bottom - t.bottom

                // Only scroll Up/Down if its about to leave current view
                let scrollUp   = (scrollTopDiff < 0 && scrollTopDiff > -26) ||
                                (scrollTopDiff > 0 && scrollTopDiff < 25)
                let scrollDown = (scrollBottomDiff > 0 && scrollBottomDiff < 25) ||
                                (scrollBottomDiff < 0 && scrollBottomDiff > -25)

                // Only trigger scroll if Arrow key corresponds to scroll
                // ... direction
                let shouldScrollUp   = ev.code == 'ArrowUp' && scrollUp
                let shouldScrollDown = ev.code == 'ArrowDown' && scrollDown

                if (shouldScrollUp) {
                    ClassNameSingle('activeTrack').scrollIntoView({
                        behavior: "smooth",
                        block: "end"
                    })
                }

                if (shouldScrollDown) {
                    ClassNameSingle('activeTrack').scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    })
                }

                // If no scroll is triggered
                // we make one last attempt to scroll into view
                // in case the user manually scrolled out of the view
                if (!(shouldScrollUp || shouldScrollDown) &&
                    ((t.y - tl.height > 110) || (t.y < tl.y))) {
                    ClassNameSingle('activeTrack').scrollIntoView({
                        behavior: "smooth"
                    })
                }
            },

            setAppLoading(val) {
                this.vars.appIsLoading = val
            },

            isEmpty(item) {
                return item == undefined || item == ''
            },

            handle_window_resize() {
                if (this.$route.path == '/') {
                    this.resizeThead()
                    this.redrawEllipses()
                }

                this.redrawWaveform()
            },

            resizeThead() {
                var thead = QuerySelectorAll('thead')[0]
                var tbody = QuerySelectorAll('tbody')[0]

                if (tbody.scrollHeight > tbody.clientHeight) {
                    // We use the static width of the window not the table
                    // ... To avoid mutating both thead and tbody
                    thead.style.width = String(window.innerWidth - 250 - 1.5) + "px"
                } else {
                    // If no scollbars are detected the width is automatically
                    // ... the window's minus the sidpane's width
                    thead.style.width = String(window.innerWidth - 250) + "px"
                }
            },

            redrawEllipses() {
                // Resize width to allow ellipses
                if (window.innerWidth > 1310) {
                    let length = ClassName('short').length

                    for (var i = 0;i < length;i++) {
                        ClassName('short')[i].style.width = "200%"
                    }
                } else {
                    let length = ClassName('short').length

                    for (var i = 0;i < length;i++) {
                        ClassName('short')[i].style.width = "100%"
                    }
                }
            },

            redrawWaveform() {
                // Redraw waveform here
                if (this.player) this.player.device.drawBuffer()
            },

            setPlaylistModal(val) {
                this.vars.modals.playlist = !this.vars.modals.playlist
            },

            closeModals(ev) {
                // Trigger modal close here
                // ... but only if it was open
                let playlistModal = ev.target.id.includes('playlist')

                if (this.vars.modals.playlist &&
                    !(document.activeElement == Id('playlist-input')) &&
                    !playlistModal
                ) {
                    this.setPlaylistModal(false)
                }
            },

            clearAllErrorMessage() {
                this.error_imports = []

                this.clearErrorMessage()
            },

            clearAllWarnMessage() {
                this.imported_folders = []

                this.clearWarnMessage()
            },

            clearAllFailMessage() {
                this.failed_imports = []

                this.clearFailMessage()
            },

            crawl(dir) {
                // suppose the following path structure
                // .
                // | - someArtist/
                // | -- album_one/
                // | ---- track1.mp3
                // | ---- track2.mp3
                // | ---- ...
                // | -- album_two/
                // | ...
                //
                // We are now able to visit each directory and obtain the tracks notonly the ones in the parent directory

                let tracks = []

                new FS(dir).forEachFile((file) => {
                    // file extension starts after last '.'
                    let format = file.slice(file.lastIndexOf('.') + 1)

                    // All supported formats
                    if (['mp3', 'ogg', 'wav', 'm4a'].includes(format)) {
                        tracks.push(file)
                    }
                }, this.appExcludedFolders)

                return tracks
            },

            handle_new_track(obj) {
                this.imports -= 1

                // We extract the 'tags' and 'filepath'
                var tags = obj.tags
                var fp = obj.track_name

                // We build our track template here
                var meta = {
                    title: null,
                    artist: null,
                    album: null,
                    genre: null,
                    year: null,
                    source: fp
                }

                // Fill in the track template
                let raw_name = meta.source.slice(meta.source.lastIndexOf('/')+1, meta.source.length)

                meta.title = this.isEmpty(tags.title) ? raw_name.slice(0, raw_name.lastIndexOf('.')) : tags.title

                meta.artist = this.isEmpty(tags.artist) ? 'Unknown' : tags.artist

                meta.album = this.isEmpty(tags.album) || tags.album === '' ? 'Unknown' : tags.album

                meta.genre = this.isEmpty(tags.genre) ? 'Unknown' : tags.genre

                meta.year = this.isEmpty(tags.year) ? 'Unknown' : tags.year

                meta.activePlaylist = this.currentCriteria == 'playlist' ? this.currentTarget : null

                // Finally we add the track to our store
                let ret = this.addTrack(meta)

                if (!ret) {
                    // Lets override the 'failure' message from here
                    // ... we log the duplicated files to be reported later
                    this.vars.reporter.failure.items = add(this.vars.reporter.failure.items, meta.source, true)
                }
            },

            handle_new_track_error(track_path) {
                this.error_imports.push(track_path)
                this.imports -= 1
            },

            deref(track) {
                // We create a JS promise and feed it the relevant state
                // ... This allows us to still have access to the sound's filepath
                new Promise((resolve, reject) => {
                    new jsm.Reader(track).setTagsToRead([
                    'title', 'artist', 'album', 'genre', 'year', 'picture'
                    ]).read({
                        onSuccess: (tag) => {
                            resolve({
                                tags: tag.tags,
                                track_name: track
                            })
                        },
                        onError: (err) => {
                            reject(track)
                        }
                    })
                }).then(obj => {
                    // Here we simply obtain the JS Object containing the scanned tags and filepath
                    this.handle_new_track(obj)
                }).catch(track_path => {
                    // And we handle error reporting using the JS Object
                    // ... containing the details of the scan error
                    // ... aswell as the sound filepath
                    this.handle_new_track_error(track_path)
                })
            },

            // Helper fns for 'addFiles'
            resolveObjectFiles(obj) {
                if (Array.isArray(obj)) {
                    return obj
                } else {
                    return obj.dataTransfer.files
                }
            },

            isObjectFolder(obj) {
                if (typeof obj == 'object') {
                    return obj.type == ''
                } else {
                    return !fs.statSync(obj).isFile()
                }
            },

            resolveObjectPath(obj) {
                if (typeof obj == 'object') {
                    return obj.path
                } else { return obj }
            },

            isObjectAudioFile(obj) {
                if (typeof obj == 'object') {
                    return obj.type == 'audio/mp3'
                } else {
                    return ['mp3', 'ogg', 'wav', 'm4a'].includes(obj.slice(obj.lastIndexOf('.') + 1))
                }
            },

            addFiles(obj) {
                // Clear all (modal) message
                this.clearStatusMessage()
                this.clearAllWarnMessage()
                this.clearAllFailMessage()
                this.clearAllErrorMessage()

                // Check if Dir or audio dropped or processing arg
                let objs = this.resolveObjectFiles(obj)

                for (var i = 0;i < objs.length;i++) {
                    // Determine whether the current item is a folder
                    let is_obj_folder = this.isObjectFolder(objs[i])

                    if (is_obj_folder) {
                        // Only call load if actual folder track(s) are loaded
                        this.vars.appIsLoading = true

                        // Get folder path
                        let folder_path = this.resolveObjectPath(objs[i]) // typeof objs[i] != 'object' ? objs[i] : objs[i].path

                        // We have (a potential) directory dropped
                        this.imported_folders.push(folder_path)

                        let tracks = this.crawl(folder_path)

                        this.imports += tracks.length
                        this.imports_count += tracks.length

                        for (var j = 0;j < tracks.length;j++) {
                            this.deref(tracks[j])
                        }
                    } else {
                        // Find out whether it is a sound file
                        let is_sound_file = this.isObjectAudioFile(objs[i])

                        if (is_sound_file) {
                            // Only call load if actual track(s) are loaded
                            this.vars.appIsLoading = true

                            // Obtain sound filepath
                            let filepath = this.resolveObjectPath(objs[i])

                            // Scan and add Track
                            this.imports += 1
                            this.imports_count += 1
                            this.deref(filepath)
                        } else {
                            // Retrieve sound filepath
                            let filepath = this.resolveObjectPath(objs[i])

                            this.imports -= 1
                            this.failed_imports.push(filepath)
                        }
                    }
                }
            },
        },
        computed: {
            ...mapGetters([
                'currentCriteria',
                'currentDirec',
                'sortBy',
                'appExcludedFolders',
                'appTheme',
                'appNightMode',
                'appAutoNightMode',
                'appAutoNightModeTime',
                'appAudioEQ',
                'appAudioPrefs'
            ]),

            filteredPool () {
                var tmp = this.pool.slice(0)

                return tmp.sort((a, b) => {
                    var comp = 0
                    var tmp_a = a[this.sortBy].toUpperCase()
                    var tmp_b = b[this.sortBy].toUpperCase()

                    if (tmp_a > tmp_b) {
                        comp = 1
                    } else {
                        comp = -1
                    }

                    return this.currentDirec == 'a-z' ? comp : (comp * -1)
                })
            }
        },
    }
</script>

<style lang="stylus">
/* start of font decl */

    @font-face
        font-family 'Lato'
        src url('./../../static/font/Lato/Lato-Regular.ttf') format('truetype')

/* end of font decl */

    body, html, #app
        top 0
        padding 0
        margin 0
        position fixed
        height 100%
        width 100%

    body
        font-family Lato
        font-size 12px

    h4, p
        user-select none

    input:focus, p:focus, select:focus, button, button:focus
        outline none

    .cancel-btn
        cursor pointer
        position absolute
        top 15px
        right 20px

    .status-message, .error-message, .warn-message, .fail-message
        width 300px
        height 105px
        position absolute
        right 30px
        bottom 30px
        padding 20px
        border-radius 5px
        border-width 2.5px
        border-style solid
        h4
            margin-top 10px

    .status-message
        height 35px

    .tight-listing
        height 30px
        overflow auto
        p
            margin-top 0
            margin-bottom 0

    .fade-pane
        opacity 0.4
        animation beat 1.25s infinite ease

    .faded-slide-in-enter, .faded-slide-in-leave-to
        transition all 0.3s
        opacity 0
        transform translateY(50px)

    .faded-slide-in-enter-to
        transition all 0.3s
        opacity 0.4
        transform translateY(0)

    .rise-enter, .rise-leave-to
        transition all 0.6s
        bottom -150px
        opacity 0.3

    .rise-enter-to
        bottom 30px
        opacity 1

    @keyframes beat
        0%
            opacity 0.3
        50%
            opacity 0.6
        100%
            opacity 0.3

    ::-webkit-scrollbar
        width 3px
        height 2px

    ::-webkit-scrollbar-thumb:hover
        width 4px
</style>

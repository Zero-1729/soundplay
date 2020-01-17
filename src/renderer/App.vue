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
            @cacheRoute="cacheRoute"
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
                    @filterPool="filterPool"
                    @mutateCurrentTrack="updateCurrentTrack"
                    @clearCurrentTrack="clearCurrentTrack"
                    @mutatePlayingTarget="updatePlayingTarget"
                    @mutatePlayingCriteria="updatePlayingCriteria"
                    @clearStatusMessage="clearStatusMessage"
                    @clearErrorMessage="clearErrorMessage"
                    @clearWarnMessage="clearWarnMessage"
                    @clearFailMessage="clearFailMessage"
                    @clearJobsFn="clearJobsFn"
                    @setJobsFn="setJobsFn">
                </router-view>
            </transition>
        </span>

        <!-- App EQ Component -->
        <equalizer :player="player"></equalizer>

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
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 40 40" width="15" height="15">
						<path d=" M 20 17.879 L 7.979 5.858 C 7.394 5.272 6.443 5.272 5.858 5.858 L 5.858 5.858 C 5.272 6.443 5.272 7.394 5.858 7.979 L 17.879 20 L 5.858 32.021 C 5.272 32.606 5.272 33.557 5.858 34.142 L 5.858 34.142 C 6.443 34.728 7.394 34.728 7.979 34.142 L 20 22.121 L 32.021 34.142 C 32.606 34.728 33.557 34.728 34.142 34.142 L 34.142 34.142 C 34.728 33.557 34.728 32.606 34.142 32.021 L 22.121 20 L 34.142 7.979 C 34.728 7.394 34.728 6.443 34.142 5.858 L 34.142 5.858 C 33.557 5.272 32.606 5.272 32.021 5.858 L 20 17.879 Z " fill-rule="evenodd" />
					</svg>
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

    const { add }               = require('./utils/list')

    const { Id,
            ClassName,
            ClassNameSingle,
            QuerySelectorAll }  = require('./utils/htmlQuery')

    const { isNightTime,
            getCurrentTime,
            formatTo24Hours } = require('./utils/time')

    const { getIndexFromKey }   = require('./utils/object')

    const { remote,
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
                warn_imports: [],
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
                    autoplay: false,
                    lock: {
                        'backspace': false,
                        'enter': false
                    },
                    modals: {
                        playlist: false
                    },
                    jobs: {
                        start: null,
                        end: null
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

            // - End of session clearing -

            // Inject tracks
            this.pool = this.allTracks

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
                    // Catch in imports hook
                    // ... and when we check for duplicate tracks
                    this.vars.autoplay = true

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

            ipcRenderer.on('toggle-eq', (event, arg) => {
                this.toggleAudioEQVisibility()
            })

            // Load style files
            this.loadTheme()

            // Resume last route
            if (this.appRoutes.mainRoute == '/settings') {
                this.$router.push(this.appRoutes.childRoute)
            } else {
                this.$router.push(this.appRoutes.mainRoute)
            }

            // Create autoNightMode scheduler
            let vm = this

            // Check whether in night mode time
            if (this.appAutoNightMode) {
                let {am, pm} = this.appAutoNightModeTime

                let [hrs, min, sec] = getCurrentTime()

                // Reschedule here
                this.setJobsFn({
                    start: schedule.scheduleJob({hour: formatTo24Hours(pm), minute: 0}, function () {
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

                // Check if autoNightMode is set
                if (isNightTime(hrs, formatTo24Hours(pm), am)) {
                    // check whether we are in the night and adjust theme accordingly
                    if (!this.appNightMode) {
                        this.setNightMode(true)
                    }
                } else {
                    if (this.appNightMode) {
                        // Otherwise we turn it off
                        this.setNightMode(false)
                    }
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
                if (cindex <= this.filteredPool.length-1) {
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
                waveColor:  waveColors[this.appTheme].waveColor,
                playbackRate: this.appAudioPrefs.playbackRate
            })

            // If EQ was enabled in last session, continue with it
            if (this.appAudioEQ.enabled) {
                this.player.initEQ(this.appAudioEQ.channels)
            }

            // If launched we fill the view with the appropriately filtered
            // ... set of tracks
            this.filterPool()

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

                         // Pass to scrobbler
                        this.scrobbleData()
                    },
                    onError: (err) => {
                        // Decide What do to with error later
                        console.log(err)

                        // If the metas can't be read then we know it has no album art
                        this.vars.foundArt = false

                        // If the tag is problematic, we just continue
                        if (err.type == "tagFormat") {
                            this.scrobbleData()
                        }
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
                let oindex = getIndexFromKey(this.filteredPool, 'source', this.vars.currentTrack.source)
                let cindex = oindex + 1 // Defaults to next track
                let onLoop = this.appAudioPrefs.loopAll || this.appAudioPrefs.loopSingle
                let hasFloor = (oindex == this.filteredPool.length - 1) &&
                                          !this.appAudioPrefs.shuffle

                // 'End of regular playback' 
                let EORP = hasFloor ? !(cindex < this.filteredPool.length) : false

                // 'End of shuffle playback' checks whether all shuffled tracks
                // ... have been exhausted so we can pause the playback
                // ... only used when not in a loop
                let EOSP = this.appAudioPrefs.shuffle ? this.player.randoms.length == 0 && (!hasFloor) && (!onLoop) : false

                // If shuffle mode on, then we get the index to next track
                // ... only if we haven't hit EOSP
                if (this.appAudioPrefs.shuffle && (!EOSP)) {
                    cindex = this.player.getNextRandom(this.vars.currentTrack, this.filteredPool)
                }

                // Loop code
                if (onLoop) {
                    // So if loop (single) enabled, we simply replay track
                    if (this.appAudioPrefs.loopSingle) {
                        // Lock so that we only keep looping current track
                        this.player.play()

                        onLoop = true
                    } else {
                        // - Loop All -

                        // To allow next track play
                        onLoop = false

                        // If last track, we simply reset to first
                        // ... only aplies when not shuffled, as shuffling
                        // ... can allow last track to be played then first, etc.
                        // ... Essentially, shuffle does not have a floor
                        if (hasFloor && this.filteredPool.length > 0) {
                            this.updateCurrentTrack(this.filteredPool[0])
                            this.player.playNew(this.vars.currentTrack.source)

                            // Player only needs to know we triggered play already
                            onLoop = true
                        }
                    }
                } else {
                    // I.e. If no loops we go ahead and play the next track
                    // When track is finished playing and all tracks in pool cleared
                    // ... or
                    // ... When regular playback finished
                    if ((this.filteredPool.length == 0 || EOSP || EORP) && this.appAudioPlaybackBehaviour == 'clear') {
                        // Player cleared and current Track
                        this.player.clear()
                        this.updateCurrentTrack(null)
                    }
                }

                let shouldPlayNext = (this.filteredPool.length > 0) &&
                                    (cindex < this.filteredPool.length)
                                    && (!onLoop) && (!EOSP)

                // If not cleared, havent hit the floor of the pool,
                // ... i.e. last track, or loop on, then
                // ... we proceed to play the next
                if (shouldPlayNext) {
                    this.updateCurrentTrack(this.filteredPool[cindex])
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

            allTracks () {
                // Each time we detect a change in the 'state.music'
                // ... we rehydrate the current render of tracks
                this.filterPool()
            },

            filteredPool (cur, prev) {
                if (this.vars.currentTrack && this.appAudioPrefs.shuffle) {
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
                    // Only perform calc if there are failed import items
                    // ... we don't want negetive values
                    let import_issues_count = this.failed_imports.length > 0 ? this.failed_imports.length - (this.error_imports.length + 
                                                                                                            this.warn_imports.length + 
                                                                                                            this.vars.reporter.failure.items.length) : 0

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


                    // Report warning
                    if (this.warn_imports.length > 0) {
                        // Metas warning report
                        this.updateWarnMessage({heading: `Unable to retrieve media tag from (${this.warn_imports.length}) sound file(s): `, items: this.warn_imports})
                    }

                    // Final catch for autoplay
                    // reset flag
                    this.vars.autoplay = false
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
                'setLoop',
                'cacheMainRoute',
                'cacheChildRoute',
                'toggleAudioEQVisibility'
            ]),

            displayNotification() {
                new Notification(this.vars.currentTrack.title, {
                    body: this.vars.currentTrack.artist,
                    silent: true,
                    // Display album art only if found
                    icon: this.vars.foundArt ? 
                            Id('album-art').src :
                            path.join(__static, 'icons', 'unknown.png'),
                    actions: [ /*Fill with prev & next*/ ]
                    // renotify
                })
            },

            scrobbleData() {
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

                // Displaying the notification is now optional
                if (this.appNotifs) {
                    this.displayNotification()
                }
            },

            filterTracks() {
            	// Returns tracks that match a criteria under some target
            	// Eg: filterTrack('Genre', 'Rap', tracks) -> Returns all Rap tracks
            	return this.allTracks.filter((track) => {
            		return track[this.currentCriteria] == [this.currentTarget]
            	})
            },

            filterPool () {
                if (this.currentTarget == 'All Tracks') {
                    this.updatePool(this.allTracks)
                } else {
                    if (['80s Music', '90s Music', '2000s Music'].includes(this.currentTarget)) {
                        let year = this.currentTarget.slice(0, 2)

                        this.updatePool(this.getOldTracks(year, year == "20"))
                        return
                    }

                    if (this.currentCriteria == 'playlist') {
                        this.updatePool(this.getFromPlaylist(this.currentTarget))
                        return
                    }

                    if (this.currentTarget == 'Favourites') {
                        this.updatePool(this.getFavs())
                        return
                    }

                    if (this.currentTarget == 'Most Played') {
                        // Grab average plays from state
                        // compare and return
                        return
                    }

                    else {
                        this.updatePool(this.filterTracks())
                    }
                }
            },

            getOldTracks(year, y_two_k=false) {
                if (y_two_k) {
                    return this.allTracks.filter((track) => {
                        return String(track.year).slice(0, 1) == 2 && String(track.year).slice(2, 4) <= 10
                    })
                }

                return this.allTracks.filter((track) => {
                    return String(track.year).slice(2) == year
                })
            },

            getFromPlaylist(currentPlaylist) {
                // In case the current Playlists was just deleted
                return currentPlaylist.tracks
            },

            getFavs() {
                return this.allTracks.filter((track) => {
            		return track.favourite == true
            	})
            },

            updateCurrentTrack (track) {
                this.vars.currentTrack = track

                // If in shuffle, we need to remove it from the `randoms` set
                // ... we don't want it to later be played
                if (this.appAudioPrefs.shuffle) {
                    let cindex = getIndexFromKey(this.filteredPool, 'source', track.source)

                    this.player.freeRandTrack(cindex)
                }
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
                    this.cacheMainRoute(obj.name)
                } else {
                    this.cacheChildRoute(obj.name)
                }
            },

            triggerPlay() {
                if (this.player.activated && !this.player.cleared) {
                    this.player.playpause()
                } else {
                    if (this.vars.index == -1) {
                        // Set current track to first track if newly launched

                        // If in shuffle, play the first index in `randoms`
                        let index = 0

                        if (this.appAudioPrefs.shuffle) {
                            // In case the randoms haven't been filled
                            if (this.player.randoms.length == 0) {
                                this.player.fillRandoms(this.filteredPool[index], this.filteredPool)
                            }

                            // then reset index
                            index = this.player.getNextRandom()
                        }
          
                        this.updateCurrentTrack(this.filteredPool[index])
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
                this.warn_imports = []

                this.clearWarnMessage()
            },

            clearAllFailMessage() {
                this.failed_imports = []

                this.clearFailMessage()
            },

            clearJobsFn() {
                this.vars.jobs.start.cancel()
                this.vars.jobs.end.cancel()
            },

            setJobsFn (arg) {
                this.vars.jobs.start = arg.start
                this.vars.jobs.end   = arg.end
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

                    // We handle the autoplay in the imports hook
                }

                // If new track
                if (this.vars.autoplay && ret) {
                    let cindex = getIndexFromKey(this.filteredPool, 'source', meta.source)

                    this.updateCurrentTrack(this.filteredPool[cindex])
                    this.player.playNew(this.vars.currentTrack.source)

                    // Done with catch
                    this.vars.autoplay = false
                }
            },

            handle_new_track_warn(track_path) {
                // Log it in the warning
                // we still accept metaless tracks

                //this.error_imports.push(track_path)
                this.warn_imports.push(track_path)
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

                    // We just warn the user, but still go ahead and import it
                    this.handle_new_track_warn(track_path)

                    // continue processing with dummy meta
                    this.handle_new_track({
                        tags: {
                            title: null,
                            artist: null,
                            album: null,
                            genre: null,
                            year: null
                        },
                        track_name: track_path
                    })
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
                'allTracks',
                'currentTarget',
                'currentCriteria',
                'currentDirec',
                'sortBy',
                'appExcludedFolders',
                'appTheme',
                'appNightMode',
                'appAutoNightMode',
                'appAutoNightModeTime',
                'appAudioEQ',
                'appAudioPrefs',
                'appAudioPlaybackBehaviour',
                'appRoutes',
                'appNotifs'
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

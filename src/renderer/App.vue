<template>
    <div id="app" @dragover.prevent @drop.prevent="addFiles" @click="closeModals">
        <Panel
            :track="vars.currentTrack"
            :pos="vars.currentPos"
            :player="player"
            :loading="vars.loadingTrack"
            :foundArt="vars.foundArt"
            
            @prev="prevTrack"
            @playpause="triggerPlay"
            @next="nextTrack">
        </Panel>
        <Search
            :searchText="vars.searchText"
            @mutateSearchText="updateSearchText"
            @lockHotKey="lockHotKey"
            @unlockHotKey="unlockHotKey">
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
                    :focused="vars.playlistFocus"
                    :openPlaylistModal="vars.modals.playlist"
                    :inputLock="vars.lock.input"
                    :playingCriteria="vars.playingCriteria"
                    :currentTrack="vars.currentTrack"
                    :appIsLoading="vars.appIsLoading"
                    @loadTheme="loadTheme"
                    @appLoading="setAppLoading"
                    @mutateIndex="updateIndex"
                    @setPlaylistFocus="setPlaylistFocus"
                    @setPlaylistModal="setPlaylistModal"
                    @lockHotKey="lockHotKey"
                    @unlockHotKey="unlockHotKey"
                    @updateStatusMessage="updateStatusMessage"
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
                    @setJobsFn="setJobsFn"
                    @syncFiles="syncFiles"
                    @handle_sleep_blocker="handle_sleep_blocker"
                    
                    :class="{'fade-pane': vars.appIsLoading}">
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
            TagName,
            TagNameSingle,
            ClassName,
            ClassNameSingle,
            QuerySelectorAll,
            CreateElm        }  = require('./utils/htmlQuery')

    const { isNightTime,
            getCurrentTime,
            formatTo24Hours }   = require('./utils/time')

    const { getIndexFromKey }   = require('./utils/object')

    const { isFile, Exists }    = require('./utils/file')

    const { remote,
            dialog,
            ipcRenderer } = require('electron')

    const jsm             = require('jsmediatags')
    const schedule        = require('node-schedule')

    const fs              = require('fs')
    const path            = require('path')
    const os              = require('os')

    const waveColors      = require('./data/wavecolors.json')

    // Host home directory
    const hostHomeDir     = os.homedir()

    // Platform
    const platform        = os.platform()

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
                failed_imports: [],
                imports: 0,
                imports_count: 0,
                imported_non_sound_folders: false, // To handle overloaded non sound folders
                imported_non_sound_files: false, // To handle overloaded non sound
                player: null,
                pool: [],
                dataRehydrated: false,
                vars: {
                    index: -1,
                    currentPos: '-',
                    playedPercent: 0,
                    currentTrack: null,
                    playingTarget: null,
                    playingCriteria: null,
                    skippedCurrentTrack: false,
                    reset_current_track: false,
                    searchText: '',
                    loadingTrack: false,
                    appIsLoading: false,
                    autoplay: false,
                    lock: {
                        'input': false // For space, enter, backspace and arrows
                    },
                    playlistFocus: false,
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
            console.log(`Welcome to ${remote.app.name} ${remote.app.getVersion()}`)
            console.log("\nIf you have suggestions or find bugs open up an issue here:")
            console.log("https://gihtub.com/soundplay/issues.\n\n")

            // Hide App Audio EQ if it was opened in a previous session
            if (this.appAudioEQ.visible) {
                this.toggleAudioEQVisibility()
            }

            // Load App theme
            this.loadTheme()

            // Load platform specific stylesheet
            if (platform != 'darwin') {
                this.loadExtraSheet()
            }

            // Inject tracks
            this.pool = this.allTracks

            // Lets watch for 'spacebar' event to trigger player's 'play/pause'
            window.addEventListener('keydown', (ev) => {
                if ((ev.code == 'Space') && (!this.vars.lock.space)) {
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

            // About panel button event 
            Id('about-button').addEventListener('click', () => {
                Id('about-panel').classList.remove('show-panel')
                Id('about-content').classList.remove('show-content')
            })

            // Watch for window resizing to ensure thead's ths aligns properly with the tbody's tds
            // Lets resisze it if the scrollbars are visible on landing
            // and ellipses should be visible aswell
            window.addEventListener('resize', this.handle_window_resize)

            // Turn on sleep blocker if enabled
            if (this.sleepBlocker) {
                ipcRenderer.send('turn-on-sleep-blocker')
            } else {
                ipcRenderer.send('turn-off-sleep-blocker')
            }

            // Or use 'fullscreen' from window event listener
            ipcRenderer.on('enter-full-screen', () => {
                if (ClassNameSingle('vertical-div-holder').length > 0) {
                    ClassNameSingle('vertical-div-holder').classList.add('stretched-div')
                }
            })

            ipcRenderer.on('leave-full-screen', () => {
                if (ClassNameSingle('vertical-div-holder').length > 0) {
                    ClassNameSingle('vertical-div-holder').classList.remove('stretched-div')
                }
            })

            // Request startup args from Main
            ipcRenderer.send('request-startup-process-args')

            ipcRenderer.on('ack-startup-process-args', (event, arg) => {
                // Only begin parsing arg if sound path or folder path injected
                if (arg.startup_args.length > 0 || arg.trigger_files.length > 0) {
                    // Catch in imports hook
                    // ... and when we check for duplicate tracks
                    let args_list = arg.startup_args.length > 0 ? arg.startup_args : arg.trigger_files

                    // Check if the first item is an actual track before setting autoplay
                    if (Exists(args_list[0])) {
                        this.vars.autoplay = true
                    }

                    this.addFiles(args_list)
                }

                ipcRenderer.send('clear-open-files', null)
            })

            // Handle events thrown from main renderer (App Menu)
            // Single sound files import
            ipcRenderer.on('import-tracks', (event, arg) => {
                let vm = this

                remote.dialog.showOpenDialog({
                    buttonLabel: 'Import',
                    properties: ['openFile', 'multiSelections', 'showHiddenFiles'],
                    filters: { name: 'Sounds', extensions: ['mp3', 'ogg', 'wav', 'm4a'] },
                }).then(obj => {
                    if (!obj.canceled) {
                        vm.addFiles(obj.filePaths)
                    }
                }).catch(err => {
                    // Log error
                    // Maybe add seprate import fialed error
                    // Or maybe not
                })
            })

            // Folder import handler
            ipcRenderer.on('import-folder', (event, arg) => {
                let vm = this

                remote.dialog.showOpenDialog({
                    buttonLabel: 'Import',
                    properties: ['openDirectory', 'multiSelections', 'showHiddenFiles'],
                }).then(obj => {
                    if (!obj.canceled) {
                        vm.addFiles(obj.filePaths)
                    }
                }).catch(err => {
                    // Log error
                    // Maybe add seprate import fialed error
                    // Or maybe not
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

            // Display current playing track
            ipcRenderer.on('focus-playing-track', (event, arg) => {
                if (ClassNameSingle('playingTrack')) {
                    ClassNameSingle('playingTrack').scrollIntoView({ behaviour: 'smooth' })
                }
            })

            // Show about panel
            ipcRenderer.on('show-about-panel', () => {
                let ver = remote.app.getVersion()

                // reveal and inject version info
                Id('about-panel').classList.add('show-panel')
                Id('version').textContent = 'v' + ver + (ver.includes('-b') ? ' (Beta)' : (ver.includes('-a') ? 'Alpha' : ''))
                Id('about-content').classList.add('show-content')
            })

            // Resume last route
            if (this.appRoutes.mainRoute == '/settings') {
                this.$router.push(this.appRoutes.childRoute)
            } else {
                this.$router.push(this.appRoutes.mainRoute)
            }

            // Check whether in night mode time and set if true
            this.checkAndSetAutoNM()

            // Search
            ipcRenderer.on('focus-search', (event, arg) => {
                // Focus search input
                Id('search-input').focus()
                Id('search-input').select()

                // Lock input
                this.lockHotKey('input')
            })

            // Media controls
            // Playback
            ipcRenderer.on('media-playpause', (event, arg) => {
                this.triggerPlay()
            })

            ipcRenderer.on('media-prev', (event, arg) => {
                this.prevTrack()
            })

            ipcRenderer.on('media-next', (event, arg) => {
                this.nextTrack()
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
                progressColor: waveColors[this.appTheme].progressColor,
                cursorColor:  waveColors[this.appTheme].cursorColor,
                waveColor:  waveColors[this.appTheme].waveColor,
                playbackRate: this.appAudioPrefs.playbackRate,
                normalize: true // normalizes displayed waveforms
            })

            // Init preamp gain node
            this.player.initPreampGainNode()

            // If EQ was enabled in last session, continue with it
            if (this.appAudioEQ.enabled) {
                this.player.initEQ(this.appAudioEQ.channels)
            }

            // If launched we fill the view with the appropriately filtered
            // ... set of tracks
            this.filterPool()

            // If shuffled, trigger randoms fill
            if (this.appAudioPrefs.shuffle) {
                this.player.fillRandoms(null, this.filteredPool)
            }

            this.player.device.on('ready', () => {
                // When track fully loaded
                // We set the loading flag here
                this.vars.loadingTrack = false

                if (!this.dataRehydrated) {
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
                            // If the metas can't be read then we know it has no album art
                            this.vars.foundArt = false

                            // If the tag is problematic, we just continue
                            if (err.type == "tagFormat") {
                                this.scrobbleData()
                            }
                        }
                    })
                } else {
                    this.player.device.seekAndCenter(this.vars.playedPercent)
                    this.dataRehydrated = false
                }
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

                // Increment the current tracks play count
                this.incrementPlayCount(this.vars.currentTrack)

                // Store index of currentTrack
                // NOTE: If we were playing an autoplayed track the 'oindex' would be -1
                // ... so it would play the first track next instead unless it is on single loop
                // ... in which case it would just loop the current track
                let oindex = getIndexFromKey(this.filteredPool, 'id', this.vars.currentTrack.id)

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

                // If shuffle mode on then we get the index to next track
                // ... only if we haven't hit EOSP
                // The current index must be in the view, if not it's likely an autoplayed track with an index from allTracks 
                if (this.appAudioPrefs.shuffle && (!EOSP) && (oindex != -1)) {
                    let cid = this.player.getNextRandom(this.vars.currentTrack, this.filteredPool, this.vars.skippedCurrentTrack)
                    cindex = getIndexFromKey(this.filteredPool, 'id', cid)
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
                            // Loading state init
                            this.vars.loadingTrack = true

                            this.updateCurrentTrack(this.filteredPool[0])

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

                // Fill playedIDs
                // If persisted disabled then we can only refill in shuffle mode 
                if (this.appAudioPrefs.persistedHistory || this.appAudioPrefs.shuffle) {
                    this.player.fillHistory(this.filteredPool, oindex)
                }

                let shouldPlayNext = (this.filteredPool.length > 0) &&
                                    (cindex < this.filteredPool.length)
                                    && (!onLoop) && (!EOSP)

                // If not cleared, havent hit the floor of the pool,
                // ... i.e. last track, or loop on, then
                // ... we proceed to play the next
                if (shouldPlayNext) {
                    this.vars.loadingTrack = true

                    this.updateCurrentTrack(this.filteredPool[cindex])
                }
            })

            // Send vue data
            ipcRenderer.on('send-vue-state', (event, arg) => {
                ipcRenderer.send('save-vue-data', {
                    pool: this.$data.pool,
                    imports: this.$data.imports,
                    player: {
                        activated: this.$data.player.activated,
                        cleared: this.$data.player.cleared,
                        currentTrack: this.$data.player.currentTrack,
                        playedIDs: this.$data.player.playedIDs,
                        tmpPlayedIDs: this.$data.player.tmpPlayedIDs,
                        randoms: this.$data.player.randoms,
                        device: {
                            backend: {
                                startPosition: this.$data.player.device.backend.startPosition,
                                lastPlay: this.$data.player.device.backend.lastPlay
                            }
                        }
                    },
                    currentPos: this.player.getCurrentPos(),
                    playedPercent: this.player.device.backend.getPlayedPercents(),
                    vars: {
                        index: this.vars.index,
                        currentPos: this.vars.currentPos,
                        currentTrack: this.vars.currentTrack,
                        playingTarget: this.vars.playingTarget,
                        playingCriteria: this.vars.playingCriteria,
                        skippedCurrentTrack: this.vars.skippedCurrentTrack,
                        reset_current_track: this.vars.reset_current_track,
                        searchText: this.vars.searchText,
                        loadingTrack: this.vars.loadingTrack,
                        appIsLoading: this.vars.appIsLoading,
                        autoplay: this.vars.autoplay,
                        lock: this.vars.lock,
                        playlistFocus: this.vars.playlistFocus,
                        modals: this.vars.modals,
                        jobs: this.vars.jobs,
                        reporter: this.vars.reporter,
                        foundArt: this.vars.foundArt
                    },
                    art: Id('album-art').src
                })
            })

            // Restore vue data
            ipcRenderer.on('inject-vue-state', (event, arg) => {
                // replace current data
                this.restoreVueState(arg)

                ipcRenderer.send('clear-vue-data')
            })
        },
        watch: {
            '$route' (cur, old) {
                if (cur.path == '/') {
                    this.redrawWaveform()
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
                    // Refills with exclusion if we are in the playing Target
                    // ... we are assuming the user is triggering on/off
                    // ... to make playback consistent we ensure history is repected
                    this.player.fillRandoms(this.vars.currentTrack, this.filteredPool, this.appAudioPrefs.persistedHistory || this.appAudioPrefs.shuffle)
                } else {
                    this.player.emptyRandoms()
                }
            },

            'vars.reset_current_track' (cur, old) {
                if (cur) {
                    this.updateCurrentTrack(null)
                }
            },

            'vars.playingTarget' (cur, old) {
                // Empty play histories
                // To prepare for new history
                this.player.clearHistory()
            },

            'vars.currentTrack' (cur, old) {
                if (!this.dataRehydrated) {
                    // Reset flag
                    if (this.reset_current_track) {
                        this.reset_current_track = false
                    }

                    if (cur) {
                        // Loading state init
                        this.vars.loadingTrack = true

                        let ret = this.player.playNew(cur.source)

                        if (!ret) {
                            // Means it was from an external source (like a hard drive or something)
                            // If track has been renamed or deleted on the machine or tracks are locked
                            // ... We proceed to skip it
                            let cindex = getIndexFromKey(this.filteredPool, 'id', cur.id)
                            let oindex = old ? getIndexFromKey(this.filteredPool, 'id', old.id) : -1

                            // First, we remove it from `randoms` if in shuffle mode
                            if (this.appAudioPrefs.shuffle) {
                                // We only need to rid the playedIDs of it
                                // ... as it was not played
                                this.vars.skippedCurrentTrack = true
                            }

                            // If the initial path is on the host machine
                            // ... we can delete the track
                            if (cur.source.slice(0, hostHomeDir.length) == hostHomeDir) {
                                // We assume the track was deleted off the fs or moved to another location
                                this.deleteTrack(cur)

                                // Lets clear the wave DOM that might be created as well
                                // That's if it was the last track
                                // TODO: in the future, if loopAll triggers playing from top again
                                // ... we must ensure the behaviour below does not get in the way
                                if (cindex == this.filteredPool.length - 1) {
                                    // reset index
                                    this.vars.index = -1
                                    // reset current
                                    this.vars.reset_current_track = true

                                    // Avoids trying to trigger playback
                                    return
                                }
                            } else {
                                // Dim track if from external drive
                                if (TagName('tr').length > 0) {
                                    TagName('tr')[cindex + 1].classList.add('dim-track')
                                }
                            }

                            // Then seek to next playable track, if its ahead of previously playing track
                            // This is also triggered automatically in shuffle
                            // ... Remember the previous track is form the `playedIDs` Array
                            // ... and this Array does not store unplayable tracks
                            // ... So we just keep moving on as the track essentially does not exist
                            this.nextTrack()
                        } else {
                            // Not skipped
                            this.vars.skippedCurrentTrack = false

                            let cindex = getIndexFromKey(this.filteredPool, 'id', cur.id)

                            // Undim track 
                            if (TagName('tr').length > 0) {
                                TagName('tr')[cindex + 1].classList.remove('dim-track')
                            }

                            // Clear album art
                            this.vars.foundArt = false
                        }
                    }
                }
            },

            'vars.modals.playlist' (cur, prev) {
                if (cur) {
                    // Auto focus
                    Id('playlist-input').focus()

                    // Add focus class
                    this.vars.playlistFocus = true

                    // Lock space bar
                    this.lockHotKey('input')
                } else {
                    this.vars.playlistFocus = false
                }
            },

            focused (cur, prev) {
                // We don't want the tracks to unexpectedly be loaded
                // ... when a new playlist is created
                if (cur) {
                    this.lockHotKey('input')
                } else {
                    this.unlockHotKey('input')
                }
            },

            allTracks (cur, prev) {
                // Each time we detect a change in the 'state.music'
                // ... we rehydrate the current render of tracks
                this.filterPool()

                // Clear player if all tracks gone
                if (cur.length == 0) {
                    // Clear player and reset track
                    this.player.clear()
                    this.updateCurrentTrack(null)
                }
            },

            filteredPool (cur, prev) {
                if (this.appAudioPrefs.shuffle) {
                    // Recalc randoms when current currentTarget updated
                    // REM: current pool view is the queue
                    // When we refill we need to ensure that the already played tracks are excluded
                    // ... if the user is re-entered the playing target
                    this.player.fillRandoms(this.vars.currentTrack, cur, this.appAudioPrefs.persistedHistory || this.appAudioPrefs.shuffle)
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
                if (cur == 0) {
                    // Removing App loading effect when all tracks imported
                    this.vars.appIsLoading = false

                    // Only display a success message if at least 1 or more non duplicates were imported
                    // ... and there are at least 1 or more files without errors or warnings
                    if (this.imports_count > 0) {
                        this.updateStatusMessage({
                            heading: `Successfully imported ${this.imports_count} sounds`,
                            isEmpty: false
                        })
                    }

                    // Overwrite success message with errors
                    if (this.error_imports.length > 0) {
                        // Then issues with non sound files
                        this.updateFailMessage({
                            heading: 'Error during file(s) scan', 
                            message: `Detected ${this.error_imports.length} non sound file(s):`, 
                            items: this.error_imports
                        })
                    }

                    // In case duplicated files are droped
                    if (this.failed_imports.length > 0) {
                        this.updateFailMessage({
                            heading: 'Detected potential sound file(s) duplication',
                            message: `Discovered ${this.failed_imports.length} duplicate track(s)`,
                            items: this.failed_imports
                        })
                    }

                    // Report warning
                    if (this.warn_imports.length > 0) {
                        // Metas warning report
                        this.updateWarnMessage({
                            heading: 'Detected sound file(s) with weird media tags',
                            message: `Unable to retrieve media tag from (${this.warn_imports.length}) sound file(s): `, 
                            items: this.warn_imports
                        })
                    }

                    // Reset imports count
                    this.imports_count = 0

                    // Final catch for autoplay
                    // reset flag
                    this.vars.autoplay = false

                    // Add new tracks to randoms
                    if (this.appAudioPrefs.shuffle) {
                        this.player.fillRandoms(this.vars.currentTrack, this.filteredPool, this.appAudioPrefs.persistedHistory || this.appAudioPrefs.shuffle)
                    }
                }
            },

            imported_non_sound_folders (cur, old) {
                if (cur) {
                    this.vars.appIsLoading = false
                }
            },

            imported_non_sound_files (cur, old) {
                if (cur) {
                    this.vars.appIsLoading = false
                }
            },

            error_imports (cur, old) {
                if (cur.length == 0) {
                    // Stricly to reset whole non sound file drop
                    this.imported_non_sound_folders = false
                    this.imported_non_sound_files = false
                }
            }
        },
        methods: {
            ...mapActions([
                'addTrack',
                'editTrack',
                'deleteTrack',
                'incrementPlayCount',
                'updateVolume',
                'setVolume',
                'restoreVolume',
                'toggleMute',
                'toggleShuffle',
                'toggleSettings',
                'toggleNightMode',
                'setNightMode',
                'setLoop',
                'cacheMainRoute',
                'cacheChildRoute',
                'toggleAudioEQVisibility'
            ]),

            restoreVueState(data) {
                this.dataRehydrated = true

                this.pool = data.pool
                this.vars = data.vars
                this.imports = data.imports

                // restore player state
                this.player.activated = data.player.activated
                this.player.bands = data.player.bands
                this.player.cleared = data.player.cleared
                this.player.currentTrack = data.player.currentTrack
                this.player.playedIDs = data.player.playedIDs
                this.player.randoms = data.player.randoms
                this.player.tmpPlayedIDs = data.player.tmpPlayedIDs

                if (data.vars.currentTrack) {
                    this.player.playNew(data.vars.currentTrack.source)

                    // Restore last player pos
                    this.vars.playedPercent = data.playedPercent

                    // Restore wave
                    this.vars.currentPos = data.currentPos

                    // Restore album art
                    Id('album-art').src = data.art
                }

                this.checkAndSetAutoNM()
            },

            checkAndSetAutoNM() {
                if (this.appAutoNightMode) {
                    let {am, pm} = this.appAutoNightModeTime

                    let [hrs, min, sec] = getCurrentTime()

                    // Define vm
                    let vm = this

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
            },

            loadTheme() {
                let head = TagNameSingle('head')
                let linkExists = TagName('link').length > 0
                let link

                if (linkExists) {
                    link = TagNameSingle('link', 1)
                    link.href = path.join('static', 'theme', this.appTheme + '.css')
                } else {
                    link = CreateElm('link')
                    link.rel = 'stylesheet'
                    link.href = path.join('static', 'theme', this.appTheme + '.css')

                    head.appendChild(link)
                }
            },

            loadExtraSheet() {
                let link

                link = CreateElm('link')
                link.rel = 'stylesheet'
                link.href = path.join('static', 'theme', `${os.platform}.css`)

                TagNameSingle('head').append(link)
            },

            displayNotification() {
                new Notification(this.vars.currentTrack.title, {
                    body: this.vars.currentTrack.artist,
                    silent: true,
                    timeout: 2,
                    // Display album art only if found
                    icon: this.vars.foundArt ? 
                            Id('album-art').src :
                            path.join(__static, 'icons', 'unkown-notif.png')
                })
            },

            updateSearchText(text) {
                this.vars.searchText = text
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

                    if (this.currentTarget == 'Favourites') {
                        this.updatePool(this.getFavs())
                        return
                    }

                    if (this.currentTarget == 'Most Played') {
                        // Grab average plays from state
                        // compare and return
                        return
                    }

                    if (this.currentCriteria == 'playlist') {
                        this.updatePool(this.allTracks.filter((track) => {
                            if (this.currentTarget) {
                                return this.currentTarget.ids.length > 0 ? this.currentTarget.ids.includes(track.id) : false
                            } else { return false }
                        }))
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

            getFavs() {
                return this.allTracks.filter((track) => {
            		return track.favourite == true
            	})
            },

            updateCurrentTrack (track) {
                this.vars.currentTrack = track

                // If in shuffle, we need to remove it from the `randoms` set
                // ... we don't want it to later be played
                if (this.appAudioPrefs.shuffle && track) {
                    let cid = getIndexFromKey(this.filteredPool, 'id', track.id)

                    this.player.freeRandTrack(cid)
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
                            // No need since in new App session it is triggered if shuffle enabled in the previous session
                            // ... even if newly activated shuffle, this is handled as well

                            // then reset index
                            let cid = this.player.getNextRandom(this.vars.currentTrack, this.filteredPool, this.vars.skippedCurrentTrack)
                            index = getIndexFromKey(this.filteredPool, 'id', cid)
                        }
          
                        // Only if there are indeed tracks to play
                        if (this.allTracks.length > 0 || this.filteredPool.length > 0) {
                            // Loading state init
                            this.vars.loadingTrack = true

                            this.updateCurrentTrack(this.filteredPool[index])
                        } 
                    } else {
                        // We only attempt to play a new track if it does exist
                        if (this.allTracks.length > 0 || this.filteredPool.length > 0) {
                            this.vars.loadingTrack = true

                            // If not we play the track currently active (indexed)
                            this.updateCurrentTrack(this.filteredPool[this.vars.index])
                        }
                    }
                }
            },

            triggerPlaypause(ev) {
                // Find out if any input field are currently in use
                // if not we go ahead and trigger play
                if (!(this.vars.lock.input)) {
                    ev.preventDefault()
                    // Remember the 'enter/backspace' is locked when any input is currently focused
                    this.triggerPlay()
                }
            },

            updateIndex(val) {
                this.vars.index = val
            },

            prevTrack() {
                if (this.vars.currentTrack) {
                    let cindex = getIndexFromKey(this.filteredPool, 'id', this.vars.currentTrack.id)
                    let idx = getIndexFromKey(this.filteredPool, 'id', this.player.tmpPlayedIDs.pop())

                    // Only trigger if a previous track exists
                    if ((cindex > 0)) {
                        // Only use the previously played track index if in shuffle mode
                        // fix: if the `tmpPlayedIDs` array is exhausted 'cindex - 1' is used
                        if (this.appAudioPrefs.shuffle && (idx != -1)) {
                            cindex = idx ? idx : cindex
                        } else { cindex = cindex - 1 }

                        this.updateCurrentTrack(this.filteredPool[cindex])
                    }
                }
            },

            nextTrack() {
                // Get index of current & next playing track
                let oindex = getIndexFromKey(this.filteredPool, 'id', this.vars.currentTrack.id)
                let cindex

                // Only invoke `getNextRandom` if not in loop single
                // ... we can't pop randoms unless it is actually going to be used
                // ... since the loop single does not move on, no need
                if (this.appAudioPrefs.shuffle) {
                    // If shuffled, then grab next random index to play
                    let cid = this.player.getNextRandom(this.vars.currentTrack, this.filteredPool, this.vars.skippedCurrentTrack)
                    cindex = getIndexFromKey(this.filteredPool, 'id', cid)
                } else {
                    // Set to normal next track index from current track
                    cindex = getIndexFromKey(this.filteredPool, 'id', this.vars.currentTrack.id) + 1
                }

                // Skipped tracks should be treated as being played already
                // ... this way we can play the previous tracks
                // It does not depend on the `persistedHistory` since we need to pop the prev tracks
                // ... REM: outside of the 'shuffle' mode the prev track is just `cindex - 1` 
                if (this.appAudioPrefs.shuffle) {
                    this.player.fillHistory(this.filteredPool, oindex)
                }

                // Loop check first since its just to repeat the track
                // ... it blocks the next track trigger since its checked first
                if (this.appAudioPrefs.loopSingle && !this.vars.skippedCurrentTrack) {
                    this.player.playNew(this.vars.currentTrack.source)
                } else {
                    // Check if a next track exists
                    if (cindex <= this.filteredPool.length-1) {
                        this.vars.loadingTrack = true

                        // If true, we just play it!
                        this.updateCurrentTrack(this.filteredPool[cindex])
                    }
                }
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

            handle_sleep_blocker(val) {
                if (val) {
                    ipcRenderer.send('turn-on-sleep-blocker')
                } else {
                    ipcRenderer.send('turn-off-sleep-blocker')
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

                // Tired of seeing the error
                if (tbody) {
                    if (tbody.scrollHeight > tbody.clientHeight) {
                        // We use the static width of the window not the table
                        // ... To avoid mutating both thead and tbody
                        thead.style.width = String(window.innerWidth - 250 - 1.5) + "px"
                    } else {
                        // If no scollbars are detected the width is automatically
                        // ... the window's minus the sidpane's width
                        thead.style.width = String(window.innerWidth - 250) + "px"
                    }
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

            setPlaylistFocus (val) {
                this.vars.playlistFocus = val
            },

            setPlaylistModal(val) {
                // Defaults to toggle if not val passed
                this.vars.modals.playlist = val ? val : !this.vars.modals.playlist
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

            crawl(dir, excludedFolders=false) {
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
                    let format = path.extname(file).slice(1)

                    // All supported formats
                    if (['mp3', 'ogg', 'wav', 'm4a'].includes(format)) {
                        tracks.push(file)
                    }
                }, excludedFolders ? this.appExcludedFolders : [])

                return tracks
            },

            handle_new_track(obj) {
                // The track has the following properties:
                // Not a folder
                // Is a supported sound file
                // Might have metas; we can't tell until we try to load it
                this.imports -= 1

                // We extract the 'tags' and 'filepath'
                let tags = obj.tags
                let fp = obj.track_name

                // We build our track template here
                let meta = {
                    title: null,
                    artist: null,
                    album: null,
                    genre: null,
                    year: null,
                    source: fp
                }

                // Fill in the track template
                let raw_name = meta.source.slice(meta.source.lastIndexOf('/') + 1, meta.source.length)

                meta.title = this.isEmpty(tags.title) ? raw_name.slice(0, raw_name.lastIndexOf('.')) : tags.title

                meta.artist = this.isEmpty(tags.artist) ? 'Unknown' : tags.artist

                meta.album = this.isEmpty(tags.album) || tags.album === '' ? 'Unknown' : tags.album

                meta.genre = this.isEmpty(tags.genre) ? 'Unknown' : tags.genre

                meta.year = this.isEmpty(tags.year) ? 'Unknown' : tags.year

                meta.activePlaylist = this.currentCriteria == 'playlist' ? this.currentTarget : null

                // Only add the track if its not a duplicate
                // Perform track dup check
                let result = add(this.allTracks, meta, false, 'source', true)

                // Lets check length instead
                if (result.length > this.allTracks.length) {
                    // Finally we add the track to our store
                    this.addTrack(meta)

                    // This is the ultimate decider of a successful import 
                    this.imports_count += 1
                } else {
                    // Lets override the 'failure' message from here
                    // ... we log the duplicated files to be reported later
                    // But only log the error to display if not autoplayed
                    // ... the user does not need the error message since the track probably already exists
                    if (!this.vars.autoplay) {
                        this.failed_imports = add(this.failed_imports, meta.source)
                    }
                }

                // We handle the autoplay in the imports hook
                // If new track and autoplay triggered
                // We automatically play it
                if (this.vars.autoplay) {
                    // This means it we would play tracks that are even outside the current context
                    let cindex = getIndexFromKey(this.allTracks, 'source', meta.source)

                    this.updateCurrentTrack(this.allTracks[cindex])

                    // Grab ID for shuffle del
                    let cid = getIndexFromKey(this.allTracks, 'id', this.vars.currentTrack.id)

                    this.player.playNew(this.vars.currentTrack.source)

                    // Record in hisroty as played
                    this.player.fillHistory(this.allTracks, cindex)

                    // Take it out of the randoms array
                    if (this.appAudioPrefs.shuffle) {
                        this.player.freeRandTrack(cid)
                    }

                    // Done with catch
                    this.vars.autoplay = false
                }
            },

            handle_new_track_warn(track_path) {
                // Log it in the warning
                // we still accept metaless tracks
                this.warn_imports = add(this.warn_imports, track_path)
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
                }).catch(err => {
                    // freeze data
                    // To be used to disallow reporting duplicate & bad meta messages
                    let autoplay = this.vars.autoplay

                    // And we handle error reporting using the JS Object
                    // ... containing the details of the scan error
                    // ... aswell as the sound filepath
                    // continue processing with dummy meta
                    this.handle_new_track({
                        tags: {
                            title: null,
                            artist: null,
                            album: null,
                            genre: null,
                            year: null
                        },
                        track_name: track
                    })

                    // Do not log error if autoplayed
                    // We don't need to bother the user with unecessary messages
                    if (!autoplay) {
                        // We just warn the user, but still go ahead and import it
                        this.handle_new_track_warn(track)
                    }
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

            resolveObjPath (obj) {
                // The dropped items might be from DnD (File objects)
                // or from open with ... or CLI args (list of paths)
                if (typeof obj == 'string') {
                    return obj
                } else {
                    return obj.path
                }
            },

            isObjectFolder(obj) {
                if (typeof obj == 'object') {
                    return obj.type == ''
                } else {
                    return !isFile(obj)
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

            syncFiles() {
                // Trigger import with excluded folders
                this.addFiles([this.appMusicFolder], true)
            },

            addFiles(obj, excludedFolders=false) {
                // Clear all (modal) message
                this.clearStatusMessage()
                this.clearAllWarnMessage()
                this.clearAllFailMessage()
                this.clearAllErrorMessage()

                // Check if Dir or audio dropped or processing arg
                let objs = this.resolveObjectFiles(obj)

                // Log track counts at once instead of logging singles
                this.imports += Array.from(objs).filter((obj) => { return isFile(this.resolveObjPath(obj)) }).length

                for (var i = 0;i < objs.length;i++) {
                    // Determine whether the current item is a folder
                    let is_obj_folder = this.isObjectFolder(objs[i])

                    if (is_obj_folder) {
                        // Only call load if actual folder track(s) are loaded
                        this.vars.appIsLoading = true

                        // Get folder path
                        let folder_path = this.resolveObjectPath(objs[i])

                        let tracks = this.crawl(folder_path, excludedFolders)

                        // Count to import
                        this.imports += tracks.length

                        // Only go ahead if the folder or some deeply nested one has tracks
                        if (tracks.length > 0) {
                            for (var j = 0;j < tracks.length;j++) {
                                this.deref(tracks[j])
                            }
                        } else {
                            // If this cond is reached then the parent folder has problems
                            // Non sound files folder edge case we let it slip
                            // then reset app loading var
                            this.imported_non_sound_folders = true
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
                            this.deref(filepath)
                        } else {
                            // if non sound files edge case we let it slip
                            // then reset app loading var
                            this.imported_non_sound_files = true
                        }
                    }
                }
            }
        },
        computed: {
            ...mapGetters([
                'allTracks',
                'currentTarget',
                'currentCriteria',
                'currentDirec',
                'sortBy',
                'appMusicFolder',
                'appExcludedFolders',
                'appTheme',
                'appNightMode',
                'appAutoNightMode',
                'appAutoNightModeTime',
                'appAudioEQ',
                'appAudioPrefs',
                'appAudioPlaybackBehaviour',
                'appRoutes',
                'appNotifs',
                'sleepBlocker',
                'enableReplayGain'
            ]),

            filteredPool () {
                var tmp = this.pool.slice(0)

                // Filter and sort
                return tmp.filter((track) => {
                    return track.title.toLowerCase().includes(this.vars.searchText.toLowerCase()) || 
                        track.artist.toLowerCase().includes(this.vars.searchText.toLowerCase()) || 
                        track.album.toLowerCase().includes(this.vars.searchText.toLowerCase()) || 
                        track.genre.toLowerCase().includes(this.vars.searchText.toLowerCase())
                }).sort((a, b) => {
                    // We want sorting to be 'sortBy' first then sorted by 'title'
                    // Found this concatenation hack on stack overflow
                    // here: https://stackoverflow.com/questions/11379361/how-to-sort-an-array-of-objects-with-multiple-field-values-in-javascript
                    let tmp_a = this.sortBy == 'title' ? a[this.sortBy].toLowerCase() : 
                                                        a[this.sortBy].toLowerCase() + a['title'].toLowerCase()

                    let tmp_b = this.sortBy == 'title' ? b[this.sortBy].toLowerCase() : 
                                                        b[this.sortBy].toLowerCase() + b['title'].toLowerCase()

                    if (tmp_a > tmp_b) {
                        return this.currentDirec == 'a-z' ? 1 : -1
                    } else {
                        return this.currentDirec == 'z-a' ? 1 : -1
                    }
                }).slice(0)
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

<template>
    <div id="app" @dragover.prevent @drop.prevent="addFiles" @click="closeModals">
        <Search></Search>
        <AudioTS></AudioTS>
        <AudioSTS></AudioSTS>
        <Sidepane></Sidepane>
        <span>
            <transition name="faded-slide-in">
                <router-view></router-view>
            </transition>
        </span>

        <transition name="rise">
            <div class="status-message" v-show="!statusMessage.isEmpty">
                <div class="cancel-btn" @click="clearStatusMessage">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 40 40" width="15" height="15"><path d=" M 20 17.879 L 7.979 5.858 C 7.394 5.272 6.443 5.272 5.858 5.858 L 5.858 5.858 C 5.272 6.443 5.272 7.394 5.858 7.979 L 17.879 20 L 5.858 32.021 C 5.272 32.606 5.272 33.557 5.858 34.142 L 5.858 34.142 C 6.443 34.728 7.394 34.728 7.979 34.142 L 20 22.121 L 32.021 34.142 C 32.606 34.728 33.557 34.728 34.142 34.142 L 34.142 34.142 C 34.728 33.557 34.728 32.606 34.142 32.021 L 22.121 20 L 34.142 7.979 C 34.728 7.394 34.728 6.443 34.142 5.858 L 34.142 5.858 C 33.557 5.272 32.606 5.272 32.021 5.858 L 20 17.879 Z " fill-rule="evenodd" /></svg>
                </div>
                <h4>
                    {{ statusMessage.heading }}
                </h4>
            </div>
        </transition>

        <transition name="rise">
            <div class="error-message" v-show="!errorMessage.isEmpty">
                <div class="cancel-btn" @click="clearAllErrorMessage">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 40 40" width="15" height="15"><path d=" M 20 17.879 L 7.979 5.858 C 7.394 5.272 6.443 5.272 5.858 5.858 L 5.858 5.858 C 5.272 6.443 5.272 7.394 5.858 7.979 L 17.879 20 L 5.858 32.021 C 5.272 32.606 5.272 33.557 5.858 34.142 L 5.858 34.142 C 6.443 34.728 7.394 34.728 7.979 34.142 L 20 22.121 L 32.021 34.142 C 32.606 34.728 33.557 34.728 34.142 34.142 L 34.142 34.142 C 34.728 33.557 34.728 32.606 34.142 32.021 L 22.121 20 L 34.142 7.979 C 34.728 7.394 34.728 6.443 34.142 5.858 L 34.142 5.858 C 33.557 5.272 32.606 5.272 32.021 5.858 L 20 17.879 Z " fill-rule="evenodd" /></svg>
                </div>
                <h4>
                    {{ errorMessage.heading }}
                </h4>
                <p>
                    {{ errorMessage.message }}
                </p>

                <div class="tight-listing">
                    <p v-for="item in errorMessage.items">{{ item }}</p>
                </div>
            </div>
        </transition>

        <transition name="rise">
            <div class="warn-message" v-show="!warnMessage.isEmpty">
                <div class="cancel-btn" @click="clearAllWarnMessage">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 40 40" width="15" height="15"><path d=" M 20 17.879 L 7.979 5.858 C 7.394 5.272 6.443 5.272 5.858 5.858 L 5.858 5.858 C 5.272 6.443 5.272 7.394 5.858 7.979 L 17.879 20 L 5.858 32.021 C 5.272 32.606 5.272 33.557 5.858 34.142 L 5.858 34.142 C 6.443 34.728 7.394 34.728 7.979 34.142 L 20 22.121 L 32.021 34.142 C 32.606 34.728 33.557 34.728 34.142 34.142 L 34.142 34.142 C 34.728 33.557 34.728 32.606 34.142 32.021 L 22.121 20 L 34.142 7.979 C 34.728 7.394 34.728 6.443 34.142 5.858 L 34.142 5.858 C 33.557 5.272 32.606 5.272 32.021 5.858 L 20 17.879 Z " fill-rule="evenodd" /></svg>
                </div>
                <h4>
                    {{ warnMessage.heading }}
                </h4>
                <p>
                    {{ warnMessage.message }}
                </p>

                <div class="tight-listing">
                    <p v-for="item in warnMessage.items">{{ item }}</p>
                </div>
            </div>
        </transition>

        <transition name="rise">
            <div class="fail-message" v-show="!failMessage.isEmpty">
                <div class="cancel-btn" @click="clearAllFailMessage">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 40 40" width="15" height="15"><path d=" M 20 17.879 L 7.979 5.858 C 7.394 5.272 6.443 5.272 5.858 5.858 L 5.858 5.858 C 5.272 6.443 5.272 7.394 5.858 7.979 L 17.879 20 L 5.858 32.021 C 5.272 32.606 5.272 33.557 5.858 34.142 L 5.858 34.142 C 6.443 34.728 7.394 34.728 7.979 34.142 L 20 22.121 L 32.021 34.142 C 32.606 34.728 33.557 34.728 34.142 34.142 L 34.142 34.142 C 34.728 33.557 34.728 32.606 34.142 32.021 L 22.121 20 L 34.142 7.979 C 34.728 7.394 34.728 6.443 34.142 5.858 L 34.142 5.858 C 33.557 5.272 32.606 5.272 32.021 5.858 L 20 17.879 Z " fill-rule="evenodd" /></svg>
                </div>
                <h4>
                    {{ failMessage.heading }}
                </h4>
                <p>
                    {{ failMessage.message }}
                </p>

                <div class="tight-listing">
                    <p v-for="item in failMessage.items">{{ item }}</p>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import AudioTS              from './components/Toolset/AudioTS.vue'
    import AudioSTS             from './components/Toolset/AudioSTS.vue'
    import Search               from './components/Search/SearchBar.vue'
    import Sidepane             from './components/Sidepane/Sidepane.vue'

    const schedule = require('node-schedule')

    import {
            mapActions,
            mapGetters }        from 'vuex'

    import FS                   from './utils/dirwalker'

    import {
            Id,
            ClassName }         from './utils/htmlQuery'

    import { isNightTime,
            reformatTo24Hours } from './utils/time'

    const {
            remote,
            dialog,
            ipcRenderer } = require('electron')

    const jsm             = require('jsmediatags')

    const fs              = require('fs')
    const path            = require('path')

    export default {
        components: {
            Search,
            AudioTS,
            AudioSTS,
            Sidepane
        },
        data() {
            return {
                error_imports: [],
                imported_folders: [],
                failed_imports: [],
                imports: 0,
                imports_count: 0
            }
        },
        created() {
            // Watch for window resizing to ensure thead's ths aligns properly with the tbody's tds
            // Lets resisze it if the scrollbars are visible on landing
            // and ellipses should be visible aswell
            window.addEventListener('resize', this.handle_window_update)

            // Request startup args from Main
            ipcRenderer.send('request-startup-process-args')

            ipcRenderer.on('ack-startup-process-args', (event, arg) => {
                let last_arg = arg.files ? arg.files : arg.startup_args[arg.startup_args.length-1]

                // Only begin parsing arg if sound path or folder path injected
                if (!last_arg.toLowerCase().includes('soundplay')) {
                    this.addFiles(last_arg)

                    // Trigger play when done parsing
                }
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
                        vm.setLoading(true)

                        // Make sure we check whether the user canceled the dialog first
                        // ... before we start performing any actions
                        if (items.length > 0) {
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
                                vm.setLoading(true)

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
            if (this.cachedRoutes.mainRoute == '/settings') {
                this.$router.push(this.cachedRoutes.childRoute)
            } else {
                this.$router.push(this.cachedRoutes.mainRoute)
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
        },
        watch: {
            '$route' (cur, old) {
                if (cur.path == '/') {
                    this.windowUpdated()

                    if (!this.statusMessage.isEmpty) {
                        this.clearStatusMessage()
                    }
                }
            },

            appTheme (cur, old) {
                // reload theme after every theme change
                this.loadTheme()
            },

            imports (cur, old) {
                if (cur == 0) {
                    this.setLoading(false)

                    // Only display a success message if atleast 1 or more non duplicates were imported
                    if (!(this.failMessage.items.length == this.imports_count)) {
                        this.updateStatusMessage({
                            heading: `Successfully imported ${this.imports_count - this.failMessage.items.length} sounds`,
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
                    if (this.failed_imports.length == 0 && this.failMessage.items.length > 0) {
                        this.updateFailMessage({
                            heading: 'Detected potential sound file(s) duplication',
                            message: `Discovered ${this.failMessage.items.length} duplicate track(s)`,
                            items: this.failMessage.items
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
                'updateStatusMessage',
                'updateErrorMessage',
                'updateWarnMessage',
                'updateFailMessage',
                'clearStatusMessage',
                'clearErrorMessage',
                'clearWarnMessage',
                'clearFailMessage',
                'setPlaylistModal',
                'clearCurrentTrack',
                'toggleSettings',
                'loadTheme',
                'toggleNightMode',
                'setNightMode',
                'setJobsFn',
                'setLoading'
            ]),

            handle_window_resize() {
                if (this.$route.path == '/') {
                    this.resizeThead()
                }

                this.windowUpdated()
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

            windowUpdated() {
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

                // Redraw waveform here
            },

            closeModals() {
                // Trigger modal close here
                // ... but only if it was open
                if (this.openPlaylistModal && !(Id('playlist-input') == document.activeElement)) {
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
                    let format = file.split('.')
                    format = format[format.length-1]

                    // All supported formats
                    if (['mp3', 'ogg', 'wav'].includes(format)) {
                        tracks.push(file)
                    }
                }, this.appExcludedFolders)

                return tracks
            },

            handle_new_track(obj) {
                this.imports -= 1

                // We extract the 'tags' and 'filepath'
                var tag = obj.tag
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
                let raw_filename = meta.source.slice(meta.source.lastIndexOf('/')+1, meta.source.length)

                meta.title = tag.tags.title === undefined ? raw_filename.split('.')[0] : tag.tags.title

                meta.artist = tag.tags.artist === undefined ? 'Unknown' : tag.tags.artist

                meta.album = tag.tags.album === undefined || tag.tags.album === '' ? 'Unknown' : tag.tags.album

                // Too large to store
                // ... maybe we load it when track is going to play
                // ... Or, we could write it to a file instead
                // ... and read it when track is going to play?
                // meta.art = tag.tags.picture === undefined  || tag.tags.picture === '' ? null : "data:image;base64," + Buffer(tag.tags.picture.data).base64Slice()

                meta.genre = tag.tags.genre === undefined || tag.tags.genre === '' ? 'Unknown' : tag.tags.genre

                meta.year = tag.tags.year === undefined ? 'Unknown' : tag.tags.year

                meta.activePlaylist = this.currentCriteria == 'playlist' ? this.currentTarget : null

                // Finally we add the track to our store
                this.addTrack(meta)
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
                    'title', 'artist', 'album', 'genre', 'year'
                    ]).read({
                        onSuccess: (tag) => {
                            resolve({
                                tag: tag,
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

            addFiles(ev) {
                // Check if Dir or audio dropped or processing arg
                let objs = typeof ev != 'object' ? [ev] : ev.dataTransfer.files
                window.objs = objs

                this.setLoading(true)

                for (var i = 0;i < objs.length;i++) {
                    // Determine whether the current item is a folder
                    let is_obj_folder = typeof objs[i] != 'object' ? !fs.statSync(objs[i]).isFile() : objs[i].type == ''

                    if (is_obj_folder) {
                        // Get folder path
                        let folder_path = typeof objs[i] != 'object' ? objs[i] : objs[i].path

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
                        let is_sound_file = typeof objs[i] != 'object' ? ['mp3', 'ogg', 'wav'].includes(objs[i].slice(objs[i].lastIndexOf('.')+1)) : objs[i].type == 'audio/mp3'

                        if (is_sound_file) {
                            // Obtain sound filepath
                            let filepath = typeof objs[i] != 'object' ? objs[i] : objs[i].path

                            // Scan and add Track
                            this.imports += 1
                            this.imports_count += 1
                            this.deref(filepath)
                        } else {
                            // Retrieve sound filepath
                            let filepath = typeof objs[i] != 'object' ? objs[i] : objs[i].path

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
                'currentTarget',
                'statusMessage',
                'errorMessage',
                'warnMessage',
                'failMessage',
                'cachedRoutes',
                'openPlaylistModal',
                'appExcludedFolders',
                'appTheme',
                'appNightMode',
                'appAutoNightMode',
                'appAutoNightModeTime'
            ])
        },
        beforeDestroy() {
            // Clear all error messages when app is closed
            // ... To avoid persisted error messages between sessions
            this.clearStatusMessage()
            this.clearErrorMessage()
            this.clearWarnMessage()
            this.clearFailMessage()

            // Clear playing track
            this.clearCurrentTrack()

            // Clear jobs
            this.setJobsFn({start: null, end: null})

            // Clear loading state
            this.setLoading(false)
        }
    }
</script>

<style lang="stylus">
/* CSS */

    @font-face
        font-family 'Lato'
        src url('./../../static/font/Lato/Lato-Regular.ttf') format('truetype')

/* end of decl */

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

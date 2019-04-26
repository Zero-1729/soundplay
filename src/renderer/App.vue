<template>
    <div id="app" @dragover.prevent @drop.prevent="addFiles" @click="closeModals">
        <Search></Search>
        <AudioTS></AudioTS>
        <AudioSTS></AudioSTS>
        <span :class="{'fade-pane': loading}">
            <router-view></router-view>
        </span>

        <div class="error-message" :class="{rise: !errorMessage.isEmpty}" v-show="!errorMessage.isEmpty">
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

        <div class="warn-message" :class="{rise: !warnMessage.isEmpty}" v-show="!warnMessage.isEmpty">
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

        <div class="fail-message" :class="{rise: !failMessage.isEmpty}" v-show="!failMessage.isEmpty">
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
    </div>
</template>

<script>
    import AudioTS              from './components/Toolset/AudioTS.vue'
    import AudioSTS             from './components/Toolset/AudioSTS.vue'
    import Search               from './components/Search/SearchBar.vue'
    import Sidepane             from './components/Sidepane/Sidepane.vue'
    import Trackspane           from './components/Trackspane/Trackspane.vue'

    import {
            mapActions,
            mapGetters }        from 'vuex'

    import FS                   from './utils/dirwalker'

    import { Id }               from './utils/htmlQuery'


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
            AudioSTS
        },
        data() {
            return {
                error_imports: [],
                imported_folders: [],
                failed_imports: [],
                all_imports: 0,
                loading: false
            }
        },
        created() {
            // Load style files
            this.loadStyle()

            // Resume last route
            this.$router.push(this.cachedRoute)

        },
        mounted() {
            window.addEventListener('resize', this.windowUpdated)

            // Handle events thrown from main renderer (App Menu)
            ipcRenderer.on('import-tracks', (event, arg) => {
                let objs = remote.dialog.showOpenDialog({
                    properties: ['openFile', 'multiSelections']
                })

                if (objs.length > 0) {
                    for (var i = 0;i < objs.length;i++) {
                        this.deref(objs[i])
                    }
                }
            })

            // Check fn for infinte loops
            ipcRenderer.on('import-folder', (event, arg) => {
                let objs = remote.dialog.showOpenDialog({
                    properties: ['openDirectory', 'multiSelections']
                })

                if (objs.length > 0) {
                    for (var i = 0;i < objs.length;i++) {
                        let tracks = this.crawl(objs[i])

                        for (var j = 0;j < tracks.length;j++) {
                            this.deref(tracks[j])
                        }
                    }
                }
            })

            ipcRenderer.on('delete-all', (event, arg) => {
                this.deleteAllTracks()
            })


            // If the 'musicFolder' is set we should update the store
            if (this.appMusicFolder) {
                // Load tracks from 'musicFolder'
                new FS(this.appMusicFolder).forEachFile((file) => {
                    let format = file.split('.')
                    format = format[format.length-1]

                    // All supported formats
                    if (['mp3', 'ogg', 'wav'].includes(format)) {
                        this.deref(file)
                    }
                }, this.appExcludedFolders)
            }
        },
        watch: {
            theme: function () {
                // reload theme after every theme change
                this.loadStyle()
            },
            all_imports: function () {
                // Because failed imports need to trigger the change
                if (this.all_imports < 0) {
                    // We want to show issues with folders first
                    if (this.imported_folders.length > 0) {
                        this.updateWarnMessage({heading: 'Error during file(s) scan', message: 'Detected ' + this.imported_folders.length + ' Folder(s):', items: this.imported_folders})
                    }

                    if (this.failed_imports.length > 0) {
                        // Then issues with non sound files
                        this.updateFailMessage({heading: 'Error during file(s) scan', message: 'Detected ' + this.failed_imports.length + ' non sound file(s):', items: this.failed_imports})
                    }


                    if (this.error_imports.length > 0) {
                        // And problematic sound files
                        this.updateErrorMessage({heading: 'Error during sound scan', message: 'Could not retrieve media tag from (' + this.error_imports.length + ') sound file(s): ', items: this.error_imports})
                    }

                    this.loading = false
                } else {
                    this.loading = true
                }
            }
        },
        methods: {
            ...mapActions([
                'addTrack',
                'deleteAllTracks',
                'updateErrorMessage',
                'updateWarnMessage',
                'updateFailMessage',
                'clearErrorMessage',
                'clearWarnMessage',
                'clearFailMessage',
                'setPlaylistModal',
                'clearCurrentTrack'
            ]),
            windowUpdated() {
                // Resize width to allow ellipses
                if (window.innerWidth > 1310) {
                    let length = document.getElementsByClassName('short').length

                    for (var i = 0;i < length;i++) {
                        document.getElementsByClassName('short')[i].style.width = "200%"
                    }
                } else {
                    let length = document.getElementsByClassName('short').length

                    for (var i = 0;i < length;i++) {
                        document.getElementsByClassName('short')[i].style.width = "100%"
                    }
                }

                // Redraw waveform here
            },
            loadStyle() {
                let head = document.getElementsByTagName('head')[0]
                let link = document.createElement('link')

                link.rel = 'stylesheet'
                link.type = 'text/css'
                link.href = path.join('/', 'static', 'theme', this.appTheme + '.css')
                link.media = 'all'

                head.appendChild(link)
            },
            closeModals() {
                // Trigger modal close here
                // ... but only if it was open
                if (this.openPlaylistModal && !(Id('playlist-input') == document.activeElement)) {
                    //this.$children[4].openModal = false
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
                this.all_imports -= 1

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
                    art: null,
                    source: fp
                }

                // Fill in the track template
                let raw_filename = meta.source.slice(meta.source.lastIndexOf('/')+1, meta.source.length)

                meta.title = tag.tags.title === undefined ? raw_filename.split('.')[0] : tag.tags.title

                meta.artist = tag.tags.artist === undefined ? 'Unknown' : tag.tags.artist

                meta.album = tag.tags.album === undefined || tag.tags.album === '' ? 'Unknown' : tag.tags.album

                meta.art = tag.tags.picture === undefined  || tag.tags.picture === '' ? null : "data:image;base64," + Buffer(tag.tags.picture.data).base64Slice()

                meta.genre = tag.tags.genre === undefined || tag.tags.genre === '' ? 'Unknown' : tag.tags.genre

                meta.year = tag.tags.year === undefined ? 'Unknown' : tag.tags.year

                meta.activePlaylist = this.currentCriteria == 'playlist' ? this.currentTarget : null

                // Finally we add the track to our store
                this.addTrack(meta)
            },
            handle_new_track_error(track_path) {
                this.error_imports.push(track_path)
                this.all_imports -= 1
            },
            deref(track) {
                // We create a JS promise and feed it the relevant state
                // ... This allows us to still have access to the sound's filepath
                new Promise((resolve, reject) => {
                    new jsm.Reader(track).setTagsToRead([
                    'title', 'artist', 'album', 'genre', 'picture', 'year'
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
                // Check if Dir or audio dropped
                let objs = ev.dataTransfer.files

                for (var i = 0;i < objs.length;i++) {
                    var callback = {
                        onSuccess: this.grab_tags,
                        onError: this.report_tag_error
                    }

                    if (objs[i].type == '') {
                        // We have (a potential) directory dropped
                        this.imported_folders.push(objs[i].path)

                        let tracks = this.crawl(objs[i].path)

                        this.all_imports += 1

                        for (var j = 0;j < tracks.length;j++) {
                            this.deref(tracks[j])
                        }
                    } else {
                        if (objs[i].type == 'audio/mp3') {
                            // Scan and add Track
                            this.all_imports += 1
                            this.deref(objs[i].path)
                        } else {
                            this.all_imports -= 1
                            this.failed_imports.push(objs[i].path)
                        }
                    }
                }
            },
        },
        computed: {
            ...mapGetters([
                'currentCriteria',
                'currentTarget',
                'errorMessage',
                'warnMessage',
                'failMessage',
                'cachedRoute',
                'openPlaylistModal',
                'appMusicFolder',
                'appExcludedFolders',
                'appTheme'
            ])
        },
        beforeDestroy() {
            // Clear all error messages when app is closed
            // ... To avoid persisted error messages between sessions
            this.clearErrorMessage()
            this.clearWarnMessage()
            this.clearFailMessage()

            // Clear playing track
            this.clearCurrentTrack()
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
        font-size 13px

    .cancel-btn
        cursor pointer
        position absolute
        top 15px
        right 20px

    .error-message, .warn-message, .fail-message
        width 300px
        height 105px
        position absolute
        right 30px
        bottom 30px
        padding 20px
        border-radius 5px
        h4
            margin-top 10px

    .rise
        animation rise 0.6s ease-in

    .error-message, .warn-message, .fail-message
        border-width 2.5px
        border-style solid

    .tight-listing
        height 30px
        overflow auto
        p
            margin-top 0
            margin-bottom 0

    .fade-pane
        opacity 0.4

    @keyframes rise
        0%
            bottom -150px
            opacity 0.3
        75%
            bottom 60px
        100%
            bottom 30px
            opacity 1

    ::-webkit-scrollbar
        width 3px
        height 2px

    ::-webkit-scrollbar-thumb:hover
        width 4px
</style>

<template>
    <div class="tight-main">
        <div class="option">
            <div class="option-item">
                <div class="flex">
                    <h3>
                        Clear Sounds
                    </h3>
                    <button @click="handle_delete_all_tracks">
                        Delete
                    </button>
                </div>
                <p class="info">
                    Delete all tracks in player
                </p>
            </div>
        </div>
        <div class="option">
            <div class="option-item">
                <div class="flex">
                    <h3>
                        Music Folder
                    </h3>
                    <button class="dialog-button" @click="handle_open_dialog">
                        <p>Open</p>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 20 20.15" width="20" height="20.15">
                            <path d=" M 19.021 10.633 C 18.48 10.633 18.042 11.072 18.042 11.612 C 18.042 11.938 18.042 15.624 18.04 17.375 C 18.039 17.571 18.038 18.168 17.305 18.193 C 17.305 18.193 2.54 18.193 2.54 18.193 C 2.308 18.193 2.135 18.148 2.065 18.07 C 1.995 17.992 1.948 17.697 1.959 17.597 C 1.965 17.551 1.969 17.505 1.969 17.458 C 1.969 17.458 1.969 2.693 1.969 2.693 C 1.969 2.493 1.996 2.227 2.129 2.096 C 2.262 1.964 2.502 1.96 2.54 1.959 C 2.54 1.959 8.25 1.959 8.25 1.959 C 8.791 1.959 9.229 1.52 9.229 0.98 C 9.229 0.439 8.791 0.001 8.25 0.001 C 8.25 0.001 2.591 0.002 2.591 0.002 C 2.484 -0.003 1.527 -0.033 0.787 0.669 C 0.433 1.005 0.011 1.63 0.011 2.693 C 0.011 2.693 0.011 17.407 0.011 17.407 C -0.017 17.706 -0.04 18.63 0.584 19.35 C 0.901 19.715 1.497 20.15 2.54 20.15 C 2.54 20.15 17.305 20.15 17.305 20.15 C 17.305 20.15 17.306 20.15 17.307 20.15 C 18.387 20.15 19.994 19.412 19.997 17.378 C 20 15.627 20 11.938 20 11.612 C 20 11.072 19.561 10.633 19.021 10.633" fill-rule="evenodd"/>
                            <path d=" M 19.93 0.622 C 19.929 0.617 19.928 0.612 19.926 0.607 C 19.826 0.366 19.634 0.174 19.393 0.074 C 19.388 0.072 19.383 0.071 19.378 0.069 C 19.267 0.026 19.148 0 19.021 0 C 19.021 0 12.658 0 12.658 0 C 12.117 0 11.679 0.439 11.679 0.979 C 11.679 1.519 12.117 1.958 12.658 1.958 Q 12.658 1.958 16.658 1.958 Q 9.763 8.852 9.763 8.852 C 9.381 9.235 9.381 9.855 9.763 10.237 C 9.954 10.428 10.205 10.524 10.455 10.524 C 10.706 10.524 10.956 10.428 11.147 10.237 Q 11.147 10.237 18.042 3.342 Q 18.042 7.587 18.042 7.587 C 18.042 8.127 18.48 8.566 19.021 8.566 C 19.562 8.566 20 8.127 20 7.587 C 20 7.587 20 0.979 20 0.979 C 20 0.853 19.974 0.733 19.93 0.622" fill-rule="evenodd" />
                        </svg>
                    </button>
                    <button class="dialog-button dialog-button-alt further"
                    :class="{'greyed-button': appMusicFolder == null, widthless: appMusicFolder}"
                    @click="removeMusicFolder">
                        <p>{{ appMusicFolder ? appMusicFolder : 'None' }}</p>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 20 20" width="8" height="8">
                            <path d="M 0.397 0.397 L 0.397 0.397 C 0.927 -0.132 1.788 -0.132 2.318 0.397 L 19.603 17.682 C 20.132 18.212 20.132 19.073 19.603 19.603 L 19.603 19.603 C 19.073 20.132 18.212 20.132 17.682 19.603 L 0.397 2.318 C -0.132 1.788 -0.132 0.927 0.397 0.397 Z" style="stroke:none;stroke-miterlimit:10;"/>
                            <path d="M 19.603 0.397 L 19.603 0.397 C 20.132 0.927 20.132 1.788 19.603 2.318 L 2.318 19.603 C 1.788 20.132 0.927 20.132 0.397 19.603 L 0.397 19.603 C -0.132 19.073 -0.132 18.212 0.397 17.682 L 17.682 0.397 C 18.212 -0.132 19.073 -0.132 19.603 0.397 Z" style="stroke:none;stroke-miterlimit:10;"/>
                        </svg>
                    </button>
                    <button class="dialog-button dialog-button-alt furthest green"
                    :class="{'greyed-button': appMusicFolder == null}"
                    @click="handle_music_sync">
                        <p>Sync</p>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="1316.56 321.171 38.1 36.125" width="12" height="12">
                            <path d=" M 1329.93 335.722 C 1329.93 334.895 1329.26 334.227 1328.43 334.227 C 1328.43 334.227 1321.78 334.248 1321.78 334.248 C 1323.7 328.318 1329.31 324.191 1335.58 324.171 C 1335.59 324.171 1335.61 324.171 1335.63 324.171 C 1342.63 324.171 1348.65 329.154 1349.94 336.036 C 1350.075 336.756 1350.7 337.261 1351.41 337.261 C 1351.5 337.261 1351.6 337.252 1351.69 337.235 C 1352.5 337.082 1353.04 336.299 1352.89 335.484 C 1351.361 327.176 1344.08 321.171 1335.63 321.171 C 1335.61 321.171 1335.59 321.171 1335.57 321.171 C 1328.63 321.171 1322.35 325.399 1319.58 331.629 C 1319.58 331.629 1319.56 326.005 1319.56 326.005 C 1319.56 325.179 1318.88 324.51 1318.06 324.51 C 1318.06 324.51 1318.06 324.51 1318.05 324.51 C 1317.23 324.51 1316.56 325.187 1316.56 326.015 C 1316.56 326.015 1316.59 335.765 1316.59 335.765 C 1316.59 336.163 1316.75 336.544 1317.03 336.824 C 1317.31 337.104 1317.69 337.26 1318.09 337.26 C 1318.09 337.26 1328.44 337.227 1328.44 337.227 C 1329.27 337.224 1329.94 336.55 1329.93 335.722" fill-rule="evenodd" />
                            <path d=" M 1354.63 342.466 C 1354.62 341.64 1353.95 340.971 1353.13 340.971 Q 1353.13 340.971 1353.12 340.971 Q 1342.78 341.004 1342.78 341.004 C 1341.95 341.007 1341.28 341.681 1341.28 342.509 C 1341.28 343.337 1341.96 344.004 1342.78 344.004 C 1342.79 344.004 1342.79 344.004 1342.79 344.004 C 1342.79 344.004 1349.54 343.983 1349.54 343.983 C 1347.7 350.062 1342.08 354.275 1335.67 354.296 C 1335.66 354.296 1335.65 354.296 1335.63 354.296 C 1329.33 354.296 1322.95 349.339 1321.68 343.454 C 1321.505 342.642 1320.7 342.131 1319.9 342.303 C 1319.1 342.475 1318.57 343.276 1318.75 344.085 C 1320.37 351.368 1327.89 357.296 1335.63 357.296 C 1335.65 357.296 1335.67 357.296 1335.68 357.296 C 1342.66 357.296 1348.86 353.141 1351.64 346.951 C 1351.64 346.951 1351.66 352.226 1351.66 352.226 C 1351.66 353.052 1352.33 353.721 1353.16 353.721 C 1353.99 353.721 1354.66 353.044 1354.66 352.216 Q 1354.66 352.216 1354.63 342.466" fill-rule="evenodd" />
                        </svg>
                    </button>
                </div>
                <p class="info">
                    Folder to sync tracks from every startup
                </p>
            </div>
        </div>
        <div class="option">
            <div class="option-item">
                <div class="flex">
                    <h3>
                        Excluded Folder(s)
                    </h3>
                    <input id="settings-input" placeholder="Enter Folder name..." v-model="newFolder" @keydown.enter="handle_new_excluded_folder">

                    <div class="flexed-div-holder">
                        <div class="flexed-div" v-for="folder in appExcludedFolders">
                            <button @click="removeExcludedFolder(folder)">
                                <p>{{ folder }}</p>
                                <svg @hover="handle_hovered_folder(folder)"  :class="{showClose: hoveredFolder == folder}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 20 20" width="10" height="10">
                                    <path d="M 0.397 0.397 L 0.397 0.397 C 0.927 -0.132 1.788 -0.132 2.318 0.397 L 19.603 17.682 C 20.132 18.212 20.132 19.073 19.603 19.603 L 19.603 19.603 C 19.073 20.132 18.212 20.132 17.682 19.603 L 0.397 2.318 C -0.132 1.788 -0.132 0.927 0.397 0.397 Z" style="stroke:none;stroke-miterlimit:10;"/>
                                    <path d="M 19.603 0.397 L 19.603 0.397 C 20.132 0.927 20.132 1.788 19.603 2.318 L 2.318 19.603 C 1.788 20.132 0.927 20.132 0.397 19.603 L 0.397 19.603 C -0.132 19.073 -0.132 18.212 0.397 17.682 L 17.682 0.397 C 18.212 -0.132 19.073 -0.132 19.603 0.397 Z" style="stroke:none;stroke-miterlimit:10;"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <p class="info">
                    Folder(s) to be skipped during sound scans
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    const { remote } = require('electron')

    import FS                         from './../../utils/dirwalker'

    export default {
        name: 'general-settings',
        data() {
            return {
                newFolder: '',
                hoveredFolder: ''
            }
        },
        watch: {
            newFolder(cur, old) {
                if (cur == '') {
                    this.unlockHotKey('enter')
                }
            },
            allTracks(cur, old) {
                if (cur.length == 0) {
                    this.$emit('appLoading', false)

                    this.updateStatusMessage({
                        heading: 'Successfully deleted all sounds',
                        isEmpty: false
                    })
                }
            }
        },
        methods: {
            ...mapActions([
                'deleteAllTracks',
                'updatePlayingCriteria',
                'updateExcludedFolder',
                'removeExcludedFolder',
                'setMusicFolder',
                'removeMusicFolder',
                'lockHotKey',
                'unlockHotKey',
                'updateStatusMessage'
            ]),

            handle_delete_all_tracks() {
                // If all tracks are removed then we definitely know the current track is also

                // Pause player here
                this.updatePlayingCriteria(null)
                this.deleteAllTracks()
            },

            handle_open_dialog() {
                let name = remote.dialog.showOpenDialog({
                    properties: ['openDirectory']
                })

                this.setMusicFolder(name[0])
            },

            handle_hovered_folder(folder) {
                this.hoveredFolder = folder
            },

            handle_new_excluded_folder() {
                this.lockHotKey('enter')
                this.updateExcludedFolder(this.newFolder)
                this.newFolder = ''
            },

            handle_music_sync() {
                if (this.appMusicFolder) {
                    // Load tracks from 'musicFolder'
                    new FS(this.appMusicFolder).forEachFile((file) => {
                        let format = file.split('.')
                        format = format[format.length-1]

                        // All supported formats
                        if (['mp3', 'ogg', 'wav'].includes(format)) {
                            this.$parent.$parent.deref(file)
                        }
                    }, this.appExcludedFolders)
                }
            }
        },
        computed: {
            ...mapGetters([
                'allTracks',
                'appMusicFolder',
                'appExcludedFolders'
            ])
        }
    }
</script>

<style lang="stylus" scoped>
    .flex button
        height 25px
        margin-top 14px
        margin-left 110px
        border-radius 2px
        border-width inherit
        width 58px
        transition all 0.3s linear
        cursor pointer

    .flexed-div-holder
        height 30px
        width 55%
        display flex
        overflow-x auto
        overflow-y hidden
        margin-top 4px
        margin-left 20px
        .flexed-div
            button:first-child
                margin-left 0

    .flexed-div
        height 20px
        margin-left 4px
        display flex
        p
            margin 0
            padding 0
            align-self center
        button
            width unset
            display flex
            height 25px
            margin-top 0
            margin-left 8px
            padding 0
            border-radius 2px
            border-width inherit
            transition all 0.3s linear
            cursor pointer
            p
                margin-left 6px
                margin-right auto
                padding-right 6px
            svg
                margin-left 8px
                margin-right 8px
                height 100%
                display none
            svg.showClose
                display block

    .dialog-button
        display flex
        p
            display flex
            height 100%
            align-self center
            margin-right 4px
            margin-left 0
            margin-top 0
            margin-bottom 0
        svg
            margin-top 2px
            height 75%

    .dialog-button
        transition width 0.3s ease-in

    .dialog-button-alt.greyed-button
        opacity 0.4
        cursor default

    .dialog-button.dialog-button-alt.further.widthless
        width unset

    .dialog-button.dialog-button-alt.further
            margin-left 15px

    .dialog-button.dialog-button-alt.furthest
            margin-left 10px

    input#settings-input
        height 22px
        margin-top 6px
        align-self center
        border-top none
        border-right none
        border-left none
        border-bottom-width 2px
        border-bottom-style solid
        margin-left 20px
        background transparent
        transition all 0.4s ease-out
</style>

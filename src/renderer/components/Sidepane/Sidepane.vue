<template>
    <div class="vertical-div">
        <div class="vertical-div-holder">
            <div v-for="item in currentOptions" class="entity" @click="handle_item_click(item)" :class="{activeTarget: isActiveItem(item), greyedText: parseItem(item) == parseItem(playingTarget)}">
                <p
                @contextmenu.prevent @mousedown.right.capture="showItemOptions(typeof item.name == 'object' ? item.name : item)"
                @dblclick="cachePlaylistName"
                @keydown.enter.prevent="handlePlaylistRename"
                @blur="clearEditable"
                contenteditable=false>
                    {{ parseItem(item) }}
                </p>
            </div>
        </div>
        <div class="empty-listing" v-if="currentOptions.length == 0">
            <h4>
                No {{ currentCriteria }} found
            </h4>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    const { remote }          = require('electron')

    const { ClassNameSingle } = require('./../../utils/htmlQuery')

    const { buildMap }        = require('./../../utils/object')

    export default {
        name: 'sidepane',
        props: [
            'playingTarget',
            'playingCriteria'
        ],
        data() {
            return {
                hoveredElm: null,
                cachedText: '',
                settingsNames: [
                    'General',
                    'Interface',
                    'Audio'
                ],
                settingsPaths: [
                    '/',
                    '/ui',
                    '/audio'
                ]
            }
        },
        mounted() {
            if (ClassNameSingle('activeTarget')) {
                ClassNameSingle('activeTarget').scrollIntoViewIfNeeded()
            }
        },
        watch: {
            currentCriteria (cur, prev) {
                // We scroll the playing track into view if its in the view
                if (ClassNameSingle('playingTrack')) {
                    ClassNameSingle('playingTrack').scrollIntoViewIfNeeded({ behaviour: 'smooth' })
                }

                // We now auto select playing target if current criteria
                // ... is the playing criteria
                if (cur == this.playingCriteria) {
                    this.changeTarget(this.playingTarget)
                } else {
                    // highlight first item in items (target) listing
                    if (this.currentOptions.length > 0 && cur != 'Music') {
                        this.changeTarget(this.currentOptions[0])
                    }
                }

                // Bring currently playing target into view
                // ... only if available
                if (ClassNameSingle('activeTarget')) {
                    ClassNameSingle('activeTarget').scrollIntoView()
                } 
            }
        },
        methods: {
            ...mapActions([
                'changeTarget',
                'renamePlaylist',
                'removePlaylist',
                'deleteArtist',
                'deleteAlbum',
                'deleteGenre',
                'setCurrentSetting'
            ]),

            isActiveItem(item) {
                if (this.settingsOpen) {
                    return this.settingsRoutes[item] == this.currentSetting
                } else {
                    return typeof this.currentTarget == 'object' ? this.currentTarget.name == item.name : this.currentTarget == item
                }
            },

            parseItem(item) {
                if (this.settingsOpen) {
                    return item
                } else {
                    return item == null || typeof item != 'object' ? item : item.name
                }
            },

            handle_item_click(item) {
                if (this.settingsOpen) {
                    let childRoute = this.settingsRoutes[item]
                    let fullRoute = '/settings' + childRoute

                    // Cache current route
                    this.$emit('cacheRoute', {type: 'child', name: fullRoute})

                    this.setCurrentSetting(childRoute)

                    // Force a route change to fake `<router-link>`
                    this.$router.push(fullRoute)
                } else {
                    this.changeTarget(item)
                }
            },

            cachePlaylistName(forcedEvent=false) {
                // We don't want the user to be able to change the name of enities
                // ... Changing 'All Tracks', etc
                if (this.currentCriteria == 'playlist') {
                    if (forcedEvent) {
                        // If it was triggered by contextmenu
                        forcedEvent.target.contentEditable = true
                        this.cachedText = forcedEvent.target.innerText

                        // We focus it here only since 'dblclick' would auto-focus
                        forcedEvent.target.focus()
                    } else {
                        event.target.contentEditable = true
                        this.cachedText = event.target.innerText
                    }

                    // Fake sellect all
                    document.execCommand('selectAll', false, null)

                    // Fake a Mutex type global lock on backspace
                    // ... and space 
                    this.$emit('lockHotKey', 'backspace')
                    this.$emit('lockHotKey', 'space')
                }
            },

            handlePlaylistRename() {
                // We only update the playlist name if the user actually
                // ... changed the name, and is not empty
                if (event.target.innerText.length > 0 && this.cachedText != event.target.innerText) {
                    this.renamePlaylist({
                        old: this.cachedText,
                        current: event.target.innerText
                    })
                } else {
                    // Revert playlist name if the playlist has totally been cleared
                    event.target.innerText = this.cachedText
                }

                // ... and clear cached Name for later
                this.cachedText = ''

                // Revert 'p' to an uneditable elm
                event.target.contentEditable = false

                // Fake a Mutex type global unlock on backspace
                this.$emit('unlockHotKey', 'backspace')

                // Unlock the enter hotkey to avoid reseting the 'currentTrack'
                this.$emit('unlockHotKey', 'enter')

                // Re-enable play/pause
                this.$emit('unlockHotKey', 'space')
            },

            clearEditable() {
                // In case the user blurs before hitting enter
                // ... We assume they changed their mind about renaming
                if (this.currentCriteria == 'playlist' && this.cachedText != '') {
                    event.target.innerText = this.cachedText
                    this.cachedText = ''
                }

                event.target.contentEditable = false
            },

            showItemOptions(item) {
                // Only show menu if the criteria is on 'playlist'
                if (this.currentCriteria == 'playlist') {
                    let vm = this
                    let forcedEvent = event

                    // We need the whole row highlighted not just the 'td'
                    this.hoveredElm = event.target
                    this.hoveredElm.id = 'hovered-text'

                    let contextmenu = remote.Menu.buildFromTemplate([
                        {
                            label: 'Rename',
                            click() {
                                vm.cachePlaylistName(forcedEvent)

                                // lock (enter) HotKey
                                vm.$emit('lockHotKey', 'enter')
                            }
                        },
                        {
                            type: 'separator'
                        },
                        {
                            label: 'Remove',
                            click() {
                                vm.removePlaylist(item.name)
                            }
                        }
                    ])

                    contextmenu.popup({callback: vm.unhighlight})
                } else {
                    if (this.currentCriteria != 'music') {
                        let vm = this

                        // We need the whole row highlighted not just the 'td'
                        this.hoveredElm = event.target
                        this.hoveredElm.id = 'hovered-text'

                        let contextmenu = remote.Menu.buildFromTemplate([
                            {
                                label: `Delete all ${item}`,
                                click() {
                                    if (vm.currentCriteria == 'artist') {
                                        vm.deleteArtist(item)
                                    }

                                    if (vm.currentCriteria == 'album') {
                                        vm.deleteAlbum(item)
                                    }

                                    if (vm.currentCriteria == 'genre') {
                                        vm.deleteGenre(item)
                                    }
                                }
                            }
                        ])

                        contextmenu.popup({callback: vm.unhighlight})
                    }
                }
            },

            unhighlight() {
                // Remove 'hover' class on current hovered track
                this.hoveredElm.id = ''
                this.hoveredElm = null
            },
        },
        computed: {
            ...mapGetters([
                'currentCriteria',
                'currentTarget',
                'currentSetting',
                'settingsOpen',
                'allArtists',
                'allAlbums',
                'allGenres',
                'allPlaylists'
            ]),

            playlist() {
                return this.allPlaylists
            },

            artist() {
                return this.allArtists
            },

            album() {
                return this.allAlbums
            },

            genre() {
                return this.allGenres
            },

            settingsRoutes() {
                return buildMap(this.settingsNames, this.settingsPaths)
            },

            listingOptions() {
                return this.currentCriteria == 'music' ? [
                    'All Tracks',
                    '80s Music',
                    '90s Music',
                    '2000s Music',
                    'Favourites'
                ] : this[this.currentCriteria]
            },

            currentOptions() {
                if (this.settingsOpen) {
                    return this.settingsNames
                } else {
                    return this.listingOptions
                }
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .vertical-div
        position absolute
        top 0
        left 0
        width 180px
        height 100%
        padding-left 60px
        padding-right 10px
        z-index -999
        .entity
            p
                margin 18px
                cursor pointer
                font-weight bold
                user-select none
                text-overflow ellipsis
                overflow hidden
                white-space nowrap
                width 135px

        .empty-listing
            padding-top 100px
            padding-left 18px
            user-select none

    .vertical-div-holder
        position absolute
        top 112px
        width 180px
        height 256px
        overflow-y auto
        div:first-child p
            margin-top 4px
        div:last-child p
            margin-bottom 4px

    .vertical-div-holder::-webkit-scrollbar
        width 2px
</style>

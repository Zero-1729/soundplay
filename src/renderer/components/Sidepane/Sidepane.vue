<template>
    <div class="virtical-div">
        <div class="virtical-div-holder">
            <div v-for="item in listingOptions" class="entity" @click="changeTarget(item)" :class="{activeTarget: typeof currentTarget == 'object' ? currentTarget.name == item.name : currentTarget == item, greyedText: item == playingTarget}">
                <p
                @contextmenu.prevent @mousedown.right.capture="showItemOptions(typeof item.name == 'object' ? item.name : item)"
                @dblclick="cachePlaylistName"
                @keydown.enter.prevent="handlePlaylistRename"
                @blur="clearEditable"
                contenteditable=false>
                    {{ typeof item == 'object' ? item.name : item }}
                </p>
            </div>
        </div>
        <div class="empty-listing" v-if="listingOptions.length == 0">
            <h4>
                No {{ currentCriteria }} found
            </h4>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    const { remote } = require('electron')

    const { ClassNameSingle } = require('./../../utils/htmlQuery')

    export default {
        name: 'sidepane',
        data() {
            return {
                hoveredElm: null,
                cachedText: ''
            }
        },
        mounted() {
            if (ClassNameSingle('activeTarget')) {
                ClassNameSingle('activeTarget').scrollIntoViewIfNeeded()
            }
        },
        methods: {
            ...mapActions([
                'changeTarget',
                'renamePlaylist',
                'removePlaylist',
                'deleteAll',
                'lockHotKeys',
                'unlockHotKeys'
            ]),
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

                    // Fake a Mutex type global lock on backspace
                    this.lockHotKeys('backspace')
                }
            },

            handlePlaylistRename() {
                if (event.target.innerText.length > 0) {
                    this.renamePlaylist({
                        old: this.cachedText,
                        current: event.target.innerText
                    })
                } else {
                    // Revert playlist name
                    // ... and clear cached Name for later
                    event.target.innerText = this.cachedText
                    this.cachedText = ''
                }

                // Revert 'p' to an uneditable elm
                event.target.contentEditable = false

                // Fake a Mutex type global unlock on backspace
                this.unlockHotKeys('backspace')

                // Lock the enter hotkeys to avoid reseting the 'currentTrack'
                this.lockHotKeys('enter')
            },

            clearEditable() {
                // In case the user blurs before hitting enter
                // ... We assume they changed their mind about renaming
                if (this.currentCriteria == 'playlist') {
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
                        if (item != "Unknown") {
                            let vm = this

                            // We need the whole row highlighted not just the 'td'
                            this.hoveredElm = event.target
                            this.hoveredElm.id = 'hovered-text'

                            let contextmenu = remote.Menu.buildFromTemplate([
                                {
                                    label: `Delete all ${item}`,
                                    click() {
                                        vm.deleteAll({
                                            category: vm.currentCriteria+'s',
                                            target: vm.currentCriteria,
                                            name: item
                                        })
                                    }
                                }
                            ])

                            contextmenu.popup({callback: vm.unhighlight})
                        }
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
                'playingTarget',
                'allArtists',
                'allAlbums',
                'allGenres',
                'allPlaylists'
            ]),
            listingOptions() {
                return this.currentCriteria == 'music' ? [
                    'All Tracks',
                    '80s Music',
                    '90s Music',
                    '2000s Music',
                    'Favourites'
                ] : eval('this.all'+this.currentCriteria[0].toUpperCase() + this.currentCriteria.slice(1)+'s')
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .virtical-div
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
                transition all 0.4s ease
                user-select none
            p:focus
                outline none

        .empty-listing
            padding-top 100px
            padding-left 18px
            user-select none

    .virtical-div-holder
        position absolute
        top 105px
        width 180px
        height 60%
        overflow-y auto

    .virtical-div-holder::-webkit-scrollbar
        width 2px
</style>

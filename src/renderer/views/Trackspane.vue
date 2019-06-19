<template>
    <table class="tracklist" v-hotkey="keymap" :class="{'fade-pane': appIsLoading}" @click="clearAllHovering">
            <thead>
                <tr>
                <th @click="sort('title')">
                    <p>Title</p>
                </th>
                <th @click="sort('artist')">
                    <p>Artist</p>
                </th>
                <th @click="sort('album')">
                    <p>Album</p>
                </th>
                <th @click="sort('genre')">
                    <p>Genre</p>
                </th>
            </tr>
            </thead>
            <div class="empty-pool-info" v-if="filteredPool.length == 0">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="578 291 86 86" width="86" height="86">
                    <path d=" M 578 334 C 578 310.268 597.268 291 621 291 C 644.732 291 664 310.268 664 334 C 664 357.732 644.732 377 621 377 C 597.268 377 578 357.732 578 334 Z  M 612.042 334 C 612.042 329.056 616.056 325.042 621 325.042 C 625.944 325.042 629.958 329.056 629.958 334 C 629.958 338.944 625.944 342.958 621 342.958 C 616.056 342.958 612.042 338.944 612.042 334 Z " fill-rule="evenodd" />
                </svg>
                <h4>{{ allTracks.length > 0 ? 'No Tracks found' : 'Drag and Drop sound files here to add sound' }}</h4>
            </div>

            <tbody>
                <transition-group :name="trackTransition" tag="tbody">
                <tr id="track-item" v-for="track in filteredPool" @dblclick="updateCurrentTrack(track)" :class="{activeTrack: filteredPool.indexOf(track) == index || selectedTracks.includes(track), playingTrack: isSameSource(track) && (!(filteredPool.indexOf(track) == index || selectedTracks.includes(track)))}"
                v-if="allTracks.length > 0"
                @contextmenu.prevent
                @mousedown.right.capture="showTrackOptions(track)"
                @keydown.40="mutateIndex(1)"
                @keydown.38="mutateIndex(-1)"
                @click="setIndex(track)"
                @keydown.enter.prevent="updateCurrentTrack(track)"
                :key="track.id">
                    <td>
                        <div class="fav-bar" :class="{fav: track.favourite}"></div>

                        <span class="short">{{ track.title }}</span>
                    </td>
                    <td>
                        <span class="short">{{ track.artist }}</span>
                    </td>
                    <td>
                        <span class="short">{{ track.album }}</span>
                    </td>
                    <td>
                        <span class="short">{{ track.genre }}</span>
                    </td>
                </tr>
            </transition-group>
            </tbody>

            <div class="playlist-modal" :class="{open: openPlaylistModal, closed: !openPlaylistModal}">
                <h4>New Playlist</h4>
                <input id="playlist-input" class="playlist-input" placeholder="Enter Playlist name..."  :class="{'playlist-input-focus': focused}" @keydown.enter="addNewPlaylist" @keydown.esc="closePlaylistModal"
                @focus="focused = true"
                @blur="focused = false"/>
            </div>
        </table>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    import { Id,
            QuerySelectorAll }       from './../utils/htmlQuery'

    const { buildMap,
            getIndexFromKey } = require('./../utils/object')
    const { generateMenu }    = require('./../utils/menuGenerator')

    const {
            remote,
            ipcRenderer }     = require('electron')

    export default {
        data() {
            return {
                directions: {'a-z': 'z-a', 'z-a': 'a-z'},
                index: -1,
                selectedTracks: [],
                focused: false,
                hoveredElm: null,
                pendingTrack: null,
                trackTransition: 'drop-in',
                playingCriteriaLock: false
            }
        },
        created() {
            // In cases of route changing
            this.filterPool()

            // We process the playlist creation App menu action here
            ipcRenderer.on('create-playlist', (event, arg) => {
                this.setPlaylistModal(true)
                this.lockHotKey('backspace')
            })
        },
        watch: {
            filteredPool (cur, old) {
                // I.e no tracks
                if (cur.length == 0) {
                    this.trackTransition = 'vanish'
                } else {
                    if (cur.length < old.length) {
                        // I.e sorting & track deletion
                        this.trackTransition = 'drop-in-right'
                    } else {
                        this.trackTransition = 'drop-in-left'
                    }
                }
            },

            openPlaylistModal (cur, old) {
                // We unhighlight the hoveredElm after the modal is closed
                if (!cur && this.hoveredElm != null) {
                    this.unhighlight()
                }
            },

            allPlaylists (cur, old) {
                // We need to determine whether the current playlist has been deleted
                // ... If it has then we need to purge the current pool
                if ((getIndexFromKey(cur, 'name', this.currentTarget.name) == -1) && !(getIndexFromKey(old, 'name', this.currentTarget.name) == -1)) {
                    // Artificially clear playlist
                    this.changeTarget({
                        name: this.currentTarget.name,
                        tracks: []
                    })

                    this.filterPool()
                }
            },

            currentTarget () {
                this.filterPool()

                // reset current highlighted track to nothing
                // ... each time the target is changed
                this.index = -1
            },

            allTracks () {
                // Each time we detect a change in the 'state.music'
                // ... we rehydrate the current render of tracks
                this.filterPool()
            },

            currentTrack () {
                // When Tracks are clicked, the currentCriteria becomes
                // ... the playing one
                if (!this.playingCriteriaLock) {
                    this.updatePlayingCriteria(this.currentCriteria)
                    this.updatePlayingTarget(this.currentTarget)
                }
            }
        },
        methods: {
            ...mapActions([
                'updateCurrentTrack',
                'clearCurrentTrack',
                'updatePool',
                'updatePlayingCriteria',
                'updatePlayingTarget',
                'toggleFavourite',
                'unfavouriteTrack',
                'changeTarget',
                'createPlaylist',
                'addTrack',
                'addTrackToPlaylist',
                'removeFromPlaylist',
                'deleteTrack',
                'deleteAllTracks',
                'deleteRelicTracks',
                'deletePlaylistTracks',
                'deleteArtist',
                'deleteAlbum',
                'deleteGenre',
                'setSortBy',
                'setCurrentDirec',
                'lockHotKey',
                'unlockHotKey',
                'setPlaylistModal',
                'setLoading',
                'clearStatusMessage',
                'clearErrorMessage',
                'clearWarnMessage',
                'clearFailMessage',
                'toggleAudioEQVisibility'
            ]),

            isSameSource(track) {
                if (this.currentTrack) {
                    return this.currentTrack.source == track.source
                } else {
                    return false
                }
            },

            addNewPlaylist() {
                //this.openModal = false
                this.setPlaylistModal(false)
                this.unlockHotKey('backspace')

                this.createPlaylist(event.target.value)

                if (this.selectedTracks.length > 0) {
                    for (var i = 0;i < this.selectedTracks.length;i++) {
                        this.addTrackToPlaylist({
                            playlist: event.target.value,
                            track: this.selectedTracks[i]
                        })
                    }
                } else {
                    // We need to keep track of the track
                    // ... that initiated the modal's opening
                    if (this.pendingTrack) {
                        this.addTrackToPlaylist({
                            playlist: event.target.value,
                            track: this.pendingTrack
                        })

                        // We subsequently release said track
                        // ... for later use
                        this.pendingTrack = null
                    }
                }

                // Clear the input
                event.target.value = ''
            },

            closePlaylistModal() {
                // Clear the input's value and close the modal
                Id('playlist-input').value = ''
                //this.openModal = false
                this.setPlaylistModal(false)

                // Since we are bluring the modal
                // ... we should unlock the hotkey
                this.unlockHotKey('backspace')
            },

            clearAllHovering() {
                // Clear all error messages when user engages the tracks
                // ... to avoid any annoying persisted error messages
                this.clearStatusMessage()
                this.clearErrorMessage()
                this.clearWarnMessage()
                this.clearFailMessage()

                if (this.appAudioEQ.visible) {
                    this.toggleAudioEQVisibility()
                }
            },

            sort(kind) {
                this.setSortBy(kind)

                if (this.sortBy == kind) {
                    this.setCurrentDirec(this.directions[this.currentDirec])
                } else {
                    this.setCurrentDirec('a-z')
                }
            },

            filterTracks() {
            	// Returns tracks that match a criteria under some target
            	// Eg: filterTrack('Genre', 'Rap', tracks) -> Returns all Rap tracks
            	return this.allTracks.filter((track) => {
            		return track[this.currentCriteria] == [this.currentTarget]
            	})
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

            filterPool() {
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

            showTrackOptions(track) {
                let vm = this

                // Give illuaion that track is still highlighted
                let targetElm = event.target.parentElement

                // We need the whole row highlighted not just the 'td'
                this.hoveredElm = targetElm.tagName != 'TR' ? targetElm.parentElement : targetElm

                this.hoveredElm.classList.add('hover')

                let fn = (playlist) => {
                    return function () {
                        if (vm.selectedTracks.length > 0) {
                            for (var i = 0;i < vm.selectedTracks.length;i++) {
                                vm.addTrackToPlaylist({
                                    playlist: playlist.name,
                                    track: vm.selectedTracks[i]
                                })
                            }
                        } else {
                            vm.addTrackToPlaylist({
                                playlist: playlist.name,
                                track: track
                            })
                        }

                        // We update the pool to reflect the change
                        vm.filterPool()
                    }
                }

                let contextmenu = remote.Menu.buildFromTemplate([
                    {
                        label: 'Toggle Favourite',
                        click() {
                            if (vm.index != -1) {
                                vm.toggleFavourite(track)

                                if (vm.currentTarget == 'Favourites') {
                                    vm.filterPool()
                                    vm.index = -1
                                }
                            }
                        }
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: vm.selectedTracks.length > 0 ? `Create Playlist with (${vm.selectedTracks.length}) tracks` : 'Create Playlist with track',
                        click() {
                            // get name from modal interaction
                            let name // Name to use for playlist

                            if (!(vm.selectedTracks.length > 0)) {
                                // Cache the calling track
                                // ... to include in the new playlist
                                vm.pendingTrack = track
                            }

                            // We then open the modal and
                            // ... lock the global hotkey
                            // ... to avoid random track deletions on backspacing
                            vm.setPlaylistModal(true)
                            vm.lockHotKey('backspace')
                        }
                    },
                    {
                        label: vm.selectedTracks.length > 0 ? `Add (${vm.selectedTracks.length}) Tracks to playlist...` : 'Add Track to playlist...',
                        submenu: generateMenu(this.allPlaylists, fn),
                        enabled: vm.allPlaylists.length > 0
                        // Update pool afterward
                    },
                    {
                        type: 'separator'
                    },
                    vm.currentCriteria == 'playlist' ? {
                        label: 'Remove Track',
                        click() {
                            vm.removeFromPlaylist({
                                playlist: vm.currentTarget.name,
                                track: track
                            })

                            vm.filterPool()
                        }
                    } :
                    {
                        label: vm.selectedTracks.length > 0 ? `Delete (${vm.selectedTracks.length}) Tracks` : 'Delete Track',
                        click() {
                            if (vm.currentTrack == track) {
                                // Dump current Track
                                vm.clearCurrentTrack()

                                // Pause Player here
                            }

                            if (vm.selectedTracks.length > 0) {
                                if (vm.selectedTracks.length == vm.filteredPool.length) {
                                    // If the user manually selected all tracks then we alias it to the 'deleteTracks' fn
                                    vm.deleteTracks()
                                } else {
                                    vm.deleteSelectedTracks()
                                }
                            } else {
                                if (this.isSameSource(track)) {
                                    // To avoid still darkening the criteria post deletion
                                    this.playingCriteriaLock = true
                                    this.updatePlayingCriteria(null)
                                }

                                vm.deleteTrack(track)
                            }
                        }
                    }
                ])

                // When contextmenu is closed we unhighlight the track
                contextmenu.popup({callback: vm.unhighlight})
            },

            unhighlight() {
                // We still prefer that the track to be included in the new
                // ... playlist be highlighted
                if (!this.openPlaylistModal) {
                    // Remove 'hover' class on current hovered track
                    this.hoveredElm.classList.remove('hover')
                    this.hoveredElm = null
                }
            },

            mutateIndexF(resetSelection=true) {
                this.mutateIndex(1, resetSelection)
            },

            mutateIndexB(resetSelection=true) {
                this.mutateIndex(-1, resetSelection)
            },

            mutateIndex(i, resetSelection) {
                if (resetSelection) {
                    // Reset selected tracks
                    this.selectedTracks = []
                }

                let index = this.index + i

                // We are dealing with the rendered pool not the one in the store
                // ... hence the use of 'filteredPool' and not 'currentPool'
                if (this.index == -1 && this.filteredPool.length > 0) {
                    this.index = 0
                } else {
                    if (index <= this.filteredPool.length - 1 && index >= 0) {
                        this.index = index
                    }
                }
            },

            setIndex(track) {
                if (event.ctrlKey) {
                    // When the user re-clicks a track whilst holding 'ctrl'
                    // ... it indicates a cancelation of its addition
                    if (this.selectedTracks.includes(track)) {
                        let index = this.selectedTracks.indexOf(track)

                        this.selectedTracks = this.selectedTracks.slice(0, index).concat(this.selectedTracks.slice(index + 1))
                    } else {
                        // To avoid adding duplicates to the list
                        if (!this.selectedTracks.includes(this.filteredPool[this.index])) {
                            this.selectedTracks.push(this.filteredPool[this.index])
                        }

                        this.selectedTracks.push(track)
                    }
                } else {
                    this.index = this.filteredPool.indexOf(track)
                    this.selectedTracks = []
                }
            },

            setCurrentTrack() {
                if (!(this.enterLock)) {
                    // Only trigger global (enter) hotkey action
                    // ... when the hotkey is unlocked

                    // Reset selectedTracks when track is changed
                    this.selectedTracks = []

                    if (this.filteredPool.length > 0) {
                        this.updateCurrentTrack(this.filteredPool[this.index])
                    }
                } else {
                    // Unlock it if locked
                    this.unlockHotKey('enter')
                }
            },

            selectTracksF() {
                // Add first highlighted track
                // To avoid duplicating previously added tracks
                if (!this.selectedTracks.includes(this.filteredPool[this.index])) {
                    this.selectedTracks.push(this.filteredPool[this.index])
                }

                // Move index
                this.mutateIndexF(false)

                // Add new selected Track
                this.selectedTracks.push(this.filteredPool[this.index])
            },

            selectTracksB() {
                // Add first highlighted track
                // To avoid duplicating previously added tracks
                if (!this.selectedTracks.includes(this.filteredPool[this.index]))
                {
                    this.selectedTracks.push(this.filteredPool[this.index])
                }

                // Move index
                this.mutateIndexB(false)

                // Add new selected Track
                this.selectedTracks.push(this.filteredPool[this.index])
            },

            selectAll() {
                this.selectedTracks = this.filteredPool.slice(0)
            },

            deleteTracks() {
                // Reset the current track if it is about to be deleted
                if (this.selectedTracks.includes(this.currentTrack)) {
                    this.playingCriteriaLock = true
                    this.clearCurrentTrack()
                    this.updatePlayingCriteria(null)

                    // Pause player
                }

                if (this.currentCriteria == 'playlist') {
                    this.deletePlaylistTracks(this.currentTarget)
                } else {
                    if (this.currentCriteria == 'music') {
                        if (this.currentTarget == 'All Tracks') {
                            this.deleteAllTracks()
                        }

                        if (this.currentTarget == 'Favourites') {
                            for (var i = 0;i < this.filteredPool.length;i++) {
                                this.unfavouriteTrack(this.filteredPool[i])
                            }
                        }

                        else {
                            // I.e '80s', '90s' and '2000s' tracks
                            this.deleteRelicTracks(
                                this.currentTarget[2] != 's' ?
                                '2000s' : this.currentTarget.slice(0, 3)
                            )
                        }

                        // UpdatePool and clear selected tracks to reflect change
                        this.selectedTracks = []
                        this.filterPool()
                    } else {
                        if (this.currentCriteria == 'artist') {
                            this.deleteArtist(this.currentTarget)
                        }

                        if (this.currentCriteria == 'album') {
                            this.deleteAlbum(this.currentTarget)
                        }

                        if (this.currentCriteria == 'genre') {
                            this.deleteGenre(this.currentTarget)
                        }
                    }
                }
            },

            deleteSelectedTracks() {
                if (this.selectedTracks.includes(this.currentTracks) && !this.backspaceLock) {
                    this.playingCriteriaLock = true
                    this.clearCurrentTrack()
                    this.updatePlayingCriteria(null)
                }

                // We want to only remove the track from the playlist
                // ... instead of deleting it entirely
                if (this.currentCriteria == 'playlist' && !this.backspaceLock) {
                    this.removeFromPlaylist({
                        playlist: this.currentTarget.name,
                        track: this.filteredPool[this.index]
                    })

                    this.filterPool()
                } else {
                    // Only trigger if 'search-input' is blurred
                    // We don't want the tracks disappearing randomly while typing
                    if (!this.backspaceLock) {
                        if (this.selectedTracks.length > 0) {
                            if (this.selectedTracks.length == this.filteredPool.length) {
                                this.deleteTracks()
                            } else {
                                // To avoid still darkening the criteria post deletion
                                if (this.selectedTracks.includes(this.currentTrack)) {
                                    this.playingCriteriaLock = true
                                    this.updatePlayingCriteria(null)
                                }

                                // Make this a bit quicker later if possible
                                for (var i = 0;i < this.selectedTracks.length;i++) {
                                    this.deleteTrack(this.selectedTracks[i])
                                }
                            }
                        } else {
                            if (this.currentTrack == this.filteredPool[this.index]) {
                                this.playingCriteriaLock = true
                                this.updatePlayingCriteria(null)
                            }
                            // This.currentTrack isn't set yet
                            // So we improvise and call out the current highlighted track
                            this.deleteTrack(this.filteredPool[this.index])
                            // Reset the previous index to the track above the deleted ones below
                            this.index = this.index - 1
                        }
                    }
                }
            },

            toggleFavouriteTrack() {
                if (this.index != -1) {
                    this.toggleFavourite(this.filteredPool[this.index])

                    // Lets update the pool if we are in the favourites listing
                    if (this.currentTarget == 'Favourites') {
                        this.filterPool()
                        this.index = -1
                    }
                }
            }
        },
        computed: {
            ...mapGetters([
                'allTracks',
                'allPlaylists',
                'playingCriteria',
                'currentCriteria',
                'currentTarget',
                'currentTrack',
                'filteredPool',
                'sortBy',
                'currentDirec',
                'backspaceLock',
                'enterLock',
                'openPlaylistModal',
                'allPlaylists',
                'appIsLoading',
                'appAudioEQ'
            ]),

            keymap() {
                return buildMap([
                    'down',
                    'up',
                    'enter',
                    'shift+up',
                    'shift+down',
                    'backspace',
                    'ctrl+alt+f',
                    'ctrl+a'
                ], [
                    this.mutateIndexF,
                    this.mutateIndexB,
                    this.setCurrentTrack,
                    this.selectTracksB,
                    this.selectTracksF,
                    this.deleteSelectedTracks,
                    this.toggleFavouriteTrack,
                    this.selectAll
                ])
            }
        }
    }
</script>

<style lang="stylus">
    table
        width calc(100vw - 250px)
        border-collapse collapse

    .tracklist
        position absolute
        top 96px
        left 250px
        width calc(100vw - 250px)

    tbody
        height calc(100vh - 120px)
        overflow-y auto
        overflow-x hidden
        display block

    tr#track-item
        width 100%
        display inline-flex

    tr th:first-child, tr td:first-child
        width 40%
        padding-left 10px

    tr th:nth-child(2)
        width 20%

    tr th:nth-child(3)
        width 24%

    tr th:last-child
        width 16%

    tr td:nth-child(2)
        width 20%
        padding-left 12px

    tr td:nth-child(3)
        width 25%
        padding-left 10px

    tr td:last-child
        width 15%
        padding-left 4px
        padding-right 12px

    thead
        display table
        width calc(100vw - 250px)

    th
        padding-bottom 20px
        font-weight bold
        p
            margin 0
            display inline-block
            cursor pointer

    td, th
        text-align left
        padding 0.2rem 0.1rem
        transition background 0.125s ease-in
        height 18px
        word-break break-all

    tbody tr:hover *
        cursor pointer

    .hover *
        cursor pointer

    td:first-child, th:first-child
        padding-left 10px

    td, th
        user-select none
        padding-left 1.6px

    td
        column-width 200px
        white-space nowrap
        text-overflow ellipsis
        overflow hidden
        position relative
        animation slide 0.2s ease-in

    .short
        display inline-block
        overflow hidden
        text-overflow ellipsis
        white-space nowrap
        width 100%

    .empty-pool-info
        position absolute
        display flex
        flex-flow column
        align-items center
        justify-content center
        width inherit
        height 80vh
        animation slide 0.2s ease-in
        h4
            text-align center
            user-select none
            -webkit-user-drag none

    .playlist-modal
        position absolute
        width 360px
        height 110px
        top 25vh
        left 22vw
        border-width 2px
        border-style solid
        border-radius 5px

    .playlist-modal *
        margin-left 30px

    .playlist-input
        width 280px
        padding 6px
        border-width 2px
        border-style solid
        border-radius 5px

    .playlist-input-focus
        border-width 2px
        border-style solid
        outline none

    .open
        animation slide 0.3s ease-in

    .closed
        display none

    .fav-bar
        position absolute
        height 20px
        width 2px
        left 0
        bottom 2.5px
        transition background 0.3s ease-out

    .drop-in-left-active, .drop-in-left-leave-to
        transition all 0.4s
        opacity 0
        transform translateX(-20px)

    .drop-in-left-enter-to
        opacity 1
        transform translateX(0)

    .drop-in-right-active, .drop-in-right-leave-to
        transition all 0.4s
        opacity 0
        transform translateX(20px)

    .drop-in-right-enter-to
        opacity 1
        transform translateX(0)

    .vanish-active, .vanish-leave-to
        transition 0.4s
        opacity 0
        transform translateY(-200px)/*scale(0)*/

    .vanish-enter-to
        opacity 1
        transform translateY(0) /*scale(1)*/

    @keyframes slide
        0%
            opacity 0.2
        100%
            opacity 1
</style>

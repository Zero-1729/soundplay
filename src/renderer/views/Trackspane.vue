<template>
    <table class="tracklist" v-hotkey="keymap" @click="clearAllHovering">
        <thead>
            <tr>
                <th @click="sort('title')">
                    <p :class="{'default-cursor': filteredPool.length == 0}">Title</p>
                </th>
                <th @click="sort('artist')">
                    <p :class="{'default-cursor': filteredPool.length == 0}">Artist</p>
                </th>
                <th @click="sort('album')">
                    <p :class="{'default-cursor': filteredPool.length == 0}">Album</p>
                </th>
                <th @click="sort('genre')">
                    <p :class="{'default-cursor': filteredPool.length == 0}">Genre</p>
                </th>
            </tr>
        </thead>
        <div class="empty-pool-info" v-if="filteredPool.length == 0">
            <h4>{{ allTracks.length > 0 ? 'No Tracks found' : 'Drag and Drop sound files here to add sound' }}</h4>
        </div>

        <tbody v-if="allTracks.length > 0">
            <transition-group :name="trackTransition" tag="tbody" class="trackslist">
            <tr id="track-item" v-for="track in filteredPool" @dblclick="mutateCurrentTrack(track)" :class="{activeTrack: filteredPool.indexOf(track) == index || selectedTracks.includes(track), playingTrack: isSameSource(track)}"
                @contextmenu.prevent
                @mousedown.right.capture="showTrackOptions(track)"
                @keydown.40="mutateIndex(1)"
                @keydown.38="mutateIndex(-1)"
                @click="setIndex(track)"
                @keydown.enter.prevent="mutateCurrentTrack(track)"
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

        <div id="playlist-modal" class="playlist-modal" :class="{open: openPlaylistModal, closed: !openPlaylistModal}">
            <h4 id="playlist-heading">New Playlist</h4>
            <input id="playlist-input" class="playlist-input" placeholder="Enter Playlist name..."  :class="{'playlist-input-focus': focused}" @keydown.enter="addNewPlaylist" @keydown.esc="closePlaylistModal"
                @focus="focusInPlaylist(true)"
                @blur="focusInPlaylist(false)"/>
        </div>
    </table>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    const { Id, ClassNameSingle }  = require('./../utils/htmlQuery')

    const { buildMap,
            getIndexFromKey } = require('./../utils/object')

    const { generateMenu }    = require('./../utils/menuGenerator')

    const {
            remote,
            ipcRenderer }     = require('electron')

    export default {
        props: [
            'player',
            'index',
            'focused',
            'openPlaylistModal',
            'inputLock',
            'playingCriteria',
            'currentTrack',
            'filteredPool'
        ],
        data() {
            return {
                directions: {'a-z': 'z-a', 'z-a': 'a-z'},
                selectedTracks: [],
                hoveredElm: null,
                pendingTrack: null,
                trackTransition: 'drop-in',
                playingCriteriaLock: false
            }
        },
        created() {
            // We process the playlist creation App menu action here
            ipcRenderer.on('create-playlist', (event, arg) => {
                this.$emit('setPlaylistModal', null)
                this.$emit('lockHotKey', 'input')
            })
        },
        mounted() {
            if (ClassNameSingle('playingTrack')) {
                ClassNameSingle('playingTrack').scrollIntoViewIfNeeded({ behaviour: 'smooth' })
            }
        },
        watch: {
            'player.active' (cur, prev) {
                // play/pause triggers first track in (current) pool
                // to be played, if app is newly launched
                if (!prev && this.index == -1) {
                    this.$emit('mutateIndex', 0)
                }
            },

            'currentTarget.tracks' (cur, old) {
                if (cur) {
                    // We assume an update
                    this.filterPool()
                }
            },

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
                this.$emit('mutateIndex', -1)

                // Clear selected tracks
                this.selectedTracks = []
            },

            currentTrack () {
                // When Tracks are clicked, the currentCriteria becomes
                // ... the playing one
                if (!this.playingCriteriaLock) {
                    this.$emit('mutatePlayingCriteria', this.currentCriteria)
                    this.$emit('mutatePlayingTarget', this.currentTarget)
                }
            }
        },
        methods: {
            ...mapActions([
                'changeTarget',
                'toggleFavourite',
                'unfavouriteTrack',
                'createPlaylist',
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
                'setCurrentDirec'
            ]),

            triggerRemove (arg) {
                // Reset selected tracks first
                // ... and the index
                this.$emit('mutateIndex', this.index)
                this.selectedTracks = []

                this.removeFromPlaylist(arg)
            },

            triggerDeleteTrack (arg) {
                if (!this.inputLock){
                    // Remove from `randoms` if in shuffle mode
                    if (this.appAudioPrefs.shuffle) {
                        this.player.freeRandTrack(getIndexFromKey(this.filteredPool, 'id', arg.id))
                    }

                    // Then actually delete the track
                    this.deleteTrack(arg)
                }
            },

            mutateCurrentTrack(track) {
                if (!this.inputLock) {
                    this.$emit('mutateCurrentTrack', track)
                }
            },

            isSameSource(track) {
                if (this.currentTrack) {
                    return this.currentTrack.source == track.source
                } else {
                    return false
                }
            },

            focusInPlaylist(val) {
                this.$emit('setPlaylistFocus', val)
            },

            addNewPlaylist() {
                this.$emit('setPlaylistModal', false)

                // Only if playlist named
                if (event.target.value.length > 0) {
                    this.createPlaylist(event.target.value)

                    if (this.selectedTracks.length > 0) {
                        for (var i = 0;i < this.selectedTracks.length;i++) {
                            this.addTrackToPlaylist({
                                playlist: event.target.value,
                                trackId: this.selectedTracks[i].id
                            })
                        }

                        // Mutate index to give completion effect
                        this.$emit('mutateIndex', this.index)
                        this.selectedTracks = []
                    } else {
                        // We need to keep track of the track
                        // ... that initiated the modal's opening
                        if (this.pendingTrack) {
                            this.addTrackToPlaylist({
                                playlist: event.target.value,
                                trackId: this.pendingTrack.id
                            })

                            // We subsequently release said track
                            // ... for later use
                            this.pendingTrack = null
                        }
                    }

                    // Clear the input
                    event.target.value = ''
                }
            },

            closePlaylistModal() {
                // Clear the input's value and close the modal
                Id('playlist-input').value = ''
                this.$emit('setPlaylistModal', false)

                // Since we are bluring the modal
                // ... we should unlock the hotkey
                this.$emit('unlockHotKey', 'input')
            },

            clearAllHovering() {
                // Clear all error messages when user engages the tracks
                // ... to avoid any annoying persisted error messages
                this.$emit('clearStatusMessage')
                this.$emit('clearErrorMessage')
                this.$emit('clearWarnMessage')
                this.$emit('clearFailMessage')
            },

            sort(kind) {
                this.setSortBy(kind)

                if (this.sortBy == kind) {
                    this.setCurrentDirec(this.directions[this.currentDirec])
                } else {
                    this.setCurrentDirec('a-z')
                }
            },

            filterPool() {
                this.$emit('filterPool')
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
                                    trackId: vm.selectedTracks[i].id
                                })
                            }
                        } else {
                            vm.addTrackToPlaylist({
                                playlist: playlist.name,
                                trackId: track.id
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
                                    this.$emit('mutateIndex', -1)
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
                            vm.$emit('setPlaylistModal', true)
                            vm.$emit('lockHotKey', 'input')
                        }
                    },
                    {
                        label: vm.selectedTracks.length > 0 ? `Add (${vm.selectedTracks.length}) Tracks to playlist...` : 'Add Track to playlist...',
                        submenu: generateMenu(this.allPlaylists, fn, vm.currentTarget.name),
                        enabled: vm.allPlaylists.length > 0
                        // Update pool afterward
                    },
                    {
                        type: 'separator'
                    },
                    vm.currentCriteria == 'playlist' ? {
                        label: 'Remove Track',
                        click() {
                            vm.triggerRemove({playlist: vm.currentTarget.name, trackId: track.id})

                            vm.filterPool()
                        }
                    } :
                    {
                        label: vm.selectedTracks.length > 0 ? `Delete (${vm.selectedTracks.length}) Tracks` : 'Delete Track',
                        click() {
                            if (vm.currentTrack == track) {
                                // Dump current Track
                                vm.$emit('clearCurrentTrack')

                                // Pause Player here
                                this.player.clear()
                            }

                            if (vm.selectedTracks.length > 0) {
                                if (vm.selectedTracks.length == vm.filteredPool.length) {
                                    // If the user manually selected all tracks then we alias it to the 'deleteTracks' fn
                                    vm.deleteTracks()
                                } else {
                                    vm.deleteSelectedTracks()
                                }
                            } else {
                                if (vm.isSameSource(track)) {
                                    // To avoid still darkening the criteria post deletion
                                    vm.playingCriteriaLock = true
                                    vm.$emit('updatePlayingCriteria', null)
                                }

                                vm.triggerDeleteTrack(track)
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
                // Only move arrow if outside input field
                if (!this.inputLock) {
                    this.mutateIndex(1, resetSelection)
                }
            },

            mutateIndexB(resetSelection=true) {
                if (!this.inputLock) {
                    this.mutateIndex(-1, resetSelection)
                }
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
                    this.$emit('mutateIndex', 0)
                } else {
                    if (index <= this.filteredPool.length - 1 && index >= 0) {
                        this.$emit('mutateIndex', index)
                    }
                }
            },

            setIndex(track) {
                /* (Meta like on MacOS):-

                    Batch addition, from index of initial item to index of
                    current item

                    Meta:-

                    single select addition, only adds the current clicked track
                    to the `selected` Array

                    Or

                    Cancels inclusion, if already present

                */
                if (event.shiftKey) {
                    // `this.index` is the original placement of the bar: the first track clicked before shift
                    // Then the new track clicked is 'lim'

                    // Log start and lim
                    let lim = getIndexFromKey(this.filteredPool, 'id', track.id)
                    let start = this.index 

                    // Edit lim and start if the order is reversed
                    // ... Bottom-to-Top selection
                    if (start > lim) {
                        start = lim
                        lim = this.index
                    } else {
                        // Top-to-Bottom selection
                        // We need to offset the limit by one to include the last track clicked
                        lim = lim + 1 <= this.filteredPool.length ? lim + 1 : lim
                    }

                    // Flush selection
                    this.selectedTracks = []

                    // Then add one-by-one
                    for (let i = start;i < lim;i++) {
                        this.selectedTracks.push(this.filteredPool[i])
                    }
                } else if (event.metaKey) {
                    // When the user re-clicks a track whilst holding 'meta'
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
                    this.$emit('mutateIndex', this.filteredPool.indexOf(track))
                    this.selectedTracks = []
                }
            },

            setCurrentTrack() {
                if (!(this.inputLock) && (this.index != -1)) {
                    // Only trigger global (enter) hotkey action
                    // ... when the hotkey is unlocked

                    // Reset selectedTracks when track is changed
                    this.selectedTracks = []

                    if (this.filteredPool.length > 0) {
                        this.mutateCurrentTrack(this.filteredPool[this.index])
                    }
                } else {
                    // Unlock it if locked
                    this.$emit('unlockHotKey', 'input')
                }
            },

            selectTracksF() {
                // Lets see that the current track is added
                if (!this.selectedTracks.includes(this.filteredPool[this.index]))
                {
                    // Add first highlighted track
                    // ... but only if it is not already included
                    this.selectedTracks.push(this.filteredPool[this.index])
                }


                // Check if a next track exists
                // HACK: guessing it was an off-by-one
                if (this.index + 1 < this.filteredPool.length) {
                    // Add the next Track
                    this.selectedTracks.push(this.filteredPool[this.index+1])
                }

                // Move index
                this.mutateIndexF(false)
            },

            selectTracksB() {
                // Lets see that the current track is added
                if (!this.selectedTracks.includes(this.filteredPool[this.index]))
                {
                    // Add first highlighted track
                    // ... but only if it is not already included
                    this.selectedTracks.push(this.filteredPool[this.index])
                }

                // Check if a previous track exists
                if (this.index - 1 >= 0) {
                    // Add the previous Track
                    this.selectedTracks.push(this.filteredPool[this.index-1])
                }

                // Move index
                this.mutateIndexB(false)
            },

            selectAll() {
                this.selectedTracks = this.filteredPool.slice(0)
            },

            deleteTracks() {
                // Reset the current track if it is about to be deleted
                if (this.selectedTracks.includes(this.currentTrack)) {
                    this.playingCriteriaLock = true
                    this.$emit('clearCurrentTrack')
                    this.$emit('mutatePlayingCriteria', null)

                    // Pause player
                    this.player.clear()
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
                // Only trigger if '(search) input' is blurred
                // We don't want the tracks disappearing randomly while typing
                if ((this.index != -1) && !this.inputLock) {
                    // Delete current track if seleted
                    if (this.isSameSource(this.filteredPool[this.index])) {
                        this.$emit('clearCurrentTrack')
                        this.player.clear()
                        this.$emit('mutatePlayingCriteria', null)
                    }

                    // We want to only remove the track from the playlist
                    // ... instead of deleting it entirely
                    if (this.currentCriteria == 'playlist') {
                        if (this.selectedTracks.length > 0) {
                            for (var i = 0;i < this.selectedTracks.length;i++) {
                                this.triggerRemove({playlist: this.currentTarget.name, trackId: this.filteredPool[i].id})
                            }
                        } else {
                            // remove a single track
                            this.triggerRemove({playlist: this.currentTarget.name, trackId: this.filteredPool[this.index].id})
                        }
                    } else {
                        if (this.selectedTracks.length > 0) {
                            // Check if all the tracks selected; should only be possible in my music
                            if (this.selectedTracks.length == this.allTracks.length) {
                                // All tracks highlighted to be deleted asap
                                this.deleteTracks()
                            } else {
                                // To avoid still darkening the criteria post deletion
                                if (this.selectedTracks.includes(this.currentTrack)) {
                                    this.playingCriteriaLock = true
                                    this.$emit('mutatePlayingCriteria', null)
                                }

                                // Make this a bit quicker later if possible
                                for (var i = 0;i < this.selectedTracks.length;i++) {
                                    this.triggerDeleteTrack(this.selectedTracks[i])
                                }
                            }
                        } else {
                            if (this.currentTrack == this.filteredPool[this.index]) {
                                this.playingCriteriaLock = true
                                this.$emit('mutatePlayingCriteria', null)
                            }
                            // This.currentTrack isn't set yet
                            // So we improvise and call out the current highlighted track
                            this.triggerDeleteTrack(this.filteredPool[this.index])
                            // Reset the previous index to the track above the deleted ones below
                            this.$emit('mutateIndex', this.index - 1)
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
                        this.$emit('mutateIndex', -1)
                    }
                }
            }
        },
        computed: {
            ...mapGetters([
                'allTracks',
                'allPlaylists',
                'currentTarget',
                'currentCriteria',
                'sortBy',
                'currentDirec',
                'appAudioPrefs'
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
        top 110px
        left 250px
        width calc(100vw - 250px)

    tbody
        height calc(100vh - 135px)
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
        transition background 0.025s ease-in
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
        display flex
        align-items center
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
        height 75vh
        animation slide 0.2s ease-in
        h4
            margin-top 0
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
        border-top 0
        border-left 0
        border-right 0
        border-style solid
        user-select none
        transition border 0.3s ease
        h4
            margin-top 22px

    .playlist-input-focus
        outline none

    .closed
        opacity 0
        z-index -999999

    .fav-bar
        position absolute
        height 25px
        width 2px
        left 0
        bottom 0
        transition background 0.3s ease-out

    .default-cursor
        cursor default

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
        transform translateY(-200px)

    .vanish-enter-to
        opacity 1
        transform translateY(0)
</style>

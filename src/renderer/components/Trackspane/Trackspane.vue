<template>
    <table class="tracklist" v-hotkey="keymap">
            <thead>
                <tr>
                <th @click="sort('title')">
                    Title
                </th>
                <th @click="sort('artist')">
                    Artist
                </th>
                <th @click="sort('album')">
                    Album
                </th>
                <th @click="sort('genre')">
                    Genre
                </th>
            </tr>
            </thead>
            <div class="empty-pool-info" v-if="filteredPool.length == 0">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="578 291 86 86" width="86" height="86"><path d=" M 578 334 C 578 310.268 597.268 291 621 291 C 644.732 291 664 310.268 664 334 C 664 357.732 644.732 377 621 377 C 597.268 377 578 357.732 578 334 Z  M 612.042 334 C 612.042 329.056 616.056 325.042 621 325.042 C 625.944 325.042 629.958 329.056 629.958 334 C 629.958 338.944 625.944 342.958 621 342.958 C 616.056 342.958 612.042 338.944 612.042 334 Z " fill-rule="evenodd" fill="rgb(222,222,222)"/></svg>
                <h4>{{ allTracks.length > 0 ? 'No Tracks found' : 'Drag and Drop sound files here to add sound' }}</h4>
            </div>

            <tbody>
            <tr v-for="track in filteredPool" @dblclick="updateCurrentTrack(track)" :class="{activeTrack: filteredPool.indexOf(track) == index || selectedTracks.includes(track), playingTrack: currentTrack == track && filteredPool.indexOf(track) != index && !(filteredPool.indexOf(track) == index || selectedTracks.includes(track))}" v-if="allTracks.length > 0" @contextmenu.prevent @mousedown.right.capture="showTrackOptions(track)"
            @keydown.40="mutateIndex(1)"
            @keydown.38="mutateIndex(-1)"
            @click="setIndex(track)"
            @keydown.enter.prevent="updateCurrentTrack(track)">
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
            </tbody>

            <div class="playlist-modal" :class="{open: openModal, closed: !openModal}">
                <h4>New Playlist</h4>
                <input id="playlist-modal" placeholder="Enter Playlist name..."/>
            </div>
        </table>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    import { Id } from './../../utils/htmlQuery'

    const { buildMap } = require('./../../utils/object')
    const { generateMenu } = require('./../../utils/menuGenerator')

    const { remote } = require('electron')

    export default {
        data() {
            return {
                directions: {'a-z': 'z-a', 'z-a': 'a-z'},
                index: -1,
                selectedTracks: [],
                openModal: false,
                hoveredElm: null
            }
        },
        mounted() {
            // Without this we can't index the tracks properly for
            // ... the state mutations like 'toggleFavourite'
            if (this.allTracks.length > 0) {
                this.filterPool()
            }
        },
        watch: {
            currentTarget: function () {
                this.filterPool()

                // reset current highlighted track to nothing
                // ... each time the target is changed
                this.index = -1
            },
            allTracks: function () {
                // Each time we detect a change in the 'state.music'
                // ... we rehydrate the current render of tracks
                this.filterPool()
            },
            currentTrack: function () {
                // When Tracks are clicked, the currentCriteria becomes
                // ... the playing one
                this.updatePlayingCriteria(this.currentCriteria)
                this.updatePlayingTarget(this.currentTarget)
            }
        },
        methods: {
            ...mapActions([
                'updateCurrentTrack',
                'updatePool',
                'updatePlayingCriteria',
                'updatePlayingTarget',
                'toggleFavourite',
                'addPlaylist',
                'addTrack',
                'addTrackToPlaylist',
                'removeFromPlaylist',
                'deleteTrack',
                'setSortBy',
                'setCurrentDirec'
            ]),

            sort(kind) {
                this.setSortBy(kind)

                if (this.sortBy == kind) {
                    this.setCurrentDirec(this.directions[this.currentDirec])
                } else {
                    this.setCurrentDirec('a-z')
                }
            },
            filterTracks () {
            	// Returns tracks that match a criteria under some target
            	// Eg: filterTrack('Genre', 'Rap', tracks) -> Returns all Rap tracks
            	return this.allTracks.filter((track) => {
            		return track[this.currentCriteria] == [this.currentTarget]
            	})
            },

            getOldTracks (year, y_two_k=false) {
                if (y_two_k) {
                    return this.allTracks.filter((track) => {
                        return String(track.year).slice(0, 1) == 2 && String(track.year).slice(2, 4) <= 10
                    })
                }

                return this.allTracks.filter((track) => {
                    return String(track.year).slice(2) == year
                })
            },

            getFromPlaylist (currentPlaylist) {
                return currentPlaylist.tracks
            },

            getFavs () {
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

                let fn = (playlistName) => {
                    return function () {
                        vm.addTrackToPlaylist({
                            playlist: playlistName,
                            track: track
                        })

                        vm.filterPool()
                    }
                }

                let contextmenu = remote.Menu.buildFromTemplate([
                    {
                        label: 'Toggle Favourite',
                        click() {
                            vm.toggleFavourite(track)

                            if (vm.currentTarget == 'Favourites') {
                                vm.filterPool()
                                vm.index = -1
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
                            let tracks = [] // tracks to be added to the playlist

                            if (vm.selectedTracks.length > 0) {
                                // Code for multi track addition
                                this.tracks = vm.selectedTracks
                            } else {
                                // Code for single track addition
                                this.tracks.push(track)
                            }

                            // Call code for adding playlists
                        }
                    },
                    {
                        label: vm.selectedTracks.length > 0 ? `Add (${vm.selectedTracks.length}) Tracks to playlist...` : 'Add Track to playlist...',
                        submenu: generateMenu(this.allPlaylists, fn),
                        enabled: !vm.allPlaylists
                        // Update pool afterward
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: vm.selectedTracks.length > 0 ? `Delete (${vm.selectedTracks.length}) Tracks` : 'Delete Track',
                        click() {
                            if (vm.playingTrack == track) {
                                // Dump current Track
                                vm.updateCurrentTrack(null)

                                // Pause Player here
                            }

                            if (vm.selectedTracks.length > 0) {
                                vm.deleteTracks()
                            } else {
                                vm.deleteTrack(track)
                            }
                        }
                    }
                ])

                // When contextmenu is closed we unhighlight the track
                contextmenu.popup({callback: vm.unhighlight})
            },

            unhighlight() {
                // Remove 'hover' class on current hovered track
                this.hoveredElm.classList.remove('hover')
                this.hoveredElm = null
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

                if (this.index == -1 && this.currentPool.length > 0) {
                    this.index = 0
                } else {
                    if (index <= this.currentPool.length - 1 && index >= 0) {
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
                        if (!this.selectedTracks.includes(this.currentPool[this.index])) {
                            this.selectedTracks.push(this.currentPool[this.index])
                        }

                        this.selectedTracks.push(track)
                    }
                } else {
                    this.index = this.currentPool.indexOf(track)
                    this.selectedTracks = []
                }
            },

            setCurrentTrack() {
                // Reset selectedTracks when track is changed
                this.selectedTracks = []

                this.updateCurrentTrack(this.currentPool[this.index])
            },

            selectTracksF() {
                // Add first highlighted track
                // To avoid duplicating previously added tracks
                if (!this.selectedTracks.includes(this.currentPool[this.index])) {
                    this.selectedTracks.push(this.currentPool[this.index])
                }

                // Move index
                this.mutateIndexF(false)

                // Add new selected Track
                this.selectedTracks.push(this.currentPool[this.index])
            },

            selectTracksB() {
                // Add first highlighted track
                // To avoid duplicating previously added tracks
                if (!this.selectedTracks.includes(this.currentPool[this.index]))
                {
                    this.selectedTracks.push(this.currentPool[this.index])
                }

                // Move index
                this.mutateIndexB(false)

                // Add new selected Track
                this.selectedTracks.push(this.currentPool[this.index])
            },

            deleteTracks() {
                // Return index to track above removed ones
                for (var i = 0;i < this.selectedTracks.length;i++) {
                    this.deleteTrack(this.selectedTracks[i])
                }

                // lets reset the index for now
                this.index = -1

                this.selectedTracks = []

                // So the pool is appropriately updated
                this.filterPool()
            },

            deleteAllTracks() {
                // Only trigger if 'search-input' is blurred
                // We don't want the tracks disappearing randomly while typing
                if (!(Id('search-input') == document.activeElement)) {
                    if (this.selectedTracks.length > 0) {
                        this.deleteTracks()
                    } else {
                        // This.currentTrack isn't set yet
                        // So we improvise and call out the current highlighted track
                        this.deleteTrack(this.currentPool[this.index])
                        // Reset the previous index to the track above the deleted ones below
                        this.index = this.index - 1
                    }
                }
            },

            toggleFavouriteTrack() {
                this.toggleFavourite(this.currentPool[this.index])

                // Lets update the pool if we are in the favourites listing
                if (this.currentTarget == 'Favourites') {
                    this.filterPool()
                    this.index = -1
                }
            }
        },
        computed: {
            ...mapGetters([
                'allTracks',
                'allPlaylists',
                'currentCriteria',
                'currentTarget',
                'currentTrack',
                'currentPool',
                'filteredPool',
                'sortBy',
                'currentDirec'
            ]),
            keymap() {
                return buildMap([
                    'down',
                    'up',
                    'enter',
                    'shift+up',
                    'shift+down',
                    'backspace',
                    'ctrl+alt+f'
                ], [
                    this.mutateIndexF,
                    this.mutateIndexB,
                    this.setCurrentTrack,
                    this.selectTracksB,
                    this.selectTracksF,
                    this.deleteAllTracks,
                    this.toggleFavouriteTrack
                ])
            }
        },
        beforeDestroy() {
            this.updatePlayingCriteria(null)
            this.updatePlayingTarget(null)
        }
    }
</script>

<style lang="stylus">
    table
        width calc(100vw - 250px)
        border-collapse collapse

    .tracklist
        position absolute
        top 90px
        left 250px
        width calc(100vw - 250px)

    tbody
        height calc(100vh - 120px)
        overflow-y auto
        overflow-x hidden
        display block

    tr th:first-child
        width 40%

    tr th:nth-child(2)
        width 20%

    tr th:nth-child(3)
        width 25%

    tr th:last-child
        width 15%

    tr td:first-child
        width 40%

    tr td:nth-child(2)
        width 20%

    tr td:nth-child(3)
        width 25%

    tr td:last-child
        width 15%

    thead
        display table
        width calc(100vw - 250px)

    tr
        td:last-child
            padding-right 12px

    th
        background #f2f2f2
        padding-bottom 20px
        cursor pointer
        color grey
        font-weight bold

    td, th
        text-align left
        padding 0.2rem 0.1rem
        transition background 0.2s ease-in
        color #a0a0a0
        height 18px
        word-break break-all

    tbody tr:hover, tbody tr:hover div
        background rgba(30, 144, 255, 0.51)

    tbody tr:hover *
        color white !important
        cursor pointer

    tbody tr:hover span
            background transaparent !important

    .hover, .hover div
            background rgba(30, 144, 255, 0.51) !important

    .hover span
            background transparent

    .hover *
        cursor pointer
        color white !important

    tr:nth-child(odd)
        background rgb(247, 247, 247)

    td, th
        user-select none
        padding-left 10px

    td:first-child, th:first-child
        padding-left 10px

    td, th
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
        background transparent
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
            color grey
            text-align center
            user-select none
            -webkit-user-drag none

    .open
        animation slide 0.3s ease-in

    .closed
        display none

    .fav-bar
        position absolute
        background transparent
        height 20px
        width 2px
        left 0
        bottom 2.5px
        transition background 0.3s ease-out

    .fav
        background deeppink

    .activeTrack
        background dodgerblue !important
        td
            color white

    .playingTrack
        background #d8d8d8 !important
        td
            color grey

    @keyframes slide
        0%
            opacity 0.2
        100%
            opacity 1
</style>

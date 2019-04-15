// Some helper functions

const {
        removeObject,
        getIndexFromKey } = require('./../../utils/object')

const {
        add,
        remove,
        related }         = require('./../../utils/list')

const state = {
    music: [],
    albums: [],
    artists: [],
    genres: [],
    playlists: [],
    reporter: {
        // For environment variables
        error: {
            heading: null,
            message: null,
            items: null,
            isEmpty: true
        },
        warning: {
            heading: null,
            message: null,
            items: null,
            isEmpty: true
        },
        failure: {
            heading: null,
            message: null,
            items: null,
            isEmpty: true
        }
    },
    vars: {
        lock: {
            'backspace': false,
            'enter': false
        }
    }
}

const mutations = {
    ADD_TRACK(state, meta) {
        let track = {
            title: meta.title,
            artist: meta.artist,
            album: meta.album,
            genre: meta.genre,
            source: meta.source,
            favourite: false,
            playlists: [],
            plays: 0,
            peaks: null,
            duration: null
        }

        track.artist == 'Unknown' ? state.artists = add(state.artists, 'Unknown', true) : state.artists = add(state.artists, track.artist, true)
        track.album == 'Unknown' ? state.albums = add(state.albums, 'Unknown', true) : state.albums = add(state.albums, track.album, true)
        track.genre == 'Unknown' ? state.genres = add(state.genres, track.genre, true) : state.genres = add(state.genres, track.genre, true)

        // Only add the track if its not a duplicate
        let result = add(state.music, track)

        if (result != state.music) {
            state.music = result

            if (meta.activePlaylist) {
                let pindex = getIndexFromKey(state.playlists, meta.activePlaylist.name, 'name')
                // If we are in a playlist and add a track we also include it in the playlist
                state.playlists[pindex].tracks.push(track)
            }
        }
    },

    DELETE_TRACK (state, track) {
        let index

        for (var i = 0;i < state.music.length;i++) {
            if (state.music[i].source == track.source) {
                index = i
            }
        }

        state.music = state.music.slice(0, index).concat(state.music.slice(index + 1))

        // Remove all traces of the 'album', 'artist', 'genre' if all related tracks are deleted
        if (!related(state.music, 'artist', track.artist)) {
            state.artists = remove(state.artists, track.artist)
        }

        if (!related(state.music, 'album', track.album)) {
            state.albums = remove(state.albums, track.album)
        }

        if (!related(state.music, 'genre', track.genre)) {
            state.genres = remove(state.genres, track.genre)
        }
    },

    DELETE_ALL_TRACKS (state) {
        if (state.music.length > 0) {
            state.music = []
            state.albums = []
            state.genres = []
            state.artists = []

            for (var i = 0;i < state.playlists;i++) {
                state.playlists[i] = []
            }
        }
    },

    TOGGLE_FAVOURITE_TRACK (state, track) {
        let index = state.music.indexOf(track)

        if (state.music[index].favourite) {
            state.music[index].favourite = false
        } else {
            state.music[index].favourite = true
        }
    },

    CREATE_PLAYLIST (state, name) {
        state.playlists.push({
            name: name,
            tracks: []
        })
    },

    RENAME_PLAYLIST (state, obj) {
        let index = getIndexFromKey(state.playlists, obj.old, 'name')
        let tracks = state.playlists[index].tracks

        // Rename it from the core
        state.playlists[index].name = obj.current

        // Update each related tracks playlist name
        for (var i = 0;i < state.music;i++) {
            if (state.music[i].playlists.includes(obj.old)) {
                state.music[i].playlists = replaceItem(state.music[i].playlists, obj.old, obj.current)
            }
        }
    },

    REMOVE_PLAYLIST (state, name) {
        state.playlists = removeObject(state.playlists, name, 'name')
    },

    ADD_TRACK_TO_PLAYLIST (state, obj) {
        let index = getIndexFromKey(state.playlists, obj.playlist, 'name')
        state.playlists[index].tracks = add(state.playlists[index].tracks, obj.track)
    },

    REMOVE_FROM_PLAYLIST (state, obj) {
        let index = getIndexFromKey(state.playlists, obj.playlist, 'name')
        state.playlists[index].tracks = removeObject(state.playlists[index].tracks, obj.track.source, 'source')
    },

    UPDATE_ERROR_MESSAGE (state, meta) {
        state.reporter.error.heading = meta.heading
        state.reporter.error.message = meta.message
        state.reporter.error.items   = meta.items

        state.reporter.error.isEmpty = false
    },

    UPDATE_WARN_MESSAGE (state, meta) {
        state.reporter.warning.heading = meta.heading
        state.reporter.warning.message = meta.message
        state.reporter.warning.items   = meta.items

        state.reporter.warning.isEmpty = false
    },

    UPDATE_FAILURE_MESSAGE (state, meta) {
        state.reporter.failure.heading = meta.heading
        state.reporter.failure.message = meta.message
        state.reporter.failure.items   = meta.items

        state.reporter.failure.isEmpty = false
    },

    CLEAR_ERROR_MESSAGE (state) {
        state.reporter.error.heading = null
        state.reporter.error.message = null
        state.reporter.error.items   = null

        state.reporter.error.isEmpty = true
    },

    CLEAR_WARN_MESSAGE (state) {
        state.reporter.warning.heading = null
        state.reporter.warning.message = null
        state.reporter.warning.items   = null

        state.reporter.warning.isEmpty = true
    },

    CLEAR_FAILURE_MESSAGE (state) {
        state.reporter.failure.heading = null
        state.reporter.failure.message = null
        state.reporter.failure.items   = null

        state.reporter.failure.isEmpty = true
    },

    LOCK_HOTKEY (state, hotkey) {
        // So we can override the global hotkeys
        state.vars.lock[hotkey] = true
    },

    UNLOCK_HOTKEY (state, hotkey) {
        state.vars.lock[hotkey] = false
    }
}

const actions = {
    addTrack: ({ commit }, info) => {
        commit('ADD_TRACK', info)
    },

    deleteTrack: ({ commit }, track) => {
        commit('DELETE_TRACK', track)
    },

    deleteAllTracks: ({ commit }) => {
        commit('DELETE_ALL_TRACKS')
    },

    toggleFavourite: ({ commit }, track) => {
        commit('TOGGLE_FAVOURITE_TRACK', track)
    },

    createPlaylist: ({ commit }, name) => {
        commit('CREATE_PLAYLIST', name)
    },

    renamePlaylist: ({ commit }, obj) => {
        commit('RENAME_PLAYLIST', obj)
    },

    removePlaylist: ({ commit }, name) => {
        commit('REMOVE_PLAYLIST', name)
    },

    addTrackToPlaylist: ({ commit }, obj) => {
        commit('ADD_TRACK_TO_PLAYLIST', obj)
    },

    removeFromPlaylist: ({ commit }, obj) => {
        commit('REMOVE_FROM_PLAYLIST', obj)
    },

    updateErrorMessage: ({ commit }, meta) => {
        commit('UPDATE_ERROR_MESSAGE', meta)
    },

    updateWarnMessage: ({ commit }, meta) => {
        commit('UPDATE_WARN_MESSAGE', meta)
    },

    updateFailMessage: ({ commit }, meta) => {
        commit('UPDATE_FAILURE_MESSAGE', meta)
    },

    clearErrorMessage: ({ commit }) => {
        commit('CLEAR_ERROR_MESSAGE')
    },

    clearWarnMessage: ({ commit }) => {
        commit('CLEAR_WARN_MESSAGE')
    },

    clearFailMessage: ({ commit }) => {
        commit('CLEAR_FAILURE_MESSAGE')
    },

    lockHotKeys: ({ commit }, hotkeys) => {
        commit('LOCK_HOTKEY', hotkeys)
    },

    unlockHotKeys: ({ commit }, hotkeys) => {
        commit('UNLOCK_HOTKEY', hotkeys)
    }
}

const getters = {
    allTracks (state) {
        return state.music
    },

    allArtists (state) {
        return state.artists
    },

    allAlbums (state) {
        return state.albums
    },

    allGenres (state) {
        return state.genres
    },

    allPlaylists (state) {
        return state.playlists
    },

    errorMessage (state) {
        return state.reporter.error
    },

    warnMessage (state) {
        return state.reporter.warning
    },

    failMessage (state) {
        return state.reporter.failure
    },

    backspaceLock (state) {
        return state.vars.lock['backspace']
    },

    enterLock (state) {
        return state.vars.lock['enter']
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}

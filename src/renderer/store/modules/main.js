const path                = require('path')

const {
        removeObject,
        getIndexFromKey,
        related,
        getRelatedItems } = require('./../../utils/object')

const {
        add,
        remove }          = require('./../../utils/list')

const state = {
    music: [],
    albums: [],
    artists: [],
    genres: [],
    playlists: [],
    reporter: {
        // For environment variables
        status: {
            heading: null,
            isEmpty: true
        },
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
    settings: {
        general: {
            excludedFolders: [],
            musicFolder: null
        },
        ui: {
            theme: 'light', // or dark or night
            nightTheme: 'night',
            nightMode: false,
            autoNightMode: {
                isOn: false,
                am: 6,
                pm: 6,
                start_job: null, // Global store for schedule fn
                end_job: null
            }
        },
        audio: {},
        isOpen: false,
        currentSetting: 'general'
    },
    vars: {
        lock: {
            'backspace': false,
            'enter': false
        },
        modals: {
            playlist: false
        },
        cached: {
            mainRoute: '/',
            childRoute: '/'
        },
        loading: false
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
            plays: 0,
            peaks: null,
            duration: null,
            year: meta.year,
            art: meta.art
        }

        track.artist == 'Unknown' ? state.artists = add(state.artists, 'Unknown', true) : state.artists = add(state.artists, track.artist, true)
        track.album == 'Unknown' ? state.albums = add(state.albums, 'Unknown', true) : state.albums = add(state.albums, track.album, true)
        track.genre == 'Unknown' ? state.genres = add(state.genres, 'Unknown', true) : state.genres = add(state.genres, track.genre, true)

        // Only add the track if its not a duplicate
        let result = add(state.music, track)

        if (result != state.music) {
            state.music = result

            if (meta.activePlaylist) {
                let pindex = getIndexFromKey(state.playlists, 'name', meta.activePlaylist.name)
                // If we are in a playlist and add a track we also include it in the playlist
                state.playlists[pindex].tracks.push(track)
            }
        }
    },

    DELETE_TRACK (state, track) {
        // Delete the track from the store
        state.music = removeObject(state.music, 'source', track.source)

        // Remove all traces of the 'album', 'artist', 'genre' if all related tracks are already deleted
        // ... i.e this is the last of its `kind`
        if (track.artist == 'Unknown') {
            // If it has no artist then we refer to the "Unknown"
            // ... entry
            if (related(state.music, 'artist', 'Unknown') == 0) {
                state.artists = remove(state.artists, 'Unknown')
            }
        } else {
            // Otherwise we perform the check using the track's
            // ... `artist` field
            if (related(state.music, 'artist', track.artist) == 0) {
                state.artists = remove(state.artists, track.artist)
            }
        }

        // We do the same for the album and genre
        if (track.album == 'Unknown') {
            if (related(state.music, 'album', 'Unknown') == 0) {
                state.albums = remove(state.albums, 'Unknown')
            }
        } else {
            if (related(state.music, 'album', track.album) == 0) {
                state.albums = remove(state.albums, track.album)
            }
        }

        if (track.genre == 'Unknown') {
            if (related(state.music, 'genre', 'Unknown') == 0) {
                state.genres = remove(state.music, 'Unknown')
            }
        } else {
            if (related(state.music, 'genre', track.genre) == 0) {
                state.genres = remove(state.genres, track.genre)
            }
        }

        // Purge playlists of the track
        for (var i = 0;i < state.playlists.length;i++) {
            state.playlists[i].tracks = removeObject(state.playlists[i].tracks, 'source', track.source)
        }
    },

    DELETE_ARTIST (state, artist) {
        // We obtain all albums and genres from this artist
        let albums = getRelatedItems(state.music, 'artist', 'album', artist)
        let genres = getRelatedItems(state.music, 'artist', 'genre', artist)

        // The artist is then scrubbed from the 'artists' list
        state.artists = remove(state.artists, artist)

        // Followed by deleting all tracks by the artist in the store
        state.music = removeObject(state.music, "artist", artist)

        // The artist's albums are removed from the `albums` list
        // ... "Unknown" is not a single album but a shared one
        // ... given to tracks with no known album
        // ... therefore, before we delete it we must make sure no other
        // ... related tracks by others before we deleted
        for (var i = 0;i < albums.length;i++) {
            // Remeber that all tracks by the artist have been wiped
            // ... and os if we still find tracks from others
            // ... in the "Unknown" album we can't delete
            if (related(state.music, 'album', albums[i]) == 0) {
                state.albums = remove(state.albums, albums[i])
            }
        }

        // Check whether there are other tracks besides the one from
        // ... the artist with the same genre(s)
        for (var i = 0;i < genres.length;i++) {
            if (related(state.music, 'genre', genres[i]) == 0) {
                // We only delete the entire genre when there are no more tracks
                // ... that fall into that category
                state.genres = remove(state.genres, genres[i])
            }
        }
    },

    DELETE_ALBUM (state, album) {
        // Get ther album's artist and genre
        let artist = getRelatedItems(state.music, 'album', 'artist', album)
        let genres  = getRelatedItems(state.music, 'album', 'genre', album)

        // Delete the album from the albums store
        state.albums = remove(state.albums, album)
        // and all related tracks in the album
        state.music = removeObject(state.music, 'album', album)

        // We could also check whether this is the only album from the artist
        // ... if thats the case we get rid of them
        if (getRelatedItems(state.music, 'artist', 'album', artist).length == 0) {
            state.artists = remove(state.artists, artist)
        }

        // Remeber that we previously cleared all album tracks
        // ... we need to check whether there are still tracks with the albums genre
        // If there are no such tracks then we go ahead and remove the genre(s)
        for (var i = 0;i < genres.length;i++) {
            if (related(state.music, 'genre', genres[i]) == 0) {
                state.genres = remove(state.genres, genres[i])
            }
        }
    },

    DELETE_GENRE (state, genre) {
        // Grab all related albums and artists of the genre
        let albums = getRelatedItems(state.music, 'genre', 'album', genre)
        let artists = getRelatedItems(state.music, 'genre', 'artist', genre)

        // Scrub all tracks related to this genre
        state.music = removeObject(state.music, 'genre', genre)
        // and the genre from the genres store
        state.genres = remove(state.genres, genre)

        // Delete all related albums from the albums store
        // ... unless they have none (i.e 'Unknown')
        // ... in that case we need to see whether other tracks outside the genre exists
        // ... if no sich exist we can safely delete the 'Unknown' album
        for (var i = 0;i < albums.length;i++) {
            // The remaining tracks frim this album wouldn't be from the genre
            // ... because we scrubbed all related tracks already
            // ... if there are no more tracks by the 'Unknown' album
            // ... we can delete them
            if (related(state.music, 'album', albums[i]) == 0) {
                state.albums = remove(state.albums, albums[i])
            }
        }

        // Wipe all related artists from the artists store
        // ... including 'Unknown' artists if all their tracks are in this genre
        for (var i = 0;i < artists.length;i++) {
            // The remaining tracks frim this artist wouldn't be from the genre
            // ... because we scrubbed all related tracks already
            // ... if there are no more tracks by the 'Unknown' artist
            // ... we can delete them
            if (related(state.music, 'artist', artists[i]) == 0) {
                state.artists = remove(state.artists, artists[i])
            }
        }
    },

    DELETE_ALL_TRACKS (state) {
        state.albums = []
        state.artists = []
        state.genres = []

        if (state.music.length > 0) {
            state.music = []
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
        let index = getIndexFromKey(state.playlists, 'name', obj.old)
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
        state.playlists = removeObject(state.playlists, 'name', name)
    },

    ADD_TRACK_TO_PLAYLIST (state, obj) {
        let index = getIndexFromKey(state.playlists, 'name', obj.playlist)
        state.playlists[index].tracks = add(state.playlists[index].tracks, obj.track)
    },

    REMOVE_FROM_PLAYLIST (state, obj) {
        let index = getIndexFromKey(state.playlists, 'name', obj.playlist)
        state.playlists[index].tracks = removeObject(state.playlists[index].tracks, 'source', obj.track.source)
    },

    UPDATE_STATUS_MESSAGE (state, meta) {
        state.reporter.status.heading = meta.heading

        state.reporter.status.isEmpty = false
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

    CLEAR_STATUS_MESSAGE (state) {
        state.reporter.status.heading = null

        state.reporter.status.isEmpty = true
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
    },

    CACHE_ROUTE (state, routeObj) {
        if (routeObj.type == 'main') {
            state.vars.cached.mainRoute = routeObj.name
        } else {
            state.vars.cached.childRoute = routeObj.name
        }
    },

    SET_LOADING (state, value) {
        state.vars.loading = value
    },

    // Settings mutations
    // UI
    CHANGE_THEME (state, name) {
        // We are assuming that 'name' is one of three options:-
        // - Dark,
        // - Night
        // - Light
        state.settings.ui.theme = name
    },

    LOAD_THEME (state) {
        let head = document.getElementsByTagName('head')[0]
        let link = document.getElementsByTagName('link')[0]

        link.href = path.join('/', 'static', 'theme', state.settings.ui.theme + '.css')
    },

    SET_NIGHT_THEME (state, name) {
        // We are assuming that `name` is one of two options:-
        // - Dark
        // - Night
        state.settings.ui.nightTheme = name
    },

    TOGGLE_NIGHT_MODE (state) {
        // We only change the current theme to the dark mode
        // ... if the current theme is 'light' or
        // ... not the night mode already
        if (state.settings.ui.theme == 'light' && !(state.settings.ui.theme == state.settings.ui.nightTheme)) {
            state.settings.ui.theme = state.settings.ui.nightTheme
            state.settings.ui.nightMode = true
        } else {
            // Otherwise we change it to the lightTheme
            state.settings.ui.theme = 'light'
            state.settings.ui.nightMode = false
        }
    },

    TOGGLE_AUTO_NIGHT_MODE (state) {
        state.settings.ui.autoNightMode.isOn = !state.settings.ui.autoNightMode.isOn
    },

    SET_AUTO_NIGHT_MODE_AM (state, value) {
        state.settings.ui.autoNightMode.am = value
    },

    SET_AUTO_NIGHT_MODE_PM (state, value) {
        state.settings.ui.autoNightMode.pm = value
    },

    SET_NIGHT_MODE (state, value) {
        state.settings.ui.nightMode = value

        if (value) {
            state.settings.ui.theme = state.settings.ui.nightTheme
        } else {
            state.settings.ui.theme = 'light'
        }
    },

    SET_JOBS_FN (state, jobs) {
        state.settings.ui.autoNightMode.start_job = jobs.start
        state.settings.ui.autoNightMode.end_job = jobs.end
    },

    CLEAR_JOBS_FN (state) {
        state.settings.ui.autoNightMode.start_job.cancel()
        state.settings.ui.autoNightMode.end_job.cancel()
    },

    // Audio
    UPDATE_EXCLUDED_FOLDER (state, name) {
        // Avoid adding duplicates
        if (!(state.settings.general.excludedFolders.indexOf(name) != -1)) {
            state.settings.general.excludedFolders.push(name)
        }
    },

    REMOVE_EXCLUDED_FOLDER (state, name) {
        state.settings.general.excludedFolders = remove(state.settings.general.excludedFolders, name)
    },

    CLEAR_EXCLUDED_FOLDER (state) {
        state.settings.general.excludedFolders = []
    },

    // General
    TOGGLE_SETTINGS (state) {
        state.settings.isOpen = !state.settings.isOpen
    },

    SET_SETTINGS (state, value) {
        state.settings.isOpen = value
    },

    SET_CURRENT_SETTING (state, name) {
        state.settings.currentSetting = name
    },

    SET_MUSIC_FOLDER (state, name) {
        state.settings.general.musicFolder = name
    },

    REMOVE_MUSIC_FOLDER (state) {
        state.settings.general.musicFolder = null
    },

    // Modal dialogs
    // Playlist
    SET_PLAYLIST_MODAL (state, value) {
        state.vars.modals.playlist = value
    }
}

const actions = {
    addTrack: ({ commit }, info) => {
        commit('ADD_TRACK', info)
    },

    deleteTrack: ({ commit }, track) => {
        commit('DELETE_TRACK', track)
    },

    deleteArtist: ({ commit }, artist) => {
        commit('DELETE_ARTIST', artist)
    },

    deleteAlbum: ({ commit }, album) => {
        commit('DELETE_ALBUM', album)
    },

    deleteGenre: ({ commit }, genre) => {
        commit('DELETE_GENRE', genre)
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

    updateStatusMessage: ({ commit }, meta) => {
        commit('UPDATE_STATUS_MESSAGE', meta)
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

    clearStatusMessage: ({ commit }) => {
        commit('CLEAR_STATUS_MESSAGE')
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

    lockHotKey: ({ commit }, hotkey) => {
        commit('LOCK_HOTKEY', hotkey)
    },

    unlockHotKey: ({ commit }, hotkey) => {
        commit('UNLOCK_HOTKEY', hotkey)
    },

    cacheRoute: ({ commit }, routeObj) => {
        commit('CACHE_ROUTE', routeObj)
    },

    setLoading: ({ commit }, value) => {
        commit('SET_LOADING', value)
    },

    // Settings Actions
    setCurrentSetting: ({ commit }, name) => {
        commit('SET_CURRENT_SETTING', name)
    },

    setMusicFolder: ({ commit }, name) => {
        commit('SET_MUSIC_FOLDER', name)
    },

    removeMusicFolder: ({ commit }) => {
        commit('REMOVE_MUSIC_FOLDER')
    },

    // UI
    changeTheme: ({ commit }, name) => {
        commit('CHANGE_THEME', name)
    },

    loadTheme: ({ commit }) => {
        commit('LOAD_THEME')
    },

    setNightTheme: ({ commit }, name) => {
        commit('SET_NIGHT_THEME', name)
    },

    toggleNightMode: ({ commit }) => {
        commit('TOGGLE_NIGHT_MODE')
    },

    setNightMode: ({ commit }, value) => {
        commit('SET_NIGHT_MODE', value)
    },

    toggleAutoNightMode: ({ commit }) => {
        commit('TOGGLE_AUTO_NIGHT_MODE')
    },

    setAutoNightModeAm: ({ commit }, value) => {
        commit('SET_AUTO_NIGHT_MODE_AM', value)
    },

    setAutoNightModePm: ({ commit }, value) => {
        commit('SET_AUTO_NIGHT_MODE_PM', value)
    },

    setJobsFn: ({ commit }, jobs) => {
        commit('SET_JOBS_FN', jobs)
    },

    clearJobsFn: ({ commit }) => {
        commit('CLEAR_JOBS_FN')
    },

    // Audio
    updateExcludedFolder: ({ commit }, name) => {
        commit('UPDATE_EXCLUDED_FOLDER', name)
    },

    removeExcludedFolder: ({ commit }, name) => {
        commit('REMOVE_EXCLUDED_FOLDER', name)
    },

    clearExcludedFolder: ({ commit }) => {
        commit('CLEAR_EXCLUDED_FOLDER')
    },

    // Settings Open var action
    toggleSettings: ({ commit }) => {
        commit('TOGGLE_SETTINGS')
    },

    setSettings: ({ commit }, value) => {
        commit("SET_SETTINGS", value)
    },

    // Modals
    // Playlist
    setPlaylistModal: ({ commit }, value) => {
        commit('SET_PLAYLIST_MODAL', value)
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

    statusMessage (state) {
        return state.reporter.status
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
    },

    cachedRoutes (state) {
        return state.vars.cached
    },

    appIsLoading (state) {
        return state.vars.loading
    },
    // Settings getters
    currentSetting (state) {
        return state.settings.currentSetting
    },

    // General
    appMusicFolder (state) {
        return state.settings.general.musicFolder
    },

    appExcludedFolders (state) {
        return state.settings.general.excludedFolders
    },

    // UI
    appTheme (state) {
        return state.settings.ui.theme
    },

    appNightMode (state) {
        return state.settings.ui.nightMode
    },

    appNightModeTheme (state) {
        return state.settings.ui.nightTheme
    },

    appAutoNightMode (state) {
        return state.settings.ui.autoNightMode.isOn
    },

    appAutoNightModeTime (state) {
        return {
            am: state.settings.ui.autoNightMode.am,
            pm: state.settings.ui.autoNightMode.pm
        }
    },

    appScheduleJobs (state) {
        return {
            start: state.settings.ui.autoNightMode.start_job,
            end: state.settings.ui.autoNightMode.end_job
        }
    },

    settingsOpen (state) {
        return state.settings.isOpen
    },

    // Modals
    // Playlist
    openPlaylistModal (state) {
        return state.vars.modals.playlist
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}

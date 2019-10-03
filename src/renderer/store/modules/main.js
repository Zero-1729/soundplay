const path                     = require('path')
const cuid                     = require('cuid')

const {
        removeObject,
        getIndexFromKey,
        relatedExists,
        getRelatedItems,
        removeSpecificObject } = require('./../../utils/object')

const {
        add,
        remove }               = require('./../../utils/list')

const { TagName,
        TagNameSingle,
        CreateElm }            = require('./../../utils/htmlQuery')

// Helper for quickly getting the appropriate checker fn for relic tracks
const relicFnCehcks = {
    '80s': (n) => { return n >= 1980 && n <= 1989 },
    '90s': (n) => { return n >= 1990 && n <= 1999 },
    '2000s': (n) => { return n >= 2000 && n <= 2005 }
}

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
            items: [],
            isEmpty: true
        },
        warning: {
            heading: null,
            message: null,
            items: [],
            isEmpty: true
        },
        failure: {
            heading: null,
            message: null,
            items: [],
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
        audio: {
            eq: {
                channels: {
                    // Flat preset is the default
                    preamp: 12,
                    Hz_60: 0,
                    Hz_170: 0,
                    Hz_310: 0,
                    Hz_600: 0,
                    KHz_1: 0,
                    KHz_3: 0,
                    KHz_6: 0,
                    KHz_12: 0,
                    KHz_14: 0,
                    KHz_16: 0
                },

                // Variable to assert whether the EQ is 'on' or 'off'
                enabled: false,

                // Whether its visible or not
                visible: false
            }
        },
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
        }
    }
}

const mutations = {
    ADD_TRACK(state, meta) {
        let track = {
            id: cuid(), // For 'v-for' tags
            title: meta.title,
            artist: meta.artist,
            album: meta.album,
            genre: meta.genre,
            source: meta.source,
            favourite: false,
            plays: 0,
            peaks: null,
            duration: null,
            year: meta.year
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
        } else {
            // Lets override the 'failure' message from here
            // ... we log the duplicated files to be reported later
            state.reporter.failure.items = add(state.reporter.failure.items, track.source, true)
        }
    },

    EDIT_TRACK (state, obj) {
        let index = getIndexFromKey(state.music, 'id', obj.id)
        state.music[index][obj.meta] = obj.value
    },

    DELETE_TRACK (state, track) {
        // Delete the track from the store
        state.music = removeObject(state.music, 'source', track.source)

        // Remove all traces of the 'album', 'artist', 'genre' if all related tracks are already deleted
        // ... i.e this is the last of its `kind`
        if (!relatedExists(state.music, 'artist', track.artist)) {
            state.artists = remove(state.artists, track.artist)
        }

        // We do the same for the album and genre
        if (!relatedExists(state.music, 'album', track.album)) {
            state.albums = remove(state.albums, track.album)
        }

        if (!relatedExists(state.music, 'genre', track.genre)) {
            state.genres = remove(state.genres, track.genre)
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
            if (!relatedExists(state.music, 'album', albums[i])) {
                state.albums = remove(state.albums, albums[i])
            }
        }

        // Check whether there are other tracks besides the one from
        // ... the artist with the same genre(s)
        for (var i = 0;i < genres.length;i++) {
            if (!relatedExists(state.music, 'genre', genres[i])) {
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
        if (!relatedExists(state.music, 'artist', 'album', artist)) {
            state.artists = remove(state.artists, artist)
        }

        // Remeber that we previously cleared all album tracks
        // ... we need to check whether there are still tracks with the albums genre
        // If there are no such tracks then we go ahead and remove the genre(s)
        for (var i = 0;i < genres.length;i++) {
            if (!relatedExists(state.music, 'genre', genres[i])) {
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
            if (!relatedExists(state.music, 'album', albums[i])) {
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
            if (!relatedExists(state.music, 'artist', artists[i])) {
                state.artists = remove(state.artists, artists[i])
            }
        }
    },

    DELETE_ALL_TRACKS (state, destructive) {
        state.albums = []
        state.artists = []
        state.genres = []

        if (state.music.length > 0) {
            state.music = []
        }

        if (destructive) {
            // Deleted from settings
            state.playlists = []
        } else {
            // Empty playlist
            for (var i = 0;i < state.playlists.length;i++) {
                state.playlists[i].tracks = []
            }
        }
    },

    DELETE_RELIC_TRACKS (state, period) {
        // Delete all tracks from either the '80s', '90s', etc
        state.music = removeSpecificObject(state.music, 'year', relicFnCehcks[period])
    },

    UNFAVOURITE_TRACK (state, track) {
        let index = state.music.indexOf(track)
        state.music[index].favourite = false
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

    DELETE_PLAYLIST_TRACKS (state, name) {
        let index = getIndexFromKey(state.playlists, name)

        state.playlists[index].tracks = []
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
        state.reporter.error.items   = []

        state.reporter.error.isEmpty = true
    },

    CLEAR_WARN_MESSAGE (state) {
        state.reporter.warning.heading = null
        state.reporter.warning.message = null
        state.reporter.warning.items   = []

        state.reporter.warning.isEmpty = true
    },

    CLEAR_FAILURE_MESSAGE (state) {
        state.reporter.failure.heading = null
        state.reporter.failure.message = null
        state.reporter.failure.items   = []

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
        let linkExists = TagName('link').length > 0
        let link

        if (linkExists) {
            link = TagNameSingle('link')
            link.href = path.join('static', 'theme', state.settings.ui.theme + '.css')
        } else {
            link = CreateElm('link')
            link.rel = 'stylesheet'
            link.href = path.join('static', 'theme', state.settings.ui.theme + '.css')

            head.appendChild(link)
        }
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
    SET_ALL_AUDIO_EQ_CHANNELS (state, channels) {
        state.settings.audio.eq.channels.preamp = channels.preamp
        state.settings.audio.eq.channels.Hz_60  = channels.Hz_60
        state.settings.audio.eq.channels.Hz_170 = channels.Hz_170
        state.settings.audio.eq.channels.Hz_310 = channels.Hz_310
        state.settings.audio.eq.channels.Hz_600 = channels.Hz_600
        state.settings.audio.eq.channels.KHz_1  = channels.KHz_1
        state.settings.audio.eq.channels.KHz_3  = channels.KHz_3
        state.settings.audio.eq.channels.KHz_6  = channels.KHz_6
        state.settings.audio.eq.channels.KHz_12 = channels.KHz_12
        state.settings.audio.eq.channels.KHz_14 = channels.KHz_14
        state.settings.audio.eq.channels.KHz_16 = channels.KHz_16
    },

    SET_AUDIO_EQ_LEVEL (state, arg) {
        state.settings.audio.eq.channels[arg.channel] = arg.value
    },

    TOGGLE_AUDIO_EQ (state, value) {
        state.settings.audio.eq.enabled = value
    },

    SET_AUDIO_EQ_VISIBILITY (state) {
        state.settings.audio.eq.visible = !state.settings.audio.eq.visible
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

    editTrack: ({ commit }, obj) => {
        commit('EDIT_TRACK', obj)
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

    deleteAllTracks: ({ commit }, kind) => {
        commit('DELETE_ALL_TRACKS', kind)
    },

    deleteRelicTracks: ({ commit }, period) => {
        commit('DELETE_RELIC_TRACKS', period)
    },

    toggleFavourite: ({ commit }, track) => {
        commit('TOGGLE_FAVOURITE_TRACK', track)
    },

    unfavouriteTrack: ({ commit }, track) => {
        commit('UNFAVOURITE_TRACK', track)
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

    deletePlaylistTracks: ({ commit }, name) => {
        commit('DELETE_PLAYLIST_TRACKS', name)
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

    setAllAudioEQChannels: ({ commit }, channels) => {
        commit('SET_ALL_AUDIO_EQ_CHANNELS', channels)
    },

    setAudioEQLevel: ({ commit }, arg) => {
        commit("SET_AUDIO_EQ_LEVEL", arg)
    },

    toggleAudioEQ: ({ commit }, value) => {
        commit("TOGGLE_AUDIO_EQ", value)
    },

    toggleAudioEQVisibility: ({ commit }) => {
        commit("SET_AUDIO_EQ_VISIBILITY")
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

    // Audio
    appAudioEQ (state) {
        return state.settings.audio.eq
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

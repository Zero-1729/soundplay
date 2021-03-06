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

const FlatEQPreset  = require('./../../data/preset_eqs.json')['Flat']


// Helper for quickly getting the appropriate checker fn for relic tracks
const relicFnCehcks = {
    '80s': (n) => { return n >= 1980 && n <= 1989 },
    '90s': (n) => { return n >= 1990 && n <= 1999 },
    '2000s': (n) => { return n >= 2000 && n <= 2009 }
}

const state = {
    music: [],
    albums: [],
    artists: [],
    genres: [],
    playlists: [],
    settings: {
        general: {
            excludedFolders: [],
            musicFolder: null
        },
        ui: {
            displayNotif: true, // Whether to display next track notification
            theme: 'light', // or dark or night
            nightTheme: 'night',
            nightMode: false,
            autoNightMode: {
                isOn: false,
                am: 6,
                pm: 6
            },
            sleepBlocker: true
        },
        audio: {
            playback_behaviour: 'reset', // Defaults to reset

            eq: {
                preset: 'Flat',
                channels: {
                    // Flat preset is the default
                    preamp: FlatEQPreset.preamp,
                    Hz_60: FlatEQPreset.Hz_60,
                    Hz_170: FlatEQPreset.Hz_170,
                    Hz_310: FlatEQPreset.Hz_310,
                    Hz_600: FlatEQPreset.Hz_600,
                    KHz_1: FlatEQPreset.KHz_1,
                    KHz_3: FlatEQPreset.KHz_3,
                    KHz_6: FlatEQPreset.KHz_6,
                    KHz_12: FlatEQPreset.KHz_12,
                    KHz_14: FlatEQPreset.KHz_14,
                    KHz_16: FlatEQPreset.KHz_16
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
    // For restoring routes each new session
    cached: {
        mainRoute: '/',
        childRoute: '/'
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

        track.artist == 'Unknown' ? state.artists = add(state.artists, 'Unknown') : state.artists = add(state.artists, track.artist)
        track.album == 'Unknown' ? state.albums = add(state.albums, 'Unknown') : state.albums = add(state.albums, track.album)
        track.genre == 'Unknown' ? state.genres = add(state.genres, 'Unknown') : state.genres = add(state.genres, track.genre)

        if (meta.activePlaylist) {
            let pindex = getIndexFromKey(state.playlists, 'name', meta.activePlaylist.name)
            // If we are in a playlist and add a track we also include it in the playlist
            state.playlists[pindex].ids.push(track.id)
        }

        // Add the track
        // We already its unique if it reaches here
        // ... so we just append it
        state.music.push(track)
    },

    EDIT_TRACK (state, obj) {
        let index = getIndexFromKey(state.music, 'id', obj.id)
        state.music[index][obj.meta] = obj.value
    },

    DELETE_TRACK (state, track) {
        // Delete the track from the store
        state.music = removeObject(state.music, 'id', track.id)

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
            state.playlists[i].ids = removeObject(state.playlists[i].ids, 'id', track.id)
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
                state.playlists[i].ids = []
            }
        }
    },

    DELETE_RELIC_TRACKS (state, period) {
        // Delete all tracks from either the '80s', '90s', etc
        state.music = removeSpecificObject(state.music, 'year', relicFnCehcks[period])
    },

    UNFAVOURITE_TRACK (state, track) {
        let index = getIndexFromKey(state.music, 'id', track.id)
        state.music[index].favourite = false
    },

    TOGGLE_FAVOURITE_TRACK (state, track) {
        let index = getIndexFromKey(state.music, 'id', track.id)

        if (state.music[index].favourite) {
            state.music[index].favourite = false
        } else {
            state.music[index].favourite = true
        }
    },

    INCREMENT_PLAY_COUNT (state, track) {
        let index = getIndexFromKey(state.music, 'id', track.id)

        state.music[index].plays += 1
    },

    CREATE_PLAYLIST (state, name) {
        state.playlists.push({
            name: name,
            ids: []
        })
    },

    RENAME_PLAYLIST (state, obj) {
        let index = getIndexFromKey(state.playlists, 'name', obj.old)

        // Rename it from the core
        state.playlists[index].name = obj.current
    },

    REMOVE_PLAYLIST (state, name) {
        state.playlists = removeObject(state.playlists, 'name', name)
    },

    ADD_TRACK_TO_PLAYLIST (state, obj) {
        let index = getIndexFromKey(state.playlists, 'name', obj.playlist)

        // Our playlist just store track ids not the whole track object
        state.playlists[index].ids = add(state.playlists[index].ids, obj.id)
    },

    REMOVE_FROM_PLAYLIST (state, obj) {
        let index = getIndexFromKey(state.playlists, 'name', obj.playlist)
        state.playlists[index].ids = remove(state.playlists[index].ids, obj.id)
    },

    DELETE_PLAYLIST_TRACKS (state, name) {
        let index = getIndexFromKey(state.playlists, name)

        state.playlists[index].ids = []
    },

    // App Routes
    CACHE_MAIN_ROUTE (state, arg) {
        state.cached.mainRoute = arg
    },

    CACHE_CHILD_ROUTE (state, arg) {
        state.cached.childRoute = arg
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

    DISPLAY_NOTIF (state, arg) {
        state.settings.ui.displayNotif = arg
    },

    SET_SLEEP_BLOCKER (state, value) {
        state.settings.ui.sleepBlocker = value
    },

    // Audio
    SET_AUDIO_PLAYBACK_BEHAVIOUR (state, arg) {
        state.settings.audio.playback_behaviour = arg
    },

    SET_ALL_AUDIO_EQ_CHANNELS (state, arg) {
        state.settings.audio.eq.preset = arg.preset

        state.settings.audio.eq.channels.preamp = arg.channels.preamp
        state.settings.audio.eq.channels.Hz_60  = arg.channels.Hz_60
        state.settings.audio.eq.channels.Hz_170 = arg.channels.Hz_170
        state.settings.audio.eq.channels.Hz_310 = arg.channels.Hz_310
        state.settings.audio.eq.channels.Hz_600 = arg.channels.Hz_600
        state.settings.audio.eq.channels.KHz_1  = arg.channels.KHz_1
        state.settings.audio.eq.channels.KHz_3  = arg.channels.KHz_3
        state.settings.audio.eq.channels.KHz_6  = arg.channels.KHz_6
        state.settings.audio.eq.channels.KHz_12 = arg.channels.KHz_12
        state.settings.audio.eq.channels.KHz_14 = arg.channels.KHz_14
        state.settings.audio.eq.channels.KHz_16 = arg.channels.KHz_16
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
    }
}

const actions = {
    addTrack: ({ commit }, meta) => {
        commit('ADD_TRACK', meta)
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

    incrementPlayCount: ({ commit }, track) => {
        commit('INCREMENT_PLAY_COUNT', track)
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

    // App Routes
    cacheMainRoute: ({ commit }, arg) => {
        commit("CACHE_MAIN_ROUTE", arg)
    },

    cacheChildRoute: ({ commit }, arg) => {
        commit("CACHE_CHILD_ROUTE", arg)
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

    displayNotif: ({ commit }, arg) => {
        commit('DISPLAY_NOTIF', arg)
    },

    setSleepBlocker: ({ commit }, arg) => {
        commit('SET_SLEEP_BLOCKER', arg)
    },

    // Audio
    setAudioPlaybackBehaviour: ({ commit }, arg) => {
        commit("SET_AUDIO_PLAYBACK_BEHAVIOUR", arg)
    },

    updateExcludedFolder: ({ commit }, name) => {
        commit('UPDATE_EXCLUDED_FOLDER', name)
    },

    removeExcludedFolder: ({ commit }, name) => {
        commit('REMOVE_EXCLUDED_FOLDER', name)
    },

    clearExcludedFolder: ({ commit }) => {
        commit('CLEAR_EXCLUDED_FOLDER')
    },

    setAllAudioEQChannels: ({ commit }, arg) => {
        commit('SET_ALL_AUDIO_EQ_CHANNELS', arg)
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

    // App Routes
    appRoutes (state) {
        return state.cached
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

    appNotifs (state) {
        return state.settings.ui.displayNotif
    },

    sleepBlocker (state) {
        return state.settings.ui.sleepBlocker
    },

    settingsOpen (state) {
        return state.settings.isOpen
    },

    // Audio
    appAudioPlaybackBehaviour (state) {
        return state.settings.audio.playback_behaviour
    },

    appAudioEQ (state) {
        return state.settings.audio.eq
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}

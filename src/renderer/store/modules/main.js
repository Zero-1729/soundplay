// Some helper functions

// Helper for Adding unique items to arrays
const add = (list, item, basic=false) => {
    let isDup = false

    for (var i = 0;i < list.length;i++) {
    	if (!basic) {
            if (list[i].source == item.source) {
                isDup = true
            }
        } else {
            if (list[i] == item) {
                isDup = true
            }
        }
    }

    // If we do find a duplicate we simply return an unaltered list
    if (isDup) {
    	return list
    } else {
        // otherwise, we return an altered list with the new item
        return list.concat(item)
    }
}

// Obtain tracks related to a given category; i.e genre
const related = (list, category, name) => {
    // Returns all tracks with the category (i.e genre) 'name'
    return list.filter((track) => {
        return track[category] == name
    }).length
}

// Remove an item from an array
const remove = (list, item) => {
    let index = list.indexOf(item)

    if (index) {
        list = list.slice(0, index).concat(list.slice(index+1))
        return list
    } else {
        return list
    }
}

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
    }
}

const mutations = {
    // Muts
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
                let pindex = state.playlists[meta.activePlaylist]

                // If we are in a playlist and add a track we also include it in the playlist
                state.playlists[pindex].push(track)
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

        // Obtain possible info on playlists that include the track
        let meta = {indexes: [], pindexes: []}

        state.playlists.forEach((playlist) => {
            playlist.tracks.forEach((ptrack) => {
                if (ptrack.source == track.source) {
                    meta.indexes.push(playlist.indexOf(ptrack))
                    meta.pindexs = state.playlists.indexOf(playlist)
                }
            })
        })

        if (meta.indexes.length > 0) {
            // Scrub all traces in playlists
            for (var i = 0;i < meta.names.length;i++) {
                state.playlists[meta.pindexes[i]] = state.playlists[meta.pindexes[i]].slice(0, meta.indexes[i]).concat(state.playlists[meta.pindexes]).slice(meta.indexes[i]+1)
            }
        }

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

    TOGGLE_FAVOURITE_TRACK (state, track) {
        let index = state.music.indexOf(track)

        if (state.music[index].favourite) {
            state.music[index].favourite = false
        } else {
            state.music[index].favourite = true
        }
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
    }
}

const actions = {
    // Acts
    addTrack: ({ commit }, info) => {
        commit('ADD_TRACK', info)
    },

    deleteTrack: ({ commit }, track) => {
        commit('DELETE_TRACK', track)
    },

    toggleFavourite: ({ commit }, track) => {
        commit('TOGGLE_FAVOURITE_TRACK', track)
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
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}

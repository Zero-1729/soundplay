const state = {
    currentTrack: null,
    pool: null,
    playingCriteria: null, // 'music' should be default?
    currentDirec: 'a-z',
    sortBy: 'title'
}

const mutations = {
    UPDATE_CURRENT_TRACK (state, track) {
        state.currentTrack = track
    },

    UPDATE_POOL (state, tracks) {
        state.pool = tracks
    },

    CHANGE_PLAYING_CRITERIA (state, criteria) {
        state.playingCriteria = criteria
    },

    SET_SORT_BY (state, name) {
        state.sortBy = name
    },

    SET_CURRENT_DIREC (state, direc) {
        state.currentDirec = direc
    }
}

const actions = {
    updatePool: ({ commit }, tracks) => {
        commit('UPDATE_POOL', tracks)
    },

    updateCurrentTrack: ({ commit }, track) => {
        commit('UPDATE_CURRENT_TRACK', track)
    },

    updatePlayingCriteria: ({ commit }, criteria) =>  {
        commit('CHANGE_PLAYING_CRITERIA', criteria)
    },

    setSortBy: ({ commit }, name) => {
        commit('SET_SORT_BY', name)
    },

    setCurrentDirec: ({ commit }, direc) => {
        commit('SET_CURRENT_DIREC', direc)
    }
}

const getters = {
    currentTrack(state) {
        return state.currentTrack
    },

    currentPool(state) {
        return state.pool
    },

    playingCriteria(state) {
        return state.playingCriteria
    },

    filteredPool(state) {
        var tmp = state.pool.slice(0)

        return tmp.sort((a, b) => {
            var comp = 0
            var tmp_a = a[state.sortBy].toUpperCase()
            var tmp_b = b[state.sortBy].toUpperCase()

            if (tmp_a > tmp_b) {
                comp = 1
            } else {
                comp = -1
            }

            return state.currentDirec == 'a-z' ? comp : (comp * -1)
        })
    },

    sortBy(state) {
        return state.sortBy
    },

    currentDirec(state) {
        return state.currentDirec
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}

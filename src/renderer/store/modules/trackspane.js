const state = {
    currentTrack: null,
    pool: [],
    currentDirec: 'a-z',
    sortBy: 'title'
}

const mutations = {
    UPDATE_CURRENT_TRACK (state, track) {
        state.currentTrack = track
    },

    CLEAR_CURRENT_TRACK (state) {
        state.currentTrack = null
    },

    UPDATE_POOL (state, tracks) {
        state.pool = tracks
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

    clearCurrentTrack: ({ commit }) => {
        commit('CLEAR_CURRENT_TRACK')
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

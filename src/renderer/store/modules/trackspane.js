const state = {
    currentDirec: 'a-z',
    sortBy: 'title'
}

const mutations = {
    SET_SORT_BY (state, name) {
        state.sortBy = name
    },

    SET_CURRENT_DIREC (state, direc) {
        state.currentDirec = direc
    }
}

const actions = {
    setSortBy: ({ commit }, name) => {
        commit('SET_SORT_BY', name)
    },

    setCurrentDirec: ({ commit }, direc) => {
        commit('SET_CURRENT_DIREC', direc)
    }
}

const getters = {
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

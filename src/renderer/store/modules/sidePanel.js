const state = {
    criteria: 'music',
    activeOption: null,
    searchText: '',

}

const mutations = {
    CHANGE_CRITERIA (state, value) {
        state.criteria = value
    },

    CHANGE_ACTIVE_OPTION (state, value) {
        if (state.activeOption == value) {
            state.activeOption = null
        } else {
            state.activeOption = value
        }
    },

    SET_SEARCH_TEXT (state, value) {
        state.searchText = value
    }
}

const actions = {
    updateCriteria: ({ commit }, value) => {
        // Update 'activeOption'
        commit('CHANGE_CRITERIA', value)
    },

    updateAO: ({ commit }, value) => {
        // Update 'activeAltOption'
        commit('CHANGE_ACTIVE_OPTION', value)
    },

    updateST: ({ commit }, value) => {
        // Update 'searchText'
        commit("SET_SEARCH_TEXT", value)
    },

    updateSearchText: ({ commit }, value) => {
        commit('SET_SEARCH_TEXT', value)
    }
}

const getters = {
    currentCriteria(state) {
        return state.criteria
    },
    activeOption(state) {
        return state.activeOption
    },
    searchText(state) {
        return state.searchText
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}

const state = {
    criteria: 'music'
}

const mutations = {
    CHANGE_CRITERIA (state, value) {
        state.criteria = value
    }
}

const actions = {
    updateCriteria: ({ commit }, value) => {
        // Update 'criteria'
        commit('CHANGE_CRITERIA', value)
    }
}

const getters = {
    currentCriteria(state) {
        return state.criteria
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}

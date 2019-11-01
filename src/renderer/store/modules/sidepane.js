const state = {
    target: 'All Tracks'
}

const mutations = {
    CHANGE_TARGET (state, value) {
        state.target = value
    }
}

const actions = {
    changeTarget: ({ commit }, value) => {
        commit('CHANGE_TARGET', value)
    }
}

const getters = {
    currentTarget(state) {
        return state.target
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}

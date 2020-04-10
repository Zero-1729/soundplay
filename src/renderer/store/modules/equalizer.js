const state = {
    channelMutex: false // So we can display 'reset' on EQ
}

const mutations = {
    SET_CHAN_MUTEX (state, value) {
        state.channelMutex = value
    }
}

const actions = {
    setChanMutex: ({ commit }, value) => {
        // Update 'criteria'
        commit('SET_CHAN_MUTEX', value)
    }
}

const getters = {
    channelMutex(state) {
        return state.channelMutex
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}

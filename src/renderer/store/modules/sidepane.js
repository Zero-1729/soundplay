const state = {
    target: 'All Tracks',
    playingTarget: null
}

const mutations = {
    CHANGE_TARGET (state, value) {
        state.target = value
    },

    SET_PLAYING_TARGET (state, value) {
        state.playingTarget = value
    }
}

const actions = {
    changeTarget: ({ commit }, value) => {
        commit('CHANGE_TARGET', value)
    },

    updatePlayingTarget: ({ commit }, value) => {
        commit('SET_PLAYING_TARGET', value)
    }
}

const getters = {
    currentTarget(state) {
        return state.target
    },

    playingTarget(state) {
        return state.playingTarget
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}

const state = {
    target: 'All Tracks',
    playingTarget: null,
    playingCriteria: null, // 'music' should be default?
}

const mutations = {
    CHANGE_TARGET (state, value) {
        state.target = value
    },

    SET_PLAYING_TARGET (state, value) {
        state.playingTarget = value
    },

    CHANGE_PLAYING_CRITERIA (state, criteria) {
        state.playingCriteria = criteria
    }
}

const actions = {
    changeTarget: ({ commit }, value) => {
        commit('CHANGE_TARGET', value)
    },

    updatePlayingTarget: ({ commit }, value) => {
        commit('SET_PLAYING_TARGET', value)
    },

    updatePlayingCriteria: ({ commit }, criteria) =>  {
        commit('CHANGE_PLAYING_CRITERIA', criteria)
    }
}

const getters = {
    currentTarget(state) {
        return state.target
    },

    playingTarget(state) {
        return state.playingTarget
    },

    playingCriteria(state) {
        return state.playingCriteria
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}

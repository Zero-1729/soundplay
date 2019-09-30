const state = {
    volume: 0.5,
    lastVolume: 0.5,
    mute: false,
    loopSingle: false,
    loopAll: false
}

const mutations = {
    RESTORE_VOLUME (state) {
        state.volume = state.lastVolume
    },
    SET_VOLUME (state, val) {
        state.volume = val
    },
    UPDATE_VOLUME (state, val) {
        state.volume = val
        state.lastVolume = val

        // If no volume, we toggle mute
        if (val == 0) {
            state.mute = true
        }
    },

    TOGGLE_MUTE (state, val) {
        if (val != null) {
            state.mute = val
        } else { state.mute = !state.mute }
    },

    SET_LOOP (state, mode) {
        // If val is 'single', we toggle out 'all' if set
        // ... vice versa
        if (mode == 'single') {
            if (state.loopAll) {
                state.loopAll = false
            }

            state.loopSingle = !state.loopSingle
        } else {
            if (state.loopSingle) {
                state.loopSingle = false
            }

            state.loopAll = !state.loopAll
        }
    }
}


const actions = {
    restoreVolume: ({ commit }) => {
        commit("RESTORE_VOLUME")
    },

    setVolume: ({ commit }, val) => {
        commit("SET_VOLUME", val)
    },

    updateVolume: ({ commit }, val) => {
        commit("UPDATE_VOLUME", val)
    },

    toggleMute: ({ commit }, val) => {
        commit("TOGGLE_MUTE", val)
    },

    setLoop: ({ commit }, mode) => {
        commit("SET_LOOP", mode)
    }
}

const getters = {
    appAudioPrefs(state) {
        return {
            volume: state.volume,
            mute: state.mute,
            loopSingle: state.loopSingle,
            loopAll: state.loopAll
        }
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}

const state = {
    volume: 0.5,
    mute: false,
    loopSingle: false,
    loopAll: false
}

const mutations = {
    UPDATE_VOLUME (state, val) {
        state.volume = val
    },

    TOGGLE_MUTE (state) {
        state.mute = !state.mute
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
    updateVolume: ({ commit }, val) => {
        commit("UPDATE_VOLUME", val)
    },

    toggleMute: ({ commit }) => {
        commit("TOGGLE_MUTE")
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

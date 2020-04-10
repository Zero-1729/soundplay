const state = {
    volume: 0.5,
    lastVolume: 0.5,
    mute: false,
    loopSingle: false,
    loopAll: false,
    shuffle: false,
    playbackRate: 1,
    persistedHistory: true
}

const mutations = {
    RESTORE_VOLUME (state) {
        state.volume = state.lastVolume
    },

    SET_VOLUME (state, val) {
        state.volume = val
    },

    SET_PERSISTED_HISTORY (state, val) {
        state.persistedHistory = val
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
    },

    SET_PLAYBACK_RATE (state, value) {
        state.playbackRate = value
    },

    TOGGLE_SHUFFLE (state) {
        state.shuffle = !state.shuffle
    }
}


const actions = {
    restoreVolume: ({ commit }) => {
        commit("RESTORE_VOLUME")
    },

    setVolume: ({ commit }, val) => {
        commit("SET_VOLUME", val)
    },

    setPersistedHistory: ({ commit }, val) => {
        commit("SET_PERSISTED_HISTORY", val)
    },

    updateVolume: ({ commit }, val) => {
        commit("UPDATE_VOLUME", val)
    },

    toggleMute: ({ commit }, val) => {
        commit("TOGGLE_MUTE", val)
    },

    setLoop: ({ commit }, mode) => {
        commit("SET_LOOP", mode)
    },

    setAudioPlayback: ({ commit }, value) => {
        commit("SET_PLAYBACK_RATE", value)
    },

    toggleShuffle: ({ commit }) => {
        commit("TOGGLE_SHUFFLE")
    }
}

const getters = {
    appAudioPrefs(state) {
        return {
            volume: state.volume,
            lastVolume: state.lastVolume,
            mute: state.mute,
            loopSingle: state.loopSingle,
            loopAll: state.loopAll,
            shuffle: state.shuffle,
            playbackRate: state.playbackRate,
            persistedHistory: state.persistedHistory
        }
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}

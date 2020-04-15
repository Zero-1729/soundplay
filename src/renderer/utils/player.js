const ws = require('wavesurfer.js')
const fs = require('fs')

const { getIndexFromKey, removeObject }  = require('./object')
const { remove }                         = require('./list')


export default class Player {
    constructor(track, props) {
        this.currentTrack = track
        this.activated = false // Flag for state of player. i.e. newly launched
        this.cleared = false // Flag for detecting whether current playing track was just deleted
        this.playHistory = [] // For storing all previously played tracks in shuffle mode (before reaching the end of playback)
        this.playedIDs   = [] // For storing IDs of played tracks in shuffle mode
        this.tmpPlayHistory = [] // Stores the last 10 played tracks
        this.randoms = [] // Shuffled indexes array
        this.preampGain = 0 // We keep track of the preamp's current value
        this.preampNode = null // We create this once and adjust the gain value when preamp value changed (-1 <= x <= 1)
        this.bands = {
            'preamp': "preamp",
            60: "Hz_60",
            170: "Hz_170",
            310: "Hz_310",
            600: "Hz_600",
            1000: "KHz_1",
            3000: "KHz_3",
            6000: "KHz_6",
            12000: "KHz_12",
            14000: "KHz_14",
            16000: "KHz_16"
        }

        this.device = new ws.create({
            container: "#waveform",
            fillParent: true,
            scrollParent: false,
            waveColor: props.waveColor,
            progressColor: props.progressColor,
            cursorColor: props.cursorColor,
            pixelRatio    : props.window.devicePixelRatio,
            minPxPerSec   : 20,
            height: 25,
            cursorWidth: 1,
            cursorHeight: 0.8,
            hideScrollbar : true,
            audioRate     : 1,
            normalize     : false,
            interact      : true,
            audioRate  : props.playbackRate 
        })

        this.device.setVolume(props.volume)
        if (props.mute) this.device.setMute(true)
    }

    activate(currentTrack, pool) {
        this.activated = true
        // Previously we triggered the randoms refill fn here
        // ... but that caused it to be re-reshuffled
        // ... because when the App is newly launched the 'fillRandoms' fn
        // ... is triggered if the 'shuffle' is on
        // ... If not, even if the user toggles the shuffle mode,
        // ... the 'fillRandoms' fn is called in 'App.vue'
        // ... Meaning, we essentially don't need the call aswell
    }

    setProgressColor(color) {
        this.device.setProgressColor(color)
    }

    setCursorColor(color) {
        this.device.setCursorColor(color)
    }

    setWaveColor(color) {
        this.device.setWaveColor(color)
    }

    setPlaybackRate(val) {
        this.device.setPlaybackRate(val)
    }

    reset() {
        this.device.seekTo(0)
    }

    clear() {
        this.device.pause()
        this.device.empty()

        // Set cleared flag
        this.cleared = true
    }

    updateVolume(val) {
        this.device.setVolume(val)

        if (val == 0) {
            this.device.setMute(true)
        } else {
            this.device.setMute(false)
        }
    }

    formatTime(time) {
        // Lets obtain our min and secs
        let min = parseInt((time / 60) % 60)
        let secs = parseInt(time % 60)

        // Format min and secs
        let m = min < 10 ? "0"+min : min
        let s = secs < 10 ? "0"+secs : secs

        // return parsed value
        return `${m}:${s}` || '00:00'
    }

    getDuration() {
        return this.formatTime(this.device.getDuration())
    }

    getCurrentPos() {
        return this.formatTime(this.device.getCurrentTime())
    }

    playNew(path) {
        this.device.stop()
        this.device.empty()

        // To signal whether path/source of the sound file still exists
        let buffer = null

        try {
            buffer = fs.readFileSync(path)
        } catch (e) {}

        if (buffer) {
            this.device.loadArrayBuffer(buffer.buffer)

            // Reset, so we can 'play/pause'
            this.cleared = false

            return true
        } else {
            return false
        }
    }

    play() {
        // Alias fn to trigger play
        this.device.playPause()
    }

    playpause() {
        if (!this.cleared) this.device.playPause()
    }

    getNextRandom(currentTrack, pool, exclude=false) {
        let index = currentTrack ? getIndexFromKey(pool, 'id', currentTrack.id) : -1

        // Register track in history
        // History is limited to last ten tracks (~30 mins playtime)
        // ... assuming each track is ~3 mins long
        if (!exclude && (index != -1)) {
            if (this.tmpPlayHistory.length <= 10) {
                this.tmpPlayHistory.push(index)
            } else {
                this.tmpPlayHistory = [index]
            }
        }

        // Check if randoms empty, so we can refill
        if (this.randoms.length == 0) {
            // Remember to pass same vars to fn
            // ... to avoid null errors
            this.fillRandoms(currentTrack, pool)
        }

        // Then we just pop the last index
        return this.randoms.pop()
    }

    fillHistory(pool, index) {
        // All indexes are pushed until the floor is reached
        if (!(pool.length == this.playHistory.length)) {
            this.playHistory.push(index)

            // Store ID
            this.playedIDs.push(pool[index].id)
        } else {
            this.playHistory = [index]
            this.playedIDs   = [pool[index].id]
        }
    }

    fillRandoms(currentTrack, pool, excludePlayed=false) {
        // Create a properly shuffled pool
        // Exclude playing track, to avoid any collisions
        let tmpPool = currentTrack ? removeObject(pool, 'id', currentTrack.id) : pool.slice(0)

        // Durstenfeld Algo
        for (var i = tmpPool.length - 1;i > 0;i--) {
                let j = Math.floor(Math.random() * (i + 1))

                let idx = tmpPool[i]

                tmpPool[i] = tmpPool[j]
                tmpPool[j] = idx
        }

        // Fill randoms with newly created (in place) shuffled indexes
        this.randoms = tmpPool.map((item) => { return pool.indexOf(item) })

        // Remove alreaady played tracks
        // Only triggered if playing target resumed to avoid collisions
        // ... since the randoms is refilled each time its updated
        if (excludePlayed) {
            for (var x = 0;x < this.playHistory.length;x++) {
                this.randoms = remove(this.randoms, this.playHistory[x])

                // Also removed played tracks using IDs
                this.randoms = remove(this.randoms, getIndexFromKey(pool, 'id', this.playedIDs[x]))
            }
        }
    }

    // We don't want indexes from previous 'pools' to persist
    emptyRandoms() { this.randoms = [] }

    freeRandTrack (index) {
        // Fn should be invoked oonly when a track has been deleted or added
        // ... as randoms is popped, so this has no effect
        // Removes a track from the set of `this.randoms` to avoid potential double play
        this.randoms = remove(this.randoms, index)
    }

    clearHistory () {
        this.playHistory = []
        this.tmpPlayHistory = []
    }

    initEQ(temp) {
        this.connectEQ(temp[this.bands['preamp']],
        [{
            f: 60,
            type: 'lowshelf',
            value: temp[this.bands[60]]
        },
        {
            f: 170,
            type: 'peaking',
            value: temp[this.bands[170]]
        },
        {
            f: 310,
            type: 'peaking',
            value: temp[this.bands[310]]
        },
        {
            f: 600,
            type: 'peaking',
            value: temp[this.bands[600]]
        },
        {
            f: 1000,
            type: 'peaking',
            value: temp[this.bands[1000]]
        },
        {
            f: 3000,
            type: 'peaking',
            value: temp[this.bands[3000]]
        },
        {
            f: 6000,
            type: 'peaking',
            value: temp[this.bands[6000]]
        },
        {
            f: 12000,
            type: 'peaking',
            value: temp[this.bands[12000]]
        },
        {
            f: 14000,
            type: 'peaking',
            value: temp[this.bands[14000]]
        },
        {
            f: 16000,
            type: 'highshelf',
            value: temp[this.bands[16000]]
        }])
    }

    updateEQChannel(channel, val) {
        if (channel == 'preamp') {
            // Update preamp
            this.preampGain = val / 20

            // Mutate preampGainNode value
            this.preampNode.gain.value = this.preampGain
        } else {
            // update specific band channel
            let index = getIndexFromKey(this.device.backend.filters, 'frequency.value', channel)

            // Update the channel value
            this.device.backend.filters[index].gain.value = val
        }
    }

    resetEQ() {
        this.connectEQ(0, [{
            f: 60,
            type: 'lowshelf',
            value: 0
        },
        {
            f: 170,
            type: 'peaking',
            value: 0
        },
        {
            f: 310,
            type: 'peaking',
            value: 0
        },
        {
            f: 600,
            type: 'peaking',
            value: 0
        },
        {
            f: 1000,
            type: 'peaking',
            value: 0
        },
        {
            f: 3000,
            type: 'peaking',
            value: 0
        },
        {
            f: 6000,
            type: 'peaking',
            value: 0
        },
        {
            f: 12000,
            type: 'peaking',
            value: 0
        },
        {
            f: 14000,
            type: 'peaking',
            value: 0
        },
        {
            f: 16000,
            type: 'highshelf',
            value: 0
        }])
    }

    connectEQ(preamp_value, eq) {
        // Update preamp
        // If the amp is off 
        this.preampGain = preamp_value / 20
        this.preampNode.gain.value = preamp_value

        // Create filters
        let filters = []

        for (var i = 0;i < eq.length;i++) {
            // Set each band with appropriate value
            let filter = this.device.backend.ac.createBiquadFilter()
    
            filter.type = eq[i].type
            filter.gain.value = eq[i].value
            filter.Q.value = 1
            filter.frequency.value = eq[i].f

            filters.push(filter)
        }

        // Connect filters to wavesurfer
        this.device.backend.setFilters(filters)
    }

    initPreampGainNode() {
        // Create new preamp gainNode
        this.preampNode     = this.device.backend.ac.createGain()
        this.preampNode.gain.value = this.preampGain // limit it to -1 <-> 1

        // Serial connect gains
        this.device.backend.gainNode.connect(this.preampNode)
                                    .connect(this.device.backend.ac.destination)
    }
}

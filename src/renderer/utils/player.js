const ws = require('wavesurfer.js')
const fs = require('fs')

import { getIndexFromKey, removeObject }  from './object'


export default class Player {
    constructor(track, props) {
        this.currentTrack = track
        this.shuffle = props.shuffle // Only used to assert shuffle on when App newly launched
        this.activated = false // Flag for state of player. i.e. newly launched
        this.cleared = false // Flag for detecting whether current playing track was just deleted
        this.playHistory = [] // For storing previously played tracks in shuffle mode
        this.randoms = [] // Shuffled indexes array

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
            interact      : true
        })

        this.device.setVolume(props.volume)
        if (props.mute) this.device.setMute(true)
    }

    activate(currentTrack, pool) {
        this.activated = true

        if (this.shuffle) {
            this.fillRandoms(currentTrack, pool)
        }
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

    getNextRandom(currentTrack, pool) {
        let editedPool = pool
        let index = getIndexFromKey(pool, 'id', currentTrack.id)

        // Register track in history
        // History is limited to last ten tracks (~30 mins playtime)
        // ... assuming each track is ~3 mins long
        if (this.playHistory.length < 10) {
            this.playHistory.push(index)
        } else {
            this.playHistory = [index]
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

    fillRandoms(currentTrack, pool) {
        // Create a properly shuffled pool
        // Exclude playing track, to avoid any collisions
        let tmpPool = removeObject(pool, 'id', currentTrack.id)

        // Durstenfeld Algo
        for (var i = tmpPool.length - 1;i > 0;i--) {
                let j = Math.floor(Math.random() * (i + 1))

                let idx = tmpPool[i]

                tmpPool[i] = tmpPool[j]
                tmpPool[j] = idx
        }

        // Fill randoms with newly created (in place) shuffled indexes
        this.randoms = tmpPool.map((item) => { return pool.indexOf(item) })
    }

    // We don't want indexes from previous 'pools' to persist
    emptyRandoms() { this.randoms = [] }
}

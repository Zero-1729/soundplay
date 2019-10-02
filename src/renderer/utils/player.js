const ws = require('wavesurfer.js')
const fs = require('fs')


export default class Player {
    constructor(track, props) {
        this.currentTrack = track
        this.autoPlays = props.autoplay
        this.oldPool = props.pool // For shuffle/unshuffle

        this.device = new ws.create({
            container: "#waveform",
            fillParent: true,
            scrollParent: false,
            waveColor: props.waveColor,
            progressColor: props.progressColor,
            cursorColor: props.cursorColor,
            pixelRatio    : props.window.devicePixelRatio,
            minPxPerSec   : 20,
            reflection: true,
            height: 25,
            cursorWidth: 1,
            cursorHeight: 0.8,
            hideScrollbar : false,
            volume: props.volume,
            loop: props.loop,
            mute: props.mute,
            audioRate     : 1,
            loopSelection: false,
            normalize     : false,
            audioContext  : null,
            dragSelection : true,
            loopSelection : true,
            interact      : true,
            autoCenter    : true
        })

    setProgressColor(color) {
        this.device.setProgressColor(color)
    }

    setCursorColor(color) {
        this.device.setCursorColor(color)
    }

    setWaveColor(color) {
        this.device.setWaveColor(color)
    }

    clear() {
        this.device.pause()
        this.device.empty()
    }

    updateVolume(val) {
        this.device.setVolume(val)
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

        fs.readFile(path, (err, buffer) => {
            this.device.loadArrayBuffer(buffer.buffer)
        })
    }

    play() {
        this.device.play()
    }

    playpause() {
        this.device.playPause()
    }

    // Audio actions
    mute() {
        this.device.toggleMute()
    }

    shuffle() {}

    unShuffle() {}

    // Looping is handled in 'audioprocess';
    // so if loop single on, when audio is done we reload the same track
    // When it is loopAll, we check the track's current indx in the pool, if it is last, we play first,
    // if not we just leave the track finished, reset current Track
}

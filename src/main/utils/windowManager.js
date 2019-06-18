const fs = require('fs')
const path = require('path')


// Path used for writing state after instantiation
let statePath = null

// Defaults
let defaults = {
    isFullScreen: false,
    windowBounds: {
        x: null,
        y: null,
        width: 1100,
        height: 600
    },
    backgroundColor: '#ffffff'
}

const sync = (args) => {
    fs.writeFileSync(statePath, JSON.stringify(args))
}

const overwrite = (filepath, data) => {
    // This just writes the file if none is present yet (i.e first launch)
    try {
        fs.statSync(filepath)
    } catch (error) {
        sync(data)
    }
}

const loadState = (filepath) => {
    statePath = filepath

    // This way we don't need to worry about the existence of the file
    overwrite(filepath, defaults)

    return JSON.parse(fs.readFileSync(filepath))
}

const init = (filepath) => {
    let loadedState = loadState(path.join(filepath, 'windowState.json'))

    if (loadedState) {
        return {
            isFullScreen: loadedState.isFullScreen,
            windowBounds: loadedState.windowBounds,
            backgroundColor: loadedState.backgroundColor
        }
    }
}

export default { init, sync }

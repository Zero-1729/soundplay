const fs = require('fs')
const path = require('path')


// Path used for writing state after instantiation
let statePath = null

const loadState = (filepath) => {
    statePath = filepath

    try {
        return JSON.parse(fs.readFileSync(filepath))
    } catch (error) {}
}

const init = (filepath) => {
    let loadedState = loadState(path.join(filepath, 'windowState.json'))

    if (loadedState) {
        return {
            isFullScreen: loadedState.isFullScreen,
            windowBounds: loadedState.windowBounds
        }
    } else {
        return null
    }
}

const sync = (args) => {
    fs.writeFileSync(statePath, JSON.stringify(args))
}

export default { init, sync }

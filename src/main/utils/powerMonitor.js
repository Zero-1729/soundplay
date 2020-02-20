const { powerManager } = require('electron')


const action = (state, callback) => {
    powerManager.on(state, callback)
}


export default { action }

const { powerMonitor } = require('electron')


const on = (state, cb) => {
    powerMonitor.on(state, cb)
}


export default { on }

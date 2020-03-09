const fs = require('fs')


const isFile = (path) => {
    // Little fn to check whether a path is a file or not
    // In case it does not exist
    try {
       return fs.statSync(path).isFile()
    } catch (e) {
        return false
    }
}

const Exists = (path) => {
    try {
        fs.statSync(path)
        return true
    } catch (e) {
        return false
    }
}

module.exports = { isFile, Exists }
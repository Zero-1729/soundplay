const fs = require('fs')


const isFile = (path) => {
    // Little fn to check whether a path is a file or not
    return fs.statSync(path).isFile()
}

module.exports = { isFile }
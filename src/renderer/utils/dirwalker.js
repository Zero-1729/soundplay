const path = require('path')
const fs   = require('fs')


export default class FS {
    constructor(dir) {
        // Usually the parent directory to begin walking
        this.parentFolder = dir
    }

    forEachFile(callback, excludes=[]) {
        this.walkTree(this.parentFolder, callback, excludes)
    }

    walkTree(dir, callback, excludes) {
        // get all entires in the directory
        let files = fs.readdirSync(dir)

        // Walk through the current directory and get all files
        for (var i = 0; i < files.length; i++) {
            if (fs.statSync(path.join(dir, files[i])).isFile()) {
                // perform whatever action on the discovered file
                callback(path.join(dir, files[i]))
            } else {
                // check whether we are in an excluded folder
                if (excludes.includes(files[i]
                    .slice(
                        files[i].lastIndexOf('/') + 1,
                        files[i].length
                    )
                )) {
                    // If so then we simply increment the counter;
                    // ... move on
                    i += 1
                } else {
                    // restart the file fetch process in the new directory
                    this.walkTree(path.join(dir, files[i]), callback, excludes)
                }
            }
        }
    }
}

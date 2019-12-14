/*
    Author: Abubakar NK <github.com/Zero-1729>
    License: MIT

    Some utilities for manipulating HashMaps
*/

const buildMap = (k, v) => {
    // Assumes that k.length == v.length
    // Creates a hash map itaratively from an Array of keys 'k' and values 'v'

    if (k.length != v.length) {
        throw '[Err] The function requires length of keys and values to be equal'
    } else {
        let tmp = {}

        for (var i = 0;i < k.length;i++) {
            tmp[k[i]] = v[i]
        }

        return tmp
    }
}

// Returns the deepest value of a nested object
// E.g. if obj = {addr: {port: 8080}} 
//         deepGet(obj, ['addr', 'port']) -> obj.addr.port -> '8080'
const deepGet = (obj, keys) => {
    // If we have exhausted 'keys', we are in the deepest ref
    // So we just return it
    if (keys.length == 0) { return obj }
    
    // Each step we pop the next deepest ref
    return deepGet(obj[keys[0]], keys.slice(1))
}


// Returns the index of an object in an Array
// ... using only the name of some key
//
// i.e  let arr = [{name: 'Foo'}, {name: 'Bar'}]
// getIndexFromKey(arr, 'name', 'Foo') -> 0
const getIndexFromKey = (arr, key, value) => {
    // We sanitize the key
    let keys = key.split('.')

    for (var i = 0;i < arr.length;i++) {
        // Busts in build !
        if (deepGet(arr[i], keys) == value) {
            // lets cut to the chase if a match is immediately found
            return i
        }
    }

    return -1
}

const removeObject = (obj, category, name) => {
    return obj.filter((item) => {
        if (!(item[category] == name)) {
            return true
        }
    })
}

const removeSpecificObject = (obj, category, check) => {
    // Intended for use to delete tracks from a specific year
    // ... removeSpecificObject(store, 'year', 19, {start: 80, end: 89) -> removes all '80s' tracks
    return obj.filter((item) => {
        if (!check(item[category])) { return true }
    })
}

// Obtain item related to a given category; i.e genre
const relatedExists = (list, category, name) => {
    // Returns 'true' if an item exist under a given category (i.e genre)
    // ... with a specific 'name'. Otherwise it returns false
    for (var i = 0;i < list.length;i++) {
        // We cut to the chase as soon as a match is found
        // ... to avoid unnecessary further processing of the `list`
        if (list[i][category] == name) {
            return true
        }
    }

    // If the entire list has been exhausted
    // ... then we know for sure a match doesn't exist
    return false
}

const getRelatedItems = (obj, category, targetCategory, value) => {
    let items = []

    for (var i = 0;i < obj.length;i++) {
        if (obj[i][category] == value) {
            if (items.indexOf(obj[i][targetCategory]) == -1) {
                items.push(obj[i][targetCategory])
            }
        }
    }

    return items
}

module.exports = { buildMap, removeObject, removeSpecificObject, getIndexFromKey, relatedExists, getRelatedItems }

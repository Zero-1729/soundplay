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

// Returns the index of an object in an Array
// ... using only the name of some key
//
// i.e  let arr = [{name: 'Foo'}, {name: 'Bar'}]
// getIndexFromKey(arr, 'name', 'Foo') -> 0
const getIndexFromKey = (arr, key, name) => {
    let index = -1

    for (var i = 0;i < arr.length;i++) {
        if (arr[i][key] == name) {
            index = i
            // lets cur to the chase if a match is immediately found
            return index
        }
    }

    return index
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

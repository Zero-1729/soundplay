/*
    Author: Abubakar NK <github.com/Zero1729>
    License: MIT

    Some utilities for manipulating HashMaps
*/

const buildMap = (k, v) => {
    // Assumes that k.length == v.length
    // Creates a hash map itaratively from an Array of keys 'k' and values 'v'

    if (k.length != v.length) {
        throw '[Err] The function requires length of keys and values to equal'
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

const getRelatedSingleItems = (obj, category, name) => {
    let items = []

    for (var i = 0;i < obj.length;i++) {
        if (obj[i][category] == name) {
            if (items.indexOf(obj[i][category]) == -1) {
                items.push(obj[i])
            }
        }
    }

    return items
}

module.exports = { buildMap, removeObject, getIndexFromKey, getRelatedItems, getRelatedSingleItems }

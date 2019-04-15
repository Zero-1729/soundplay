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
// getIndexFromKey(arr, 'Foo', 'name') -> 0
const getIndexFromKey = (arr, name, key) => {
    let index = -1

    for (var i = 0;i < arr.length;i++) {
        if (arr[i][key] == name) {
            index = i
        }
    }

    return index
}

const removeObject = (obj, name, category) => {
    let index = null

    obj.forEach((item) => {
        if (item[category] == name) {
            index = obj.indexOf(item)
        }
    })

    if (index != null) {
        obj = obj.slice(0, index).concat(obj.slice(index+1))
        return obj
    } else {
        return obj
    }
}

module.exports = { buildMap, removeObject, getIndexFromKey }

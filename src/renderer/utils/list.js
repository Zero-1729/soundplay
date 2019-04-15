/*
    Author: Abubakar NK <github.com/Zero1729>
    License: MIT

    Some utilities for manipulating Arrays
*/

// Fn for Adding unique items to arrays
const add = (list, item, basic=false) => {
    let isDup = false

    for (var i = 0;i < list.length;i++) {
    	if (!basic) {
            if (list[i].source == item.source) {
                isDup = true
            }
        } else {
            if (list[i] == item) {
                isDup = true
            }
        }
    }

    // If we do find a duplicate we simply return an unaltered list
    if (isDup) {
    	return list
    } else {
        // otherwise, we return an altered list with the new item
        return list.concat(item)
    }
}

// Remove an item from an array
const remove = (list, item) => {
    let index = list.indexOf(item)

    if (index) {
        list = list.slice(0, index).concat(list.slice(index+1))
        return list
    } else {
        return list
    }
}

// Obtain tracks related to a given category; i.e genre
const related = (list, category, name) => {
    // Returns all tracks with the category (i.e genre) 'name'
    return list.filter((track) => {
        return track[category] == name
    }).length
}

// Replaces an item in an Array with another item
//
// i.e let arr = ['foo', 'bar']
//     replaceItem(arr, 'foo', 'oof') -> ['oof', 'bar']
const replaceItem = (arr, old, current) => {
    let index = arr[old]

    return arr.slice(0, index).concat(current).concat(arr.slice(index+1))
}

module.exports = { add, remove, related, replaceItem }

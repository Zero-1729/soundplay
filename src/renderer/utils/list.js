/*
    Author: Abubakar NK <github.com/Zero-1729>
    License: MIT

    Some utilities for manipulating Arrays
*/

// Fn for Adding unique items to arrays
const add = (list, item, basic=false) => {
    for (var i = 0;i < list.length;i++) {
    	if (!basic) {
            if (list[i].id == item.id) {
                return list
            }
        } else {
            if (list[i] == item) {
                return list
            }
        }
    }

    // otherwise, we return an altered list with the new item
    return list.concat(item)
}

// Remove an item from an array
const remove = (list, item) => {
    return list.filter((entry) => {
        if (entry != item) {
            return true
        }
    })
}

// Replaces an item in an Array with another item
//
// i.e let arr = ['foo', 'bar']
//     replaceItem(arr, 'foo', 'oof') -> ['oof', 'bar']
const replaceItem = (arr, old, current) => {
    let index = arr[old]

    // If the index is the first item then we slice
    // ... ahead of it
    return index == 0 ? arr.slice(1) : arr.slice(0, index).concat(current).concat(arr.slice(index+1))
}

module.exports = { add, remove, replaceItem }

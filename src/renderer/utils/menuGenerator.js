// Dynamically generates an Electron submenu
const generateMenu = (items, fn) => {
    let menu = []

    for (var i = 0;i < items.length;i++) {
        menu.push({
            label: items[i].name,
            click: fn(items[i])
        })
    }

    return menu
}


module.exports = { generateMenu }

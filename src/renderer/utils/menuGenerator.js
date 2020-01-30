// Dynamically generates an Electron submenu
const generateMenu = (items, fn, currentPlaylistName) => {
    let menu = []

    for (var i = 0;i < items.length;i++) {
        menu.push({
            label: items[i].name,
            click: fn(items[i]),
            enabled: items[i].name !== currentPlaylistName
        })
    }

    return menu
}


module.exports = { generateMenu }

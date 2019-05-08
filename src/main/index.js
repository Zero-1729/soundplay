import {
        app,
        BrowserWindow,
        nativeImage,
        Menu,
        shell
    } from 'electron'

import '../renderer/store'

const path = require('path')

// App version
// Note: Should match 'package.json'
const APP_VERSION = 'v.0.2.0-a'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const rootPath = path.join(__dirname) // root Path

// Static logos dir
const logosPath = path.join(rootPath, 'static', 'icons')

// Constant to store specific icon sizes and their locations
const Icons = {
    '256'       :  nativeImage.createFromPath(path.join(logosPath, 'app_icon_black@256x256.png')),
    '128'       :  nativeImage.createFromPath(path.join(logosPath, 'app_icon_black@128x128.png')),
    '64'        :  nativeImage.createFromPath(path.join(logosPath, 'app_icon_black@64x64.png')),
    '48'        :  nativeImage.createFromPath(path.join(logosPath, 'app_icon_black@48x48.png')),
    '32'        :  nativeImage.createFromPath(path.join(logosPath, 'app_icon_black@32x32.png')),
    'ico'       :  nativeImage.createFromPath(path.join(logosPath, 'app_icon_black@256x256.ico')),
    'tray'      :  nativeImage.createFromPath(path.join(logosPath, 'app_icon_black@tray.png')),
    'tray-ico'  :  nativeImage.createFromPath(path.join(logosPath, 'app_icon_black@256x256.ico')),
}


let mainWindow
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080`
: `file://${__dirname}/index.html`

function createWindow () {
    /**
    * Initial window options
    */

    mainWindow = new BrowserWindow({
        minHeight: 550,
        height: 600,
        useContentSize: true,
        minWidth: 1060,
        width: 1100,
        center: true,
        icon: process.platform == 'win' ? Icons['ico'] : Icons['tray']
    })

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Create Playlist',
                click() {
                    mainWindow.webContents.send('create-playlist', null)
                },
                accelerator: 'CmdOrCtrl+N'
            },
            {
                type: 'separator'
            },
            {
                label: 'Import Tracks...',
                click() {
                    mainWindow.webContents.send('import-tracks', null)
                },
                accelerator: 'CmdOrCtrl+O'
            },
            {
                label: 'Import Folder...',
                click() {
                    mainWindow.webContents.send('import-folder', null)
                },
                accelerator: 'CmdOrCtrl+Shift+O'
            },
            {
                type: 'separator'
            },
            {
                label: 'Preferences',
                click() {
                    mainWindow.webContents.send('toggle-settings', null)
                },
                accelerator: 'CmdOrCtrl+,'
            },
            {
                type: 'separator'
            },
            {
                role: 'quit'
            }
        ]
    },
    {
        label: 'view',
        submenu: [
            {
                role: 'reload'
            },
            {
                role: 'forcereload'
            },
            {
                type: 'separator'
            },
            {
                role: 'toggledevtools'
            },
            {
                type: 'separator'
            },
            {
                label: 'Toggle Night Mode',
                click() {
                    mainWindow.webContents.send('toggle-night-mode', null)
                },
                accelerator: 'CmdOrCtrl+Shift+M'
            }
        ]
    },
    {
        label: 'window',
        submenu: [
            {
                role: 'minimize'
            },
            {
                type: 'separator'
            },
            {
                role: 'togglefullscreen'
            }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'About Soundplay',
                click() {
                    shell.openExternal('https://github.com/zero-1729/soundplay')
                }
            },
            {
                label: `Version ${APP_VERSION} (64-bit)`,
                enabled: false
            }
        ]
    }
]

if (process.platform == 'darwin') {
    template.unshift(
        {
            label: app.getName(),
            submenu: [
                {
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'services'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        }
    )

    // Edit
    template[1].submenu.push(
        {
            type: 'separator'
        },
        {
            role: 'startspeaking'
        },
        {
            role: 'stopspeaking'
        }
    )

    // Window
    template[3].submenu.push(
        {
            label: 'Minimize',
            role: 'minimize'
        },
        {
            type: 'separator'
        },
        {
            label: 'Bring All to Front',
            role: 'front'
        },
        {
            type: 'separator'
        },
        {
            label: 'Close',
            role: 'close'
        }
    )
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall()
})

app.on('ready', () => {
    if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

import {
        app,
        BrowserWindow,
        nativeImage,
        Menu,
        shell,
        ipcMain
    } from 'electron'

const WindowManager = require('./utils/windowManager').default

const { add } = require('./../renderer/utils/list')

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
    global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const rootPath = path.join(__dirname) // root Path

// Static logos dir
const logosPath = path.join(rootPath, 'static', 'icons')

// Constant to store specific icon sizes and their locations
const Icons = {
    '256'       :  nativeImage.createFromPath(path.join(logosPath, 'icon_256x256.png')),
    '128'       :  nativeImage.createFromPath(path.join(logosPath, 'icon_128x128.png')),
    '64'        :  nativeImage.createFromPath(path.join(logosPath, 'icon_64x64.png')),
    '48'        :  nativeImage.createFromPath(path.join(logosPath, 'icon_48x48.png')),
    '32'        :  nativeImage.createFromPath(path.join(logosPath, 'icon_32x32.png')),
    'ico'       :  nativeImage.createFromPath(path.join(logosPath, 'icon_256x256.ico')),
    'tray-mac'  :  nativeImage.createFromPath(path.join(logosPath, 'icon-tray-mac.png')),
    'tray-win'  :  nativeImage.createFromPath(path.join(logosPath, 'icon-tray.ico'))
}

const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080`
: `file://${__dirname}/index.html`

// args provided during startup
var startup_args = process.env.NODE_ENV != 'development' ? process.argv.slice(1) : []

var mainWindow = null

// Instantiate window manager state
const windowState = WindowManager.init(app.getPath('userData'))

// Array for storing dropped files when new window triggered
var openFiles = []

app.on('open-file', (event, arg) => {
    event.preventDefault()

    // Add trigger file
    openFiles = add(openFiles, arg, true)

    // MainWindow is a 'BrowserWindow' here so we directly call 'webContents' to send the dropped items
    if (mainWindow != null) {
        // Push only 'openFiles' since 'arg is pushed'
        mainWindow.webContents.send('ack-startup-process-args', { startup_args: startup_args, files: openFiles })
    } else {
        // If the window was closed we launch a new one to include the dropped item(s)
        if (app.isReady()) createWindow()
    }
})

function createWindow () {
    /**
    * Initial window options
    */

    mainWindow = new BrowserWindow({
        minHeight: 550,
        height: windowState ? windowState.windowBounds.height : 600,
        useContentSize: true,
        minWidth: 1060,
        width: windowState ? windowState.windowBounds.width : 1100,
        fullScreen: windowState ? windowState.isFullScreen : false,
        x: windowState ? windowState.windowBounds.x : null,
        y: windowState ? windowState.windowBounds.y : null,
        titleBarStyle: 'hiddenInset',
        icon: process.platform == 'win' ? Icons['ico'] : Icons['256'],
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    ipcMain.on('clear-open-files', (event, arg) => {
        // Clear open files
        openFiles = []
    })

    // Check whether file path specified, if so we send it over to our render for processing
    ipcMain.on('request-startup-process-args', (event, args) => {
        event.sender.send('ack-startup-process-args', { startup_args: startup_args, trigger_files: openFiles })

        // Reset startup files
        startup_args = []

        // Reset Open files
        openFiles = []
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    // This ensures the state is always saved after each window is closed
    WindowManager.sync({
        isFullScreen: mainWindow.isFullScreen(),
        windowBounds: mainWindow.getBounds()
    })

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('quit', () => {
    // We nned to know whether our window is still available for state query first
    if (mainWindow) {
        // Window state still needs to be updated to the latest state before the session ended
        WindowManager.sync({
            isFullScreen: mainWindow.isFullScreen(),
            windowBounds: mainWindow.getBounds()
        })
    }
})

app.on('activate', () => {
    // We simply re-instantiate another window if dock icon clicked
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
                label: 'Toggle Developer Tools',
                accelerator: 'Alt+CmdOrCtrl+I',
                click() {
                    mainWindow.webContents.openDevTools({ mode: 'detach' })
                }
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
                role: 'togglefullscreen'
            },
            {
                type: 'separator'
            },
            {
                role: 'minimize'
            },
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'About ' + app.getName(),
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
                    label: 'About ' + app.getName(),
                    click() {
                        shell.openExternal('https://github.com/zero-1729/soundplay')
                    }
                },
                {
                    label: `Version ${APP_VERSION} (64-bit)`,
                    enabled: false
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

    // Window
    template[3].submenu.push(
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

// Clear redundant entries
template[1].submenu = template[1].submenu.slice(0, 4)

// Add 'Edit' menu item to allow 'Copy/Paste'
template.splice(2, 0,
    {
        label: 'Edit',
        submenu: [{
            label: 'Undo',
            accelerator: 'CmdOrCtrl+Z',
            selector: 'undo:'
        },
        {
            label: 'Redo',
            accelerator: 'Shift+CmdOrCtrl+Z',
            selector: 'redo:'
        },
        {
            type: 'separator'
        },
        {
            label: 'Cut',
            accelerator: 'CmdOrCtrl+X',
            selector: 'cut:'
        },
        {
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            selector: 'copy:'
        },
        {
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            selector: 'paste:'
        },
        {
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            selector: 'selectAll:'
        }]
    }
)

// Edit the last menu entry 'Help'
template[template.length - 1].submenu = [
    {
        label: 'Documentation',
        click() {
            shell.openExternal('https://github.com/Zero-1729/soundplay#docs.md')
        }
    },
    {
        type: 'separator'
    },
    {
        label: 'Follow Us on Twitter',
        click() {
            shell.openExternal('https://twitter.com/Soundplay')
        }
    }
]

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

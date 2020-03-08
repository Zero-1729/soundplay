import {
        app,
        BrowserWindow,
        nativeImage,
        globalShortcut,
        Menu,
        shell,
        ipcMain,
        autoUpdater
    } from 'electron'

const WindowManager = require('./utils/windowManager').default

const { add, removePattern } = require('./../renderer/utils/list')

import '../renderer/store'

const path = require('path')

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
    'ico'       :  nativeImage.createFromPath(path.join(logosPath, 'icon_256x256.ico'))
}

const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080`
: `file://${__dirname}/index.html`

// args provided during startup
var startup_args = process.env.NODE_ENV != 'development' ? 
                    removePattern(process.argv.slice(1), new RegExp(/-psn_.+/)) : []

var mainWindow = null

// Instantiate window manager state
const windowState = WindowManager.init(app.getPath('userData'))

// Array for storing dropped files when new window triggered
var openFiles = []

// For storing the current background color of the app's theme
var windowBackgroundColor = windowState.backgroundColor

app.on('open-file', (event, arg) => {
    event.preventDefault()

    // Add trigger file
    openFiles = add(openFiles, arg)

    // MainWindow is a 'BrowserWindow' here so we directly call 'webContents' to send the dropped items
    if (mainWindow != null) {
        let tmp_open_files = openFiles

        // Clear just `openFiles` to avoid sending over residual items
        // ... We do it before the `mainWindow.webContents.send`
        // ... and send a copy (of `openFiles`) over to the render
        openFiles = []

        // Push only 'openFiles' since 'arg is pushed'
        mainWindow.webContents.send('ack-startup-process-args', { startup_args: startup_args, trigger_files: tmp_open_files })
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
        minHeight: 680,
        height: windowState.windowBounds.height,
        useContentSize: true,
        minWidth: 1170,
        width: windowState.windowBounds.width,
        fullScreen: windowState.isFullScreen,
        x: windowState.windowBounds.x,
        y: windowState.windowBounds.y,
        backgroundColor: windowState.backgroundColor,
        titleBarStyle: 'hiddenInset',
        icon: process.platform == 'win32' ? Icons['ico'] : Icons['256'],
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadURL(winURL)

    // Full screen detection
    mainWindow.on('enter-full-screen', () => {
        mainWindow.webContents.send('enter-full-screen')
    })

    mainWindow.on('leave-full-screen', () => {
        mainWindow.webContents.send('leave-full-screen')
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    ipcMain.on('clear-open-files', () => {
        // Clear open files
        openFiles = []
    })

    // Check whether file path specified, if so we send it over to our render for processing
    ipcMain.on('request-startup-process-args', (event) => {
        event.sender.send('ack-startup-process-args', { startup_args: startup_args, trigger_files: openFiles })

        // Reset startup files
        startup_args = []

        // Reset Open files
        openFiles = []
    })

    // For syncing window bckground color
    ipcMain.on('sync-background-color', (event, arg) => {
        // Keep track of the windows background color so we can save it after the session
        windowBackgroundColor = arg

        // Reset the window background color to match theme
        mainWindow.setBackgroundColor(arg)
    })

    // Register Media key shortcuts
    const mpp = globalShortcut.register('MediaPlayPause', () => {
        mainWindow.webContents.send('media-playpause', null)
    })

    const mp = globalShortcut.register('MediaPreviousTrack', () => {
        mainWindow.webContents.send('media-prev', null)
    })

    const mn = globalShortcut.register('MediaNextTrack', () => {
        mainWindow.webContents.send('media-next', null)
    })

    if (!(mpp || mp || mn)) { console.log('Media keys registration failed') }
}

app.on('ready', createWindow)

// About panel info
app.setAboutPanelOptions({
    applicationName: "Soundplay",
    applicationVersion: app.getVersion(),
    copyright: "Copyright © 2020 Zero-1729",
    version: "Alpha",
    credits: "Special thanks to all users/devs that continue contribute, test, and provide feedback",
    authors: 'Zero-1729',
    website: "https://github.com/Zero-1729/soundplay",
    iconPath: path.join(logosPath, 'icon_256x256.png')
})

app.on('window-all-closed', () => {
    // This ensures the state is always saved after each window is closed
    WindowManager.sync({
        isFullScreen: mainWindow.isFullScreen(),
        windowBounds: mainWindow.getBounds(),
        backgroundColor: windowBackgroundColor
    })

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('will-quit', () => {
    globalShortcut.unregisterAll()
})

app.on('quit', () => {
    // We nned to know whether our window is still available for state query first
    if (mainWindow) {
        // Window state still needs to be updated to the latest state before the session ended
        WindowManager.sync({
            isFullScreen: mainWindow.isFullScreen(),
            windowBounds: mainWindow.getBounds(),
            backgroundColor: windowBackgroundColor
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
                label: 'About ' + app.name,
                click() {
                    app.showAboutPanel()
                }
            },
            {
                label: `Version ${app.getVersion()} (64-bit)`,
                enabled: false
            },
            {
                label: 'Check for Updates...',
                click() {
                    // autoUpdater.checkForUpdates()
                }
            },
            {
                type: 'separator'
            },
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
                label: 'Import Track(s)...',
                click() {
                    mainWindow.webContents.send('import-tracks', null)
                },
                accelerator: 'CmdOrCtrl+O'
            },
            {
                label: 'Import Folder(s)...',
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
    },
    {
        label: 'Playback',
        submenu: [
            {
                label: 'Play/Pause',
                accelerator: 'CmdOrCtrl+P',
                click() {
                    mainWindow.webContents.send('media-playpause', null)
                },
            },
            {
                type: 'separator'
            },
            {
                label: 'Previous',
                accelerator: 'CmdOrCtrl+left',
                click() {
                    mainWindow.webContents.send('media-prev', null)
                }
            },
            {
                label: 'Next',
                accelerator: 'CmdOrCtrl+right',
                click() {
                    mainWindow.webContents.send('media-next', null)
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Toogle Shuffle',
                accelerator: 'CmdOrCtrl+Shift+Z',
                click() {
                    mainWindow.webContents.send('toggle-shuffle', null)
                }
            },
            {
                label: 'Toggle Loop Single',
                accelerator: 'CmdOrCtrl+L',
                click() {
                    mainWindow.webContents.send('toggle-loop', 'single')
                }
            },
            {
                label: 'Toggle Loop All',
                accelerator: 'CmdOrCtrl+Shift+L',
                click() {
                    mainWindow.webContents.send('toggle-loop', 'all')
                }
            }
        ]
    },
    {
        label: 'Audio',
        submenu: [
            {
                label: 'Mute',
                accelerator: 'CmdOrCtrl+Alt+M',
                click() {
                    mainWindow.webContents.send('toggle-mute', null)
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Volume Up',
                accelerator: 'CmdOrCtrl+=',
                click() {
                    mainWindow.webContents.send('volume', 1)
                }
            },
            {
                label: 'Volume Down',
                accelerator: 'CmdOrCtrl+-',
                click() {
                    mainWindow.webContents.send('volume', -1)
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Toggle EQ',
                accelerator: 'CmdOrCtrl+Shift+E',
                click() {
                    mainWindow.webContents.send('toggle-eq', null)
                }
            }
        ]
    },
    {
        label: 'View',
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
                label: 'Search',
                accelerator: 'CmdOrCtrl+F',
                click() {
                    mainWindow.webContents.send('focus-search', null)
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Show Playing Track',
                accelerator: 'Shift+CmdOrCtrl+S',
                click() {
                    mainWindow.webContents.send('focus-playing-track')
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
        label: 'Window',
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
                label: 'Documentation',
                click() {
                    shell.openExternal('https://github.com/Zero-1729/soundplay/blob/master/docs/Dev%20Handbook.md')
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Report Bug',
                click() {
                    shell.openExternal('https://github.com/Zero-1729/soundplay/issues')
                }
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
            }
        ]
    }
]

if (process.platform == 'darwin') {
    template.unshift(
        {
            label: app.name,
            submenu: [
                template[0].submenu[0],
                template[0].submenu[1],
                template[0].submenu[2],
                template[0].submenu[3],
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
    template[6].submenu.push(
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

    // Clear redundant entries
    template[1].submenu = template[1].submenu.slice(4, 8)

    // Edit the last menu entry 'Help'
    template[template.length - 1].submenu = [
        {
            label: 'Documentation',
            click() {
                shell.openExternal('https://github.com/Zero-1729/soundplay/blob/master/docs/Dev%20Handbook.md')
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Report Bug',
            click() {
                shell.openExternal('https://github.com/Zero-1729/soundplay/issues')
            }
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
        }
    ]
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

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall()
})

app.on('ready', () => {
    if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

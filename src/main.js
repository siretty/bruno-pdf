const {app, BrowserWindow, ipcMain} = require('electron');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const fs = require('node:fs')
const path = require('node:path');
const process = require('node:process')
const util = require('node:util')

let argv = null

if (app.isPackaged) {
    argv = process.argv.slice(1);
} else {
    argv = process.argv.slice(2);
}

const args = util.parseArgs({
    args: argv,
    options: {
        fullscreen: { type: 'boolean', default: false },
        'pdf-file': { type: 'string' },
        // ignore squirrel arguments (used during setup)
        'squirrel-install': { type: 'string' },
        'squirrel-firstrun': { type: 'boolean', default: false },
        'squirrel-updated': { type: 'string' },
        'squirrel-obsolete': { type: 'string' },
        'squirrel-uninstall': { type: 'string' },
    },
    strict: true,
    allowNegative: false,
    allowPositionals: false,
})

const argFullscreen = args.values.fullscreen
const argPdfFile = args.values['pdf-file']

if (!argPdfFile) {
    console.log('path to pdf file missing')
    process.exit(1)
}

const pdfFilePath = path.resolve(argPdfFile)

if (!fs.existsSync(pdfFilePath)) {
    console.log('pdf file path does not exist')
    process.exit(1)
}

console.log('pdf file path', pdfFilePath)

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        fullscreen: argFullscreen,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    mainWindow.setMenu(null)

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('show', () => {
        console.log('main window shown, loading pdf')

        fs.readFile(pdfFilePath, null, (err, data) => {
            if (err !== null) {
                console.log('failed to read pdf:', err)
                return
            }

            console.log('sending', data.length, 'bytes')
            mainWindow.webContents.send('pdf-data', data);
        })
    })

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

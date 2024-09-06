const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const fs = require('node:fs')
const process = require('node:process')

let pdfFilePath = null

if (app.isPackaged) {
    pdfFilePath = process.argv[1];
} else {
    pdfFilePath = process.argv[2];
}

if (!pdfFilePath) {
    console.log('path to pdf file missing')
    process.exit(1)
}

console.log('pdf file path', pdfFilePath)

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        fullscreen: true,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

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

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
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

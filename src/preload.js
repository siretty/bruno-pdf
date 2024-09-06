// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('api', {
    onPdfData: (callback) => ipcRenderer.on('pdf-data', (_event, data) => {
        callback(data)
    }),
})
/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

const pdfjs = require('pdfjs-dist')
pdfjs.GlobalWorkerOptions.workerSrc = "../pdfjs-worker/index.js";

let pdfDocument = null
let renderPdfTimeout = null

window.api.onPdfData(async (data) => {
    console.log('onPdfData');
    pdfDocument = await pdfjs.getDocument(data).promise
    setRenderPdfTimeout()
})

window.onresize = () => {
    console.log('onresize')
    setRenderPdfTimeout()
}

function setRenderPdfTimeout() {
    if (renderPdfTimeout !== null) {
        console.log('cleared')
        clearTimeout(renderPdfTimeout)
        renderPdfTimeout = null
    }

    console.log('set')
    renderPdfTimeout = setTimeout(async () => {
        renderPdfTimeout = null
        await onRenderPdfTimeout()
    }, 1000)
}

async function onRenderPdfTimeout() {
    if (pdfDocument === null) {
        console.log('no document available')
        return
    }

    console.log('rendering pdf');

    console.log('pdf page count', pdfDocument.numPages)

    console.log('window inner width', window.innerWidth)
    const desiredWidth = window.innerWidth

    const colDiv = document.getElementById('col')
    colDiv.textContent = ''

    const renderTasks = []
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        const pdfPage = await pdfDocument.getPage(pageNumber)

        const unscaledViewport = pdfPage.getViewport({scale: 1.0})

        const scale = desiredWidth / unscaledViewport.width
        const viewport = pdfPage.getViewport({scale})

        const canvas = document.createElement("canvas");
        canvas.id = "page-" + pageNumber
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const rowDiv = document.createElement('div')
        rowDiv.className = 'row'
        rowDiv.appendChild(canvas)

        colDiv.appendChild(rowDiv);

        const canvasContext = canvas.getContext("2d");
        const renderTask = pdfPage.render({
            canvasContext,
            viewport,
        })

        renderTasks.push(renderTask)
    }

    await Promise.all(renderTasks)
}

console.log('👋 This message is being logged by "renderer.js", included via webpack');
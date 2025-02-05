const electron = require('electron')
const api = require("./api");
const fs = require('fs')
const path = require("path");

let data = [];
let mainWin = null;

fs.readFile('./cards.json', (err, dataStr) => {
    if (!err) {
        data = JSON.parse(dataStr.toString());
    }
})

electron.app.whenReady().then(() => {
    mainWin = new electron.BrowserWindow({
        width: 1500,
        height: 850,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'api.bridge.js')
        }
    })

    mainWin.loadFile('./index.html').then(() => {
        if (mainWin) {
            mainWin.webContents.send('api','list', JSON.stringify(data))
        }
    })
})

api('save', (e,cardDataStr) => {
    const cardData = JSON.parse(cardDataStr)
    for (const card of data) {
        if (card.name === cardData.name) {
            data[data.indexOf(card)] = cardData;
            fs.writeFileSync('./cards.json', JSON.stringify(data));
            mainWin.webContents.send('api','list', JSON.stringify(data))
            return;
        }
    }
    data.push(cardData)
    fs.writeFileSync('./cards.json', JSON.stringify(data));
    mainWin.webContents.send('api','list', JSON.stringify(data))
})

api('get', (event, name) => {
    for (const card of data) {
        if (card.name === name) {
            event.sender.send('api','get', JSON.stringify(card))
            return JSON.stringify(card);
        }
    }
})



const {ipcMain} = require('electron')

const apiList = [];

module.exports = (name, cb) => {
    apiList.push({
        name: name,
        callback: cb
    })
}

ipcMain.on('api', (event, command, data) => {
    for (const api of apiList) {
        if (command === api.name) {
            api.callback(event, data)
            return;
        }
    }
})
ipcMain.handle('api', (event, command, data) => {
    for (const api of apiList) {
        if (command === api.name) {
            return api.callback(event, data)
        }
    }
})

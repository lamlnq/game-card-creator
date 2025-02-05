const electron = require("electron");


electron.contextBridge.exposeInMainWorld(
    // Allowed 'ipcRenderer' methods.
    'api', {
        // From render to main.
        send: (command, ...data) => {
            electron.ipcRenderer.send('api', command, ...data);
        },
        // From main to render.
        receive: (command, listener) => {
            electron.ipcRenderer.on('api', (event, cmd, ...data) => {
                if (cmd === command) {
                    listener(...data)
                }
            });
        },
        // From render to main and back again.
        invoke: (command, data) => {
            return electron.ipcRenderer.invoke('api', command, ...data);
        }
    }
);


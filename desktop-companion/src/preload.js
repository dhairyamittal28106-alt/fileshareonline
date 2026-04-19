const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopCompanion', {
  onJobQueued(callback) {
    ipcRenderer.on('job:queued', (_event, payload) => callback(payload));
  },
});

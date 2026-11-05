const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('store', {
  load: () => ipcRenderer.sendSync('load'),
  save: d => ipcRenderer.send('save', d),
  qr: u => ipcRenderer.invoke('qr', u),
  publish: d => ipcRenderer.invoke('publish', d)
});

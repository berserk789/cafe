const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

const file = () => path.join(app.getPath('userData'), 'data.json');

ipcMain.on('load', e => {
  let r = {};
  try { r = JSON.parse(fs.readFileSync(file(), 'utf8')); }
  catch (_) { try { r = JSON.parse(fs.readFileSync(file() + '.bak', 'utf8')); } catch (__) {} }
  e.returnValue = r;
});

ipcMain.on('save', (e, d) => {
  try {
    const f = file(), t = f + '.tmp';
    fs.writeFileSync(t, JSON.stringify(d));
    if (fs.existsSync(f)) fs.copyFileSync(f, f + '.bak');
    fs.renameSync(t, f);
  } catch (_) {}
});

ipcMain.handle('qr', (e, u) => QRCode.toDataURL(u, { width: 600, margin: 2 }));

ipcMain.handle('publish', async (e, c) => {
  try {
    const url = `https://api.github.com/repos/${c.user}/${c.repo}/contents/menu.json`;
    const h = { Authorization: `Bearer ${c.token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cafe' };
    let sha;
    const g = await fetch(url, { headers: h });
    if (g.ok) sha = (await g.json()).sha;
    const r = await fetch(url, {
      method: 'PUT', headers: h,
      body: JSON.stringify({ message: 'menu', content: Buffer.from(JSON.stringify(c.menu)).toString('base64'), sha })
    });
    return r.ok;
  } catch (_) { return false; }
});

function createWindow() {
  Menu.setApplicationMenu(null);
  const w = new BrowserWindow({
    width: 1100, height: 800, autoHideMenuBar: true, title: 'کافه',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  w.loadFile('index.html');
}

if (!app.requestSingleInstanceLock()) app.quit();
else app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

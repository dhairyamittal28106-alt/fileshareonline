const { app, BrowserWindow } = require('electron');
const http = require('node:http');

const PORT = 45721;
const shareJobs = [];
let mainWindow = null;

function sendToRenderer(channel, payload) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.webContents.send(channel, payload);
}

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json',
  });

  res.end(JSON.stringify(payload));
}

function createBridgeServer() {
  return http.createServer((req, res) => {
    if (!req.url) {
      return jsonResponse(res, 404, { error: 'Not found' });
    }

    if (req.method === 'OPTIONS') {
      return jsonResponse(res, 204, {});
    }

    if (req.method === 'GET' && req.url === '/health') {
      return jsonResponse(res, 200, { ok: true, app: 'pdfshareonline-desktop-companion' });
    }

    if (req.method === 'GET' && req.url === '/jobs') {
      return jsonResponse(res, 200, { jobs: shareJobs.slice().reverse() });
    }

    if (req.method === 'POST' && req.url === '/share') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const job = {
            id: `job-${Date.now()}`,
            kind: payload.kind === 'text' ? 'text' : 'file',
            token: String(payload.token || ''),
            shareUrl: String(payload.shareUrl || ''),
            createdAt: Date.now(),
            status: 'queued',
          };

          shareJobs.push(job);
          while (shareJobs.length > 20) {
            shareJobs.shift();
          }

          sendToRenderer('job:queued', job);
          return jsonResponse(res, 200, { ok: true, job });
        } catch (error) {
          console.error(error);
          return jsonResponse(res, 400, { error: 'Invalid payload' });
        }
      });

      return;
    }

    return jsonResponse(res, 404, { error: 'Not found' });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 880,
    minHeight: 620,
    autoHideMenuBar: true,
    webPreferences: {
      preload: require('node:path').join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(require('node:path').join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  const server = createBridgeServer();
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Bluetooth companion bridge listening on http://127.0.0.1:${PORT}`);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

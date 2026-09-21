'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
function createServer() {
  return http.createServer((req, res) => {
    let file;
    try { file = path.resolve(__dirname, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
    catch { res.writeHead(400); res.end(); return; }
    if (file === __dirname) file = path.join(file, 'index.html');
    if (!file.startsWith(__dirname + path.sep)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (error, data) => { if (error) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(data); });
  });
}
if (require.main === module) createServer().listen(4173, '127.0.0.1', () => console.log('THE FIRM: http://127.0.0.1:4173'));
module.exports = { createServer };

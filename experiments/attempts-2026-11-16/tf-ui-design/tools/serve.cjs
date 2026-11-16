'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../../..');
http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(pathname==='/favicon.ico'){res.writeHead(204);return res.end()}
 let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found')}
 const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webm':'video/webm'};
 res.setHeader('Content-Type',mime[path.extname(file)]||'text/plain; charset=utf-8');fs.createReadStream(file).pipe(res);
}).listen(4185,'127.0.0.1',()=>console.log('TF-UI-001 preview: http://127.0.0.1:4185/docs/sprints/TF-UI-001/'));

import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.mp4':'video/mp4','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain'};
function build(){execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});execFileSync(process.execPath,['scripts/check.mjs'],{stdio:'inherit'});}
build();
createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/'||pathname==='/en/')build();
    let path=resolve(root,'.'+pathname);
    if(!path.startsWith(root+'/')&&path!==root){res.writeHead(403).end();return;}
    if((await stat(path)).isDirectory())path+='/index.html';
    const data=await readFile(path);
    res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/html'}).end(await readFile(root+'/404.html'));}
}).listen(3000,'127.0.0.1',()=>console.log('Preview: http://localhost:3000 — refresh after edits.'));

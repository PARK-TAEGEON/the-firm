'use strict';
// Normalize only new sprint text artifacts, never baseline game files.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');let changed=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){walk(file);continue}if(!/\.(md|json|html|css|js|cjs|ps1|log)$/.test(file)&&entry.name!=='.gitattributes')continue;const b=fs.readFileSync(file);let s=b[0]===255&&b[1]===254?b.subarray(2).toString('utf16le'):b.toString('utf8');s=s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/[ \t]+$/gm,'').trimEnd()+'\n';const next=Buffer.from(s);if(!b.equals(next)){fs.writeFileSync(file,next);changed++}}}
walk(root);console.log('Sprint text normalized: '+changed);

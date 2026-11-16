'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const out=path.resolve(__dirname,'..');
const sum=x=>crypto.createHash('sha256').update(x).digest('hex');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://127.0.0.1:4185/docs/sprints/TF-UI-001/');
 await page.waitForFunction(()=>Number.isFinite(document.querySelector('video').duration));
 const duration=await page.locator('video').evaluate(v=>v.duration);
 if(duration<60||duration>90)throw Error('Tour duration out of contract: '+duration);
 await page.screenshot({path:path.join(out,'evidence/comparison-1440.png'),fullPage:true});
 await page.locator('.choices').screenshot({path:path.join(out,'evidence/comparison-preview.png')});
 await page.locator('video').evaluate(async v=>{v.currentTime=40;await v.play()});await page.waitForTimeout(600);await page.locator('video').evaluate(v=>v.pause());
 await page.locator('video').screenshot({path:path.join(out,'evidence/tour-playback-check.png')});
 const playback=await page.locator('video').evaluate(v=>({duration:v.duration,currentTime:v.currentTime,readyState:v.readyState,videoWidth:v.videoWidth,videoHeight:v.videoHeight,error:v.error?.message||null}));
 if(playback.error||playback.videoWidth!==1280||playback.videoHeight!==720)throw Error('Video playback invalid');
 for(const [width,height] of [[1280,720],[390,844]]){await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4185/docs/sprints/TF-UI-001/');if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))throw Error('Comparison overflow '+width)}
 await browser.close();
 fs.writeFileSync(path.join(out,'evidence/video-metadata.json'),JSON.stringify({durationSeconds:duration,playback,comparisonWidths:[1440,1280,390]},null,2)+'\n');
 const names=['.gitattributes','index.html','mockup.js','styles.css','fixture.js','tokens.json','components.html','DESIGN-SYSTEM.md','IA.md','BASELINE.md','RULES.md','evidence/design-tour.webm','evidence/comparison-preview.png'];
 for(const v of ['A','B','C'])for(const f of fs.readdirSync(path.join(out,'variants',v)))names.push('variants/'+v+'/'+f);
 for(const f of fs.readdirSync(path.join(out,'evidence')))if(/^(components|editing)-.*\.png$/.test(f))names.push('evidence/'+f);
 const files=names.sort().map(file=>({path:file,sha256:sum(fs.readFileSync(path.join(out,file)))}));
 const digest=sum(files.map(f=>f.path+' '+f.sha256+'\n').join(''));
 fs.writeFileSync(path.join(out,'evidence/artifact-manifest.json'),JSON.stringify({version:'1.0.0',baseline:'d6fa4a303691f60eedf79b829780f443f915e245',algorithm:'SHA-256',digest,files},null,2)+'\n');
 console.log(JSON.stringify({durationSeconds:duration,artifactFiles:files.length,digest}));
})();

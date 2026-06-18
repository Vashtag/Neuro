import puppeteer from 'puppeteer';
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-gpu','--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage(); await p.setViewport({width:980,height:680});
const errs=[]; p.on('pageerror',e=>errs.push('PAGE:'+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await p.goto('http://localhost:4173/neuro/',{waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,2500));
await p.evaluate(()=>{localStorage.clear();});
const probe=async()=>p.evaluate(()=>window.__NEURO_PROBE__);
const E=async()=>{await p.keyboard.down('KeyE');await new Promise(r=>setTimeout(r,80));await p.keyboard.up('KeyE');await new Promise(r=>setTimeout(r,230));};
const tp=async(x,y)=>{await p.evaluate((a,b)=>window.__NEURO_DEBUG__.teleport(a,b),x,y);await new Promise(r=>setTimeout(r,120));};
const faceUp=async()=>{await p.keyboard.down('KeyW');await new Promise(r=>setTimeout(r,90));await p.keyboard.up('KeyW');await new Promise(r=>setTimeout(r,150));};
// 1 talk
await tp(6,14); await faceUp(); for(let i=0;i<5;i++) await E();
// 2 till plant water
await tp(17,19); await faceUp(); await E(); await E(); await E();
// 3 sleep1
await tp(17,24); await faceUp(); await E(); await new Promise(r=>setTimeout(r,300)); await E(); await new Promise(r=>setTimeout(r,2800));
// 4 water again
await tp(17,19); await faceUp(); await E();
// 5 sleep2
await tp(17,24); await faceUp(); await E(); await new Promise(r=>setTimeout(r,300)); await E(); await new Promise(r=>setTimeout(r,2800));
// 6 harvest
await tp(17,19); await faceUp(); await E();
const afterHarvest=await probe();
// 7-8 archive
await p.evaluate(()=>window.__NEURO_DEBUG__.setBerries(5));
await tp(19,9); await faceUp(); await E(); await new Promise(r=>setTimeout(r,3000));
for(let i=0;i<4;i++) await E();
// 9 reach teaser
await tp(19,5); for(let i=0;i<5;i++){await p.keyboard.down('KeyW');await new Promise(r=>setTimeout(r,300));await p.keyboard.up('KeyW');}
await new Promise(r=>setTimeout(r,700));
const fin=await probe();
console.log('harvest berries:', afterHarvest.berries, 'day:', afterHarvest.day);
console.log('final:', JSON.stringify({archived:fin.archived, fieldNotes:fin.fieldNotes, reached:(await p.evaluate(()=>window.__NEURO_DEBUG__.state().tutorial.reachedTeaserPath))}));
console.log('errors:', errs.length); errs.slice(0,8).forEach(e=>console.log(' ERR:',e));
await b.close();

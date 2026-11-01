import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
const root='public/cards';
const base='https://raw.githubusercontent.com/hhonbo/OpenDecks-Public-Domain-and-CC0-Playing-Cards/main/svg%20cards/card%20fronts';
const suits=['spades','clubs','hearts','diamonds'];
const ranks=['ace','2','3','4','5','6','7','8','9','10','jack','queen','king'];
let count=0;
for(const suit of suits){
  await mkdir(join(root,suit),{recursive:true});
  for(const rank of ranks){
    const filename=rank+' of '+suit+'.svg',path=join(root,suit,filename);
    let data=null;
    try{data=await readFile(path,'utf8');if(!/<svg[\s>]/.test(data)||data.length<500)data=null;}catch{}
    if(!data){
      const url=base+'/'+suit+'/'+encodeURIComponent(filename);
      let lastError;
      for(let attempt=0;attempt<3;attempt++){
        try{const response=await fetch(url);if(!response.ok)throw Error('HTTP '+response.status+': '+url);data=await response.text();if(!/<svg[\s>]/.test(data)||data.length<500)throw Error('Invalid SVG '+url);await writeFile(path,data);break;}
        catch(err){lastError=err;data=null;await new Promise(r=>setTimeout(r,500*(attempt+1)));}
      }
      if(!data)throw lastError;
    }
    count++;
  }
}
if(count!==52)throw Error('Expected 52 cards; got '+count);
console.log('OpenDecks SVG validated: '+count);

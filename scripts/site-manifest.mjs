import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

async function list(dir){
 const entries=await readdir(dir,{withFileTypes:true});
 const paths=await Promise.all(entries.map(e=>e.isDirectory()?list(`${dir}/${e.name}`):`${dir}/${e.name}`));
 return paths.flat().sort();
}
const paths=(await list('dist')).filter(p=>p!=='dist/build-info.json');
const files=await Promise.all(paths.map(async p=>({path:p.slice(5),sha256:createHash('sha256').update(await readFile(p)).digest('hex')})));
const sourceCommit=process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
await writeFile('dist/build-info.json',JSON.stringify({sourceCommit,files},null,2)+'\n');
console.log(`Recorded ${files.length} files for ${sourceCommit}`);

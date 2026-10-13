import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {viewModel,viewEngineering} from '../src/view-model.mjs';
import {sensitivity} from '../src/model.mjs';

const read=path=>fs.readFileSync(new URL(`../${path}`,import.meta.url));
for(const id of ['alberta','texas']){
 test(`${id}: published model and evidence exactly match source inputs`,()=>{
  const p=JSON.parse(read(`data/${id}.json`));
  assert.deepEqual(JSON.parse(read(`dist/data/${id}.json`)),p);
  assert.deepEqual(JSON.parse(read(`dist/downloads/${id}/project.json`)),p);
  assert.deepEqual(JSON.parse(read(`dist/downloads/${id}/base-case.json`)),{model:viewModel(p),engineering:viewEngineering(p),sensitivity:sensitivity(p)});
  assert.equal(read(`dist/downloads/${id}/model.mjs`).toString(),read('src/model.mjs').toString());
 });
 test(`${id}: independent package exposes every promised artifact`,()=>{
  const root=`dist/downloads/${id}`;
  for(const file of ['dossier.md','execution.md','source-register.md','delivery-schedule.md','engineering-basis.md','layout.svg','electrical.svg','cooling.svg','campus.svg','README.md'])assert.ok(read(`${root}/${file}`).length>100,file);
  assert.equal(read(`${root}/dossier.pdf`).subarray(0,5).toString(),'%PDF-');
  assert.equal(read(`${root}/project-package.zip`).subarray(0,2).toString(),'PK');
  const dossier=read(`${root}/dossier.md`).toString();
  assert.ok(dossier.includes('Calculated financial appendix'));
  assert.ok(!/undefined%|NaN|research\/alberta-monthly-schedule/.test(dossier));
  assert.ok(/commissioning/i.test(read(`${root}/execution.md`).toString()));
 });
}

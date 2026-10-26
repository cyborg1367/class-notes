import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const catalog=JSON.parse(fs.readFileSync(new URL('../web/assets/catalog.json',import.meta.url),'utf8'));
const course=fs.readFileSync(new URL('../web/machine-learning/index.html',import.meta.url),'utf8');
for(const lesson of catalog[0].lessons){
 const model=await import(new URL('../web/assets/'+lesson.lab.model,import.meta.url));
 test(lesson.id+': course card links directly to its own lab',()=>{
  const card=course.split('data-course-lesson="'+lesson.id+'"')[1]?.split('</article>')[0];
  assert.ok(card,'Missing lesson card');
  assert.equal(card.split('href="../'+lesson.lab.path+'"').length-1,1);
 });
 test(lesson.id+': visible Python setup and filename preserve existing drafts',()=>{
  assert.match(model.meta.filename,/^[a-z][a-z0-9_]*\.py$/);
  assert.ok(model.imports.includes('import numpy as np'));
  const fresh=model.normalize({});
  assert.ok(fresh.codes[0].startsWith(model.imports+'\n\n'));
  const saved={codes:model.stages.map((_,i)=>'# Student work '+i+'\ndef saved_function():\n    return 42\n'),active:2,hints:[1,0,2,0,0,0],explanation:'My reflection'};
  const restored=model.normalize(saved);
  assert.deepEqual(restored.codes,saved.codes);
  assert.equal(restored.active,saved.active);
  assert.deepEqual(restored.hints,saved.hints);
  assert.equal(restored.explanation,saved.explanation);
  if(lesson.lab.mission==='evaluation-knn-v1'){
   for(const statement of ['import pandas as pd','from sklearn.model_selection import train_test_split','from sklearn.neighbors import KNeighborsClassifier','from sklearn.metrics import accuracy_score, confusion_matrix'])assert.ok(fresh.codes[0].includes(statement));
  }
 });
}

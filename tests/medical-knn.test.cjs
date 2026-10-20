const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('../assets/prediction/medical-data.json');
const {classifyMedical}=require('../assets/medical-knn.js');
test('worked example changes class when one neighbor becomes three',()=>{
 const one=classifyMedical(data,data.query,1),three=classifyMedical(data,data.query,3);
 assert.equal(one.prediction,0);assert.equal(three.prediction,1);
 assert.deepEqual(three.neighbors.map(p=>p.name),['P6','P5','P8']);
 assert.deepEqual([three.votes0,three.votes1],[1,2]);
 assert.ok(Math.abs(one.neighbors[0].distance-Math.sqrt(.45))<1e-12);
});
test('equal distances preserve record order',()=>{
 const toy={names:['a','b','c'],X:[[0,0],[0,2],[2,0]],y:[0,1,1]};
 assert.equal(classifyMedical(toy,[0,1],1).neighbors[0].name,'a');
 assert.equal(classifyMedical(toy,[0,1],1).boundaryTie,true);
});
test('unselected labels cannot change a local three-neighbor vote',()=>{
 const copy={...data,y:data.y.slice()};copy.y[0]=1;
 assert.equal(classifyMedical(copy,data.query,3).prediction,classifyMedical(data,data.query,3).prediction);
});
test('explorer accepts only available odd neighbor counts',()=>{
 for(const k of [0,2,4,11])assert.throws(()=>classifyMedical(data,data.query,k),RangeError);
});
test('renaming binary classes preserves neighbors and reverses only the code',()=>{
 const renamed={...data,y:data.y.map(label=>1-label)};
 const before=classifyMedical(data,data.query,3),after=classifyMedical(renamed,data.query,3);
 assert.deepEqual(after.neighbors.map(p=>p.name),before.neighbors.map(p=>p.name));
 assert.equal(after.prediction,1-before.prediction);
 assert.equal(before.boundaryTie,false);
});
test('reordering tied boundary records can change the chosen class',()=>{
 const a={names:['a','b','c'],X:[[0,0],[0,2],[2,0]],y:[0,1,1]};
 const b={names:['b','a','c'],X:[[0,2],[0,0],[2,0]],y:[1,0,1]};
 assert.equal(classifyMedical(a,[0,1],1).prediction,0);
 assert.equal(classifyMedical(b,[0,1],1).prediction,1);
});

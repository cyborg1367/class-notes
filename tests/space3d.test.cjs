const test = require('node:test');
const assert = require('node:assert/strict');
const {rotateSpace,projectSpace,SPACE_POINTS} = require('../assets/space3d.js');
const distance = (a,b) => Math.hypot(...a.map((v,i)=>v-b[i]));

test('rotating the camera preserves every conceptual pairwise 3D distance',()=>{
  for (const yaw of [-Math.PI,-1,0,1,Math.PI]) for (const pitch of [-1.1,0,1.1]) {
    for (const a of SPACE_POINTS) for (const b of SPACE_POINTS) {
      assert.ok(Math.abs(distance(a,b)-distance(rotateSpace(a,yaw,pitch),rotateSpace(b,yaw,pitch)))<1e-12);
    }
  }
});
test('projection remains finite and inside the viewport throughout orbit',()=>{
  const points=[...SPACE_POINTS,[0,0,0],[1.13,0,0],[0,1.13,0],[0,0,1.13],[1,1,1]];
  for(let yaw=-Math.PI;yaw<=Math.PI;yaw+=0.1)for(const pitch of [-1.1,0,1.1])for(const p of points){
    const q=projectSpace(p,yaw,pitch);
    assert.ok(Number.isFinite(q.x)&&Number.isFinite(q.y)&&q.scale>0);
    assert.ok(q.x>15&&q.x<505&&q.y>15&&q.y<385);
  }
});

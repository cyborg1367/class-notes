// A renderer/service boundary. Holds view data and callbacks, never auth tokens.
export function createViewChannel(initial) {
  const immutable=value=>value&&typeof value==='object'?Object.freeze(Array.isArray(value)?value.map(immutable):Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)]))):value;
  let snapshot=immutable(initial), actions={}, revision=0;
  const listeners=new Set();
  const notify=()=>{for(const listener of [...listeners])listener()};
  return {
    getSnapshot:()=>snapshot,
    subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener)},
    publish(next){snapshot=immutable(next);notify()},
    reset(){revision++;actions={};snapshot=immutable(initial);notify()},
    bindActions(next){const ticket=++revision;actions=next;return()=>{if(ticket!==revision)return false;revision++;actions={};return true}},
    perform(name){const action=Object.hasOwn(actions,name)?actions[name]:null;return action?Promise.resolve().then(action):Promise.resolve(false)},
  };
}
const KEY=Symbol.for('class-notes.view-channel.v1');
export function getViewChannel(host,initial) {
  if(!host[KEY])Object.defineProperty(host,KEY,{value:createViewChannel(initial),configurable:true});
  return host[KEY];
}

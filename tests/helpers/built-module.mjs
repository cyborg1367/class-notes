import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const loaders=new WeakMap();

// Tests execute the emitted ESM graph, including the shared React chunk, in the
// document's isolated VM. No HTTP listener, browser automation or remote import.
function loader(dom){
 if(loaders.has(dom))return loaders.get(dom);
 if(!vm.SourceTextModule)throw Error('Run Node tests with --experimental-vm-modules');
 const context=dom.getInternalVMContext();context.setImmediate=setImmediate;context.clearImmediate=clearImmediate;
 const modules=new Map(),evaluations=new Map();
 const assets=path.resolve('dist/assets');
 const script=dom.window.document.querySelector('script[data-portal],script[data-site-ui]');
 const publicAssets=new URL('.',script?.src||new URL('/assets/entry.js',dom.window.location.href).href);
 function get(filename){
  filename=path.resolve(filename);if(!filename.startsWith(assets+path.sep))throw Error('IMPORT_OUTSIDE_ASSETS');
  if(modules.has(filename))return modules.get(filename);
  const module=new vm.SourceTextModule(fs.readFileSync(filename,'utf8'),{context,identifier:filename,importModuleDynamically:importURL,
   initializeImportMeta(meta){meta.url=new URL(path.relative(assets,filename).replaceAll('\\','/'),publicAssets).href}});
  modules.set(filename,module);return module;
 }
 async function evaluate(filename){
  filename=path.resolve(filename);
  if(evaluations.has(filename))return evaluations.get(filename);
  const task=(async()=>{
   const module=get(filename);
   if(module.status==='unlinked')await module.link((specifier,parent)=>{
    if(!specifier.startsWith('.'))throw Error('UNEXPECTED_REMOTE_OR_PACKAGE_IMPORT: '+specifier);
    return get(path.resolve(path.dirname(parent.identifier),specifier));
   });
   if(module.status!=='evaluated')await module.evaluate();
   return module;
  })();evaluations.set(filename,task);return task;
 }
 async function importURL(specifier,parent){
  const base=parent?.identifier
   ?new URL(path.relative(assets,parent.identifier).replaceAll('\\','/'),publicAssets)
   :dom.window.location.href;
  const url=new URL(String(specifier),base);
  if(url.origin!==dom.window.location.origin||!url.pathname.startsWith(publicAssets.pathname))throw Error('UNEXPECTED_REMOTE_IMPORT');
  return evaluate(path.join(assets,url.pathname.slice(publicAssets.pathname.length)));
 }
 const result={context,evaluate,importURL,assets};loaders.set(dom,result);return result;
}
export async function evaluateBuiltModule(dom,entry){
 const instance=loader(dom);return(await instance.evaluate(path.join(instance.assets,entry))).namespace;
}
export function evaluateClassicAsset(dom,entry){
 const instance=loader(dom);
 return new vm.Script(fs.readFileSync(path.join(instance.assets,entry),'utf8'),{filename:entry,importModuleDynamically:instance.importURL}).runInContext(instance.context);
}

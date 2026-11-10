import {test} from 'node:test';import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';import {existsSync} from 'node:fs';import path from 'node:path';
import {previewDocument,previewFixtureSource,coursePreviewPlugin} from '../frontend/preview-plugin.mjs';
import {dashboardPreviewSource} from '../frontend/preview/dashboard.mjs';
import {pythonCommand,projectRoot} from '../frontend/project.mjs';
import {readFile} from 'node:fs/promises';
import {Readable,Writable} from 'node:stream';
import {Script} from 'node:vm';

function requestMiddleware(server,url,method='GET'){
 return new Promise((resolve,reject)=>{
  const req=new Readable({read(){this.push(null)}});Object.assign(req,{url,method,headers:{},socket:{remoteAddress:'127.0.0.1'}});
  const chunks=[],headers={};const res=new Writable({write(chunk,_encoding,done){chunks.push(Buffer.from(chunk));done()}});
  res.statusCode=200;res.setHeader=(name,value)=>{headers[name.toLowerCase()]=value};res.getHeader=name=>headers[name.toLowerCase()];
  res.removeHeader=name=>{delete headers[name.toLowerCase()]};
  res.on('error',reject);res.on('finish',()=>resolve({body:Buffer.concat(chunks),headers,status:res.statusCode}));
  server.middlewares.handle(req,res,error=>reject(error||Error('Unresolved request: '+url)));
 });
}
test('Local fixture pages exclude production auth and resolve assets from nested preview routes',async()=>{
 const html=await previewDocument(projectRoot,'member');const{document}=parseHTML(html);
 assert.equal(document.querySelector('script[data-portal]'),null);
 assert.match(document.querySelector('#local-preview-banner').textContent,/دادهٔ نمونه/);
 assert.equal(document.querySelectorAll('#local-preview-banner nav a').length,8);
 const base=new URL(document.querySelector('base').getAttribute('href'),'http://local.invalid');
 assert.equal(base.pathname,'/machine-learning/');
 for(const element of document.querySelectorAll('link[href],script[src]')){
  const url=new URL(element.getAttribute('href')||element.getAttribute('src'),base);
  if(url.pathname.startsWith('/__preview__/'))continue;
  assert.ok(existsSync(path.join(projectRoot,'dist',url.pathname)),url.pathname);
 }
});
test('Preview fixtures have no production request path and are not emitted in dist',()=>{
 for(const state of ['guest','member','pending','error','<script>']){
  const source=previewFixtureSource(state);assert.doesNotMatch(source,/fetch\(|\.rpc\(|createClient\(|classroom_lab_/);
  assert.ok(source.includes('local-preview-user'));assert.doesNotMatch(source,/<script>/);
 }
 assert.equal(existsSync(path.join(projectRoot,'dist/__preview__')),false);
});
test('The local runner selects the active virtualenv or a platform-appropriate Python launcher',()=>{
 assert.equal(pythonCommand('win32',{},()=>false),'py');
 assert.equal(pythonCommand('linux',{},()=>false),'python3');
 assert.match(pythonCommand('win32',{VIRTUAL_ENV:'test-env'},()=>true),/Scripts[\\/]python\.exe$/);
 assert.match(pythonCommand('linux',{VIRTUAL_ENV:'test-env'},()=>true),/bin[\\/]python$/);
});
test('Vite resolves and transforms every generated fixture without a physical fixture file',async(t)=>{
 const {createServer,createLogger}=await import('vite');
 const diagnostics=[];const logger=createLogger('silent');
 logger.warn=(message)=>diagnostics.push(message);logger.error=(message)=>diagnostics.push(message);
 // Exercise Vite's actual resolver and import-analysis pipeline without listening on a port.
 const server=await createServer({configFile:false,root:path.join(projectRoot,'dist'),publicDir:false,
  customLogger:logger,appType:'mpa',optimizeDeps:{noDiscovery:true,include:[]},
  server:{middlewareMode:true,hmr:false,watch:null,preTransformRequests:false},plugins:[coursePreviewPlugin(projectRoot)]});
 t.after(()=>server.close());
 for(const state of ['guest','member','pending','unregistered','suspended','restricted','error','loading']){
  const fixture='/__preview__/course-fixture.mjs?state='+state;
  const result=await server.transformRequest(fixture);
  assert.ok(result,fixture);assert.ok(result.code.includes('const selected='+JSON.stringify(state)),fixture);
  const html=await server.transformIndexHtml('/__preview__/course/',await previewDocument(projectRoot,state));
  const {document}=parseHTML(html);
  const script=[...document.querySelectorAll('script[src]')].find(node=>node.src.includes('course-fixture'));
  assert.ok(script,fixture);
  assert.ok(await server.transformRequest(script.getAttribute('src')),script.src);
 }
 for(const state of ['member','fresh','partial','pending']){
  const response=await requestMiddleware(server,'/__preview__/dashboard/?state='+state);
  const {document}=parseHTML(response.body.toString('utf8'));
  assert.equal(response.status,200,state);
  assert.ok(document.querySelector('#local-preview-banner'));
  assert.equal(document.querySelector('script[data-portal],link[href*="vendor/supabase"]'),null);
  const script=[...document.querySelectorAll('script[src]')].find(node=>node.src.includes('dashboard-fixture'));
  assert.ok(script,state);
  const fixture=await server.transformRequest(script.getAttribute('src'));
  assert.match(fixture.code,new RegExp('const state = '+JSON.stringify(state)));
  assert.doesNotMatch(dashboardPreviewSource(state),/fetch\(|\.rpc\(|createClient\(|localStorage/);
 }
 const manifest=JSON.parse(await readFile(path.join(projectRoot,'dist/assets/asset-manifest.json'),'utf-8'));
 const scripts=Object.keys(manifest.files).filter(name=>/^assets\/[^/]+\.m?js$/.test(name));
 for(const entry of scripts){
  const name=path.basename(entry);
  const expected=await readFile(path.join(projectRoot,'dist/assets',name));
  const result=await requestMiddleware(server,'/assets/'+name+'?v=local-test');
  assert.equal(result.status,200,name);assert.deepEqual(result.body,expected,name);
  assert.equal(result.headers['content-type'],'text/javascript; charset=utf-8');
  assert.equal(result.headers['cache-control'],'no-store');
  if(name.endsWith('.js')&&!['course-index.js','site-shell.js','homepage.js','account-page.js','dashboard-page.js'].includes(name))assert.doesNotThrow(()=>new Script(result.body.toString('utf8'),{filename:name}),name+' remains a valid classic script');
 }
 const portal=await requestMiddleware(server,'/assets/portal.js?import&v=test');
 assert.deepEqual(portal.body,await readFile(path.join(projectRoot,'dist/assets/portal.js')));
 const head=await requestMiddleware(server,'/assets/portal.js?v=test','HEAD');
 assert.equal(head.status,200);assert.equal(head.body.length,0);assert.ok(Number(head.headers['content-length'])>0);
 assert.equal((await requestMiddleware(server,'/assets/missing-local-script.js')).status,404);
 assert.equal((await requestMiddleware(server,'/assets/%2e%2e%2findex.js')).status,403);
 assert.equal((await requestMiddleware(server,'/assets/%ZZ.js')).status,400);
 const normalPage=await server.transformIndexHtml('/machine-learning/prediction-problem/',await readFile(path.join(projectRoot,'dist/machine-learning/prediction-problem/index.html'),'utf8'));
 const {document:lessonDocument}=parseHTML(normalPage);
 const lessonPortal=lessonDocument.querySelector('script[data-portal]');
 assert.ok(lessonPortal);assert.equal(lessonPortal.getAttribute('type'),null);
 const lessonURL=new URL(lessonPortal.src,'http://local.invalid/machine-learning/prediction-problem/');
 assert.doesNotThrow(()=>new Script(portal.body.toString('utf8')));
 assert.equal((await requestMiddleware(server,lessonURL.pathname+lessonURL.search)).status,200);
 assert.deepEqual(diagnostics,[]);
 assert.equal(existsSync(path.join(projectRoot,'dist/__preview__/course-fixture.mjs')),false);
});

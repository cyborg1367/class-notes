import {build} from 'vite';
import {readFile,writeFile,mkdir,readdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {prerenderHome} from './build/prerender-home.mjs';
import {prerenderAccount} from './build/prerender-account.mjs';
import {prerenderCourse} from './build/prerender-course.mjs';
import {PUBLIC_RENDER_INPUTS} from './build/inputs.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);
await rm(path.join(root,'web/assets/react'),{recursive:true,force:true});
await build({configFile:path.join(root,'frontend/vite.config.mjs')});
await build({configFile:false,publicDir:false,define:{'process.env.NODE_ENV':JSON.stringify('production')},
 build:{ssr:path.join(root,'frontend/prerender-entry.tsx'),outDir:path.join(root,'.cache/react'),emptyOutDir:true,
  target:'node24',minify:false,rolldownOptions:{output:{entryFileNames:'course-render.mjs'}}}});
const renderer=await import(pathToFileURL(path.join(root,'.cache/react/course-render.mjs')).href);
const bytes=await readFile(path.join(root,'web/assets/catalog.json'));
const catalog=JSON.parse(bytes.toString('utf8'));
const pages={};
for(const course of catalog){
 if(!/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(course.id))throw Error('INVALID_COURSE_ROUTE');
 const seen=new Set();
 for(const lesson of course.lessons){
  if(!lesson.id.startsWith(course.id+'/')||!/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(lesson.id)||seen.has(lesson.id))throw Error('INVALID_COURSE_LESSON');
  seen.add(lesson.id);
  if(lesson.lab&&lesson.lab.path!=='lab/'+lesson.id+'/')throw Error('INVALID_COURSE_LAB');
 }
 pages[course.id]=renderer.renderCourse(course);
 await prerenderCourse(root,course.id,pages[course.id]);
}
await mkdir(path.join(root,'frontend/generated'),{recursive:true});
await writeFile(path.join(root,'frontend/generated/course-pages.json'),JSON.stringify({catalog_sha256:createHash('sha256').update(bytes).digest('hex'),pages})+'\n','utf8');
console.log(`Prerendered ${Object.keys(pages).length} course page(s) from the canonical public catalog.`);
await prerenderHome(root,renderer,catalog,bytes);
await prerenderAccount(root,renderer);

const shells={};
for(const file of (await readdir(path.join(root,'web'),{recursive:true})).filter(file=>file.endsWith('.html')).sort()){
 const route=file.replaceAll('\\','/'),filename=path.join(root,'web',file);
 let html=await readFile(filename,'utf8');
 const page=html.match(/<body\b[^>]*\bdata-page="([a-z-]+)"/)?.[1];
 if(!page)throw Error('MISSING_PAGE_KIND: '+route);
 const props={route,page},rendered=renderer.renderShell(props);
 shells[route]={...props,...rendered};
 html=html.replace(/<header\b[^>]*class="portal-header"[^>]*>[\s\S]*?<\/header>/,
  ()=>'<header class="portal-header" data-site-header-root=""><!-- site-header:start -->'+rendered.header+'<!-- site-header:end --></header>');
 html=html.replace(/<footer\b[^>]*class="portal-footer"[^>]*>[\s\S]*?<\/footer>/,
  ()=>'<footer class="portal-footer" data-site-footer-root=""><!-- site-footer:start -->'+rendered.footer+'<!-- site-footer:end --></footer>');
 const serialized=JSON.stringify(props).replaceAll('<','\\u003c');
 if(html.includes('id="site-shell-data"'))html=html.replace(/(<script id="site-shell-data" type="application\/json">)[\s\S]*?(<\/script>)/,()=>'<script id="site-shell-data" type="application/json">'+serialized+'</script>');
 else html=html.replace('<script id="catalog-data"','<script id="site-shell-data" type="application/json">'+serialized+'</script><script id="catalog-data"');
 const base='../'.repeat(route.split('/').length-1);
 if(!html.includes('data-site-ui'))html=html.replace('<script defer data-portal',`<script type="module" data-site-ui src="${base}assets/site-shell.js?v=build"></script><script defer data-portal`);
 if(!html.includes('assets/account-react.css'))html=html.replace('</head>',`<link rel="stylesheet" href="${base}assets/account-react.css?v=build"></head>`);
 if(!html.includes('assets/site-shell.css'))html=html.replace('</head>',`<link rel="stylesheet" href="${base}assets/site-shell.css?v=build"></head>`);
 if(html!==await readFile(filename,'utf8'))await writeFile(filename,html,'utf8');
}
const sources=[...(await readdir(path.join(root,'frontend'),{recursive:true})).filter(file=>/\.(?:tsx?|mjs|svg|css|json)$/.test(file)&&!file.startsWith('generated/')&&!file.startsWith('generated\\')).map(file=>'frontend/'+file.replaceAll('\\','/')),...PUBLIC_RENDER_INPUTS].sort();
const digest=createHash('sha256');for(const file of sources)digest.update(file+'\0').update(await readFile(path.join(root,file))).update('\0');
await writeFile(path.join(root,'frontend/generated/site-shells.json'),JSON.stringify({source_files:sources,source_sha256:digest.digest('hex'),shells})+'\n','utf8');
console.log(`Prerendered React header/footer for ${Object.keys(shells).length} routes.`);

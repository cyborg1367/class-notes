import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({
  publicDir:false,
  define:{'process.env.NODE_ENV':JSON.stringify('production')},
  build:{
    outDir:'web/assets',emptyOutDir:false,copyPublicDir:false,sourcemap:false,
    target:['es2020','safari15'],minify:true,
    lib:{entry:{'course-index':fileURLToPath(new URL('./course-index.tsx',import.meta.url)),
      'homepage':fileURLToPath(new URL('./homepage.tsx',import.meta.url)),
      'dashboard-page':fileURLToPath(new URL('./dashboard-page.tsx',import.meta.url)),
      'account-page':fileURLToPath(new URL('./account-page.tsx',import.meta.url)),
      'site-shell':fileURLToPath(new URL('./site-shell.tsx',import.meta.url))},
      formats:['es'],fileName:(_format,name)=>name+'.js'},
    rolldownOptions:{output:{chunkFileNames:'react/[name]-[hash].mjs'}},
  },
});

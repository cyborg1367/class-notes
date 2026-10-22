// This worker receives lesson data and code only, never auth credentials.
const INDEX = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/';
let py, namespace, originalX, originalQuery, busy = false, request = 0, remaining = 12000;
const send = (type, extra = {}) => self.postMessage({type, request, ...extra});
function output(text) {
  if (!remaining) return;
  const line = (String(text) + '\n').slice(0, remaining);
  remaining -= line.length;
  send('output', {text: line});
  if (!remaining) send('output', {text: '\n[Output shortened]\n'});
}
self.onmessage = async ({data: d}) => {
  if (busy || !d || typeof d.type !== 'string') return;
  busy = true; request = d.request; remaining = 12000;
  try {
    if (d.type === 'init') {
      if (py) return;
      const {loadPyodide} = await import(INDEX + 'pyodide.mjs');
      py = await loadPyodide({indexURL: INDEX});
      send('stage');
      await py.loadPackage('numpy');
      py.setStdin({error: true});
      py.setStdout({batched: output}); py.setStderr({batched: output});
      send('ready'); return;
    }
    if (!py || typeof d.code !== 'string' || d.code.length > 20000 || !['run','console'].includes(d.type)) return;
    if (d.type !== 'console') {
      if (typeof d.bootstrap !== 'string' || d.bootstrap.length > 20000) return;
      namespace?.destroy(); originalX?.destroy(); originalQuery?.destroy();
      namespace = py.toPy({__name__: '__main__'});
      let bootstrapResult = await py.runPythonAsync(d.bootstrap, {globals: namespace, filename: 'dataset.py'});
      bootstrapResult?.destroy?.();
      const x = namespace.get('X'), q = namespace.get('query');
      try { originalX = x.copy(); originalQuery = q.copy(); } finally { x.destroy(); q.destroy(); }
    }
    if (!namespace) throw Error('Run your editor code before using the console.');
    let result = await py.runPythonAsync(d.code, {globals: namespace, filename: d.type === 'console' ? '<console>' : 'exercise.py'});
    try {
      if (d.type === 'console' && result !== undefined) {
        const repr = py.runPython('repr');
        try { output(repr(result)); } finally { repr.destroy(); }
      }
    } finally { result?.destroy?.(); }
    send('done');
  } catch (error) {
    send(py && d.type !== 'init' ? 'error' : 'load-error', {text: String(error).slice(0, 12000)});
  } finally { busy = false; }
};

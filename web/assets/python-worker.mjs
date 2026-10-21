// No session, account information or grading keys cross this worker boundary.
const INDEX = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/';
let pyodide, busy = false, remaining = 12000, truncated = false;
const send = (type, extra = {}) => self.postMessage({type, ...extra});
function output(stream, value) {
  if (remaining <= 0) return;
  const line = String(value) + '\n';
  const text = line.slice(0, remaining);
  remaining -= text.length;
  send('output', {stream, text});
  if (remaining === 0 && !truncated) {
    truncated = true;
    send('truncated');
  }
}
self.onmessage = async ({data}) => {
  if (!data || busy) return;
  if (data.type === 'init' && !pyodide) {
    busy = true;
    try {
      const {loadPyodide} = await import(INDEX + 'pyodide.mjs');
      pyodide = await loadPyodide({indexURL: INDEX});
      send('stage', {stage: 'numpy'});
      await pyodide.loadPackage('numpy');
      pyodide.setStdin({error: true});
      pyodide.setStdout({batched: text => output('stdout', text)});
      pyodide.setStderr({batched: text => output('stderr', text)});
      send('ready');
    } catch (error) {
      send('load-error');
    } finally { busy = false; }
    return;
  }
  if (data.type !== 'run' || !pyodide || typeof data.code !== 'string' ||
      typeof data.bootstrap !== 'string' || data.code.length > 20000 || data.bootstrap.length > 20000) return;
  busy = true; remaining = 12000; truncated = false;
  const namespace = pyodide.toPy({__name__: '__main__'});
  let result;
  try {
    await pyodide.runPythonAsync(data.bootstrap, {globals: namespace, filename: 'dataset.py'});
    result = await pyodide.runPythonAsync(data.code, {globals: namespace, filename: 'exercise.py'});
    send('done');
  } catch (error) {
    send('python-error', {text: String(error).slice(0, 12000)});
  } finally {
    result?.destroy?.();
    namespace.destroy();
    busy = false;
  }
};

import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Workspace, type WorkspaceChannels } from './views';
import type { LayoutControls } from '../layout/model';
import type { WorkspaceActions, WorkspaceControls, WorkspaceOptions } from './contracts';

function channel<T>(value: T) {
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    set(next: T) {
      if (Object.is(value,next)) return;
      value = next;
      listeners.forEach(listener => listener());
    },
  };
}

export function mountLabWorkspace(host: HTMLElement, options: WorkspaceOptions, actions: WorkspaceActions, layout: LayoutControls) {
  const controls = channel<WorkspaceControls>({ busy:false,running:false,hasWorker:false,canConsole:false,canImport:false,
    canLoad:true,message:'',error:false });
  const output = channel('');
  const save = channel({ message:'',attention:false });
  const channels: WorkspaceChannels = { controls,output,save };
  const root = createRoot(host,{identifierPrefix:'lab-workspace-'});
  // The runtime binds to the committed editor and output slots at startup.
  flushSync(() => root.render(<Workspace options={options} actions={actions} channels={channels} layout={layout} />));
  return {
    setControls(value: WorkspaceControls) {
      const previous = controls.get();
      if (Object.keys(value).some(key => value[key as keyof WorkspaceControls] !== previous[key as keyof WorkspaceControls])) controls.set(value);
    },
    setSave(message: string,attention: boolean) {
      const previous = save.get();
      if (previous.message !== message || previous.attention !== attention) save.set({message,attention});
    },
    getOutput: output.get,
    clearOutput() { output.set(''); },
    appendOutput(text: string) {
      const before = output.get();
      if (before.length < 16000) output.set(before + String(text ?? '').slice(0,16000-before.length));
    },
    dispose() { root.unmount(); },
  };
}

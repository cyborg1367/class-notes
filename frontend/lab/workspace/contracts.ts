export type WorkspaceControls = {
  busy: boolean;
  running: boolean;
  hasWorker: boolean;
  canConsole: boolean;
  canImport: boolean;
  canLoad: boolean;
  message: string;
  error: boolean;
};
export type WorkspaceOptions = {
  filename: string;
  links: { account: string; dashboard: string; teacher: string };
  mode: 'normal' | 'readonly-preview' | 'simulated-preview';
};
export type WorkspaceActions = {
  run(): void;
  stop(): void;
  activate(): void;
  check(): void;
  input(): void;
  scroll(): void;
  keydown(event: KeyboardEvent): void;
  command(): void;
  clear(): void;
  download(): void;
  imports(): void;
  reset(): void;
  load(): void;
  refresh(): void;
};

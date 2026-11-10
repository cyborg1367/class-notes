export type HomeView = {
  phase: 'loading' | 'guest' | 'authenticated' | 'error';
  busy: boolean;
  accountURL: string;
  dashboardURL: string;
  errorMessage: string;
};

export type HomeChannel = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => HomeView;
  perform: (action: string) => Promise<unknown>;
};


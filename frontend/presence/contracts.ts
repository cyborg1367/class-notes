export type PresenceCourse = { id: string; title: string };
export type PresencePerson = { id: string; name: string };
export type PresenceClient = {
  realtime?: { setAuth(): Promise<unknown> };
  channel(name: string, config: { config: { private: boolean } }): PresenceChannel;
  removeChannel(channel: unknown): unknown;
};
export type PresenceChannel = {
  on(type: 'broadcast', filter: { event: string }, listener: () => void): { subscribe(status: (value: string) => void): unknown };
};
export type PresenceOptions = {
  client: PresenceClient;
  rpc(name: string, args?: Record<string, unknown>): Promise<unknown>;
  userId: string;
  courses: PresenceCourse[];
  courseId?: string;
  anchor?: HTMLElement | null;
  account?: HTMLElement | null;
  isCurrent?: () => boolean;
  storage?: Storage | null;
  pollInterval?: number;
};
export type PresenceSnapshot = {
  open: boolean;
  connected: boolean;
  heading: string;
  people: PresencePerson[];
  status: string;
  courseId: string;
  courses: PresenceCourse[];
  visible: boolean;
  settingBusy: boolean;
  settingStatus: string;
  settingReady: boolean;
};

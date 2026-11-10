import type { PublicCourse } from '../catalog/types';

export type LessonInfo = {
  id: string; title: string; number?: string; notebook?: string; quiz_version?: number;
  lab?: { path: string }; hero_kind?: string | null;
  course: PublicCourse;
};
export type LessonPayload = { body: string; pdf_path?: string | null; scripts?: string[] | null };
export type ReaderAccess =
  | { kind: 'guest'; login: string }
  | { kind: 'error' }
  | { kind: 'pending' | 'suspended' | 'restricted' | 'unregistered' };
export type ReaderView =
  | { phase: 'loading' | 'error' }
  | { phase: 'gate'; access: ReaderAccess }
  | { phase: 'ready'; payload: LessonPayload };

export type ReaderOptions = {
  info: LessonInfo;
  href: (relative: string) => string;
  current: () => boolean;
  getFile: (path: string, signal: AbortSignal) => Promise<Blob>;
  loadScript: (url: string) => Promise<void>;
  enhance: (scope: HTMLElement) => void;
  refreshMotion?: (scope: HTMLElement) => void;
  clearMotion?: () => void;
  onRead: (scope: HTMLElement) => void;
  onWidgetsReady?: () => void;
  refreshAccess: (request: boolean) => Promise<void>;
  retry: () => void;
  preview?: boolean;
};
export type Heading = { id: string; label: string; number?: string };
export type SlotContent =
  | { kind: 'copy'; label: string; text: string }
  | { kind: 'download'; label: string; path: string; className: string };
export type Slot = SlotContent & { key: string };

export type BinaryPlot = {
  points: { x: number; y: number; positive: boolean; label: string }[];
  query: [number, number];
};
export type HeroVisual =
  | { kind: 'authored'; html: string; className: string }
  | { kind: 'binary'; plot: BinaryPlot }
  | { kind: 'threshold-scores' };

export type HeroContent = {
  eyebrow: string;
  titleHTML: string;
  copy: string;
  meta: string;
  highlights: { number: string; html: string }[];
  visual: HeroVisual | null;
};
export type LessonDownload = { path: string; label: string };
export type EndResources = {
  id: string;
  pdf: string | null;
  notebook: string | null;
  extras: LessonDownload[];
  note: string;
};
export type PreparedLesson = {
  hero: HeroContent;
  html: string;
  fact: string;
  slots: Slot[];
  headings: Heading[];
  resources: EndResources;
};

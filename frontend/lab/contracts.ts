export type LabStory = {
  title: string;
  introTitle: string;
  lessonBridge?: string;
  /** Authored fragments from the selected public mission module. */
  story: string;
  dataIntro: string;
  introGoal: string;
  queryLabel?: string;
  queryText?: string;
  queryHelp?: string;
};
export type LabDataset = {
  columns: readonly { label: string }[];
  names: readonly string[];
  X: readonly (readonly number[])[];
  texts?: readonly string[];
  y?: readonly number[];
  query?: unknown;
  queryText?: string;
};
export type LabStage = { title: string; xp: number; example: string; function?: string };
export type IntroModel = {
  meta: LabStory;
  dataset: LabDataset;
  stages: readonly LabStage[];
  example: string;
  showQueryCode: boolean;
  action: 'start' | 'resume' | 'return';
};
export type FeedbackModel = {
  kind: 'success' | 'service' | 'correction';
  title: string;
  text: string;
  hint: string;
  field?: string | null;
  step: string;
  example: string;
};

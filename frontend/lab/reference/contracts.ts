export type Dataset = {
  columns: readonly { name: string; label: string }[];
  names: readonly string[];
  X: readonly (readonly number[])[];
  y?: readonly number[];
  texts?: readonly string[];
  query: readonly number[];
  queryText?: string;
  query_new?: readonly number[];
};

export type ReferenceMeta = {
  dataTitle: string;
  dataIntro: string;
  queryLabel: string;
  queryText?: string;
  queryHelp: string;
  secondHelp?: string;
  tableTitle: string;
  variables: string;
  storyTitle: string;
  story: string;
};

export type PreviewRenderer = (host: HTMLElement, value: unknown, dataset: Dataset) => void;
export type ReferenceOptions = {
  dataset: Dataset;
  meta: ReferenceMeta;
  bootstrap: string;
  csvURL?: string;
  lessonURL: string;
  loadPreview?: () => Promise<PreviewRenderer>;
};

import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { authoredText } from './authored-text';
import type { PreviewRenderer, ReferenceOptions } from './contracts';
import { DatasetReference, GuideReference } from './views';

export function mountLabReference(root: HTMLElement, options: ReferenceOptions) {
  const dataHost=root.querySelector<HTMLElement>('[data-react-lab-dataset]');
  const guideHost=root.querySelector<HTMLElement>('[data-react-lab-guide]');
  if (!dataHost||!guideHost) throw new Error('LAB_REFERENCE_MOUNT_POINT_MISSING');
  const dataView=createRoot(dataHost,{identifierPrefix:'lab-data-'});
  const guideView=createRoot(guideHost,{identifierPrefix:'lab-guide-'});
  const {meta,dataset,bootstrap,csvURL,lessonURL,loadPreview}=options;
  const doc=root.ownerDocument;
  const intro=authoredText(doc,meta.dataIntro);
  const variables=authoredText(doc,meta.variables);
  const story=authoredText(doc,meta.story);
  let finalStage=false, disposed=false, revision=0;
  let renderer: Promise<PreviewRenderer> | null=null;
  const paintData=()=>dataView.render(<DatasetReference dataset={dataset} meta={meta} intro={intro}
    variables={variables} bootstrap={bootstrap} csvURL={csvURL} finalStage={finalStage} hasPreview={!!loadPreview} />);
  flushSync(()=>{
    paintData();
    guideView.render(<GuideReference title={meta.storyTitle} story={story} lessonURL={lessonURL} />);
  });
  // React owns the empty slot. The existing validated chart renderer owns
  // only its contents and visibility; React never supplies children here.
  const chart=dataHost.querySelector<HTMLElement>('[data-evaluation-preview]');

  function clearPreview() {
    if(disposed)return;
    revision++;
    if(chart){chart.hidden=true;chart.replaceChildren();}
  }

  return {
    selectStage(isFinal: boolean) {
      if(disposed)return;
      clearPreview();
      if(finalStage!==isFinal&&dataset.query_new){
        finalStage=isFinal;
        flushSync(paintData);
      }
    },
    clearPreview,
    async showPreview(value: unknown, isRunCurrent: () => boolean) {
      if(disposed||!chart||!loadPreview||!isRunCurrent())return false;
      const stamp=++revision;
      const current=()=>!disposed&&stamp===revision&&isRunCurrent();
      let pending: Promise<PreviewRenderer> | null=null;
      try{
        pending=renderer ??= loadPreview();
        const draw=await pending;
        if(!current())return false;
        draw(chart,value,dataset);
        return current();
      }catch{
        if(renderer===pending)renderer=null;
        if(current()){
          chart.textContent='نمایش نمودار آزمایشی ممکن نشد. خروجی کد را در کنسول ببین.';
          chart.hidden=false;
        }
        return false;
      }
    },
    dispose() {
      if(disposed)return;
      clearPreview();
      disposed=true;
      dataView.unmount();
      guideView.unmount();
    },
  };
}

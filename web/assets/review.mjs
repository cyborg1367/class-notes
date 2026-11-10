// Pure selectors for the authenticated notebook.
export const normalizeSearch=value=>String(value??'').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u064b-\u065f\u200c]/g,'').toLocaleLowerCase().trim();
/** @param {import('../../frontend/review/contracts').Notebook} state
 * @param {Partial<import('../../frontend/review/contracts').Filters>} filters */
export function reviewEntries(state,{tab='due',search='',lesson=''}={}){
 const concepts=new Map((state.concepts||[]).map(c=>[c.id,c]));
 const query=normalizeSearch(search);
 return (state.entries||[]).filter(e=>(tab!=='due'||e.due)&&(tab!=='bookmarked'||e.bookmarked)&&(!lesson||concepts.get(e.concept_id)?.lesson_id===lesson)&&(!query||normalizeSearch(e.title+' '+e.note+' '+(concepts.get(e.concept_id)?.description||'')).includes(query)));
}
/** @param {import('../../frontend/review/contracts').Notebook} state */
export const reviewSessionEntries=state=>reviewEntries(state).slice(0,3);
/** @param {import('../../frontend/review/contracts').Concept | undefined} concept @param {(path:string)=>string} url */
export function reviewReference(concept,url){
 if(!concept||!/^machine-learning\/[a-z0-9-]+$/.test(concept.lesson_id))return null;
 return url(concept.lesson_id+'/'+(/^[A-Za-z0-9_-]+$/.test(concept.review_anchor||'')?'#'+concept.review_anchor:''));
}
/** @param {import('../../frontend/review/contracts').Outcome} result */
export function reviewOutcome(result){
 if(!result?.correct)return {status:'needs-review',title:'به نکته برگردیم و دوباره امتحان کنیم.'};
 if(result.hint_used)return {status:'with-hint',title:'پاسخ درست بود؛ با کمک راهنما.'};
 if(result.preparation_used===true)return {status:'after-reading',title:'پس از بازخوانی، درست پاسخ دادی.'};
 if(result.preparation_used===false)return {status:'retrieval',title:'در این مثال، بدون بازخوانی درست پاسخ دادی.'};
 return {status:'unclassified',title:'در این مثال، درست پاسخ دادی.'};
}
/** @param {import('../../frontend/review/contracts').Entry[]} entries */
export function latestReviewWriting(entries){
 return entries.flatMap(e=>[...(e.note?[{...e,isReflection:false}]:[]),...(e.last_reflection?.text?[{...e,note:e.last_reflection.text,updated_at:e.last_reflection.at,isReflection:true}]:[])]).sort((a,b)=>(Date.parse(b.updated_at)||0)-(Date.parse(a.updated_at)||0))[0];
}

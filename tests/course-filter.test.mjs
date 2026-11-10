import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSearch,matchCourseRows,courseTopics} from '../frontend/course-filter-model.mjs';

const rows=[
 {id:'one',search:'01 از یک جدول تا نزدیک‌ترین نمونه NumPy فاصله',tags:['NumPy','فاصله']},
 {id:'two',search:'02 طبقه‌بندی باینری kNN',tags:['طبقه‌بندی','NumPy']},
 {id:'three',search:'03 ارزیابی مدل با scikit-learn',tags:['scikit-learn','ارزیابی مدل']},
 {id:'four',search:'04 انتخاب آستانه Precision Recall ROC-AUC',tags:['Precision / Recall','Threshold']},
];
test('Persian keyboard variants, diacritics, joining characters and numerals normalize',()=>{
 assert.equal(normalizeSearch('  ارزيابيِ كد ۱۲٣  '),'ارزیابی کد 123');
 assert.equal(normalizeSearch('نزدیک‌ترین'),'نزدیک ترین');
});
test('Multiple query terms all match independent of case and order',()=>{
 assert.deepEqual(matchCourseRows(rows,'recall آستانه').map(x=>x.id),['four']);
 assert.deepEqual(matchCourseRows(rows,'نمونه نزدیک ترین').map(x=>x.id),['one']);
 assert.deepEqual(matchCourseRows(rows,'۰۴').map(x=>x.id),['four']);
});
test('Topic filtering intersects the query without mutating the catalog',()=>{
 const before=JSON.stringify(rows);
 assert.deepEqual(matchCourseRows(rows,'','numpy').map(x=>x.id),['one','two']);
 assert.deepEqual(matchCourseRows(rows,'باینری','NumPy').map(x=>x.id),['two']);
 assert.equal(matchCourseRows(rows,'آستانه','NumPy').length,0);
 assert.equal(JSON.stringify(rows),before);
});
test('Unmatched searches, whitespace and reset return predictable results',()=>{
 assert.deepEqual(matchCourseRows(rows,'دادهٔ ناموجود'),[]);
 assert.deepEqual(matchCourseRows(rows,'   '),rows);
 assert.deepEqual(matchCourseRows(rows,'',''),rows);
});
test('Topic choices deduplicate normalized spelling without reordering first appearances',()=>{
 assert.deepEqual(courseTopics([...rows,{id:'five',search:'',tags:['numpy','ارزيابي مدل']}]),
 ['NumPy','فاصله','طبقه‌بندی','scikit-learn','ارزیابی مدل','Precision / Recall','Threshold']);
});
test('Catalog growth is supported and regex-like student input is treated literally',()=>{
 const many=Array.from({length:10},(_,i)=>({id:String(i+1),search:`${String(i+1).padStart(2,'0')} موضوع ${i+1}`,tags:[]}));
 assert.deepEqual(matchCourseRows(many,'۱۰').map(x=>x.id),['10']);
 for(const query of ['[','.*','<script>'])assert.equal(matchCourseRows(rows,query).length,0);
});

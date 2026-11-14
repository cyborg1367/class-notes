const keywords=new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'.split(' '));
const builtins=new Set('print len range int float bool str set dict list tuple sum min max abs all any enumerate zip sorted isinstance round'.split(' '));
// A small lexical highlighter only; Python execution remains in the worker.
// Scan strings/comments as whole tokens so their contents cannot become markup.
export function highlight(code){
 const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const parts=[];let i=0;
 function token(end,kind){const text=escape(code.slice(i,end));parts.push(kind?`<span class="syn-${kind}">${text}</span>`:text);i=end}
 while(i<code.length){
  const rest=code.slice(i);
  if(code[i]==='#'){const end=code.indexOf('\n',i);token(end<0?code.length:end,'comment');continue}
  const string=/^(?:[rubf]{1,2})?("""|'''|"|')/i.exec(rest);
  if(string){
   const quote=string[1];let end=i+string[0].length;
   while(end<code.length){
    if(code[end]==='\\'){end=Math.min(code.length,end+2);continue}
    if(code.startsWith(quote,end)){end+=quote.length;break}
    if(quote.length===1&&(code[end]==='\n'||code[end]==='\r'))break;
    end++;
   }
   token(end,'string');continue;
  }
  const word=/^[A-Za-z_]\w*/.exec(rest);
  if(word){const value=word[0];token(i+value.length,keywords.has(value)?(value==='return'?'return':'keyword'):builtins.has(value)&&code[i-1]!=='.'?'builtin':null);continue}
  const number=/^(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?[\d_]+)?)[jJ]?/.exec(rest);
  if(number){token(i+number[0].length,'number');continue}
  token(i+1,null);
 }
 return parts.join('');
}


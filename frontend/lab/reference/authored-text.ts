import { createElement, type ReactNode } from 'react';

const supported = new Set(['p','strong','em','b','i','code','span','br','ul','ol','li']);
const excluded = new Set(['script','style','iframe','object','embed','template','svg','math','img','video','audio']);

function readNode(node: Node, key: string): ReactNode {
  if (node.nodeType===3) return node.textContent;
  if (node.nodeType!==1) return null;
  const element = node as Element;
  const name = element.localName;
  if (excluded.has(name)) return null;
  const children = Array.from(element.childNodes,(child,i)=>readNode(child,key+'-'+i));
  if (!supported.has(name)) return children;
  const dir = element.getAttribute('dir');
  const lang = element.getAttribute('lang');
  const props = {
    key,
    dir:dir==='rtl'||dir==='ltr'||dir==='auto'?dir:undefined,
    lang:lang&&/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(lang)?lang:undefined,
  };
  return name==='br'?createElement(name,props):createElement(name,props,...children);
}

// The published mission fragments use simple prose and inline code. Parsing
// into a detached template keeps the source inert; only the allowed markup
// and attributes are ever recreated in the page.
export function authoredText(doc: Document, html: string): ReactNode {
  const template = doc.createElement('template');
  template.innerHTML = html;
  return Array.from(template.content.childNodes,(node,i)=>readNode(node,String(i)));
}

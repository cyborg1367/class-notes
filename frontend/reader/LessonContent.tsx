import { createElement, memo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Attributes, ContentNode } from './content-model';
import { CopyCode } from './ReaderControls';
import styles from './LessonContent.module.css';

function props(attrs: Attributes): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const aliases: Record<string,string> = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', colspan: 'colSpan', rowspan: 'rowSpan', readonly: 'readOnly', maxlength: 'maxLength', datetime: 'dateTime' };
  for (const [name, value] of Object.entries(attrs)) {
    if (/^on/i.test(name)) continue;
    if (name === 'style') {
      const parsed: CSSProperties = {};
      for (const declaration of value.split(';')) {
        const colon = declaration.indexOf(':');
        if (colon < 0) continue;
        const rawKey = declaration.slice(0, colon).trim();
        const key = rawKey.startsWith('--') ? rawKey : rawKey.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
        if (key) (parsed as Record<string,string>)[key] = declaration.slice(colon + 1).trim();
      }
      result.style = parsed;
    } else if (['hidden','disabled','required','multiple','open','controls','loop','muted'].includes(name)) result[name] = true;
    else if (name === 'checked') result.defaultChecked = true;
    else result[aliases[name] || name] = value;
  }
  return result;
}
const classes = (authored: string | undefined, own: string) => [authored, own].filter(Boolean).join(' ');

function LessonCodeBlock({ block }: { block: Extract<ContentNode, { kind: 'code' }> }) {
  return <div {...props(block.attrs)} className={classes(block.attrs.class, styles.code)} data-lesson-block="code">
    <div className={'code-head ' + styles.codeHead}><span dir="ltr">{block.label}</span>
      <CopyCode label="کپی کد" text={block.source} />
    </div>
    <pre {...props(block.pre)} className={classes(block.pre.class, styles.codeViewport)} dir="ltr" tabIndex={0}>
      <code className={block.language ? 'language-' + block.language : undefined} dangerouslySetInnerHTML={{ __html: block.html }} />
    </pre>
  </div>;
}
function LessonTable({ block }: { block: Extract<ContentNode, { kind: 'table' }> }) {
  return <div {...props(block.wrapper)} className={classes(block.wrapper.class, styles.tableViewport)} data-lesson-block="table">
    <table {...props(block.attrs)} className={classes(block.attrs.class, styles.table)}><Nodes nodes={block.children} /></table>
  </div>;
}
function LessonSection({ block }: { block: Extract<ContentNode, { kind: 'element' }> }) {
  return <section {...props(block.attrs)} className={classes(block.attrs.class, styles.section)} data-lesson-block="section"><Nodes nodes={block.children} /></section>;
}
function LessonParagraph({ block }: { block: Extract<ContentNode, { kind: 'element' }> }) {
  return <p {...props(block.attrs)} className={classes(block.attrs.class, styles.paragraph)}><Nodes nodes={block.children} /></p>;
}
function LessonFigure({ block }: { block: Extract<ContentNode, { kind: 'element' }> }) {
  return <figure {...props(block.attrs)} className={classes(block.attrs.class, styles.figure)} data-lesson-block="figure"><Nodes nodes={block.children} /></figure>;
}
function LessonHeading({ block }: { block: Extract<ContentNode, { kind: 'element' }> }) {
  return createElement(block.tag, { ...props(block.attrs), className: classes(block.attrs.class, styles.heading) }, <Nodes nodes={block.children} />);
}
function LessonList({ block }: { block: Extract<ContentNode, { kind: 'element' }> }) {
  return createElement(block.tag, { ...props(block.attrs), className: classes(block.attrs.class, styles.list) }, <Nodes nodes={block.children} />);
}
function LessonCallout({ block }: { block: Extract<ContentNode, { kind: 'element' }> }) {
  return createElement(block.tag, { ...props(block.attrs), className: classes(block.attrs.class, styles.callout), 'data-lesson-block': 'callout' }, <Nodes nodes={block.children} />);
}
function LessonIsland({ block }: { block: Extract<ContentNode, { kind: 'island' }> }) {
  return createElement(block.tag, { ...props(block.attrs), 'data-lesson-island': '', ...(['input'].includes(block.tag) ? {} : { dangerouslySetInnerHTML: { __html: block.html } }) });
}
function RenderNode({ node }: { node: ContentNode }): ReactNode {
  if (node.kind === 'text') return node.text;
  if (node.kind === 'code') return <LessonCodeBlock block={node} />;
  if (node.kind === 'table') return <LessonTable block={node} />;
  if (node.kind === 'island') return <LessonIsland block={node} />;
  if (node.tag === 'blockquote' || node.attrs.class?.split(/\s+/).includes('note')) return <LessonCallout block={node} />;
  if (/^h[2-4]$/.test(node.tag)) return <LessonHeading block={node} />;
  if (node.tag === 'ul' || node.tag === 'ol') return <LessonList block={node} />;
  if (node.tag === 'p') return <LessonParagraph block={node} />;
  if (node.tag === 'section' && node.attrs.class?.split(/\s+/).includes('lesson-section')) return <LessonSection block={node} />;
  if (node.tag === 'figure') return <LessonFigure block={node} />;
  const componentClass = node.attrs.class?.split(/\s+/).includes('lesson-prose') ? styles.prose : '';
  return createElement(node.tag, { ...props(node.attrs), ...(componentClass ? { className: classes(node.attrs.class, componentClass) } : {}) },
    ['img','br','hr','wbr','source','area','col'].includes(node.tag) ? undefined : <Nodes nodes={node.children} />);
}
function Nodes({ nodes }: { nodes: ContentNode[] }) {
  return <>{nodes.map((node, index) => <RenderNode key={index} node={node} />)}</>;
}
/** Memoization is deliberate: reading-progress updates must not remount widgets. */
export const LessonContent = memo(function LessonContent({ nodes }: { nodes: ContentNode[] }) {
  return <div data-reader-prose="" className={styles.document}><Nodes nodes={nodes} /></div>;
});

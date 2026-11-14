/** A sanitized, serializable document model. Lesson content never owns page CSS. */
export type Attributes = Record<string, string>;
export type ContentNode =
  | { kind: 'text'; text: string }
  | { kind: 'element'; tag: string; attrs: Attributes; children: ContentNode[] }
  | { kind: 'code'; attrs: Attributes; pre: Attributes; source: string; html: string; language: string; label: string }
  | { kind: 'table'; attrs: Attributes; wrapper: Attributes; children: ContentNode[] }
  | { kind: 'island'; tag: string; attrs: Attributes; html: string };

const attributes = (node: Element): Attributes => Object.fromEntries(
  Array.from(node.attributes).filter(attr => attr.name !== 'style').map(attr => [attr.name, attr.value]),
);
export const LEGACY_ISLAND_SELECTOR = '.mini-lab,.knn-explorer,.space-view,.problem-role-lab,.katex,.lesson-formula,.interactive-distance,.consult-votes,[data-medical-knn],.table-card';

export function isStandardCodeBlock(element: Element | null) {
  return !!element && element.querySelectorAll('pre').length === 1 &&
    Array.from(element.children).every(child => child.matches('.code-head,pre'));
}

/** Adapt existing private HTML once, at the trust boundary. Interactive islands
 * retain their sanitized markup, IDs and script hooks; regular blocks become React. */
export function readContent(nodes: Iterable<Node>): ContentNode[] {
  return Array.from(nodes).flatMap(node => {
    if (node.nodeType === 3) return [{ kind: 'text', text: node.textContent || '' } as ContentNode];
    if (node.nodeType !== 1) return [];
    const element = node as Element, tag = element.localName;
    if (element.matches(LEGACY_ISLAND_SELECTOR) || ['svg','math','script','canvas','input','button','select','textarea'].includes(tag)) {
      const attrs = attributes(element);
      // SVG and math retain presentation attributes, already sanitized by clean().
      if (element.hasAttribute('style')) attrs.style = element.getAttribute('style')!;
      return [{ kind: 'island', tag, attrs, html: element.innerHTML } as ContentNode];
    }
    if (element.matches('.code-block')) {
      const blocks = element.querySelectorAll('pre');
      const pre = blocks[0];
      if (isStandardCodeBlock(element)) {
        const code = pre.querySelector('code') || pre;
        const language = code.className.match(/(?:language|lang)-([\w-]+)/)?.[1] || '';
        return [{ kind: 'code', attrs: attributes(element), pre: attributes(pre),
          source: pre.textContent || '', html: code.innerHTML, language,
          label: element.querySelector('.code-head > span')?.textContent || (language === 'python' ? 'Python' : 'کد'),
        } as ContentNode];
      }
    }
    if (element.matches('.code-block')) return [{ kind: 'island', tag, attrs: attributes(element), html: element.innerHTML } as ContentNode];
    if (element.matches('.reader-table-scroll')) {
      const table = element.querySelector(':scope > table');
      if (table && element.childElementCount === 1) return [{ kind: 'table', attrs: attributes(table), wrapper: attributes(element), children: readContent(table.childNodes) } as ContentNode];
    }
    if (element.matches('.reader-table-scroll')) return [{ kind: 'island', tag, attrs: attributes(element), html: element.innerHTML } as ContentNode];
    return [{ kind: 'element', tag, attrs: attributes(element), children: readContent(element.childNodes) } as ContentNode];
  });
}

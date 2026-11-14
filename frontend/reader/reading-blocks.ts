import { LEGACY_ISLAND_SELECTOR } from './content-model';
import { highlight } from '../../web/assets/python-highlight.mjs';

/** Presentation normalization runs after sanitizing, without editing prose,
 * mathematical markup or interactive figure controls. Copy slots retain the
 * exact pre.textContent; highlighting only adds escaped token spans. */
export function prepareReadingBlocks(scope: ParentNode, doc: Document) {
  for (const pre of scope.querySelectorAll<HTMLPreElement>('pre')) {
    if (pre.closest(LEGACY_ISLAND_SELECTOR)) continue;
    let block = pre.closest('.code-block');
    if (!block && !pre.querySelector(':scope > code')) continue;
    if (!block) {
      block = doc.createElement('div');
      block.className = 'code-block';
      pre.replaceWith(block);
      block.append(pre);
    }
    let head = block.querySelector('.code-head');
    if (!head) {
      head = doc.createElement('div');
      head.className = 'code-head';
      const label = doc.createElement('span');
      const language = pre.querySelector('code')?.className.match(/(?:language|lang)-([\w-]+)/)?.[1];
      label.textContent = /^(?:python|py)$/i.test(language || '') ? 'Python' : language || 'کد';
      head.append(label);
      block.prepend(head);
    }
    if (!block.querySelector('.copy-code')) {
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = 'کپی کد';
      head.append(button);
    }
    pre.classList.add('reader-code');
    pre.dir = 'ltr';
    pre.tabIndex = 0;
    const code = pre.querySelector('code') || pre;
    const language = code.className.match(/(?:language|lang)-([\w-]+)/)?.[1]?.toLowerCase();
    const label = pre.closest('.code-block')?.querySelector('.code-head')?.textContent || '';
    const source = code.textContent || '';
    const python = language ? /^(?:python|py)$/.test(language)
      : /\bpython\b/i.test(label) || /^\s*(?:from \w|import \w|def \w|class \w|print\()/m.test(source);
    // Preserve existing authored highlighting; never tokenize output or widgets.
    if (!python || code.children.length) continue;
    code.innerHTML = highlight(source);
  }
  for (const table of scope.querySelectorAll<HTMLTableElement>('table')) {
    if (table.closest(LEGACY_ISLAND_SELECTOR)) continue;
    table.classList.add('reader-table');
    let wrapper = table.parentElement;
    const existing = wrapper?.matches('.table-scroll,.threshold-table-scroll,.portal-table-scroll,.reader-table-scroll');
    if (!existing) {
      wrapper = doc.createElement('div');
      table.replaceWith(wrapper);
      wrapper.append(table);
    }
    wrapper!.classList.add('reader-table-scroll');
    wrapper!.tabIndex = 0;
    wrapper!.setAttribute('role', 'region');
    if (!wrapper!.hasAttribute('aria-label') && !wrapper!.hasAttribute('aria-labelledby')) {
      wrapper!.setAttribute('aria-label', table.caption?.textContent?.trim() || 'جدول آموزشی؛ برای دیدن ستون‌ها به طرفین پیمایش کن');
    }
    for (const th of table.querySelectorAll('thead th')) {
      if (!th.hasAttribute('scope')) th.setAttribute('scope', 'col');
    }
  }
}

import type { EndResources, Heading, HeroContent, HeroVisual, LessonInfo, LessonPayload, PreparedLesson, Slot, SlotContent } from './contracts';
import { binaryPlot } from './lesson-model';
import { downloadTypes, imageTypes, isCourseObject, lessonLink, localFragment } from './paths';

const forbidden = 'base,link,meta,style,iframe,frame,object,embed,foreignObject,animate,animateMotion,animateTransform,set,applet,template';
const uriAttrs = new Set(['srcdoc', 'srcset', 'ping', 'action', 'formaction', 'background', 'poster', 'usemap', 'codebase', 'manifest']);
const urlPresentation = /^(?:style|fill|stroke|clip-path|mask|filter|cursor|marker(?:-start|-mid|-end)?)$/;
const text = (element: Element) => (element.textContent || '').trim().replace(/\s+/g, ' ');

// This boundary handles instructor-authored fragments. Retain MathML, SVG and
// inert teaching data, while dropping executable markup and resource URLs.
function clean(template: HTMLTemplateElement, course: string, page: URL, base: URL) {
  template.content.querySelectorAll(forbidden).forEach(node => node.remove());
  for (const script of template.content.querySelectorAll('script')) {
    if (script.getAttribute('type') !== 'application/json' || script.hasAttribute('src') ||
      !/^[\w-]+$/.test(script.id)) script.remove();
  }
  for (const form of template.content.querySelectorAll('form')) form.replaceWith(...form.childNodes);
  for (const element of template.content.querySelectorAll('*')) {
    if (element.localName.includes('-')) { element.remove(); continue; }
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase(), raw = attr.value.trim();
      if (name.startsWith('on') || name.startsWith('data-reader-') || name === 'is' || uriAttrs.has(name)) element.removeAttribute(attr.name);
      else if (name === 'data-private-path' &&
        (!element.matches('img') || !isCourseObject(raw, course, imageTypes))) element.removeAttribute(attr.name);
      else if (name === 'data-private-download' &&
        (!element.matches('a') || !isCourseObject(raw, course, downloadTypes))) element.removeAttribute(attr.name);
      else if (name === 'src' || name === 'href' || name === 'xlink:href') {
        const url = name === 'src'
          ? element.matches('img') && !element.hasAttribute('data-private-path') && lessonLink(raw, page, base, true)
          : element.matches('a') ? lessonLink(raw, page, base) : raw.startsWith('#') && raw;
        if (url) element.setAttribute(attr.name, url); else element.removeAttribute(attr.name);
      } else if (urlPresentation.test(name) &&
        /url\s*\(|@import|expression\s*\(|\\|\/\*/i.test(raw) &&
        /url\s*\(|@import|expression\s*\(|\\|\/\*/i.test(raw.replace(/url\(\s*#[\w.-]+\s*\)/gi, ''))) {
        element.removeAttribute(attr.name);
      }
    }
    if (element.matches('a[target]')) element.setAttribute('rel', 'noopener noreferrer');
  }
}

function pickHeadings(scope: Element, ids: Set<string>): Heading[] {
  const seen = new Set<string>();
  return Array.from(scope.querySelectorAll('a[href^="#"]')).flatMap(anchor => {
    let id: string;
    try { id = decodeURIComponent(anchor.getAttribute('href')!.slice(1)); } catch { return []; }
    if (!ids.has(id) || seen.has(id)) return [];
    seen.add(id);
    const number = anchor.querySelector('.rail-num')?.textContent?.trim();
    const label = number ? text(anchor).slice(number.length).trim() : text(anchor);
    return label ? [{ id, label, number }] : [];
  });
}

function collectResources(tree: DocumentFragment, payload: LessonPayload, info: LessonInfo): EndResources {
  const authored = Array.from(tree.querySelectorAll<HTMLAnchorElement>(
    '.portal-quiz-link [data-private-download], .lesson-resources [data-private-download], .notebook-download [data-private-download]',
  ), anchor => ({ path: anchor.dataset.privateDownload!, label: text(anchor) }));
  const exact = (extension: string) => authored.find(item => item.path.toLowerCase().endsWith(extension))?.path;
  const pdf = exact('.pdf') ||
    (isCourseObject(payload.pdf_path, info.course.id, ['.pdf']) ? payload.pdf_path : null) ||
    tree.querySelector<HTMLElement>('.lesson-rail [data-private-download$=".pdf"]')?.dataset.privateDownload || null;
  const catalogNotebook = info.notebook ? info.course.id + '/' + info.notebook : null;
  const notebook = exact('.ipynb') ||
    (isCourseObject(catalogNotebook, info.course.id, ['.ipynb']) ? catalogNotebook : null);
  const note = tree.querySelector('.portal-quiz-link .small-note,.lesson-resources .small-note');
  const existingId = tree.querySelector<HTMLElement>('.portal-quiz-link[id],.lesson-resources[id]')?.id || 'resources';
  let id = existingId;
  // Keep the original resource fragment unless it belongs to an authored topic.
  const contentIds = new Set(Array.from(tree.querySelectorAll('[id]')).filter(
    element => !element.closest('.portal-quiz-link,.lesson-resources'),
  ).map(element => element.id));
  for (let index = 1; contentIds.has(id); index++) id = 'reader-resources-' + index;
  return {
    id, pdf, notebook, note: note ? text(note) : '',
    extras: authored.filter((item, i) => !/\.(pdf|ipynb)$/i.test(item.path) &&
      authored.findIndex(other => other.path === item.path) === i),
  };
}

function legacyStudyControl(link: HTMLElement, doc: Document) {
  const label = text(link).replace(/[\u200c-\u200f\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ');
  if (/^(?:(?:شروع|آغاز) (?:مطالعه|خواندن)|(?:مطالعه|خواندن)[ٔ\s]+(?:یادداشت|درس))/.test(label)) return true;
  if (!link.matches('a[href]') || (!link.closest('.hero-actions') && !link.matches('.button-primary,.button-forest'))) return false;

  // Template contents have an inert owner document. Resolve the raw href
  // against the real route, including GitHub Pages prefixes and preview bases.
  const route = (url: URL) => url.origin + url.pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '');
  try {
    const target = new URL(link.getAttribute('href') || '', doc.location.href);
    return Boolean(target.hash) && [route(new URL(doc.location.href)), route(new URL(doc.baseURI))].includes(route(target));
  } catch { return false; }
}

function collectHero(source: Element | null, tree: DocumentFragment, info: LessonInfo, doc: Document): HeroContent {
  const authoredCopy = source?.querySelector('.hero-copy');
  const copy = authoredCopy || (source?.cloneNode(true) as Element | undefined);
  if (!authoredCopy) copy?.querySelectorAll('.hero-figure,.hero-strip').forEach(node => node.remove());
  const eyebrow = copy?.querySelector(':scope > .eyebrow');
  const eyebrowHTML = eyebrow?.innerHTML || '';
  eyebrow?.remove();
  const title = copy?.querySelector('h1');
  title?.querySelectorAll('br').forEach(node => node.replaceWith(doc.createTextNode(' ')));
  const titleHTML = title?.innerHTML.trim() || '';
  title?.remove();
  const meta = copy?.querySelector('.hero-meta');
  const metaHTML = meta?.innerHTML || '';
  meta?.remove();
  for (const link of copy?.querySelectorAll<HTMLElement>('a,button') ?? []) {
    if (!legacyStudyControl(link, doc)) continue;
    const parent = link.parentElement;
    link.remove();
    if (parent && parent !== copy && parent.matches('p') && !parent.children.length && !text(parent)) parent.remove();
  }
  const actions = copy?.querySelector('.hero-actions');
  if (actions && !actions.children.length && !text(actions)) actions.remove();
  const figure = source?.querySelector<HTMLElement>('.hero-figure');
  const highlights = Array.from(source?.querySelectorAll('.hero-strip li') ?? [], (item, index) => {
    const number = item.querySelector('.strip-number');
    const label = item.querySelector('.strip-text');
    const display = number?.textContent?.trim() || String(index + 1).padStart(2, '0');
    number?.remove();
    return { number: display, html: label?.innerHTML || item.innerHTML };
  }).filter(item => item.html.trim());
  const binary = !figure && info.hero_kind === 'binary2d'
    ? binaryPlot(tree.querySelector('#medical-knn-data')?.textContent) : null;
  const visual: HeroVisual | null = info.hero_kind === 'threshold-scores' ? { kind: 'threshold-scores' }
    : figure ? { kind: 'authored', html: figure.innerHTML, className: figure.className }
    : binary ? { kind: 'binary', plot: binary } : null;
  return { eyebrow: eyebrowHTML, titleHTML, copy: copy?.innerHTML || '', meta: metaHTML, highlights, visual };
}

export function prepareLesson(doc: Document, payload: LessonPayload, info: LessonInfo, href: (route: string) => string): PreparedLesson {
  if (typeof payload.body !== 'string' || !payload.body.trim()) throw Error('LESSON_BODY_UNAVAILABLE');
  const template = doc.createElement('template');
  template.innerHTML = payload.body;
  const tree = template.content;
  clean(template, info.course.id, new URL(doc.baseURI), new URL(href('')));
  tree.querySelectorAll('.breadcrumb, #exercise, [data-python-lab], .python-lab, [data-cloud-tools]').forEach(el => el.remove());
  tree.querySelectorAll('a[href="#exercise"]').forEach(el => (el.closest('li') || el).remove());

  const heroSource = tree.querySelector('.lesson-hero');
  const rail = tree.querySelector('.lesson-rail');
  const body = tree.querySelector<HTMLElement>('.lesson-body');
  const targets = new Map(Array.from(tree.querySelectorAll<HTMLElement>('[id]'), node => [node.id, node]));
  const ids = new Set(targets.keys());
  const desktopList = rail?.querySelector('.rail-list');
  const mobileList = tree.querySelector('.mobile-toc');
  const resources = collectResources(tree, payload, info);
  const fact = rail?.querySelector('.rail-fact')?.innerHTML || '';
  const endSelector = '.adjacent-lessons,.portal-quiz-link,.lesson-resources,.lesson-footer,.notebook-download';
  let headings = desktopList ? pickHeadings(desktopList, ids) : [];
  if (!headings.length && mobileList) headings = pickHeadings(mobileList, ids);
  headings = headings.filter(({ id }) => !targets.get(id)?.closest(endSelector));

  const slots: Slot[] = [];
  const place = (node: HTMLElement, slot: SlotContent) => {
    const key = String(slots.length);
    node.setAttribute('data-reader-slot', key);
    slots.push({ ...slot, key });
    return node;
  };
  for (const button of tree.querySelectorAll<HTMLElement>('.copy-code')) {
    const code = targets.get(button.dataset.copyCode || '') || button.closest('.code-block')?.querySelector('pre');
    if (!code?.textContent) continue;
    button.replaceWith(place(doc.createElement('span'), {
      kind: 'copy', label: button.getAttribute('aria-label') || 'کپی کد', text: code.textContent,
    }));
  }
  for (const anchor of tree.querySelectorAll<HTMLAnchorElement>('[data-private-download]')) {
    if (anchor.closest('.lesson-rail,' + endSelector)) continue;
    anchor.replaceWith(place(doc.createElement('span'), {
      kind: 'download', label: text(anchor), path: anchor.dataset.privateDownload!, className: anchor.className,
    }));
  }
  for (const anchor of tree.querySelectorAll('a[href^="#"]')) {
    anchor.setAttribute('href', localFragment(anchor.getAttribute('href')!, doc));
  }
  const hero = collectHero(heroSource, tree, info, doc);

  tree.querySelectorAll(endSelector + ',.mobile-toc,#reading-progress').forEach(node => node.remove());
  rail?.remove();
  heroSource?.remove();
  const content = body || tree;
  if (body) {
    for (const data of tree.querySelectorAll('script[type="application/json"]')) {
      if (!body.contains(data)) body.append(data);
    }
  }
  const contentIds = new Set(Array.from(content.querySelectorAll('[id]'), node => node.id));
  headings = headings.filter(({ id }) => contentIds.has(id));
  if (!headings.length) {
    headings = Array.from(content.querySelectorAll<HTMLElement>('.lesson-section[id]')).flatMap(section => {
      const label = section.querySelector('h2,h3');
      return label && text(label) ? [{ id: section.id, label: text(label) }] : [];
    });
  }
  if (resources.pdf || resources.notebook || resources.extras.length || info.quiz_version) {
    headings.push({ id: resources.id, label: 'منابع و تمرین' });
  }
  const numbered = headings.map((heading, index) => ({ ...heading, number: String(index + 1).padStart(2, '0') }));
  return { hero, html: body?.innerHTML ?? template.innerHTML, fact, slots, headings: numbered, resources };
}

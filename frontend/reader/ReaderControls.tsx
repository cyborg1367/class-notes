import { Fragment, useEffect, useRef, useState } from 'react';
import type { Heading } from './contracts';
import type { ReaderResources } from './resources';
import { localFragment } from './paths';

export function Contents({ headings, active, rail, doc }: { headings: Heading[]; active: string; rail: boolean; doc: Document }) {
  return <>{headings.map(({ id, label, number }) => {
    const link = <a href={localFragment('#' + encodeURIComponent(id), doc)} aria-current={active === id ? 'location' : undefined}
      className={active === id ? 'is-current' : undefined}>
      {rail && number && <span className="rail-num" aria-hidden="true">{number}</span>}<span>{label}</span>
    </a>;
    return rail ? <li key={id}>{link}</li> : <Fragment key={id}>{link}</Fragment>;
  })}</>;
}

export function CopyCode({ label, text }: { label: string; text: string }) {
  const [status, setStatus] = useState<'idle' | 'copying' | 'copied' | 'failed'>('idle');
  const revision = useRef(0);
  useEffect(() => () => { revision.current++; }, []);
  useEffect(() => {
    if (status !== 'copied') return;
    const timer = setTimeout(() => setStatus('idle'), 1500);
    return () => clearTimeout(timer);
  }, [status]);
  return <button type="button" className="reader-copy" aria-label={status === 'idle' ? label : undefined}
    disabled={status === 'copying'} onClick={async event => {
      const clipboard = event.currentTarget.ownerDocument.defaultView?.navigator.clipboard;
      const ticket = ++revision.current;
      setStatus('copying');
      try {
        if (!clipboard) throw Error('CLIPBOARD_UNAVAILABLE');
        await clipboard.writeText(text);
        if (ticket === revision.current) setStatus('copied');
      } catch { if (ticket === revision.current) setStatus('failed'); }
    }}>
    {status === 'copied' ? 'کپی شد' : status === 'failed' ? 'کد را انتخاب و کپی کن' : status === 'copying' ? 'در حال کپی…' : 'کپی کد'}
  </button>;
}

export function PrivateDownload({ path, label, className, files, preview }: {
  path: string; label: string; className: string; files: ReaderResources; preview?: boolean;
}) {
  const [status, setStatus] = useState<'idle' | 'busy' | 'error'>('idle');
  const busy = useRef(false);
  return <>
    <button className={className} type="button" data-reader-download="" disabled={status === 'busy' || preview}
      onClick={async event => {
        if (busy.current) return;
        const document = event.currentTarget.ownerDocument;
        busy.current = true; setStatus('busy');
        try {
          const src = await files.load(path);
          if (!files.alive()) return;
          const anchor = document.createElement('a');
          anchor.href = src; anchor.download = path.split('/').pop() || 'lesson';
          document.body.append(anchor); anchor.click(); anchor.remove();
          setStatus('idle');
        } catch { if (files.alive()) setStatus('error'); }
        finally { busy.current = false; }
      }}>
      {status === 'busy' ? 'در حال دریافت…' : label}
    </button>
    {status === 'error' && <small className="reader-resource-error" role="status">فایل دریافت نشد. دوباره تلاش کن.</small>}
  </>;
}

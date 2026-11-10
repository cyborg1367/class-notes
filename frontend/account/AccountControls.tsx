import React, { useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { PaperIcon } from '../components/PaperIcon';
import { GoogleMark } from '../components/GoogleMark';
import type { AccountPort, AccountView } from './contracts';
import { useAccountMenu } from './useAccountMenu';

function AccountAvatar({ person }: { person: NonNullable<AccountView['identity']> }) {
  const [failed, setFailed] = useState('');
  return <span className="account-avatar" aria-hidden="true">
    <span>{person.initial}</span>
    {person.avatar && failed !== person.avatar && <img src={person.avatar} referrerPolicy="no-referrer" alt="" decoding="async" onError={() => setFailed(person.avatar)} />}
  </span>;
}

export function AccountControls({ port, scope, compact = false, container }: {
  port: AccountPort; scope: string; compact?: boolean; container?: HTMLElement;
}) {
  const view = useSyncExternalStore(port.subscribe, port.getSnapshot, port.getServerSnapshot);
  const menu = useAccountMenu(port, view, scope);
  const person = view.identity;
  const menuId = 'cn-account-menu-' + scope;
  useLayoutEffect(() => { port.hostReady(); }, [port, view.phase]);

  const contents = person && <section
    ref={menu.menu} className="account-popover" id={menuId} aria-label="حساب کاربری"
    hidden={!menu.open} style={menu.open ? menu.position : undefined} onKeyDown={menu.keydown}
  >
    <div className="account-person"><strong dir="auto">{person.name}</strong><bdi dir="ltr">{person.email}</bdi></div>
    <div className="account-menu-items" role="menu" aria-label="عملیات حساب" onClick={event => { if ((event.target as Element).closest('a')) menu.close(); }}>
      <a className="account-menu-dashboard" role="menuitem" tabIndex={-1} href={view.links.dashboard}><PaperIcon name="dashboard" />داشبورد من</a>
      <a role="menuitem" tabIndex={-1} href={view.links.account}><PaperIcon name="user" />حساب کاربری</a>
      {view.links.review && <a role="menuitem" tabIndex={-1} href={view.links.review}><PaperIcon name="review" />دفتر مرور شخصی</a>}
      {view.teacher && <a role="menuitem" tabIndex={-1} href={view.links.teacher}><PaperIcon name="dashboard" />پنل مدرس</a>}
      <button className="account-exit" type="button" role="menuitem" tabIndex={-1} data-account-signout="" data-react-account-action="" disabled={Boolean(view.busy)} onClick={() => { void port.signOut(); }}><PaperIcon name="exit" /><span>{view.busy === 'out' ? 'در حال خروج…' : 'خروج از حساب'}</span></button>
    </div>
  </section>;

  return <div ref={menu.root} className={'account-controls' + (compact ? ' account-controls-compact' : '')}
    dir="rtl" data-account-scope={scope} data-auth-state={view.phase === 'authenticated' ? 'member' : view.phase} aria-busy={view.phase === 'loading' || Boolean(view.busy)}>
    {view.phase === 'loading' && <a className="account-fallback" data-account-link="" href={view.links.account}>حساب کاربری</a>}
    {view.phase === 'error' && <a className="account-fallback" href={view.links.account}>حساب کاربری</a>}
    {view.phase === 'guest' && <button className="account-signin" type="button" data-account-signin="" data-react-account-action="" disabled={Boolean(view.busy)} aria-label="ورود با Google" onClick={() => { void port.signIn(); }}>
      <GoogleMark /><span className="account-signin-full">ورود با <bdi lang="en">Google</bdi></span><span className="account-signin-short" aria-hidden="true">ورود</span>
    </button>}
    {view.phase === 'authenticated' && person && <>
      {!compact && <a className="account-dashboard" href={view.links.dashboard}>داشبورد من</a>}
      <span data-notification-anchor="" />
      <button ref={menu.trigger} className="account-trigger" type="button" data-account-trigger=""
        aria-label={'منوی حساب ' + person.name} aria-haspopup="menu" aria-expanded={menu.open} aria-controls={menuId} disabled={Boolean(view.busy)}
        onClick={() => menu.open ? menu.close() : menu.show()}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); menu.show(event.key === 'ArrowUp' ? 'last' : 'first'); }
        }}
      ><AccountAvatar person={person} /><span className="account-trigger-name">{person.name.split(/\s+/)[0]}</span><PaperIcon name="chevron" /></button>
      {menu.open && container ? createPortal(<div className={'account-controls account-menu-portal' + (compact ? ' account-controls-compact' : '')} dir="rtl">{contents}</div>, container) : contents}
    </>}
  </div>;
}

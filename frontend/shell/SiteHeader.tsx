import React, { useEffect } from 'react';
import { PaperIcon } from '../components/PaperIcon';
import { ShellModel } from './shell-model';
import { LegacyPresenceSlot } from './LegacyServiceSlot';
import { AccountControls } from '../account/AccountControls';
import { AccountDialogs } from '../account/AccountDialogs';
import type { AccountPort } from '../account/contracts';
import { useNavigation } from './useNavigation';

type SiteHeaderProps = {
  model: ShellModel;
  onReady?: () => void;
  account: AccountPort;
  container?: HTMLElement;
};

export function SiteHeader({ model, onReady, account, container }: SiteHeaderProps) {
  const navigation = useNavigation();

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <><div className="shell portal-nav">
      <a className="brand" href={model.home}>
        <img src={model.logo} width="37" height="37" alt="" />
        <span className="brand-name">
          دفتر کلاس<small lang="en">CLASS NOTES</small>
        </span>
      </a>
      <button
        ref={navigation.button}
        className="nav-menu"
        type="button"
        aria-controls="portal-nav"
        aria-expanded={navigation.open}
        aria-label={navigation.open ? 'بستن فهرست' : 'بازکردن فهرست'}
        onClick={navigation.toggle}
      >
        فهرست <PaperIcon name="menu" />
      </button>
      <nav
        ref={navigation.nav}
        className={'portal-links' + (navigation.open ? ' is-open' : '')}
        id="portal-nav"
        aria-label="پیمایش اصلی"
        onClick={event => {
          if ((event.target as Element).closest('a')) {
            navigation.close();
          }
        }}
      >
        {model.links.map(link => (
          <a
            key={link.id}
            href={link.href}
            aria-current={link.current}
            data-review-nav={link.id === 'review' ? '' : undefined}
          >
            <PaperIcon name={link.icon} />
            <span>{link.label}</span>
          </a>
        ))}
      </nav>
      <LegacyPresenceSlot />
      <div className="shell-service-slot shell-account-slot" data-shell-account-slot=""><AccountControls port={account} scope="header" container={container} /></div>
    </div><AccountDialogs port={account} container={container} /></>
  );
}

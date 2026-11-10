import React, { useSyncExternalStore } from 'react';
import { INITIAL_HOME_VIEW } from '../../web/assets/home-view-model.mjs';
import { GoogleMark } from '../components/GoogleMark';
import type { HomeChannel, HomeView } from './contracts';

export function HomeAccountLink({ channel }: { channel: HomeChannel }) {
  const view = useSyncExternalStore(channel.subscribe, channel.getSnapshot, () => INITIAL_HOME_VIEW) as HomeView;
  // Before session recovery the plain account link is still safe and useful.
  const disabled = view.busy;
  return (
    <><a
      className="button-outline home-account-link"
      data-home-react-account=""
      aria-disabled={disabled}
      href={view.phase === 'authenticated' ? view.dashboardURL : view.accountURL}
      onClick={event => {
        if (disabled) {
          event.preventDefault();
        } else if (view.phase === 'guest' && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          void channel.perform('sign-in');
        }
      }}
    >
      {view.phase === 'authenticated' ? 'رفتن به داشبورد' : view.phase === 'guest' ? <><GoogleMark /><span>ورود با <bdi lang="en">Google</bdi></span></> : 'حساب کاربری'}
    </a>
    {view.errorMessage && <p className="status-line home-auth-error" data-error="true" role="alert">{view.errorMessage}</p>}</>
  );
}

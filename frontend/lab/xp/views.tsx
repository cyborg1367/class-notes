import type { CSSProperties } from 'react';
import { remainingRing, type LabProgress, type LabReward } from './model';

function Ring({ reward = false }: { reward?: boolean }) {
  const r = reward ? 108 : 100;
  return <svg className="xp-ring" viewBox="0 0 240 240" aria-hidden="true">
    <circle className="xp-ring-disc" cx="120" cy="120" r="99" />
    <circle className="xp-ring-track" cx="120" cy="120" r={r} pathLength="100" />
    <circle className="xp-ring-fill" data-celebration-ring={reward ? '' : undefined} cx="120" cy="120" r={r} pathLength="100" />
  </svg>;
}

export function Progress({ progress: { xp,maximum,completed,total } }: { progress: LabProgress }) {
  const style = { '--xp-to':remainingRing(xp,maximum) } as CSSProperties;
  return <div className={'mission-xp'+(xp===maximum?' is-complete':'')} lang="en" dir="ltr" style={style}>
    <div className="mission-xp-orbit" data-header-progress="" role="progressbar" aria-label="Lab XP"
      aria-valuemin={0} aria-valuemax={maximum} aria-valuenow={xp}
      aria-valuetext={xp+' of '+maximum+' XP; '+completed+' of '+total+' missions completed'}>
      <Ring /><div className="mission-xp-core" aria-hidden="true"><strong className="mission-xp-value" data-xp="">{xp}</strong></div>
    </div>
    <div className="mission-xp-copy">
      <span className="mission-xp-limit">of <span data-xp-maximum="">{maximum}</span> XP</span>
      <p className="mission-xp-count" data-count="">{completed} of {total} completed</p>
      <span className="mission-xp-percent" data-xp-percent="">{Math.round(xp/maximum*100)}% complete</span>
    </div>
  </div>;
}

export function RewardDialog({ reward,onDismiss }: { reward: LabReward; onDismiss(advance: boolean): void }) {
  const { earned,from,to,maximum,finished } = reward;
  const style = {
    '--xp-from':remainingRing(from,maximum), '--xp-to':remainingRing(to,maximum),
    '--xp-turn-from':from/maximum*360+'deg', '--xp-turn-to':to/maximum*360+'deg',
  } as CSSProperties;
  return <dialog className={'xp-celebration is-celebrating'+(finished?' is-complete':'')} data-celebration="" lang="en" dir="ltr" style={style}
    aria-labelledby="xp-celebration-title" aria-describedby="xp-celebration-message xp-celebration-detail"
    onCancel={event=>{event.preventDefault();onDismiss(false);}}
    onClose={event=>{if(!event.currentTarget.open)onDismiss(false);}}
    onClick={event=>{
      if (event.target!==event.currentTarget) return;
      const box=event.currentTarget.getBoundingClientRect();
      if (event.clientX<box.left || event.clientX>box.right || event.clientY<box.top || event.clientY>box.bottom) onDismiss(false);
    }}>
    <button className="xp-celebration-close" data-celebration-close="" type="button" aria-label="Close celebration" onClick={()=>onDismiss(false)}>
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
    </button>
    <div className="xp-orbit">
      <Ring reward /><span className="xp-ring-tip" aria-hidden="true"><i /></span>
      <div className="xp-celebration-core">
        <span className="xp-celebration-check" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18"><path d="m5.5 12 4 4L18.5 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        <h2 id="xp-celebration-title"><span data-celebration-earned="">+{earned}</span> <span className="xp-celebration-unit">XP</span></h2>
        <span className="xp-celebration-label">XP earned</span>
      </div>
      {['one','two','three','four'].map(name=><span key={name} className={'xp-spark xp-spark-'+name} aria-hidden="true" />)}
    </div>
    <p className="xp-celebration-message" id="xp-celebration-message">{finished?'Lab completed!':'Nicely done!'}</p>
    <p className="xp-celebration-total" id="xp-celebration-detail" data-celebration-progress="" role="progressbar" aria-label="Total lab XP"
      aria-valuemin={0} aria-valuemax={maximum} aria-valuenow={to} aria-valuetext={to+' of '+maximum+' XP'}>
      <span data-celebration-total="">{to}</span><span className="xp-celebration-divider"> / </span><span data-celebration-maximum="">{maximum}</span> XP
    </p>
    <button className="xp-celebration-continue" data-celebration-continue="" type="button" onClick={()=>onDismiss(true)}>Continue
      <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  </dialog>;
}

export function InlineReward({ reward }: { reward: LabReward | null }) {
  // Keep the live region mounted so text updates are announced even without dialog support.
  return <div className={reward?'mission-award':'lab-sr-only'} data-award="" role="status" lang="en" dir="ltr">
    {reward ? '+'+reward.earned+' XP · '+reward.to+' of '+reward.maximum+' XP' : ''}
  </div>;
}

import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { boundedShare, defaultShare, splitBounds, type SplitAxis } from './model';

type Options = {
  axis: SplitAxis;
  share: number;
  disabled?: boolean;
  change(value:number,remember:boolean): void;
  save(): void;
};

export function useSplitter({axis,share,disabled=false,change,save}: Options) {
  const container=useRef<HTMLDivElement>(null);
  const drag=useRef<((persist:boolean)=>void)|null>(null);
  const [size,setSize]=useState(axis==='row'?560:1200);
  const [narrow,setNarrow]=useState(false);
  const [dragging,setDragging]=useState(false);
  const unavailable=disabled||(axis==='column'&&narrow);
  const ratio=boundedShare(axis,share,size);
  const {min,max}=splitBounds(axis,size);
  const changeRef=useRef(change),saveRef=useRef(save);
  useLayoutEffect(()=>{changeRef.current=change;saveRef.current=save;},[change,save]);

  useLayoutEffect(()=>{
    const element=container.current, win=element?.ownerDocument.defaultView;
    if(!element||!win)return;
    const media=axis==='column'?win.matchMedia?.('(max-width:860px)'):null;
    const measure=()=>{
      const rect=element.getBoundingClientRect();
      if(axis==='row')setSize(rect.height||560);
      else {
        setSize(rect.width||win.innerWidth||1200);
        setNarrow(media?.matches??win.innerWidth<=860);
      }
    };
    const observer=win.ResizeObserver?new win.ResizeObserver(measure):null;
    observer?.observe(element);
    win.addEventListener('resize',measure);
    media?.addEventListener?.('change',measure);
    measure();
    return ()=>{
      drag.current?.(false);
      observer?.disconnect();
      win.removeEventListener('resize',measure);
      media?.removeEventListener?.('change',measure);
    };
  },[axis]);
  useLayoutEffect(()=>{if(unavailable)drag.current?.(false);},[unavailable]);

  function start(event:PointerEvent<HTMLDivElement>){
    if(unavailable||drag.current||event.button!==0)return;
    const handle=event.currentTarget, win=handle.ownerDocument.defaultView;
    if(!win)return;
    event.preventDefault();
    handle.focus({preventScroll:true});
    const id=event.pointerId, origin=axis==='row'?event.clientY:event.clientX;
    const initial=ratio, range=Math.max(1,size-(axis==='row'?12:8));
    function move(next:globalThis.PointerEvent){
      if(next.pointerId!==id)return;
      const delta=(axis==='row'?next.clientY-origin:origin-next.clientX)/range*100;
      changeRef.current(boundedShare(axis,initial+delta,size),false);
    }
    function release(next:globalThis.PointerEvent){if(next.pointerId===id)finish(true);}
    function finish(persist:boolean){
      if(!drag.current)return;
      drag.current=null;
      win!.removeEventListener('pointermove',move);
      win!.removeEventListener('pointerup',release);
      win!.removeEventListener('pointercancel',release);
      handle.removeEventListener('lostpointercapture',release);
      try{if(handle.hasPointerCapture?.(id))handle.releasePointerCapture(id);}catch{/* Capture is optional. */}
      if(persist)saveRef.current();
      setDragging(false);
    }
    drag.current=finish;
    setDragging(true);
    win.addEventListener('pointermove',move);
    win.addEventListener('pointerup',release);
    win.addEventListener('pointercancel',release);
    handle.addEventListener('lostpointercapture',release);
    try{handle.setPointerCapture?.(id);}catch{/* Window events still complete the gesture. */}
  }

  function keydown(event:KeyboardEvent<HTMLDivElement>){
    if(unavailable||event.altKey||event.ctrlKey||event.metaKey)return;
    const delta=event.shiftKey?10:axis==='row'?5:2;
    const decrease=axis==='row'?'ArrowUp':'ArrowRight',increase=axis==='row'?'ArrowDown':'ArrowLeft';
    let next: number;
    if(event.key===decrease)next=ratio-delta;
    else if(event.key===increase)next=ratio+delta;
    else if(event.key==='Home')next=min;
    else if(event.key==='End')next=max;
    else return;
    event.preventDefault();
    change(boundedShare(axis,next,size),true);
  }
  return {
    container,ratio,dragging,unavailable,
    handle:{
      hidden:unavailable,
      tabIndex:unavailable?-1:0,
      'aria-valuemin':Math.round(min),'aria-valuemax':Math.round(max),'aria-valuenow':Math.round(ratio),
      'aria-valuetext':Math.round(ratio)+(axis==='row'?'٪ برای ویرایشگر':'٪ برای پنل مأموریت'),
      onPointerDown:start,onKeyDown:keydown,
      onDoubleClick:()=>{if(!unavailable)change(boundedShare(axis,defaultShare[axis],size),true);},
    },
  };
}

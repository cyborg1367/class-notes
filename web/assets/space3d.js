"use strict";

// Independent conceptual coordinates; never read or rank the exercise dataset.
const SPACE_HOME = Object.freeze({ yaw: -0.62, pitch: 0.36 });
const SPACE_POINTS = Object.freeze([
  [0.14, 0.22, 0.26], [0.31, 0.68, 0.16], [0.72, 0.19, 0.28],
  [0.81, 0.76, 0.35], [0.22, 0.42, 0.81], [0.64, 0.86, 0.79],
  [0.83, 0.41, 0.74], [0.43, 0.79, 0.49]
]);

function rotateSpace(point, yaw, pitch) {
  const [x, y, z] = point.map(value => value - 0.5);
  const a = Math.cos(yaw) * x + Math.sin(yaw) * z;
  const b = -Math.sin(yaw) * x + Math.cos(yaw) * z;
  return [a, Math.cos(pitch) * y - Math.sin(pitch) * b,
    Math.sin(pitch) * y + Math.cos(pitch) * b];
}
function projectSpace(point, yaw, pitch) {
  const [x, y, z] = rotateSpace(point, yaw, pitch);
  const scale = 4 / (4 - z);
  return { x: 260 + x * 175 * scale, y: 203 - y * 175 * scale, z, scale };
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { rotateSpace, projectSpace, SPACE_HOME, SPACE_POINTS };
}

const mountedSpaces=new WeakSet();
function mountSpaces(scope){
  scope.querySelectorAll("[data-space3d]").forEach(root => {
    if(mountedSpaces.has(root))return;mountedSpaces.add(root);
    const svg = root.querySelector(".space-canvas");
    const fallback = root.querySelector(".space-fallback");
    const status = root.querySelector(".space-status");
    const mode = root.dataset.space3d;
    const home = mode === "distance" ? {yaw:0.52,pitch:0.28} : SPACE_HOME;
    let yaw = home.yaw, pitch = home.pitch, drag = null;
    const ns = "http://www.w3.org/2000/svg";
    const colors = ["#21665d", "#9a4e32", "#555f79"];
    function el(tag, attrs, text) {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
      if (text !== undefined) node.textContent = text;
      return node;
    }
    function point(p) { return projectSpace(p, yaw, pitch); }
    function line(a, b, color, width = 1, dash = "", opacity = 1) {
      const p = point(a), q = point(b);
      return el("line", { x1: p.x, y1: p.y, x2: q.x, y2: q.y,
        stroke: color, "stroke-width": width, "stroke-dasharray": dash,
        opacity, "stroke-linecap": "round" });
    }
    function render() {
      const scene = document.createDocumentFragment();
      // A ground plane, equal-unit cube and projections reveal depth during orbit.
      const floor = [[0,0,0],[1,0,0],[1,0,1],[0,0,1]];
      scene.append(el("polygon", { points: floor.map(p => {
        const q = point(p); return `${q.x},${q.y}`;
      }).join(" "), fill: "#ded6bd", "fill-opacity": 0.48 }));
      for (let i = 0; i <= 4; i++) {
        const t = i / 4;
        scene.append(line([t,0,0],[t,0,1],"#aaa88f",0.8));
        scene.append(line([0,0,t],[1,0,t],"#aaa88f",0.8));
      }
      for (let axis = 0; axis < 3; axis++) {
        const others = [0,1,2].filter(i => i !== axis);
        for (const a of [0,1]) for (const b of [0,1]) {
          const u = [0,0,0], v = [0,0,0];
          u[others[0]] = v[others[0]] = a;
          u[others[1]] = v[others[1]] = b; v[axis] = 1;
          scene.append(line(u,v,"#8f9785",0.9,"3 5",0.65));
        }
        const end = [0,0,0]; end[axis] = 1.13;
        scene.append(line([0,0,0],end,colors[axis],2));
        const tip = point(end);
        scene.append(el("circle",{cx:tip.x,cy:tip.y,r:3,fill:colors[axis]}));
        scene.append(el("text",{x:tip.x,y:tip.y-12,fill:colors[axis],
          "text-anchor":"middle","font-size":16,"font-weight":700},["x₁","x₂","x₃"][axis]));
      }
      let points;
      if (mode === "distance") {
        const u = [0.18,0.24,0.22], v = [0.82,0.79,0.81];
        const a = [v[0],u[1],u[2]], b = [v[0],v[1],u[2]];
        scene.append(line(u,a,colors[0],2,"5 5"));
        scene.append(line(a,b,colors[1],2,"5 5"));
        scene.append(line(b,v,colors[2],2,"5 5"));
        scene.append(line(u,v,"#24241f",3));
        points = [{p:u,label:"u",color:colors[0]}, {p:v,label:"v",color:colors[1]}];
      } else {
        points = SPACE_POINTS.map(p => ({p,color:"#21665d"}));
        points.push({p:[0.49,0.48,0.48],label:"q",color:"#f4d835",query:true});
        points.forEach(({p}) => scene.append(line(p,[p[0],0,p[2]],"#8f9785",0.8,"2 5",0.4)));
      }
      points.map(p => ({...p,screen:point(p.p)})).sort((a,b)=>a.screen.z-b.screen.z).forEach(p => {
        const {x,y,scale,z} = p.screen;
        const r = (p.query ? 9 : 6.5) * scale;
        const alpha = Math.max(0.62, Math.min(1, 0.82 + z * 0.22));
        if (p.query) scene.append(el("circle",{cx:x,cy:y,r:r+7,fill:"none",stroke:p.color,"stroke-opacity":0.22,"stroke-width":2}));
        scene.append(el("circle",{cx:x,cy:y,r,fill:p.color,opacity:p.query?1:alpha,stroke:"#24241f","stroke-width":1.4}));
        if (p.label) scene.append(el("text",{x:x+r+7,y:y-8,fill:p.query?"#24241f":p.color,
          "font-size":17,"font-weight":700},p.label));
      });
      svg.replaceChildren(scene);
    }
    function announce() { status.textContent = "زاویهٔ نمایش تغییر کرد؛ مختصات و فاصلهٔ نقاط ثابت مانده‌اند."; }
    function move(dx, dy) {
      yaw = ((yaw + dx + Math.PI) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI) - Math.PI;
      pitch = Math.max(-1.1, Math.min(1.1, pitch + dy));
      render();
    }
    svg.addEventListener("pointerdown", event => {
      if (event.isPrimary === false || (event.button !== undefined && event.button !== 0)) return;
      drag = {id:event.pointerId,x:event.clientX,y:event.clientY};
      svg.setPointerCapture?.(event.pointerId);
      root.classList.add("is-dragging");
    });
    svg.addEventListener("pointermove", event => {
      if (!drag || drag.id !== event.pointerId) return;
      move((event.clientX-drag.x)*0.009,(event.clientY-drag.y)*0.009);
      drag.x=event.clientX; drag.y=event.clientY;
    });
    function stop(event) {
      if (!drag || drag.id !== event.pointerId) return;
      drag = null; root.classList.remove("is-dragging"); announce();
    }
    ["pointerup","pointercancel","lostpointercapture"].forEach(type=>svg.addEventListener(type,stop));
    const actions = {left:[-0.18,0],right:[0.18,0],up:[0,-0.13],down:[0,0.13]};
    function action(name) {
      if (name === "reset") {yaw=home.yaw; pitch=home.pitch; render(); status.textContent="نمای اولیه بازگردانده شد.";}
      else if (actions[name]) {move(...actions[name]);announce();}
    }
    root.querySelectorAll("[data-orbit]").forEach(button=>button.addEventListener("click",()=>action(button.dataset.orbit)));
    root.addEventListener("keydown",event=>{
      if (event.target !== svg) return;
      const name = {ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down",Home:"reset"}[event.key];
      if (name) {event.preventDefault();action(name);}
    });
    render();
    svg.removeAttribute("hidden"); fallback.hidden=true;
    if (mode === "samples") root.querySelector(".space-legend").textContent = "نقاط سبز: نمونه‌ها · نقطهٔ زرد: پرس‌وجوی q";
    root.classList.add("is-ready");
  });
}

if(typeof document!=="undefined"){window.ClassNotesSpace={refresh:mountSpaces};mountSpaces(document);}

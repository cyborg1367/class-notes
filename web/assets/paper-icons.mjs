// Small, code-native cut-paper icons. Decorative; the control supplies its name.
// Fixed geometry and no filters, fonts, network requests or third-party library.
const forest='#18564e', light='#f8f3e5', ochre='#c9a058', edge='#bdb59e';
const shapes={
 home:`<path fill="${edge}" d="m2 12 10-9 11 9-3 1v10H5V13Z"/><path fill="${ochre}" d="m1 10 11-9 11 9-2 2-9-7-9 7Z"/><path fill="${forest}" d="M5 11 12 6l7 5v10H5Z"/><path fill="${light}" d="M10 14h4v7h-4Z"/>`,
 book:`<path fill="${edge}" d="M3 6 12 7l9-1v15l-9 1-9-1Z"/><path fill="${forest}" d="M2 3q5-1 10 2 5-3 10-2v15q-5-1-10 2-5-3-10-2Z"/><path fill="${light}" d="M4 5q4 0 7 2v10q-3-1-7-1Zm9 2q3-2 7-2v11q-4 0-7 1Z"/><path fill="${ochre}" d="M16 4h2v7l-1-1-1 1Z"/>`,
 note:`<path fill="${edge}" d="M5 4h12l3 4v14H5Z"/><path fill="${light}" d="M4 2h11l4 4v14H4Z"/><path fill="${ochre}" d="M14 2v5h5Z"/><path stroke="${forest}" stroke-width="1.5" d="M7 10h8m-8 4h8m-8 3h5"/>`,
 review:`<path fill="${edge}" d="M5 4h15v18H5Z"/><path fill="${light}" d="M4 2h15v18H4Z"/><path fill="${forest}" d="M4 2h3v18H4Z"/><path fill="${ochre}" d="M14 2h2v7l-1-1-1 1Z"/><path stroke="${forest}" stroke-width="1.3" d="M9 11h7m-7 4h6"/>`,
 lab:`<path fill="${edge}" d="M2 5h20v16H2Z"/><path fill="${ochre}" d="M1 3h21v16H1Z"/><path fill="${forest}" d="M3 5h17v12H3Z"/><path fill="none" stroke="${light}" stroke-width="1.6" d="m6 8 3 3-3 3m6 0h5"/>`,
 dashboard:`<path fill="${edge}" d="M3 4h8v8H3Zm11 0h8v8h-8ZM3 15h8v8H3Zm11 0h8v8h-8Z"/><path fill="${forest}" d="M2 2h8v8H2Zm11 0h8v8h-8ZM2 13h8v8H2Z"/><path fill="${ochre}" d="M13 13h8v8h-8Z"/>`,
 courses:`<path fill="${edge}" d="M3 5h19v16H3Z"/><path fill="${ochre}" d="M2 3h7l2 3h11v13H2Z"/><path fill="${light}" d="M4 8h16v8H4Z"/><path fill="${forest}" d="M5 10h10v2H5Zm0 4h6v1H5Z"/>`,
 map:`<path fill="${edge}" d="m2 6 7-3 7 3 6-3v18l-6 2-7-3-7 3Z"/><path fill="${ochre}" d="m2 4 7-3 7 3 6-3v18l-6 2-7-3-7 3Z"/><path fill="${light}" d="m9 1 7 3v17l-7-3Z"/><path stroke="${forest}" stroke-width="1.4" stroke-dasharray="2 2" d="m5 14 6-6 7 5"/>`,
 user:`<path fill="${edge}" d="M3 22v-3q0-7 9-7t9 7v3Z"/><path fill="${forest}" d="M3 20v-3q0-6 9-6t9 6v3Z"/><circle cx="12" cy="6" r="4.5" fill="${ochre}"/><path fill="${light}" d="M9 14h6l-3 4Z"/>`,
 bell:`<path fill="${ochre}" d="M9 20h6q-3 5-6 0Z"/><path fill="${edge}" d="M3 19v-2l3-4V9q0-6 6-6t6 6v4l3 4v2Z"/><path fill="${forest}" d="M3 17v-2l3-4V7q0-5 6-5t6 5v4l3 4v2Z"/><path stroke="${ochre}" stroke-width="2" d="M12 0v3"/>`,
 bookmark:`<path class="paper-bookmark-shadow" fill="${edge}" d="M6 3h13v20l-6-4-7 4Z"/><path class="paper-bookmark-face" fill="${light}" stroke="${forest}" stroke-width="1.2" d="M5 1h13v20l-6-4-7 4Z"/><path fill="#fff" opacity=".4" d="M7 3h2v13l-2 1Z"/><path class="paper-bookmark-tick" fill="none" stroke="${forest}" stroke-width="1.8" d="m8 9 3 3 4-5"/>`,
 check:`<path fill="${edge}" d="M3 4h19v18H3Z"/><path fill="${forest}" d="M2 2h19v18H2Z"/><path fill="none" stroke="${light}" stroke-width="2.3" d="m6 10 4 4 7-8"/>`,
 gear:`<path fill="${ochre}" d="m9 1 6 0 1 4 4 1 3 5-3 3 0 4-5 3-3-2-4 2-5-3 1-4-3-3 3-5 4-1Z"/><circle cx="12" cy="11" r="5" fill="${light}"/><circle cx="12" cy="11" r="2.5" fill="${forest}"/>`,
 search:`<circle cx="10" cy="9" r="7" fill="${ochre}"/><circle cx="10" cy="9" r="4.5" fill="${light}"/><path stroke="${forest}" stroke-width="4" d="m15 14 7 7"/>`,
 clock:`<circle cx="12" cy="12" r="10" fill="${edge}"/><circle cx="11" cy="10" r="9" fill="${ochre}"/><circle cx="11" cy="10" r="7" fill="${light}"/><path fill="none" stroke="${forest}" stroke-width="1.7" d="M11 5v6l4 2"/>`,
 lock:`<path fill="none" stroke="${forest}" stroke-width="3" d="M7 11V7a5 5 0 0 1 10 0v4"/><path fill="${ochre}" d="M4 10h17v12H4Z"/><path fill="${light}" d="M3 9h17v11H3Z"/><path stroke="${forest}" stroke-width="2" d="M11 13v4"/>`,
 pencil:`<path fill="${ochre}" d="m3 22 2-7L17 3l5 5-12 12Z"/><path fill="${forest}" d="m3 22 2-7 5 5Z"/><path fill="${light}" d="m15 5 2-2 5 5-2 2Z"/>`,
 hint:`<path fill="${edge}" d="M9 18h7v4H9Z"/><path fill="${forest}" d="M8 17h7v4H8Z"/><path fill="${ochre}" d="M7 15q-4-3-4-7a8 8 0 0 1 16 0q0 4-4 7v2H7Z"/><path fill="none" stroke="${light}" stroke-width="1.5" d="M7 8a4 4 0 0 1 4-4m0 7v5"/>`,
 assistant:`<path fill="${edge}" d="M3 5h19v15h-9l-6 4v-4H3Z"/><path fill="${forest}" d="M2 3h19v15h-9l-6 4v-4H2Z"/><path fill="${ochre}" d="m12 5 1.5 4.5L18 11l-4.5 1.5L12 17l-1.5-4.5L6 11l4.5-1.5Z"/>`,
 quiz:`<path fill="${edge}" d="M5 4h16v19H5Z"/><path fill="${light}" d="M3 2h16v19H3Z"/><path fill="${ochre}" d="M7 1h9v4H7Z"/><path fill="none" stroke="${forest}" stroke-width="1.6" d="m6 9 2 2 3-4m1 3h4M6 15h10m-10 3h7"/>`,
 medal:`<path fill="${forest}" d="m6 13-2 10 7-4 7 4-1-10Z"/><path fill="${ochre}" d="m12 0 3 2 4 1 1 4 2 3-2 3-1 4-4 1-3 2-3-2-4-1-1-4-2-3 2-3 1-4 4-1Z"/><circle cx="12" cy="10" r="6" fill="${light}"/><path fill="none" stroke="${forest}" stroke-width="2" d="m8 10 3 3 5-6"/>`,
 leaf:`<path fill="${forest}" d="M12 21Q1 18 3 6q10 0 10 12Q12 5 21 2q4 14-9 19Z"/><path fill="none" stroke="${ochre}" stroke-width="1.3" d="M12 22V12m0 8L6 9m6 10 6-12"/>`,
 download:`<path fill="${edge}" d="M3 16h19v7H3Z"/><path fill="${ochre}" d="M2 15h19v6H2Z"/><path fill="${forest}" d="M9 1h5v10h5l-7.5 7L4 11h5Z"/>`,
 copy:`<path fill="${ochre}" d="M7 2h15v17H7Z"/><path fill="${edge}" d="M3 7h15v17H3Z"/><path fill="${light}" d="M2 5h15v17H2Z"/><path stroke="${forest}" stroke-width="1.5" d="M5 11h9m-9 4h9m-9 4h5"/>`,
 play:`<path fill="${edge}" d="m6 4 17 9-17 10Z"/><path fill="${forest}" d="m4 1 17 10-17 10Z"/>`,
 exit:`<path fill="${ochre}" d="M2 1h11v21H2Z"/><path fill="${light}" d="M4 3h7v17H4Z"/><path fill="${forest}" d="M9 9h9V5l6 6-6 6v-4H9Z"/>`,
 close:`<path fill="${forest}" d="m5 3 7 7 7-7 2 2-7 7 7 7-2 2-7-7-7 7-2-2 7-7-7-7Z"/>`,
 plus:`<path fill="${forest}" d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7Z"/>`,
 minus:`<path fill="${forest}" d="M4 10h16v4H4Z"/>`,
 arrow:`<path fill="${forest}" d="m10 4 2 2-4 4h14v4H8l4 4-2 2L2 12Z"/>`,
 chevron:`<path fill="${forest}" d="m5 8 7 7 7-7 2 2-9 9-9-9Z"/>`,
 menu:`<path fill="${forest}" d="M3 4h18v3H3Zm0 7h18v3H3Zm0 7h18v3H3Z"/>`
};
export function paperIcon(name,cls='') {
 const key=Object.hasOwn(shapes,name)?name:'note';
 // Classes are internal callers only; filter nevertheless so interpolation stays inert.
 const safe=String(cls).replace(/[^a-zA-Z0-9_ -]/g,'');
 return `<svg class="paper-icon ${safe}" data-paper-icon="${key}" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true" focusable="false"><g class="paper-cut-shape">${shapes[key]}</g></svg>`;
}

// Section illustrations retain paper folds, layered edges and consistent light.
// They are drawn for 40–48px, independently of the simpler 18–24px utility set.
const marks={
 lab:`<path fill="#b9a782" d="m6 13 47-4 5 46-47 4Z"/><path fill="#e7d7b7" d="m7 10 47-3 4 46-47 4Z"/><path fill="#fffaf0" d="M4 7h48v43H4Z"/><path fill="#d8c9a8" d="M8 48h45v4H8Z"/><path fill="#19584f" d="M8 11h40v32H8Z"/><path fill="#2c6b60" d="M9 12h38v2H9Z"/><path fill="#d6b46d" d="m15 19 8 7-8 7-2-3 5-4-5-4Zm12 12h12v3H27Z"/><path stroke="#fff" opacity=".18" d="M12 16h32M12 39h32"/><path fill="#b7a27b" d="m32 38 26 2-2 21-26-2Z"/><path fill="#f5ecd8" d="m31 36 26 2-2 21-26-2Z"/><path fill="#18564e" d="m34 41 8 1-.5 8-8-.5Z"/><path fill="none" stroke="#fffaf0" stroke-width="1.7" d="m35 45 2 2 4-4"/><path stroke="#9c987f" stroke-width="2" d="m45 44 7 .5m-7 5 6 .5m-18 5 18 1"/>`,
 review:`<path fill="#b6a383" d="m4 18 27-7 28 5 1 37-28 5-27-4Z"/><path fill="#18564e" d="m3 16 28-6 29 5 1 35-29 6-28-4Z"/><path fill="#dfd1b3" d="m5 14 25-5 28 5v34l-27 5-25-4Z"/><path fill="#fffaf0" d="M6 11q14-4 25 2 12-6 25-1v33q-13-3-25 2-11-5-25-2Z"/><path fill="#e9dfc6" d="M29 13h3v34h-3Z"/><path fill="#a35236" d="m41 11 6-.5v18l-3-3-3 3Z"/><path fill="none" stroke="#a3aa92" stroke-width="1.7" d="m11 20 12 1m-12 6 12 1m-12 6 12 1m-12 6 12 1m14-7 13-2m-13 8 13-2"/><path fill="#c9a058" d="m48 43 12-2 1 16-13 2Z"/><path fill="#fffaf0" d="m49 42 12-2 1 15-13 2Z"/><path stroke="#18564e" stroke-width="1.5" d="m52 46 7-1m-7 6 7-1"/>`,
 courses:`<path fill="#b9a782" d="m7 17 45-4 5 40-45 5Z"/><path fill="#c9a058" d="M5 12h19l7 7h27v33H5Z"/><path fill="#e9d3a4" d="M6 22h53l-4 33H3Z"/><path fill="#fffaf0" d="m14 9 31 2-2 34-31-2Z"/><path fill="#18564e" d="m18 15 16 1-.3 3-16-1Zm0 8 19 1-.2 2-19-1Zm-.5 7 19 1-.2 2-19-1Z"/><path fill="#c9a058" d="m34 11 6 .4-.7 13-3-3-3 3Z"/><path fill="#ead4a6" d="m3 33 21-1 5 5 29-2-3 22-52-1Z"/><path stroke="#fffaf0" opacity=".6" d="m7 37 16-1 5 5 24-2"/>`
};
export function paperMark(name,cls='') {
 const key=Object.hasOwn(marks,name)?name:'review',safe=String(cls).replace(/[^a-zA-Z0-9_ -]/g,'');
 return `<svg class="paper-illustration ${safe}" data-paper-mark="${key}" viewBox="0 0 64 64" width="48" height="48" fill="none" aria-hidden="true" focusable="false">${marks[key]}</svg>`;
}
export function paperBadge(kind,cls='') {
 const key=['greenhouse','evaluation','sms'].includes(kind)?kind:'sms';
 const glyph=key==='greenhouse'?shapes.leaf:key==='evaluation'?shapes.lab:shapes.check;
 const safe=String(cls).replace(/[^a-zA-Z0-9_ -]/g,'');
 return `<svg class="paper-badge ${safe}" data-paper-badge="${key}" viewBox="0 0 72 76" width="56" height="59" fill="none" aria-hidden="true" focusable="false"><path fill="#275b50" d="m19 46-7 27 23-11 23 11-6-27Z"/><path fill="#b48d4a" d="m36 4 9 5 10 2 4 10 6 8-3 11-1 10-10 5-8 7-11-2-11-1-5-10-7-8 2-11 1-10 10-5Z"/><path fill="#ead2a0" d="m36 1 9 5 10 2 4 10 6 8-3 11-1 10-10 5-8 7-11-2-11-1-5-10-7-8 2-11 1-10 10-5Z"/><path stroke="#fffaf0" opacity=".7" d="m35 5 9 5 9 2 3 8 5 7"/><path fill="#c29b55" d="m36 10 20 14-4 24-23 7-17-18 7-22Z"/><path fill="#18564e" d="m36 11 19 13-4 23-22 7-16-17 7-21Z"/><path stroke="#d6ba79" opacity=".75" d="m35 15 16 11-3 19-18 6"/><g transform="translate(23 22) scale(1.05)">${glyph}</g></svg>`;
}

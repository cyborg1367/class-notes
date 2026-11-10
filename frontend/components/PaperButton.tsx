import React from 'react';
type Props={children:React.ReactNode;href?:string;secondary?:boolean;disabled?:boolean;onClick?:()=>void;label?:string;login?:boolean};
export function PaperButton({children,href,secondary=false,disabled=false,onClick,label,login=false}:Props){
  const className=secondary?'button-outline':'button-forest';
  return href?<a className={className} href={href} aria-label={label} data-login-link={login?'':undefined}>{children}</a>:
    <button className={className} type="button" disabled={disabled} onClick={onClick} aria-label={label}>{children}</button>;
}

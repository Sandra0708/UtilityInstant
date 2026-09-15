'use client';
import {Children,cloneElement,isValidElement,useId,useState,type ReactNode,type ReactElement,type LabelHTMLAttributes} from 'react';
import {fieldHelp} from '@/lib/field-help';
import {translate,type Language} from '@/lib/localization';
import s from './field-help.module.css';
export function FieldHelp({id,text}:{id:string;text:string}){
 const [open,setOpen]=useState(false);
 return <span className={s.anchor} onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}><span role="button" tabIndex={0} className={s.trigger} aria-label={text} aria-describedby={id} aria-expanded={open} onClick={e=>{e.preventDefault();e.stopPropagation();setOpen(true);}} onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);e.stopPropagation();}if(e.key==='Enter'||e.key===' '){e.preventDefault();setOpen(v=>!v);}}}>?</span><span id={id} role="tooltip" className={open?s.tooltip:s.hidden}>{text}</span></span>;
}
function textOf(node:ReactNode):string{if(typeof node==='string'||typeof node==='number')return String(node);if(isValidElement<{children?:ReactNode}>(node)&&!['input','select','textarea','small'].includes(String(node.type)))return Children.toArray(node.props.children).map(textOf).join('');return '';}
export default function HelpLabel({children,locale='es',help,helpKey,optional,...props}:LabelHTMLAttributes<HTMLLabelElement>&{locale?:Language;help?:string;helpKey?:string;optional?:boolean}){
 const id=useId(),nodes=Children.toArray(children),title=nodes.map(textOf).join(''),info=fieldHelp(helpKey||title,locale),description=help||info.text;
 let caption=false;
 const enhanced=nodes.map((node,i)=>{
  if(isValidElement<Record<string,unknown>>(node)&&(['input','select','textarea'].includes(String(node.type))||typeof node.type!=='string')){
   const old=String(node.props['aria-describedby']||'');return cloneElement(node as ReactElement<Record<string,unknown>>,{'aria-label':node.props['aria-label']||title.trim(),'aria-describedby':[old,id].filter(Boolean).join(' ')});
  }
  if(!caption&&textOf(node).trim()){caption=true;return <span className={s.caption} key={'caption'+i}>{node}{(optional??info.optional)&&!title.includes(translate(locale,'opcional','optional'))&&!/optional|opcional/.test(title)&&<span className={s.optional}> ({translate(locale,'opcional','optional')})</span>}<FieldHelp id={id} text={description}/></span>;}
  return node;
 });
 return <label {...props} data-help-known={info.known||!!help?'yes':'no'}>{enhanced}</label>;
}

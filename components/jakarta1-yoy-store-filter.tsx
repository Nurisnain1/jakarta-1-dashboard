"use client";
import {useEffect,useState} from "react";
import {createPortal} from "react-dom";

const STORES=["M117","M118","M124","M127","M217","M227","M238","M255","M264"];

export default function Jakarta1YoYStoreFilter(){
 const[host,setHost]=useState<HTMLElement|null>(null),[store,setStore]=useState("ALL");
 useEffect(()=>{let cancelled=false,tries=0;const mount=()=>{if(cancelled)return;const h=[...document.querySelectorAll("h3")].find(x=>x.textContent?.trim().startsWith("2025 vs 2026"));if(!h){if(tries++<120)setTimeout(mount,100);return}let el=document.getElementById("jakarta1-yoy-store-filter-host") as HTMLElement|null;if(!el){el=document.createElement("div");el.id="jakarta1-yoy-store-filter-host";el.className="mb-3";h.parentElement?.insertAdjacentElement("afterend",el)}setHost(el)};mount();return()=>{cancelled=true}},[]);
 const apply=(value:string)=>{setStore(value);const labels=[...document.querySelectorAll("label")];const areaStore=labels.find(l=>l.querySelector("span")?.textContent?.trim()==="Store"&&l.querySelector("select")?.querySelector('option[value="ALL"]')?.textContent?.includes("All Jakarta 1"))?.querySelector("select") as HTMLSelectElement|null;if(!areaStore)return;const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value")?.set;setter?.call(areaStore,value);areaStore.dispatchEvent(new Event("change",{bubbles:true}))};
 return host?createPortal(<label className="block max-w-sm"><span className="mb-1 block text-xs font-black uppercase text-slate-400">Filter Store</span><select value={store} onChange={e=>apply(e.target.value)} className="h-11 w-full rounded-xl border bg-white px-3 font-bold"><option value="ALL">All Area</option>{STORES.map(s=><option key={s} value={s}>{s}</option>)}</select><span className="mt-1 block text-xs text-slate-400">Pilih All Area atau kode store untuk analisa 2025 vs 2026.</span></label>,host):null;
}

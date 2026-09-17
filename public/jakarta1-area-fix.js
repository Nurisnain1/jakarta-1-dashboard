(()=>{
 const txt=e=>String(e?.textContent||'').trim();
 const money=new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});
 const parseMoney=s=>{const n=Number(String(s||'').replace(/[^0-9-]/g,''));return Number.isFinite(n)?n:0};
 function yearTotal(){
  const h=[...document.querySelectorAll('h3')].find(e=>txt(e).startsWith('2025 vs 2026'));
  const table=h?.closest('section')?.querySelector('table');
  if(!table)return;
  const rows=[...table.querySelectorAll('tbody tr')].filter(r=>r.style.display!=='none');
  if(!rows.length)return;
  const v25=rows.reduce((a,r)=>a+parseMoney(r.cells[1]?.textContent),0),v26=rows.reduce((a,r)=>a+parseMoney(r.cells[2]?.textContent),0),growth=v25?(v26-v25)/v25*100:0;
  let foot=table.querySelector('tfoot[data-j1-native-total]');
  if(!foot){foot=document.createElement('tfoot');foot.dataset.j1NativeTotal='1';table.appendChild(foot)}
  const g=v25?`${growth>0?'↑ ':growth<0?'↓ ':'→ '}${new Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(growth)}%`:'—';
  foot.innerHTML=`<tr class="border-t-2 bg-slate-100 font-black"><td class="whitespace-nowrap px-3 py-3 text-sm">GRAND TOTAL</td><td class="whitespace-nowrap px-3 py-3 text-sm">${money.format(v25)}</td><td class="whitespace-nowrap px-3 py-3 text-sm">${money.format(v26)}</td><td class="whitespace-nowrap px-3 py-3 text-sm">${g}</td></tr>`;
 }
 let scheduled=false;
 const run=()=>{scheduled=false;yearTotal()};
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(run)}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
 new MutationObserver(schedule).observe(document.body||document.documentElement,{childList:true,subtree:true});
})();

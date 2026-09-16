(()=>{
 const txt=e=>String(e?.textContent||'').trim();
 const money=new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});
 const num=new Intl.NumberFormat('id-ID');
 const parseMoney=s=>{const n=Number(String(s||'').replace(/[^0-9-]/g,''));return Number.isFinite(n)?n:0};
 const parseNum=s=>{const n=Number(String(s||'').replace(/[^0-9-]/g,''));return Number.isFinite(n)?n:0};
 function yearTotal(){
  const h=[...document.querySelectorAll('h3')].find(e=>txt(e).startsWith('2025 vs 2026'));
  const table=h?.closest('section')?.querySelector('table'); if(!table)return;
  const rows=[...table.querySelectorAll('tbody tr')]; if(!rows.length)return;
  const v25=rows.reduce((a,r)=>a+parseMoney(r.cells[1]?.textContent),0);
  const v26=rows.reduce((a,r)=>a+parseMoney(r.cells[2]?.textContent),0);
  const growth=v25?(v26-v25)/v25*100:0;
  let foot=table.querySelector('tfoot[data-j1-native-total]'); if(!foot){foot=document.createElement('tfoot');foot.dataset.j1NativeTotal='1';table.appendChild(foot)}
  const g=v25?`${growth>0?'↑ ':growth<0?'↓ ':'→ '}${new Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(growth)}%`:'—';
  const html=`<tr class="border-t-2 bg-slate-100 font-black"><td class="whitespace-nowrap px-3 py-3 text-sm">GRAND TOTAL</td><td class="whitespace-nowrap px-3 py-3 text-sm">${money.format(v25)}</td><td class="whitespace-nowrap px-3 py-3 text-sm">${money.format(v26)}</td><td class="whitespace-nowrap px-3 py-3 text-sm">${g}</td></tr>`;
  if(foot.innerHTML!==html)foot.innerHTML=html;
 }
 function focusTotal(){
  const h=[...document.querySelectorAll('h3')].find(e=>txt(e)==='Product Fokus Achievement');
  const section=h?.closest('section'); const table=section?.querySelector('table'); if(!table)return;
  const heads=[...table.querySelectorAll('thead th')]; heads.forEach(th=>{if(txt(th)==='MacBook Neo')th.textContent='MBN 13"'});
  const rows=[...table.querySelectorAll('tbody tr')]; if(!rows.length)return;
  const totals=Array(Math.max(0,heads.length-1)).fill(0);
  rows.forEach(r=>{for(let i=1;i<heads.length;i++)totals[i-1]+=parseNum(r.cells[i]?.textContent)});
  let foot=table.querySelector('tfoot[data-j1-native-focus-total]'); if(!foot){foot=document.createElement('tfoot');foot.dataset.j1NativeFocusTotal='1';table.appendChild(foot)}
  const html=`<tr class="border-t-2 bg-slate-100 font-black"><td class="whitespace-nowrap px-3 py-3 text-sm">GRAND TOTAL</td>${totals.map(v=>`<td class="whitespace-nowrap px-3 py-3 text-sm">${num.format(v)}</td>`).join('')}</tr>`;
  if(foot.innerHTML!==html)foot.innerHTML=html;
  [...section.querySelectorAll('table')].slice(1).forEach(t=>[...t.querySelectorAll('thead th')].forEach(th=>{if(txt(th)==='MacBook Neo')th.textContent='MBN 13"'}));
 }
 let scheduled=false; const run=()=>{scheduled=false;yearTotal();focusTotal()}; const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(run)}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
 new MutationObserver(schedule).observe(document.body||document.documentElement,{childList:true,subtree:true});
 document.addEventListener('change',schedule,true);
})();

(()=>{
  const text=el=>String(el?.textContent||'').trim();
  const pct=(a,t)=>t?`${new Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(a/t*100)}%`:'0%';
  const moneyValue=s=>{const n=Number(String(s||'').replace(/[^0-9-]/g,''));return Number.isFinite(n)?n:0};
  function fix(){
    const h=[...document.querySelectorAll('h2,h3')].find(x=>text(x).toLowerCase()==='staff performance');
    const root=h?.closest('div.space-y-5,section')||h?.parentElement;
    const table=root?.querySelector('table'); if(!table)return;
    const headerRow=table.querySelector('thead tr'); if(!headerRow)return;
    let heads=[...headerRow.querySelectorAll('th')];
    const find=name=>heads.findIndex(x=>text(x).toLowerCase()===name.toLowerCase());
    // Remove Qoala and AirPods from Staff Performance only.
    for(const name of ['Qoala','AirPods']){
      heads=[...headerRow.querySelectorAll('th')];
      const idx=heads.findIndex(x=>text(x).toLowerCase()===name.toLowerCase());
      if(idx>=0){headerRow.children[idx]?.remove();for(const tr of table.querySelectorAll('tbody tr,tfoot tr'))tr.children[idx]?.remove()}
    }
    heads=[...headerRow.querySelectorAll('th')];
    let point=heads.findIndex(x=>['point','points'].includes(text(x).toLowerCase()));
    if(point>=0)heads[point].textContent='%Achievement';
    heads=[...headerRow.querySelectorAll('th')];
    let achPct=heads.findIndex(x=>['%achievement','achievement %','ach %'].includes(text(x).toLowerCase()));
    const iphone=heads.findIndex(x=>text(x).toLowerCase()==='iphone');
    if(achPct<0&&iphone>=0){
      const th=document.createElement('th');th.className=heads[iphone].className;th.textContent='%Achievement';headerRow.insertBefore(th,heads[iphone]);
      for(const tr of table.querySelectorAll('tbody tr,tfoot tr')){const td=document.createElement('td');td.className=tr.children[iphone]?.className||'';tr.insertBefore(td,tr.children[iphone]||null)}
    }
    heads=[...headerRow.querySelectorAll('th')];achPct=heads.findIndex(x=>text(x).toLowerCase()==='%achievement');
    const newIphone=heads.findIndex(x=>text(x).toLowerCase()==='iphone');
    if(achPct>=0&&newIphone>=0&&achPct!==newIphone-1){
      const th=heads[achPct];headerRow.insertBefore(th,heads[newIphone]);
      for(const tr of table.querySelectorAll('tbody tr,tfoot tr')){const cells=[...tr.children],cell=cells[achPct],anchor=cells[newIphone];if(cell&&anchor)tr.insertBefore(cell,anchor)}
    }
    heads=[...headerRow.querySelectorAll('th')];
    const target=heads.findIndex(x=>text(x).toLowerCase()==='target'),achievement=heads.findIndex(x=>text(x).toLowerCase()==='achievement');
    achPct=heads.findIndex(x=>text(x).toLowerCase()==='%achievement');
    for(const tr of table.querySelectorAll('tbody tr')){const c=[...tr.children];if(target>=0&&achievement>=0&&achPct>=0&&c[achPct])c[achPct].textContent=pct(moneyValue(text(c[achievement])),moneyValue(text(c[target])))}
  }
  let raf=0;const schedule=()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;fix()})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
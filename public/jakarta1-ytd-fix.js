(()=>{
 const money=new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});
 const pct=v=>`${new Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(v)}%`;
 const val=s=>{const n=Number(String(s||'').replace(/[^0-9-]/g,''));return Number.isFinite(n)?n:0};
 const months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
 function apply(){
  const h=[...document.querySelectorAll('h3')].find(x=>String(x.textContent||'').trim().startsWith('2025 vs 2026'));
  const section=h?.closest('section'),table=section?.querySelector('table');if(!table)return;
  const now=new Date(),cutMonth=now.getFullYear()===2026?now.getMonth():11,cutDay=now.getDate();
  const rows=[...table.querySelectorAll('tbody tr')];
  let t25=0,t26=0;
  rows.forEach((tr,i)=>{const show=i<=cutMonth;tr.style.display=show?'':'none';if(show){const c=tr.querySelectorAll('td');t25+=val(c[1]?.textContent);t26+=val(c[2]?.textContent)}});
  let foot=table.querySelector('tfoot[data-j1-ytd-total="1"]');
  const old=table.querySelector('tfoot[data-j1-year-total="1"]');if(old)old.style.display='none';
  if(!foot){foot=document.createElement('tfoot');foot.dataset.j1YtdTotal='1';table.append(foot)}
  const g=t25?(t26-t25)/t25*100:0,base=rows[0]?.querySelectorAll('td');
  const html=`<tr class="border-t-2 bg-blue-50 font-black"><td class="${base?.[0]?.className||''}">YTD s.d. ${cutDay} ${months[cutMonth]}</td><td class="${base?.[1]?.className||''}">${money.format(t25)}</td><td class="${base?.[2]?.className||''}">${money.format(t26)}</td><td class="${base?.[3]?.className||''}">${t25?pct(g):'—'}</td></tr>`;
  if(foot.innerHTML!==html)foot.innerHTML=html;
  const p=section.querySelector('h3 + p');if(p)p.textContent=`Year to Date 2025 vs 2026 sampai ${cutDay} ${months[cutMonth]}. Bulan setelah periode berjalan tidak ditampilkan.`;
 }
 let raf=0;const schedule=()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;apply()})};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
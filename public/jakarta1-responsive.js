(()=>{
  const STYLE_ID='jakarta1-responsive-style';
  const MENU_ID='jakarta1-mobile-menu';
  const BACKDROP_ID='jakarta1-mobile-backdrop';
  const addStyles=()=>{
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      html{width:100%;overflow-x:hidden;scroll-behavior:auto!important;overscroll-behavior-x:none}
      body{width:100%;max-width:100%;overflow-x:hidden;overscroll-behavior-x:none}
      main{min-width:0;max-width:100%;overflow-x:clip}
      .j1-nav-group{padding:12px 12px 6px;font-size:10px;font-weight:900;letter-spacing:.16em;color:rgba(255,255,255,.55);text-transform:uppercase}
      #${MENU_ID}{display:none}
      #${BACKDROP_ID}{display:none}
      .overflow-x-auto{max-width:100%;overflow-x:auto!important;overflow-y:hidden;overscroll-behavior-x:contain;scroll-behavior:auto!important;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y}
      table{max-width:none}
      @media(max-width:1023px){
        body.j1-menu-open{overflow:hidden}
        body>div:first-child aside,#__next aside,aside{position:fixed!important;inset:0 auto 0 0!important;width:min(86vw,320px)!important;height:100dvh!important;z-index:80!important;overflow-y:auto!important;overscroll-behavior:contain;transform:translate3d(-105%,0,0);transition:transform .22s ease;box-shadow:0 20px 50px rgba(15,23,42,.28)}
        body.j1-menu-open aside{transform:translate3d(0,0,0)}
        aside nav{display:block!important;padding:0 12px 24px!important}
        aside nav>button,aside nav>div>button{width:100%!important;justify-content:flex-start!important;min-height:44px!important}
        aside nav button span{display:inline!important}
        #${MENU_ID}{display:flex;position:fixed;left:12px;top:10px;z-index:75;width:42px;height:42px;align-items:center;justify-content:center;border:1px solid #e2e8f0;border-radius:12px;background:white;color:#0f172a;box-shadow:0 2px 10px rgba(15,23,42,.08);font-size:22px;line-height:1}
        #${BACKDROP_ID}{position:fixed;inset:0;z-index:79;background:rgba(15,23,42,.42)}
        body.j1-menu-open #${BACKDROP_ID}{display:block}
        main>header>div{padding-left:64px!important}
        main>header b{max-width:42vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        main>header button{min-height:42px}
        main>div{max-width:100%;min-width:0}
      }
      @media(max-width:767px){
        main>div.space-y-5{padding:16px!important}
        h2{overflow-wrap:anywhere}
        select,button{min-height:44px}
      }
      @media(min-width:1024px){
        aside{position:sticky!important;top:0;height:100vh;max-height:100vh;overflow-y:auto;overscroll-behavior:contain;flex:0 0 auto}
        main{min-width:0;flex:1 1 auto}
      }
    `;
    document.head.appendChild(s);
  };
  const close=()=>{document.body.classList.remove('j1-menu-open');const b=document.getElementById(MENU_ID);if(b)b.setAttribute('aria-expanded','false')};
  const setup=()=>{
    addStyles();
    const aside=document.querySelector('aside');
    const nav=aside?.querySelector('nav');
    if(!aside||!nav)return;
    if(!document.getElementById(MENU_ID)){
      const btn=document.createElement('button');btn.id=MENU_ID;btn.type='button';btn.setAttribute('aria-label','Buka menu Jakarta 1');btn.setAttribute('aria-expanded','false');btn.innerHTML='☰';
      btn.onclick=()=>{const open=document.body.classList.toggle('j1-menu-open');btn.setAttribute('aria-expanded',String(open))};
      document.body.appendChild(btn);
      const bd=document.createElement('div');bd.id=BACKDROP_ID;bd.onclick=close;document.body.appendChild(bd);
    }
    if(!nav.querySelector('[data-j1-dashboard-label]')){const label=document.createElement('div');label.className='j1-nav-group';label.dataset.j1DashboardLabel='1';label.textContent='Dashboard';nav.prepend(label)}
    const target=[...nav.querySelectorAll('button')].find(b=>b.textContent?.trim().startsWith('Target Fokus'));
    if(target&&!nav.querySelector('[data-j1-target-label]')){const host=target.parentElement;if(host){const label=document.createElement('div');label.className='j1-nav-group';label.dataset.j1TargetLabel='1';label.textContent='Target Fokus';host.before(label)}}
    nav.querySelectorAll('button').forEach(b=>{if(!b.dataset.j1Close){b.dataset.j1Close='1';b.addEventListener('click',()=>{if(window.innerWidth<1024)setTimeout(close,50)})}});
  };
  setup();
  const observer=new MutationObserver(setup);observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',()=>{if(window.innerWidth>=1024)close()});
  window.addEventListener('popstate',()=>{if(window.innerWidth<1024)close()});
})();
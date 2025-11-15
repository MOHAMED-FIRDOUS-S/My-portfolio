/* Main UI script: preloader, cursor, theme, typewriter, sound toggle */
(function(){
  const pre = document.getElementById('preloader');
  window.addEventListener('load', ()=>{
    pre.classList.add('loaded');
    setTimeout(()=>pre.style.display='none',600);
  });

  // Custom cursor
  const cursor = document.getElementById('cursor');
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  // Typewriter subtitle
  const twEl = document.getElementById('typewriter');
  const txt = twEl.textContent.trim();
  twEl.textContent = '';
  let i=0;
  function type(){
    if(i<=txt.length){
      twEl.textContent = txt.slice(0,i++);
      setTimeout(type, 28 + Math.random()*40);
    }
  }
  setTimeout(type,400);

  // Theme toggle
  const themeBtn = document.getElementById('themeToggle');
  const root = document.documentElement;
  const current = localStorage.getItem('theme')||'dark';
  if(current==='light') root.setAttribute('data-theme','light');
  themeBtn.addEventListener('click', ()=>{
    const t = root.getAttribute('data-theme')==='light'?'dark':'light';
    root.setAttribute('data-theme', t==='light'?'light':'');
    localStorage.setItem('theme', t);
  });

  // Sound toggle + hover sounds
  let soundOn = JSON.parse(localStorage.getItem('soundOn')||'true');
  const soundBtn = document.getElementById('soundToggle');
  const hoverSound = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
  hoverSound.volume = 0.15;
  function setSoundBtn(){ soundBtn.textContent = soundOn? '🔊':'🔈'; }
  setSoundBtn();
  soundBtn.addEventListener('click', ()=>{ soundOn = !soundOn; localStorage.setItem('soundOn', JSON.stringify(soundOn)); setSoundBtn(); });
  // play on hover for interactive elements
  document.querySelectorAll('.btn, .icon-link, .project-card, .icon-btn').forEach(el=>{
    el.addEventListener('mouseenter', ()=>{ if(soundOn) hoverSound.currentTime=0, hoverSound.play().catch(()=>{}); el.classList.add('hovered'); setTimeout(()=>el.classList.remove('hovered'),600) });
  });

  // gentle glow on card hover
  document.querySelectorAll('.project-card').forEach(card=>{
    card.addEventListener('mouseenter', ()=> card.style.boxShadow = '0 30px 60px rgba(0,240,255,0.06)');
    card.addEventListener('mouseleave', ()=> card.style.boxShadow = '');
  });

  // basic form prevention (mail client link will open)
  document.querySelectorAll('.contact-form').forEach(f=>{
    f.addEventListener('submit', e=>{
      // allow default mailto behavior; show a small toast or not
    });
  });

})();

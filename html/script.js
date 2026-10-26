const stack = document.getElementById('stack');
const items = new Map();
let cfg = { position:'top-right', max:5, sound:true, volume:.12, timer:true };

const P = (d) => `<svg viewBox="0 0 24 24">${d}</svg>`;
const ICONS = {
  success:   P('<path d="M20 6 9 17l-5-5"/>'),
  error:     P('<path d="M18 6 6 18M6 6l12 12"/>'),
  info:      P('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
  warning:   P('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
  police:    P('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'),
  ambulance: P('<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>'),
  money:     P('<circle cx="12" cy="12" r="10"/><path d="M15 9.5a3 3 0 0 0-3-1.5c-1.7 0-3 1-3 2.25S10.3 12 12 12s3 .75 3 2.25-1.3 2.25-3 2.25a3 3 0 0 1-3-1.5M12 6v2M12 16.5V18"/>'),
  ticket:    P('<path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/>'),
  bell:      P('<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>'),
};

const TONES = {
  success:[660,880], error:[330,220], warning:[520,520], info:[740],
  police:[600,800], ambulance:[800,600], money:[784,1047], ticket:[700,900],
};
let actx;
function beep(type){
  if(!cfg.sound) return;
  try{
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    const seq = TONES[type] || TONES.info;
    seq.forEach((f,i)=>{
      const t0 = actx.currentTime + i*.09;
      const o = actx.createOscillator(), g = actx.createGain();
      o.type='sine'; o.frequency.value=f;
      g.gain.setValueAtTime(0,t0);
      g.gain.linearRampToValueAtTime(cfg.volume,t0+.015);
      g.gain.exponentialRampToValueAtTime(.0001,t0+.16);
      o.connect(g).connect(actx.destination);
      o.start(t0); o.stop(t0+.18);
    });
  }catch(e){}
}

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function fmt(s){
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')
    .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gi,'<b>$1</b>')
    .replace(/&lt;br\s*\/?&gt;|\n/gi,'<br>');
}
function iconFor(d){
  const k = d.icon || d.type;
  if(ICONS[k]) return ICONS[k];
  if(d.icon) return esc(d.icon);
  return ICONS.info;
}
function setPosition(p){ stack.className = p || 'top-right'; }

function armTimer(el, rec, id, duration){
  clearTimeout(rec.timeout);
  el.querySelector('.timer')?.remove();
  if(!(duration>0)) return;
  if(cfg.timer){
    const t=document.createElement('div'); t.className='timer'; t.innerHTML='<i></i>';
    const bar=t.firstChild; bar.style.setProperty('--d', duration+'ms');
    bar.addEventListener('animationend',()=>remove(id));
    el.appendChild(t);
  } else rec.timeout=setTimeout(()=>remove(id), duration);
}

function show(d){
  if(items.has(d.id)) return update(d);
  const el = document.createElement('div');
  el.className = `toast pop t-${d.type}`;
  const hasP = typeof d.progress === 'number';
  el.innerHTML = `
    <div class="ico">${iconFor(d)}</div>
    <div class="body">
      <div class="title"></div>
      <div class="msg"></div>
      ${hasP ? '<div class="pbar"><i></i></div>' : ''}
    </div>`;
  el.querySelector('.title').textContent = d.title || '';
  el.querySelector('.msg').innerHTML = fmt(d.message || '');
  if(hasP) el.querySelector('.pbar i').style.width = Math.max(0,Math.min(100,d.progress))+'%';
  el.addEventListener('click',()=>remove(d.id));

  const rec = { el, timeout:null };
  items.set(d.id, rec);
  stack.appendChild(el);
  armTimer(el, rec, d.id, d.duration);
  beep(d.type);

  while(items.size > cfg.max){
    remove(items.keys().next().value, true);
  }
}

function update(d){
  const rec = items.get(d.id); if(!rec) return show(d);
  const el = rec.el;
  if(d.type){
    el.className = el.className.replace(/t-\w+/,'t-'+d.type);
    el.querySelector('.ico').innerHTML = iconFor(d);
    beep(d.type);
  }
  if(d.title!==undefined) el.querySelector('.title').textContent = d.title;
  if(d.message!==undefined) el.querySelector('.msg').innerHTML = fmt(d.message);
  if(typeof d.progress==='number'){
    let pb = el.querySelector('.pbar i');
    if(!pb){ const w=document.createElement('div'); w.className='pbar'; w.innerHTML='<i></i>'; el.querySelector('.body').appendChild(w); pb=w.querySelector('i'); }
    pb.style.width = Math.max(0,Math.min(100,d.progress))+'%';
  }
  if(d.duration!==undefined) armTimer(el, rec, d.id, d.duration);
}

function remove(id, instant){
  const rec = items.get(id); if(!rec) return;
  items.delete(id);
  clearTimeout(rec.timeout);
  if(instant){ rec.el.remove(); return; }
  rec.el.classList.add('out');
  setTimeout(()=>rec.el.remove(), 320);
}

window.addEventListener('message', e=>{
  const m = e.data || {};
  switch(m.action){
    case 'notify': show(m.data); break;
    case 'update': update(m.data); break;
    case 'remove': remove(m.id); break;
    case 'clear':  [...items.keys()].forEach(k=>remove(k)); break;
    case 'config': cfg = Object.assign(cfg, m.data); setPosition(cfg.position); break;
  }
});

fetch(`https://${typeof GetParentResourceName==='function'?GetParentResourceName():'phx_notify'}/ready`,{method:'POST',body:'{}'}).catch(()=>{});

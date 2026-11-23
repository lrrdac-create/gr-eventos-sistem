
/* --- Organograma --- */
const ORG_COLORS=['#1C1713','#D45A20','#B04716','#2F7D4F','#2563EB','#7C3AED','#B3392B','#E8B21F','#8C8273'];
const LIGHT=['#E8B21F'];
let orgZoom=1,orgSel=new Set(),orgConnect=null,ORG_CLIP=null,orgEv=null,orgRedraw=null;
try{ORG_CLIP=JSON.parse(sessionStorage.getItem('gr-org-clip')||'null')}catch(_){}
function orgCopy(ev,all){const ids=all||!orgSel.size?new Set(ev.org.nodes.map(n=>n.id)):orgSel;const nodes=ev.org.nodes.filter(n=>ids.has(n.id));if(!nodes.length){toast('Nada para copiar.');return}
 ORG_CLIP={nodes:JSON.parse(JSON.stringify(nodes)),edges:ev.org.edges.filter(e=>ids.has(e.from)&&ids.has(e.to)).map(e=>({...e}))};try{sessionStorage.setItem('gr-org-clip',JSON.stringify(ORG_CLIP))}catch(_){}toast(`${nodes.length} quadrinho(s) copiado(s).`)}
function orgPaste(ev){if(!ORG_CLIP||!ORG_CLIP.nodes.length){toast('Nada copiado ainda.');return}const map={};orgSel=new Set();
 ORG_CLIP.nodes.forEach(n=>{const id=uid();map[n.id]=id;ev.org.nodes.push({...n,id,x:n.x+30,y:n.y+30});orgSel.add(id)});
 ORG_CLIP.edges.forEach(e=>ev.org.edges.push({id:uid(),from:map[e.from],to:map[e.to]}));
 ORG_CLIP.nodes.forEach(n=>{n.x+=30;n.y+=30});saveEv();orgRedraw&&orgRedraw()}
function orgDelete(ev){if(!orgSel.size)return;ev.org.nodes=ev.org.nodes.filter(n=>!orgSel.has(n.id));ev.org.edges=ev.org.edges.filter(e=>!orgSel.has(e.from)&&!orgSel.has(e.to));orgSel.clear();saveEv();orgRedraw&&orgRedraw()}
document.addEventListener('keydown',e=>{
 if(!orgEv||!document.getElementById('orgwrap')||$('#modal').classList.contains('on'))return;
 if(e.target.closest&&(e.target.closest('[contenteditable=true]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)))return;
 const mod=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
 if(mod&&k==='a'){e.preventDefault();orgSel=new Set(orgEv.org.nodes.map(n=>n.id));orgRedraw()}
 else if(mod&&k==='c'){e.preventDefault();orgCopy(orgEv)}
 else if(mod&&k==='v'){e.preventDefault();orgPaste(orgEv)}
 else if(e.key==='Delete'||e.key==='Backspace'){if(orgSel.size){e.preventDefault();orgDelete(orgEv)}}
 else if(e.key==='Escape'){orgConnect=null;orgSel.clear();orgRedraw()}
});
TAB.org=(t,ev,redrawTab)=>{
 orgEv=ev;orgSel=new Set([...orgSel].filter(id=>ev.org.nodes.some(n=>n.id===id)));
 t.innerHTML=`<div class="grid" style="gap:10px"><div class="toolbar">
  <button class="btn sm pri" id="oadd">${ic('plus')} Nó</button><button class="btn sm" id="ocon">↔ Conectar</button>
  <span style="width:1px;height:28px;background:var(--line2)"></span>
  <button class="btn sm" id="ocp">${ic('copy')} Copiar</button><button class="btn sm" id="oall">Tudo</button><button class="btn sm" id="ops">Colar</button><button class="btn sm danger" id="odel">${ic('trash')} Del</button>
  <span style="width:1px;height:28px;background:var(--line2)"></span>
  ${ORG_COLORS.map(c=>`<button class="swatch" data-c="${c}" style="background:${c}" aria-label="Cor ${c}"></button>`).join('')}
  <span class="sp"></span><button class="ib" id="ozo" aria-label="Diminuir zoom">－</button><button class="btn sm" id="oz1" style="min-width:64px"></button><button class="ib" id="ozi" aria-label="Aumentar zoom">＋</button></div>
  <p class="muted small" id="ohint">Duplo-clique no título ou na faixa para editar · arraste no fundo para selecionar · Ctrl+clique soma · Ctrl+A, Ctrl+C, Ctrl+V, Delete · Ctrl + roda do mouse para zoom</p>
  <div class="orgwrap" id="orgwrap" tabindex="0" style="overflow:auto;touch-action:pan-x pan-y"><div id="osz" style="position:relative"><div class="orgworld" id="ow"><svg id="osv"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#1C1713"/></marker></defs><g id="oedges"></g></svg><div id="onodes"></div></div></div></div></div>`;
 const wrap=$('#orgwrap'),world=$('#ow'),sz=$('#osz');
 const applyZoom=()=>{world.style.transform=`scale(${orgZoom})`;sz.style.width=4000*orgZoom+'px';sz.style.height=3000*orgZoom+'px';$('#oz1').textContent=Math.round(orgZoom*100)+'%'};
 const setZoom=(z,cx,cy)=>{const r=wrap.getBoundingClientRect();cx=cx??r.width/2;cy=cy??r.height/2;const wx=(wrap.scrollLeft+cx)/orgZoom,wy=(wrap.scrollTop+cy)/orgZoom;orgZoom=Math.min(2.5,Math.max(.3,Math.round(z*100)/100));applyZoom();wrap.scrollLeft=wx*orgZoom-cx;wrap.scrollTop=wy*orgZoom-cy};
 const toWorld=(cx,cy)=>{const r=wrap.getBoundingClientRect();return {x:(cx-r.left+wrap.scrollLeft)/orgZoom,y:(cy-r.top+wrap.scrollTop)/orgZoom}};
 const draw=()=>{
  $('#onodes').innerHTML=ev.org.nodes.map(n=>`<div class="node ${orgSel.has(n.id)?'sel':''} ${LIGHT.includes(n.color)?'light':''}" data-id="${n.id}" style="left:${n.x}px;top:${n.y}px;--nc:${n.color||'#1C1713'}"><div class="t" data-e="title">${esc(n.title)}</div><div class="s" data-e="sub">${esc(n.sub||'')}</div></div>`).join('');
  drawEdges();
  $('#ocon').classList.toggle('pri',!!orgConnect);$('#ohint').textContent=orgConnect?'Agora clique no quadrinho de destino para ligar (Esc cancela).':'Duplo-clique no título ou na faixa para editar · arraste no fundo para selecionar · Ctrl+clique soma · Ctrl+A, Ctrl+C, Ctrl+V, Delete · Ctrl + roda do mouse para zoom';
 };
 const box=id=>{const el=$(`.node[data-id="${id}"]`,world);if(!el)return null;return {x:el.offsetLeft,y:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight}};
 const clip=(b,tx,ty)=>{const cx=b.x+b.w/2,cy=b.y+b.h/2,dx=tx-cx,dy=ty-cy;if(!dx&&!dy)return {x:cx,y:cy};const s=Math.min(Math.abs((b.w/2+4)/(dx||1e-9)),Math.abs((b.h/2+4)/(dy||1e-9)));return {x:cx+dx*s,y:cy+dy*s}};
 const drawEdges=()=>{$('#oedges').innerHTML=ev.org.edges.map(e=>{const a=box(e.from),b=box(e.to);if(!a||!b)return '';const p=clip(a,b.x+b.w/2,b.y+b.h/2),q=clip(b,a.x+a.w/2,a.y+a.h/2);return `<g data-edge="${e.id}" style="cursor:pointer"><line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="transparent" stroke-width="14"/><line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="#1C1713" stroke-width="2" marker-end="url(#ah)"/></g>`}).join('')};
 const updSel=()=>$$('.node',world).forEach(el=>el.classList.toggle('sel',orgSel.has(el.dataset.id)));
 orgRedraw=draw;applyZoom();draw();
 /* botões */
 $('#oadd').onclick=()=>{const r=wrap.getBoundingClientRect();const p=toWorld(r.left+r.width/2-95,r.top+r.height/2-35);const n={id:uid(),x:Math.round(p.x+ (ev.org.nodes.length%5)*12),y:Math.round(p.y+(ev.org.nodes.length%5)*12),title:'Novo cargo',sub:'Nome',color:'#1C1713'};ev.org.nodes.push(n);orgSel=new Set([n.id]);saveEv();draw()};
 $('#ocon').onclick=()=>{if(orgConnect){orgConnect=null;draw();return}if(orgSel.size!==1){toast('Selecione um quadrinho de origem primeiro.');return}orgConnect=[...orgSel][0];draw()};
 $('#ocp').onclick=()=>orgCopy(ev);$('#oall').onclick=()=>orgCopy(ev,true);$('#ops').onclick=()=>orgPaste(ev);$('#odel').onclick=()=>{if(!orgSel.size){toast('Selecione o que excluir.');return}orgDelete(ev)};
 $$('[data-c]',t).forEach(b=>b.onclick=()=>{if(!orgSel.size){toast('Selecione quadrinhos para pintar.');return}ev.org.nodes.forEach(n=>{if(orgSel.has(n.id))n.color=b.dataset.c});saveEv();draw()});
 $('#ozi').onclick=()=>setZoom(orgZoom+.1);$('#ozo').onclick=()=>setZoom(orgZoom-.1);$('#oz1').onclick=()=>setZoom(1);
 wrap.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();const r=wrap.getBoundingClientRect();setZoom(orgZoom*(e.deltaY<0?1.1:1/1.1),e.clientX-r.left,e.clientY-r.top)},{passive:false});
 /* arestas */
 $('#oedges').addEventListener('click',async e=>{const g=e.target.closest('[data-edge]');if(!g)return;if(!await ask('Remover esta seta?',{ok:'Remover'}))return;ev.org.edges=ev.org.edges.filter(x=>x.id!==g.dataset.edge);saveEv();draw()});
 /* edição */
 world.addEventListener('dblclick',e=>{const f=e.target.closest('[data-e]');if(!f)return;const n=ev.org.nodes.find(x=>x.id===f.closest('.node').dataset.id);f.contentEditable='true';f.style.cursor='text';f.focus();const rg=document.createRange();rg.selectNodeContents(f);const s=getSelection();s.removeAllRanges();s.addRange(rg);
  f.onkeydown=k=>{if(k.key==='Enter'&&!k.shiftKey){k.preventDefault();f.blur()}if(k.key==='Escape'){f.textContent=n[f.dataset.e==='title'?'title':'sub'];f.blur()}};
  f.onblur=()=>{f.contentEditable='false';f.style.cursor='';n[f.dataset.e]=f.textContent.trim();saveEv();drawEdges()}});
 /* arrastar, selecionar */
 wrap.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.target.closest('[contenteditable=true]'))return;
  const nd=e.target.closest('.node');
  if(nd){const id=nd.dataset.id;
   if(orgConnect){if(id!==orgConnect&&!ev.org.edges.some(x=>x.from===orgConnect&&x.to===id)){ev.org.edges.push({id:uid(),from:orgConnect,to:id});saveEv()}orgConnect=null;orgSel=new Set([id]);draw();return}
   if(e.ctrlKey||e.metaKey){orgSel.has(id)?orgSel.delete(id):orgSel.add(id);updSel();return}
   if(!orgSel.has(id))orgSel=new Set([id]);
   updSel();
   const start=toWorld(e.clientX,e.clientY),orig=ev.org.nodes.filter(n=>orgSel.has(n.id)).map(n=>({n,x:n.x,y:n.y}));let moved=false;
   const mv=ev2=>{const p=toWorld(ev2.clientX,ev2.clientY),dx=p.x-start.x,dy=p.y-start.y;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;orig.forEach(o=>{o.n.x=Math.max(0,Math.round(o.x+dx));o.n.y=Math.max(0,Math.round(o.y+dy));const el=$(`.node[data-id="${o.n.id}"]`,world);el.style.left=o.n.x+'px';el.style.top=o.n.y+'px'});drawEdges()};
   const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);if(moved)saveEv()};
   addEventListener('pointermove',mv);addEventListener('pointerup',up);return}
  if(e.pointerType==='touch')return;
  if(!e.target.closest('#ow')&&e.target!==sz&&e.target!==wrap)return;
  if(orgConnect){orgConnect=null}
  e.preventDefault();wrap.focus({preventScroll:true});
  const add=e.ctrlKey||e.metaKey,base=add?new Set(orgSel):new Set(),s=toWorld(e.clientX,e.clientY);
  const mq=document.createElement('div');mq.className='marq';world.appendChild(mq);
  const mv=ev2=>{const p=toWorld(ev2.clientX,ev2.clientY),x=Math.min(s.x,p.x),y=Math.min(s.y,p.y),w=Math.abs(p.x-s.x),h=Math.abs(p.y-s.y);Object.assign(mq.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
   orgSel=new Set(base);ev.org.nodes.forEach(n=>{const b=box(n.id);if(b&&b.x<x+w&&b.x+b.w>x&&b.y<y+h&&b.y+b.h>y)orgSel.add(n.id)});$$('.node',world).forEach(el=>el.classList.toggle('sel',orgSel.has(el.dataset.id)))};
  const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);mq.remove();updSel()};
  addEventListener('pointermove',mv);addEventListener('pointerup',up);
 });
 /* começa mostrando os quadrinhos */
 if(ev.org.nodes.length){const minX=Math.min(...ev.org.nodes.map(n=>n.x)),minY=Math.min(...ev.org.nodes.map(n=>n.y));wrap.scrollLeft=Math.max(0,(minX-40)*orgZoom);wrap.scrollTop=Math.max(0,(minY-40)*orgZoom)}
 else{wrap.scrollLeft=0;wrap.scrollTop=0}
};

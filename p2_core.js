<script>
{
/* ================= utilidades ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const norm=s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
const brl=v=>(Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const pct=v=>isFinite(v)?(v*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%':'—';
const num=v=>{if(typeof v==='number')return v;let s=String(v??'').replace(/[R$\s]/g,'');if(!s)return 0;if(s.includes(',')){s=s.replace(/\./g,'').replace(',','.')}const n=parseFloat(s);return isNaN(n)?0:n};
const MES=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MESC=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const fdate=d=>{if(!d)return '—';const [y,m,dd]=String(d).slice(0,10).split('-');return dd&&m?`${dd}/${m}/${y}`:d};
const initials=n=>String(n||'?').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
const by=(k,dir=1)=>(a,b)=>(a[k]>b[k]?1:a[k]<b[k]?-1:0)*dir;

function sha256(ascii){ascii=unescape(encodeURIComponent(ascii));const rr=(v,a)=>(v>>>a)|(v<<(32-a));const mp=Math.pow,maxWord=mp(2,32);let result='',words=[],asciiBitLength=ascii.length*8,hash=[],k=[],pc=0,i,j;const isC={};for(let c=2;pc<64;c++){if(!isC[c]){for(i=0;i<313;i+=c)isC[i]=c;hash[pc]=(mp(c,.5)*maxWord)|0;k[pc++]=(mp(c,1/3)*maxWord)|0}}ascii+='\x80';while(ascii.length%64-56)ascii+='\x00';for(i=0;i<ascii.length;i++){j=ascii.charCodeAt(i);words[i>>2]|=j<<((3-i)%4)*8}words[words.length]=((asciiBitLength/maxWord)|0);words[words.length]=asciiBitLength;hash=hash.slice(0,8);for(j=0;j<words.length;){const w=words.slice(j,j+=16),old=hash;hash=hash.slice(0,8);for(i=0;i<64;i++){const w15=w[i-15],w2=w[i-2],a=hash[0],e=hash[4];const t1=hash[7]+(rr(e,6)^rr(e,11)^rr(e,25))+((e&hash[5])^((~e)&hash[6]))+k[i]+(w[i]=(i<16)?w[i]:(w[i-16]+(rr(w15,7)^rr(w15,18)^(w15>>>3))+w[i-7]+(rr(w2,17)^rr(w2,19)^(w2>>>10)))|0);const t2=(rr(a,2)^rr(a,13)^rr(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));hash=[(t1+t2)|0].concat(hash);hash[4]=(hash[4]+t1)|0}for(i=0;i<8;i++)hash[i]=(hash[i]+old[i])|0}for(i=0;i<8;i++)for(j=3;j+1;j--){const b=(hash[i]>>(j*8))&255;result+=((b<16)?0:'')+b.toString(16)}return result}
const hpw=p=>sha256('gr-events:'+p);

const I={
 home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
 star:'<path d="M12 3l2.7 5.6 6.2.9-4.5 4.3 1.1 6.1L12 17l-5.5 2.9 1.1-6.1L3.1 9.5l6.2-.9z"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 mega:'<path d="M3 10v4h4l6 4V6L7 10z"/><path d="M16 9a4 4 0 010 6M19 6a8 8 0 010 12"/>',
 spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.3 0 4 1.5 4.5 4"/>',
 truck:'<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
 team:'<circle cx="12" cy="7" r="3.5"/><path d="M5 21c.8-4 3.6-6.5 7-6.5s6.2 2.5 7 6.5"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 money:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 file:'<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
 folder:'<path d="M3 6h6l2 2h10v11H3z"/>',
 out:'<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 left:'<path d="M15 6l-6 6 6 6"/>', right:'<path d="M9 6l6 6-6 6"/>',
 up:'<path d="M12 19V5M6 11l6-6 6 6"/>', down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
 print:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
 upload:'<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>',
 dl:'<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>',
 pin:'<path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/>',
 check:'<path d="M5 12l5 5 9-10"/>',
 repeat:'<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 014-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 01-4 4H4"/>',
 shield:'<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/>',
 sheet:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
 img:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>',
 org:'<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>'
};
const ic=(n,s='')=>`<svg class="ico" viewBox="0 0 24 24" ${s}>${I[n]||''}</svg>`;

/* ================= armazenamento local (IndexedDB, com memória como reserva) ================= */
const Local={db:null,mem:{},ok:false,
 open(){return new Promise(res=>{try{const r=indexedDB.open('gr-events-sistem',1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('kv'))d.createObjectStore('kv');if(!d.objectStoreNames.contains('files'))d.createObjectStore('files')};r.onsuccess=()=>{this.db=r.result;this.ok=true;res()};r.onerror=()=>res()}catch(e){res()}})},
 tx(store,mode,fn){return new Promise((res,rej)=>{if(!this.db){res(fn(null));return}try{const t=this.db.transaction(store,mode),o=t.objectStore(store);const r=fn(o);t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error)}catch(e){rej(e)}})},
 async get(k){if(!this.db)return this.mem[k];return new Promise(res=>{try{const r=this.db.transaction('kv').objectStore('kv').get(k);r.onsuccess=()=>res(r.result);r.onerror=()=>res(undefined)}catch(e){res(undefined)}})},
 async set(k,v){this.mem[k]=v;if(!this.db)return;try{await this.tx('kv','readwrite',o=>o.put(JSON.parse(JSON.stringify(v)),k))}catch(e){toast('Não foi possível salvar neste aparelho.')}},
 async putFile(blob){const id='f_'+uid();this.mem[id]=blob;if(this.db){try{await this.tx('files','readwrite',o=>o.put(blob,id))}catch(e){toast('Arquivo grande demais para guardar neste aparelho.')}}return id},
 async getFile(id){if(this.mem[id])return this.mem[id];if(!this.db)return null;return new Promise(res=>{try{const r=this.db.transaction('files').objectStore('files').get(id);r.onsuccess=()=>{if(r.result)this.mem[id]=r.result;res(r.result||null)};r.onerror=()=>res(null)}catch(e){res(null)}})},
 async delFile(id){delete this.mem[id];if(this.db){try{await this.tx('files','readwrite',o=>o.delete(id))}catch(e){}}},
 allFiles(){return new Promise(res=>{const out=[];if(!this.db){res(out);return}try{const r=this.db.transaction('files').objectStore('files').openCursor();r.onsuccess=()=>{const c=r.result;if(c){out.push([c.key,c.value]);c.continue()}else res(out)};r.onerror=()=>res(out)}catch(e){res(out)}})}
};
/* Store aponta para a nuvem quando há sessão; senão, para este aparelho. */
const Store={
 get ok(){return Cloud.on||Local.ok},
 open(){return Local.open()},
 get:k=>Cloud.on?Cloud.get(k):Local.get(k),
 set:(k,v)=>Cloud.on?Cloud.set(k,v):Local.set(k,v),
 putFile:(b,n)=>Cloud.on?Cloud.putFile(b,n):Local.putFile(b),
 getFile:id=>Cloud.on?Cloud.getFile(id):Local.getFile(id),
 delFile:id=>Cloud.on?Cloud.delFile(id):Local.delFile(id)
};
const urlCache={};
function avatar(p,sz=36){p=p||{};const u=p.photo&&urlCache[p.photo];return u?`<img src="${u}" alt="" style="width:${sz}px;height:${sz}px;border-radius:50%;object-fit:cover;flex:none;background:#eee">`:`<span class="av" style="width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.36)}px">${esc(initials(p.name))}</span>`}
async function preloadPhotos(){await Promise.all(S.team.filter(p=>p.photo).map(p=>fileURL(p.photo)))}
async function fileURL(id){if(!id)return '';if(urlCache[id])return urlCache[id];const b=await Store.getFile(id);if(!b)return '';return urlCache[id]=URL.createObjectURL(b)}

/* ================= estado ================= */
const KEYS=['users','events','clients','suppliers','team','budgets','history','cash','leads','marketing','panels','quals','goals','recurring','settings'];
const S={};
const save=k=>Store.set(k,S[k]);
const EV_STATUS=['PLANEJAMENTO','CONFIRMADO','EM PRODUÇÃO','REALIZADO','CANCELADO'];
const evTag=s=>({'PLANEJAMENTO':'warn','CONFIRMADO':'or','EM PRODUÇÃO':'dark','REALIZADO':'ok','CANCELADO':'bad'}[s]||'');

function defaults(){
 return {
  users:[],recurring:[],events:[],clients:[],suppliers:[],team:[],budgets:[],cash:[],leads:[],marketing:[],
  history:Array.from({length:9},(_,i)=>({year:2018+i,proposals:0,quoted:0,closed:0,profit:0})),
  quals:CONTENT.quals.slice(),
  panels:{intro:CONTENT.intro,design:CONTENT.design,servicos:CONTENT.servicos,publico:CONTENT.publico},
  goals:JSON.parse(JSON.stringify(CONTENT.goals)),
  settings:{panelsNote:true}
 };
}

/* ================= sessão ================= */
let ME=null;
const isAdmin=()=>ME&&ME.role==='admin';
const roleName=r=>r==='admin'?'Administrador':'Produção';

/* ================= UI comum ================= */
let toastT;
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>t.style.display='none',3200)}
function modal(html,{wide=false}={}){const b=$('#mbox');b.className='mbox'+(wide?' wide':'');b.innerHTML=html;$('#modal').classList.add('on');const f=b.querySelector('input:not([type=hidden]):not([type=checkbox]),select,textarea');if(f)setTimeout(()=>f.focus(),30);return b}
function closeModal(){$('#modal').classList.remove('on');$('#mbox').innerHTML=''}
$('#modal').addEventListener('mousedown',e=>{if(e.target.id==='modal')closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#modal').classList.contains('on'))closeModal()});
function ask(msg,{ok='Confirmar',danger=true}={}){return new Promise(res=>{const b=modal(`<h2>Confirmar</h2><p>${esc(msg)}</p><div class="row"><span class="sp"></span><button class="btn" data-a="n">Cancelar</button><button class="btn ${danger?'dark':'pri'}" data-a="y">${esc(ok)}</button></div>`);b.querySelector('[data-a=n]').onclick=()=>{closeModal();res(false)};b.querySelector('[data-a=y]').onclick=()=>{closeModal();res(true)};setTimeout(()=>b.querySelector('[data-a=y]').focus(),40)})}
const mhead=t=>`<div class="row"><h2>${esc(t)}</h2><span class="sp"></span><button class="ib" type="button" data-close aria-label="Fechar">${ic('x')}</button></div>`;
document.addEventListener('click',e=>{if(e.target.closest('[data-close]'))closeModal()});
function formData(form){const o={};for(const el of form.elements){if(!el.name)continue;o[el.name]=el.type==='checkbox'?el.checked:el.value}return o}
const fld=(label,name,val='',type='text',extra='')=>`<label class="f"><span>${label}</span><input name="${name}" type="${type}" value="${esc(val)}" ${extra}></label>`;
const sel=(label,name,opts,val='')=>`<label class="f"><span>${label}</span><select name="${name}">${opts.map(o=>{const [v,t]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}" ${String(v)===String(val)?'selected':''}>${esc(t)}</option>`}).join('')}</select></label>`;
const txa=(label,name,val='')=>`<label class="f"><span>${label}</span><textarea name="${name}">${esc(val)}</textarea></label>`;
const stars=(n,name)=>`<div class="stars ${name?'':'ro'}" ${name?`data-stars="${name}"`:''}>${[1,2,3,4,5].map(i=>`<button type="button" data-v="${i}" class="${i<=n?'on':''}" aria-label="${i} estrelas">★</button>`).join('')}${name?`<input type="hidden" name="${name}" value="${n||0}">`:''}</div>`;
document.addEventListener('click',e=>{const b=e.target.closest('[data-stars] button');if(!b)return;const w=b.parentElement,v=+b.dataset.v;w.querySelector('input').value=v;w.querySelectorAll('button').forEach(x=>x.classList.toggle('on',+x.dataset.v<=v))});

/* autocomplete genérico */
function autocomplete(input,getList,onPick){let box;const close=()=>{box&&box.remove();box=null};
 input.setAttribute('autocomplete','off');
 input.addEventListener('input',()=>{close();const q=norm(input.value);if(!q)return;const l=getList().filter(x=>norm(x.label).includes(q)).slice(0,8);if(!l.length)return;box=document.createElement('div');box.className='acl';box.innerHTML=l.map((x,i)=>`<button type="button" data-i="${i}" style="display:flex;align-items:center;gap:10px">${x.pre||''}<span>${esc(x.label)}${x.sub?` <span class="muted small">· ${esc(x.sub)}</span>`:''}</span></button>`).join('');input.parentElement.classList.add('ac');input.parentElement.appendChild(box);box.addEventListener('mousedown',e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();const it=l[+b.dataset.i];input.value=it.label;close();onPick&&onPick(it)})});
 input.addEventListener('blur',()=>setTimeout(close,150))}

/* downloads e impressão */
let DL=null;
(async()=>{try{if(window.claude&&claude.use){DL=await claude.use('downloads')}}catch(e){DL=null}})();
function fallbackDownload(name,data){try{const blob=data instanceof Blob?data:new Blob([data]);const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();return true}catch(e){return false}}
async function download(name,data){
 if(DL){try{await DL.save({filename:name,data});toast('Arquivo salvo: '+name);return}catch(e){if(e&&e.code==='declined')return;}}
 fallbackDownload(name,data);toast('Download iniciado: '+name)}
function printHTML(title,body,opt={}){
 const doc=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font:13px/1.5 Manrope,Arial,sans-serif;color:#1C1713;margin:28px}h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:22px 0 8px;border-bottom:2px solid #D45A20;padding-bottom:4px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ddd;padding:6px;text-align:left;vertical-align:top}th{font-size:11px;color:#666}.num{text-align:right;white-space:nowrap}.ph{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.ph img{width:100%;aspect-ratio:4/3;object-fit:cover}.muted{color:#666}.lost td{background:#FDEEEA}.hdr{display:flex;align-items:center;gap:10px;margin-bottom:18px}.mk{width:34px;height:34px;border-radius:8px;background:#D45A20;color:#fff;display:grid;place-items:center;font-weight:900}@media print{body{margin:0}}</style></head><body>${opt.bare?'':'<div class="hdr"><div class="mk">GR</div><b>GR Events</b></div>'}${body}<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`;
 const fname=title.replace(/[^\w\-À-ú ]+/g,'').trim().replace(/\s+/g,'_')+'.html';
 const b=modal(`${mhead('Imprimir · '+title)}<p class="muted small">Se a janela de impressão não abrir neste navegador, baixe a versão para impressão: ela abre a impressão sozinha.</p><div class="row"><button class="btn pri" data-p>${ic('print')} Imprimir agora</button><button class="btn" data-d>${ic('dl')} Baixar para imprimir</button></div><div class="card" style="max-height:50vh;overflow:auto">${body}</div>`,{wide:true});
 b.querySelector('[data-p]').onclick=()=>{const pa=$('#printArea');pa.innerHTML=body;document.body.classList.add('printing');closeModal();setTimeout(()=>{try{window.print()}catch(e){}setTimeout(()=>{pa.innerHTML='';document.body.classList.remove('printing')},1000)},50)};
 b.querySelector('[data-d]').onclick=()=>download(fname,doc);
}

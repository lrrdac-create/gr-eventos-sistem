
/* ================= Clientes, Fornecedores, Equipe ================= */
const regQ={},regSel={};
function clientForm(c,after){c=c||{};const m=modal(`${mhead(c.id?'Editar cliente':'Novo cliente')}<form class="grid">
 <div class="grid g2">${fld('Nome','name',c.name||'','text','required')}${fld('Empresa','company',c.company||'')}</div>
 <div class="grid g2">${fld('Contato responsável','contact',c.contact||'')}${fld('Telefone','phone',c.phone||'','tel')}</div>
 <div class="grid g2">${fld('E-mail','email',c.email||'','email')}${fld('CPF / CNPJ','doc',c.doc||'')}</div>
 <div class="grid g2">${fld('Cidade','city',c.city||'')}${fld('UF','state',c.state||'')}</div>
 ${c.hist&&isAdmin()?`<p class="small muted">Histórico da planilha: ${c.hist.sent} orçamento(s) enviados, ${c.hist.closed} fechados, ${brl(c.hist.total)} fechado.</p>`:''}
 ${txa('Observações','notes',c.notes||'')}
 <div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">Salvar</button></div></form>`);
 m.querySelector('form').onsubmit=e=>{e.preventDefault();const d=formData(e.target);if(c.id)Object.assign(c,d);else S.clients.push({id:uid(),...d});save('clients');closeModal();after?after():route()}}
function registry(v,key){
 const cfg={clients:{t:'Clientes',cols:['Nome','Contato','Telefone','Cidade','Eventos',...(isAdmin()?['Histórico (planilha)']:[])],row:c=>[`<b>${esc(c.name)}</b>${c.company?`<div class="muted small">${esc(c.company)}</div>`:''}`,esc(c.contact||''),`<span class="nw">${esc(c.phone||'')}</span>${c.email?`<div class="muted small">${esc(c.email)}</div>`:''}`,esc([c.city,c.state].filter(Boolean).join(' / ')),S.events.filter(e=>norm(e.client)===norm(c.name)).length,...(isAdmin()?[c.hist?`<span class="nw">${c.hist.closed}/${c.hist.sent} fechados</span><div class="small muted nw">${brl(c.hist.total)}</div>`:'']:[])],form:c=>clientForm(c)},
  suppliers:{t:'Fornecedores',cols:['Nome','Serviço','Contato','Cidade','Faixa de preço','Avaliação'],row:c=>[`<b>${esc(c.name)}</b>${c.operation?`<div class="muted small">${esc(c.operation)}</div>`:''}`,esc(c.category||''),`${esc(c.contact||'')}<div class="nw">${esc(c.phone||'')}</div>`,esc([c.city,c.state].filter(Boolean).join(' / ')),`<span class="nw">${esc(c.price||'')}</span>`,stars(c.rating||0)],form:c=>personForm('suppliers',c,route)},
  team:{t:'Equipe',cols:['Nome','Função','Telefone','PIX','Dados bancários'],row:c=>[`<div class="row" style="gap:10px;flex-wrap:nowrap">${avatar(c,40)}<b>${esc(c.name)}</b></div>`,esc(c.role||''),`<span class="nw">${esc(c.phone||'')}</span>`,esc(c.pix||''),esc(c.bank||'')],form:c=>personForm('team',c,route)}}[key];
 const sel=regSel[key]=regSel[key]||new Set();[...sel].forEach(id=>{if(!S[key].some(x=>x.id===id))sel.delete(id)});
 const q=norm(regQ[key]||'');let L=S[key].slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));if(q)L=L.filter(c=>norm(Object.values(c).join(' ')).includes(q));
 v.innerHTML=`<div class="row"><h1>${cfg.t}</h1><span class="tag">${S[key].length}</span><span class="sp"></span>${isAdmin()?`<button class="btn danger" id="rcl">${ic('trash')} Apagar cadastros</button>`:''}<button class="btn pri" id="rn">${ic('plus')} Adicionar</button></div>
 <label style="max-width:420px"><input id="rq" type="search" placeholder="Buscar" value="${esc(regQ[key]||'')}" aria-label="Buscar"></label>
 <div class="row" id="selbar"><label class="row" style="gap:8px;font-weight:700;cursor:pointer"><input type="checkbox" id="rall" ${L.length&&L.every(c=>sel.has(c.id))?'checked':''} aria-label="Selecionar todos"> Selecionar todos${q?' (da busca)':''}</label><span class="muted small">${sel.size?sel.size+' selecionado(s)':''}</span><span class="sp"></span>${sel.size?`<button class="btn sm" id="rnone">Limpar seleção</button><button class="btn sm dark" id="rdel">${ic('trash')} Apagar selecionados (${sel.size})</button>`:''}</div>
 <div class="card scroll">${L.length?`<table class="stack"><thead><tr><th style="width:36px"></th>${cfg.cols.map(c=>`<th>${c}</th>`).join('')}<th></th></tr></thead><tbody>${L.map(c=>`<tr data-id="${c.id}" style="${sel.has(c.id)?'background:#FBF1E8':''}"><td><input type="checkbox" data-sel ${sel.has(c.id)?'checked':''} aria-label="Selecionar ${esc(c.name)}"></td>${cfg.row(c).map(x=>`<td>${x}</td>`).join('')}<td class="num nw"><button class="ib" data-ed aria-label="Editar">${ic('edit')}</button><button class="ib" data-rm aria-label="Excluir">${ic('trash')}</button></td></tr>`).join('')}</tbody></table>`:`<div class="empty">${q?'Nada encontrado.':'Cadastro vazio. Clique em Adicionar.'}</div>`}</div>`;
 $('#rn').onclick=()=>cfg.form(null);
 const keepScroll=()=>{const y=scrollY;registry(v,key);scrollTo(0,y)};
 $$('[data-sel]',v).forEach(c=>c.onchange=()=>{const id=c.closest('tr').dataset.id;c.checked?sel.add(id):sel.delete(id);keepScroll()});
 if($('#rall'))$('#rall').onchange=e=>{L.forEach(c=>e.target.checked?sel.add(c.id):sel.delete(c.id));keepScroll()};
 if($('#rnone'))$('#rnone').onclick=()=>{sel.clear();keepScroll()};
 if($('#rdel'))$('#rdel').onclick=async()=>{const n=sel.size;const used=new Set();S.events.forEach(e=>{e.team.forEach(a=>used.add(a.personId));e.suppliers.forEach(a=>used.add(a.supplierId))});const inEv=[...sel].filter(id=>used.has(id)).length;
  if(!await ask(`Apagar ${n} registro(s) de ${cfg.t}?${inEv?` ${inEv} deles estão escalados em eventos e lá aparecerão como "removido do cadastro".`:''} Não dá para desfazer.`,{ok:'Apagar '+n}))return;
  S[key].filter(r=>sel.has(r.id)).forEach(r=>{if(r.photo){Store.delFile(r.photo);delete urlCache[r.photo]}});S[key]=S[key].filter(r=>!sel.has(r.id));sel.clear();save(key);toast(n+' registro(s) apagado(s).');route()};if($('#rcl'))$('#rcl').onclick=()=>cleanupTool();
 $('#rq').oninput=e=>{regQ[key]=e.target.value;const p=e.target.selectionStart;registry(v,key);const n=$('#rq');n.focus();n.setSelectionRange(p,p)};
 $$('[data-ed]',v).forEach(b=>b.onclick=()=>cfg.form(S[key].find(x=>x.id===b.closest('tr').dataset.id)));
 $$('[data-rm]',v).forEach(b=>b.onclick=async()=>{const x=S[key].find(y=>y.id===b.closest('tr').dataset.id);if(!await ask(`Excluir "${x.name}" do cadastro?`,{ok:'Excluir'}))return;S[key]=S[key].filter(y=>y!==x);save(key);route()});
}
VIEWS.clientes=v=>registry(v,'clients');VIEWS.fornecedores=v=>registry(v,'suppliers');VIEWS.equipe=v=>registry(v,'team');

/* ================= Novos Projetos (funil de leads) ================= */
const STAGES=[['novo','Novo'],['analise','Análise'],['aprovado','Aprovado'],['reuniao','Reunião / VT'],['proposta','Proposta'],['execucao','Execução'],['recusado','Recusado']];
const stName=s=>(STAGES.find(x=>x[0]===s)||[,s])[1];
function qualScore(l){return (l.q||[]).filter(Boolean).length}
function leadToBudgetLost(l){if(S.budgets.some(b=>b.leadId===l.id))return;S.budgets.push({id:uid(),leadId:l.id,date:today(),name:l.eventType?`${l.eventType} · ${l.name}`:l.name,client:l.company||l.name,quoted:num(l.budget),closed:0,profit:0,status:'PERDIDO',realization:'CANCELADO',eventId:'',obs:'Vindo de Novos Projetos (recusado)'});save('budgets')}
function setStage(l,s){l.stage=s;if(s==='recusado')leadToBudgetLost(l);save('leads')}
async function leadForm(l){
 const isNew=!l;l=l||{stage:'novo',q:[false,false,false,false,false],photos:[],meeting:{}};
 const urls=await Promise.all((l.photos||[]).map(p=>fileURL(p.fileId)));
 const m=modal(`${mhead(isNew?'Novo lead':l.name)}<form class="grid">
  <div class="grid g2">${fld('Nome','name',l.name||'','text','required')}${fld('Empresa','company',l.company||'')}</div>
  <div class="grid g2">${fld('Telefone','phone',l.phone||'','tel')}${fld('E-mail','email',l.email||'','email')}</div>
  <div class="grid g3">${fld('Tipo de evento','eventType',l.eventType||'')}${fld('Data','date',l.date||'','date')}${fld('Local','local',l.local||'')}</div>
  <div class="grid g3">${fld('Participantes','guests',l.guests||'')}${fld('Orçamento (R$)','budget',l.budget||'','text','inputmode="decimal"')}${fld('Como chegou','source',l.source||'')}</div>
  ${fld('Indicação','referral',l.referral||'')}
  <fieldset class="card" style="background:#fff;display:grid;gap:8px"><legend style="font-weight:800;padding:0 6px">Qualificação do público-alvo</legend>
   ${S.quals.map((q,i)=>`<label class="row" style="gap:10px;flex-wrap:nowrap"><input type="checkbox" name="q${i}" ${l.q&&l.q[i]?'checked':''}><span>${esc(q)}</span></label>`).join('')}
   <p class="small muted" id="qs"></p></fieldset>
  ${sel('Etapa','stage',STAGES,l.stage)}
  <fieldset class="card" style="background:#fff;display:grid;gap:10px"><legend style="font-weight:800;padding:0 6px">Reunião ou visita técnica (VT)</legend>
   <div class="grid g2">${fld('Data da reunião / VT','mdate',(l.meeting||{}).date||'','date')}${fld('Participantes da GR','mwho',(l.meeting||{}).who||'')}</div>
   ${txa('Anotações','mnotes',(l.meeting||{}).notes||'')}
   <label class="f"><span>Fotos do espaço</span><input type="file" name="mph" accept="image/*" multiple></label>
   ${(l.photos||[]).length?`<div class="ph">${l.photos.map((p,i)=>`<figure><img src="${urls[i]}" alt="Foto do espaço"></figure>`).join('')}</div>`:''}</fieldset>
  ${txa('Observações','notes',l.notes||'')}
  <div class="row">${isNew?'':`<button class="btn danger" type="button" id="ldel">${ic('trash')} Excluir</button>`}<span class="sp"></span>${!isNew&&l.stage!=='recusado'?`<button class="btn dark" type="button" id="lev">Criar Evento em Execução</button>`:''}<button class="btn pri">Salvar</button></div></form>`,{wide:true});
 const f=m.querySelector('form');
 const upd=()=>{const n=S.quals.filter((_,i)=>f['q'+i].checked).length;$('#qs').innerHTML=`${n} de ${S.quals.length} positivas · ${n>=3?'<span class="tag ok">qualificado: 3 ou mais</span>':'<span class="tag warn">precisa de 3 ou mais para aprovar</span>'}`};upd();
 S.quals.forEach((_,i)=>f['q'+i].onchange=upd);
 const collect=async()=>{const d=formData(f);Object.assign(l,{name:d.name,company:d.company,phone:d.phone,email:d.email,eventType:d.eventType,date:d.date,local:d.local,guests:d.guests,budget:d.budget,source:d.source,referral:d.referral,notes:d.notes});
  l.q=S.quals.map((_,i)=>!!d['q'+i]);l.meeting={date:d.mdate,who:d.mwho,notes:d.mnotes};l.photos=l.photos||[];for(const file of f.mph.files){l.photos.push({fileId:await Store.putFile(file),name:file.name})}
  let st=d.stage;if(qualScore(l)>=3&&['novo','analise'].includes(st))st='aprovado';
  if(isNew&&!S.leads.includes(l)){l.id=uid();l.createdAt=Date.now();S.leads.push(l)}setStage(l,st)};
 f.onsubmit=async e=>{e.preventDefault();await collect();closeModal();toast(l.stage==='aprovado'&&qualScore(l)>=3?'Lead aprovado na qualificação.':'Lead salvo.');route()};
 if(!isNew){$('#ldel').onclick=async()=>{if(!await ask(`Excluir o lead "${l.name}"?`,{ok:'Excluir'}))return;(l.photos||[]).forEach(p=>Store.delFile(p.fileId));S.leads=S.leads.filter(x=>x!==l);save('leads');route()};
  const ce=$('#lev');if(ce)ce.onclick=async()=>{await collect();closeModal();eventForm({name:l.eventType?`${l.eventType} · ${l.company||l.name}`:(l.company||l.name),client:l.company||l.name,contact:l.name,phone:l.phone,email:l.email,local:l.local,start:l.date,end:l.date,guests:l.guests,notes:[l.notes,l.meeting&&l.meeting.notes?'Reunião/VT: '+l.meeting.notes:''].filter(Boolean).join('\n')},ev=>{l.stage='execucao';l.eventId=ev.id;save('leads')})}}
}
VIEWS.projetos=v=>{
 v.innerHTML=`<div class="row"><h1>Novos Projetos</h1><span class="sp"></span><button class="btn pri" id="ln">${ic('plus')} Novo lead</button></div>
 <p class="muted">Funil do primeiro contato até virar evento. Com 3 ou mais respostas positivas na qualificação, o lead é aprovado. Recusados entram em Orçamentos como PERDIDO.</p>
 <div class="kan">${STAGES.map(([k,n])=>{const L=S.leads.filter(l=>l.stage===k).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));return `<div class="col"><h3><span>${n}</span><span class="tag ${k==='novo'&&L.length?'bad':''}">${L.length}</span></h3>${L.map(l=>`<div class="card lead" data-l="${l.id}" style="cursor:pointer;padding:12px"><b>${esc(l.name)}</b><span class="muted small">${esc([l.company,l.eventType].filter(Boolean).join(' · '))}</span><div class="row" style="gap:6px">${l.date?`<span class="tag">${fdate(l.date)}</span>`:''}<span class="tag ${qualScore(l)>=3?'ok':''}">${qualScore(l)}/${S.quals.length}</span>${l.budget?`<span class="tag">${isAdmin()?brl(num(l.budget)):'—'}</span>`:''}</div>
  <select data-st="${l.id}" style="min-height:36px;padding:4px 8px;font-size:13px" aria-label="Mover etapa">${STAGES.map(s=>`<option value="${s[0]}" ${s[0]===l.stage?'selected':''}>${s[1]}</option>`).join('')}</select></div>`).join('')||'<p class="muted small" style="padding:4px">—</p>'}</div>`}).join('')}</div>`;
 $('#ln').onclick=()=>leadForm();
 $$('[data-l]',v).forEach(c=>c.onclick=e=>{if(e.target.closest('select'))return;leadForm(S.leads.find(l=>l.id===c.dataset.l))});
 $$('[data-st]',v).forEach(s=>s.onchange=()=>{const l=S.leads.find(x=>x.id===s.dataset.st);if(s.value==='execucao'&&!l.eventId){leadForm(l);toast('Use "Criar Evento em Execução" para abrir o evento já preenchido.');s.value=l.stage;return}setStage(l,s.value);if(s.value==='recusado')toast('Lead recusado: entrou em Orçamentos como PERDIDO.');route()});
};

/* ================= Marketing ================= */
let mkTab='internos';
VIEWS.marketing=v=>{
 const L=S.marketing.filter(m=>m.tab===mkTab).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 v.innerHTML=`<div class="row"><h1>Marketing</h1><span class="sp"></span><button class="btn pri" id="mn">${ic('plus')} Nova ação</button></div>
 <div class="tabs"><button data-mt="internos" class="${mkTab==='internos'?'on':''}">Clientes Internos</button><button data-mt="novos" class="${mkTab==='novos'?'on':''}">Novos Clientes</button></div>
 <div class="card scroll">${L.length?`<table class="stack"><thead><tr><th>Data</th><th>Tipo</th><th>Cliente</th><th>Ação</th><th>Canal</th><th>Status</th><th>Observações</th><th></th></tr></thead><tbody>${L.map(m=>`<tr data-id="${m.id}"><td class="nw">${fdate(m.date)}</td><td>${esc(m.type||'')}</td><td>${esc(m.client||'')}</td><td>${esc(m.desc||'')}</td><td>${esc(m.channel||'')}</td><td><span class="tag ${m.status==='Concluída'?'ok':m.status==='Em andamento'?'or':''}">${esc(m.status||'')}</span></td><td class="small">${esc(m.obs||'')}</td><td class="num nw"><button class="ib" data-ed aria-label="Editar">${ic('edit')}</button><button class="ib" data-rm aria-label="Excluir">${ic('trash')}</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">Nenhuma ação registrada nesta aba.</div>'}</div>`;
 $$('[data-mt]',v).forEach(b=>b.onclick=()=>{mkTab=b.dataset.mt;route()});
 const form=m=>{m=m||{tab:mkTab,status:'Planejada',date:today()};const md=modal(`${mhead(m.id?'Editar ação':'Nova ação')}<form class="grid">
  <div class="grid g2">${sel('Aba','tab',[['internos','Clientes Internos'],['novos','Novos Clientes']],m.tab)}${fld('Tipo','type',m.type||'','text','list="mktypes"')}</div>
  <datalist id="mktypes"><option>Post</option><option>E-mail</option><option>Visita</option><option>Brinde</option><option>Ligação</option><option>Anúncio</option><option>Evento</option></datalist>
  <div class="grid g2">${fld('Cliente','client',m.client||'')}${fld('Canal','channel',m.channel||'','text','list="mkch"')}</div>
  <datalist id="mkch"><option>Instagram</option><option>WhatsApp</option><option>LinkedIn</option><option>E-mail</option><option>Presencial</option><option>Site</option></datalist>
  ${txa('Descrição da ação','desc',m.desc||'')}
  <div class="grid g2">${fld('Data','date',m.date||'','date')}${sel('Status','status',['Planejada','Em andamento','Concluída','Cancelada'],m.status)}</div>
  ${txa('Observações','obs',m.obs||'')}
  <div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">Salvar</button></div></form>`);
  autocomplete(md.querySelector('[name=client]'),clientList);
  md.querySelector('form').onsubmit=e=>{e.preventDefault();const d=formData(e.target);if(m.id)Object.assign(m,d);else S.marketing.push({id:uid(),...d});mkTab=d.tab;save('marketing');closeModal();route()}};
 $('#mn').onclick=()=>form();
 $$('[data-ed]',v).forEach(b=>b.onclick=()=>form(S.marketing.find(x=>x.id===b.closest('tr').dataset.id)));
 $$('[data-rm]',v).forEach(b=>b.onclick=async()=>{if(!await ask('Excluir esta ação?',{ok:'Excluir'}))return;S.marketing=S.marketing.filter(x=>x.id!==b.closest('tr').dataset.id);save('marketing');route()});
};

/* ================= Painéis informativos ================= */
function md(s){const lines=String(s||'').split('\n');let h='',inL=false,tb=null;
 const flushT=()=>{if(tb){h+=`<div class="scroll"><table class="mdt"><thead><tr>${tb[0].map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${tb.slice(1).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;tb=null}};
 for(const raw of lines){const l=raw.trimEnd();
  if(/^\s*\|/.test(l)){if(inL){h+='</ul>';inL=false}const cells=l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());if(cells.every(c=>/^:?-+:?$/.test(c)))continue;(tb=tb||[]).push(cells);continue}
  flushT();
  if(/^\s*[-•]\s+/.test(l)){if(!inL){h+='<ul>';inL=true}h+=`<li>${esc(l.replace(/^\s*[-•]\s+/,''))}</li>`;continue}
  if(inL){h+='</ul>';inL=false}
  if(/^##?\s+/.test(l))h+=`<h2>${esc(l.replace(/^##?\s+/,''))}</h2>`;else if(/^>\s*/.test(l))h+=`<blockquote>${esc(l.replace(/^>\s*/,''))}</blockquote>`;else if(l.trim())h+=`<p>${esc(l)}</p>`}
 flushT();if(inL)h+='</ul>';return h.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')}
function editPanel(key,title,extra=''){const m=modal(`${mhead('Editar · '+title)}<form class="grid"><p class="muted small">"## " no começo da linha vira título, "- " vira lista, "> " vira destaque e linhas com "|" viram tabela.</p><label class="f"><span>Conteúdo</span><textarea name="c" style="min-height:46vh;font-size:15px">${esc(S.panels[key]||'')}</textarea></label>${extra}
  <div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">Salvar</button></div></form>`,{wide:true});
 m.querySelector('form').onsubmit=e=>{e.preventDefault();const d=formData(e.target);S.panels[key]=d.c;save('panels');if(key==='publico'){S.quals=S.quals.map((q,i)=>(d['q'+i]||'').trim()||q);save('quals')}closeModal();route()}}
const LOGOS=[['Principal','#D45A20','#FFFFFF'],['Clara','#FFFFFF','#1C1713'],['Escura','#1C1713','#FFFFFF'],['Off-White','#F7F3ED','#D45A20']];
function designBlock(){
 return `<section class="card" style="padding:0;overflow:hidden">
  <div style="background:#1C1713;color:#F7F3ED;padding:clamp(22px,4vw,40px);display:grid;gap:10px;position:relative;overflow:hidden">
   <svg viewBox="0 0 200 200" style="position:absolute;right:-30px;top:-30px;width:240px;opacity:.9" aria-hidden="true"><path d="M60 20 L140 100 L60 180" fill="none" stroke="#D45A20" stroke-width="34" stroke-linejoin="miter"/></svg>
   <p style="color:#D45A20;font-weight:800;font-size:13px;position:relative">Brand Identity Manual v2.0 · 2026</p>
   <h2 style="font-size:clamp(30px,5vw,52px);font-weight:900;line-height:.95;position:relative;color:#F7F3ED">FEITO PARA<br>ACONTECER</h2>
   <p style="max-width:52ch;color:#CFC4B4;position:relative">Identidade e design da marca: use estas cores e versões de logo em propostas, credenciais, uniformes e materiais.</p></div>
  <div style="padding:clamp(18px,3vw,28px);display:grid;gap:22px">
   <div><h3 style="margin-bottom:10px">Paleta de cores</h3><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:10px">
    ${[['GR Cream','#F7F3ED','#1C1713'],['GR Orange','#D45A20','#fff'],['GR Black','#1C1713','#F7F3ED']].map(c=>`<button class="sw" type="button" data-hex="${c[1]}" style="background:${c[1]};color:${c[2]}" title="Copiar ${c[1]}"><b>${c[0]}</b><span>${c[1]}</span></button>`).join('')}</div></div>
   <div><h3 style="margin-bottom:10px">Logo · quatro versões oficiais</h3><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,130px),1fr));gap:10px">
    ${LOGOS.map(l=>`<figure style="margin:0;display:grid;gap:6px"><div style="background:${l[1]};border:1px solid var(--line);border-radius:10px;aspect-ratio:4/3;display:grid;place-items:center;color:${l[2]}"><div style="text-align:center;line-height:.9"><div style="font-family:Archivo,sans-serif;font-weight:900;font-size:40px;letter-spacing:-.06em">GR</div><div style="font-size:9px;font-weight:700;letter-spacing:.12em">EVENTS</div></div></div><figcaption class="small" style="font-weight:700">${l[0]}</figcaption></figure>`).join('')}</div>
    <p class="muted small" style="margin-top:6px">Representação das versões. Use sempre os arquivos oficiais da logo.</p></div>
   <div><h3 style="margin-bottom:10px">Tipografia</h3><div class="card" style="background:#fff;display:grid;gap:4px"><div style="font-family:Archivo,sans-serif;font-weight:900;font-size:clamp(26px,4vw,40px);line-height:1;letter-spacing:-.03em">TÍTULOS FORTES E COMPACTOS</div><div class="muted">Títulos em caixa alta, peso extra-negrito e espaçamento justo, como no manual. Textos corridos em sans-serif limpa, com bastante respiro.</div></div></div>
   <div class="prose" style="max-width:none">${md(S.panels.design)}</div>
   <div class="row"><span class="sp"></span><button class="btn" id="pde">✏️ Editar texto de design</button></div>
  </div></section>`;
}
/* metas do ano */
const gDone=g=>{if(g.client&&g.client.trim()){const y=+S.goals.year;return S.budgets.filter(b=>b.status==='FECHADO'&&norm(b.client)===norm(g.client)&&+(b.date||'').slice(0,4)===y).reduce((s,b)=>s+budgetClosed(b),0)}return num(g.done)};
const short=v=>v>=1e6?'R$ '+(v/1e6).toLocaleString('pt-BR',{maximumFractionDigits:2})+' mi':v>=1e3?'R$ '+(v/1e3).toLocaleString('pt-BR',{maximumFractionDigits:0})+' mil':brl(v);
function goalStats(){const G=S.goals,T=G.items.reduce((s,g)=>s+num(g.target),0),D=G.items.reduce((s,g)=>s+Math.min(gDone(g),num(g.target)||Infinity),0),Dall=G.items.reduce((s,g)=>s+gDone(g),0);const now=new Date(),y=+G.year;const pace=y<now.getFullYear()?1:y>now.getFullYear()?0:(now.getMonth()+now.getDate()/31)/12;return {T,D:Dall,p:T?D/T:0,pace}}
function goalsBlock(){
 const G=S.goals,ad=isAdmin(),st=goalStats();
 const fe=S.budgets.filter(b=>b.status==='FECHADO'),tk=fe.length?fe.reduce((s,b)=>s+budgetClosed(b),0)/fe.length:0,conv=S.budgets.length?fe.length/S.budgets.length:0;
 const novos=G.items.filter(g=>g.kind==='Buscar').reduce((s,g)=>s+Math.max(0,num(g.target)-gDone(g)),0);
 return `<section class="card grid" id="metas" style="gap:16px;border-top:4px solid var(--or)">
  <div class="row"><div><p class="small" style="color:var(--or2);font-weight:800">Meta do ano</p><h2 style="font-size:clamp(24px,3vw,32px)">Meta ${G.year}${ad?` · ${short(st.T)}`:''}</h2></div><span class="sp"></span>${ad?`<button class="btn" id="gedit">${ic('edit')} Editar meta</button>`:''}</div>
  <div class="grid" style="gap:6px"><div class="row small" style="justify-content:space-between"><b>${Math.round(st.p*100)}% realizado${ad?` · ${brl(st.D)}`:''}</b><span class="muted">Ritmo esperado hoje: ${Math.round(st.pace*100)}%</span></div>
   <div class="bar" style="height:14px;position:relative"><i style="width:${Math.min(100,st.p*100)}%"></i><span style="position:absolute;top:-3px;bottom:-3px;left:${st.pace*100}%;width:2px;background:var(--ink)" title="Ritmo esperado"></span></div></div>
  <div class="scroll"><table class="stack"><thead><tr><th>Meta</th><th>Conta</th><th>Objetivo</th>${ad?'<th class="num">Alvo</th><th class="num">Realizado</th>':''}<th style="width:28%">Progresso</th></tr></thead><tbody>
  ${G.items.map(g=>{const d=gDone(g),p=num(g.target)?d/num(g.target):0;return `<tr><td><b>${esc(g.label)}</b></td><td>${esc(g.client||'—')}${g.client?'<div class="muted small">automático pelos orçamentos fechados</div>':''}</td><td><span class="tag ${g.kind==='Buscar'?'or':'dark'}">${esc(g.kind)} +${short(num(g.target)).replace('R$ ','')}</span></td>${ad?`<td class="num">${brl(g.target)}</td><td class="num">${brl(d)}</td>`:''}<td><div class="row" style="gap:8px;flex-wrap:nowrap"><div class="bar sp"><i style="width:${Math.min(100,p*100)}%"></i></div><span class="small nw">${Math.round(p*100)}%</span></div></td></tr>`}).join('')}
  </tbody></table></div>
  ${ad&&novos>0?`<div class="card" style="background:#fff"><h3>Funil necessário para as contas novas</h3><p class="small" style="margin-top:6px">${tk&&conv?`Com o ticket médio atual de <b>${brl(tk)}</b> por orçamento fechado e conversão de <b>${pct(conv)}</b>, faltam <b>${brl(novos)}</b> em contas novas: cerca de <b>${Math.ceil(novos/tk)}</b> eventos fechados, o que pede uns <b>${Math.ceil(novos/tk/conv)}</b> orçamentos enviados no ano (${Math.ceil(novos/tk/conv/12)} por mês).`:'Assim que houver orçamentos fechados no sistema, aqui aparece quantas propostas por mês são necessárias para bater as metas de contas novas, com base no ticket médio e na conversão reais.'}</p></div>`:''}
  <div><div class="row"><h3>Estratégia: como bater a meta</h3><span class="sp"></span>${ad?`<button class="btn sm" id="gstr">✏️ Editar estratégia</button>`:''}</div><div class="prose" style="max-width:none;margin-top:8px">${md(G.strategy)}</div></div>
 </section>`;
}
function goalsEdit(){
 const G=JSON.parse(JSON.stringify(S.goals));
 const draw=()=>{const m=modal(`${mhead('Editar meta do ano')}<form class="grid" id="gf">${fld('Ano da meta','year',G.year,'number','min="2020" max="2100" required style="max-width:160px"')}
  <p class="muted small">Se preencher a conta com o nome do cliente, o realizado é somado sozinho a partir dos orçamentos FECHADOS desse cliente no ano. Sem conta, digite o realizado à mão.</p>
  <div class="scroll"><table><thead><tr><th>Meta</th><th>Conta (cliente)</th><th>Objetivo</th><th>Alvo (R$)</th><th>Realizado (R$)</th><th></th></tr></thead><tbody>
  ${G.items.map((g,i)=>`<tr data-i="${i}"><td><input data-k="label" value="${esc(g.label)}" style="min-width:150px"></td><td><input data-k="client" value="${esc(g.client||'')}" style="min-width:150px" list="gcl"></td><td><select data-k="kind" style="min-width:110px">${['Faturar','Buscar'].map(k=>`<option ${k===g.kind?'selected':''}>${k}</option>`).join('')}</select></td><td><input data-k="target" value="${num(g.target).toLocaleString('pt-BR')}" inputmode="decimal" style="min-width:120px;text-align:right"></td><td><input data-k="done" value="${num(g.done).toLocaleString('pt-BR')}" inputmode="decimal" style="min-width:120px;text-align:right" ${g.client?'disabled title="Automático pelos orçamentos"':''}></td><td><button type="button" class="ib" data-rm="${i}" aria-label="Remover">${ic('trash')}</button></td></tr>`).join('')}
  </tbody></table></div><datalist id="gcl">${S.clients.map(c=>`<option value="${esc(c.name)}">`).join('')}</datalist>
  <div class="row"><button type="button" class="btn" id="gadd">${ic('plus')} Adicionar meta</button><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">Salvar meta</button></div></form>`,{wide:true});
  const read=()=>{G.year=+m.querySelector('[name=year]').value||G.year;$$('tr[data-i]',m).forEach(tr=>{const g=G.items[+tr.dataset.i];$$('[data-k]',tr).forEach(i=>{g[i.dataset.k]=['target','done'].includes(i.dataset.k)?num(i.value):i.value})})};
  $$('[data-k=client]',m).forEach(i=>i.oninput=()=>{const d=i.closest('tr').querySelector('[data-k=done]');d.disabled=!!i.value.trim()});
  $('#gadd').onclick=()=>{read();G.items.push({id:uid(),label:'Nova meta',kind:'Faturar',target:0,done:0,client:''});draw()};
  $$('[data-rm]',m).forEach(b=>b.onclick=()=>{read();G.items.splice(+b.dataset.rm,1);draw()});
  $('#gf').onsubmit=e=>{e.preventDefault();read();S.goals=G;save('goals');closeModal();toast('Meta salva.');route()}};
 draw();
}
function panel(v,key,title){
 v.innerHTML=`<div class="row"><h1>${title}</h1><span class="sp"></span><button class="btn" id="pe">✏️ Editar Conteúdo</button></div>
 ${key==='publico'?goalsBlock():''}
 <article class="card panel"><div class="prose">${md(S.panels[key])}</div></article>
 ${key==='intro'?designBlock():''}
 ${key==='publico'?`<section class="card"><h2 style="margin-bottom:10px">Qualificação de novos leads</h2><p class="muted small" style="margin-bottom:10px">Usada em Novos Projetos: 3 ou mais respostas positivas aprovam o lead.</p><ol style="margin:0;padding-left:20px;display:grid;gap:6px">${S.quals.map(q=>`<li>${esc(q)}</li>`).join('')}</ol></section>`:''}`;
 $('#pe').onclick=()=>editPanel(key,title,key==='publico'?`<fieldset class="card" style="background:#fff;display:grid;gap:8px"><legend style="font-weight:800;padding:0 6px">As 5 perguntas de qualificação</legend>${S.quals.map((q,i)=>`<input name="q${i}" value="${esc(q)}" aria-label="Pergunta ${i+1}">`).join('')}</fieldset>`:'');
 if(key==='intro'){$('#pde').onclick=()=>editPanel('design','Design da marca');$$('[data-hex]',v).forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.hex);toast(b.dataset.hex+' copiado.')}catch(e){toast(b.dataset.hex)}})}
 if(key==='publico'&&isAdmin()){$('#gedit').onclick=goalsEdit;$('#gstr').onclick=()=>{const m=modal(`${mhead('Editar estratégia')}<form class="grid"><label class="f"><span>Estratégia</span><textarea name="c" style="min-height:50vh;font-size:15px">${esc(S.goals.strategy||'')}</textarea></label><div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">Salvar</button></div></form>`,{wide:true});m.querySelector('form').onsubmit=e=>{e.preventDefault();S.goals.strategy=e.target.c.value;save('goals');closeModal();route()}}}
}
VIEWS.intro=v=>panel(v,'intro','Intro GR Events');VIEWS.servicos=v=>panel(v,'servicos','Nossos Serviços');VIEWS.publico=v=>panel(v,'publico','Público Alvo');

/* ================= atualizações de dados de versões anteriores ================= */
function migrate(){
 const P=S.panels||(S.panels={});
 if(!P.intro||P.intro.includes('Escreva aqui a história da GR Events'))P.intro=CONTENT.intro;
 if(!P.servicos||P.servicos.includes('Frente 1: descreva aqui'))P.servicos=CONTENT.servicos;
 if(!P.publico||P.publico.includes('Descreva aqui os segmentos'))P.publico=CONTENT.publico;
 if(!P.design)P.design=CONTENT.design;
 save('panels');
 if(S.quals&&S.quals[0]==='O evento é corporativo, social de alto padrão ou institucional?'){S.quals=CONTENT.quals.slice();save('quals')}
 if(!S.goals||!S.goals.items){S.goals=JSON.parse(JSON.stringify(CONTENT.goals));save('goals')}
 if(!isAdmin())return;
 let ch=false;S.events.forEach(ev=>(ev.cc&&ev.cc.items||[]).forEach(i=>{const c=i.cashId&&S.cash.find(x=>x.id===i.cashId);if(!c){syncCash(ev,i);ch=true}}));if(ch)saveEv();
}

/* ================= início ================= */
async function startSession(){
 const me=await loadMe();
 if(!me){renderLogin();return}
 if(me.blocked){
  await sb.auth.signOut();
  renderLogin();
  const e=$('#lerr');if(e){e.textContent='Este e-mail ainda não foi liberado pelo Administrador.'}
  return;
 }
 ME=me;Cloud.on=true;
 $('#root').innerHTML='<div style="display:grid;place-items:center;min-height:100vh;color:#8C8273">Carregando os dados…</div>';
 const D=defaults();
 for(const k of KEYS){
  let v;try{v=await Store.get(k)}catch(e){v=undefined}
  S[k]=v!==undefined&&v!==null?v:D[k];
  if(v===undefined||v===null)await Store.set(k,S[k]);
 }
 if(!S.settings)S.settings={};
 migrate();
 if(isAdmin()){try{runRecurring()}catch(e){}}
 await preloadPhotos();
 route();
}
(async()=>{
 await Local.open();
 if(!sbInit()){$('#root').innerHTML='<div style="display:grid;place-items:center;min-height:100vh;padding:24px;text-align:center;color:#8C8273">Não foi possível carregar a nuvem.<br>Verifique a conexão e recarregue a página.</div>';return}
 const s=(await sb.auth.getSession()).data.session;
 if(s)await startSession();else renderLogin();
 if('serviceWorker'in navigator&&location.protocol==='https:'){try{navigator.serviceWorker.register('sw.js')}catch(e){}}
 window.addEventListener('focus',()=>cloudReload(true));
 setInterval(()=>{if(!document.hidden)cloudReload(true)},60000);
})();
}
</script>
</body>
</html>


/* ================= arrastar para reordenar (mouse e toque) ================= */
function sortable(list,item,handle,done){
 list.addEventListener('pointerdown',e=>{const h=e.target.closest(handle);if(!h||!list.contains(h))return;const el=h.closest(item);if(!el)return;e.preventDefault();e.stopPropagation();el.classList.add('dragging');try{h.setPointerCapture(e.pointerId)}catch(_){}
  const move=ev=>{const sibs=[...list.querySelectorAll(item)].filter(x=>x!==el);for(const s of sibs){const r=s.getBoundingClientRect();if(ev.clientY<r.top+r.height/2){if(el.nextElementSibling!==s)s.before(el);return}}const last=sibs[sibs.length-1];if(last&&last.nextElementSibling!==el)last.after(el)};
  const up=()=>{el.classList.remove('dragging');h.removeEventListener('pointermove',move);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);done([...list.querySelectorAll(item)].map(x=>x.dataset.id))};
  h.addEventListener('pointermove',move);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up)});
 list.addEventListener('click',e=>{if(e.target.closest(handle))e.stopPropagation()},true);
}

/* ================= helpers de evento ================= */
const getEv=id=>S.events.find(e=>e.id===id);
const saveEv=()=>save('events');
function newEvent(d={}){return {id:uid(),name:'',client:'',contact:'',phone:'',email:'',local:'',address:'',start:'',end:'',startTime:'',endTime:'',guests:'',status:'PLANEJAMENTO',notes:'',order:-Date.now(),createdAt:Date.now(),team:[],suppliers:[],checklist:[],schedule:[],timeline:[],cc:{tax:0,items:[]},proposal:null,photos:[],docs:[],org:{nodes:[],edges:[]},chat:[],...d}}
function ccCalc(ev){const it=(ev.cc&&ev.cc.items)||[];const fat=it.filter(i=>i.kind==='entrada').reduce((s,i)=>s+num(i.value),0),out=it.filter(i=>i.kind==='saida').reduce((s,i)=>s+num(i.value),0),tax=fat*num(ev.cc&&ev.cc.tax)/100,lucro=fat-out-tax;return {fat,out,tax,lucro,margem:fat?lucro/fat:NaN}}
function budgetClosed(b){const ev=b.eventId&&getEv(b.eventId);return ev?ccCalc(ev).fat:num(b.closed)}
function budgetProfit(b){const ev=b.eventId&&getEv(b.eventId);return ev?ccCalc(ev).lucro:num(b.profit)}
function payeeOf(item){if(!item.payeeId)return null;const L=item.payeeType==='team'?S.team:S.suppliers;return L.find(x=>x.id===item.payeeId)||null}
function syncCash(ev,item){
 let c=item.cashId&&S.cash.find(x=>x.id===item.cashId);
 if(!c){c={id:uid(),order:Date.now(),recurring:false};S.cash.push(c);item.cashId=c.id}
 const pay=payeeOf(item),isIn=item.kind==='entrada';
 Object.assign(c,{desc:`${ev.name} · ${item.desc||(isIn?'Entrada':'Saída')}`,company:isIn?(ev.client||''):(pay?pay.name:(item.company||'')),value:num(item.value),type:isIn?'entrada':'saida',status:item.status||'PENDENTE',account:item.bank||'',date:item.payDate||ev.start||today(),cc:ev.name,costType:'Evento',obs:'Lançado pelo Centro de Custo do evento',eventId:ev.id,ccItemId:item.id});
 save('cash');
}
function ensureClient(name){if(!name||!name.trim())return;if(S.clients.some(c=>norm(c.name)===norm(name)))return;S.clients.push({id:uid(),name:name.trim(),company:'',phone:'',email:'',doc:'',notes:''});save('clients');toast('Cliente adicionado ao cadastro.')}
const clientList=()=>S.clients.map(c=>({label:c.name,sub:c.company||c.phone,obj:c}));
const gcalURL=e=>{const d=s=>(s||'').replace(/-/g,'');const t=x=>(x||'').replace(':','')+'00';const s=e.start?d(e.start)+(e.startTime?'T'+t(e.startTime):''):'';let en=e.end||e.start;let ed=en?d(en)+(e.endTime||e.startTime?'T'+t(e.endTime||e.startTime):''):'';if(e.start&&!e.startTime&&en){const x=new Date(en+'T12:00:00');x.setDate(x.getDate()+1);ed=x.toISOString().slice(0,10).replace(/-/g,'')}
 return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(e.name)+(s?'&dates='+s+'/'+ed:'')+'&location='+encodeURIComponent([e.local,e.address].filter(Boolean).join(' - '))+'&details='+encodeURIComponent('Cliente: '+(e.client||'')+(e.contact?'\nContato: '+e.contact+' '+(e.phone||''):''))};
const mapsURL=e=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([e.local,e.address,'Rio de Janeiro'].filter(Boolean).join(', '));

/* ================= formulário de novo evento ================= */
function eventForm(pre={},after){
 const m=modal(`${mhead('Novo Evento')}<form class="grid">
  ${fld('Nome do evento','name',pre.name||'','text','required')}
  <div class="grid g2">${fld('Cliente','client',pre.client||'')}${sel('Status','status',EV_STATUS,pre.status||'PLANEJAMENTO')}</div>
  <div class="grid g2">${fld('Contato','contact',pre.contact||'')}${fld('Telefone','phone',pre.phone||'','tel')}</div>
  <div class="grid g2">${fld('E-mail','email',pre.email||'','email')}${fld('Participantes','guests',pre.guests||'')}</div>
  <div class="grid g2">${fld('Local','local',pre.local||'')}${fld('Endereço','address',pre.address||'')}</div>
  <div class="grid g2">${fld('Data de início','start',pre.start||'','date')}${fld('Hora de início','startTime',pre.startTime||'','time')}</div>
  <div class="grid g2">${fld('Data de término','end',pre.end||'','date')}${fld('Hora de término','endTime',pre.endTime||'','time')}</div>
  ${txa('Observações','notes',pre.notes||'')}
  <div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">Salvar evento</button></div></form>`);
 autocomplete(m.querySelector('[name=client]'),clientList,it=>{const f=m.querySelector('form');if(!f.contact.value)f.contact.value=it.obj.name;if(!f.phone.value)f.phone.value=it.obj.phone||'';if(!f.email.value)f.email.value=it.obj.email||''});
 m.querySelector('form').onsubmit=e=>{e.preventDefault();const d=formData(e.target);if(d.end&&d.start&&d.end<d.start)d.end=d.start;
  const ev=newEvent(d);S.events.push(ev);saveEv();ensureClient(d.client);closeModal();after&&after(ev);go('evento-'+ev.id)};
}

/* ================= lista de eventos ================= */
let evQuery='';
VIEWS.eventos=v=>{
 const mode=(S.settings.evSort)||'date';
 let list=S.events.slice();
 if(mode==='date')list.sort((a,b)=>(a.start||'9999').localeCompare(b.start||'9999'));else list.sort((a,b)=>a.order-b.order);
 const q=norm(evQuery);if(q)list=list.filter(e=>norm([e.name,e.client,e.local,e.status].join(' ')).includes(q));
 v.innerHTML=`<div class="row"><h1>Eventos em execução</h1><span class="sp"></span><button class="btn pri" id="ne">${ic('plus')} Novo Evento</button></div>
 <div class="row"><label class="sp ac" style="max-width:420px"><input id="evq" type="search" placeholder="Buscar por nome, cliente, local ou status" value="${esc(evQuery)}" aria-label="Buscar eventos"></label><span class="sp"></span>
  <div class="seg" role="group" aria-label="Ordem"><button data-m="date" class="${mode==='date'?'on':''}">Por Data</button><button data-m="manual" class="${mode==='manual'?'on':''}">Manual</button></div></div>
 <div id="evl" class="grid" style="gap:10px">${list.length?list.map((e,i)=>`<div class="card ev" data-id="${e.id}">
   ${mode==='manual'?`<span class="handle" title="Arrastar">⠿</span>`:`<div class="dt" style="width:54px"><b>${(e.start||'').slice(8,10)||'--'}</b><span>${e.start?MESC[+e.start.slice(5,7)-1]:''}</span></div>`}
   <div><div class="row" style="gap:8px"><b style="font-size:16px">${esc(e.name)}</b><button class="tag ${evTag(e.status)}" data-st="${e.id}" title="Mudar status">${esc(e.status)} ▾</button></div>
    <div class="muted small">${esc(e.client||'Sem cliente')} · ${fdate(e.start)}${e.end&&e.end!==e.start?' a '+fdate(e.end):''}${e.local?' · '+esc(e.local):''}</div></div>
   <div class="row" style="gap:2px">${mode==='manual'?`<button class="ib" data-mv="${e.id}" data-d="-1" aria-label="Subir">${ic('up')}</button><button class="ib" data-mv="${e.id}" data-d="1" aria-label="Descer">${ic('down')}</button>`:''}
    <button class="ib" data-zip="${e.id}" title="Pasta (ZIP)" aria-label="Baixar pasta">${ic('folder')}</button><button class="ib" data-dup="${e.id}" title="Duplicar" aria-label="Duplicar">⧉</button><button class="ib" data-del="${e.id}" title="Excluir" aria-label="Excluir">${ic('trash')}</button></div>
  </div>`).join(''):`<div class="empty">${q?'Nenhum evento encontrado.':'Ainda não há eventos. Clique em Novo Evento para começar.'}</div>`}</div>`;
 $('#ne').onclick=()=>eventForm();
 const qi=$('#evq');qi.oninput=()=>{evQuery=qi.value;const p=qi.selectionStart;VIEWS.eventos(v);const n=$('#evq');n.focus();n.setSelectionRange(p,p)};
 $$('[data-m]',v).forEach(b=>b.onclick=()=>{if(b.dataset.m==='manual'&&S.settings.evSort!=='manual'){const cur=S.events.slice().sort((a,b)=>(a.start||'9999').localeCompare(b.start||'9999'));cur.forEach((e,i)=>e.order=i);saveEv()}S.settings.evSort=b.dataset.m;save('settings');VIEWS.eventos(v)});
 $('#evl').onclick=e=>{const t=e.target;
  const st=t.closest('[data-st]');if(st){e.stopPropagation();statusPicker(getEv(st.dataset.st),()=>VIEWS.eventos(v));return}
  const mv=t.closest('[data-mv]');if(mv){e.stopPropagation();const arr=S.events.slice().sort((a,b)=>a.order-b.order);const i=arr.findIndex(x=>x.id===mv.dataset.mv),j=i+ +mv.dataset.d;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];arr.forEach((x,k)=>x.order=k);saveEv();VIEWS.eventos(v);return}
  const dp=t.closest('[data-dup]');if(dp){e.stopPropagation();duplicateEvent(getEv(dp.dataset.dup));VIEWS.eventos(v);return}
  const dl=t.closest('[data-del]');if(dl){e.stopPropagation();deleteEvent(getEv(dl.dataset.del),()=>VIEWS.eventos(v));return}
  const z=t.closest('[data-zip]');if(z){e.stopPropagation();eventZip(getEv(z.dataset.zip));return}
  const c=t.closest('.ev');if(c&&!t.closest('.handle'))go('evento-'+c.dataset.id)};
 if(mode==='manual')sortable($('#evl'),'.ev','.handle',ids=>{ids.forEach((id,i)=>{const e=getEv(id);if(e)e.order=i});saveEv()});
};
function statusPicker(ev,after){
 const m=modal(`${mhead('Status · '+ev.name)}<div class="grid" style="gap:8px">${EV_STATUS.map(s=>`<button class="btn ${s===ev.status?'pri':''}" data-s="${s}" style="justify-content:flex-start">${esc(s)}</button>`).join('')}</div>`);
 $$('[data-s]',m).forEach(b=>b.onclick=()=>{ev.status=b.dataset.s;saveEv();closeModal();after&&after()});
}
function duplicateEvent(ev){
 const c=JSON.parse(JSON.stringify(ev));const n=newEvent();
 Object.assign(c,{id:n.id,name:'[Cópia] '+ev.name,status:'PLANEJAMENTO',photos:[],docs:[],proposal:null,chat:[],org:{nodes:[],edges:[]},createdAt:Date.now(),order:Math.min(0,...S.events.map(e=>e.order))-1});
 c.checklist.forEach(i=>{i.id=uid();i.done=false});
 ['team','suppliers','schedule','timeline'].forEach(k=>c[k].forEach(i=>i.id=uid()));
 c.cc.items.forEach(i=>{i.id=uid();i.cashId=null});
 S.events.push(c);c.cc.items.forEach(i=>syncCash(c,i));saveEv();toast('Cópia criada: '+c.name);
}
async function deleteEvent(ev,after){
 if(!await ask(`Excluir o evento "${ev.name}"? As fotos, documentos e os lançamentos ligados a ele no Fluxo de Caixa também serão apagados.`,{ok:'Excluir'}))return;
 S.cash=S.cash.filter(c=>c.eventId!==ev.id);save('cash');
 [...ev.photos,...ev.docs,ev.proposal].filter(Boolean).forEach(f=>Store.delFile(f.fileId));
 S.budgets.forEach(b=>{if(b.eventId===ev.id){b.closed=budgetClosed(b);b.profit=budgetProfit(b);b.eventId=''}});save('budgets');
 S.events=S.events.filter(e=>e.id!==ev.id);saveEv();toast('Evento excluído.');after&&after();
}
const csv=rows=>'﻿'+rows.map(r=>r.map(c=>{c=String(c??'');return /[;"\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(';')).join('\r\n');
async function eventZip(ev){
 if(!window.JSZip){toast('O gerador de ZIP não carregou. Verifique a internet e recarregue a página.');return}
 const z=new JSZip(),root=z.folder(ev.name.replace(/[\\/:*?"<>|]/g,'-'));
 const P=id=>S.team.find(t=>t.id===id)||{},F=id=>S.suppliers.find(t=>t.id===id)||{};
 root.folder('01 Informações').file('informacoes.txt',[`Evento: ${ev.name}`,`Status: ${ev.status}`,`Cliente: ${ev.client}`,`Contato: ${ev.contact} ${ev.phone} ${ev.email}`,`Local: ${ev.local} ${ev.address}`,`Início: ${fdate(ev.start)} ${ev.startTime}`,`Término: ${fdate(ev.end)} ${ev.endTime}`,`Participantes: ${ev.guests}`,'',`Observações: ${ev.notes}`].join('\r\n'));
 root.folder('02 Equipe').file('equipe.csv',csv([['Nome','Função no evento','Telefone','PIX'],...ev.team.map(t=>[P(t.personId).name,t.fn,P(t.personId).phone,P(t.personId).pix])]));
 root.folder('03 Fornecedores').file('fornecedores.csv',csv([['Fornecedor','Serviço','Telefone','E-mail'],...ev.suppliers.map(t=>[F(t.supplierId).name,t.service,F(t.supplierId).phone,F(t.supplierId).email])]));
 root.folder('04 Checklist').file('checklist.txt',ev.checklist.map(i=>`[${i.done?'x':' '}] ${i.text}`).join('\r\n'));
 root.folder('05 Cronograma').file('cronograma.csv',csv([['Data','Hora','Atividade'],...ev.schedule.map(s=>[fdate(s.date),s.time,s.activity])]));
 root.folder('06 Linha do Tempo').file('linha_do_tempo.csv',csv([['Horário','Etapa','Colaborador'],...ev.timeline.map(s=>[s.time,s.text,s.who])]));
 root.folder('07 Organograma').file('organograma.txt',ev.org.nodes.map(n=>`${n.title}${n.sub?' — '+n.sub:''}`).join('\r\n')+'\r\n\r\nLigações:\r\n'+ev.org.edges.map(e=>{const a=ev.org.nodes.find(n=>n.id===e.from),b=ev.org.nodes.find(n=>n.id===e.to);return a&&b?`${a.title} → ${b.title}`:''}).filter(Boolean).join('\r\n'));
 root.folder('08 Resumo').file('resumo.html',`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Resumo ${esc(ev.name)}</title></head><body style="font-family:Arial,sans-serif">${await resumoHTML(ev,false)}</body></html>`);
 const fin=root.folder('09 Financeiro');
 if(isAdmin()){const c=ccCalc(ev);fin.file('centro_de_custo.csv',csv([['Tipo','Descrição','Valor','Status','Banco','Data de pagamento'],...ev.cc.items.map(i=>[i.kind,i.desc,num(i.value).toFixed(2).replace('.',','),i.status,i.bank,fdate(i.payDate)]),[],['Faturamento','',c.fat.toFixed(2).replace('.',',')],['Saídas','',c.out.toFixed(2).replace('.',',')],['Imposto ('+num(ev.cc.tax)+'%)','',c.tax.toFixed(2).replace('.',',')],['Lucro','',c.lucro.toFixed(2).replace('.',',')]]))}
 else fin.file('LEIA.txt','Área restrita ao Administrador.');
 const blob=await z.generateAsync({type:'blob'});download(ev.name.replace(/[^\w\-À-ú ]+/g,'').trim().replace(/\s+/g,'_')+'.zip',blob);
}

/* ================= página do evento ================= */
const TABS=[['info','Informações'],['equipe','Equipe'],['fornecedores','Fornecedores'],['checklist','Checklist'],['cronograma','Cronograma'],['timeline','Linha do Tempo'],['resumo','Resumo'],['cc','Financeiro',1],['proposta','Proposta',1],['fotos','Fotos'],['docs','Docs'],['org','Organograma'],['chat','Chat']];
const TAB={};
VIEWS.evento=(v,id)=>{
 const ev=getEv(id);if(!ev){v.innerHTML=`<div class="empty">Evento não encontrado. <a href="#eventos">Voltar para a lista</a></div>`;return}
 const tabs=TABS.filter(t=>!t[2]||isAdmin());if(!tabs.some(t=>t[0]===curEventTab))curEventTab='info';
 v.innerHTML=`<a href="#eventos" class="btn sm ghost" style="justify-self:start">${ic('left')} Eventos</a>
 <div class="ehead"><div style="flex:1 1 320px"><div class="row" style="gap:10px"><h1>${esc(ev.name)}</h1><button class="tag ${evTag(ev.status)}" id="est">${esc(ev.status)} ▾</button></div>
  <p class="muted">${esc(ev.client||'Sem cliente')} · ${fdate(ev.start)}${ev.end&&ev.end!==ev.start?' a '+fdate(ev.end):''}${ev.local?' · '+esc(ev.local):''}</p></div>
  <div class="row"><button class="btn sm" id="ezip">${ic('folder')} Pasta</button><button class="btn sm" id="edup">⧉ Duplicar</button><button class="btn sm danger" id="edel">${ic('trash')} Excluir</button></div></div>
 <div class="tabs" role="tablist">${tabs.map(t=>`<button role="tab" data-t="${t[0]}" class="${t[0]===curEventTab?'on':''}">${t[1]}</button>`).join('')}</div>
 <div id="tab"></div>`;
 $('#est').onclick=()=>statusPicker(ev,route);
 $('#ezip').onclick=()=>eventZip(ev);
 $('#edup').onclick=()=>{duplicateEvent(ev);go('eventos')};
 $('#edel').onclick=()=>deleteEvent(ev,()=>go('eventos'));
 $$('[data-t]',v).forEach(b=>b.onclick=()=>{curEventTab=b.dataset.t;$$('[data-t]',v).forEach(x=>x.classList.toggle('on',x===b));drawTab()});
 const drawTab=()=>{const t=$('#tab');t.innerHTML='';TAB[curEventTab](t,ev,drawTab)};
 drawTab();
};

/* --- Informações --- */
TAB.info=(t,ev)=>{
 t.innerHTML=`<form class="card grid" id="inf">
  <div class="grid g2">${fld('Nome do evento','name',ev.name,'text','required')}${fld('Cliente','client',ev.client)}</div>
  <div class="grid g2">${fld('Contato','contact',ev.contact)}${fld('Telefone','phone',ev.phone,'tel')}</div>
  <div class="grid g2">${fld('E-mail','email',ev.email,'email')}${fld('Participantes','guests',ev.guests)}</div>
  <div class="grid g2">${fld('Local','local',ev.local)}${fld('Endereço','address',ev.address)}</div>
  <div class="grid g2">${fld('Data de início','start',ev.start,'date')}${fld('Hora de início','startTime',ev.startTime,'time')}</div>
  <div class="grid g2">${fld('Data de término','end',ev.end,'date')}${fld('Hora de término','endTime',ev.endTime,'time')}</div>
  ${txa('Observações','notes',ev.notes)}
  <div class="row"><a class="btn" href="${gcalURL(ev)}" target="_blank" rel="noopener">${ic('cal')} Google Agenda</a><a class="btn" href="${mapsURL(ev)}" target="_blank" rel="noopener">${ic('pin')} Abrir no Maps</a><span class="sp"></span><button class="btn pri">Salvar</button></div></form>`;
 const f=$('#inf');
 autocomplete(f.client,clientList,it=>{if(!f.contact.value)f.contact.value=it.obj.name;if(!f.phone.value)f.phone.value=it.obj.phone||'';if(!f.email.value)f.email.value=it.obj.email||''});
 f.onsubmit=e=>{e.preventDefault();const d=formData(f);if(d.end&&d.start&&d.end<d.start)d.end=d.start;Object.assign(ev,d);ev.cc.items.forEach(i=>syncCash(ev,i));saveEv();ensureClient(d.client);toast('Informações salvas.');route()};
};

/* --- Equipe e Fornecedores --- */
function personForm(kind,p,after){
 const isT=kind==='team',title=(p?'Editar ':'Novo ')+(isT?'colaborador':'fornecedor');p=p||{};
 const m=modal(`${mhead(title)}<form class="grid">
  ${isT?`<div class="row" style="gap:14px"><span id="pfprev">${avatar(p,72)}</span><label class="f sp"><span>Foto (aparece ao buscar e escalar)</span><input type="file" id="pfoto" accept="image/*"></label></div>`:''}
  ${fld('Nome','name',p.name||'','text','required')}
  <div class="grid g2">${isT?fld('Função','role',p.role||''):fld('Categoria / serviço','category',p.category||'')}${fld('Telefone','phone',p.phone||'','tel')}</div>
  <div class="grid g2">${fld('CPF / CNPJ','doc',p.doc||'')}${fld('E-mail','email',p.email||'','email')}</div>
  <div class="grid g2">${fld('Chave PIX','pix',p.pix||'')}${isT?fld('Dados bancários','bank',p.bank||''):fld('Contato','contact',p.contact||'')}</div>
  <div class="grid g2">${fld('Cidade','city',p.city||'')}${fld('UF','state',p.state||'')}</div>
  ${isT?`<div class="grid g2">${fld('RG','rg',p.rg||'')}<label class="f"><span>Pontuação</span>${stars(p.rating||0,'rating')}</label></div>`:`<div class="grid g2">${fld('Faixa de preço','price',p.price||'')}${fld('Operação','operation',p.operation||'','text','list="opl"')}</div><datalist id="opl"><option>ALUGUEL</option><option>VENDA</option><option>SERVIÇO</option></datalist>
  <div class="grid g2">${fld('Dados bancários','bank',p.bank||'')}<label class="f"><span>Avaliação</span>${stars(p.rating||0,'rating')}</label></div>`}
  ${txa('Observações','notes',p.notes||'')}
  <div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">Salvar</button></div></form>`);
 let newPhoto=null;
 const fi=m.querySelector('#pfoto');if(fi)fi.onchange=()=>{newPhoto=fi.files[0];if(newPhoto){const u=URL.createObjectURL(newPhoto);$('#pfprev').innerHTML=`<img src="${u}" alt="" style="width:72px;height:72px;border-radius:50%;object-fit:cover">`}};
 m.querySelector('form').onsubmit=async e=>{e.preventDefault();const d=formData(e.target);if(d.rating!==undefined)d.rating=+d.rating;const key=isT?'team':'suppliers';
  if(newPhoto){if(p.photo){Store.delFile(p.photo);delete urlCache[p.photo]}d.photo=await Store.putFile(newPhoto);await fileURL(d.photo)}
  if(p.id)Object.assign(S[key].find(x=>x.id===p.id),d);else{p={id:uid(),...d};S[key].push(p)}save(key);closeModal();after&&after(p)};
}
function eventPeople(t,ev,redraw,kind){
 const isT=kind==='team',reg=isT?S.team:S.suppliers,arr=isT?ev.team:ev.suppliers,k=isT?'personId':'supplierId',lbl=isT?'Função no evento':'Serviço no evento';
 const find=id=>reg.find(x=>x.id===id);
 t.innerHTML=`<div class="card grid">
  <div class="row"><label class="sp ac" style="max-width:420px"><input id="padd" placeholder="Buscar no cadastro de ${isT?'equipe':'fornecedores'} e adicionar" aria-label="Adicionar do cadastro"></label><button class="btn" id="pnew">${ic('plus')} Cadastrar novo</button></div>
  ${arr.length?`<div class="scroll"><table class="stack"><thead><tr><th>Nome</th><th>${lbl}</th><th>Telefone</th><th>${isT?'PIX':'E-mail'}</th>${isT?'':'<th>Avaliação</th>'}<th></th></tr></thead><tbody>
  ${arr.map(a=>{const p=find(a[k])||{name:'(removido do cadastro)'};return `<tr data-id="${a.id}"><td><div class="row" style="gap:10px;flex-wrap:nowrap">${isT?avatar(p,40):''}<b>${esc(p.name)}</b></div></td><td><input data-fn="${a.id}" value="${esc(isT?a.fn:a.service)}" style="min-height:36px;padding:6px 8px" aria-label="${lbl}"></td><td class="nw">${esc(p.phone||'')}</td><td>${esc(isT?p.pix||'':p.email||'')}</td>${isT?'':`<td>${stars(p.rating||0)}</td>`}<td class="num"><button class="ib" data-pe="${a.id}" aria-label="Editar">${ic('edit')}</button><button class="ib" data-pr="${a.id}" aria-label="Remover do evento">${ic('trash')}</button></td></tr>`}).join('')}
  </tbody></table></div>`:`<div class="empty">Ninguém adicionado ainda. Busque no cadastro ou cadastre alguém novo.</div>`}</div>`;
 const add=p=>{if(arr.some(a=>a[k]===p.id)){toast('Já está no evento.');return}arr.push({id:uid(),[k]:p.id,fn:'',service:isT?'':(p.category||'')});saveEv();redraw()};
 autocomplete($('#padd'),()=>reg.map(p=>({label:p.name,sub:isT?p.role:p.category,obj:p,pre:isT?avatar(p,32):''})),it=>add(it.obj));
 $('#pnew').onclick=()=>personForm(kind,null,p=>add(p));
 $$('[data-fn]',t).forEach(i=>i.onchange=()=>{const a=arr.find(x=>x.id===i.dataset.fn);if(isT)a.fn=i.value;else a.service=i.value;saveEv()});
 $$('[data-pe]',t).forEach(b=>b.onclick=()=>{const a=arr.find(x=>x.id===b.dataset.pe);const p=find(a[k]);if(p)personForm(kind,p,redraw)});
 $$('[data-pr]',t).forEach(b=>b.onclick=async()=>{if(!await ask('Remover do evento? O cadastro geral continua.',{ok:'Remover'}))return;const i=arr.findIndex(x=>x.id===b.dataset.pr);arr.splice(i,1);saveEv();redraw()});
}
TAB.equipe=(t,ev,r)=>eventPeople(t,ev,r,'team');
TAB.fornecedores=(t,ev,r)=>eventPeople(t,ev,r,'suppliers');

/* --- Checklist --- */
TAB.checklist=(t,ev,redraw)=>{
 const L=ev.checklist,done=L.filter(i=>i.done).length,p=L.length?done/L.length:0;
 t.innerHTML=`<div class="card grid"><div class="row"><b>${done} de ${L.length} concluídos</b><span class="sp"></span><span class="muted">${Math.round(p*100)}%</span></div><div class="bar"><i style="width:${p*100}%"></i></div>
 <form class="row" id="cka"><label class="sp"><input name="t" placeholder="Novo item do checklist" aria-label="Novo item"></label><button class="btn pri">${ic('plus')} Adicionar</button></form>
 <div id="ckl">${L.map(i=>`<div class="li ${i.done?'done':''}" data-id="${i.id}"><span class="handle" title="Arrastar">⠿</span><input type="checkbox" ${i.done?'checked':''} data-ck aria-label="Concluído"><span contenteditable="true" data-tx spellcheck="false">${esc(i.text)}</span><button class="ib" data-rm aria-label="Excluir">${ic('trash')}</button></div>`).join('')||'<div class="empty">Checklist vazio.</div>'}</div></div>`;
 $('#cka').onsubmit=e=>{e.preventDefault();const v=e.target.t.value.trim();if(!v)return;L.push({id:uid(),text:v,done:false});saveEv();redraw();$('#cka [name=t]').focus()};
 const it=el=>L.find(x=>x.id===el.closest('.li').dataset.id);
 $$('[data-ck]',t).forEach(c=>c.onchange=()=>{it(c).done=c.checked;saveEv();redraw()});
 $$('[data-tx]',t).forEach(s=>{s.onblur=()=>{const x=it(s);const v=s.textContent.trim();if(v&&v!==x.text){x.text=v;saveEv()}else if(!v)s.textContent=x.text};s.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();s.blur()}}});
 $$('[data-rm]',t).forEach(b=>b.onclick=()=>{const x=it(b);L.splice(L.indexOf(x),1);saveEv();redraw()});
 sortable($('#ckl'),'.li','.handle',ids=>{ev.checklist=ids.map(id=>L.find(x=>x.id===id));saveEv()});
};

/* --- Cronograma --- */
TAB.cronograma=(t,ev,redraw)=>{
 const L=ev.schedule.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 const groups={};L.forEach(s=>(groups[s.date||'Sem data']=groups[s.date||'Sem data']||[]).push(s));
 t.innerHTML=`<div class="card grid"><form class="grid" id="cra" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));align-items:end">
  ${fld('Data','date',ev.start||'','date','required')}${fld('Hora','time','','time')}<label class="f" style="grid-column:span 2"><span>Atividade</span><input name="activity" required></label><button class="btn pri">${ic('plus')} Adicionar</button></form>
 ${L.length?`<div class="scroll"><table class="stack"><thead><tr><th>Data</th><th>Hora</th><th>Atividade</th><th></th></tr></thead><tbody>${L.map(s=>`<tr data-id="${s.id}"><td><input type="date" data-f="date" value="${esc(s.date)}" style="min-height:36px;padding:6px"></td><td><input type="time" data-f="time" value="${esc(s.time)}" style="min-height:36px;padding:6px"></td><td><input data-f="activity" value="${esc(s.activity)}" style="min-height:36px;padding:6px 8px"></td><td class="num"><button class="ib" data-rm aria-label="Excluir">${ic('trash')}</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Nenhuma atividade no cronograma.</div>'}
 </div>
 ${L.length?`<div class="card"><h3 style="margin-bottom:14px">Linha do tempo visual</h3>${Object.entries(groups).map(([d,arr])=>`<div style="margin-bottom:10px"><div class="tag or" style="margin-bottom:10px">${d==='Sem data'?d:new Date(d+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}</div><div class="tl">${arr.map(s=>`<div class="it"><div class="hd">${esc(s.time||'--:--')}</div><div>${esc(s.activity)}</div></div>`).join('')}</div></div>`).join('')}</div>`:''}`;
 $('#cra').onsubmit=e=>{e.preventDefault();const d=formData(e.target);ev.schedule.push({id:uid(),...d});saveEv();redraw()};
 $$('[data-f]',t).forEach(i=>i.onchange=()=>{const s=ev.schedule.find(x=>x.id===i.closest('tr').dataset.id);s[i.dataset.f]=i.value;saveEv();redraw()});
 $$('[data-rm]',t).forEach(b=>b.onclick=()=>{ev.schedule=ev.schedule.filter(x=>x.id!==b.closest('tr').dataset.id);saveEv();redraw()});
};

/* --- Linha do Tempo --- */
let tlFilter='';
TAB.timeline=(t,ev,redraw)=>{
 const names=[...new Set(ev.team.map(a=>(S.team.find(p=>p.id===a.personId)||{}).name).filter(Boolean))];
 const L=ev.timeline,view=tlFilter?L.filter(s=>s.who===tlFilter||s.who==='Todos'):L;
 const whoOpts=[['Todos','Todos'],...names.map(n=>[n,n])];
 t.innerHTML=`<div class="card grid"><form class="grid" id="tla" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));align-items:end">${fld('Horário','time','','time','required')}<label class="f" style="grid-column:span 2"><span>Etapa</span><input name="text" required></label>${sel('Colaborador','who',whoOpts)}<button class="btn pri">${ic('plus')} Adicionar</button></form>
 <div class="row"><label class="f" style="width:260px"><span>Filtrar por colaborador</span><select id="tlf"><option value="">Todos os colaboradores</option>${names.map(n=>`<option ${n===tlFilter?'selected':''}>${esc(n)}</option>`).join('')}</select></label>${names.length?'':'<p class="muted small">Adicione pessoas na aba Equipe para atribuir etapas.</p>'}</div>
 <div>${view.map(s=>`<div class="li" data-id="${s.id}"><input type="time" data-f="time" value="${esc(s.time)}" style="width:120px;min-height:36px;padding:6px"><input data-f="text" value="${esc(s.text)}" style="min-height:36px;padding:6px 8px;flex:1"><select data-f="who" style="width:170px;min-height:36px;padding:6px">${whoOpts.concat(s.who&&!names.includes(s.who)&&s.who!=='Todos'?[[s.who,s.who]]:[]).map(o=>`<option ${o[0]===s.who?'selected':''}>${esc(o[0])}</option>`).join('')}</select>${tlFilter?'':`<button class="ib" data-mv="-1" aria-label="Subir">${ic('up')}</button><button class="ib" data-mv="1" aria-label="Descer">${ic('down')}</button>`}<button class="ib" data-rm aria-label="Excluir">${ic('trash')}</button></div>`).join('')||'<div class="empty">Nenhuma etapa.</div>'}</div></div>`;
 $('#tla').onsubmit=e=>{e.preventDefault();L.push({id:uid(),...formData(e.target)});saveEv();redraw()};
 $('#tlf').onchange=e=>{tlFilter=e.target.value;redraw()};
 const it=el=>L.find(x=>x.id===el.closest('.li').dataset.id);
 $$('[data-f]',t).forEach(i=>i.onchange=()=>{it(i)[i.dataset.f]=i.value;saveEv()});
 $$('[data-mv]',t).forEach(b=>b.onclick=()=>{const x=it(b),i=L.indexOf(x),j=i+ +b.dataset.mv;if(j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]];saveEv();redraw()});
 $$('[data-rm]',t).forEach(b=>b.onclick=()=>{L.splice(L.indexOf(it(b)),1);saveEv();redraw()});
};

/* --- Resumo --- */
async function resumoHTML(ev,withPhotos=true){
 const P=id=>S.team.find(t=>t.id===id)||{},F=id=>S.suppliers.find(t=>t.id===id)||{};
 let photos='';if(withPhotos&&ev.photos.length){const urls=await Promise.all(ev.photos.map(async p=>{const b=await Store.getFile(p.fileId);if(!b)return '';return await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(b)})}));photos=`<h2>Fotos</h2><div class="ph">${ev.photos.map((p,i)=>urls[i]?`<figure style="margin:0"><img src="${urls[i]}" alt=""><figcaption>${esc(p.caption||'')}</figcaption></figure>`:'').join('')}</div>`}
 return `<h1>${esc(ev.name)}</h1><p class="muted">${esc(ev.status)} · ${fdate(ev.start)}${ev.startTime?' '+ev.startTime:''}${ev.end&&ev.end!==ev.start?' a '+fdate(ev.end):''} · ${esc(ev.local||'')} ${esc(ev.address||'')}</p>
 <h2>Cliente</h2><p><b>${esc(ev.client||'—')}</b><br>Contato: ${esc(ev.contact||'—')} · ${esc(ev.phone||'')} · ${esc(ev.email||'')}</p>
 <h2>Equipe</h2>${ev.team.length?`<table><thead><tr><th>Nome</th><th>Função</th><th>Telefone</th><th>PIX</th></tr></thead><tbody>${ev.team.map(a=>`<tr><td>${esc(P(a.personId).name||'')}</td><td>${esc(a.fn||P(a.personId).role||'')}</td><td>${esc(P(a.personId).phone||'')}</td><td>${esc(P(a.personId).pix||'')}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">—</p>'}
 <h2>Fornecedores</h2>${ev.suppliers.length?`<table><thead><tr><th>Fornecedor</th><th>Serviço</th><th>Contato</th><th>Telefone</th><th>E-mail</th></tr></thead><tbody>${ev.suppliers.map(a=>`<tr><td>${esc(F(a.supplierId).name||'')}</td><td>${esc(a.service||'')}</td><td>${esc(F(a.supplierId).contact||'')}</td><td>${esc(F(a.supplierId).phone||'')}</td><td>${esc(F(a.supplierId).email||'')}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">—</p>'}
 ${ev.timeline.length?`<h2>Linha do tempo do dia</h2><table><tbody>${ev.timeline.map(s=>`<tr><td style="width:80px"><b>${esc(s.time)}</b></td><td>${esc(s.text)}</td><td>${esc(s.who||'')}</td></tr>`).join('')}</tbody></table>`:''}
 ${ev.notes?`<h2>Observações</h2><p>${esc(ev.notes).replace(/\n/g,'<br>')}</p>`:''}${photos}`;
}
TAB.resumo=async(t,ev)=>{
 t.innerHTML=`<div class="row noprint"><p class="muted">Página pronta para imprimir. Não mostra valores financeiros.</p><span class="sp"></span><button class="btn pri" id="rp">${ic('print')} Imprimir</button></div><div class="card" id="rs">Carregando…</div>`;
 const h=await resumoHTML(ev);$('#rs').innerHTML=`<div class="prose" style="max-width:none">${h}</div>`;
 $('#rp').onclick=()=>printHTML('Resumo '+ev.name,h);
};

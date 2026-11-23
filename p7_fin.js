
/* ================= Agenda ================= */
let calY=new Date().getFullYear(),calM=new Date().getMonth();
VIEWS.agenda=v=>{
 const first=new Date(calY,calM,1),startDow=first.getDay(),days=new Date(calY,calM+1,0).getDate(),t=today();
 const cells=[];for(let i=0;i<42;i++){const d=new Date(calY,calM,1-startDow+i);cells.push(d)}
 const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 const all=S.events.slice().sort((a,b)=>(a.start||'9999').localeCompare(b.start||'9999'));
 const rows=Math.ceil((startDow+days)/7)*7;
 v.innerHTML=`<div class="row"><h1>Agenda</h1><span class="sp"></span><button class="btn pri" id="ne">${ic('plus')} Novo Evento</button></div>
 <div class="row"><button class="ib" id="cp" aria-label="Mês anterior">${ic('left')}</button><h2 style="min-width:200px;text-align:center">${MES[calM]} ${calY}</h2><button class="ib" id="cn" aria-label="Próximo mês">${ic('right')}</button><button class="btn sm" id="ct">Hoje</button></div>
 <div class="cal">${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=>`<div class="dh">${d}</div>`).join('')}
 ${cells.slice(0,rows).map(d=>{const k=iso(d),evs=S.events.filter(e=>e.start===k);return `<div class="d ${d.getMonth()!==calM?'out':''} ${k===t?'today':''}"><span class="n">${d.getDate()}</span>${evs.map(e=>`<button class="chip" data-ev="${e.id}" title="${esc(e.name)}">${esc(e.name)}</button>`).join('')}</div>`}).join('')}</div>
 <section class="card"><div class="row"><h2>Todos os eventos</h2><span class="tag">${all.length}</span></div>
 ${all.length?`<div class="scroll" style="margin-top:8px"><table class="stack"><thead><tr><th>Data</th><th>Evento</th><th>Cliente</th><th>Local</th><th>Status</th><th></th></tr></thead><tbody>${all.map(e=>`<tr><td class="nw">${fdate(e.start)}</td><td><a href="#evento-${e.id}"><b>${esc(e.name)}</b></a></td><td>${esc(e.client||'')}</td><td>${esc(e.local||'')}</td><td><span class="tag ${evTag(e.status)}">${esc(e.status)}</span></td><td class="num"><a class="btn sm" href="${gcalURL(e)}" target="_blank" rel="noopener">${ic('cal')} Google Agenda</a></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty" style="margin-top:8px">Nenhum evento cadastrado.</div>'}</section>`;
 $('#cp').onclick=()=>{calM--;if(calM<0){calM=11;calY--}VIEWS.agenda(v)};
 $('#cn').onclick=()=>{calM++;if(calM>11){calM=0;calY++}VIEWS.agenda(v)};
 $('#ct').onclick=()=>{calY=new Date().getFullYear();calM=new Date().getMonth();VIEWS.agenda(v)};
 $('#ne').onclick=()=>eventForm();
 $$('[data-ev]',v).forEach(b=>b.onclick=()=>go('evento-'+b.dataset.ev));
};

/* ================= Orçamentos ================= */
const B_ST=['PENDENTE','FECHADO','PERDIDO'],B_RE=['A REALIZAR','REALIZADO','CANCELADO'];
let budQ='';
function budgetForm(b,pre={}){
 b=b||{};const m=modal(`${mhead(b.id?'Editar orçamento':'Novo orçamento')}<form class="grid">
  <div class="grid g2">${fld('Data','date',b.date||pre.date||today(),'date','required')}${fld('Evento ou serviço','name',b.name||pre.name||'','text','required')}</div>
  <label class="f"><span>Cliente</span><input name="client" value="${esc(b.client||pre.client||'')}"></label><div id="csum"></div>
  ${sel('Ligar a um evento (o valor fechado e o lucro passam a vir do Centro de Custo)','eventId',[['','Sem vínculo'],...S.events.map(e=>[e.id,e.name+(e.start?' · '+fdate(e.start):'')])],b.eventId||'')}
  <div class="grid g3">${fld('Orçado (R$)','quoted',b.quoted?String(b.quoted).replace('.',','):'','text','inputmode="decimal"')}<span data-man style="display:contents">${fld('Fechado (R$)','closed',b.closed?String(b.closed).replace('.',','):'','text','inputmode="decimal"')}${fld('Lucro (R$) ✏','profit',b.profit?String(b.profit).replace('.',','):'','text','inputmode="decimal"')}</span></div>
  <div class="grid g3">${sel('Status','status',B_ST,b.status||pre.status||'PENDENTE')}${sel('Realização','realization',B_RE,b.realization||'A REALIZAR')}${fld('Ano de referência','year',b.year||'','number','min="2000" max="2100" placeholder="pelo ano da data"')}</div>
  ${txa('Observação','obs',b.obs||pre.obs||'')}
  <div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">Salvar</button></div></form>`);
 const f=m.querySelector('form');
 const tog=()=>{const on=!!f.eventId.value;m.querySelectorAll('[data-man] input').forEach(i=>{i.disabled=on;if(on)i.placeholder='vem do Centro de Custo'})};tog();f.eventId.onchange=tog;
 const sum=name=>{const L=S.budgets.filter(x=>norm(x.client)===norm(name));const c=S.clients.find(x=>norm(x.name)===norm(name));$('#csum').innerHTML=name&&(L.length||c)?`<div class="card small" style="padding:10px 12px;background:#fff">${c?`<b>${esc(c.name)}</b> ${esc(c.company||'')} ${esc(c.phone||'')}<br>`:''}${L.length} orçamento(s) · orçado ${brl(L.reduce((s,x)=>s+num(x.quoted),0))} · fechado ${brl(L.filter(x=>x.status==='FECHADO').reduce((s,x)=>s+budgetClosed(x),0))} · ${L.filter(x=>x.status==='PERDIDO').length} perdido(s)</div>`:''};
 autocomplete(f.client,()=>[...new Set([...S.clients.map(c=>c.name),...S.budgets.map(x=>x.client).filter(Boolean)])].map(n=>({label:n})),it=>sum(it.label));sum(f.client.value);
 f.onsubmit=e=>{e.preventDefault();const d=formData(f);['quoted','closed','profit'].forEach(k=>d[k]=num(d[k]));d.year=+d.year||'';if(d.eventId){const ev=getEv(d.eventId);d.closed=ccCalc(ev).fat;d.profit=ccCalc(ev).lucro}
  if(!b.id){b.id=uid();S.budgets.push(b)}Object.assign(b,d);save('budgets');ensureClient(d.client);closeModal();route()};
}
VIEWS.orcamentos=v=>{
 const L=S.budgets.filter(budInPeriod).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 const q=norm(budQ),view=q?L.filter(b=>norm([b.name,b.client,b.status].join(' ')).includes(q)):L;
 const tot=L.reduce((s,b)=>s+num(b.quoted),0),fe=L.filter(b=>b.status==='FECHADO'),clo=fe.reduce((s,b)=>s+budgetClosed(b),0),luc=fe.reduce((s,b)=>s+budgetProfit(b),0),
  per=L.filter(b=>b.status==='PERDIDO').reduce((s,b)=>s+num(b.quoted),0),pen=L.filter(b=>b.status==='PENDENTE').reduce((s,b)=>s+num(b.quoted),0),conv=L.length?fe.length/L.length:NaN;
 v.innerHTML=`<div class="row"><h1>Orçamentos</h1><span class="sp"></span><button class="btn" id="bh">${ic('chart')} Histórico por ano</button><button class="btn" id="bcc">🔄 Atualizar CC</button><button class="btn" id="bp">${ic('print')} Imprimir</button><button class="btn pri" id="bn">${ic('plus')} Novo orçamento</button></div>
 <div class="row" style="align-items:end">${periodBar()}<span class="small muted" style="padding-bottom:12px">Mostrando: <b style="color:var(--ink)">${perLabel()}</b></span></div>
 <div class="grid g3 kp">${[['Total Orçado',brl(tot)],['Fechado',brl(clo)],['Lucro Total',brl(luc)+` <span class="muted small" style="font-size:14px">${pct(clo?luc/clo:NaN)}</span>`],['Perdido',brl(per)],['Pendente',brl(pen)],['Conversão',pct(conv)+` <span class="muted small" style="font-size:14px">${fe.length}/${L.length}</span>`]].map(k=>`<div class="card kpi"><span class="l">${k[0]}</span><span class="v">${k[1]}</span></div>`).join('')}</div>
 <div class="row" style="align-items:end"><label class="sp" style="max-width:420px"><input id="bq" type="search" placeholder="Buscar evento, cliente ou status" value="${esc(budQ)}" aria-label="Buscar orçamentos"></label></div>
 <div class="card scroll" id="btab">${view.length?budgetTable(view,true):'<div class="empty">Nenhum orçamento.</div>'}</div>`;
 $('#bn').onclick=()=>budgetForm();bindPeriod(v,()=>VIEWS.orcamentos(v));
 $('#bq').oninput=e=>{budQ=e.target.value;const p=e.target.selectionStart;VIEWS.orcamentos(v);const n=$('#bq');n.focus();n.setSelectionRange(p,p)};
 $('#bcc').onclick=()=>{let n=0;S.budgets.forEach(b=>{const ev=b.eventId&&getEv(b.eventId);if(ev){const c=ccCalc(ev);b.closed=c.fat;b.profit=c.lucro;n++}});save('budgets');toast(n+' orçamento(s) sincronizado(s) com o Centro de Custo.');route()};
 $('#bp').onclick=()=>printHTML('Orçamentos',`<h1>Orçamentos · ${perLabel()}</h1><p class="muted">Total orçado ${brl(tot)} · Fechado ${brl(clo)} · Lucro ${brl(luc)} · Conversão ${pct(conv)}</p>${budgetTable(view,false)}`);
 $('#bh').onclick=historyModal;
 $$('[data-bed]',v).forEach(b=>b.onclick=()=>budgetForm(S.budgets.find(x=>x.id===b.dataset.bed)));
 $$('[data-brm]',v).forEach(b=>b.onclick=async()=>{const x=S.budgets.find(y=>y.id===b.dataset.brm);if(!await ask(`Excluir o orçamento "${x.name}"?`,{ok:'Excluir'}))return;S.budgets=S.budgets.filter(y=>y!==x);save('budgets');route()});
};
function budgetTable(L,actions){
 return `<table class="stack"><thead><tr><th>Data</th><th>Evento / serviço</th><th>Cliente</th><th class="num">Orçado</th><th class="num">Fechado</th><th class="num">Lucro</th><th>Status</th><th>Realização</th>${actions?'<th></th>':''}</tr></thead><tbody>
 ${L.map(b=>{const linked=!!(b.eventId&&getEv(b.eventId));const cl=b.status==='FECHADO'||linked?budgetClosed(b):0;return `<tr class="${b.status==='PERDIDO'?'lost':''}"><td class="nw">${fdate(b.date)}</td><td><b>${esc(b.name)}</b>${linked?` <a class="tag or" href="#evento-${b.eventId}" title="Ligado ao evento">CC</a>`:''}</td><td>${esc(b.client||'')}</td><td class="num">${brl(b.quoted)}</td><td class="num">${b.status==='PERDIDO'?'—':brl(cl)}${linked?' <span class="tag or">CC</span>':''}</td><td class="num">${b.status==='PERDIDO'?'—':brl(budgetProfit(b))+(linked?' <span class="tag or">CC</span>':' <span class="muted">✏</span>')}</td><td><span class="tag ${b.status==='FECHADO'?'ok':b.status==='PERDIDO'?'bad':'warn'}">${b.status}</span></td><td class="small">${esc(b.realization||'')}</td>${actions?`<td class="num nw"><button class="ib" data-bed="${b.id}" aria-label="Editar">${ic('edit')}</button><button class="ib" data-brm="${b.id}" aria-label="Excluir">${ic('trash')}</button></td>`:''}</tr>`}).join('')}</tbody></table>`;
}
function historyModal(){
 const H=S.history.sort((a,b)=>a.year-b.year);
 const color=r=>{const m=num(r.closed)&&num(r.profit)?num(r.profit)/num(r.closed):NaN;return !isFinite(m)?'':m>=.3?'background:#E2F1E7':m>=.15?'background:#FBF0D6':'background:#FBE6E3'};
 const m=modal(`${mhead('Histórico por ano')}<p class="muted small">Edite os valores direto na tabela. Cor da linha pela margem (quando há lucro informado): verde a partir de 30%, amarelo de 15% a 30%, vermelho abaixo de 15%. "Preencher" agrupa pelo ano de referência do orçamento (ou pela data, se não houver).</p>
 <div class="scroll"><table><thead><tr><th>Ano</th><th class="num">Propostas enviadas</th><th class="num">Orçado</th><th class="num">Fechado</th><th class="num">Lucro</th><th class="num">Margem</th><th class="num">Conversão (R$)</th><th></th></tr></thead><tbody>
 ${H.map((r,i)=>`<tr style="${color(r)}" data-i="${i}"><td><b>${r.year}</b></td>${['proposals','quoted','closed','profit'].map(k=>`<td><input data-k="${k}" value="${k==='proposals'?num(r[k]):num(r[k]).toLocaleString('pt-BR',{minimumFractionDigits:2})}" inputmode="decimal" style="min-height:36px;padding:6px;text-align:right;min-width:110px"></td>`).join('')}<td class="num">${pct(num(r.closed)&&num(r.profit)?num(r.profit)/num(r.closed):NaN)}</td><td class="num">${pct(num(r.quoted)?num(r.closed)/num(r.quoted):NaN)}</td><td><button class="ib" data-hr="${i}" aria-label="Remover ano">${ic('trash')}</button></td></tr>`).join('')}
 </tbody></table></div>
 <form class="row" id="hadd" style="align-items:end"><label class="f" style="width:120px"><span>Ano</span><input name="year" type="number" min="2000" max="2100" value="${Math.max(2026,...H.map(r=>r.year))+1}" required></label><label class="f" style="width:180px"><span>Propostas enviadas</span><input name="proposals" type="number" min="0" value="0"></label><button class="btn pri">${ic('plus')} Adicionar ano</button><span class="sp"></span><button class="btn" type="button" id="hfill">Preencher com os orçamentos do sistema</button></form>`,{wide:true});
 $$('[data-k]',m).forEach(i=>i.onchange=()=>{H[+i.closest('tr').dataset.i][i.dataset.k]=num(i.value);save('history');historyModal()});
 $$('[data-hr]',m).forEach(b=>b.onclick=()=>{S.history.splice(+b.dataset.hr,1);save('history');historyModal()});
 $('#hadd').onsubmit=e=>{e.preventDefault();const d=formData(e.target);const y=+d.year;if(S.history.some(r=>r.year===y)){toast('Esse ano já existe.');return}S.history.push({year:y,proposals:num(d.proposals),quoted:0,closed:0,profit:0});save('history');historyModal()};
 $('#hfill').onclick=()=>{const ys={};S.budgets.forEach(b=>{const y=+b.year||+(b.date||'').slice(0,4);if(!y)return;const r=ys[y]=ys[y]||{proposals:0,quoted:0,closed:0,profit:0};r.proposals++;r.quoted+=num(b.quoted);if(b.status==='FECHADO'){r.closed+=budgetClosed(b);r.profit+=budgetProfit(b)}});
  Object.entries(ys).forEach(([y,r])=>{let h=S.history.find(x=>x.year===+y);if(!h){h={year:+y};S.history.push(h)}Object.assign(h,r)});save('history');toast('Anos com orçamentos no sistema foram atualizados.');historyModal()};
}

/* ================= Fluxo de Caixa ================= */
let cxY=new Date().getFullYear(),cxM=new Date().getMonth(),cxMode='mes';
const cxIn=(c,y,m)=>c.date&&+c.date.slice(0,4)===y&&(m==null||+c.date.slice(5,7)-1===m);
function cashForm(c){
 const isNew=!c;c=c||{type:'saida',status:'a pagar',date:`${cxY}-${String(cxM+1).padStart(2,'0')}-${String(Math.min(new Date().getDate(),28)).padStart(2,'0')}`};
 const m=modal(`${mhead(isNew?'Novo lançamento':'Editar lançamento')}<form class="grid">
  <div class="grid g2">${fld('Descrição','desc',c.desc||'','text','required')}${fld('Empresa','company',c.company||'')}</div>
  <div class="grid g3">${fld('Valor (R$)','value',c.value?String(c.value).replace('.',','):'','text','inputmode="decimal" required')}${sel('Tipo','type',[['entrada','Entrada'],['saida','Saída']],c.type)}<label class="f"><span>Status</span><select name="status"></select></label></div>
  <div class="grid g3">${fld('Conta','account',c.account||'')}${fld('Data','date',c.date||'','date','required')}${fld('Centro de custo','cc',c.cc||'')}</div>
  <div class="grid g2">${fld('Tipo de custo','costType',c.costType||'')}${sel('Categoria DRE','dre',DRE_CATS,c.dre||'auto')}</div>
  <p class="muted small" id="dreauto"></p>
  ${txa('Observação','obs',c.obs||'')}
  ${c.recurringId?`<p class="small"><span class="tag or">🔁 Recorrente</span> ${c.est?'<span class="tag warn">≈ valor estimado</span> Coloque o valor real da fatura ou da guia: ao salvar, ele deixa de ser estimado.':''}</p>`:`<label class="row" style="gap:10px;font-weight:700"><input type="checkbox" name="recurring" ${c.recurring?'checked':''}> 🔁 Custo Fixo Recorrente</label>
  ${isNew?`<label class="row" style="gap:10px" id="rvar"><input type="checkbox" name="recVar"> O valor muda todo mês (cartão, imposto): lançar os próximos pela média dos últimos 3 meses</label>`:''}
  <p class="muted small">${isNew?'Marcado, vira um gasto recorrente: este lançamento entra agora e os próximos meses são lançados sozinhos como "a pagar" (veja em "Recorrentes" no Fluxo de Caixa).':'Aqui a caixa só marca ou desmarca este lançamento; para lançar nos próximos meses use "Recorrentes".'}</p>`}
  ${c.eventId?'<p class="small tag or">Lançado pelo Centro de Custo de um evento: edite pelo evento para manter os dois iguais.</p>':''}
  <div class="row">${isNew?'':`<button class="btn danger" type="button" id="cdel">${ic('trash')} Excluir</button>`}<span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">Salvar</button></div></form>`);
 const f=m.querySelector('form');const da=()=>{$('#dreauto').textContent=f.dre.value==='auto'?'Automático agora: '+dreName(dreCat({type:f.type.value,costType:f.costType.value,desc:f.desc.value,eventId:c.eventId})):''};const fill=()=>{const o=f.type.value==='entrada'?ST_IN:ST_OUT;f.status.innerHTML=o.map(s=>`<option ${s===c.status?'selected':''}>${s}</option>`).join('');da()};fill();f.type.onchange=fill;f.dre.onchange=da;f.costType.oninput=da;f.desc.oninput=da;
 f.onsubmit=e=>{e.preventDefault();const d=formData(f);d.value=num(d.value);
  if(isNew&&d.recurring&&d.type==='saida'){const t={id:uid(),desc:d.desc,company:d.company,account:d.account,cc:d.cc,costType:d.costType,dre:d.dre,day:+d.date.slice(8,10),kind:d.recVar?'variavel':'fixo',value:d.value,active:true,start:d.date.slice(0,7),skip:[]};t.key=recKey(t.desc,t.account);S.recurring=S.recurring||[];S.recurring.push(t);delete d.recVar;S.cash.push({...d,id:uid(),order:Date.now(),recurring:true,recurringId:t.id});save('recurring');save('cash');const n=runRecurring();toast(`Recorrente criado.${n?` ${n} lançamento(s) nos próximos meses.`:''}`)}
  else if(isNew){delete d.recVar;S.cash.push({...d,id:uid(),order:Date.now()})}
  else{delete d.recVar;if(c.recurringId){d.recurring=true;if(c.est&&(Math.abs(num(c.value)-d.value)>.009||d.status==='pago')){c.est=false;if(/^Valor estimado pela média/.test(d.obs||''))d.obs=''}}Object.assign(c,d);if(c.eventId){const ev=getEv(c.eventId);const it=ev&&ev.cc.items.find(i=>i.id===c.ccItemId);if(it){it.value=d.value;it.status=d.status;it.bank=d.account;it.payDate=d.date;saveEv()}}}
  save('cash');closeModal();route()};
 if(!isNew)$('#cdel').onclick=async()=>{if(!await ask(`Excluir "${c.desc}"?`,{ok:'Excluir'}))return;S.cash=S.cash.filter(x=>x!==c);if(c.recurringId){const t=(S.recurring||[]).find(x=>x.id===c.recurringId);if(t){(t.skip=t.skip||[]).push(c.date.slice(0,7));save('recurring')}}if(c.eventId){const ev=getEv(c.eventId);if(ev){const it=ev.cc.items.find(i=>i.id===c.ccItemId);if(it){it.cashId=null;ev.cc.items=ev.cc.items.filter(i=>i!==it);saveEv()}}}save('cash');closeModal();route()};
}
VIEWS.caixa=v=>{
 runRecurring();
 const years=[...new Set([new Date().getFullYear(),cxY,...S.cash.map(c=>+String(c.date).slice(0,4)).filter(Boolean),...S.budgets.map(b=>+b.year||+(b.date||'').slice(0,4)).filter(Boolean)])].sort();
 const L=S.cash.filter(c=>cxIn(c,cxY,cxMode==='mes'?cxM:null));
 const sum=(a,t,st)=>a.filter(c=>c.type===t&&(!st||st.includes(c.status))).reduce((s,c)=>s+num(c.value),0);
 const inR=sum(L,'entrada',['RECEBIDO']),inP=sum(L,'entrada'),outP=sum(L,'saida',['pago']),out=sum(L,'saida');
 const head=`<div class="row"><h1>Fluxo de Caixa</h1><span class="sp"></span><button class="btn" id="cxe">${ic('dl')} Excel</button><button class="btn" id="cxc">${ic('dl')} CSV</button><button class="btn" id="cxp">${ic('print')} Imprimir</button><button class="btn" id="cxr">🔁 Recorrentes</button><button class="btn pri" id="cxn">${ic('plus')} Lançamento</button></div>
 <div class="row"><div class="seg"><button data-md="mes" class="${cxMode==='mes'?'on':''}">Mensal</button><button data-md="ano" class="${cxMode==='ano'?'on':''}">Anual</button></div><span class="sp"></span>
  <button class="ib" id="cxp1" aria-label="Anterior">${ic('left')}</button>${cxMode==='mes'?`<select id="cxm" style="width:150px" aria-label="Mês">${MES.map((n,i)=>`<option value="${i}" ${i===cxM?'selected':''}>${n}</option>`).join('')}</select>`:''}<select id="cxy" style="width:110px" aria-label="Ano">${years.map(y=>`<option ${y===cxY?'selected':''}>${y}</option>`).join('')}</select><button class="ib" id="cxn1" aria-label="Próximo">${ic('right')}</button></div>
 <div class="grid g3 kp">${[['Entradas recebidas',brl(inR),'ok'],['Entradas previstas',brl(inP),''],['Saídas pagas',brl(outP),'bad'],['Saídas totais',brl(out),''],['Saldo realizado',brl(inR-outP),inR-outP<0?'bad':'ok'],['Saldo previsto',brl(inP-out),inP-out<0?'bad':'ok']].map(k=>`<div class="card kpi"><span class="l">${k[0]}</span><span class="v" style="${k[2]==='ok'?'color:var(--ok)':k[2]==='bad'?'color:var(--bad)':''}">${k[1]}</span></div>`).join('')}</div>`;
 let body;
 if(cxMode==='mes'){
  const rec=L.filter(c=>c.recurring).sort((a,b)=>(a.date||'').localeCompare(b.date||'')),rest=L.filter(c=>!c.recurring).sort((a,b)=>(a.order||0)-(b.order||0));
  body=`<div class="card scroll">${L.length?`<table class="stack"><thead><tr><th>Data</th><th>Descrição</th><th>Empresa</th><th class="num">Valor</th><th>Status</th><th>Conta</th><th>Centro de custo</th><th></th></tr></thead><tbody>
  ${[...rec,...rest].map(c=>`<tr data-id="${c.id}"><td class="nw">${fdate(c.date)}</td><td>${c.recurring?'<span class="tag or" title="Recorrente">🔁</span> ':''}<b>${esc(c.desc)}</b>${c.est?' <span class="tag warn" title="Valor estimado pela média: troque pelo valor real">≈ estimado</span>':''}${c.obs?`<div class="muted small">${esc(c.obs)}</div>`:''}</td><td>${esc(c.company||'')}</td><td class="num" style="color:${c.type==='entrada'?'var(--ok)':'var(--bad)'}">${c.type==='entrada'?'+':'−'} ${brl(c.value)}</td><td><span class="tag ${stTag(c.status)}">${esc(c.status)}</span></td><td>${esc(c.account||'')}</td><td>${esc(c.cc||'')}${c.costType?`<div class="muted small">${esc(c.costType)}</div>`:''}</td><td class="num nw">${c.recurring?'':`<button class="ib" data-mv="-1" aria-label="Subir">▲</button><button class="ib" data-mv="1" aria-label="Descer">▼</button>`}<button class="ib" data-ed aria-label="Editar">${ic('edit')}</button></td></tr>`).join('')}
  </tbody></table>`:`<div class="empty">Nenhum lançamento em ${MES[cxM]} de ${cxY}.</div>`}</div>`;
 }else{
  const ms=MES.map((n,i)=>{const a=S.cash.filter(c=>cxIn(c,cxY,i));return {n,i,inn:sum(a,'entrada'),out:sum(a,'saida'),inR:sum(a,'entrada',['RECEBIDO']),outP:sum(a,'saida',['pago'])}});
  const mx=Math.max(1,...ms.map(x=>Math.max(x.inn,x.out)));
  body=`<div class="card"><h3 style="margin-bottom:12px">Entradas e saídas por mês · ${cxY}</h3><div class="grid" style="gap:8px">${ms.map(x=>`<div style="display:grid;grid-template-columns:44px minmax(0,1fr);gap:10px;align-items:center;cursor:pointer" data-gm="${x.i}"><b class="small">${MESC[x.i]}</b><div style="display:grid;gap:3px"><div class="bar" style="height:9px;background:transparent"><i style="width:${x.inn/mx*100}%;background:var(--ok)"></i></div><div class="bar" style="height:9px;background:transparent"><i style="width:${x.out/mx*100}%;background:var(--or)"></i></div></div></div>`).join('')}</div><p class="small muted" style="margin-top:8px"><span style="color:var(--ok)">■</span> Entradas previstas · <span style="color:var(--or)">■</span> Saídas totais · clique num mês para abrir</p></div>
  <div class="card scroll"><table class="stack"><thead><tr><th>Mês</th><th class="num">Entradas</th><th class="num">Recebido</th><th class="num">Saídas</th><th class="num">Pago</th><th class="num">Saldo previsto</th></tr></thead><tbody>${ms.map(x=>`<tr><td><a href="#caixa" data-gm="${x.i}">${x.n}</a></td><td class="num">${brl(x.inn)}</td><td class="num">${brl(x.inR)}</td><td class="num">${brl(x.out)}</td><td class="num">${brl(x.outP)}</td><td class="num" style="color:${x.inn-x.out<0?'var(--bad)':'var(--ok)'}">${brl(x.inn-x.out)}</td></tr>`).join('')}
  <tr><td><b>Total</b></td><td class="num"><b>${brl(inP)}</b></td><td class="num"><b>${brl(inR)}</b></td><td class="num"><b>${brl(out)}</b></td><td class="num"><b>${brl(outP)}</b></td><td class="num"><b>${brl(inP-out)}</b></td></tr></tbody></table></div>`;
 }
 const dre=cxMode==='mes'?'':dreHTML(dreCalc(L),`Ano de ${cxY}`)+dreYearTable(cxY)+dreCompare(cxY);
 const nowD=new Date(),vY=cxMode==='mes'?cxY:cxY,vM=cxMode==='mes'?cxM:(cxY===nowD.getFullYear()?nowD.getMonth():11);
 v.innerHTML=head+dre+(cxMode==='mes'?'':valuationHTML(cxY))+`<h2 style="margin-top:6px">${cxMode==='mes'?'Lançamentos':'Caixa mês a mês'}</h2>`+body;
 $$('[data-db]',v).forEach(b=>b.onclick=()=>{S.settings.dre={...dreCfg(),basis:b.dataset.db};save('settings');route()});
 if($('#dcfg'))$('#dcfg').onclick=dreSettings;if($('#vcfg'))$('#vcfg').onclick=dreSettings;
 const step=d=>{if(cxMode==='ano'){cxY+=d}else{cxM+=d;if(cxM<0){cxM=11;cxY--}if(cxM>11){cxM=0;cxY++}}route()};
 $('#cxp1').onclick=()=>step(-1);$('#cxn1').onclick=()=>step(1);
 if($('#cxm'))$('#cxm').onchange=e=>{cxM=+e.target.value;route()};$('#cxy').onchange=e=>{cxY=+e.target.value;route()};
 $$('[data-md]',v).forEach(b=>b.onclick=()=>{cxMode=b.dataset.md;route()});
 $$('[data-gm]',v).forEach(b=>b.onclick=e=>{e.preventDefault();cxM=+b.dataset.gm;cxMode='mes';route()});
 $('#cxn').onclick=()=>cashForm();$('#cxr').onclick=recurringManager;
 $$('[data-ed]',v).forEach(b=>b.onclick=()=>cashForm(S.cash.find(c=>c.id===b.closest('tr').dataset.id)));
 $$('[data-mv]',v).forEach(b=>b.onclick=()=>{const rest=L.filter(c=>!c.recurring).sort((a,b)=>(a.order||0)-(b.order||0));const c=S.cash.find(x=>x.id===b.closest('tr').dataset.id);const i=rest.indexOf(c),j=i+ +b.dataset.mv;if(j<0||j>=rest.length)return;[rest[i],rest[j]]=[rest[j],rest[i]];rest.forEach((x,k)=>x.order=k);save('cash');route()});
 const rowsOut=()=>{const a=L.slice().sort((x,y)=>(x.date||'').localeCompare(y.date||''));return [['Data','Descrição','Empresa','Tipo','Valor','Status','Conta','Centro de custo','Tipo de custo','Recorrente','Observação','Categoria DRE'],...a.map(c=>[fdate(c.date),c.desc,c.company,c.type==='entrada'?'Entrada':'Saída',num(c.value),c.status,c.account,c.cc,c.costType,c.recurring?'Sim':'',c.obs,dreName(dreCat(c))])]};
 const label=cxMode==='mes'?`${MES[cxM]}_${cxY}`:`${cxY}`;
 $('#cxc').onclick=()=>download(`Fluxo_de_Caixa_${label}.csv`,csv(rowsOut().map(r=>r.map(x=>typeof x==='number'?x.toFixed(2).replace('.',','):x))));
 $('#cxe').onclick=()=>{if(!window.XLSX){toast('O gerador de Excel não carregou. Use CSV.');return}const ws=XLSX.utils.aoa_to_sheet(rowsOut());ws['!cols']=[{wch:11},{wch:34},{wch:22},{wch:9},{wch:12},{wch:16},{wch:14},{wch:18},{wch:16},{wch:10},{wch:30}];const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Fluxo de Caixa');if(cxMode==='ano'){const dd=dreCalc(L),cf=dreCfg();const ws2=XLSX.utils.aoa_to_sheet([['DRE '+label.replace('_',' '),'Valor','% da receita'],...dreRows(dd,cf).map(r=>[r[1],Math.round(r[2]*100)/100,dd.rb?Math.round(r[2]/dd.rb*1000)/10:''])]);ws2['!cols']=[{wch:40},{wch:14},{wch:12}];XLSX.utils.book_append_sheet(wb,ws2,'DRE')}const out=XLSX.write(wb,{bookType:'xlsx',type:'array'});download(`Fluxo_de_Caixa_${label}.xlsx`,new Blob([out]))};
 $('#cxp').onclick=()=>{const r=rowsOut();const dd=dreCalc(L),cf=dreCfg();printHTML('Fluxo de Caixa '+label.replace('_',' '),`<h1>Fluxo de Caixa · ${label.replace('_',' ')}</h1>${cxMode==='ano'?`<h2>DRE</h2><table><tbody>${dreRows(dd,cf).map(r=>`<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td class="num">${r[2]<0?'− '+brl(-r[2]):brl(r[2])}</td><td class="num">${dd.rb?pct(r[2]/dd.rb):''}</td></tr>`).join('')}</tbody></table>`:''}<h2>Lançamentos</h2><p class="muted">Entradas ${brl(inP)} (recebido ${brl(inR)}) · Saídas ${brl(out)} (pago ${brl(outP)}) · Saldo previsto ${brl(inP-out)}</p><table><thead><tr>${r[0].slice(0,8).map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${r.slice(1).map(x=>`<tr>${x.slice(0,8).map((c,i)=>`<td class="${i===4?'num':''}">${i===4?brl(c):esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`)};
};

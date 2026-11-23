
/* ================= gastos recorrentes ================= */
const recKey=(desc,acc)=>{let d=norm(desc);const parc=/^\d+\s*\/\s*\d+/.test(d);d=d.replace(/\d+\s*\/\s*\d+/g,'').replace(/\s+/g,' ').trim();return (parc?'parc:':'')+d+(d.includes('cartao')?'|'+norm(acc):'')};
const ymOf=(y,m)=>y+'-'+String(m+1).padStart(2,'0');
const addMonths=(y,m,k)=>{const d=new Date(y,m+k,1);return [d.getFullYear(),d.getMonth()]};
const recAhead=()=>Math.max(1,Math.min(12,+(S.settings.recAhead||3)));
const isRecOf=(c,t)=>c.type==='saida'&&(c.recurringId===t.id||(!c.recurringId&&recKey(c.desc,c.account)===t.key));
function recActuals(t){const td=today();return S.cash.filter(c=>isRecOf(c,t)&&!c.est&&c.date&&c.date<=td).sort((a,b)=>a.date.localeCompare(b.date))}
function recEstimate(t){const a=recActuals(t).slice(-3);return a.length?Math.round(a.reduce((s,c)=>s+num(c.value),0)/a.length*100)/100:num(t.value)}
function runRecurring(){
 if(!Array.isArray(S.recurring)||!S.recurring.length)return 0;
 const now=new Date(),H=recAhead(),td=today(),monthStart=td.slice(0,8)+'01';let n=0,ch=false;
 S.recurring.filter(t=>t.active!==false).forEach(t=>{
  const val=t.kind==='variavel'?recEstimate(t):num(t.value);
  for(let k=0;k<=H;k++){const [y,m]=addMonths(now.getFullYear(),now.getMonth(),k),ym=ymOf(y,m);
   if(t.start&&ym<t.start)continue;if(t.end&&ym>t.end)continue;if((t.skip||[]).includes(ym))continue;
   if(S.cash.some(c=>isRecOf(c,t)&&(c.date||'').slice(0,7)===ym))continue;
   const last=new Date(y,m+1,0).getDate(),date=ym+'-'+String(Math.min(+t.day||5,last)).padStart(2,'0');
   S.cash.push({id:uid(),desc:t.desc,company:t.company||'',value:val,type:'saida',status:'a pagar',account:t.account||'',date,cc:t.cc||'Administrativo',costType:t.costType||(t.kind==='variavel'?'Variável':'Fixa'),obs:t.kind==='variavel'?'Valor estimado pela média dos últimos 3 meses: troque pelo valor real quando chegar a fatura':'',dre:t.dre||'auto',recurring:true,recurringId:t.id,est:t.kind==='variavel',order:Date.now()});n++;ch=true}
  if(t.kind==='variavel')S.cash.forEach(c=>{if(c.recurringId===t.id&&c.est&&c.date>=monthStart&&Math.abs(num(c.value)-val)>.009){c.value=val;ch=true}});
 });
 if(ch)save('cash');return n;
}
function recSuggestions(){
 const now=new Date(),months=[1,2,3,4].map(k=>{const [y,m]=addMonths(now.getFullYear(),now.getMonth(),-k);return ymOf(y,m)});
 const have=new Set((S.recurring||[]).map(t=>t.key));const G={};
 S.cash.forEach(c=>{if(c.type!=='saida'||c.recurringId||c.est||dreCat(c)==='fora'||!c.date)return;const k=recKey(c.desc,c.account);if(!k||have.has(k))return;(G[k]=G[k]||[]).push(c)});
 const out=[];
 Object.entries(G).forEach(([k,L])=>{const cnt={};L.forEach(c=>{const ym=c.date.slice(0,7);if(months.includes(ym))cnt[ym]=(cnt[ym]||0)+1});
  const inM=Object.keys(cnt).length,per=inM?Object.values(cnt).reduce((a,b)=>a+b,0)/inM:9;
  if(inM<3||per>1.5)return;
  L.sort((a,b)=>a.date.localeCompare(b.date));const l3=L.slice(-3).map(c=>num(c.value)),mx=Math.max(...l3),mn=Math.min(...l3),last=L[L.length-1];
  const fx=norm(last.costType)==='fixa'&&!/cartao|imposto do mes/.test(k.replace(/^parc:/,'x'));const kind=fx||mx-mn<=.03*mx?'fixo':'variavel';
  out.push({key:k,desc:last.desc.replace(/^\d+\s*\/\s*\d+\s*/,'Parcelamento · '),company:last.company,account:last.account,cc:last.cc,costType:last.costType,dre:last.dre||'auto',day:+last.date.slice(8,10),kind,value:num(last.value),avg:Math.round(l3.reduce((a,b)=>a+b,0)/l3.length*100)/100,months:inM});
 });
 return out.sort((a,b)=>(a.kind===b.kind?0:a.kind==='fixo'?-1:1)||a.desc.localeCompare(b.desc));
}
function nextRec(t){const td=today();const c=S.cash.filter(x=>x.recurringId===t.id&&x.date>=td&&x.status!=='pago').sort((a,b)=>a.date.localeCompare(b.date))[0];return c}
function recurringManager(){
 S.recurring=S.recurring||[];const sug=recSuggestions();
 const m=modal(`${mhead('Gastos recorrentes')}
  <p class="muted small">Cada recorrente é lançado sozinho nos próximos meses como "a pagar". Os de valor fixo repetem o valor. Os de valor variável (cartão de crédito, impostos) entram com a média dos últimos 3 meses, marcados "≈ estimado": quando a fatura ou a guia chegar, abra o lançamento e coloque o valor real.</p>
  <div class="row"><label class="f" style="width:260px"><span>Lançar com antecedência de</span><select id="rah">${[1,2,3,4,6,12].map(n=>`<option value="${n}" ${n===recAhead()?'selected':''}>${n} ${n===1?'mês':'meses'}</option>`).join('')}</select></label><span class="sp"></span><button class="btn pri" id="rnew">${ic('plus')} Novo recorrente</button></div>
  ${sug.length?`<section class="card" style="background:#fff;border-color:var(--or)"><h3>Encontrei ${sug.length} gasto(s) que se repetem todo mês</h3><p class="small muted" style="margin:4px 0 10px">Aparecem em pelo menos 3 dos últimos 4 meses. Marque os que quer tornar recorrentes.</p>
   <div class="scroll"><table class="stack"><thead><tr><th></th><th>Gasto</th><th>Tipo</th><th class="num">Valor</th><th>Dia</th><th>Centro de custo</th></tr></thead><tbody>${sug.map((s,i)=>`<tr><td><input type="checkbox" data-sg="${i}" checked aria-label="Criar ${esc(s.desc)}"></td><td><b>${esc(s.desc)}</b>${s.account?`<div class="muted small">${esc(s.account)}</div>`:''}</td><td><span class="tag ${s.kind==='fixo'?'dark':'or'}">${s.kind==='fixo'?'Fixo':'Variável'}</span></td><td class="num">${s.kind==='fixo'?brl(s.value):'≈ '+brl(s.avg)+'<div class="muted small">média de 3 meses</div>'}</td><td>${s.day}</td><td>${esc(s.cc||'')}</td></tr>`).join('')}</tbody></table></div>
   <div class="row" style="margin-top:10px"><span class="sp"></span><button class="btn pri" id="sgok">Criar recorrentes selecionados</button></div></section>`:''}
  ${S.recurring.length?`<div class="scroll"><table class="stack"><thead><tr><th>Gasto</th><th>Tipo</th><th class="num">Valor</th><th>Dia</th><th>Próximo</th><th>Ativo</th><th></th></tr></thead><tbody>${S.recurring.map(t=>{const nx=nextRec(t);return `<tr data-id="${t.id}"><td><b>${esc(t.desc)}</b><div class="muted small">${esc([t.cc,t.account].filter(Boolean).join(' · '))}</div></td><td><span class="tag ${t.kind==='fixo'?'dark':'or'}">${t.kind==='fixo'?'Fixo':'Variável'}</span></td><td class="num">${t.kind==='fixo'?brl(t.value):'≈ '+brl(recEstimate(t))+'<div class="muted small">média de 3 meses</div>'}</td><td>${t.day||'—'}</td><td class="nw">${nx?fdate(nx.date):'—'}</td><td><input type="checkbox" data-act ${t.active!==false?'checked':''} aria-label="Ativo"></td><td class="num nw"><button class="ib" data-red aria-label="Editar">${ic('edit')}</button><button class="ib" data-rrm aria-label="Excluir">${ic('trash')}</button></td></tr>`}).join('')}</tbody></table></div>`:(!sug.length?'<div class="empty">Nenhum gasto recorrente ainda. Crie um em "Novo recorrente".</div>':'')}
  <div class="row"><span class="sp"></span><button class="btn" data-close>Fechar</button></div>`,{wide:true});
 const done=msg=>{const n=runRecurring();save('recurring');toast(msg+(n?` ${n} lançamento(s) criados nos próximos meses.`:''));recurringManager();route()};
 $('#rah').onchange=e=>{S.settings.recAhead=+e.target.value;save('settings');done('Antecedência salva.')};
 $('#rnew').onclick=()=>recForm();
 if(sug.length)$('#sgok').onclick=()=>{const now=new Date();const st=ymOf(now.getFullYear(),now.getMonth());$$('[data-sg]',m).forEach(c=>{if(!c.checked)return;const s=sug[+c.dataset.sg];S.recurring.push({id:uid(),key:s.key,desc:s.desc,company:s.company,account:s.account,cc:s.cc,costType:s.costType,dre:s.dre,day:s.day,kind:s.kind,value:s.value,active:true,start:st,skip:[]})});done('Recorrentes criados.')};
 const tOf=el=>S.recurring.find(t=>t.id===el.closest('tr').dataset.id);
 $$('[data-act]',m).forEach(c=>c.onchange=()=>{tOf(c).active=c.checked;if(!c.checked)removeFutureRec(tOf(c));done(c.checked?'Recorrente ativado.':'Recorrente pausado: lançamentos futuros "a pagar" removidos.')});
 $$('[data-red]',m).forEach(b=>b.onclick=()=>recForm(tOf(b)));
 $$('[data-rrm]',m).forEach(b=>b.onclick=async()=>{const t=tOf(b);if(!await ask(`Excluir o recorrente "${t.desc}"? Os lançamentos futuros ainda "a pagar" dele também saem; os já pagos ficam.`,{ok:'Excluir'}))return;removeFutureRec(t);S.recurring=S.recurring.filter(x=>x!==t);save('recurring');save('cash');toast('Recorrente excluído.');route();recurringManager()});
}
function removeFutureRec(t){const td=today();S.cash=S.cash.filter(c=>!(c.recurringId===t.id&&c.date>=td&&c.status!=='pago'));save('cash')}
function recForm(t){
 const isNew=!t;t=t||{kind:'fixo',day:5,cc:'Administrativo',dre:'auto',active:true};
 const m=modal(`${mhead(isNew?'Novo recorrente':'Editar recorrente')}<form class="grid">
  <div class="grid g2">${fld('Descrição','desc',t.desc||'','text','required')}${fld('Empresa','company',t.company||'')}</div>
  <div class="grid g3">${sel('Valor','kind',[['fixo','Fixo (mesmo valor todo mês)'],['variavel','Variável (média dos últimos 3 meses)']],t.kind)}${fld('Valor fixo (R$)','value',t.value?String(t.value).replace('.',','):'','text','inputmode="decimal"')}${fld('Dia do vencimento','day',t.day||5,'number','min="1" max="31" required')}</div>
  <div class="grid g3">${fld('Centro de custo','cc',t.cc||'')}${fld('Conta','account',t.account||'')}${sel('Categoria DRE','dre',DRE_CATS,t.dre||'auto')}</div>
  <div class="grid g2">${fld('A partir de (mês)','start',t.start||today().slice(0,7),'month')}${fld('Até (opcional)','end',t.end||'','month')}</div>
  <p class="muted small" id="rfh"></p>
  <div class="row"><span class="sp"></span><button class="btn" type="button" id="rfc">Cancelar</button><button class="btn pri">Salvar</button></div></form>`);
 const f=m.querySelector('form');const h=()=>{const v=f.kind.value==='variavel';f.value.disabled=v;$('#rfh').textContent=v?'O valor de cada mês será a média dos 3 últimos pagamentos com essa descrição. Quando a fatura chegar, troque pelo valor real no lançamento.':'Mudar o valor aqui atualiza os lançamentos futuros ainda "a pagar".'};h();f.kind.onchange=h;
 $('#rfc').onclick=()=>recurringManager();
 f.onsubmit=e=>{e.preventDefault();const d=formData(f);d.value=num(d.value);d.day=Math.max(1,Math.min(31,+d.day||5));
  if(d.kind==='fixo'&&!d.value){toast('Informe o valor fixo.');return}
  Object.assign(t,d);t.key=recKey(t.desc,t.account);if(isNew){t.id=uid();t.skip=[];S.recurring=S.recurring||[];S.recurring.push(t)}
  const td=today();S.cash.forEach(c=>{if(c.recurringId===t.id&&c.date>=td&&c.status!=='pago'){c.desc=t.desc;c.company=t.company;c.cc=t.cc;c.account=t.account;c.dre=t.dre;const last=new Date(+c.date.slice(0,4),+c.date.slice(5,7),0).getDate();c.date=c.date.slice(0,8)+String(Math.min(t.day,last)).padStart(2,'0');if(t.kind==='fixo'){c.value=t.value;c.est=false}else c.est=true}});
  if(t.end)S.cash=S.cash.filter(c=>!(c.recurringId===t.id&&c.date.slice(0,7)>t.end&&c.status!=='pago'));
  save('cash');save('recurring');const n=runRecurring();toast('Recorrente salvo.'+(n?` ${n} lançamento(s) criados.`:''));route();recurringManager()};
}

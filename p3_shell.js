
/* ================= login ================= */
function renderLogin(){
 $('#root').innerHTML=`<div id="login">
 <div class="art">
  <div class="logo"><div class="mk">GR</div><span class="wm"><b>GR EVENTS</b><small>FEITO PARA ACONTECER</small></span></div>
  <div style="position:relative;z-index:1;max-width:420px"><h1 style="font-size:clamp(30px,4vw,46px);color:#fff">Eventos, equipe e caixa no mesmo lugar.</h1><p style="margin-top:12px;color:#CFC4B4">Sistema interno da GR Events · Rio de Janeiro</p></div>
  <svg class="bg" viewBox="0 0 520 420" aria-hidden="true"><defs><linearGradient id="lg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#E2733A"/><stop offset="1" stop-color="#B04716"/></linearGradient></defs>
   <g transform="translate(60 40)"><rect x="0" y="40" width="300" height="300" rx="26" fill="#2A231D"/><rect x="0" y="40" width="300" height="64" rx="26" fill="url(#lg)"/><rect x="0" y="80" width="300" height="24" fill="#B04716"/>
   ${Array.from({length:20},(_,i)=>{const x=22+(i%5)*56,y=124+Math.floor(i/5)*52;return `<rect x="${x}" y="${y}" width="42" height="38" rx="8" fill="${[3,8,14].includes(i)?'#D45A20':'#322C25'}"/>`}).join('')}
   <rect x="58" y="18" width="14" height="44" rx="7" fill="#F7F3ED"/><rect x="228" y="18" width="14" height="44" rx="7" fill="#F7F3ED"/>
   <circle cx="360" cy="300" r="70" fill="#F7F3ED"/><path d="M325 300l24 24 46-50" stroke="#D45A20" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></svg>
 </div>
 <div class="form"><form class="box" id="lf">
  <h2 id="ltit">Entrar</h2><p class="muted small" id="lsub">Use o seu e-mail de trabalho e a sua senha.</p>
  <label class="f"><span>E-mail</span><input type="email" name="email" autocomplete="username" required></label>
  <label class="f"><span>Senha</span><input type="password" name="pw" autocomplete="current-password" minlength="6" required></label>
  <p class="small" id="lerr" style="color:var(--bad);min-height:1.5em"></p>
  <button class="btn pri" type="submit" id="lbtn">${ic('lock')} Entrar</button>
  <p class="small muted" style="margin-top:12px">Primeiro acesso? <a href="#" id="ltog" style="color:var(--or)">Criar minha senha</a></p>
  ${sb?'':'<p class="small" style="color:var(--bad)">A nuvem não carregou. Verifique a conexão e recarregue a página.</p>'}
 </form></div></div>`;
 let mode='in';
 $('#ltog').onclick=e=>{e.preventDefault();mode=mode==='in'?'up':'in';
  $('#ltit').textContent=mode==='in'?'Entrar':'Criar minha senha';
  $('#lsub').textContent=mode==='in'?'Use o seu e-mail de trabalho e a sua senha.':'Só funciona para e-mails liberados pelo Administrador. Você vai receber um link de confirmação.';
  $('#lbtn').innerHTML=(mode==='in'?ic('lock')+' Entrar':ic('plus')+' Criar acesso');
  $('#ltog').textContent=mode==='in'?'Criar minha senha':'Já tenho senha, quero entrar';
  $('#lerr').textContent='';};
 $('#lf').onsubmit=async e=>{e.preventDefault();
  const b=$('#lbtn'),err=$('#lerr');b.disabled=true;err.textContent='';err.style.color='var(--bad)';
  try{
   if(mode==='up'){await sbSignUp(e.target.email.value,e.target.pw.value);
    err.style.color='var(--ok)';err.textContent='Acesso criado. Confirme pelo link enviado ao seu e-mail e depois entre.';b.disabled=false;return}
   await sbSignIn(e.target.email.value,e.target.pw.value);
   await startSession();
  }catch(ex){err.textContent=authMsg(ex);b.disabled=false}
 };
}
async function logout(){ME=null;Cloud.on=false;try{await sb.auth.signOut()}catch(_){}location.hash='';renderLogin()}

/* ================= layout ================= */
const NAV=[
 ['intro','info','Intro GR Events'],['servicos','star','Nossos Serviços'],['publico','target','Público Alvo'],
 ['marketing','mega','Marketing'],['projetos','spark','Novos Projetos'],'-',
 ['clientes','users','Clientes'],['fornecedores','truck','Fornecedores'],['equipe','team','Equipe']];
function shell(active){
 if(!$('#app')){
  $('#root').innerHTML=`<div id="app"><nav id="side"></nav><div id="main"><header id="top"></header><main id="view"></main></div></div>`;
 }
 const newLeads=S.leads.filter(l=>l.stage==='novo').length;
 $('#side').innerHTML=`<a class="logo" href="#dashboard" style="text-decoration:none"><div class="mk">GR</div><span class="wm"><b>GR EVENTS</b><small>FEITO PARA ACONTECER</small></span></a>
  <a class="nav ${active==='dashboard'?'on':''}" href="#dashboard">${ic('home')} Dashboard</a>
  ${NAV.map(n=>n==='-'?'<div class="div"></div>':`<a class="nav ${active===n[0]?'on':''}" href="#${n[0]}">${ic(n[1])} ${n[2]}${n[0]==='projetos'&&newLeads?`<span class="badge">${newLeads}</span>`:''}</a>`).join('')}
  ${isAdmin()?`<div class="div"></div><a class="nav ${active==='usuarios'?'on':''}" href="#usuarios">${ic('shield')} Usuários</a>`:''}
  <span class="sp"></span><p class="small" style="color:#8C8273;padding:8px">Dados na nuvem · GR Events</p>`;
 $('#top').innerHTML=`<button class="ib" id="menuBtn" aria-label="Menu">${ic('menu')}</button><span class="sp"></span>
  <div class="who"><span class="av ${isAdmin()?'or':''}">${esc(initials(ME.name))}</span><span><b>${esc(ME.name)}</b><br><span class="muted">${roleName(ME.role)}</span></span></div>
  <button class="btn sm" id="sair">${ic('out')} Sair</button>`;
 $('#sair').onclick=logout;
 $('#menuBtn').onclick=e=>{e.stopPropagation();$('#side').classList.toggle('open')};
 $('#side').onclick=e=>{if(e.target.closest('a'))$('#side').classList.remove('open')};
 document.onclick=e=>{const s=$('#side');if(s&&s.classList.contains('open')&&!e.target.closest('#side'))s.classList.remove('open')};
 return $('#view');
}

/* ================= roteamento ================= */
const VIEWS={};
let curEventTab='info';
function route(){
 if(!ME){renderLogin();return}
 const h=(location.hash||'#dashboard').slice(1);
 const fin=['orcamentos','caixa','usuarios'];
 let name=h, arg=null;
 const m=h.match(/^evento-(.+)$/);if(m){name='evento';arg=m[1]}
 if(fin.includes(name)&&!isAdmin())name='dashboard';
 const fn=VIEWS[name]||VIEWS.dashboard;
 const v=shell(VIEWS[name]?(name==='evento'?'eventos':name):'dashboard');
 window.scrollTo(0,0);
 fn(v,arg);
}
window.addEventListener('hashchange',route);
const go=h=>{if(location.hash==='#'+h)route();else location.hash=h};

/* ================= dashboard ================= */
const eventStart=e=>e.start||'';
function upcoming(){const t=today();return S.events.filter(e=>(e.end||e.start||'')>=t&&e.status!=='CANCELADO').sort((a,b)=>eventStart(a).localeCompare(eventStart(b)))}
VIEWS.dashboard=v=>{
 const ad=isAdmin();
 const BP=S.budgets.filter(budInPeriod),gen=BP.reduce((s,b)=>s+num(b.quoted),0), clo=BP.filter(b=>b.status==='FECHADO').reduce((s,b)=>s+budgetClosed(b),0);
 const up=upcoming().slice(0,8);
 v.innerHTML=`<div class="row"><div><p class="muted small">${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p><h1>Olá, ${esc(ME.name.split(' ')[0])}</h1></div><span class="sp"></span>
  ${ad?`<button class="btn" id="imp">${ic('upload')} Enviar planilha</button>`:''}<button class="btn pri" id="newEv">${ic('plus')} Novo Evento</button></div>
 <div class="grid g3 kp">
  ${[['Eventos',S.events.length,'cal'],['Clientes',S.clients.length,'users'],['Orçamentos Gerados',ad?brl(gen):'—','file',ad?BP.length+' orçamento(s)':''],['Orçamentos Fechados',ad?brl(clo):'—','check',ad?BP.filter(b=>b.status==='FECHADO').length+' fechado(s) · '+pct(gen?clo/gen:NaN)+' do orçado':'']].map(k=>`<div class="card kpi"><span class="l">${ic(k[2])} ${k[0]}</span><span class="v">${k[1]}</span>${k[3]?`<span class="small muted">${k[3]}</span>`:''}</div>`).join('')}
 </div>
 ${ad?`<div class="row" style="margin-top:-8px;align-items:end;justify-content:flex-end"><span class="small muted" style="padding-bottom:12px">Orçamentos gerados e fechados de: <b style="color:var(--ink)">${perLabel()}</b></span>${periodBar()}</div>`:''}
 ${(()=>{if(!S.goals||!S.goals.items||!S.goals.items.length)return '';const st=goalStats();return `<a class="card" href="#publico" style="text-decoration:none;color:inherit;display:grid;gap:10px;border-left:5px solid var(--or)">
  <div class="row"><span class="tag or">${ic('target','style="width:14px;height:14px"')} Lembrete de meta</span><b style="font-size:17px">Meta ${S.goals.year}${ad?' · '+short(st.T):''}</b><span class="sp"></span><span class="small muted">${Math.round(st.p*100)}% realizado · ritmo esperado ${Math.round(st.pace*100)}% ${ic('arrow','style="width:14px;height:14px;vertical-align:-2px"')}</span></div>
  <div class="bar" style="position:relative"><i style="width:${Math.min(100,st.p*100)}%"></i><span style="position:absolute;top:-3px;bottom:-3px;left:${st.pace*100}%;width:2px;background:var(--ink)"></span></div>
  <div class="row" style="gap:6px">${S.goals.items.map(g=>{const p=num(g.target)?gDone(g)/num(g.target):0;return `<span class="tag ${p>=1?'ok':''}">${esc(g.label)} · ${g.kind} +${short(num(g.target)).replace('R$ ','')}${p?` · ${Math.round(p*100)}%`:''}</span>`}).join('')}</div></a>`})()}
 <button class="hero" id="goEv"><div><p style="color:#CFC4B4;font-weight:700;font-size:13px">${S.events.filter(e=>!['REALIZADO','CANCELADO'].includes(e.status)).length} em andamento</p><h2>Eventos em execução</h2></div><span class="go">${ic('arrow')}</span></button>
 <div class="grid g3">
  <a class="short" href="#agenda"><span class="ci">${ic('cal')}</span>Agenda</a>
  ${ad?`<a class="short" href="#orcamentos"><span class="ci">${ic('file')}</span>Orçamentos</a><a class="short" href="#caixa"><span class="ci">${ic('money')}</span>Fluxo de Caixa</a>`:''}
 </div>
 <section class="card"><div class="row" style="margin-bottom:6px"><h2>Próximos eventos</h2><span class="sp"></span><a class="btn sm ghost" href="#agenda">Ver agenda</a></div>
  ${up.length?up.map(e=>{const d=(e.start||'').split('-');return `<div class="up" data-ev="${e.id}"><div class="dt"><b>${d[2]||'--'}</b><span>${d[1]?MESC[+d[1]-1]:''}</span></div><div><b>${esc(e.name)}</b><div class="muted small">${esc(e.client||'Sem cliente')}${e.local?' · '+esc(e.local):''}</div></div><span class="tag ${evTag(e.status)}">${esc(e.status)}</span></div>`}).join(''):`<div class="empty">Nenhum evento futuro. Crie um em Novo Evento.</div>`}
 </section>`;
 $('#goEv').onclick=()=>go('eventos');
 $('#newEv').onclick=()=>eventForm();
 $$('[data-ev]',v).forEach(r=>r.onclick=()=>go('evento-'+r.dataset.ev));
 if(ad){$('#imp').onclick=importSheet;bindPeriod(v,()=>VIEWS.dashboard(v))}
};

/* ================= envio de planilhas ================= */
const ALIAS={
 desc:['evento / servico','evento/servico','descricao','descrição','historico','item','lancamento','nome do lancamento','evento','servico'],
 company:['empresa','fornecedor','favorecido','pagador','origem','destino'],
 value:['valor','total','montante','valor (r$)','preco'],
 status:['status','situacao'],account:['conta','banco'],date:['data','vencimento','data pagamento','dt'],
 cc:['centro de custo','cc','centro'],costType:['tipo de custo','categoria','classificacao'],obs:['observacao','observacoes','obs','nota'],
 name:['nome / nome fantasia','nome fantasia','nome completo','nome','cliente','colaborador','fornecedor','razao social','empresa'],
 client:['cliente'],quoted:['orcado','valor orcado','orcamento','valor'],closed:['fechado','valor fechado'],profit:['lucro'],
 phone:['telefone / whatsapp','telefone','celular','whatsapp','fone'],email:['e-mail','email'],company2:['razao social','empresa'],
 contact:['contato responsavel','responsavel','contato'],
 category:['servico','servicos','categoria','tipo'],pix:['chave pix','pix'],role:['funcoes','funcao','cargo'],doc:['cpf/cnpj','cpf / cnpj','cnpj','cpf','documento'],bank:['banco','dados bancarios'],
 rg:['rg'],city:['cidade','municipio'],state:['estado','uf'],price:['faixa de preco','preco','valor de referencia'],operation:['operacao','modalidade'],
 rating:['pontuacao (1-5)','pontuacao','nota'],evalText:['avaliacao'],
 realization:['realizacao'],dre:['categoria dre','dre'],refYear:['ano','ano de referencia'],
 hSent:['orcamentos enviados'],hClosed:['orcamentos fechados'],hTotal:['total fechado (r$)','total fechado']
};
function pickCol(row,key){const keys=Object.keys(row);for(const a of ALIAS[key]){const k=keys.find(x=>norm(x)===norm(a));if(k!==undefined&&row[k]!==''&&row[k]!=null)return row[k]}return ''}
const UF={'rio de janeiro':'RJ','sao paulo':'SP','parana':'PR','minas gerais':'MG','espirito santo':'ES','santa catarina':'SC','rio grande do sul':'RS','bahia':'BA','distrito federal':'DF','goias':'GO','pernambuco':'PE','ceara':'CE'};
const ufOf=v=>{const n=norm(v);return UF[n]||String(v||'').trim().toUpperCase().slice(0,20)};
function xlDate(v){if(!v)return '';if(v instanceof Date&&!isNaN(v)){const d=new Date(v.getTime()+12*36e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}if(typeof v==='number'){const d=new Date(Math.round((v-25569)*864e5));return d.toISOString().slice(0,10)}const s=String(v).trim();let m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);if(m){const y=m[3].length===2?'20'+m[3]:m[3];return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`}m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[0]:''}
function parseCSV(txt){const sep=(txt.split('\n')[0].match(/;/g)||[]).length>(txt.split('\n')[0].match(/,/g)||[]).length?';':',';
 const lines=[];let cur=[''],q=false;for(let i=0;i<txt.length;i++){const c=txt[i];if(q){if(c==='"'){if(txt[i+1]==='"'){cur[cur.length-1]+='"';i++}else q=false}else cur[cur.length-1]+=c}else if(c==='"')q=true;else if(c===sep)cur.push('');else if(c==='\n'){lines.push(cur);cur=['']}else if(c!=='\r')cur[cur.length-1]+=c}if(cur.join(''))lines.push(cur);
 const hd=lines.shift()||[];return lines.filter(l=>l.join('').trim()).map(l=>Object.fromEntries(hd.map((h,i)=>[h.trim(),l[i]??''])))}
async function readSheets(file){
 const name=file.name.toLowerCase();
 if(name.endsWith('.csv'))return [{sheet:file.name.replace(/\.csv$/i,''),rows:parseCSV(await file.text())}];
 if(!window.XLSX)throw new Error('Leitor de Excel indisponível agora. Recarregue a página ou salve cada aba como CSV.');
 const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});
 return wb.SheetNames.map(sn=>({sheet:sn,rows:XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:''})}));
}
const KIND_DEST={entradas:'Fluxo de Caixa (entradas)',saidas:'Fluxo de Caixa (saídas)',orcamentos:'Orçamentos',clientes:'Clientes',fornecedores:'Fornecedores',equipe:'Equipe'};
function sheetKind(n){n=norm(n);if(/client/.test(n))return 'clientes';if(/equipe|colaborador|staff|funcionari/.test(n))return 'equipe';if(/fornecedor|parceir/.test(n))return 'fornecedores';if(/entrada|receita|recebimento/.test(n))return 'entradas';if(/saida|despesa|pagamento|custo/.test(n))return 'saidas';if(/orcamento|proposta/.test(n))return 'orcamentos';return ''}
function importRows(kind,rows,R,sheet){
 const r0={ok:0,upd:0,bad:[]};
 rows.forEach((r,i)=>{const ln=`${sheet?sheet+', ':''}linha ${i+2}`;const g=k=>{const v=pickCol(r,k);return v==null?'':String(v).trim()};
  if(kind==='entradas'||kind==='saidas'){const value=Math.abs(num(pickCol(r,'value'))),date=xlDate(pickCol(r,'date')),desc=g('desc')||g('company');
   if(!value||!date){if(Object.values(r).some(v=>String(v).trim()))r0.bad.push(`${ln}: falta ${!value?'valor':'data'}`);return}
   const tp=kind==='entradas'?'entrada':'saida';let st=g('status');const ok=tp==='entrada'?['RECEBIDO','ENTRADA PROVÁVEL','PENDENTE']:['pago','a pagar','PENDENTE'];st=ok.find(x=>norm(x)===norm(st))||(tp==='entrada'?'PENDENTE':'a pagar');
   const dn=norm(g('dre'));const dre=!dn?'auto':dn.startsWith('receita')?'receita':dn.startsWith('dedu')?'deducao':dn.startsWith('csp')||dn.includes('custo do servico')?'csp':dn.startsWith('despesa')?'despesa':dn.startsWith('resultado')||dn.includes('financeiro')?'financeiro':dn.startsWith('fora')?'fora':'auto';
   const D=desc||'(sem descrição)';const key=[date,tp,value.toFixed(2),norm(D)].join('|');if(!importRows.ex){importRows.ex={};S.cash.forEach(x=>{const k=[x.date,x.type,num(x.value).toFixed(2),norm(x.desc)].join('|');importRows.ex[k]=(importRows.ex[k]||0)+1});importRows.seen={}}importRows.seen[key]=(importRows.seen[key]||0)+1;if((importRows.ex[key]||0)>=importRows.seen[key]){r0.same=(r0.same||0)+1;return}
   S.cash.push({id:uid(),desc:D,company:g('company'),value,type:tp,status:st,account:g('account'),date,cc:g('cc'),costType:g('costType'),obs:g('obs'),dre,recurring:false,order:Date.now()+i,importId:CUR_IMPORT});r0.ok++;return}
  if(kind==='orcamentos'){const name=g('desc')||g('name');if(!name){if(Object.values(r).some(v=>String(v).trim()))r0.bad.push(`${ln}: sem evento/serviço`);return}
   let st=norm(pickCol(r,'status'));st=st.startsWith('fech')?'FECHADO':st.startsWith('perd')||st.startsWith('recus')?'PERDIDO':'PENDENTE';
   const rz=norm(g('realization')),real=rz.startsWith('realiz')?'REALIZADO':rz.startsWith('cancel')?'CANCELADO':st==='PERDIDO'?'CANCELADO':'A REALIZAR';
   const bd={date:xlDate(pickCol(r,'date'))||today(),name,client:g('client'),quoted:num(pickCol(r,'quoted')),closed:num(pickCol(r,'closed')),profit:num(pickCol(r,'profit')),status:st,realization:real,obs:g('obs')};const ry=parseInt(g('refYear'));if(ry>1990&&ry<2100)bd.year=ry;
   const dup=S.budgets.find(x=>x.date===bd.date&&norm(x.name)===norm(bd.name)&&Math.abs(num(x.quoted)-bd.quoted)<.01);
   if(dup){r0.same=(r0.same||0)+1;return}
   S.budgets.push({id:uid(),...bd,eventId:'',importId:CUR_IMPORT});r0.ok++;return}
  const name=g('name');if(!name){if(Object.values(r).some(v=>String(v).trim()))r0.bad.push(`${ln}: sem nome`);return}
  const ev=g('evalText'),rt=num(pickCol(r,'rating'))||({'otima':5,'excelente':5,'boa':4,'regular':3,'ruim':2}[norm(ev)]||0);
  const notes=[g('obs'),kind==='fornecedores'&&ev?'Avaliação: '+ev:''].filter(Boolean).join(' · ');
  const base={name,phone:g('phone'),email:g('email'),doc:g('doc'),city:g('city'),state:ufOf(g('state')),notes};
  let rec;
  if(kind==='clientes')rec={...base,company:g('company2'),contact:g('contact'),hist:(pickCol(r,'hSent')!==''||pickCol(r,'hTotal')!=='')?{sent:num(pickCol(r,'hSent')),closed:num(pickCol(r,'hClosed')),total:num(pickCol(r,'hTotal'))}:undefined};
  if(kind==='fornecedores')rec={...base,category:g('category'),contact:g('contact'),pix:g('pix'),bank:g('bank'),price:g('price'),operation:g('operation'),rating:Math.max(0,Math.min(5,Math.round(rt)))};
  if(kind==='equipe')rec={...base,role:g('role'),pix:g('pix'),bank:g('bank'),rg:g('rg'),rating:Math.max(0,Math.min(5,Math.round(rt)))};
  const key={clientes:'clients',fornecedores:'suppliers',equipe:'team'}[kind];
  const ex=S[key].find(x=>norm(x.name)===norm(name));
  if(ex){let ch=false;for(const [k,v] of Object.entries(rec)){if(v===undefined||v===''||v===0)continue;if(k==='hist'?JSON.stringify(ex.hist)!==JSON.stringify(v):(ex[k]===undefined||ex[k]===''||ex[k]===0)){ex[k]=v;ch=true}}if(ch)r0.upd++;else r0.same=(r0.same||0)+1}
  else{S[key].push({id:uid(),...rec,importId:CUR_IMPORT});r0.ok++}
 });
 const t=R[kind]=R[kind]||{ok:0,upd:0,same:0,bad:[]};t.ok+=r0.ok;t.upd+=r0.upd;t.same+=r0.same||0;t.bad.push(...r0.bad);
}
let CUR_IMPORT='';
function importSheet(){
 const b=modal(`${mhead('Enviar planilha')}<form id="imf" class="grid">
  <label class="f"><span>Arquivo (Excel ou CSV)</span><input type="file" name="file" accept=".xlsx,.xls,.csv" required></label>
  ${sel('Tipo de planilha','kind',[['base','Base completa: reconhece cada aba pelo nome'],['entradas','Entradas (Fluxo de Caixa)'],['saidas','Saídas (Fluxo de Caixa)'],['orcamentos','Orçamentos'],['clientes','Clientes'],['fornecedores','Fornecedores'],['equipe','Equipe']])}
  <p class="muted small">Na base completa, cada aba vai para o cadastro com o mesmo nome (Clientes, Equipe, Fornecedores, Entradas, Saídas, Orçamentos). A primeira linha de cada aba precisa ter os nomes das colunas. Quem já existe no cadastro (mesmo nome) não é duplicado: só os campos vazios são completados.</p>
  <div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">${ic('upload')} Confirmar envio</button></div></form>`);
 b.querySelector('#imf').onsubmit=async e=>{e.preventDefault();const f=e.target.file.files[0],kind=e.target.kind.value;if(!f)return;
  let sheets;try{sheets=await readSheets(f)}catch(err){toast(err.message||'Não foi possível ler o arquivo.');return}
  importRows.ex=null;importRows.seen=null;
  const R={},skipped=[];CUR_IMPORT='imp_'+uid();S.settings.lastImport={id:CUR_IMPORT,at:Date.now(),file:f.name};save('settings');
  if(kind==='base')sheets.forEach(s=>{const k=sheetKind(s.sheet);if(k)importRows(k,s.rows,R,s.sheet);else if(s.rows.length)skipped.push(s.sheet)});
  else sheets.forEach(s=>importRows(kind,s.rows,R,sheets.length>1?s.sheet:''));
  ['cash','budgets','clients','suppliers','team'].forEach(save);
  const gl=S.goals&&S.goals.items;if(gl){const setG=(id,def,name)=>{const g=gl.find(x=>x.id===id);if(g&&(g.client||'')===def&&S.clients.some(c=>norm(c.name)===norm(name))){g.client=name}};setG('g1','Elite Rede de Ensino','Sistema Elite de Ensino');setG('g2','','Rede Alfa de Ensino');save('goals')}
  const ks=Object.keys(R);const tot=ks.reduce((s,k)=>s+R[k].ok+R[k].upd,0),bad=ks.flatMap(k=>R[k].bad);
  modal(`${mhead('Resumo do envio')}<p class="muted">${esc(f.name)}</p>
   ${ks.length?`<div class="grid g3 kp">${ks.map(k=>`<div class="card kpi"><span class="l">${KIND_DEST[k]}</span><span class="v">${R[k].ok} novo${R[k].ok===1?'':'s'}</span><span class="small muted">${R[k].upd?R[k].upd+' atualizado(s) · ':''}${R[k].same?R[k].same+' já estavam iguais · ':''}${R[k].bad.length} não lida(s)</span></div>`).join('')}</div>`:'<div class="empty">Nenhuma aba reconhecida. Use nomes de aba como Clientes, Equipe, Fornecedores, Entradas, Saídas ou Orçamentos, ou escolha o tipo da planilha.</div>'}
   ${skipped.length?`<p class="small" style="color:var(--warn)">Abas ignoradas (nome não reconhecido): ${skipped.map(esc).join(', ')}.</p>`:''}
   ${bad.length?`<div><h3>${bad.length} linha${bad.length===1?'':'s'} não puderam ser lidas</h3><ul class="small">${bad.slice(0,50).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:tot?'<p class="muted">Todas as linhas com dados foram lidas.</p>':''}
   <div class="row"><span class="sp"></span><button class="btn pri" data-close>Fechar</button></div>`);
  route()};
}

/* ================= limpeza de cadastros (Administrador) ================= */
const createdAt=r=>{const m=String(r.id||'').match(/^([0-9a-z]+)[0-9a-z]{6}$/);const t=m?parseInt(m[1],36):NaN;return isFinite(t)&&t>1.5e12&&t<4e12?t:0};
function cleanupTool(pre){
 const li=S.settings.lastImport;const t0=new Date();t0.setHours(0,0,0,0);
 const REG=[['clients','Clientes'],['suppliers','Fornecedores'],['team','Equipe']];
 const m=modal(`${mhead('Apagar cadastros')}<form class="grid" id="clf">
  <fieldset class="card" style="background:#fff;display:grid;gap:8px"><legend style="font-weight:800;padding:0 6px">De quais cadastros</legend>
   ${REG.map(([k,n])=>`<label class="row" style="gap:10px"><input type="checkbox" name="r_${k}" ${!pre||pre===k?'checked':''}> ${n} <span class="muted small">(${S[k].length} no total)</span></label>`).join('')}</fieldset>
  <fieldset class="card" style="background:#fff;display:grid;gap:8px"><legend style="font-weight:800;padding:0 6px">Quais registros</legend>
   <label class="row" style="gap:10px"><input type="radio" name="scope" value="today" checked style="width:20px;height:20px;min-height:0;accent-color:var(--or)"> Criados hoje (${t0.toLocaleDateString('pt-BR')})</label>
   ${li?`<label class="row" style="gap:10px"><input type="radio" name="scope" value="last" style="width:20px;height:20px;min-height:0;accent-color:var(--or)"> Só os do último envio de planilha (${esc(li.file||'')}, ${new Date(li.at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})})</label>`:''}
   <label class="row" style="gap:10px"><input type="radio" name="scope" value="all" style="width:20px;height:20px;min-height:0;accent-color:var(--or)"> Todos, sem exceção</label></fieldset>
  <div id="clprev" class="card small" style="background:#FDEEEA;border-color:#F3C9C0"></div>
  ${fld('Escreva APAGAR para confirmar','adm','','text','required autocomplete="off"')}
  <p class="small" data-err style="color:var(--bad)"></p>
  <div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn dark" id="cldo">${ic('trash')} Apagar</button></div></form>`);
 const f=$('#clf');
 const pick=()=>{const sc=f.querySelector('[name=scope]:checked').value;const out={};REG.forEach(([k])=>{if(!f['r_'+k].checked){out[k]=[];return}out[k]=S[k].filter(r=>sc==='all'?true:sc==='last'?r.importId===li.id:createdAt(r)>=t0.getTime())});return out};
 const prev=()=>{const p=pick(),n=REG.reduce((s,[k])=>s+p[k].length,0);
  const used=new Set();S.events.forEach(e=>{e.team.forEach(a=>used.add(a.personId));e.suppliers.forEach(a=>used.add(a.supplierId))});
  const inEv=[...p.team,...p.suppliers].filter(r=>used.has(r.id)).length;
  $('#clprev').innerHTML=n?`<b>Serão apagados ${n} registro(s):</b> ${REG.map(([k,nm])=>p[k].length?`${p[k].length} em ${nm}`:'').filter(Boolean).join(', ')}.<div class="muted" style="margin-top:6px">${REG.flatMap(([k])=>p[k].map(r=>esc(r.name))).slice(0,14).join(', ')}${n>14?'…':''}</div>${inEv?`<p style="color:var(--bad);margin-top:6px">${inEv} deles estão escalados em eventos: nos eventos aparecerão como "removido do cadastro".</p>`:''}<p style="margin-top:6px">Não dá para desfazer.</p>`:'<b>Nenhum registro nessa seleção.</b>';$('#cldo').disabled=!n};
 f.addEventListener('change',prev);prev();
 f.onsubmit=e=>{e.preventDefault();if(norm(f.adm.value)!=='apagar'){m.querySelector('[data-err]').textContent='Escreva APAGAR para confirmar. Nada foi apagado.';return}
  const p=pick();let n=0;REG.forEach(([k])=>{const ids=new Set(p[k].map(r=>r.id));if(!ids.size)return;p[k].forEach(r=>{if(r.photo){Store.delFile(r.photo);delete urlCache[r.photo]}});S[k]=S[k].filter(r=>!ids.has(r.id));n+=ids.size;save(k)});
  closeModal();toast(n+' registro(s) apagado(s).');route()};
}


/* ================= usuários (Administrador) ================= */
VIEWS.usuarios=async v=>{
 v.innerHTML='<h1>Usuários</h1><p class="muted">Carregando…</p>';
 const al=await sb.from('allowed_emails').select('email,role,name').order('email');
 const pf=await sb.from('profiles').select('id,email,name,role');
 if(al.error){v.innerHTML='<h1>Usuários</h1><p class="card">Não foi possível carregar: '+esc(al.error.message||'')+'</p>';return}
 const has=new Set((pf.data||[]).map(p=>(p.email||'').toLowerCase()));
 const prof=e=>(pf.data||[]).find(p=>(p.email||'').toLowerCase()===e.toLowerCase());
 v.innerHTML=`<div class="row"><h1>Usuários</h1><span class="sp"></span><button class="btn pri" id="nu">${ic('plus')} Liberar e-mail</button></div>
 <p class="muted">Só o Administrador vê esta tela. Libere o e-mail da pessoa aqui; ela cria a própria senha na tela de entrada, em "Primeiro acesso".</p>
 <div class="card scroll"><table class="stack"><thead><tr><th>E-mail</th><th>Nome</th><th>Perfil</th><th>Situação</th><th></th></tr></thead><tbody>
 ${(al.data||[]).map(u=>{const p=prof(u.email);return `<tr><td><div class="row"><span class="av ${u.role==='admin'?'or':''}">${esc(initials(u.name||u.email))}</span><b>${esc(u.email)}</b>${ME.email&&u.email.toLowerCase()===ME.email.toLowerCase()?'<span class="tag">você</span>':''}</div></td><td>${esc((p&&p.name)||u.name||'—')}</td><td>${roleName(u.role)}</td><td>${has.has(u.email.toLowerCase())?'<span class="tag ok">entrou</span>':'<span class="tag warn">ainda não criou a senha</span>'}</td><td class="num"><button class="btn sm" data-ed="${esc(u.email)}">${ic('edit')} Editar</button> ${ME.email&&u.email.toLowerCase()===ME.email.toLowerCase()?'':`<button class="btn sm danger" data-rm="${esc(u.email)}">${ic('trash')} Remover</button>`}</td></tr>`}).join('')||'<tr><td colspan="5" class="muted">Nenhum e-mail liberado.</td></tr>'}
 </tbody></table></div>
 <div class="card" style="margin-top:16px"><h3>Dados do sistema</h3>
  <p class="muted small">Os dados ficam na nuvem (Supabase) e são os mesmos para todo mundo. Se este navegador ainda tiver dados antigos guardados só aqui, você pode enviá-los para a nuvem.</p>
  <button class="btn" id="mig">${ic('up')} Enviar dados deste navegador para a nuvem</button></div>`;
 $('#nu').onclick=()=>allowForm();
 $$('[data-ed]',v).forEach(b=>b.onclick=()=>allowForm((al.data||[]).find(u=>u.email===b.dataset.ed)));
 $$('[data-rm]',v).forEach(b=>b.onclick=()=>{const em=b.dataset.rm;const p=prof(em);
  const m=modal(`${mhead('Remover acesso')}<form class="grid"><p><b>${esc(em)}</b> não vai mais conseguir entrar no sistema.</p><p class="small" data-err style="color:var(--bad)"></p><div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn dark">Remover</button></div></form>`);
  m.querySelector('form').onsubmit=async e=>{e.preventDefault();const err=m.querySelector('[data-err]');
   const r1=await sb.from('allowed_emails').delete().eq('email',em);
   if(r1.error){err.textContent=r1.error.message;return}
   if(p){const r2=await sb.from('profiles').delete().eq('id',p.id);if(r2.error){err.textContent=r2.error.message;return}}
   closeModal();toast('Acesso removido.');route()}});
 $('#mig').onclick=migrateLocal;
};
function allowForm(u){
 const isNew=!u;
 const m=modal(`${mhead(isNew?'Liberar e-mail':'Editar '+u.email)}<form class="grid">
  ${fld('E-mail','email',u?u.email:'','email',isNew?'required':'required readonly')}
  ${fld('Nome','name',u?(u.name||''):'','text','required')}
  ${sel('Perfil','role',[['prod','Produção (sem valores financeiros)'],['admin','Administrador (vê tudo)']],u?u.role:'prod')}
  <p class="small muted">Depois de liberado, a pessoa entra em "Primeiro acesso" na tela de entrada e cria a própria senha. A senha fica só com ela.</p>
  <p class="small" data-err style="color:var(--bad)"></p>
  <div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">Salvar</button></div></form>`);
 m.querySelector('form').onsubmit=async e=>{e.preventDefault();const d=formData(e.target);const err=m.querySelector('[data-err]');
  const email=(u?u.email:d.email).trim().toLowerCase();
  const r=await sb.from('allowed_emails').upsert({email,role:d.role,name:d.name.trim()});
  if(r.error){err.textContent=r.error.message;return}
  await sb.from('profiles').update({role:d.role,name:d.name.trim()}).eq('email',email);
  closeModal();toast(isNew?'E-mail liberado.':'Acesso atualizado.');route()};
}

/* envia para a nuvem os dados guardados só neste navegador */
async function migrateLocal(){
 const m=modal(`${mhead('Enviar dados deste navegador para a nuvem')}<div class="grid"><p id="mgs">Procurando dados guardados neste aparelho…</p><div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Fechar</button><button class="btn pri" id="mgo" disabled>Enviar</button></div></div>`);
 const st=t=>{const e=$('#mgs');if(e)e.innerHTML=t};
 await Local.open();
 const loc={};let n=0;
 for(const k of KEYS){const v=await Local.get(k);if(v!==undefined){loc[k]=v;if(Array.isArray(v))n+=v.length}}
 const files=await Local.allFiles();
 if(!Object.keys(loc).length){st('Não há nada guardado só neste aparelho. Nada a enviar.');return}
 st(`Encontrei <b>${n}</b> registro(s) e <b>${files.length}</b> arquivo(s) neste aparelho.<br><span class="muted small">Enviar substitui o que está na nuvem hoje pelos dados deste aparelho.</span>`);
 $('#mgo').disabled=false;
 $('#mgo').onclick=async()=>{
  $('#mgo').disabled=true;
  let done=0;
  for(const [id,blob] of files){
   const r=await sb.storage.from('files').upload(id,blob,{contentType:blob.type||'application/octet-stream',upsert:true});
   done++;st(`Enviando arquivos… ${done}/${files.length}`);
   if(r.error&&!String(r.error.message||'').includes('exists')){st('Falha ao enviar um arquivo: '+esc(r.error.message||''));return}
  }
  st('Enviando os cadastros e os lançamentos…');
  const rows=Object.keys(loc).map(k=>({key:k,value:loc[k]===undefined?null:loc[k],updated_at:new Date().toISOString()}));
  const r=await sb.from('kv').upsert(rows);
  if(r.error){st('Falha ao enviar: '+esc(r.error.message||''));return}
  for(const k of KEYS)if(loc[k]!==undefined)S[k]=loc[k];
  await preloadPhotos();
  st('<b>Pronto.</b> Os dados estão na nuvem e aparecem para todo mundo que tem acesso.');
  toast('Dados enviados para a nuvem.');
 };
}

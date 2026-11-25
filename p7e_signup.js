
/* ================= Cadastro por link (Equipe e Fornecedores) ================= */
/* O fornecedor ou colaborador preenche cadastro.html; o pedido fica pendente até o Administrador aprovar e dar a nota. */
let PENDING=[];
const SIGNUP_KIND={team:'Equipe',suppliers:'Fornecedores'};
async function loadPending(){
 if(!isAdmin()||!sb){PENDING=[];return}
 const r=await sb.from('signup_requests').select('id,kind,data,photo,created_at').eq('status','pendente').order('created_at');
 if(!r.error)PENDING=r.data||[];
}
const pendingOf=kind=>PENDING.filter(p=>p.kind===kind);
function signupBase(){return /^https?:$/.test(location.protocol)?new URL('cadastro.html',location.href).href.split('?')[0].split('#')[0]:'https://lrrdac-create.github.io/gr-eventos-sistem/cadastro.html'}
async function signupToken(kind,renew){
 if(renew){const r=await sb.from('signup_links').upsert({kind,token:crypto.randomUUID(),created_at:new Date().toISOString()}).select('token').single();if(r.error)throw r.error;return r.data.token}
 let r=await sb.from('signup_links').select('token').eq('kind',kind).maybeSingle();
 if(r.error)throw r.error;if(r.data)return r.data.token;
 r=await sb.from('signup_links').insert({kind}).select('token').single();if(r.error)throw r.error;return r.data.token;
}
async function signupLinkDialog(kind,renew=false){
 const who=kind==='team'?'colaborador':'fornecedor';
 modal(`${mhead('Link de cadastro · '+SIGNUP_KIND[kind])}<div class="grid" id="sgb"><p class="muted">Gerando o link…</p></div>`);
 let tk;try{tk=await signupToken(kind,renew)}catch(e){$('#sgb').innerHTML='<p>Não foi possível gerar o link: '+esc(e.message||'')+'</p>';return}
 const url=signupBase()+'?t='+tk;
 const msg=`Olá! Para entrar na base de ${kind==='team'?'equipe':'fornecedores'} da GR Events, preencha seus dados neste link: ${url}`;
 $('#sgb').innerHTML=`<p>Mande este link para o ${who}. Ele preenche os dados (${kind==='team'?'com foto, CPF e PIX':'com CNPJ, serviço e contato'}) e o cadastro chega aqui como <b>aguardando aprovação</b>. Você confere, dá a nota e confirma.</p>
 <label class="f"><span>Link de cadastro de ${SIGNUP_KIND[kind].toLowerCase()}</span><input id="sgu" readonly value="${esc(url)}"></label>
 <div class="row"><button class="btn pri" id="sgc">${ic('copy')} Copiar link</button><a class="btn" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${ic('chat')} Enviar pelo WhatsApp</a></div>
 <p class="muted small">É o mesmo link para todos os ${kind==='team'?'colaboradores':'fornecedores'}. Se ele cair em mãos erradas, gere um novo: o antigo para de funcionar.</p>
 <div class="row"><button class="btn sm ghost" id="sgr">Gerar novo link</button><span class="sp"></span><button class="btn" type="button" data-close>Fechar</button></div>`;
 $('#sgu').onclick=e=>e.target.select();
 $('#sgc').onclick=async()=>{try{await navigator.clipboard.writeText(url);toast('Link copiado.')}catch(e){$('#sgu').select();toast('Selecione e copie o link.')}};
 $('#sgr').onclick=()=>{if(confirm('Gerar um novo link desativa o atual. Quem ainda não preencheu vai precisar do link novo. Continuar?'))signupLinkDialog(kind,true)};
}
const digits=s=>String(s||'').replace(/\D/g,'');
function signupMatch(req){
 const L=S[req.kind],d=req.data,doc=digits(d.doc);
 return L.find(x=>doc.length>=11&&digits(x.doc)===doc)||L.find(x=>norm(x.name)===norm(d.name))||null;
}
async function setSignupStatus(req,status){
 const r=await sb.from('signup_requests').update({status,reviewed_at:new Date().toISOString(),reviewed_by:ME.id,photo:null}).eq('id',req.id);
 if(r.error){toast('Não foi possível atualizar o pedido: '+(r.error.message||''));return false}
 PENDING=PENDING.filter(p=>p.id!==req.id);return true;
}
function pendingDialog(kind){
 const L=pendingOf(kind);
 if(!L.length){closeModal();route();return}
 const m=modal(`${mhead('Cadastros aguardando aprovação · '+SIGNUP_KIND[kind])}
 <p class="muted small">Confira os dados, dê a nota e aprove. O cadastro só entra na base depois de aprovado.</p>
 <div class="grid" style="gap:8px">${L.map(r=>{const d=r.data,ex=signupMatch(r);return `<div class="li" data-id="${r.id}" style="align-items:center">
  ${r.photo?`<img src="${esc(r.photo)}" alt="" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex:none">`:`<span class="av" style="width:44px;height:44px">${esc(initials(d.name))}</span>`}
  <span class="sp" style="min-width:0"><b>${esc(d.name)}</b> <span class="muted small">· ${esc((kind==='team'?d.role:d.category)||'')}</span><br><span class="muted small">${esc([d.phone,d.doc,[d.city,d.state].filter(Boolean).join('/')].filter(Boolean).join(' · '))} · enviado em ${new Date(r.created_at).toLocaleDateString('pt-BR')}</span>${ex?`<br><span class="small" style="color:var(--warn)">Parecido com "${esc(ex.name)}", que já está no cadastro: ao aprovar, os dados dele são atualizados.</span>`:''}</span>
  <button class="btn sm pri" data-ok>${ic('check')} Conferir e aprovar</button><button class="btn sm" data-no>Recusar</button></div>`}).join('')}</div>
 <div class="row"><button class="btn sm ghost" id="pdl">${ic('copy')} Link de cadastro</button><span class="sp"></span><button class="btn" type="button" data-close>Fechar</button></div>`,{wide:true});
 const req=el=>L.find(x=>x.id===el.closest('[data-id]').dataset.id);
 $('#pdl').onclick=()=>signupLinkDialog(kind);
 $$('[data-no]',m).forEach(b=>b.onclick=async()=>{const r=req(b);if(!await ask(`Recusar o cadastro de "${r.data.name}"? Ele não entra na base.`,{ok:'Recusar'})){pendingDialog(kind);return}if(await setSignupStatus(r,'recusado'))toast('Cadastro recusado.');pendingDialog(kind)});
 $$('[data-ok]',m).forEach(b=>b.onclick=()=>approveSignup(req(b)));
}
async function approveSignup(req){
 const kind=req.kind,ex=signupMatch(req);
 const p=ex?{...ex,...req.data,notes:[ex.notes,req.data.notes].filter(Boolean).join('\n')}:{...req.data};
 let photoBlob=null;if(req.photo){try{photoBlob=await (await fetch(req.photo)).blob()}catch(e){}}
 personForm(kind,p,async saved=>{
  if(await setSignupStatus(req,'aprovado'))toast(`${saved.name} entrou no cadastro de ${SIGNUP_KIND[kind]}.`);
  if(pendingOf(kind).length)pendingDialog(kind);else route();
 },{title:'Aprovar cadastro'+(kind==='team'?' de colaborador':' de fornecedor'),ok:'Aprovar e salvar',photoBlob,
  note:`<p class="small" style="background:var(--warnl);padding:10px 12px;border-radius:10px;margin:0">${ex?`Já existe <b>${esc(ex.name)}</b> no cadastro: ao aprovar, ele é atualizado com estes dados.`:'Cadastro enviado pelo link.'} Confira os dados e dê a <b>nota</b> antes de aprovar.</p>`,
  onCancel:()=>pendingDialog(kind)});
}

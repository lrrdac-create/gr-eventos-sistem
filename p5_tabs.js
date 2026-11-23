
/* --- Financeiro / Centro de Custo (Administrador) --- */
const ST_IN=['RECEBIDO','ENTRADA PROVÁVEL','PENDENTE'],ST_OUT=['pago','a pagar','PENDENTE'];
const stTag=s=>({'RECEBIDO':'ok','pago':'ok','ENTRADA PROVÁVEL':'or','a pagar':'warn','PENDENTE':'bad'}[s]||'');
const payeeList=()=>[...S.team.map(p=>({label:p.name,sub:'Equipe'+(p.role?' · '+p.role:''),obj:p,type:'team',pre:avatar(p,28)})),...S.suppliers.map(p=>({label:p.name,sub:'Fornecedor'+(p.category?' · '+p.category:''),obj:p,type:'suppliers',pre:`<span class="av or" style="width:28px;height:28px;font-size:11px">${esc(initials(p.name))}</span>`}))];
TAB.cc=(t,ev,redraw)=>{
 if(!isAdmin()){t.innerHTML='';return}
 const c=ccCalc(ev),L=ev.cc.items;
 t.innerHTML=`<div class="grid g3 kp">
  ${[['Faturamento',brl(c.fat)],['Saídas',brl(c.out)],['Imposto ('+num(ev.cc.tax)+'%)',brl(c.tax)],['Lucro',brl(c.lucro)],['Margem',pct(c.margem)]].map(k=>`<div class="card kpi"><span class="l">${k[0]}</span><span class="v" style="${k[0]==='Lucro'?`color:${c.lucro<0?'var(--bad)':'var(--ok)'}`:''}">${k[1]}</span></div>`).join('')}</div>
 <div class="card grid"><div class="row"><label class="f" style="width:180px"><span>Imposto (%)</span><input id="ctax" type="number" step="0.01" min="0" value="${num(ev.cc.tax)}"></label><span class="sp"></span><button class="btn" data-add="saida">${ic('plus')} Saída</button><button class="btn pri" data-add="entrada">${ic('plus')} Entrada</button></div>
 <p class="muted small">Cada entrada e cada saída lançada aqui cria e atualiza o lançamento correspondente no Fluxo de Caixa.</p>
 ${L.length?`<div class="scroll"><table class="stack"><thead><tr><th>Tipo</th><th>Descrição</th><th>Pago a / recebido de</th><th class="num">Valor</th><th>Status</th><th>Banco</th><th>Pagamento</th><th></th></tr></thead><tbody>
 ${L.slice().sort((a,b)=>a.kind.localeCompare(b.kind)).map(i=>{const p=payeeOf(i);return `<tr><td><span class="tag ${i.kind==='entrada'?'ok':'bad'}">${i.kind==='entrada'?'Entrada':'Saída'}</span></td><td>${esc(i.desc)}${i.receiptNo?`<div class="muted small">Recibo nº ${i.receiptNo}</div>`:''}</td><td>${i.kind==='entrada'?esc(ev.client||''):p?`<div class="row" style="gap:8px;flex-wrap:nowrap">${i.payeeType==='team'?avatar(p,28):''}<span>${esc(p.name)}</span></div>`:'<span class="muted small">—</span>'}</td><td class="num">${brl(i.value)}</td><td><span class="tag ${stTag(i.status)}">${esc(i.status)}</span></td><td>${esc(i.bank||'')}</td><td class="nw">${fdate(i.payDate)}</td><td class="num nw">${i.kind==='saida'?`<button class="btn sm" data-rc="${i.id}">${ic('print')} Gerar recibo</button>`:''}<button class="ib" data-ed="${i.id}" aria-label="Editar">${ic('edit')}</button><button class="ib" data-rm="${i.id}" aria-label="Excluir">${ic('trash')}</button></td></tr>`}).join('')}
 </tbody></table></div>`:'<div class="empty">Sem lançamentos. Adicione entradas (faturamento) e saídas (custos) do evento.</div>'}</div>`;
 $('#ctax').onchange=e=>{ev.cc.tax=num(e.target.value);saveEv();redraw()};
 const form=(it)=>{const kind=it.kind;let pay={type:it.payeeType||'',id:it.payeeId||''};const p0=payeeOf(it);
  const m=modal(`${mhead((it.id?'Editar ':'Nova ')+(kind==='entrada'?'entrada':'saída'))}<form class="grid">
  ${sel('Tipo','kind',[['entrada','Entrada'],['saida','Saída']],kind)}
  ${fld('Descrição','desc',it.desc||'','text','required')}
  <div data-payee><label class="f"><span>Pago a (busque na Equipe ou em Fornecedores)</span><input name="payee" value="${esc(p0?p0.name:'')}" placeholder="Digite o nome"></label><p class="small muted" id="pinfo" style="margin-top:4px">${p0?(pay.type==='team'?'Equipe':'Fornecedor'):''}</p></div>
  <div class="grid g2">${fld('Valor (R$)','value',it.value?String(it.value).replace('.',','):'','text','inputmode="decimal" required')}<label class="f"><span>Status</span><select name="status"></select></label></div>
  <div class="grid g2">${fld('Banco / conta','bank',it.bank||'')}${fld('Data de pagamento','payDate',it.payDate||'','date')}</div>
  <div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">Salvar</button></div></form>`);
  const f=m.querySelector('form');const fill=()=>{const o=f.kind.value==='entrada'?ST_IN:ST_OUT;const cur=it.status||(f.kind.value==='saida'?'a pagar':'PENDENTE');f.status.innerHTML=o.map(s=>`<option ${s===cur?'selected':''}>${s}</option>`).join('');m.querySelector('[data-payee]').style.display=f.kind.value==='saida'?'':'none'};fill();f.kind.onchange=fill;
  autocomplete(f.payee,payeeList,x=>{pay={type:x.type,id:x.obj.id};$('#pinfo').textContent=(x.type==='team'?'Equipe':'Fornecedor')+(x.obj.pix?' · PIX '+x.obj.pix:'')});
  f.payee.addEventListener('input',()=>{pay={type:'',id:''};$('#pinfo').textContent=f.payee.value?'Não encontrado no cadastro: escolha da lista para puxar os dados no recibo.':''});
  f.onsubmit=e=>{e.preventDefault();const d=formData(f);delete d.payee;d.value=num(d.value);if(d.kind==='saida'){d.payeeType=pay.type;d.payeeId=pay.id;d.company=pay.id?'':f.payee.value.trim()}else{d.payeeType='';d.payeeId=''}
   if(!it.id){it.id=uid();L.push(it)}Object.assign(it,d);syncCash(ev,it);saveEv();closeModal();redraw()}};
 $$('[data-add]',t).forEach(b=>b.onclick=()=>form({kind:b.dataset.add}));
 $$('[data-ed]',t).forEach(b=>b.onclick=()=>form(L.find(x=>x.id===b.dataset.ed)));
 $$('[data-rc]',t).forEach(b=>b.onclick=()=>receiptDialog(ev,L.find(x=>x.id===b.dataset.rc),redraw));
 $$('[data-rm]',t).forEach(b=>b.onclick=async()=>{const it=L.find(x=>x.id===b.dataset.rm);if(!await ask(`Excluir "${it.desc}"? O lançamento ligado no Fluxo de Caixa também será apagado.`,{ok:'Excluir'}))return;if(it.cashId){S.cash=S.cash.filter(x=>x.id!==it.cashId);save('cash')}ev.cc.items=L.filter(x=>x!==it);saveEv();redraw()});
};

/* --- Recibo de pagamento --- */
function extenso(v){
 const U=['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'],D=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'],C=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
 const tri=n=>{if(n===100)return 'cem';const c=Math.floor(n/100),r=n%100,p=[];if(c)p.push(C[c]);if(r)p.push(r<20?U[r]:D[Math.floor(r/10)]+(r%10?' e '+U[r%10]:''));return p.join(' e ')};
 const inteiro=n=>{if(!n)return 'zero';const g=[[Math.floor(n/1e9),'bilhão','bilhões'],[Math.floor(n/1e6)%1000,'milhão','milhões'],[Math.floor(n/1e3)%1000,'mil','mil'],[n%1000,'','']].filter(x=>x[0]);
  return g.map((x,i)=>{let t=x[1]==='mil'?(x[0]===1?'mil':tri(x[0])+' mil'):x[1]?(x[0]===1?'um '+x[1]:tri(x[0])+' '+x[2]):tri(x[0]);if(i>0&&i===g.length-1&&(x[0]<100||x[0]%100===0))t='e '+t;return t}).join(' ').replace(/ (?=e )/g,' ')};
 v=Math.round(num(v)*100);const r=Math.floor(v/100),c=v%100;let s='';
 if(r)s=inteiro(r)+(r===1?' real':(r%1e6===0?' de reais':' reais'));
 if(c)s+=(s?' e ':'')+tri(c)+(c===1?' centavo':' centavos');
 return s||'zero reais';
}
function receiptDialog(ev,it,redraw){
 let pay={type:it.payeeType||'',id:it.payeeId||''};const p0=payeeOf(it);
 const m=modal(`${mhead('Gerar recibo de pagamento')}<form class="grid">
  <label class="f"><span>Quem está recebendo (Equipe ou Fornecedor)</span><input name="payee" value="${esc(p0?p0.name:(it.company||''))}" required placeholder="Digite o nome"></label>
  <div id="rinfo" class="card small" style="background:#fff;padding:12px"></div>
  ${fld('Referente a','ref',it.desc||'','text','required')}
  <div class="grid g3">${fld('Valor (R$)','value',String(it.value||'').replace('.',','),'text','inputmode="decimal" required')}${sel('Forma de pagamento','method',['PIX','Transferência','Dinheiro','Cheque','Outro'],it.method||'PIX')}${fld('Data do pagamento','date',it.payDate||today(),'date','required')}</div>
  <label class="row" style="gap:10px"><input type="checkbox" name="two" checked> Imprimir em duas vias (GR e recebedor) na mesma folha</label>
  <div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">${ic('print')} Gerar e imprimir</button></div></form>`);
 const f=m.querySelector('form');
 const info=()=>{const L=pay.type==='team'?S.team:S.suppliers;const p=pay.id&&L.find(x=>x.id===pay.id);$('#rinfo').innerHTML=p?`<div class="row" style="gap:10px;flex-wrap:nowrap">${pay.type==='team'?avatar(p,40):''}<div><b>${esc(p.name)}</b> · ${pay.type==='team'?'Equipe':'Fornecedor'}<br>CPF/CNPJ: ${esc(p.doc||'não cadastrado')} · Tel: ${esc(p.phone||'—')}<br>PIX: ${esc(p.pix||'—')} · Banco: ${esc(p.bank||'—')}</div></div>${p.doc?'':'<p style="color:var(--warn);margin-top:6px">Sem CPF/CNPJ no cadastro: o recibo sai com o campo em branco para preencher à mão.</p>'}`:'<span class="muted">Escolha a pessoa na lista para puxar CPF/CNPJ, telefone e PIX do cadastro.</span>'};info();
 autocomplete(f.payee,payeeList,x=>{pay={type:x.type,id:x.obj.id};info()});
 f.payee.addEventListener('input',()=>{pay={type:'',id:''};info()});
 f.onsubmit=e=>{e.preventDefault();const d=formData(f);const L=pay.type==='team'?S.team:S.suppliers;const p=(pay.id&&L.find(x=>x.id===pay.id))||{name:d.payee.trim()};
  S.settings.receiptSeq=(S.settings.receiptSeq||0)+1;save('settings');const no=String(S.settings.receiptSeq).padStart(4,'0');
  it.receiptNo=no;it.receiptAt=Date.now();it.method=d.method;if(pay.id){it.payeeType=pay.type;it.payeeId=pay.id}saveEv();
  const val=num(d.value),dt=new Date(d.date+'T12:00:00');
  const via=lbl=>`<div style="border:1.5px solid #1C1713;border-radius:6px;padding:22px 26px;font-family:Arial,Helvetica,sans-serif;color:#1C1713;font-size:13px;line-height:1.5;page-break-inside:avoid">
   <div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #D45A20;padding-bottom:10px;margin-bottom:14px"><div style="width:42px;height:42px;border-radius:8px;background:#D45A20;color:#fff;display:grid;place-items:center;font-weight:900;font-size:18px">GR</div><div><b style="font-size:15px">GR EVENTS</b><br><span style="font-size:11px;color:#6B6258">Rio de Janeiro · (21) 99907-3584 · contatogrevents@gmail.com · www.grevents.com.br</span></div><div style="margin-left:auto;text-align:right"><b style="font-size:16px;letter-spacing:.04em">RECIBO DE PAGAMENTO</b><br><span style="font-size:12px">Nº ${no}${lbl?' · '+lbl:''}</span></div></div>
   <div style="display:flex;justify-content:flex-end;margin-bottom:12px"><div style="border:1.5px solid #1C1713;padding:6px 14px;font-size:18px;font-weight:800;border-radius:4px">${brl(val)}</div></div>
   <p style="margin:0 0 12px">Recebi(emos) de <b>GR EVENTS</b> a importância de <b>${brl(val)}</b> (${esc(extenso(val))}), referente a <b>${esc(d.ref)}</b>, no evento <b>${esc(ev.name)}</b>${ev.start?`, realizado em ${fdate(ev.start)}${ev.end&&ev.end!==ev.start?' a '+fdate(ev.end):''}`:''}${ev.local?`, em ${esc(ev.local)}`:''}${ev.client?` (cliente: ${esc(ev.client)})`:''}.</p>
   <p style="margin:0 0 12px">Forma de pagamento: <b>${esc(d.method)}</b> · Data do pagamento: <b>${fdate(d.date)}</b></p>
   <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:22px"><tr><td style="border:1px solid #ccc;padding:6px;width:50%"><span style="color:#6B6258">Recebedor</span><br><b>${esc(p.name)}</b></td><td style="border:1px solid #ccc;padding:6px"><span style="color:#6B6258">CPF / CNPJ</span><br><b>${esc(p.doc||'')}</b>&nbsp;</td></tr>
   <tr><td style="border:1px solid #ccc;padding:6px"><span style="color:#6B6258">Telefone</span><br>${esc(p.phone||'')}&nbsp;</td><td style="border:1px solid #ccc;padding:6px"><span style="color:#6B6258">PIX / dados bancários</span><br>${esc([p.pix,p.bank].filter(Boolean).join(' · '))}&nbsp;</td></tr></table>
   <p style="margin:0 0 34px">Rio de Janeiro, ${dt.getDate()} de ${MES[dt.getMonth()].toLowerCase()} de ${dt.getFullYear()}.</p>
   <div style="display:flex;gap:40px"><div style="flex:1;text-align:center"><div style="border-top:1px solid #1C1713;padding-top:4px"><b>${esc(p.name)}</b><br><span style="font-size:11px">Assinatura do recebedor${p.doc?' · '+esc(p.doc):''}</span></div></div><div style="flex:1;text-align:center"><div style="border-top:1px solid #1C1713;padding-top:4px"><b>GR EVENTS</b><br><span style="font-size:11px">Responsável pelo pagamento</span></div></div></div></div>`;
  const body=d.two?`${via('Via GR Events')}<div style="border-top:1.5px dashed #999;margin:22px 0;text-align:center;font-size:10px;color:#999">✂ recorte aqui</div>${via('Via do recebedor')}`:via('');
  closeModal();redraw&&redraw();printHTML(`Recibo ${no} ${p.name}`,body,{bare:true})};
}

/* --- Proposta (Administrador) --- */
TAB.proposta=async(t,ev,redraw)=>{
 if(!isAdmin()){t.innerHTML='';return}
 const p=ev.proposal;const url=p?await fileURL(p.fileId):'';
 t.innerHTML=`<div class="card grid">${p?`<div class="row"><span class="ci" style="width:44px;height:44px;border-radius:10px;background:var(--orl);color:var(--or2);display:grid;place-items:center">${ic('file')}</span><div><b>${esc(p.name)}</b><div class="muted small">Anexada em ${new Date(p.at).toLocaleDateString('pt-BR')}</div></div><span class="sp"></span>
  ${url?`<a class="btn" href="${url}" target="_blank" rel="noopener">${ic('print')} Abrir para imprimir</a>`:''}<button class="btn" id="pdl">${ic('dl')} Baixar</button><button class="btn danger" id="prm">${ic('trash')} Remover</button></div>`:'<div class="empty">Nenhuma proposta anexada.</div>'}
  <label class="f"><span>${p?'Substituir':'Anexar'} PDF da proposta</span><input type="file" id="pup" accept="application/pdf,.pdf"></label></div>`;
 $('#pup').onchange=async e=>{const f=e.target.files[0];if(!f)return;if(p)await Store.delFile(p.fileId);const id=await Store.putFile(f);ev.proposal={fileId:id,name:f.name,at:Date.now()};saveEv();redraw()};
 if(p){$('#pdl').onclick=async()=>{const b=await Store.getFile(p.fileId);if(b)download(p.name,b)};$('#prm').onclick=async()=>{if(!await ask('Remover a proposta deste evento?',{ok:'Remover'}))return;await Store.delFile(p.fileId);ev.proposal=null;saveEv();redraw()}}
};

/* --- Fotos --- */
TAB.fotos=async(t,ev,redraw)=>{
 const urls=await Promise.all(ev.photos.map(p=>fileURL(p.fileId)));
 t.innerHTML=`<div class="card grid"><label class="f"><span>Enviar fotos (pode escolher várias)</span><input type="file" id="fup" accept="image/*" multiple></label>
 ${ev.photos.length?`<div class="ph">${ev.photos.map((p,i)=>`<figure data-id="${p.fileId}"><img src="${urls[i]}" alt="${esc(p.caption||'Foto do evento')}" loading="lazy"><figcaption class="row" style="gap:4px;flex-wrap:nowrap"><input data-cap value="${esc(p.caption||'')}" placeholder="Legenda" aria-label="Legenda"><button class="ib" data-rm aria-label="Excluir foto">${ic('trash')}</button></figcaption></figure>`).join('')}</div>`:'<div class="empty">Sem fotos. As legendas aparecem no Resumo.</div>'}</div>`;
 $('#fup').onchange=async e=>{for(const f of e.target.files){const id=await Store.putFile(f);ev.photos.push({fileId:id,caption:'',name:f.name})}saveEv();redraw()};
 $$('[data-cap]',t).forEach(i=>i.onchange=()=>{ev.photos.find(p=>p.fileId===i.closest('figure').dataset.id).caption=i.value;saveEv()});
 $$('[data-rm]',t).forEach(b=>b.onclick=async()=>{if(!await ask('Excluir esta foto?',{ok:'Excluir'}))return;const id=b.closest('figure').dataset.id;await Store.delFile(id);ev.photos=ev.photos.filter(p=>p.fileId!==id);saveEv();redraw()});
};

/* --- Docs --- */
TAB.docs=async(t,ev,redraw)=>{
 const urls=await Promise.all(ev.docs.map(d=>fileURL(d.fileId)));
 t.innerHTML=`<div class="card grid"><div class="row"><label class="f sp"><span>Enviar documentos (pode escolher vários)</span><input type="file" id="dup" multiple></label></div>
 ${ev.docs.length?`<div class="row"><button class="btn pri" id="dpa">${ic('print')} Imprimir todos</button><button class="btn" id="dza">${ic('dl')} Baixar todos (ZIP)</button><span class="muted small">"Imprimir todos" junta PDFs e imagens em um único PDF.</span></div>
 <div>${ev.docs.map((d,i)=>`<div class="li" data-id="${d.fileId}">${ic('file')}<span class="sp" style="overflow-wrap:anywhere"><b>${esc(d.name)}</b><br><span class="muted small">${(d.size/1024).toFixed(0)} KB</span></span><a class="ib" href="${urls[i]}" target="_blank" rel="noopener" aria-label="Abrir">${ic('arrow')}</a><button class="ib" data-dl aria-label="Baixar">${ic('dl')}</button><button class="ib" data-rm aria-label="Excluir">${ic('trash')}</button></div>`).join('')}</div>`:'<div class="empty">Nenhum documento.</div>'}</div>`;
 $('#dup').onchange=async e=>{for(const f of e.target.files){const id=await Store.putFile(f);ev.docs.push({fileId:id,name:f.name,type:f.type,size:f.size})}saveEv();redraw()};
 const doc=el=>ev.docs.find(d=>d.fileId===el.closest('.li').dataset.id);
 $$('[data-dl]',t).forEach(b=>b.onclick=async()=>{const d=doc(b);const bl=await Store.getFile(d.fileId);if(bl)download(d.name,bl)});
 $$('[data-rm]',t).forEach(b=>b.onclick=async()=>{const d=doc(b);if(!await ask(`Excluir "${d.name}"?`,{ok:'Excluir'}))return;await Store.delFile(d.fileId);ev.docs=ev.docs.filter(x=>x!==d);saveEv();redraw()});
 if(!ev.docs.length)return;
 $('#dza').onclick=async()=>{if(!window.JSZip){toast('O gerador de ZIP não carregou.');return}const z=new JSZip();for(const d of ev.docs){const b=await Store.getFile(d.fileId);if(b)z.file(d.name,b)}download('Documentos_'+ev.name.replace(/\s+/g,'_')+'.zip',await z.generateAsync({type:'blob'}))};
 $('#dpa').onclick=async()=>{
  if(!window.PDFLib){toast('O gerador de PDF não carregou. Use "Baixar todos".');return}
  const {PDFDocument}=PDFLib;const out=await PDFDocument.create();const skip=[];
  for(const d of ev.docs){const b=await Store.getFile(d.fileId);if(!b)continue;const buf=await b.arrayBuffer();const n=d.name.toLowerCase();
   try{if(d.type==='application/pdf'||n.endsWith('.pdf')){const src=await PDFDocument.load(buf,{ignoreEncryption:true});(await out.copyPages(src,src.getPageIndices())).forEach(p=>out.addPage(p))}
    else if(/png$/.test(d.type)||n.endsWith('.png')||/jpe?g/.test(d.type)||/\.jpe?g$/.test(n)){const img=/png/.test(d.type)||n.endsWith('.png')?await out.embedPng(buf):await out.embedJpg(buf);const pg=out.addPage([595,842]);const s=Math.min(555/img.width,802/img.height,1);pg.drawImage(img,{x:(595-img.width*s)/2,y:(842-img.height*s)/2,width:img.width*s,height:img.height*s})}
    else skip.push(d.name)}catch(e){skip.push(d.name)}}
  if(!out.getPageCount()){toast('Nenhum PDF ou imagem para imprimir.');return}
  const bytes=await out.save();const blob=new Blob([bytes],{type:'application/pdf'});const url=URL.createObjectURL(blob);
  modal(`${mhead('Imprimir todos')}<p>${out.getPageCount()} página(s) reunidas em um PDF.${skip.length?` Ficaram de fora (formato não imprimível aqui): ${skip.map(esc).join(', ')}.`:''}</p><div class="row"><a class="btn pri" href="${url}" target="_blank" rel="noopener">${ic('print')} Abrir PDF para imprimir</a><button class="btn" id="dpd">${ic('dl')} Baixar PDF</button></div>`);
  $('#dpd').onclick=()=>download('Docs_'+ev.name.replace(/\s+/g,'_')+'.pdf',blob)};
};

/* --- Chat --- */
TAB.chat=(t,ev,redraw)=>{
 t.innerHTML=`<div class="card grid"><div class="chat" id="chl">${ev.chat.length?ev.chat.map(m=>`<div class="msg ${m.userId===ME.id?'me':''}"><div class="meta">${esc(m.user)} · ${new Date(m.ts).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</div>${esc(m.text).replace(/\n/g,'<br>')}</div>`).join(''):'<div class="empty">Nenhuma mensagem. Use o chat para tirar dúvidas sobre o evento.</div>'}</div>
 <form class="row" id="chf" style="flex-wrap:nowrap"><label class="sp"><textarea name="m" rows="1" style="min-height:44px" placeholder="Escreva uma mensagem" aria-label="Mensagem"></textarea></label><button class="btn pri">Enviar</button></form></div>`;
 const l=$('#chl');l.scrollTop=l.scrollHeight;const f=$('#chf');
 f.m.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();f.requestSubmit()}};
 f.onsubmit=e=>{e.preventDefault();const v=f.m.value.trim();if(!v)return;ev.chat.push({id:uid(),userId:ME.id,user:ME.name,text:v,ts:Date.now()});saveEv();redraw();$('#chf [name=m]').focus()};
};

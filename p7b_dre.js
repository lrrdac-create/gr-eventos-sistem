
/* ================= DRE e valor da empresa ================= */
const DRE_CATS=[['auto','Automático'],['receita','Receita bruta'],['deducao','Deduções e impostos sobre venda'],['csp','CSP · custo do serviço (eventos)'],['despesa','Despesas operacionais (fixas)'],['financeiro','Resultado financeiro e IR/CSLL'],['fora','Fora da DRE (empréstimo, aporte, retirada de sócios)']];
const dreName=k=>(DRE_CATS.find(x=>x[0]===k)||[,k])[1];
function dreCat(c){
 if(c.dre&&c.dre!=='auto')return c.dre;
 if(c.type==='entrada')return 'receita';
 const t=norm([c.costType,c.desc].join(' '));
 if(/\b(das|iss|pis|cofins|simples nacional|imposto sobre venda|nota fiscal)\b/.test(t))return 'deducao';
 if(/\b(irpj|csll|juros|tarifa|taxa de maquin|maquininha|antecipacao|iof|boleto)\b/.test(t))return 'financeiro';
 if(c.eventId)return 'csp';
 return 'despesa';
}
const dreCfg=()=>Object.assign({mode:'auto',rate:10,basis:'previsto',mults:[3,4,5],caixa:0,dividas:0},S.settings.dre||{});
function dreCalc(list){
 const cfg=dreCfg();
 const ok=c=>cfg.basis==='previsto'||(c.type==='entrada'?c.status==='RECEBIDO':c.status==='pago');
 const L=list.filter(ok),sumC=(k,t)=>L.filter(c=>dreCat(c)===k&&(!t||c.type===t)).reduce((s,c)=>s+(c.type==='entrada'?1:-1)*num(c.value),0);
 const rb=sumC('receita');
 const dedL=-sumC('deducao');
 const useL=cfg.mode==='lancamentos'||(cfg.mode==='auto'&&dedL>0);const ded=useL?dedL:rb*num(cfg.rate)/100;
 const rl=rb-ded,csp=-sumC('csp'),lb=rl-csp,desp=-sumC('despesa'),ebit=lb-desp,fin=-sumC('financeiro'),ll=ebit-fin;
 return {rb,ded,dedL,rl,csp,lb,desp,ebit,fin,ll,mb:rl?lb/rl:NaN,mo:rb?ebit/rb:NaN,ml:rb?ll/rb:NaN,ign:!useL?L.filter(c=>dreCat(c)==='deducao').length:0,useL,fora:L.filter(c=>dreCat(c)==='fora').length};
}
function dreRows(d,cfg){return [
 ['1','Receita bruta (faturamento)',d.rb,'Valor total cobrado dos clientes.','top'],
 ['2','(−) Deduções e impostos sobre venda',-d.ded,d.useL?'Impostos sobre venda lançados no caixa (ICMS, Receita Federal, DIFAL…).':`Estimado a ${num(cfg.rate).toLocaleString('pt-BR')}% da receita bruta, porque não há impostos sobre venda lançados no período.`],
 ['3','(=) Receita líquida',d.rl,'O que efetivamente entra para cobrir os gastos dos eventos e da empresa.','sub'],
 ['4','(−) CSP · custo do serviço prestado',-d.csp,'Tudo que só existe porque o evento aconteceu: espaço, buffet, equipe temporária, som, luz, decoração.'],
 ['5','(=) Lucro bruto',d.lb,`Margem bruta de ${pct(d.mb)} sobre a receita líquida.`,'sub'],
 ['6','(−) Despesas operacionais (fixas)',-d.desp,'Escritório, equipe fixa, internet, software, contabilidade, marketing.'],
 ['7','(=) Lucro operacional (EBIT)',d.ebit,`Margem operacional de ${pct(d.mo)}. Mostra se a empresa é saudável e eficiente.`,'sub'],
 ['8','(−) Resultado financeiro e IR/CSLL',-d.fin,'Taxas de maquininha e boleto, juros de antecipação e impostos sobre o lucro.'],
 ['9','(=) Lucro líquido',d.ll,`Margem líquida de ${pct(d.ml)}. O que sobra para os sócios ou para a reserva.`,'end']]}
function dreHTML(d,title){const cfg=dreCfg();
 return `<section class="card grid" style="gap:12px"><div class="row"><div><p class="small" style="color:var(--or2);font-weight:800">DRE · Demonstração do Resultado</p><h2>${esc(title)}</h2></div><span class="sp"></span>
  <div class="seg" title="Base de cálculo"><button data-db="previsto" class="${cfg.basis==='previsto'?'on':''}">Previsto</button><button data-db="realizado" class="${cfg.basis==='realizado'?'on':''}">Realizado</button></div>
  <button class="btn sm" id="dcfg">${ic('edit')} Impostos e categorias</button></div>
 <div class="dl" style="padding:0 4px 4px;border:0"><span></span><span></span><span class="num muted small">Valor</span><span class="num muted small">% receita bruta</span></div><div class="dre">${dreRows(d,cfg).map(r=>`<div class="dl ${r[4]||''}"><span class="dn">${r[0]}</span><div><b>${r[1]}</b><div class="muted small">${r[3]}</div></div><span class="num dv" style="${r[2]<0?'color:var(--bad)':r[4]==='end'||r[4]==='sub'?(r[2]<0?'color:var(--bad)':'color:var(--ok)'):''}">${r[2]<0?'− '+brl(-r[2]):brl(r[2])}</span><span class="num dp muted small">${d.rb?pct(r[2]/d.rb):''}</span></div>`).join('')}</div>
 ${d.ign?`<p class="small" style="color:var(--warn)">${d.ign} lançamento(s) de imposto sobre venda não entram porque a dedução está pela alíquota. Mude em "Impostos e categorias" para usar os lançamentos.</p>`:''}
 ${d.fora?`<p class="small muted">${d.fora} lançamento(s) marcados como fora da DRE (empréstimos, aportes, retiradas) não entram no resultado, só no caixa.</p>`:''}
 <p class="small muted">Base: ${cfg.basis==='previsto'?'todos os lançamentos do período (previsto)':'só o que foi recebido e pago (realizado)'}. Cada lançamento entra numa linha pela categoria DRE: saídas de evento vão para CSP, as demais para despesas fixas, e você pode trocar no lançamento.</p></section>`}
const dreCfg2=()=>{const c=dreCfg();return Object.assign({years:3,refMargin:20,revSrc:'auto'},c)};
function realMargins(){const ys=[...new Set(S.cash.map(c=>+String(c.date).slice(0,4)).filter(Boolean))];return ys.map(y=>{const cash=S.cash.filter(x=>cxIn(x,y,null)),d=dreCalc(cash);return {y,ok:d.rb>0&&cash.some(x=>x.type==='saida'&&dreCat(x)!=='fora'),mg:d.rb?d.ebit/d.rb:0}}).filter(r=>r.ok)}
function yearBase(y){
 const c=dreCfg2(),cash=S.cash.filter(x=>cxIn(x,y,null)),d=dreCalc(cash);
 const hasCosts=cash.some(x=>x.type==='saida'&&!['fora'].includes(dreCat(x)));
 const bud=S.budgets.filter(b=>b.status==='FECHADO'&&bYear(b)===y).reduce((s,b)=>s+budgetClosed(b),0);
 const h=(S.history||[]).find(r=>+r.year===y)||{};const hClosed=num(h.closed),hProfit=num(h.profit);
 let rev=0,rsrc='';
 const opts={caixa:d.rb,orcamentos:bud,historico:hClosed};
 if(c.revSrc==='caixa'){rev=d.rb;rsrc='Fluxo de Caixa'}else if(c.revSrc==='orcamentos'){rev=bud;rsrc='Orçamentos fechados'}else if(c.revSrc==='historico'){rev=hClosed;rsrc='Histórico por ano'}
 else{const best=Object.entries(opts).sort((a,b)=>b[1]-a[1])[0];rev=best[1];rsrc={caixa:'Fluxo de Caixa',orcamentos:'Orçamentos fechados',historico:'Histórico por ano'}[best[0]]}
 let mg,msrc;
 if(d.rb>0&&hasCosts){mg=d.ebit/d.rb;msrc='DRE do caixa'}
 else if(hClosed>0&&hProfit>0){mg=hProfit/hClosed;msrc='Histórico (lucro ÷ fechado)'}
 else{const real=realMargins();if(real.length){mg=real.reduce((a,b)=>a+b.mg,0)/real.length;msrc='Média dos anos com DRE ('+real.map(r=>r.y).join(', ')+')'}else{mg=num(c.refMargin)/100;msrc='Margem de referência'}}
 return {y,rev,rsrc,mg,msrc,ebit:rev*mg,d,hasCash:cash.length>0,hasCosts,bud,hClosed}
}
function multiYear(endY){const c=dreCfg2(),n=Math.max(1,Math.min(6,Math.round(num(c.years)||3)));const ys=[];for(let y=endY-n+1;y<=endY;y++)ys.push(yearBase(y));
 const used=ys.filter(x=>x.rev>0);const wsum=used.reduce((s,x,i)=>s+(i+1),0);
 const ebitN=wsum?used.reduce((s,x,i)=>s+x.ebit*(i+1),0)/wsum:0;
 const first=used[0],last=used[used.length-1];const span=used.length>1?last.y-first.y:0;
 const cagr=span>0&&first.rev>0?Math.pow(last.rev/first.rev,1/span)-1:NaN;
 return {ys,used,ebitN,cagr,n}}
function dreCompare(endY){const M=multiYear(endY);
 const lines=[['Receita bruta','rb'],['(−) Deduções','ded',-1],['(=) Receita líquida','rl'],['(−) CSP','csp',-1],['(=) Lucro bruto','lb'],['(−) Despesas fixas','desp',-1],['(=) EBIT','ebit'],['(=) Lucro líquido','ll'],['Margem operacional','mo','%'],['Margem líquida','ml','%']];
 const f=(v,k)=>k==='%'?pct(v):v?((v<0?'− ':'')+brl(Math.abs(v))):'—';
 const varc=(a,b)=>a&&b?((b-a)/Math.abs(a)):NaN;
 return `<section class="card grid" style="gap:12px"><div class="row"><div><p class="small" style="color:var(--or2);font-weight:800">DRE comparativa</p><h2>${M.ys[0].y} a ${endY}</h2></div><span class="sp"></span><span class="small muted">${M.n} anos · ajuste em "Impostos e categorias"</span></div>
 <div class="scroll"><table class="dret"><thead><tr><th>Pelo Fluxo de Caixa</th>${M.ys.map(x=>`<th class="num">${x.y}</th>`).join('')}${M.ys.length>1?`<th class="num">Var. ${M.ys[M.ys.length-2].y}→${endY}</th>`:''}</tr></thead><tbody>
 ${lines.map(([n,k,s])=>`<tr class="${n.startsWith('(=)')?'sub':''}"><td class="nw"><b>${n}</b></td>${M.ys.map(x=>{if(!x.hasCash)return '<td class="num muted">—</td>';const v=s===-1?-x.d[k]:x.d[k];return `<td class="num" style="${typeof v==='number'&&v<0?'color:var(--bad)':''}">${f(v,s)}</td>`}).join('')}${M.ys.length>1?(()=>{const a=M.ys[M.ys.length-2],b=M.ys[M.ys.length-1];if(s==='%'||!a.hasCash||!b.hasCash)return '<td></td>';const vv=varc(a.d[k],b.d[k]);return `<td class="num small" style="color:${vv<0?'var(--bad)':'var(--ok)'}">${isFinite(vv)?(vv>0?'+':'')+pct(vv):'—'}</td>`})():''}</tr>`).join('')}
 </tbody></table></div>
 <h3 style="margin-top:4px">Base usada para o valor da empresa</h3>
 <div class="scroll"><table class="dret"><thead><tr><th></th>${M.ys.map(x=>`<th class="num">${x.y}</th>`).join('')}</tr></thead><tbody>
  <tr><td><b>Receita do ano</b></td>${M.ys.map(x=>`<td class="num">${x.rev?brl(x.rev):'—'}<div class="small muted">${x.rev?esc(x.rsrc):'sem dados'}</div></td>`).join('')}</tr>
  <tr><td><b>Margem operacional</b></td>${M.ys.map(x=>`<td class="num">${x.rev?pct(x.mg):'—'}<div class="small muted">${x.rev?esc(x.msrc):''}</div></td>`).join('')}</tr>
  <tr class="sub"><td><b>EBIT do ano</b></td>${M.ys.map(x=>`<td class="num"><b>${x.rev?brl(x.ebit):'—'}</b></td>`).join('')}</tr>
  <tr><td><b>Peso na média</b></td>${M.ys.map(x=>{const i=M.used.indexOf(x);return `<td class="num small">${i<0?'fora':(i+1)+'×'}</td>`}).join('')}</tr>
 </tbody></table></div>
 <p class="small muted">A receita de cada ano vem da fonte com o maior valor entre Fluxo de Caixa, Orçamentos fechados e Histórico por ano (assim, um ano com poucos lançamentos no caixa não fica subestimado). A margem vem da DRE do caixa quando o ano tem custos lançados; senão, do lucro do Histórico; senão, da média das margens dos anos que têm DRE completa; e, sem nada disso, da margem de referência de ${pct(num(dreCfg2().refMargin)/100)}. Os anos mais recentes pesam mais na média.</p>
 </section>`}
function valuationHTML(endY){
 const cfg=dreCfg2(),M=multiYear(endY);
 const m=cfg.mults.map(num),net=num(cfg.caixa)-num(cfg.dividas);
 const ev=m.map(x=>Math.max(0,M.ebitN*x)),eq=ev.map(x=>x+net);
 const est=M.used.some(x=>x.msrc==='Margem de referência');
 return `<section class="card grid" style="gap:14px;background:var(--ink);color:#F7F3ED;border-color:var(--ink)">
  <div class="row"><div><p class="small" style="color:#E2733A;font-weight:800">Quanto vale a GR Events</p><h2 style="color:#F7F3ED">Valor estimado da empresa</h2></div><span class="sp"></span><button class="btn sm" id="vcfg" style="background:transparent;color:#F7F3ED;border-color:#5A4F44">${ic('edit')} Ajustar</button></div>
  ${M.ebitN>0?`<div class="grid kp" style="gap:10px">${['Conservador','Base','Otimista'].map((n,i)=>`<div style="border:1px solid #3A322B;border-radius:12px;padding:14px;${i===1?'background:#2A231D;border-color:#D45A20':''}"><span class="small" style="color:#CFC4B4;font-weight:700">${n} · ${m[i].toLocaleString('pt-BR')}× EBIT</span><div style="font-family:Archivo,sans-serif;font-weight:900;font-size:clamp(22px,2.6vw,30px);white-space:nowrap">${brl(eq[i])}</div></div>`).join('')}</div>`:
  `<p style="font-size:18px;font-weight:700">Ainda sem dados suficientes de ${M.ys[0].y} a ${endY}.</p><p class="small" style="color:#CFC4B4">Suba os orçamentos fechados, preencha o Histórico por ano ou lance receitas e custos no caixa para a estimativa aparecer.</p>`}
  <div class="small" style="color:#CFC4B4;display:grid;gap:4px">
  <span>EBIT normalizado (média ponderada de ${M.used.length} ano${M.used.length===1?'':'s'}: ${M.used.map(x=>x.y).join(', ')||'—'}): <b style="color:#F7F3ED">${brl(M.ebitN)}</b>${isFinite(M.cagr)?` · Crescimento da receita: <b style="color:#F7F3ED">${(M.cagr>0?'+':'')+pct(M.cagr)} ao ano</b>`:''}</span>
  ${est?`<span style="color:#F2B48A">Atenção: ${M.used.filter(x=>x.msrc==='Margem de referência').map(x=>x.y).join(', ')} usa${M.used.filter(x=>x.msrc==='Margem de referência').length>1?'m':''} a margem de referência de ${pct(num(cfg.refMargin)/100)}, porque não há custos lançados nem lucro no Histórico. Lance os custos ou preencha o lucro do ano para um valor mais certeiro.</span>`:''}
  ${isFinite(M.cagr)?`<span>${M.cagr>=.2?'Crescimento forte: justifica olhar o cenário otimista.':M.cagr<0?'Receita caindo: o cenário conservador é o mais realista.':'Crescimento moderado: o cenário base é a referência.'}</span>`:''}
  <span>Caixa disponível ${brl(cfg.caixa)} − dívidas ${brl(cfg.dividas)} = ${net<0?'−'+brl(-net):brl(net)} somados ao valor.</span>
  <span>Método: valor = EBIT normalizado × múltiplo + caixa − dívidas. Para pequenas empresas de serviço, a referência costuma ficar entre 1 e 4 vezes o lucro anual, e chega a 4–6× o EBITDA em setores de serviço mais estáveis. É uma estimativa de referência, não um laudo: contratos recorrentes, carteira de clientes e quanto a empresa depende do sócio mudam o múltiplo.</span></div>
 </section>`}
function dreSettings(){
 const c=dreCfg2();const m=modal(`${mhead('Impostos, base e valor da empresa')}<form class="grid">
  ${sel('Deduções e impostos sobre venda','mode',[['auto','Automático: usar os lançamentos de imposto; sem eles, a alíquota'],['aliquota','Sempre calcular pela alíquota sobre a receita bruta'],['lancamentos','Sempre usar só os lançamentos de imposto']],c.mode)}
  ${fld('Alíquota sobre a receita (%)','rate',c.rate,'number','step="0.01" min="0"')}
  <h3>Valor da empresa</h3>
  <div class="grid g3">${fld('Anos considerados','years',c.years,'number','min="1" max="6"')}${sel('Receita de cada ano','revSrc',[['auto','Automático (maior fonte)'],['caixa','Só Fluxo de Caixa'],['orcamentos','Só Orçamentos fechados'],['historico','Só Histórico por ano']],c.revSrc)}${fld('Margem de referência (%)','refMargin',c.refMargin,'number','step="0.1" min="0" max="100"')}</div>
  <p class="muted small">A margem de referência só é usada nos anos sem custos lançados no caixa e sem lucro no Histórico.</p>
  <div class="grid g3">${fld('Múltiplo conservador (× EBIT)','m0',c.mults[0],'number','step="0.1" min="0"')}${fld('Múltiplo base','m1',c.mults[1],'number','step="0.1" min="0"')}${fld('Múltiplo otimista','m2',c.mults[2],'number','step="0.1" min="0"')}</div>
  <div class="grid g2">${fld('Caixa disponível hoje (R$)','caixa',String(c.caixa).replace('.',','),'text','inputmode="decimal"')}${fld('Dívidas e empréstimos (R$)','dividas',String(c.dividas).replace('.',','),'text','inputmode="decimal"')}</div>
  <p class="muted small">Para mudar a linha da DRE de um lançamento, abra o lançamento no Fluxo de Caixa e escolha a "Categoria DRE".</p>
  <div class="row"><span class="sp"></span><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri">Salvar</button></div></form>`);
 m.querySelector('form').onsubmit=e=>{e.preventDefault();const d=formData(e.target);S.settings.dre={...c,mode:d.mode,rate:num(d.rate),years:Math.max(1,Math.min(6,Math.round(num(d.years)||3))),revSrc:d.revSrc,refMargin:num(d.refMargin),mults:[num(d.m0),num(d.m1),num(d.m2)],caixa:num(d.caixa),dividas:num(d.dividas)};save('settings');closeModal();route()};
}
function dreYearTable(y){
 const cfg=dreCfg(),ms=MES.map((_,i)=>dreCalc(S.cash.filter(c=>cxIn(c,y,i)))),tot=dreCalc(S.cash.filter(c=>cxIn(c,y,null)));
 const keys=[['Receita bruta','rb'],['(−) Deduções','ded',-1],['(=) Receita líquida','rl'],['(−) CSP','csp',-1],['(=) Lucro bruto','lb'],['(−) Despesas fixas','desp',-1],['(=) EBIT','ebit'],['(−) Financeiro e IR/CSLL','fin',-1],['(=) Lucro líquido','ll'],['Margem líquida','ml','%']];
 const f=(v,k)=>k==='%'?pct(v):v?((v<0?'−':'')+brl(Math.abs(v)).replace('R$ ','').replace(/,\d\d$/,'')):'—';
 return `<section class="card"><h3 style="margin-bottom:10px">DRE mês a mês · ${y} <span class="muted small">(R$, sem centavos)</span></h3><div class="scroll"><table class="dret"><thead><tr><th></th>${MESC.map(m=>`<th class="num">${m}</th>`).join('')}<th class="num">Ano</th></tr></thead><tbody>
 ${keys.map(([n,k,s])=>`<tr class="${n.startsWith('(=)')?'sub':''}"><td class="nw"><b>${n}</b></td>${[...ms,tot].map(d=>{const v=s===-1?-d[k]:d[k];return `<td class="num" style="${typeof v==='number'&&v<0?'color:var(--bad)':''}">${f(v,s)}</td>`}).join('')}</tr>`).join('')}
 </tbody></table></div></section>`}

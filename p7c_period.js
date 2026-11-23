
/* ================= período dos orçamentos ================= */
const bYear=b=>+b.year||+(b.date||'').slice(0,4);
const perCfg=()=>Object.assign({mode:'all',year:new Date().getFullYear(),from:'',to:''},S.settings.budPeriod||{});
function budInPeriod(b){const p=perCfg(),d=b.date||'';
 if(p.mode==='all')return true;
 if(p.mode==='year')return bYear(b)===+p.year;
 if(p.mode==='month')return d.slice(0,7)===today().slice(0,7);
 if(p.mode==='custom')return (!p.from||d>=p.from)&&(!p.to||d<=p.to);
 return true}
function perLabel(){const p=perCfg();return p.mode==='all'?'Todo o período':p.mode==='year'?'Ano de '+p.year:p.mode==='month'?MES[new Date().getMonth()]+' de '+new Date().getFullYear():`${p.from?fdate(p.from):'início'} a ${p.to?fdate(p.to):'hoje'}`}
function periodBar(){const p=perCfg();const ys=[...new Set([new Date().getFullYear(),...S.budgets.map(bYear).filter(Boolean)])].sort((a,b)=>b-a);
 const v=p.mode==='year'?'y'+p.year:p.mode;
 return `<div class="row perbar" style="gap:8px"><label class="f" style="width:210px"><span>Período</span><select data-per>${[['all','Todo o período'],['month','Este mês'],...ys.map(y=>['y'+y,'Ano de '+y]),['custom','Escolher datas…']].map(o=>`<option value="${o[0]}" ${o[0]===v?'selected':''}>${o[1]}</option>`).join('')}</select></label>
  ${p.mode==='custom'?`<label class="f" style="width:170px"><span>De</span><input type="date" data-pf value="${esc(p.from)}"></label><label class="f" style="width:170px"><span>Até</span><input type="date" data-pt value="${esc(p.to)}"></label>`:''}</div>`}
function bindPeriod(root,after){
 const s=root.querySelector('[data-per]');if(!s)return;
 s.onchange=()=>{const p=perCfg();const x=s.value;if(x.startsWith('y')){p.mode='year';p.year=+x.slice(1)}else{p.mode=x;if(x==='custom'&&!p.from){p.from=new Date().getFullYear()+'-01-01';p.to=today()}}S.settings.budPeriod=p;save('settings');after()};
 const f=root.querySelector('[data-pf]'),t=root.querySelector('[data-pt]');
 if(f)f.onchange=()=>{const p=perCfg();p.from=f.value;S.settings.budPeriod=p;save('settings');after()};
 if(t)t.onchange=()=>{const p=perCfg();p.to=t.value;S.settings.budPeriod=p;save('settings');after()};
}


/* ================= nuvem (Supabase) ================= */
const SB_URL='https://fbuaaxgabbdfyrtjqurw.supabase.co';
const SB_KEY='sb_publishable_IOAYXQv6jDmBOF5xKemg6g_-fiV4aIn';
let sb=null;
function sbInit(){
 if(sb)return sb;
 if(!window.supabase||!window.supabase.createClient)return null;
 sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 return sb;
}
const Cloud={
 on:false,
 async get(k){
  const r=await sb.from('kv').select('value').eq('key',k).maybeSingle();
  if(r.error)throw r.error;
  return r.data?r.data.value:undefined;
 },
 async set(k,v){
  const r=await sb.from('kv').upsert({key:k,value:v===undefined?null:JSON.parse(JSON.stringify(v)),updated_at:new Date().toISOString()});
  if(r.error)toast('Não foi possível salvar na nuvem: '+(r.error.message||''));
 },
 async putFile(blob,name){
  const ext=(name||blob.name||'').split('.').pop();
  const id='f_'+uid()+(ext&&ext.length<6?'.'+ext.toLowerCase():'');
  const r=await sb.storage.from('files').upload(id,blob,{contentType:blob.type||'application/octet-stream',upsert:true});
  if(r.error){toast('Não foi possível enviar o arquivo: '+(r.error.message||''));return ''}
  return id;
 },
 async getFile(id){
  if(!id)return null;
  const r=await sb.storage.from('files').download(id);
  return r.data||null;
 },
 async delFile(id){if(id)await sb.storage.from('files').remove([id])}
};

/* perfil de quem entrou */
async function loadMe(){
 const u=(await sb.auth.getUser()).data.user;
 if(!u)return null;
 const r=await sb.from('profiles').select('id,email,name,role').eq('id',u.id).maybeSingle();
 if(r.error||!r.data)return {blocked:true,email:u.email};
 return r.data;
}
async function sbSignIn(email,pw){
 const r=await sb.auth.signInWithPassword({email:email.trim(),password:pw});
 if(r.error)throw r.error;
 return r.data;
}
async function sbSignUp(email,pw){
 const r=await sb.auth.signUp({email:email.trim(),password:pw});
 if(r.error)throw r.error;
 return r.data;
}
const authMsg=e=>{
 const m=(e&&e.message||'').toLowerCase();
 if(m.includes('invalid login'))return 'E-mail ou senha incorretos.';
 if(m.includes('email not confirmed'))return 'Confirme o e-mail pelo link que enviamos antes de entrar.';
 if(m.includes('already registered')||m.includes('already been registered'))return 'Esse e-mail já tem acesso. Use "Entrar".';
 if(m.includes('password'))return 'A senha precisa ter pelo menos 6 caracteres.';
 if(m.includes('rate'))return 'Muitas tentativas. Espere um minuto e tente de novo.';
 return e&&e.message?e.message:'Não foi possível concluir.';
};

/* recarrega os dados da nuvem (outra pessoa pode ter mudado) */
let syncing=false;
async function cloudReload(render){
 if(!Cloud.on||syncing)return;
 syncing=true;
 try{
  const r=await sb.from('kv').select('key,value');
  if(!r.error&&r.data){
   let ch=false;
   r.data.forEach(row=>{
    if(!KEYS.includes(row.key))return;
    const nv=JSON.stringify(row.value),ov=JSON.stringify(S[row.key]);
    if(nv!==ov){S[row.key]=row.value;ch=true}
   });
   if(ch&&render&&ME&&!document.querySelector('#modal.on')){await preloadPhotos();route()}
  }
 }catch(e){}
 syncing=false;
}

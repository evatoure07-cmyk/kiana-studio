
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.76.1/+esm';
const dbClient=createClient('https://foebmwxururqumoksijb.supabase.co','sb_publishable_4BmRGULwEsoz5dNqQVhiXg_rnF6sEH0',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
let member=null,profile=null,requestedPhone='',communityPosts=[],likes=new Map(),myLiked=new Set(),pendingImage=null,loading=false;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const isMod=()=>!!member?.app_metadata?.kiana_admin;
const notice=(s)=>window.toast?.(s);
const photoPath=(id)=>'https://foebmwxururqumoksijb.supabase.co/storage/v1/object/';
const heart='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.8 4.6c-2.1-2.1-5.4-2.1-7.5 0L12 5.9l-1.3-1.3c-2.1-2.1-5.4-2.1-7.5 0s-2.1 5.4 0 7.5L12 20.9l8.8-8.8c2.1-2.1 2.1-5.4 0-7.5z"/></svg>';
function navigateMember(){location.hash='account'}
function submitBusy(active){loading=active;document.querySelectorAll('[data-kiana-submit]').forEach(b=>b.disabled=active)}
function normalizePhone(value){
 const s=String(value||'').replace(/[\s().-]/g,'');
 return /^\+[1-9]\d{7,14}$/.test(s)?s:null
}
async function signedImages(posts){
 return Promise.all(posts.map(async p=>{
  const {data,error}=await dbClient.storage.from('kiana-outfits').createSignedUrl(p.image_path,900);
  return {...p,url:!error?data?.signedUrl:null}
 }))
}
async function loadFeed(){
 const el=$('community-grid');if(!el)return;
 el.innerHTML='<div class="community-loading">Découverte des outfits… ♡</div>';
 const {data,error}=await dbClient.from('kiana_community_posts').select('id,user_id,image_path,caption,created_at').eq('status','approved').order('created_at',{ascending:false}).limit(60);
 if(error){el.innerHTML='<div class="notice">Impossible de charger la communauté pour le moment.</div>';return}
 communityPosts=await signedImages(data||[]);
 const ids=communityPosts.map(p=>p.id);
 likes.clear();myLiked.clear();
 if(ids.length){
  const {data:likesData}=await dbClient.from('kiana_community_likes').select('post_id,user_id').in('post_id',ids);
  (likesData||[]).forEach(v=>{likes.set(v.post_id,(likes.get(v.post_id)||0)+1);if(member?.id===v.user_id)myLiked.add(v.post_id)});
 }
 let names=new Map();
 const users=[...new Set(communityPosts.map(p=>p.user_id))];
 if(users.length){const {data:profiles}=await dbClient.from('kiana_community_profiles').select('user_id,display_name').in('user_id',users);names=new Map((profiles||[]).map(p=>[p.user_id,p.display_name]))}
 el.innerHTML=communityPosts.length?communityPosts.map(p=>
 '<article class="community-card"><img class="community-image" loading="lazy" alt="Outfit de '+esc(names.get(p.user_id)||'un membre')+'" src="'+esc(p.url||'')+'"><div class="community-card-body"><span class="eyebrow">OUTFIT DIARY ✦</span><h3>'+esc(names.get(p.user_id)||'Membre KIANA')+'</h3>'+
 '<p>'+esc(p.caption||'Mon outfit du jour ♡')+'</p><div class="community-meta"><small class="muted">'+new Date(p.created_at).toLocaleDateString('fr-FR')+'</small>'+
 '<button type="button" class="community-like '+(myLiked.has(p.id)?'liked':'')+'" data-community-like="'+esc(p.id)+'" aria-label="'+(myLiked.has(p.id)?'Retirer mon like':'Aimer cette photo')+'" title="'+(member?'':'Connecte-toi pour liker')+'">'+heart+' <span>'+(likes.get(p.id)||0)+'</span></button></div></div></article>').join(''):
 '<div class="panel" style="grid-column:1/-1;text-align:center"><h3 class="serif">Le dressing de la communauté ouvre bientôt ♡</h3><p class="muted">Sois la première personne à proposer ton outfit !</p></div>';
}
function renderAuth(){
 const el=$('community-auth');if(!el)return;
 if(member){
 el.innerHTML='<span class="eyebrow">MEMBRE KIANA STUDIO</span><h3 class="account-name">'+esc(profile?.display_name||'Mon espace')+' ♡</h3>'+
 '<p class="muted">Ton numéro vérifié reste privé. Tu peux publier une photo et aimer celles de la communauté.</p>'+
 '<div class="admin-actions"><button class="btn btn-primary" id="community-post-from-account">+ PARTAGER MON OUTFIT</button><button class="btn" id="community-logout">SE DÉCONNECTER</button></div>';
 $('community-logout').onclick=signOut;
 $('community-post-from-account').onclick=openPublish;
 }else{
 el.innerHTML='<div><span class="eyebrow">REJOINS LA KIANA FAMILY</span><h3 class="serif" style="font-size:2rem;margin:12px 0">'+(requestedPhone?'Vérifie ton téléphone ♡':'Crée ton compte ♡')+'</h3>'+
 (requestedPhone?
 '<form id="community-otp-form"><p class="muted">Code envoyé au '+esc(requestedPhone)+'.</p><label for="community-otp">Code de vérification SMS</label><input class="field" id="community-otp" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required placeholder="6 chiffres"><button class="btn btn-primary" data-kiana-submit>VALIDER LE CODE</button><button class="btn" type="button" id="community-new-phone" style="margin-left:8px">CHANGER LE NUMÉRO</button></form>':
 '<form id="community-phone-form"><label for="community-phone">Numéro de téléphone avec indicatif *</label><input class="field" type="tel" id="community-phone" required placeholder="+33 6 12 34 56 78" autocomplete="tel"><label for="community-name">Pseudo public (visible sur les photos) *</label><input class="field" id="community-name" maxlength="40" minlength="2" required placeholder="Ex. Kiana.S"><button class="btn btn-primary" data-kiana-submit>RECEVOIR UN CODE SMS ↗</button></form>')+
 '<p class="auth-alt">Ton téléphone sert à vérifier ton compte. Il n’est pas affiché dans la galerie. Aucun like sans connexion.</p></div>';
 const first=$('community-phone-form');if(first)first.onsubmit=requestCode;
 const second=$('community-otp-form');if(second)second.onsubmit=verifyCode;
 const change=$('community-new-phone');if(change)change.onclick=()=>{requestedPhone='';renderAuth()};
 }
}
async function requestCode(e){
 e.preventDefault();if(loading)return;
 const phone=normalizePhone($('community-phone').value);
 const name=$('community-name').value.trim();
 if(!phone){notice('Entre un vrai numéro international, par exemple +33612345678.');return}
 if(name.length<2||name.length>40){notice('Choisis un pseudo entre 2 et 40 caractères.');return}
 sessionStorage.setItem('kiana-pending-name',name);
 submitBusy(true);
 const {error}=await dbClient.auth.signInWithOtp({phone,options:{shouldCreateUser:true}});
 submitBusy(false);
 if(error){notice('SMS non envoyé : vérifie que la connexion téléphone et le fournisseur SMS sont activés dans Supabase.');return}
 requestedPhone=phone;renderAuth();notice('Code de vérification demandé ♡')
}
async function verifyCode(e){
 e.preventDefault();if(loading)return;
 submitBusy(true);
 const {data,error}=await dbClient.auth.verifyOtp({phone:requestedPhone,token:$('community-otp').value.trim(),type:'sms'});
 submitBusy(false);
 if(error||!data.user){notice('Code incorrect ou expiré.');return}
 member=data.user;requestedPhone='';
 await ensureProfile(sessionStorage.getItem('kiana-pending-name')||'Membre KIANA');
 sessionStorage.removeItem('kiana-pending-name');
 renderAuth();await renderOwnPosts();await loadFeed();notice('Ton compte est connecté ♡')
}
async function ensureProfile(initialName){
 if(!member)return;
 const {data}=await dbClient.from('kiana_community_profiles').select('user_id,display_name').eq('user_id',member.id).maybeSingle();
 if(data){profile=data;return}
 const name=initialName.trim().slice(0,40);
 const {data:saved,error}=await dbClient.from('kiana_community_profiles').insert({user_id:member.id,display_name:name.length>=2?name:'Membre KIANA'}).select().single();
 if(error){notice('Compte connecté, mais le profil n’a pas été enregistré.');return}
 profile=saved
}
async function signOut(){await dbClient.auth.signOut();member=null;profile=null;renderAuth();$('community-my-posts').innerHTML='';await loadFeed();notice('Déconnecté ♡')}
function openPublish(){
 if(!member){navigateMember();notice('Connecte-toi pour partager un outfit.');return}
 if(!profile){notice('Ton profil doit être prêt avant de publier.');return}
 pendingImage=null;
 openModal('<span class="eyebrow">COMMUNITY FASHION DIARY</span><h2 class="serif" style="font-size:2.4rem">Partage ton outfit ♡</h2>'+
 '<p class="muted">Ta photo sera visible uniquement après validation de Kiana.</p>'+
 '<form id="community-upload-form" class="community-modal-form"><label>Ton outfit (JPG, PNG ou WebP, max. 5 Mo)</label>'+
 '<div class="community-upload"><input id="community-file" type="file" accept="image/jpeg,image/png,image/webp" required><div id="community-preview"></div></div>'+
 '<label for="community-caption">Petite légende</label><textarea id="community-caption" class="field" maxlength="500" rows="3" placeholder="Une tenue, une vibe…"></textarea>'+
 '<button class="btn btn-primary" data-kiana-submit>ENVOYER POUR VALIDATION ↗</button></form>');
 $('community-file').onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  if(file.size>5*1024*1024||!/^image\/(jpeg|png|webp)$/.test(file.type)){notice('Format ou taille non acceptés.');e.target.value='';return}
  pendingImage=file;
  const imageURL=URL.createObjectURL(file);
  $('community-preview').innerHTML='<img src="'+esc(imageURL)+'" alt="Aperçu de ton outfit">';
  $('community-preview').querySelector('img').onload=()=>URL.revokeObjectURL(imageURL)
 };
 $('community-upload-form').onsubmit=publish
}
async function publish(e){
 e.preventDefault();if(!member||!profile||!pendingImage||loading)return;
 submitBusy(true);
 const file=pendingImage,ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
 const path=member.id+'/'+crypto.randomUUID()+'.'+ext;
 const {error:uploadError}=await dbClient.storage.from('kiana-outfits').upload(path,file,{contentType:file.type,upsert:false});
 if(uploadError){submitBusy(false);notice('Envoi impossible : '+uploadError.message);return}
 const {error}=await dbClient.from('kiana_community_posts').insert({user_id:member.id,image_path:path,caption:$('community-caption').value.trim(),status:'pending'});
 submitBusy(false);
 if(error){await dbClient.storage.from('kiana-outfits').remove([path]);notice('Publication refusée.');return}
 pendingImage=null;closeModal();notice('Photo envoyée ! Kiana doit l’approuver ♡');await renderOwnPosts();if(isMod())await renderModeration()
}
async function renderOwnPosts(){
 const el=$('community-my-posts');if(!el)return;
 if(!member){el.innerHTML='';return}
 const {data,error}=await dbClient.from('kiana_community_posts').select('id,image_path,caption,status,created_at').eq('user_id',member.id).order('created_at',{ascending:false}).limit(30);
 if(error){el.innerHTML='<p class="notice">Tes photos sont momentanément indisponibles.</p>';return}
 el.innerHTML='<h3 class="serif" style="font-size:2rem;margin:24px 0">Mes publications</h3><div class="community-grid">'+
 (await signedImages(data||[])).map(p=>'<article class="community-card"><img class="community-image" src="'+esc(p.url||'')+'" alt="Mon outfit"><div class="community-card-body"><span class="community-status '+esc(p.status)+'">'+({pending:'EN ATTENTE',approved:'PUBLIÉE',rejected:'REFUSÉE'}[p.status]||'')+'</span><p>'+esc(p.caption)+'</p></div></article>').join('')+'</div>'+
 (!(data||[]).length?'<p class="muted">Tu n’as pas encore proposé de photo ♡</p>':'')
}
async function toggleLike(button){
 if(!member){navigateMember();notice('Connecte-toi pour liker les photos ♡');return}
 const id=button.dataset.communityLike;if(!id||button.dataset.busy)return;
 button.dataset.busy='1';const had=myLiked.has(id);
 const result=had?await dbClient.from('kiana_community_likes').delete().eq('post_id',id).eq('user_id',member.id):
 await dbClient.from('kiana_community_likes').insert({post_id:id,user_id:member.id});
 delete button.dataset.busy;
 if(result.error){notice('Impossible d’enregistrer ton like.');return}
 if(had){myLiked.delete(id);likes.set(id,Math.max(0,(likes.get(id)||0)-1))}
 else{myLiked.add(id);likes.set(id,(likes.get(id)||0)+1)}
 button.classList.toggle('liked',!had);button.setAttribute('aria-label',had?'Aimer cette photo':'Retirer mon like');
 button.querySelector('span').textContent=likes.get(id);
 button.classList.remove('burst');void button.offsetWidth;if(!had)button.classList.add('burst')
}
async function renderModeration(){
 const panel=$('admin-body');if(!panel||!isMod()){if(panel)panel.innerHTML='<div class="notice">La modération nécessite un compte administrateur vérifié dans Supabase.</div>';return}
 panel.innerHTML='<span class="eyebrow">KIANA · MODÉRATION</span><h3 class="serif" style="font-size:2.1rem">Outfits à valider ♡</h3><p class="muted">Seules les photos approuvées deviennent publiques.</p><div class="community-moderation" id="community-review-list"><p>Chargement des photos…</p></div>';
 const {data,error}=await dbClient.from('kiana_community_posts').select('id,user_id,image_path,caption,created_at').eq('status','pending').order('created_at',{ascending:true}).limit(50);
 const target=$('community-review-list');if(!target)return;
 if(error){target.innerHTML='<p class="notice">Impossible de charger la modération.</p>';return}
 const posts=await signedImages(data||[]);
 target.innerHTML=posts.map(p=>'<article><img src="'+esc(p.url||'')+'" alt="Outfit en attente"><div class="details"><span class="eyebrow">À VALIDER</span><p>'+esc(p.caption||'Sans légende')+'</p>'+
 '<div class="actions"><button class="btn btn-primary btn-small" data-review="approved" data-post="'+esc(p.id)+'">APPROUVER</button><button class="btn btn-danger btn-small" data-review="rejected" data-post="'+esc(p.id)+'">REFUSER</button></div></div></article>').join('')||'<p class="notice" style="grid-column:1/-1">Aucune photo en attente. ✦</p>'
}
async function review(id,status,button){
 if(!isMod()||!['approved','rejected'].includes(status))return;
 button.disabled=true;
 const {error}=await dbClient.from('kiana_community_posts').update({status,reviewed_at:new Date().toISOString()}).eq('id',id).eq('status','pending');
 if(error){button.disabled=false;notice('Action non autorisée ou impossible.');return}
 notice(status==='approved'?'Photo approuvée ♡':'Photo refusée');
 await renderModeration();await loadFeed()
}
window.kianaCommunityRoute=page=>{
 if(page==='community')loadFeed();
 if(page==='account'){renderAuth();renderOwnPosts()}
};
window.kianaCommunityRenderAdmin=renderModeration;
document.addEventListener('click',e=>{
 const like=e.target.closest('[data-community-like]');if(like){toggleLike(like);return}
 const reviewButton=e.target.closest('[data-review]');if(reviewButton){review(reviewButton.dataset.post,reviewButton.dataset.review,reviewButton);return}
 if(e.target.closest('#community-post-open'))openPublish()
});
const {data:initial}=await dbClient.auth.getUser();member=initial?.user||null;
if(member)await ensureProfile('Membre KIANA');
dbClient.auth.onAuthStateChange((event,session)=>{
 member=session?.user||null;
 if(event==='SIGNED_OUT')profile=null;
 setTimeout(()=>{
  renderAuth();
  if(location.hash==='#community')void loadFeed();
  if(location.hash==='#account')void renderOwnPosts();
 },0);
});
renderAuth();if(location.hash==='#community')await loadFeed();if(location.hash==='#account')await renderOwnPosts();if(location.hash==='#founder'&&document.querySelector('[data-admin-tab="community"].active'))await renderModeration();

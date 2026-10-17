
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.76.1/+esm';
const dbClient=createClient('https://foebmwxururqumoksijb.supabase.co','sb_publishable_4BmRGULwEsoz5dNqQVhiXg_rnF6sEH0',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
window.kianaClient=dbClient;
let member=null,profile=null,authMode='register',communityPosts=[],likes=new Map(),myLiked=new Set(),pendingImage=null,playerColor='#7A0909',loading=false;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const isMod=()=>!!member?.app_metadata?.kiana_admin;
window.kianaMemberUser=()=>member;
window.kianaCurrentProfile=()=>profile;
window.kianaIsFounder=()=>isMod();
const notice=(s)=>window.toast?.(s);
const photoPath=(id)=>'https://foebmwxururqumoksijb.supabase.co/storage/v1/object/';
const heart='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.8 4.6c-2.1-2.1-5.4-2.1-7.5 0L12 5.9l-1.3-1.3c-2.1-2.1-5.4-2.1-7.5 0s-2.1 5.4 0 7.5L12 20.9l8.8-8.8c2.1-2.1 2.1-5.4 0-7.5z"/></svg>';

const outfitColors=[['Rouge cerise','#7A0909'],['Fuchsia','#D91D68'],['Rose framboise','#AC1F58'],['Violet','#6B2588'],['Prune','#372146'],['Bleu électrique','#254CA9'],['Bleu océan','#006D92'],['Émeraude','#08715C'],['Orange','#A64A16'],['Doré','#8A6E16'],['Chocolat','#62352B'],['Noir','#222222']];
const safePlayerColor=value=>outfitColors.some(c=>c[1]===value)?value:'#7A0909';
const skipIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5v14l10-7zM13 5v14l10-7z" fill="currentColor"/></svg>';
function outfitPlayer(p){
 const tone=safePlayerColor(p.player_color);
 const image=p.url?'<img src="'+esc(p.url)+'" alt="Photo de tenue" loading="lazy">':'<div class="outfit-photo-empty">YOUR OUTFIT ♡</div>';
 return '<div class="outfit-player" style="--player-tone:'+tone+'">'+
 '<div class="outfit-player-screen">'+image+'</div><div class="outfit-player-controls">'+
 '<div class="outfit-player-top"><span>KIANA STUDIO</span><span class="outfit-airplay" aria-hidden="true">◎</span></div>'+
 '<div class="outfit-progress"><span></span><i></i></div><div class="outfit-time"><span>1:53</span><span>-1:20</span></div>'+
 '<div class="outfit-transport" aria-hidden="true"><span class="outfit-prev">'+skipIcon+'</span><span class="outfit-pause">Ⅱ</span><span>'+skipIcon+'</span></div>'+
 '<div class="outfit-volume"><span>◖</span><div><i></i></div><span>◗</span></div></div></div>';
}
function kianaRefreshPreview(url){
 const target=$('outfit-live-preview');if(!target)return;
 target.innerHTML=outfitPlayer({url:url||'',player_color:playerColor})
}
document.addEventListener('click',e=>{
 const swatch=e.target.closest('[data-outfit-color]');if(!swatch)return;
 e.preventDefault();
 playerColor=safePlayerColor(swatch.dataset.outfitColor);
 document.querySelectorAll('[data-outfit-color]').forEach(b=>b.classList.toggle('selected',b===swatch));
 const option=outfitColors.find(x=>x[1]===playerColor);
 const label=$('outfit-color-name');if(label)label.textContent=(option?.[0]||'Couleur')+' ✓';
 kianaRefreshPreview($('community-preview')?.querySelector('img')?.src||'')
});

function navigateMember(){location.hash='account'}
function submitBusy(active){loading=active;document.querySelectorAll('[data-kiana-submit]').forEach(b=>b.disabled=active)}
function normalizeRpNumber(value){
 const digits=String(value||'').replace(/[\s\-]/g,'');
 if(!/^\d{7}$/.test(digits))return null;
 return digits.slice(0,3)+'-'+digits.slice(3)
}
function numberLoginEmail(value){
 const normalized=normalizeRpNumber(value);
 return normalized?normalized.replace('-','')+'@kiana-members.example.com':null
}
function authError(error,kind){
 const code=String(error?.code||'');
 if(code==='user_already_exists'||/already registered|already exists/i.test(error?.message||''))return'Ce numéro possède déjà un compte. Utilise « Connexion ».';
 if(code==='weak_password')return'Mot de passe trop simple : choisis au moins 8 caractères avec des chiffres et des lettres.';
 if(code==='email_not_confirmed')return'La confirmation des comptes est encore activée dans Supabase. Kiana doit désactiver « Confirm email » dans les réglages.';
 return kind==='register'?'Impossible de créer le compte. Vérifie les informations.':'Numéro ou mot de passe incorrect.'
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
 const {data,error}=await dbClient.from('kiana_community_posts').select('id,user_id,image_path,caption,created_at,player_color').eq('status','approved').order('created_at',{ascending:false}).limit(60);
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
 '<article class="community-card">'+outfitPlayer(p)+'<div class="community-card-body"><span class="eyebrow">OUTFIT DIARY ✦</span><h3>'+esc(names.get(p.user_id)||'Membre KIANA')+'</h3>'+
 '<p>'+esc(p.caption||'Mon outfit du jour ♡')+'</p><div class="community-meta"><small class="muted">'+new Date(p.created_at).toLocaleDateString('fr-FR')+'</small>'+
 '<button type="button" class="community-like '+(myLiked.has(p.id)?'liked':'')+'" data-community-like="'+esc(p.id)+'" aria-label="'+(myLiked.has(p.id)?'Retirer mon like':'Aimer cette photo')+'" title="'+(member?'':'Connecte-toi pour liker')+'">'+heart+' <span>'+(likes.get(p.id)||0)+'</span></button></div></div></article>').join(''):
 '<div class="panel" style="grid-column:1/-1;text-align:center"><h3 class="serif">Le dressing de la communauté ouvre bientôt ♡</h3><p class="muted">Sois la première personne à proposer ton outfit !</p></div>';
}
function renderAuth(){
 const el=$('community-auth');if(!el)return;
 if(member){
  const first=String(member.user_metadata?.first_name||'').trim();
  el.innerHTML='<span class="eyebrow">MEMBRE KIANA STUDIO</span><h3 class="account-name">'+esc(profile?.display_name||member.user_metadata?.display_name||'Mon espace')+' ♡</h3>'+
  '<p class="muted">'+(first?'Bienvenue '+esc(first)+' ! ':'')+'Ton numéro reste privé. Ton pseudo est affiché sous tes photos.</p>'+
  '<div class="admin-actions"><a href="#profile" class="btn btn-primary">MODIFIER MON PROFIL ♡</a><a href="#myorders" class="btn">MES COMMANDES ↗</a><button class="btn" id="community-post-from-account">+ PARTAGER MON OUTFIT</button><button class="btn" id="community-logout">SE DÉCONNECTER</button></div>';
  $('community-logout').onclick=signOut;
  $('community-post-from-account').onclick=openPublish;
 }else{
  const register=authMode==='register';
  el.innerHTML='<span class="eyebrow">REJOINS LA KIANA FAMILY</span>'+
  '<h3 class="serif" style="font-size:2rem;margin:12px 0">'+(register?'Crée ton compte ♡':'Bon retour ♡')+'</h3>'+
  '<div class="community-auth-tabs" role="group" aria-label="Inscription ou connexion">'+
  '<button class="btn btn-small '+(register?'btn-primary':'')+'" type="button" id="community-register-tab">INSCRIPTION</button>'+
  '<button class="btn btn-small '+(!register?'btn-primary':'')+'" type="button" id="community-login-tab">CONNEXION</button></div>'+
  '<form id="community-member-form">'+
  (register?'<label for="community-first-name">Prénom *</label><input class="field" id="community-first-name" minlength="2" maxlength="40" required autocomplete="given-name" placeholder="Ex. Kiana">'+
  '<label for="community-name">Pseudo public *</label><input class="field" id="community-name" minlength="2" maxlength="40" required autocomplete="nickname" placeholder="Ex. Kiana.Sterling">':'')+
  '<label for="community-phone">Numéro *</label><input class="field" id="community-phone" type="tel" inputmode="tel" required maxlength="8" pattern="[0-9]{3}-?[0-9]{4}" placeholder="444-4444" autocomplete="off">'+
  '<label for="community-password">Mot de passe *</label><input class="field" id="community-password" type="password" minlength="8" maxlength="128" required autocomplete="'+(register?'new-password':'current-password')+'" placeholder="8 caractères minimum">'+
  (register?'<label for="community-password-repeat">Confirmer le mot de passe *</label><input class="field" id="community-password-repeat" type="password" minlength="8" maxlength="128" required autocomplete="new-password" placeholder="Répète ton mot de passe">':'')+
  '<button class="btn btn-primary" data-kiana-submit style="width:100%">'+(register?'CRÉER MON COMPTE ↗':'SE CONNECTER ↗')+'</button></form>'+
  '<p class="auth-alt">Aucun SMS ni e-mail demandé. Exemple de numéro : <b>444-4444</b>. Le numéro est un identifiant de jeu non vérifié ; conserve ton mot de passe car la récupération automatique n’est pas disponible.</p>';
  $('community-register-tab').onclick=()=>{authMode='register';renderAuth()};
  $('community-login-tab').onclick=()=>{authMode='login';renderAuth()};
  $('community-member-form').onsubmit=register?registerMember:loginMember
 }
}
async function registerMember(event){
 event.preventDefault();if(loading)return;
 const first=$('community-first-name').value.trim();
 const name=$('community-name').value.trim();
 const number=normalizeRpNumber($('community-phone').value);
 const password=$('community-password').value;
 if(!number){notice('Indique un numéro de jeu comme 444-4444.');return}
 if(first.length<2||first.length>40){notice('Indique ton prénom (2 à 40 caractères).');return}
 if(name.length<2||name.length>40){notice('Choisis un pseudo de 2 à 40 caractères.');return}
 if(password.length<8){notice('Ton mot de passe doit contenir au moins 8 caractères.');return}
 if(password!==$('community-password-repeat').value){notice('Les mots de passe ne correspondent pas.');return}
 submitBusy(true);
 try{
  const {data,error}=await dbClient.auth.signUp({
   email:numberLoginEmail(number),
   password,
   options:{data:{first_name:first,display_name:name,kiana_rp_number:number}}
  });
  if(error){notice(authError(error,'register'));return}
  if(!data?.session||!data?.user){
   notice('Inscription non terminée : Kiana doit désactiver la confirmation e-mail dans Supabase pour permettre les comptes sans code.');
   return
  }
  member=data.user;await ensureProfile(name);
  renderAuth();await renderOwnPosts();await loadFeed();
  notice('Bienvenue sur KIANA STUDIO, '+first+' ♡')
 }catch{notice('Inscription momentanément indisponible.')}
 finally{submitBusy(false)}
}
async function loginMember(event){
 event.preventDefault();if(loading)return;
 const number=normalizeRpNumber($('community-phone').value);
 const password=$('community-password').value;
 if(!number){notice('Entre ton numéro comme 444-4444.');return}
 submitBusy(true);
 try{
  const {data,error}=await dbClient.auth.signInWithPassword({email:numberLoginEmail(number),password});
  if(error||!data?.user){notice(authError(error,'login'));return}
  member=data.user;
  await ensureProfile(member.user_metadata?.display_name||'Membre KIANA');
  renderAuth();await renderOwnPosts();await loadFeed();
  notice('Connexion réussie ♡')
 }catch{notice('Connexion momentanément indisponible.')}
 finally{submitBusy(false)}
}
async function ensureProfile(initialName){
 if(!member)return;
 const {data}=await dbClient.from('kiana_community_profiles').select('user_id,display_name,first_name,bio,avatar_path').eq('user_id',member.id).maybeSingle();
 if(data){profile=data;window.kianaAuthChanged?.();return}
 const name=initialName.trim().slice(0,40);
 const {data:saved,error}=await dbClient.from('kiana_community_profiles').insert({user_id:member.id,display_name:name.length>=2?name:'Membre KIANA',first_name:String(member.user_metadata?.first_name||'').slice(0,50)}).select().single();
 if(error){notice('Compte connecté, mais le profil n’a pas été enregistré.');return}
 profile=saved;window.kianaAuthChanged?.()
}
async function signOut(){await dbClient.auth.signOut();member=null;profile=null;renderAuth();$('community-my-posts').innerHTML='';window.kianaAuthChanged?.();await loadFeed();notice('Déconnecté ♡')}
function openPublish(){
 if(!member){navigateMember();notice('Connecte-toi pour partager un outfit.');return}
 if(!profile){notice('Ton profil doit être prêt avant de publier.');return}
 pendingImage=null;playerColor='#7A0909';
 openModal('<span class="eyebrow">COMMUNITY FASHION DIARY</span><h2 class="serif" style="font-size:2.4rem">Partage ton outfit ♡</h2>'+
 '<p class="muted">Ta photo sera visible uniquement après validation de Kiana.</p>'+
 '<form id="community-upload-form" class="community-modal-form"><label>Ton outfit (JPG, PNG ou WebP, max. 5 Mo)</label>'+
 '<div class="community-upload"><input id="community-file" type="file" accept="image/jpeg,image/png,image/webp" required><div id="community-preview"></div></div>'+
 '<label>Couleur du lecteur</label><div class="outfit-color-palette" id="outfit-color-palette">'+outfitColors.map(([name,hex])=>'<button type="button" class="outfit-swatch '+(hex===playerColor?'selected':'')+'" data-outfit-color="'+hex+'" style="background:'+hex+'" title="'+name+'" aria-label="'+name+'"></button>').join('')+'</div><div class="outfit-live-label" id="outfit-color-name">Rouge cerise ✓</div><div class="outfit-live-preview" id="outfit-live-preview"></div>'+
 '<label for="community-caption">Petite légende</label><textarea id="community-caption" class="field" maxlength="500" rows="3" placeholder="Une tenue, une vibe…"></textarea>'+
 '<button class="btn btn-primary" data-kiana-submit>ENVOYER POUR VALIDATION ↗</button></form>');
 kianaRefreshPreview();
 $('community-file').onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  if(file.size>5*1024*1024||!/^image\/(jpeg|png|webp)$/.test(file.type)){notice('Format ou taille non acceptés.');e.target.value='';return}
  pendingImage=file;
  const imageURL=URL.createObjectURL(file);
  $('community-preview').innerHTML='<img src="'+esc(imageURL)+'" alt="Aperçu de ton outfit">';
  $('community-preview').querySelector('img').onload=()=>URL.revokeObjectURL(imageURL);
  kianaRefreshPreview(imageURL)
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
 const {error}=await dbClient.from('kiana_community_posts').insert({user_id:member.id,image_path:path,caption:$('community-caption').value.trim(),player_color:safePlayerColor(playerColor),status:'pending'});
 submitBusy(false);
 if(error){await dbClient.storage.from('kiana-outfits').remove([path]);notice('Publication refusée.');return}
 pendingImage=null;closeModal();notice('Photo envoyée ! Kiana doit l’approuver ♡');await renderOwnPosts();if(isMod())await renderModeration()
}
async function renderOwnPosts(){
 const el=$('community-my-posts');if(!el)return;
 if(!member){el.innerHTML='';return}
 const {data,error}=await dbClient.from('kiana_community_posts').select('id,image_path,caption,status,created_at,player_color').eq('user_id',member.id).order('created_at',{ascending:false}).limit(30);
 if(error){el.innerHTML='<p class="notice">Tes photos sont momentanément indisponibles.</p>';return}
 el.innerHTML='<h3 class="serif" style="font-size:2rem;margin:24px 0">Mes publications</h3><div class="community-grid">'+
 (await signedImages(data||[])).map(p=>'<article class="community-card">'+outfitPlayer(p)+'<div class="community-card-body"><span class="community-status '+esc(p.status)+'">'+({pending:'EN ATTENTE',approved:'PUBLIÉE',rejected:'REFUSÉE'}[p.status]||'')+'</span><p>'+esc(p.caption)+'</p></div></article>').join('')+'</div>'+
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
 const {data,error}=await dbClient.from('kiana_community_posts').select('id,user_id,image_path,caption,created_at,player_color').eq('status','pending').order('created_at',{ascending:true}).limit(50);
 const target=$('community-review-list');if(!target)return;
 if(error){target.innerHTML='<p class="notice">Impossible de charger la modération.</p>';return}
 const posts=await signedImages(data||[]);
 target.innerHTML=posts.map(p=>'<article>'+outfitPlayer(p)+'<div class="details"><span class="eyebrow">À VALIDER</span><p>'+esc(p.caption||'Sans légende')+'</p>'+
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
window.kianaUpdateCurrentProfile=(next)=>{profile=next;renderAuth()};
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
  window.kianaAuthChanged?.();
  if(location.hash==='#community')void loadFeed();
  if(location.hash==='#account')void renderOwnPosts();
 },0);
});
renderAuth();window.kianaAuthChanged?.();if(location.hash==='#community')await loadFeed();if(location.hash==='#account')await renderOwnPosts();if(location.hash==='#founder'&&document.querySelector('[data-admin-tab="community"].active'))await renderModeration();

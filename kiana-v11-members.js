/* KIANA STUDIO v11 — member profile, private messages & order history.
 * Bridge to the verified Supabase session in kiana-community.js. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
 const client=()=>window.kianaClient;
 const user=()=>window.kianaMemberUser?.();
 const isAdmin=()=>window.kianaIsFounder?.()===true;
 const toastMsg=msg=>typeof toast==='function'?toast(msg):console.warn(msg);
 const avatarUrl=(path)=>{
  if(!path||!/^[a-f0-9-]{36}\/[a-zA-Z0-9._-]+$/.test(path))return '';
  const c=client();return c?.storage.from('kiana-avatars').getPublicUrl(path).data?.publicUrl||''
 };
 const shortDate=value=>value?new Date(value).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}):'Sans date';
 let remoteOrders=[],memberOrdersBusy=false,chatOrderId=null,chatLock=false,chatTimer=null;
 function profileImage(profile,alt){
  const url=avatarUrl(profile?.avatar_path);
  return url?'<img class="km-avatar-img" src="'+escape(url)+'" alt="'+escape(alt||'Avatar')+'">':'<span class="km-avatar-initial">'+escape((profile?.display_name||'?').slice(0,1).toUpperCase())+'</span>';
 }
 function mustLogin(dest){
  const target=$(dest);
  if(!target)return;
  target.innerHTML='<div class="km-empty"><span class="km-spark">✦</span><h3>Rejoins KIANA STUDIO ♡</h3><p>Crée ton compte ou connecte-toi pour retrouver tes informations et tes commandes sur tes appareils.</p><a class="btn btn-primary" href="#account">ME CONNECTER ↗</a></div>'
 }
 async function renderProfile(){
  const target=$('kiana-profile-root');if(!target)return;
  const current=user();if(!current){mustLogin('kiana-profile-root');return}
  const c=client();if(!c){target.innerHTML='<div class="notice">Connexion au stockage indisponible.</div>';return}
  target.innerHTML='<div class="community-loading">Préparation de ton profil… ♡</div>';
  const {data:p,error}=await c.from('kiana_community_profiles')
    .select('user_id,display_name,first_name,bio,avatar_path,created_at').eq('user_id',current.id).maybeSingle();
  if(error){target.innerHTML='<p class="notice">Impossible de charger le profil : '+escape(error.message)+'</p>';return}
  if(!p){target.innerHTML='<p class="notice">Ton profil n’a pas encore été créé. Reconnecte-toi dans « Mon compte ».</p>';return}
  const {count:posts}=await c.from('kiana_community_posts').select('*',{count:'exact',head:true}).eq('user_id',current.id).eq('status','approved');
  const {count:orders}=await c.from('kiana_member_orders').select('*',{count:'exact',head:true}).eq('user_id',current.id);
  target.innerHTML='<div class="km-profile-cover"><span>KIANA STUDIO · YOUR FASHION IDENTITY</span><strong>THIS IS MY ERA ✦</strong></div>'+
  '<div class="km-profile-layout"><div class="km-profile-identity"><div class="km-profile-avatar">'+profileImage(p,'Photo de profil')+'</div>'+
  '<h3>'+escape(p.display_name)+'</h3><p>'+escape(p.bio||'À toi d’écrire ta petite présentation ♡')+'</p>'+
  '<div class="km-profile-stats"><div><strong>'+Number(posts||0)+'</strong><small>Posts approuvés</small></div><div><strong>'+Number(orders||0)+'</strong><small>Commandes</small></div></div>'+
  '<a href="#myorders" class="btn btn-primary btn-block">MES COMMANDES ↗</a></div>'+
  '<form id="km-profile-form" class="km-profile-form"><span class="eyebrow">MODIFIER MON PROFIL ♡</span>'+
  '<label for="km-profile-first">Prénom</label><input id="km-profile-first" class="field" maxlength="50" required value="'+escape(p.first_name||current.user_metadata?.first_name||'')+'">'+
  '<label for="km-profile-name">Pseudo affiché sous tes outfits</label><input id="km-profile-name" class="field" minlength="2" maxlength="40" required value="'+escape(p.display_name)+'">'+
  '<label for="km-profile-bio">Ta bio (280 caractères maximum)</label><textarea id="km-profile-bio" class="field" maxlength="280" rows="4" placeholder="Parle de ton style, tes vibes…">'+escape(p.bio||'')+'</textarea>'+
  '<label for="km-profile-photo">Photo de profil (facultative)</label><input class="field" id="km-profile-photo" type="file" accept="image/jpeg,image/png,image/webp">'+
  '<div class="km-form-actions"><button class="btn btn-primary" type="submit">ENREGISTRER LES MODIFICATIONS ♡</button></div>'+
  '<p class="help">Ton pseudo, ta bio et ta photo sont publics. Ton numéro de téléphone reste privé.</p></form></div>';
  const form=$('km-profile-form');form.onsubmit=async ev=>{
   ev.preventDefault();
   const name=$('km-profile-name').value.trim(),first=$('km-profile-first').value.trim(),bio=$('km-profile-bio').value.trim();
   if(name.length<2||first.length<2){toastMsg('Renseigne un prénom et un pseudo valides.');return}
   const button=form.querySelector('button[type=submit]');button.disabled=true;
   let imagePath=p.avatar_path||null;
   const file=$('km-profile-photo').files?.[0];
   if(file){
    if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>3_000_000){toastMsg('Photo JPG, PNG ou WebP, 3 Mo maximum.');button.disabled=false;return}
    try{
     const jpg=await compactAvatar(file);
     const path=current.id+'/avatar-'+crypto.randomUUID()+'.jpg';
     const {error:uploadError}=await c.storage.from('kiana-avatars').upload(path,jpg,{contentType:'image/jpeg',upsert:false});
     if(uploadError)throw uploadError;
     imagePath=path
    }catch(e){toastMsg('Erreur photo : '+(e.message||'Import impossible'));button.disabled=false;return}
   }
   const {data:saved,error:saveError}=await c.from('kiana_community_profiles').update({display_name:name,first_name:first,bio,avatar_path:imagePath}).eq('user_id',current.id).select().single();
   if(saveError){toastMsg('Impossible de modifier le profil : '+saveError.message);button.disabled=false;return}
   window.kianaUpdateCurrentProfile?.(saved);
   toastMsg('Ton profil est mis à jour ♡');
   await renderProfile()
  }
 }
 function compactAvatar(file){
  return new Promise((resolve,reject)=>{
   const reader=new FileReader();
   reader.onerror=()=>reject(Error('Impossible de lire cette photo'));
   reader.onload=()=>{
    const img=new Image();
    img.onerror=()=>reject(Error('Image incorrecte'));
    img.onload=()=>{
     const canvas=document.createElement('canvas'),scale=Math.min(1,480/img.width,480/img.height);
     canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
     canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
     canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Conversion impossible')),'image/jpeg',.77)
    };img.src=reader.result
   };reader.readAsDataURL(file)
  })
 }
 function localUnlinked(){
  const current=user();if(!current)return'';
  const local=Array.isArray(db.orders)?db.orders.filter(o=>!o.remoteId).slice(0,10):[];
  return local.length?'<details class="km-local-orders"><summary>Anciennes commandes de cet appareil ('+local.length+')</summary>'+
   '<p class="help">Ces anciennes commandes n’étaient pas liées à ton compte. Elles restent enregistrées uniquement ici et ne possèdent pas de messagerie partagée.</p>'+
   local.map(o=>'<div class="km-order-mini"><b>'+escape(o.id)+'</b><span>'+escape(o.lookName||o.service||'Commande')+'</span></div>').join('')+'</details>':''
 }
 async function renderMyOrders(){
  const target=$('kiana-member-orders');if(!target)return;
  const current=user();if(!current){mustLogin('kiana-member-orders');return}
  if(memberOrdersBusy)return;
  const c=client();if(!c){target.innerHTML='<div class="notice">Stockage indisponible.</div>';return}
  memberOrdersBusy=true;target.innerHTML='<div class="community-loading">Retrouvons tes créations… ♡</div>';
  try{
   const {data,error}=await c.from('kiana_member_orders').select('id,order_number,order_kind,status,requested_date,total,created_at,order_details')
    .eq('user_id',current.id).order('created_at',{ascending:false}).limit(80);
   if(error)throw error;
   remoteOrders=data||[];
   target.innerHTML='<div class="km-orders-toolbar"><span class="eyebrow">MON CARNET DE COMMANDES</span><button class="btn btn-small" type="button" id="km-refresh-orders">ACTUALISER ↻</button></div>'+
    (remoteOrders.length?'<div class="km-orders-list">'+remoteOrders.map(o=>{
     const d=o.order_details||{},items=Array.isArray(d.items)?d.items:[];
     const itemText=items.length?items.map(x=>x.qty+' × '+x.name).join(' · '):d.lookName||'Création sur mesure';
     const total=o.total==null?'Sur devis'+(Number(d.expressFee)>0?' + 500 $':''):price(o.total);
     return '<article class="km-order-card"><div class="km-order-card-top"><span class="eyebrow">'+escape(o.order_number)+'</span>'+
      '<span class="km-status '+(o.status==='Livrée'?'delivered':'preparing')+'">'+escape(o.status)+'</span></div>'+
      '<h3>'+escape(itemText)+'</h3><p>Demandée le '+escape(shortDate(o.created_at))+
      (o.requested_date?' · Livraison souhaitée : '+escape(o.requested_date):'')+'</p>'+
      '<div class="km-order-foot"><strong>'+escape(total)+'</strong><button class="btn btn-primary btn-small" type="button" data-km-chat="'+Number(o.id)+'">MESSAGERIE ↗</button></div></article>'
    }).join('')+'</div>':
    '<div class="km-empty"><h3>Aucune commande enregistrée ♡</h3><p>Connecte-toi avant de commander pour retrouver tes achats ici, sur tous tes appareils.</p><a class="btn btn-primary" href="#shop">DÉCOUVRIR LES TENUES</a></div>')+
    localUnlinked();
   $('km-refresh-orders').onclick=renderMyOrders;
   target.querySelectorAll('[data-km-chat]').forEach(b=>b.onclick=()=>window.kianaOpenOrderChat(b.dataset.kmChat))
  }catch(e){target.innerHTML='<p class="notice">Impossible de charger les commandes : '+escape(e.message||'Erreur')+'</p>'}
  finally{memberOrdersBusy=false}
 }
 async function chat(orderId){
  const current=user(),c=client();
  if(!current||!c){toastMsg('Connecte-toi pour accéder aux messages.');location.hash='account';return}
  const {data:order,error:orderError}=await c.from('kiana_member_orders').select('id,order_number,user_id,order_kind,status').eq('id',orderId).maybeSingle();
  if(orderError||!order){toastMsg('Cette commande n’est pas accessible depuis ton compte.');return}
  chatOrderId=order.id;
  if(chatTimer)clearInterval(chatTimer);
  openModal('<span class="eyebrow">KIANA · MESSAGERIE PRIVÉE</span><h2 class="serif km-chat-title">'+escape(order.order_number)+' ♡</h2>'+
   '<p class="help">Cette conversation est accessible uniquement au client et à la direction authentifiée de KIANA STUDIO.</p>'+
   '<div id="km-chat-thread" class="km-chat-thread" role="log" aria-live="polite"><p>Chargement…</p></div>'+
   '<form id="km-chat-form" class="km-chat-compose"><textarea class="field" id="km-chat-text" rows="2" maxlength="1200" required placeholder="Écris ton message à propos de cette commande…"></textarea>'+
   '<button class="btn btn-primary" type="submit">ENVOYER ↗</button></form>'+
   '<button class="btn btn-small" id="km-chat-refresh" type="button" style="margin-top:12px">ACTUALISER LA CONVERSATION</button>');
  $('km-chat-refresh').onclick=()=>loadChat(order.id);
  $('km-chat-form').onsubmit=async event=>{
   event.preventDefault();if(chatLock)return;
   const body=$('km-chat-text').value.trim();if(!body)return;
   chatLock=true;const button=$('km-chat-form').querySelector('button');button.disabled=true;
   const {error}=await c.from('kiana_order_messages').insert({order_id:order.id,sender_id:current.id,body});
   chatLock=false;
   if(error){toastMsg('Envoi impossible : '+error.message);button.disabled=false;return}
   $('km-chat-text').value='';button.disabled=false;await loadChat(order.id)
  };
  await loadChat(order.id);
  chatTimer=setInterval(()=>{
   if(!$('km-chat-thread')){clearInterval(chatTimer);chatTimer=null;return}
   void loadChat(order.id)
  },12000)
 }
 async function loadChat(id){
  if(chatOrderId!==id)return;
  const thread=$('km-chat-thread');if(!thread)return;
  const {data,error}=await client().from('kiana_order_messages').select('id,sender_id,body,created_at')
   .eq('order_id',id).order('created_at',{ascending:true}).limit(150);
  if(error){thread.innerHTML='<p class="notice">Lecture impossible.</p>';return}
  thread.innerHTML=(data||[]).length?data.map(m=>{
   const mine=m.sender_id===user()?.id;
   return '<div class="km-bubble '+(mine?'mine':'theirs')+'"><span>'+escape(m.body)+'</span><small>'+escape(new Date(m.created_at).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}))+'</small></div>'
  }).join(''):'<p class="km-chat-empty">Aucun message pour le moment. Tu peux écrire à Kiana ici ♡</p>';
  thread.scrollTop=thread.scrollHeight
 }
 window.kianaOpenOrderChat=chat;
 window.kianaPersistNewOrder=async order=>{
  const current=user(),c=client();
  if(!current)return {ok:true,local:true};
  if(!c){toastMsg('Connexion Supabase indisponible : commande non envoyée.');return {ok:false}}
  const snapshot={...order};delete snapshot.remoteId;
  const {data,error}=await c.from('kiana_member_orders').insert({
    user_id:current.id,order_kind:order.kind==='boutique'?'boutique':'sur-mesure',
    requested_date:order.requestedDate||null,total:order.total==null?null:Number(order.total),
    status:'En préparation',order_details:snapshot
   }).select('id,order_number').single();
  if(error){toastMsg('La commande n’a pas pu être enregistrée dans ton compte : '+error.message);return {ok:false}}
  return {ok:true,remoteId:data.id,number:data.order_number}
 };
 window.kianaMembersRoute=page=>{
  if(page==='profile')void renderProfile();
  if(page==='myorders')void renderMyOrders()
 };
 window.kianaAuthChanged=()=>{
  const page=location.hash.slice(1);
  if(page==='profile')void renderProfile();
  if(page==='myorders')void renderMyOrders()
 };
})();

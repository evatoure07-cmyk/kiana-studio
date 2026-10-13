
'use strict';
/* Founder workspace — local-only demonstration, not server authentication. */
async function pinHash(pin,salt){
 if(!crypto?.subtle)throw Error('Ce navigateur ne prend pas en charge la vérification locale.');
 const input=new TextEncoder().encode(salt+':'+pin);
 const output=await crypto.subtle.digest('SHA-256',input);
 return Array.from(new Uint8Array(output),x=>x.toString(16).padStart(2,'0')).join('')
}
function freshSalt(){return Array.from(crypto.getRandomValues(new Uint8Array(18)),x=>x.toString(16).padStart(2,'0')).join('')}
function openGate(){
 const exists=!!readStorage(PIN_KEY);
 openModal('<div style="text-align:center"><span class="eyebrow">KIANA · BACKSTAGE</span><h2 class="serif" style="font-size:2.8rem;margin:13px 0">'+(exists?'Accès fondatrice':'Créer un code de démo')+' ♡</h2></div>'+
 '<form id="pin-form" class="admin-form"><label for="pin-entry">Code d’accès local</label><input id="pin-entry" class="field" type="password" autocomplete="off" minlength="6" maxlength="64" required placeholder="6 caractères minimum">'+
 (!exists?'<label for="pin-confirm">Confirmer le code</label><input id="pin-confirm" class="field" type="password" autocomplete="off" minlength="6" maxlength="64" required>':'')+
 '<button class="btn btn-primary btn-block" type="submit" style="margin:19px 0">'+(exists?'OUVRIR LE STUDIO':'CRÉER L’ACCÈS')+'</button></form>'+
 '<div class="notice"><b>Version démonstration :</b> ce code fonctionne sur cet appareil uniquement. Il ne protège pas un espace public et ne synchronise pas les modifications. N’utilise pas ton vrai mot de passe.</div>')
}
async function submitPin(){
 const value=byId('pin-entry')?.value||'',raw=readStorage(PIN_KEY);
 if(value.length<6){toast('Code trop court.');return}
 if(loginAttempts>=5){toast('Plusieurs codes incorrects. Réessaie après avoir rouvert cette page.');return}
 try{
  if(raw){const test=await pinHash(value,raw.salt);if(test!==raw.hash){loginAttempts++;toast('Code incorrect.');return}}
  else{
   if(value!==byId('pin-confirm')?.value){toast('Les codes ne correspondent pas.');return}
   const salt=freshSalt(),hash=await pinHash(value,salt);
   localStorage.setItem(PIN_KEY,JSON.stringify({salt,hash}))
  }
  founderUnlocked=true;loginAttempts=0;adminTab='overview';closeModal();nav('founder');toast('Bienvenue dans le studio ♡')
 }catch(err){toast(err.message||'Impossible de vérifier le code')}
}
function logoutFounder(){founderUnlocked=false;adminTab='overview';nav('home');toast('Session locale fermée ♡')}
function adminHeader(title,description,extra){
 return '<div class="admin-title"><div><span class="eyebrow">KIANA / BACKSTAGE</span><h3>'+title+'</h3><p class="help">'+description+'</p></div>'+(extra||'')+'</div>'
}
function renderAdmin(){
 if(!founderUnlocked){openGate();return}
 document.querySelectorAll('[data-admin-tab]').forEach(x=>x.classList.toggle('active',x.dataset.adminTab===adminTab));
 const el=byId('admin-body');
 if(adminTab==='overview'){
  const open=db.orders.filter(o=>o.status==='En préparation').length;
  el.innerHTML=adminHeader('Bonjour, Kiana ♡','Tout ton studio au même endroit, sans formulaires inutiles.')+
  '<div class="kpis"><div class="kpi"><strong>'+db.looks.filter(p=>p.visible!==false).length+'</strong><span>Tenues en boutique</span></div><div class="kpi"><strong>'+open+'</strong><span>Commandes à préparer</span></div><div class="kpi"><strong>'+db.orders.filter(o=>o.status==='Livrée').length+'</strong><span>Commandes livrées</span></div></div>'+
  '<div class="panel" style="margin-bottom:18px;background:linear-gradient(120deg,#6b2f60,#3b1943)"><span class="eyebrow">TON STUDIO, TES CRÉATIONS</span><h3 class="serif" style="font-size:2rem;margin:10px 0">Un dressing qui te ressemble.</h3><p class="help">Ajoute tes tenues, organise les collections et retrouve les commandes dans deux clics.</p><button class="btn btn-primary" data-action="admin-new-look">+ AJOUTER UNE TENUE</button></div>'+
  '<div class="quick-grid"><button class="quick" data-action="admin-tab" data-id="looks"><strong>♡ Mon dressing ↗</strong><small>Photos, favoris, visibilité et prix</small></button>'+
  '<button class="quick" data-action="admin-tab" data-id="capsules"><strong>✦ Collections ↗</strong><small>Capsules et look du mois</small></button>'+
  '<button class="quick" data-action="admin-tab" data-id="orders"><strong>▤ Commandes ↗</strong><small>Préparation, livraison et suppression</small></button>'+
  '<button class="quick" data-action="admin-tab" data-id="presentation"><strong>✎ Présentation ↗</strong><small>Textes et image d’accueil</small></button></div>'+
  '<div class="notice" style="margin-top:20px">Démo locale : les commandes d’autres clients n’apparaissent pas ici et tes éditions ne se publient pas sur leurs appareils. La connexion Supabase sécurisée reste à réaliser.</div>';
 } else if(adminTab==='looks')renderAdminLooks();
 else if(adminTab==='portfolio')renderAdminPortfolio();
 else if(adminTab==='capsules')renderAdminCapsules();
 else if(adminTab==='orders')renderAdminOrders();
 else if(adminTab==='presentation')renderAdminPresentation();
 else if(adminTab==='settings')renderAdminSettings();
}
function renderAdminLooks(){
 const el=byId('admin-body');
 el.innerHTML=adminHeader('Mon dressing','Clique sur une photo pour ouvrir sa fiche. Le cœur se règle directement sur l’image.',
 '<button class="btn btn-primary btn-small" data-action="admin-new-look">+ TENUE</button>')+
 '<div class="toolbar"><input class="field" data-admin-input="looks-search" placeholder="Chercher une tenue..." value="'+escapeHtml(adminSearch)+'">'+
 '<select class="field" style="width:190px" data-admin-change="looks-filter"><option value="all">Toutes les tenues</option><option value="liked">♡ Mes coups de cœur</option><option value="visible">Visibles</option><option value="hidden">Masquées</option></select></div>'+
 '<p class="help" id="admin-look-count"></p><div class="admin-gallery" id="admin-look-gallery"></div>';
 el.querySelector('[data-admin-change="looks-filter"]').value=adminFilter;
 updateAdminGallery()
}
function updateAdminGallery(){
 const target=byId('admin-look-gallery');if(!target)return;
 let looks=db.looks;
 if(adminFilter==='liked')looks=looks.filter(p=>p.likedByFounder);
 if(adminFilter==='visible')looks=looks.filter(p=>p.visible!==false);
 if(adminFilter==='hidden')looks=looks.filter(p=>p.visible===false);
 const search=adminSearch.toLowerCase().trim();
 if(search)looks=looks.filter(p=>(p.name+' '+p.desc).toLowerCase().includes(search));
 byId('admin-look-count').textContent=looks.length+' tenue'+(looks.length>1?'s':'')+' · Défile pour toutes les voir';
 target.innerHTML=looks.map(p=>'<div class="admin-look"><button class="admin-look-photo" data-action="admin-edit-look" data-id="'+escapeHtml(p.id)+'" aria-label="Modifier '+escapeHtml(p.name)+'">'+safeImg(p.image,p.name)+'</button>'+
 '<button class="admin-heart '+(p.likedByFounder?'liked':'')+'" data-action="admin-heart" data-id="'+escapeHtml(p.id)+'" aria-label="Coup de cœur">'+(p.likedByFounder?'♥':'♡')+'</button>'+
 '<div class="admin-look-info"><strong>'+escapeHtml(p.name)+'</strong><small>'+price(p.price)+' · '+(p.visible!==false?'Visible':'Masquée')+'</small></div></div>').join('')||'<p class="muted">Aucune tenue dans ce filtre.</p>'
}
function openLookEditor(id){
 const p=db.looks.find(x=>String(x.id)===String(id));if(!p)return;
 editorId=String(p.id);editorImage=p.image||'';
 const capsules='<option value="">Sans collection</option>'+db.capsules.map(c=>'<option value="'+escapeHtml(c.id)+'" '+(p.capsuleId===c.id?'selected':'')+'>'+escapeHtml(c.name)+'</option>').join('');
 openModal('<div class="detail-grid"><div><div class="detail-photo" id="editor-photo-preview">'+safeImg(editorImage,p.name)+'</div><p class="help" style="margin-top:13px">Importe une photo ou colle une adresse HTTPS, puis enregistre.</p></div>'+
 '<div><span class="eyebrow">ÉDITER UNE TENUE</span><h2 class="serif" style="font-size:2.1rem;margin:8px 0 16px">'+escapeHtml(p.name)+'</h2>'+
 '<form id="admin-editor-form" class="admin-form">'+
 '<label>Nom de la tenue</label><input class="field" name="name" maxlength="90" required value="'+escapeHtml(p.name)+'">'+
 '<div class="inline-fields"><div><label>Prix ($)</label><input class="field" name="price" type="number" min="0" max="9999999" value="'+Number(p.price)||0+'"></div>'+
 '<div><label>Style</label><select class="field" name="category">'+['Baddie','Glam','Y2K','Soft'].map(c=>'<option '+(c===p.category?'selected':'')+'>'+c+'</option>').join('')+'</select></div></div>'+
 '<label>Collection capsule</label><select class="field" name="capsuleId">'+capsules+'</select>'+
 '<label>Petite description</label><textarea class="field" name="desc" maxlength="1200" rows="3">'+escapeHtml(p.desc)+'</textarea>'+
 '<label>Adresse HTTPS de la photo</label><input class="field" name="image" id="editor-url" value="'+escapeHtml(imageUrl(p.image))+'" data-admin-input="image-preview">'+
 '<label>Ou choisir une photo</label><input class="field" type="file" accept="image/*" data-admin-change="image-file">'+
 '<label style="display:flex;gap:9px;align-items:center"><input type="checkbox" name="visible" '+(p.visible!==false?'checked':'')+'> Visible en boutique</label>'+
 '<div class="admin-actions"><button class="btn btn-primary" type="submit">ENREGISTRER ♡</button><button type="button" class="btn btn-small" data-action="admin-duplicate-look">DUPLIQUER</button><button type="button" class="btn btn-small btn-danger" data-action="admin-delete-look">SUPPRIMER</button></div>'+
 '</form></div></div>');
}
function saveLookEditor(form){
 const p=db.looks.find(x=>String(x.id)===editorId);if(!p)return;
 const fd=new FormData(form),name=String(fd.get('name')||'').trim();
 if(!name){toast('Il faut donner un nom à la tenue.');return}
 p.name=name;p.price=Math.max(0,Math.min(9999999,Number(fd.get('price'))||0));p.category=String(fd.get('category'));
 p.capsuleId=String(fd.get('capsuleId'));p.desc=String(fd.get('desc')||'');p.image=editorImage;
 p.visible=fd.get('visible')!==null;
 if(save()){closeModal();renderAdminLooks();renderHome();toast('Tenue mise à jour sur cet appareil ♡')}
}
function newLook(){
 const p={id:uid(),name:'Nouvelle création',price:0,category:'Baddie',capsuleId:db.capsules[0]?.id||'',desc:'',image:'',visible:false,likedByFounder:false};
 db.looks.unshift(p);if(save()){renderAdminLooks();openLookEditor(p.id)}
}
function duplicateLook(){
 const p=db.looks.find(x=>String(x.id)===editorId);if(!p)return;
 const copy={...p,id:uid(),name:p.name+' (copie)',visible:false,likedByFounder:false};
 db.looks.unshift(copy);if(save()){closeModal();renderAdminLooks();openLookEditor(copy.id)}
}
function deleteLook(){
 const p=db.looks.find(x=>String(x.id)===editorId);if(!p)return;
 if(!confirm('Supprimer définitivement « '+p.name+' » de ce navigateur ?'))return;
 db.looks=db.looks.filter(x=>String(x.id)!==editorId);
 if(String(db.monthLookId)===editorId){db.monthEnabled=false;db.monthLookId=null}
 if(save()){closeModal();renderAdminLooks();renderHome();toast('Tenue supprimée')}
}
function renderAdminCapsules(){
 const el=byId('admin-body');
 const published=db.looks.filter(p=>p.visible!==false);
 const current=db.looks.find(p=>String(p.id)===String(db.monthLookId));
 el.innerHTML=adminHeader('Collections & vitrine','Crée des capsules, choisis leurs photos et décide du look du mois.',
 '<button class="btn btn-primary btn-small" data-action="admin-new-capsule">+ COLLECTION</button>')+
 '<div class="panel" style="margin-bottom:20px"><span class="eyebrow">THE MONTHLY EDIT</span><h3 class="serif" style="font-size:1.9rem;margin:12px 0">Look du mois ♡</h3>'+
 '<form class="admin-form" id="admin-month-form"><label>Tenue mise en avant</label><select class="field" name="lookId">'+
 published.map(p=>'<option value="'+escapeHtml(p.id)+'" '+(String(db.monthLookId)===String(p.id)?'selected':'')+'>'+escapeHtml(p.name)+'</option>').join('')+'</select>'+
 '<div class="admin-split"><div><label>Titre (facultatif)</label><input class="field" name="title" value="'+escapeHtml(db.monthTitle||'')+'" placeholder="Ex. IT GIRL OF THE MONTH"></div><div><label>Affichage</label><p class="help">'+(db.monthEnabled!==false&&current?'Actuellement visible sur l’accueil':'Actuellement masqué')+'</p></div></div>'+
 '<label>Petite phrase (facultatif)</label><textarea class="field" name="description" rows="2" maxlength="600">'+escapeHtml(db.monthDescription||'')+'</textarea>'+
 '<div class="admin-actions"><button class="btn btn-primary btn-small" type="submit">AFFICHER LE LOOK DU MOIS</button><button type="button" class="btn btn-danger btn-small" data-action="admin-remove-month">RETIRER</button></div></form></div>'+
 '<h3 class="serif" style="font-size:1.6rem">Collections capsules</h3><p class="help">Les tenues sont reliées aux capsules dans leur fiche. Clique sur une collection pour la modifier.</p>'+
 db.capsules.map(c=>'<details class="admin-record"><summary>'+escapeHtml(c.name)+' · '+(c.visible!==false?'Visible':'Masquée')+' ↗</summary>'+
 '<form class="admin-form" data-capsule-id="'+escapeHtml(c.id)+'" id="admin-capsule-form">'+
 '<label>Nom</label><input class="field" name="name" value="'+escapeHtml(c.name)+'" required maxlength="80">'+
 '<label>Texte de présentation</label><textarea class="field" name="description" maxlength="600">'+escapeHtml(c.description)+'</textarea>'+
 '<label>Image de la collection (URL)</label><input class="field" name="image" value="'+escapeHtml(imageUrl(c.image))+'">'+
 '<label style="display:flex;gap:8px"><input type="checkbox" name="visible" '+(c.visible!==false?'checked':'')+'> Visible sur l’accueil</label>'+
 '<div class="admin-actions"><button type="submit" class="btn btn-primary btn-small">ENREGISTRER</button><button type="button" class="btn btn-danger btn-small" data-action="admin-delete-capsule" data-id="'+escapeHtml(c.id)+'">SUPPRIMER</button></div></form></details>').join('')+
 '<p class="notice" style="margin-top:18px">Les capsules servent à organiser le catalogue. Une tenue peut être rattachée à une capsule depuis sa fiche.</p>'
}
function saveCapsule(form){
 const item=db.capsules.find(c=>c.id===form.dataset.capsuleId);if(!item)return;
 const fd=new FormData(form);item.name=String(fd.get('name')).trim()||item.name;item.description=String(fd.get('description')||'');item.image=String(fd.get('image')||'');item.visible=fd.get('visible')!==null;
 if(save()){renderAdminCapsules();renderHome();toast('Collection enregistrée ♡')}
}
function renderAdminOrders(){
 const el=byId('admin-body');
 el.innerHTML=adminHeader('Commandes','Deux statuts simples : En préparation ou Livrée.')+
 '<div class="notice" style="margin-bottom:19px">Seules les commandes créées sur cet appareil apparaissent ici. Le site ne reçoit pas encore les commandes des autres visiteurs.</div>'+
 '<div class="toolbar"><input class="field" data-admin-input="order-search" placeholder="Chercher une commande..." value="'+escapeHtml(adminSearch)+'">'+
 '<span class="muted" style="font-size:.8rem">'+db.orders.length+' commande(s) locales</span></div>'+
 '<div class="admin-orders" id="admin-order-list"></div>';
 updateAdminOrders()
}
function updateAdminOrders(){
 const panel=byId('admin-order-list');if(!panel)return;
 const q=adminSearch.toLowerCase().trim();
 const orders=db.orders.filter(o=>(String(o.id)+' '+String(o.name)+' '+String(o.phone)).toLowerCase().includes(q));
 panel.innerHTML=orders.map(o=>'<article class="admin-order" data-order-id="'+escapeHtml(o.id)+'"><div class="admin-order-head"><div><strong>'+escapeHtml(o.id)+'</strong><br><small>'+new Date(o.createdAt||Date.now()).toLocaleString('fr-FR')+' · '+escapeHtml(o.name)+'</small></div><span class="price">'+price(o.price??o.total??null)+'</span></div>'+
 '<p><b>Téléphone :</b> '+escapeHtml(o.phone||o.contact||'Non indiqué')+'\n<b>Service :</b> '+escapeHtml(o.service||'Commande')+
 '\n<b>Tenue :</b> '+escapeHtml(o.lookName||o.items?.[0]?.name||'Création')+
 '\n<b>Mode :</b> '+escapeHtml(o.mode||'Choix libre')+'\n<b>Couleur :</b> '+escapeHtml(o.color||'Non précisée')+
 '\n<b>Personnalisation :</b> '+escapeHtml(orderOptionsText(o))+
 '\n<b>Envies :</b> '+escapeHtml(o.wants||'Aucune précision')+'\n<b>À éviter :</b> '+escapeHtml(o.avoid||'Aucune précision')+'</p>'+
 '<div class="admin-actions"><select class="field" aria-label="Statut de la commande" style="width:210px" data-admin-change="order-status" data-id="'+escapeHtml(o.id)+'"><option '+(o.status==='En préparation'?'selected':'')+'>En préparation</option><option '+(o.status==='Livrée'?'selected':'')+'>Livrée</option></select>'+
 '<button class="btn btn-danger btn-small" data-action="admin-delete-order" data-id="'+escapeHtml(o.id)+'">SUPPRIMER</button></div></article>').join('')||
 '<div class="panel">Aucune commande locale pour le moment.</div>'
}
function renderAdminPresentation(){
 byId('admin-body').innerHTML=adminHeader('Présentation','Une seule page pour modifier les textes et la grande photo de l’accueil.')+
 '<form class="panel admin-form" id="admin-text-form"><label>Phrase d’accueil</label><textarea class="field" name="intro" maxlength="1600" rows="4">'+escapeHtml(db.intro)+'</textarea>'+
 '<label>À propos de Kiana</label><textarea class="field" name="bio" maxlength="4000" rows="8">'+escapeHtml(db.bio)+'</textarea>'+
 '<label>Photo de l’accueil (URL HTTPS)</label><input class="field" name="heroImage" value="'+escapeHtml(imageUrl(db.heroImage))+'">'+
 '<div class="admin-actions"><button class="btn btn-primary" type="submit">ENREGISTRER LES MODIFICATIONS</button></div></form>'
}
function renderAdminSettings(){
 byId('admin-body').innerHTML=adminHeader('Réglages & sauvegardes','Garde une copie des tenues et change ton code de démo.')+
 '<form class="panel admin-form" id="admin-settings-form"><h3 class="serif">Code d’accès local</h3><label>Nouveau code (6 caractères minimum)</label><input class="field" type="password" name="newPin" minlength="6" maxlength="64" placeholder="Nouveau code" autocomplete="new-password"><div class="admin-actions"><button class="btn btn-primary btn-small" type="submit">CHANGER LE CODE</button></div></form>'+
 '<div class="panel" style="margin-top:17px"><h3 class="serif">Mes données</h3><p class="help">Exporte un fichier JSON pour sauvegarder tes tenues et commandes de démonstration.</p><button class="btn btn-primary btn-small" data-action="admin-export">TÉLÉCHARGER LA SAUVEGARDE</button><label class="field-label" style="display:block;margin-top:17px">Importer une sauvegarde</label><input type="file" class="field" accept=".json,application/json" data-admin-change="import-json"></div>'+
 '<div class="notice" style="margin-top:18px"><b>La prochaine vraie étape :</b> connecter une base de données sécurisée avec un compte fondatrice authentifié et un stockage d’images, pour publier tes modifications et recevoir les commandes de tous les visiteurs.</div>'+
 '<button class="btn btn-danger" data-action="admin-logout" style="margin-top:18px">SE DÉCONNECTER</button>'
}
function handleAdminAction(a,node){
 const id=node.dataset.id;
 if(a==='admin-tab'){adminTab=id;adminSearch='';renderAdmin()}
 else if(a==='admin-new-look')newLook();
 else if(a==='admin-new-photo')newPhoto();
 else if(a==='admin-edit-photo')openPhotoEditor(Number(id));
 else if(a==='admin-delete-photo')deletePhoto();
 else if(a==='admin-edit-look')openLookEditor(id);
 else if(a==='admin-heart'){const p=db.looks.find(x=>String(x.id)===String(id));if(!p)return;p.likedByFounder=!p.likedByFounder;if(save()){updateAdminGallery();renderHome();toast(p.likedByFounder?'Ajouté aux coups de cœur ♡':'Retiré des coups de cœur')}}
 else if(a==='admin-duplicate-look')duplicateLook();
 else if(a==='admin-delete-look')deleteLook();
 else if(a==='admin-new-capsule'){db.capsules.push({id:uid(),name:'Nouvelle collection',description:'À personnaliser',image:'',visible:false});if(save()){renderAdminCapsules();toast('Collection créée ♡')}}
 else if(a==='admin-delete-capsule'){const c=db.capsules.find(x=>x.id===id);if(!c||!confirm('Supprimer la collection « '+c.name+' » ? Les tenues seront conservées.'))return;db.capsules=db.capsules.filter(x=>x.id!==id);db.looks.forEach(p=>{if(p.capsuleId===id)p.capsuleId=''});if(save()){renderAdminCapsules();renderHome()}}
 else if(a==='admin-remove-month'){db.monthEnabled=false;db.monthLookId=null;db.monthTitle='';db.monthDescription='';if(save()){renderAdminCapsules();renderHome();toast('Look du mois retiré')}}
 else if(a==='admin-delete-order'){const o=db.orders.find(x=>String(x.id)===String(id));if(!o||!confirm('Supprimer définitivement '+o.id+' sur cet appareil ?'))return;db.orders=db.orders.filter(x=>String(x.id)!==String(id));if(save()){updateAdminOrders();toast('Commande supprimée')}}
 else if(a==='admin-export')exportBackup();
 else if(a==='admin-logout')logoutFounder()
}
function handleAdminChange(node){
 const a=node.dataset.adminChange,id=node.dataset.id;
 if(a==='looks-filter'){adminFilter=node.value;updateAdminGallery()}
 if(a==='order-status'){const o=db.orders.find(x=>String(x.id)===String(id));if(o){o.status=node.value;if(save())toast('Statut mis à jour localement ♡')}}
 if(a==='image-file'){const file=node.files?.[0];if(!file)return;if(!file.type.startsWith('image/')||file.size>12*1024*1024){toast('Choisis une image de 12 Mo maximum.');return}
  const reader=new FileReader();reader.onload=()=>{
    const image=new Image();image.onload=()=>{
      const canvas=document.createElement('canvas'),ratio=Math.min(1,900/image.width,900/image.height);
      canvas.width=Math.round(image.width*ratio);canvas.height=Math.round(image.height*ratio);
      canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
      editorImage=canvas.toDataURL('image/jpeg',.72);byId('editor-url').value='';byId('editor-photo-preview').innerHTML=safeImg(editorImage,'Aperçu');
      toast('Image chargée. Enregistre pour la conserver ♡')
    };image.onerror=()=>toast('Image non reconnue');image.src=reader.result
  };reader.onerror=()=>toast('Lecture impossible');reader.readAsDataURL(file)
 }
 if(a==='import-json'){const file=node.files?.[0];if(!file)return;if(!confirm('Remplacer les données locales actuelles par cette sauvegarde ?'))return;const reader=new FileReader();reader.onload=()=>{try{const incoming=JSON.parse(reader.result);if(!Array.isArray(incoming.looks)||!Array.isArray(incoming.orders))throw Error('Fichier incompatible');db={...structuredClone(DEFAULT_STATE),...incoming};if(!save())throw Error('Stockage insuffisant');renderAdmin();renderHome();toast('Sauvegarde importée ♡')}catch(err){toast(err.message)}};reader.readAsText(file)}
}
function handleAdminInput(node){
 if(node.dataset.adminInput==='looks-search'){adminSearch=node.value;updateAdminGallery()}
 if(node.dataset.adminInput==='order-search'){adminSearch=node.value;updateAdminOrders()}
 if(node.dataset.adminInput==='image-preview'){editorImage=node.value;byId('editor-photo-preview').innerHTML=safeImg(editorImage,'Aperçu')}
}
function handleAdminSubmit(id,form){
 if(id==='pin-form'){submitPin();return}
 if(!founderUnlocked)return;
 if(id==='admin-editor-form')saveLookEditor(form);
 else if(id==='admin-photo-form')savePhotoEditor(form);
 else if(id==='admin-capsule-form')saveCapsule(form);
 else if(id==='admin-month-form'){
  const fd=new FormData(form);const lookId=String(fd.get('lookId')||'');
  if(!db.looks.some(p=>String(p.id)===lookId&&p.visible!==false)){toast('Choisis une tenue visible.');return}
  db.monthLookId=lookId;db.monthEnabled=true;db.monthTitle=String(fd.get('title')||'').trim();db.monthDescription=String(fd.get('description')||'').trim();
  if(save()){renderAdminCapsules();renderHome();toast('Look du mois en vitrine ♡')}
 }
 else if(id==='admin-text-form'){
  const fd=new FormData(form);db.intro=String(fd.get('intro')||'');db.bio=String(fd.get('bio')||'');db.heroImage=String(fd.get('heroImage')||'');
  if(save()){renderHome();renderAbout();toast('Présentation mise à jour ♡')}
 }
 else if(id==='admin-settings-form'){
  const value=String(new FormData(form).get('newPin')||'');
  if(value.length<6){toast('Choisis au moins six caractères.');return}
  (async()=>{try{const salt=freshSalt(),hash=await pinHash(value,salt);localStorage.setItem(PIN_KEY,JSON.stringify({salt,hash}));renderAdminSettings();toast('Code local modifié ♡')}catch{toast('Impossible de changer le code')}})()
 }
}
function exportBackup(){
 const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);
 const link=document.createElement('a');link.href=url;link.download='kiana-studio-sauvegarde.json';link.click();
 setTimeout(()=>URL.revokeObjectURL(url),500)
}

/* Lookbook management, visually separate from the shop. */
let photoEditorIndex=null;
function renderAdminPortfolio(){
 const root=byId('admin-body');
 root.innerHTML=adminHeader('Le lookbook','Les photos de ton univers, séparées des looks à vendre.',
 '<button class="btn btn-primary btn-small" data-action="admin-new-photo">+ PHOTO</button>')+
 '<div class="admin-gallery">'+db.photos.map((p,i)=>'<div class="admin-look"><button class="admin-look-photo" data-action="admin-edit-photo" data-id="'+i+'" aria-label="Éditer la photo '+escapeHtml(p.title)+'">'+safeImg(p.image,p.title)+'</button><div class="admin-look-info"><strong>'+escapeHtml(p.title)+'</strong><small>Photo #'+(i+1)+'</small></div></div>').join('')+'</div>'+
 (!db.photos.length?'<div class="panel">Le lookbook est vide. Ajoute ta première photo ♡</div>':'')
}
function newPhoto(){
 db.photos.push({title:'Nouveau Polaroid',image:''});
 photoEditorIndex=db.photos.length-1;
 if(save()){renderAdminPortfolio();openPhotoEditor(photoEditorIndex)}
}
function openPhotoEditor(index){
 const p=db.photos[index];if(!p)return;
 photoEditorIndex=index;editorImage=p.image||'';
 openModal('<div class="detail-grid"><div><div class="detail-photo" id="editor-photo-preview">'+safeImg(editorImage,p.title)+'</div><p class="help">Photo enregistrée uniquement sur cet appareil.</p></div>'+
 '<div><span class="eyebrow">FASHION DIARY</span><h2 class="serif" style="font-size:2.2rem">Éditer un Polaroid</h2>'+
 '<form class="admin-form" id="admin-photo-form">'+
 '<label>Titre de la photo</label><input class="field" maxlength="100" required name="title" value="'+escapeHtml(p.title)+'">'+
 '<label>Adresse de la photo</label><input class="field" name="image" id="editor-url" data-admin-input="image-preview" value="'+escapeHtml(imageUrl(p.image))+'">'+
 '<label>Ou charger une image</label><input class="field" type="file" accept="image/*" data-admin-change="image-file">'+
 '<div class="admin-actions"><button type="submit" class="btn btn-primary">ENREGISTRER</button><button type="button" class="btn btn-danger" data-action="admin-delete-photo">SUPPRIMER</button></div></form></div></div>')
}
function savePhotoEditor(form){
 const p=db.photos[photoEditorIndex];if(!p)return;
 const name=String(new FormData(form).get('title')||'').trim();if(!name){toast('Donne un titre à la photo.');return}
 p.title=name;p.image=editorImage;
 if(save()){closeModal();renderAdminPortfolio();renderPortfolio();renderHome();toast('Lookbook actualisé ♡')}
}
function deletePhoto(){
 const p=db.photos[photoEditorIndex];if(!p)return;
 if(!confirm('Supprimer « '+p.title+' » de ce navigateur ?'))return;
 db.photos.splice(photoEditorIndex,1);
 if(save()){closeModal();renderAdminPortfolio();renderPortfolio();renderHome();toast('Photo supprimée')}
}

function init(){
 const date=byId('booking-date');if(date)date.min=new Date().toISOString().slice(0,10);
 showRoute()
}
init();

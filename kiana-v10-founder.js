/* KIANA STUDIO — Founder photo editor, local notifications, filters and export */
let kianaEditingPhotos=[];
const KIANA_MAX_LOOK_PHOTOS=8;
function kianaShowPhotoList(){
 const holder=byId('admin-multi-photos');if(!holder)return;
 holder.innerHTML=kianaEditingPhotos.map((url,i)=>
 '<div class="admin-photo-item"><img class="preview" src="'+escapeHtml(url)+'" alt="Photo '+(i+1)+'"><div class="details"><b>Photo '+(i+1)+(i===0?' · Couverture':'')+'</b><span>'+((url.startsWith('data:'))?'Image importée':'Photo par lien')+'</span></div>'+
 (i?'<button type="button" data-action="admin-gallery-cover" data-id="'+i+'">Mettre en couverture</button>':'')+
 '<button type="button" data-action="admin-gallery-remove" data-id="'+i+'" aria-label="Supprimer la photo '+(i+1)+'">Retirer</button></div>').join('')+
 '<p class="admin-photo-hint">'+kianaEditingPhotos.length+' / '+KIANA_MAX_LOOK_PHOTOS+' photos. La première photo est affichée en boutique.</p>';
 const stage=byId('editor-photo-preview');
 if(stage)stage.innerHTML=kianaEditingPhotos.length?safeImg(kianaEditingPhotos[0],'Aperçu tenue'):
 '<div class="gallery-placeholder">Aucune photo</div>'
}
openLookEditor=function(id){
 const p=db.looks.find(x=>String(x.id)===String(id));if(!p)return;
 editorId=String(p.id);kianaEditingPhotos=lookPhotos(p).slice(0,KIANA_MAX_LOOK_PHOTOS);
 openModal('<div class="detail-grid"><div><div class="detail-photo" id="editor-photo-preview"></div><p class="help" style="margin-top:13px">Tu peux ajouter jusqu’à 8 photos par tenue : plusieurs angles et détails.</p></div>'+
 '<div><span class="eyebrow">FICHE DE LA TENUE</span><h2 class="serif" style="font-size:2.1rem;margin:8px 0 16px">'+escapeHtml(p.name)+'</h2>'+
 '<form id="admin-editor-form" class="admin-form">'+
 '<label>Nom de la tenue</label><input class="field" name="name" maxlength="90" required value="'+escapeHtml(p.name)+'">'+
 '<label>Prix ($)</label><input class="field" name="price" type="number" min="0" max="9999999" value="'+(Number(p.price)||0)+'">'+
 '<label>Petite description</label><textarea class="field" name="desc" maxlength="1200" rows="3">'+escapeHtml(p.desc)+'</textarea>'+
 '<label>Photos de la tenue</label><div class="admin-photo-list" id="admin-multi-photos"></div>'+
 '<div class="admin-add-photo"><input class="field" id="admin-new-photo-url" type="url" placeholder="Lien HTTPS vers une photo"><button type="button" class="btn btn-small" data-action="admin-gallery-add">+ AJOUTER</button></div>'+
 '<label>Ou importer plusieurs photos</label><input class="field" type="file" accept="image/jpeg,image/png,image/webp" multiple data-admin-change="multi-look-images">'+
 '<p class="admin-photo-hint">Les images sont compressées et sauvegardées uniquement sur cet appareil. Les très grandes galeries peuvent dépasser sa capacité de stockage.</p>'+
 '<label style="display:flex;gap:9px;align-items:center"><input type="checkbox" name="visible" '+(p.visible!==false?'checked':'')+'> Visible en boutique</label>'+
 '<div class="admin-actions"><button class="btn btn-primary" type="submit">ENREGISTRER</button><button type="button" class="btn btn-small" data-action="admin-duplicate-look">DUPLIQUER</button><button type="button" class="btn btn-small btn-danger" data-action="admin-delete-look">SUPPRIMER</button></div>'+
 '</form></div></div>');
 kianaShowPhotoList()
};
saveLookEditor=function(form){
 const p=db.looks.find(x=>String(x.id)===String(editorId));if(!p)return;
 const fd=new FormData(form),name=String(fd.get('name')||'').trim();
 if(!name){toast('Donne un nom à la tenue.');return}
 const draft={...p,name,price:Math.max(0,Math.min(9999999,Number(fd.get('price'))||0)),
 desc:String(fd.get('desc')||''),image:kianaEditingPhotos[0]||'',images:kianaEditingPhotos.slice(1),visible:fd.get('visible')!==null};
 const index=db.looks.indexOf(p);db.looks[index]=draft;
 if(!save()){db.looks[index]=p;return}
 closeModal();renderAdminLooks();renderHome();toast('Tenue et galerie enregistrées ♡')
};
function kianaNewPhotoURL(){
 const box=byId('admin-new-photo-url'),url=box?.value.trim()||'';
 if(!imageUrl(url)){toast('Ajoute un lien HTTPS valide vers une image.');return}
 if(kianaEditingPhotos.length>=KIANA_MAX_LOOK_PHOTOS){toast('Maximum de 8 photos par tenue.');return}
 if(kianaEditingPhotos.includes(url)){toast('Cette photo est déjà présente.');return}
 kianaEditingPhotos.push(url);box.value='';kianaShowPhotoList()
}
function kianaUploadOnePhoto(file){
 return new Promise((resolve,reject)=>{
  const fr=new FileReader();
  fr.onerror=()=>reject(Error('Lecture de fichier impossible'));
  fr.onload=()=>{
   const im=new Image();
   im.onerror=()=>reject(Error('Image non prise en charge'));
   im.onload=()=>{
    const canvas=document.createElement('canvas'),r=Math.min(1,760/im.width,760/im.height);
    canvas.width=Math.max(1,Math.round(im.width*r));canvas.height=Math.max(1,Math.round(im.height*r));
    canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);
    resolve(canvas.toDataURL('image/jpeg',.62))
   };im.src=fr.result
  };
  fr.readAsDataURL(file)
 })
}
async function kianaHandleMultipleImages(node){
 const files=[...(node.files||[])],selectedId=editorId;
 if(!files.length)return;
 for(const file of files){
  if(editorId!==selectedId)return;
  if(kianaEditingPhotos.length>=KIANA_MAX_LOOK_PHOTOS){toast('Limite de 8 photos atteinte.');break}
  if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>12*1024*1024){toast('Utilise JPG, PNG ou WebP (12 Mo maximum par photo).');continue}
  try{const photo=await kianaUploadOnePhoto(file);if(editorId!==selectedId)return;kianaEditingPhotos.push(photo);kianaShowPhotoList()}
  catch(e){toast(e.message||'Import de photo impossible')}
 }
 node.value='';toast('Photos prêtes. Clique sur Enregistrer pour les garder ♡')
}
const kianaBaseAdminAction=handleAdminAction;
handleAdminAction=function(action,node){
 const id=node.dataset?.id;
 if(action==='admin-gallery-add'){kianaNewPhotoURL();return}
 if(action==='admin-gallery-remove'){kianaEditingPhotos.splice(Number(id),1);kianaShowPhotoList();return}
 if(action==='admin-gallery-cover'){
  const i=Number(id);if(!kianaEditingPhotos[i])return;
  const photo=kianaEditingPhotos.splice(i,1)[0];kianaEditingPhotos.unshift(photo);kianaShowPhotoList();return
 }
 if(action==='admin-export-orders'){kianaExportOrders();return}
 if(action==='admin-notifications-readall'){
  db.readOrderNotifications=db.orders.map(o=>o.id);save();kianaRenderNotifications();kianaBadge();return
 }
 if(action==='admin-notifications-read'){
  if(!Array.isArray(db.readOrderNotifications))db.readOrderNotifications=[];
  if(!db.readOrderNotifications.includes(id))db.readOrderNotifications.push(id);
  save();kianaRenderNotifications();kianaBadge();return
 }
 if(action==='admin-notifications-orders'){
  adminTab='orders';adminSearch='';renderAdmin();return
 }
 kianaBaseAdminAction(action,node);
 if(action==='admin-delete-order')kianaBadge()
};
const kianaBaseAdminChange=handleAdminChange;
handleAdminChange=function(node){
 if(node.dataset.adminChange==='multi-look-images'){kianaHandleMultipleImages(node);return}
 if(node.dataset.adminChange==='orders-status-filter'){kianaFilters.status=node.value;updateAdminOrders();return}
 if(node.dataset.adminChange==='orders-kind-filter'){kianaFilters.kind=node.value;updateAdminOrders();return}
 if(node.dataset.adminChange==='orders-urgency-filter'){kianaFilters.urgent=node.value;updateAdminOrders();return}
 if(node.dataset.adminChange==='orders-date-from'){kianaFilters.from=node.value;updateAdminOrders();return}
 if(node.dataset.adminChange==='orders-date-to'){kianaFilters.to=node.value;updateAdminOrders();return}
 kianaBaseAdminChange(node)
};
const kianaBaseAdminInput=handleAdminInput;
handleAdminInput=function(node){
 if(node.dataset.adminInput==='order-search'){adminSearch=node.value;updateAdminOrders();return}
 kianaBaseAdminInput(node)
};
/* A local inbox based on the orders saved in this browser. */
function kianaUnread(){
 const seen=new Set(Array.isArray(db.readOrderNotifications)?db.readOrderNotifications:[]);
 return db.orders.filter(o=>!seen.has(o.id))
}
function kianaBadge(){
 const el=byId('admin-notif-count');if(!el)return;
 const n=kianaUnread().length;el.textContent=n>99?'99+':String(n);el.hidden=n===0
}
function kianaRenderNotifications(){
 const target=byId('admin-body');if(!target)return;
 const seen=new Set(Array.isArray(db.readOrderNotifications)?db.readOrderNotifications:[]);
 target.innerHTML=adminHeader('Centre de notifications','Les nouvelles commandes enregistrées sur cet appareil.',
 '<button class="btn btn-primary btn-small" data-action="admin-notifications-readall">TOUT MARQUER COMME LU</button>')+
 '<div class="notice">Ce centre ne reçoit pas encore les commandes envoyées par d’autres joueurs sur un autre téléphone ou PC. La synchronisation nécessite Supabase.</div>'+
 '<div class="notification-list">'+db.orders.slice(0,35).map(o=>
 '<div class="notification '+(!seen.has(o.id)?'unread':'')+'"><div class="notification-mark">✧</div><div class="notification-body"><strong>'+escapeHtml(o.id)+' · '+escapeHtml(o.kind==='boutique'?'Commande boutique':'Création sur mesure')+'</strong>'+
 '<p>'+escapeHtml(o.name)+' · '+escapeHtml(o.status)+(o.expressFee?' · EXPRESS +500 $':'')+'</p><small>'+escapeHtml(o.requestedDate?'Livraison souhaitée : '+o.requestedDate:'')+'</small></div>'+
 (!seen.has(o.id)?'<button class="btn btn-small" data-action="admin-notifications-read" data-id="'+escapeHtml(o.id)+'">MARQUER LU</button>':'<span class="muted">Lu</span>')+
 '</div>').join('')+'</div>'+
 (!db.orders.length?'<p class="panel" style="margin-top:15px">Aucune notification pour le moment.</p>':'')+
 '<div class="admin-actions"><button class="btn btn-primary" data-action="admin-notifications-orders">VOIR LES COMMANDES ↗</button></div>'
}
const kianaBaseRenderAdmin=renderAdmin;
renderAdmin=function(){
 kianaBaseRenderAdmin();
 if(adminTab==='notifications'&&founderUnlocked)kianaRenderNotifications();
 kianaBadge()
};
const kianaBaseStoreOrder=storeOrder;
storeOrder=function(order,seq){const ok=kianaBaseStoreOrder(order,seq);if(ok)kianaBadge();return ok};
/* Advanced order search: by status, type, urgency and order date, with CSV export. */
const kianaFilters={status:'all',kind:'all',urgent:'all',from:'',to:''};
function kianaOrderResults(){
 const q=adminSearch.toLowerCase().trim();
 return db.orders.filter(o=>{
  if(q&&!(o.id+' '+o.name+' '+(o.phone||'')+' '+o.service).toLowerCase().includes(q))return false;
  if(kianaFilters.status!=='all'&&o.status!==kianaFilters.status)return false;
  if(kianaFilters.kind==='boutique'&&o.kind!=='boutique')return false;
  if(kianaFilters.kind==='sur-mesure'&&o.kind==='boutique')return false;
  if(kianaFilters.urgent==='urgent'&&!(Number(o.expressFee)>0))return false;
  if(kianaFilters.urgent==='standard'&&Number(o.expressFee)>0)return false;
  const day=String(o.createdAt||'').slice(0,10);
  if(kianaFilters.from&&day<kianaFilters.from)return false;
  if(kianaFilters.to&&day>kianaFilters.to)return false;
  return true
 })
}
renderAdminOrders=function(){
 const root=byId('admin-body');
 root.innerHTML=adminHeader('Gestion des commandes','Retrouve, filtre, modifie ou exporte une commande.',
 '<button class="btn btn-primary btn-small" data-action="admin-export-orders">EXPORTER CSV ↗</button>')+
 '<div class="notice" style="margin-bottom:17px">Les commandes visibles ici sont celles créées sur cet appareil uniquement.</div>'+
 '<div class="admin-order-filters"><input class="field" data-admin-input="order-search" placeholder="Numéro, nom, téléphone..." value="'+escapeHtml(adminSearch)+'">'+
 '<select class="field" id="order-filter-status" data-admin-change="orders-status-filter"><option value="all">Tous statuts</option><option>En préparation</option><option>Livrée</option></select>'+
 '<select class="field" id="order-filter-kind" data-admin-change="orders-kind-filter"><option value="all">Toutes demandes</option><option value="boutique">Boutique</option><option value="sur-mesure">Sur mesure</option></select>'+
 '<select class="field" id="order-filter-urgent" data-admin-change="orders-urgency-filter"><option value="all">Toutes priorités</option><option value="urgent">Urgentes +500 $</option><option value="standard">Standards</option></select></div>'+
 '<div class="admin-date-filters"><span class="muted">Du</span><input class="field" type="date" id="order-filter-from" data-admin-change="orders-date-from"><span class="muted">au</span><input class="field" type="date" id="order-filter-to" data-admin-change="orders-date-to"></div>'+
 '<div class="admin-filter-summary"><span id="orders-filter-count"></span><button class="btn btn-small" data-action="admin-orders-reset">EFFACER LES FILTRES</button></div>'+
 '<div class="admin-orders" id="admin-order-list"></div>';
 for(const [id,value] of [['order-filter-status',kianaFilters.status],['order-filter-kind',kianaFilters.kind],['order-filter-urgent',kianaFilters.urgent],['order-filter-from',kianaFilters.from],['order-filter-to',kianaFilters.to]])byId(id).value=value;
 updateAdminOrders()
};
const kianaMainAdminAction=handleAdminAction;
handleAdminAction=function(a,node){
 if(a==='admin-orders-reset'){adminSearch='';Object.assign(kianaFilters,{status:'all',kind:'all',urgent:'all',from:'',to:''});renderAdminOrders();return}
 kianaMainAdminAction(a,node)
};
updateAdminOrders=function(){
 const root=byId('admin-order-list');if(!root)return;
 const orders=kianaOrderResults(),count=byId('orders-filter-count');
 if(count)count.textContent=orders.length+' commande'+(orders.length>1?'s':'')+' affichée'+(orders.length>1?'s':'');
 root.innerHTML=orders.map(o=>{
  const items=orderItems(o),shop=o.kind==='boutique'||items.length>0;
  const details=shop?
   '<div class="order-admin-products">'+items.map(i=>'<div class="order-admin-product"><span>'+escapeHtml(i.qty+' × '+i.name)+'</span><b>'+price(i.price*i.qty)+'</b></div>').join('')+'</div>':
   '<p><b>Création sur mesure</b><br>Budget : '+price(o.budget??null)+'<br>Mode : '+escapeHtml(o.mode||'Choix libre')+
   '<br>Couleur : '+escapeHtml(o.color||'')+'<br>Options : '+escapeHtml(orderOptionsText(o))+'</p>';
  return '<article class="admin-order"><div class="admin-order-head"><div><strong>'+escapeHtml(o.id)+'</strong><br><small>'+escapeHtml(o.name)+' · '+escapeHtml(o.phone||o.contact||'')+'</small>'+
  (o.expressFee?'<span class="urgent-label">✦ URGENT · +500 $</span>':'')+
  '</div><span class="price">'+kianaReceiptAmount(o)+'</span></div>'+
  '<p><b>Service :</b> '+escapeHtml(o.service||'Commande')+'</p>'+details+
  '<p><b>Livraison souhaitée :</b> '+escapeHtml(o.requestedDate||'Non précisée')+'</p>'+
  (shop?'<p><b>Sous-total :</b> '+price(o.subtotal??o.price)+' · Express : '+price(o.expressFee||0)+'</p>':
  '<p><b>Prix de création :</b> sur devis · Express : '+price(o.expressFee||0)+'</p>')+
  (o.wants?'<p><b>Envies :</b> '+escapeHtml(o.wants)+'</p>':'')+
  (o.avoid?'<p><b>À éviter :</b> '+escapeHtml(o.avoid)+'</p>':'')+
  '<div class="admin-actions"><select class="field" aria-label="Statut" style="width:210px" data-admin-change="order-status" data-id="'+escapeHtml(o.id)+'"><option '+(o.status==='En préparation'?'selected':'')+'>En préparation</option><option '+(o.status==='Livrée'?'selected':'')+'>Livrée</option></select>'+
  '<button class="btn btn-small btn-danger" data-action="admin-delete-order" data-id="'+escapeHtml(o.id)+'">SUPPRIMER</button></div></article>'
 }).join('')||'<div class="panel">Aucune commande trouvée avec ces filtres.</div>'
};
function kianaCsvEscape(v){
 let raw=String(v??'');if(/^[\s]*[=+\-@]/.test(raw))raw="'"+raw;
 return '"'+raw.replace(/"/g,'""')+'"'
}
function kianaExportOrders(){
 const rows=kianaOrderResults(),head=['Numéro','Date commande','Livraison','Client','Téléphone','Type','Service','Statut','Articles','Budget','Sous-total','Express','Total','Couleur','Options','Envies','À éviter'];
 const records=rows.map(o=>[
  o.id,o.createdAt||'',o.requestedDate||'',o.name,o.phone||'',o.kind||'',o.service||'',o.status||'',
  orderItems(o).map(x=>x.qty+' × '+x.name).join(' / '),o.budget??'',o.subtotal??'',
  o.expressFee??0,kianaReceiptAmount(o),o.color||'',orderOptionsText(o),o.wants||'',o.avoid||''
 ]);
 const csv='\uFEFF'+[head,...records].map(row=>row.map(kianaCsvEscape).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
 const link=document.createElement('a');link.href=url;link.download='kiana-commandes-'+kianaToday()+'.csv';link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);toast(rows.length+' commande(s) exportée(s) ♡')
}
const kianaOldCartAdd=cartAdd;
cartAdd=function(id){
 kianaOldCartAdd(id);
 const badge=byId('nav-cart-count');if(badge){badge.classList.remove('bump');void badge.offsetWidth;badge.classList.add('bump')}
};

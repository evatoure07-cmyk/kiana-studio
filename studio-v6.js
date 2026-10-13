
/* KIANA STUDIO V6: order forms and numbered phone tracking.
   Important: browser-local demonstration. IDs aren't globally unique without backend. */
const v6Services=[
'Commande d’un look du catalogue',
'Création de tenue sur mesure',
'Customisation d’une tenue existante',
'Tenue de soirée / événement',
'Relooking / conseil en style',
'Tenue professionnelle',
'Autre (à préciser)'
];
const v6Accessories=[
['hat','Chapeau'],['accessories','Accessoires'],['mask','Masque'],['gloves','Gants'],
['glasses','Lunettes'],['bag','Sac'],['jewelry','Bijoux'],['shoes','Chaussures']
];
function v6Id(prefix,key){return 'v6-'+prefix+'-'+key}
function v6Fields(prefix,defaultService){
 const p=prefix,service=defaultService||v6Services[0],otherId=v6Id(p,'other');
 const options=v6Accessories.map(([key,label])=>{
  const n=v6Id(p,key);
  return '<div class="option-line"><span class="option-name">'+label+'</span><div class="yesno" role="group" aria-label="'+label+'">'+
    '<label><input type="radio" name="'+n+'" value="Oui"> Oui</label>'+
    '<label><input type="radio" name="'+n+'" value="Non" checked> Non</label></div></div>';
 }).join('');
 return '<div class="commission-fields">'+
 '<section class="commission-section"><span class="commission-step">ÉTAPE 01 / IDENTITÉ RP</span><h3>Pour qui est la commande ?</h3>'+
 '<div class="twocol"><div><label for="'+v6Id(p,'name')+'">Nom et prénom RP *</label><input class="field" id="'+v6Id(p,'name')+'" maxlength="70" autocomplete="name" placeholder="Prénom Nom" required></div>'+
 '<div><label for="'+v6Id(p,'phone')+'">Numéro de téléphone RP *</label><input class="field" type="tel" id="'+v6Id(p,'phone')+'" maxlength="24" inputmode="tel" autocomplete="tel" placeholder="Ex. 555-0123" required></div></div>'+
 '<p class="commission-intro">Garde ce numéro : il servira avec ton code COMMANDE-01, COMMANDE-02… pour retrouver le suivi RP.</p></section>'+
 '<section class="commission-section"><span class="commission-step">ÉTAPE 02 / PRESTATION</span><h3>De quel service as-tu besoin ?</h3>'+
 '<label for="'+v6Id(p,'service')+'">Service souhaité *</label><select class="field" id="'+v6Id(p,'service')+'" onchange="v6ServiceChange(\''+p+'\')">'+
 v6Services.map(s=>'<option '+(s===service?'selected':'')+'>'+esc(s)+'</option>').join('')+'</select>'+
 '<div id="'+v6Id(p,'other-wrap')+'" hidden><label for="'+otherId+'">Précise ton autre service *</label><input class="field" id="'+otherId+'" maxlength="160" placeholder="Explique la prestation que tu recherches"></div>'+
 '<p class="commission-intro">Choisis précisément le type de création ou de conseil que tu demandes.</p></section>'+
 '<section class="commission-section"><span class="commission-step">ÉTAPE 03 / CRÉATION</span><h3>Comment veux-tu ton look ?</h3>'+
 '<div class="mode-cards">'+
 '<label class="mode-card"><input type="radio" name="'+v6Id(p,'mode')+'" value="Choix libre" checked onchange="v6ModeChange(\''+p+'\')"><span class="mode-icon">✦</span><strong>Choix libre</strong><small>Kiana choisit l’ensemble du style et des détails pour toi.</small></label>'+
 '<label class="mode-card"><input type="radio" name="'+v6Id(p,'mode')+'" value="Customisation" onchange="v6ModeChange(\''+p+'\')"><span class="mode-icon">♡</span><strong>Customisation</strong><small>Tu choisis les pièces et accessoires souhaités, oui ou non.</small></label>'+
 '</div><p class="choice-caption" id="'+v6Id(p,'mode-hint')+'">Choix libre : tu laisses Kiana composer ton look, avec les indications que tu donnes ci-dessous.</p>'+
 '<div class="customization-box" id="'+v6Id(p,'custom')+'" hidden><h4>Personnalise ton outfit ♡</h4><p class="commission-intro">Coche « Oui » pour demander la pièce, ou « Non » pour ne pas l’inclure.</p><div class="option-grid">'+options+'</div></div></section>'+
 '<section class="commission-section"><span class="commission-step">ÉTAPE 04 / DERNIERS DÉTAILS</span><h3>Tes envies & tes limites</h3>'+
 '<label for="'+v6Id(p,'wants')+'">Décris le style et les détails que tu veux</label><textarea class="field" id="'+v6Id(p,'wants')+'" maxlength="1800" placeholder="Couleurs, style, inspiration, occasion, préférence particulière…"></textarea>'+
 '<label for="'+v6Id(p,'avoid')+'">Qu’est-ce que tu ne veux surtout pas ?</label><textarea class="field" id="'+v6Id(p,'avoid')+'" maxlength="1800" placeholder="Ex. : pas de rose, pas de jupe, pas de talons, pas de masque…"></textarea>'+
 '<p class="commission-intro">Ces indications permettent à Kiana de respecter les goûts de ton personnage.</p></section>'+
 '</div>';
}
function v6ModeChange(prefix){
 const mode=document.querySelector('input[name="'+v6Id(prefix,'mode')+'"]:checked')?.value||'Choix libre';
 const custom=document.getElementById(v6Id(prefix,'custom')),hint=document.getElementById(v6Id(prefix,'mode-hint'));
 if(custom)custom.hidden=mode!=='Customisation';
 if(hint)hint.textContent=mode==='Choix libre'?'Choix libre : Kiana compose ton look selon tes envies.':'Customisation : choisis exactement les pièces à ajouter ou à éviter.';
}
function v6ServiceChange(prefix){
 const other=document.getElementById(v6Id(prefix,'other-wrap'));
 const field=document.getElementById(v6Id(prefix,'other'));
 const selected=document.getElementById(v6Id(prefix,'service'))?.value;
 if(other)other.hidden=selected!=='Autre (à préciser)';
 if(field)field.required=selected==='Autre (à préciser)';
}
function v6PhoneNumber(v){return String(v||'').replace(/\D/g,'')}
function v6Read(prefix){
 const read=k=>document.getElementById(v6Id(prefix,k))?.value.trim()||'';
 const name=read('name'),phone=read('phone');
 if(name.length<2){studioToast('Renseigne ton nom RP.');document.getElementById(v6Id(prefix,'name'))?.focus();return null}
 if(!/^\+?[\d\s().-]+$/.test(phone)||v6PhoneNumber(phone).length<5||v6PhoneNumber(phone).length>18){studioToast('Indique un numéro de téléphone RP valide.');document.getElementById(v6Id(prefix,'phone'))?.focus();return null}
 let service=read('service');
 if(service==='Autre (à préciser)'){
  const other=read('other');if(!other){studioToast('Précise le service demandé.');document.getElementById(v6Id(prefix,'other'))?.focus();return null}
  service='Autre : '+other;
 }
 const mode=document.querySelector('input[name="'+v6Id(prefix,'mode')+'"]:checked')?.value||'Choix libre';
 const preferences={};
 if(mode==='Customisation')for(const [key] of v6Accessories){preferences[key]=document.querySelector('input[name="'+v6Id(prefix,key)+'"]:checked')?.value||'Non'}
 return {name,phone,contact:phone,service,mode,preferences,wants:read('wants'),avoid:read('avoid')};
}
function v6AccessoryList(order,selectedOnly=false){
 if(order.mode!=='Customisation')return'';
 return v6Accessories.filter(([key])=>!selectedOnly||order.preferences?.[key]==='Oui').map(([key,label])=>label+' : '+(order.preferences?.[key]||'Non')).join(' · ');
}
function v6Seq(){
 const saved=Number(db.orderSequence)||0;
 const existing=Math.max(0,...(db.orders||[]).map(o=>Number((/^COMMANDE-(\d+)$/i.exec(String(o.id))||[])[1])||0));
 return Math.max(saved,existing)+1;
}
function v6CreateOrder(info,items,total){
 const sequence=v6Seq();
 const id='COMMANDE-'+String(sequence).padStart(2,'0');
 const order={
  ...info,id,items:items.map(x=>({...x})),total,
  status:'En préparation',createdAt:new Date().toISOString()
 };
 const prev=db.orderSequence;
 db.orderSequence=sequence;db.orders.unshift(order);
 if(!save()){db.orders.shift();db.orderSequence=prev;studioToast('Impossible de sauvegarder la commande sur cet appareil.');return false}
 lastReceipt=order;bag=[];drawBadge();closeModal();navigate('receiptpage');renderReceipt();studioToast('Commande '+id+' créée ♡');
 return true;
}
function v6RenderCommission(){
 const target=document.getElementById('commissionFields');if(!target)return;
 target.innerHTML=v6Fields('commission','Création de tenue sur mesure');
 const form=document.getElementById('commissionForm');
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const info=v6Read('commission');if(!info)return;
  const item={id:Date.now(),name:info.service,qty:1,price:0,variants:info.mode};
  v6CreateOrder(info,[item],null)
 });
}
function v6Cart(){
 const total=bag.reduce((a,x)=>a+x.price*x.qty,0);
 const summary=bag.map(x=>'<div class="checkrow"><div><strong>'+esc(x.name)+'</strong><br><small>'+esc(x.variants||'')+'</small><br>'+money(x.price)+'</div><div><button class="smallbtn" aria-label="Enlever une unité" onclick="changeQty('+Number(x.id)+',-1)">−</button>'+Number(x.qty)+'<button class="smallbtn" aria-label="Ajouter une unité" onclick="changeQty('+Number(x.id)+',1)">+</button></div></div>').join('');
 showModal('<span class="eyebrow">KIANA SHOPPING BAG</span><h2>Ton panier ♡</h2>'+
 (bag.length?summary+'<h3>Total : '+money(total)+'</h3><p class="commission-intro">Avant de valider, précise le service et tes préférences. Même un look du catalogue peut être demandé en choix libre ou en customisation.</p>'+
 v6Fields('cart','Commande d’un look du catalogue')+'<button class="btn hot form-submit" onclick="checkout()">CRÉER MA COMMANDE RP ↗</button><p class="track-fineprint">Commande fictive enregistrée uniquement sur ce navigateur.</p>':
 '<p>Ton panier est vide. Parcours la boutique ou commande une tenue entièrement sur mesure.</p><button class="btn hot" onclick="closeModal();navigate(\'commission\')">CRÉATION SUR MESURE ♡</button>'))
}
v5Cart=function(){v6Cart()};
showCart=function(){v6Cart()};
changeQty=function(id,delta){const item=bag.find(x=>x.id===id);if(!item)return;item.qty+=delta;if(item.qty<=0)bag=bag.filter(x=>x.id!==id);drawBadge();v6Cart()};
checkout=function(){
 if(!bag.length){studioToast('Ajoute au moins un look au panier.');return}
 const info=v6Read('cart');if(!info)return;
 const lines=bag.map(x=>({...x}));
 v6CreateOrder(info,lines,lines.reduce((a,x)=>a+Number(x.price||0)*Number(x.qty||0),0))
};
function v6Price(total){return total==null?'Tarif sur devis RP':money(total)}
function v6ReceiptHTML(order){
 const entries=order.items.map(x=>'<div class="receiptline"><span>'+esc(x.name)+' ×'+Number(x.qty||1)+(x.variants?'<small style="display:block">'+esc(x.variants)+'</small>':'')+'</span><span>'+ (order.total==null?'Sur devis':money(x.price*x.qty)) +'</span></div>').join('');
 const options=order.mode==='Customisation'?'<p class="order-receipt-notes"><b>Options demandées</b><br>'+esc(v6AccessoryList(order))+'</p>':'';
 return '<div class="bigreceipt"><h3>KIANA STUDIO ✦</h3><p style="text-align:center">YOUR FASHION RECEIPT ♡</p>'+
 '<div class="receiptline"><b>'+esc(order.id)+'</b><span>FLASHFA RP</span></div>'+
 '<div class="receiptline"><span>'+esc(order.name)+'</span><span>♡</span></div>'+
 '<div class="receiptline"><span>Téléphone RP</span><span>'+esc(order.phone)+'</span></div>'+
 '<div class="receiptline"><span>Prestation</span><span>'+esc(order.service)+'</span></div>'+
 '<div class="receiptline"><span>Formule</span><span>'+esc(order.mode)+'</span></div>'+entries+
 '<div class="receiptline"><b>TOTAL</b><b>'+v6Price(order.total)+'</b></div>'+
 options+(order.wants?'<p class="order-receipt-notes"><b>Ce que je veux :</b><br>'+esc(order.wants)+'</p>':'')+
 (order.avoid?'<p class="order-receipt-notes"><b>Ce que je ne veux pas :</b><br>'+esc(order.avoid)+'</p>':'')+
 '<div class="barcode"></div><p style="text-align:center">THANK YOU, PRETTY ♡</p><div class="order-receipt-reference">'+esc(order.id)+'</div></div>';
}
renderReceipt=function(){
 if(!lastReceipt)return;
 const wrap=document.getElementById('receiptRender');wrap.innerHTML=v6ReceiptHTML(lastReceipt)+
 '<div class="actions" style="justify-content:center;margin:34px 0"><button class="btn hot" onclick="clipboard(receiptText())">COPIER MON REÇU</button><button class="btn" onclick="navigate(\'tracking\')">SUIVRE MA COMMANDE</button><button class="btn" onclick="navigate(\'shop\')">CONTINUER LE SHOPPING</button></div>'+
 '<p class="hint" style="text-align:center">Enregistre ton numéro et partage ce reçu avec Kiana dans le jeu RP. Les commandes ne sont pas transmises automatiquement à la fondatrice.</p>';
};
receiptText=function(){
 const r=lastReceipt;if(!r)return'';
 return ['KIANA STUDIO — '+r.id,'Client RP : '+r.name,'Téléphone RP : '+r.phone,
 'Prestation : '+r.service,'Formule : '+r.mode, ...(r.mode==='Customisation'?['Customisation : '+v6AccessoryList(r)]:[]),
 ...(r.wants?['Souhaits : '+r.wants]:[]),...(r.avoid?['À éviter : '+r.avoid]:[]),
 ...r.items.map(x=>x.name+' x'+x.qty+' : '+(r.total==null?'Sur devis':money(x.price*x.qty))+(x.variants?' | '+x.variants:'')),
 'Total : '+v6Price(r.total),'Statut : '+r.status,'Démo locale : à transmettre à Kiana'].join('\n');
};
v5Track=function(){
 const code=document.getElementById('trackNumber').value.trim().toUpperCase();
 const phone=document.getElementById('trackContact').value.trim();
 const dest=document.getElementById('trackResult');
 if(!code||!phone){dest.innerHTML='<div class="track-result">Renseigne ton numéro de téléphone RP et ton numéro de commande.</div>';return}
 const order=db.orders.find(o=>String(o.id).toUpperCase()===code&&v6PhoneNumber(o.phone||o.contact)===v6PhoneNumber(phone)&&v6PhoneNumber(phone).length>=5);
 if(!order){dest.innerHTML='<div class="track-result"><b>Commande introuvable sur cet appareil.</b><p class="hint">Vérifie le numéro de téléphone et le code de commande. Le suivi partagé entre PC nécessite toujours Supabase.</p></div>';return}
 const done=order.status==='Livrée';
 dest.innerHTML='<div class="track-result"><span class="eyebrow">KIANA · ORDER TRACKING</span><h3>'+esc(order.id)+'</h3><p>'+esc(order.name)+' · '+v6Price(order.total)+'</p>'+
 '<div class="track-steps"><div class="track-step active"><span>✂</span>En préparation</div><div class="track-step '+(done?'active':'')+'"><span>♡</span>Livrée</div></div>'+
 '<div class="order-details"><p><b>Service :</b> '+esc(order.service||'Commande catalogue')+'</p><p><b>Formule :</b> '+esc(order.mode||'Non précisée')+'</p>'+
 (order.mode==='Customisation'?'<p><b>Options :</b> '+esc(v6AccessoryList(order))+'</p>':'')+
 (order.wants?'<p><b>Demandes :</b> '+esc(order.wants)+'</p>':'')+(order.avoid?'<p><b>À éviter :</b> '+esc(order.avoid)+'</p>':'')+'</div>'+
 '<p><b>Statut actuel :</b> '+esc(order.status)+'</p></div>'
};
v5FounderOrders=function(){
 let html=studioAdminHeader('Commandes & créations RP','Gère les commandes en préparation et celles déjà livrées.');
 html+='<div class="demo-notice">Démo locale : les commandes des autres joueurs ne sont pas reçues ici. Le suivi partagé nécessitera une base Supabase.</div>';
 if(!db.orders.length){html+='<div class="admin-order-card">Aucune commande sur cet appareil. <button class="btn hot" onclick="navigate(\'commission\')">TESTER UNE DEMANDE SUR MESURE</button></div>'}
 else html+=db.orders.map((o,i)=>'<article class="admin-order-card"><div class="admin-order-heading"><div><strong>'+esc(o.id)+'</strong><p class="hint">'+esc(o.name)+' · Téléphone RP : '+esc(o.phone||o.contact||'Non renseigné')+'</p></div><span class="eyebrow">'+v6Price(o.total)+'</span></div>'+
 '<div class="order-details"><p><b>Service :</b> '+esc(o.service||'Commande du catalogue')+'</p><p><b>Mode :</b> '+esc(o.mode||'Non précisé')+'</p>'+
 (o.mode==='Customisation'?'<p><b>Personnalisation :</b> '+esc(v6AccessoryList(o))+'</p>':'')+
 (o.wants?'<p><b>Ce que le client veut :</b> '+esc(o.wants)+'</p>':'')+
 (o.avoid?'<p><b>Ce que le client refuse :</b> '+esc(o.avoid)+'</p>':'')+
 '<p><b>Tenues :</b> '+o.items.map(x=>esc(x.name)+' ×'+Number(x.qty||1)+(x.variants?' — '+esc(x.variants):'')).join(', ')+'</p></div>'+
 '<div class="editor-actions"><select id="v5Order'+i+'" aria-label="Statut '+esc(o.id)+'"><option '+(o.status==='En préparation'?'selected':'')+'>En préparation</option><option '+(o.status==='Livrée'?'selected':'')+'>Livrée</option></select><button class="btn hot" onclick="v5SaveOrder('+i+')">ENREGISTRER LE STATUT</button></div></article>').join('');
 document.getElementById('adminPanel').innerHTML=html;
};
v6RenderCommission();
if(location.hash==='#commission')navigate('commission');

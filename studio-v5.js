
/* KIANA STUDIO V5 — local RP demonstration; no cross-device synchronization */
const v5DefaultSeasons=[
 {id:"pink-friday",name:"Pink Friday",category:"Baddie",description:"Rose, audace et énergie baddie.",image:IMAGES[0],active:true},
 {id:"midnight-glam",name:"Midnight Glam",category:"Glam",description:"Des tenues glamour pour briller de nuit.",image:IMAGES[1],active:true},
 {id:"baddie-essentials",name:"Baddie Essentials",category:"Y2K",description:"Les indispensables de ton dressing RP.",image:IMAGES[2],active:true}
];
function v5Init(){
 if(!Array.isArray(db.seasons))db.seasons=structuredClone(v5DefaultSeasons);
 if(!Array.isArray(db.orders))db.orders=[];
 if(!db.monthLookId)db.monthLookId=1;
}
v5Init();
const v5DrawAllBefore=drawAll;
drawAll=function(){v5DrawAllBefore();v5RenderSeasons();v5RenderMonth()};
function v5RenderSeasons(){
 const el=document.getElementById("seasonCards");if(!el)return;
 const seasons=db.seasons.filter(s=>s.active!==false);
 el.innerHTML=seasons.map(s=>'<button class="season-card" onclick="v5OpenSeason('+db.seasons.indexOf(s)+')">'+(img(s.image)?'<img src="'+esc(img(s.image))+'" alt="" loading="lazy">':'')+'<span class="season-spark">✦</span><div class="content"><span class="eyebrow">KIANA CAPSULE COLLECTION</span><strong>'+esc(s.name)+'</strong><p>'+esc(s.description)+'</p><span>VOIR LA COLLECTION ↗</span></div></button>').join('');
 if(!seasons.length)el.innerHTML='<p>Une nouvelle collection arrive bientôt ♡</p>';
}
function v5OpenSeason(index){
 const s=db.seasons[index];if(!s)return;
 category=s.category;navigate("shop");drawShop();studioToast('Collection '+s.name+' ♡')
}
function v5RenderMonth(){
 const el=document.getElementById("monthLook");if(!el)return;
 const p=db.looks.find(p=>p.id===db.monthLookId&&p.visible!==false)||db.looks.find(p=>p.visible!==false);
 if(!p){el.innerHTML='<p>Le look du mois arrive bientôt ♡</p>';return}
 el.innerHTML='<div class="month-photo">'+(img(p.image)?'<img src="'+esc(img(p.image))+'" alt="'+esc(p.name)+'">':'')+'<span class="month-sticker">✦ LOOK DU MOIS ✦</span></div><div class="month-copy"><span class="month-label">ÉDITION KIANA · FASHION PICK</span><h3>'+esc(p.name)+'</h3><p>'+esc(p.desc)+'</p><span class="eyebrow">'+esc(p.category)+'</span><span class="month-price">'+money(p.price)+'</span><div class="actions"><button class="btn hot" onclick="v5OpenFitting('+Number(p.id)+')">PERSONNALISER CE LOOK ♡</button><button class="btn" onclick="navigate(\'shop\')">BOUTIQUE ↗</button></div></div>';
}
let v5Fitting=null;
function v5Pieces(p){return String(p.parts||'').split(/[•,;\n]/).map(x=>x.trim()).filter(Boolean)}
function v5Options(v,fallback){let arr=String(v||'').split(/[;,]/).map(x=>x.trim()).filter(Boolean);return arr.length?arr:fallback}
function v5OpenFitting(id){
 const p=db.looks.find(x=>x.id===id&&x.visible!==false);if(!p)return;
 const colors=v5Options(p.colors,['Rose','Violet','Noir']);
 const sizes=v5Options(p.sizes,['XS','S','M','L','XL']);
 v5Fitting={id:p.id,color:colors[0],size:sizes.includes('M')?'M':sizes[0],extras:[]};
 v5ShowFitting()
}
detail=function(id){v5OpenFitting(id)};
add=function(id){v5OpenFitting(id)};
function v5Choice(buttons,type){
 return buttons.map((v,i)=>'<button class="outfit-choice '+(v5Fitting[type]===v?'active':'')+'" onclick="v5SetChoice(\''+type+'\','+i+')">'+esc(v)+'</button>').join('')
}
function v5SetChoice(type,index){const p=db.looks.find(x=>x.id===v5Fitting?.id);if(!p)return;const list=type==='color'?v5Options(p.colors,['Rose','Violet','Noir']):v5Options(p.sizes,['XS','S','M','L','XL']);if(list[index]!==undefined)v5Fitting[type]=list[index];v5ShowFitting()}
const v5Extras=[{id:"accessories",label:"Bijoux et accessoires assortis",price:120},{id:"bag",label:"Sac coordonné",price:180},{id:"shoes",label:"Chaussures supplémentaires",price:210}];
function v5Total(p){return Number(p.price||0)+v5Extras.filter(x=>v5Fitting.extras.includes(x.id)).reduce((sum,x)=>sum+x.price,0)}
function v5ToggleExtra(id){let a=v5Fitting.extras;v5Fitting.extras=a.includes(id)?a.filter(x=>x!==id):a.concat(id);v5ShowFitting()}
function v5ShowFitting(){
 const p=db.looks.find(x=>x.id===v5Fitting?.id);if(!p)return;
 const colors=v5Options(p.colors,['Rose','Violet','Noir']),sizes=v5Options(p.sizes,['XS','S','M','L','XL']);
 const extras=v5Extras.map(x=>'<label class="outfit-extra"><input type="checkbox" '+(v5Fitting.extras.includes(x.id)?'checked':'')+' onchange="v5ToggleExtra(\''+x.id+'\')"><span>'+esc(x.label)+'</span><b>+'+money(x.price)+'</b></label>').join('');
 showModal('<div class="outfit-grid"><div class="outfit-photo">'+(img(p.image)?'<img src="'+esc(img(p.image))+'" alt="'+esc(p.name)+'">':'<div style="padding:30px">KIANA LOOK ♡</div>')+'</div><div class="outfit-config"><span class="eyebrow">THE KIANA FITTING ROOM</span><h2>'+esc(p.name)+'</h2><p>'+esc(p.desc)+'</p><div class="outfit-sub">Composition de la tenue</div><div class="outfit-pieces">'+v5Pieces(p).map(x=>'<span class="outfit-piece">✦ '+esc(x)+'</span>').join('')+'</div><div class="outfit-sub">Couleur RP</div><div class="outfit-choices">'+v5Choice(colors,'color')+'</div><div class="outfit-sub">Taille RP</div><div class="outfit-choices">'+v5Choice(sizes,'size')+'</div><div class="outfit-sub">Options à ajouter</div>'+extras+'<div class="outfit-end"><strong>'+money(v5Total(p))+'</strong><button class="btn hot" onclick="v5AddCustomized()">AJOUTER AU PANIER ♡</button></div><p class="hint">Choix et tarifs RP fictifs. Les variantes sont des indications pour le stylisme, pas un essayage 3D.</p></div></div>');
}
function v5AddCustomized(){
 const p=db.looks.find(x=>x.id===v5Fitting?.id);if(!p)return;
 const variants='Couleur : '+v5Fitting.color+' · Taille : '+v5Fitting.size+(v5Fitting.extras.length?' · Options : '+v5Extras.filter(x=>v5Fitting.extras.includes(x.id)).map(x=>x.label).join(', '):'');
 let key=Date.now();while(bag.some(x=>x.id===key))key++;
 bag.push({id:key,lookId:p.id,name:p.name,price:v5Total(p),qty:1,variants,category:p.category});
 drawBadge();closeModal();v5Cart();studioToast('Ta tenue personnalisée est dans le panier ♡')
}
showCart=function(){v5Cart()};
function v5Cart(){
 const total=bag.reduce((sum,x)=>sum+x.price*x.qty,0);
 showModal('<span class="eyebrow">YOUR FASHION BAG</span><h2>Le panier ♡</h2>'+
 (bag.length?bag.map(x=>'<div class="checkrow"><div><b>'+esc(x.name)+'</b><br><small>'+esc(x.variants||'')+'</small><br>'+money(x.price)+'</div><div><button class="smallbtn" onclick="changeQty('+Number(x.id)+',-1)">−</button>'+x.qty+'<button class="smallbtn" onclick="changeQty('+Number(x.id)+',1)">+</button></div></div>').join('')+'<h3>TOTAL : '+money(total)+'</h3><label>Nom de personnage RP</label><input class="field" id="orderName" maxlength="70" placeholder="Prénom Nom"><label>Contact RP</label><input class="field" id="orderContact" maxlength="120" placeholder="Discord ou téléphone IG"><button class="btn hot" style="margin-top:20px" onclick="checkout()">VALIDER MA COMMANDE RP</button><p class="hint">Commande fictive. Le suivi reste sur ce navigateur, sans réception automatique par Kiana.</p>':'<p>Ton panier est vide. Découvre les collections pour choisir ton look ♡</p>'))
}
changeQty=function(id,delta){let x=bag.find(x=>x.id===id);if(!x)return;x.qty+=delta;if(x.qty<=0)bag=bag.filter(x=>x.id!==id);drawBadge();v5Cart()};
const v5BeforeCheckout=checkout;
checkout=function(){
 const name=document.getElementById('orderName')?.value.trim(),contact=document.getElementById('orderContact')?.value.trim();
 if(!name||!contact){studioToast('Ajoute ton nom et ton contact RP.');return}
 const variants=bag.map(x=>({...x}));v5BeforeCheckout();
 if(!lastReceipt)return;
 lastReceipt.items=variants;lastReceipt.createdAt=new Date().toISOString();lastReceipt.status='En préparation';
 db.orders.unshift({...lastReceipt,items:variants});
 save();renderReceipt()
};
receiptText=function(){
 if(!lastReceipt)return'';
 return 'KIANA STUDIO — REÇU RP\n'+lastReceipt.id+'\nClient : '+lastReceipt.name+'\nContact RP : '+lastReceipt.contact+'\n'+lastReceipt.items.map(x=>x.name+' x'+x.qty+' — '+money(x.price*x.qty)+(x.variants?'\n'+x.variants:'')).join('\n')+'\nTOTAL : '+money(lastReceipt.total)+'\nStatut : En préparation';
};
const v5BeforeReceipt=renderReceipt;
renderReceipt=function(){
 v5BeforeReceipt();if(!lastReceipt)return;
 const root=document.getElementById('receiptRender');
 const receipt=root.querySelector('.bigreceipt');if(receipt){
  const foot=document.createElement('div');foot.className='order-receipt-reference';foot.textContent='✧ NUMÉRO DE SUIVI : '+lastReceipt.id;receipt.appendChild(foot);
 }
 const actions=root.querySelector('.actions');if(actions){const b=document.createElement('button');b.className='btn';b.textContent='SUIVRE MA COMMANDE ↗';b.onclick=()=>{navigate('tracking');document.getElementById('trackNumber').value=lastReceipt.id;document.getElementById('trackContact').value=lastReceipt.contact;v5Track()};actions.appendChild(b)}
};
function v5Track(){
 const code=document.getElementById('trackNumber').value.trim().toUpperCase();
 const contact=document.getElementById('trackContact').value.trim().toLowerCase();
 const target=document.getElementById('trackResult');if(!code||!contact){target.innerHTML='<p>Indique ton numéro et ton contact RP.</p>';return}
 const order=db.orders.find(o=>o.id.toUpperCase()===code&&String(o.contact).trim().toLowerCase()===contact);
 if(!order){target.innerHTML='<div class="track-result">Commande introuvable sur cet appareil. Le suivi partagé entre joueurs arrivera après la connexion à Supabase.</div>';return}
 const delivered=order.status==='Livrée';
 target.innerHTML='<div class="track-result"><span class="eyebrow">KIANA STUDIO TRACKING</span><h3>'+esc(order.id)+'</h3><p>'+esc(order.name)+' · '+money(order.total)+'</p><div class="track-steps"><div class="track-step active"><span>✂</span>En préparation</div><div class="track-step '+(delivered?'active':'')+'"><span>♡</span>Livrée</div></div><p><b>Statut :</b> '+esc(order.status)+'</p><p class="hint">Tenues : '+order.items.map(x=>esc(x.name)+' ×'+Number(x.qty)).join(', ')+'</p></div>'
}
const v5BeforeNavigate=navigate;
navigate=function(page){v5BeforeNavigate(page);if(page==='tracking'&&lastReceipt){const no=document.getElementById('trackNumber');if(no&&!no.value){no.value=lastReceipt.id;document.getElementById('trackContact').value=lastReceipt.contact;v5Track()}}};
const v5PreviousDrawAdmin=drawAdmin;
drawAdmin=function(){
 if(adminTab==='seasons'&&studioUnlocked){v5FounderSeasons();v5MarkTab();return}
 if(adminTab==='orders'&&studioUnlocked){v5FounderOrders();v5MarkTab();return}
 v5PreviousDrawAdmin()
};
function v5MarkTab(){document.querySelectorAll('[data-admin-tab]').forEach(b=>b.classList.toggle('active',b.dataset.adminTab===adminTab))}
function v5FounderSeasons(){
 let month=db.looks.find(x=>x.id===db.monthLookId);
 let head=studioAdminHeader('Campagnes & coup de cœur','Modifie les collections saisonnières visibles sur l’accueil.');
 let choices=db.looks.map(x=>'<option value="'+Number(x.id)+'" '+(db.monthLookId===x.id?'selected':'')+'>'+esc(x.name)+'</option>').join('');
 let html=head+'<div class="month-admin"><h3>✦ Look du mois</h3><p class="hint">La tenue mise en avant sur la page principale avec une animation spéciale.</p><label for="v5Month">Choisir une tenue</label><select id="v5Month">'+choices+'</select><div class="editor-actions"><button class="btn hot" onclick="v5SaveMonth()">METTRE À LA UNE ♡</button></div></div><h3>Collections saisonnières</h3>';
 html+=db.seasons.map((s,i)=>'<div class="season-editor"><div class="twocol"><div>'+ (img(s.image)?'<img src="'+esc(img(s.image))+'" alt="">':'')+'</div><div><label>Nom</label><input class="field" id="v5SN'+i+'" value="'+esc(s.name)+'"><label>Catégorie liée</label><select id="v5SC'+i+'">'+['Baddie','Glam','Y2K','Soft'].map(c=>'<option '+(s.category===c?'selected':'')+'>'+c+'</option>').join('')+'</select></div></div><label>Description</label><textarea rows="2" id="v5SD'+i+'">'+esc(s.description)+'</textarea><label>Image HTTPS</label><input class="field" id="v5SI'+i+'" value="'+esc(s.image)+'"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="v5SA'+i+'" '+(s.active!==false?'checked':'')+'> Afficher sur l’accueil</label><button class="btn hot" onclick="v5SaveSeason('+i+')">ENREGISTRER CETTE COLLECTION</button></div>').join('');
 document.getElementById('adminPanel').innerHTML=html
}
function v5SaveMonth(){db.monthLookId=Number(document.getElementById('v5Month').value);if(save())studioToast('Look du mois actualisé localement ♡')}
function v5SaveSeason(i){
 const s=db.seasons[i];s.name=document.getElementById('v5SN'+i).value.trim()||s.name;s.category=document.getElementById('v5SC'+i).value;s.description=document.getElementById('v5SD'+i).value;s.image=document.getElementById('v5SI'+i).value;s.active=document.getElementById('v5SA'+i).checked;if(save()){v5FounderSeasons();studioToast('Collection sauvegardée ♡')}
}
function v5FounderOrders(){
 let html=studioAdminHeader('Commandes RP','Deux statuts à gérer pour la démo : En préparation et Livrée.');
 html+='<div class="demo-notice">Ces commandes sont visibles seulement dans ce navigateur. Une commande passée par un autre joueur sur son PC n’apparaîtra pas ici avant la connexion à une base partagée.</div>';
 if(!db.orders.length)html+='<div class="founder-order"><h3>Aucune commande locale</h3><p>Teste une commande depuis la boutique sur ce même appareil pour l’afficher ici.</p><button class="btn hot" onclick="navigate(\'shop\')">TESTER LA BOUTIQUE ↗</button></div>';
 else html+=db.orders.map((o,i)=>'<article class="founder-order"><div class="founder-order-top"><div><strong>'+esc(o.id)+'</strong><p class="hint">'+esc(o.name)+' · '+esc(o.contact)+'</p></div><span class="eyebrow">'+money(o.total)+'</span></div><p class="hint">'+o.items.map(x=>esc(x.name)+' ×'+Number(x.qty)+(x.variants?' ('+esc(x.variants)+')':'')).join('<br>')+'</p><div class="founder-order-actions"><select id="v5Order'+i+'"><option '+(o.status==='En préparation'?'selected':'')+'>En préparation</option><option '+(o.status==='Livrée'?'selected':'')+'>Livrée</option></select><button class="btn hot" onclick="v5SaveOrder('+i+')">ENREGISTRER STATUT</button></div></article>').join('');
 document.getElementById('adminPanel').innerHTML=html
}
function v5SaveOrder(i){db.orders[i].status=document.getElementById('v5Order'+i).value;if(save()){v5FounderOrders();studioToast('Statut de commande modifié dans la démo ♡')}}
drawAll();

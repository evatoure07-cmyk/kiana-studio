
'use strict';
/* KIANA STUDIO — unified V8 client.
   All order/admin data is browser-local pending a secure Supabase backend. */
const STORE='kiana-demo-new-build';
const PIN_KEY='kiana-founder-demo-code-v1';
const FAV_KEY='kiana-v8-customer-favorites';
const FALLBACK_IMG=[
 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop',
 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1000&auto=format&fit=crop',
 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000&auto=format&fit=crop',
 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop',
 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1000&auto=format&fit=crop',
 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000&auto=format&fit=crop'
];
const COLOR_LIST=[
 ['Noir','#17141d'],['Blanc','#faf8ef'],['Rouge','#e32637'],['Cerise','#a70a3d'],
 ['Fuchsia','#ed288d'],['Rose vif','#ff55ae'],['Prune','#692258'],['Violet','#7834c7'],
 ['Bleu électrique','#2059e8'],['Bleu nuit','#152c6e'],['Turquoise','#00b7be'],['Vert émeraude','#0a8157'],
 ['Vert forêt','#265333'],['Orange','#fd7528'],['Jaune','#f7c820'],['Doré','#b8913d'],
 ['Chocolat','#633a31'],['Argent','#a4a7b6']
];
const SERVICES=['Création de tenue','Customisation d’une tenue','Tenue événementielle','Autre (à préciser)'];
const ACCESSORIES=[['hat','Chapeau'],['accessories','Accessoires'],['mask','Masque'],['gloves','Gants'],['glasses','Lunettes'],['bag','Sac'],['jewelry','Bijoux'],['shoes','Chaussures']];
const DEFAULT_CAPSULES=[
 {id:'pink-friday',name:'Pink Friday',category:'Baddie',description:'Audace, rose intense et looks iconiques.',image:FALLBACK_IMG[0],visible:true},
 {id:'midnight-glam',name:'Midnight Glam',category:'Glam',description:'Élégance et énergie after dark.',image:FALLBACK_IMG[1],visible:true},
 {id:'baddie-essentials',name:'Baddie Essentials',category:'Y2K',description:'Les basiques qui font la différence.',image:FALLBACK_IMG[2],visible:true}
];
const DEFAULT_LOOKS=[
 {id:1,name:'PINK VENOM',category:'Baddie',capsuleId:'pink-friday',price:950,desc:'Rose, audace et attitude.',image:FALLBACK_IMG[0],visible:true,likedByFounder:true},
 {id:2,name:'PURPLE HAZE',category:'Glam',capsuleId:'midnight-glam',price:1200,desc:'Une silhouette glamour pour les grandes soirées.',image:FALLBACK_IMG[1],visible:true,likedByFounder:true},
 {id:3,name:'IT GIRL',category:'Y2K',capsuleId:'baddie-essentials',price:850,desc:'La touche rétro qui attire tous les regards.',image:FALLBACK_IMG[2],visible:true,likedByFounder:false},
 {id:4,name:'CHERRY BABY',category:'Baddie',capsuleId:'pink-friday',price:990,desc:'Un look assumé du matin au soir.',image:FALLBACK_IMG[3],visible:true,likedByFounder:false},
 {id:5,name:'SOFT DREAM',category:'Soft',capsuleId:'pink-friday',price:750,desc:'Un look doux avec du caractère.',image:FALLBACK_IMG[4],visible:true,likedByFounder:false},
 {id:6,name:'MIDNIGHT MUSE',category:'Glam',capsuleId:'midnight-glam',price:1300,desc:'Une allure chic et mystérieuse.',image:FALLBACK_IMG[5],visible:true,likedByFounder:false}
];
const DEFAULT_STATE={
 intro:'Une maison de style imaginée pour celles et ceux qui aiment se démarquer. Du dressing à la création sur mesure, chaque détail compte.',
 bio:'Je suis Kiana, passionnée de mode, de tendances et d’assemblages qui font la différence. Avec KIANA STUDIO, j’imagine des tenues affirmées, glamour ou décontractées, toujours pensées pour mettre en valeur chaque personnalité.',
 heroImage:FALLBACK_IMG[0],looks:DEFAULT_LOOKS,capsules:DEFAULT_CAPSULES,
 monthEnabled:true,monthLookId:1,monthTitle:'',monthDescription:'',orders:[],appointments:[],photos:[],
 orderSequence:0
};
const byId=id=>document.getElementById(id);
const escapeHtml=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const price=n=>n==null?'Sur devis':Number(n||0).toLocaleString('fr-FR')+' $';
const imageUrl=v=>{const s=String(v||'');return /^https:\/\/[^\s<>"']+$/i.test(s)||/^data:image\/(?:jpeg|png|webp);base64,/i.test(s)?s:''};
const safeImg=(url,alt)=>imageUrl(url)?'<img src="'+escapeHtml(imageUrl(url))+'" alt="'+escapeHtml(alt||'')+'" loading="lazy">':'<div style="height:100%;display:grid;place-items:center;font:italic 1.8rem Playfair Display,serif;color:#f9d0e6">KIANA ✦</div>';
const uid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
function readStorage(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
function initialState(){
 const old=readStorage(STORE);
 if(!old||typeof old!=='object')return structuredClone(DEFAULT_STATE);
 const db={...structuredClone(DEFAULT_STATE),...old};
 if(!Array.isArray(db.looks))db.looks=structuredClone(DEFAULT_LOOKS);
 if(!Array.isArray(db.orders))db.orders=[];
 if(!Array.isArray(db.appointments))db.appointments=[];
 if(!Array.isArray(db.capsules))db.capsules=Array.isArray(db.seasons)?db.seasons.map(s=>({id:String(s.id||uid()),name:s.name,category:s.category||'Baddie',description:s.description,image:s.image,visible:s.active!==false})):structuredClone(DEFAULT_CAPSULES);
 db.looks=db.looks.map((p,i)=>({...p,id:p.id||uid(),desc:p.desc||'',price:Number(p.price)||0,visible:p.visible!==false,likedByFounder:!!(p.likedByFounder??p.featured),capsuleId:p.capsuleId||(db.capsules.find(x=>x.category===p.category)?.id||'')}));
 db.capsules=db.capsules.map(c=>({...c,id:String(c.id||uid()),visible:c.visible!==false}));
 if(db.monthEnabled===undefined)db.monthEnabled=true;
 db.orderSequence=Number(db.orderSequence)||0;
 return db
}
let db=initialState(),founderUnlocked=false,adminTab='overview',selectedProduct=null,source='custom',mode='free',colorSelected=null,colorConfirmed=null,lastReceipt=null,chosenFilter='all',chosenSort='featured',chosenCapsule='all',adminFilter='all',adminSearch='',editorImage=null,editorId=null,bookingMessage='',loginAttempts=0;
let customerFavs=new Set(readStorage(FAV_KEY)||[]);
function save(){
 try{localStorage.setItem(STORE,JSON.stringify(db));return true}
 catch{toast('Stockage saturé : fais une sauvegarde JSON ou réduis les photos.');return false}
}
function toast(s){let t=byId('toast');t.textContent=s;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3200)}
function nav(page){
 const allowed=['home','shop','commission','tracking','booking','about','receipt','founder'];
 if(!allowed.includes(page))page='home';
 if(page==='founder'&&!founderUnlocked){openGate();return}
 if(location.hash!=='#'+page){location.hash=page}else showRoute()
}
function showRoute(){
 let page=location.hash.replace('#','')||'home';
 if(!byId('view-'+page))page='home';
 if(page==='founder'&&!founderUnlocked){location.hash='home';openGate();return}
 document.querySelectorAll('.view').forEach(p=>p.classList.toggle('active',p.id==='view-'+page));
 document.querySelectorAll('[data-page]').forEach(link=>link.classList.toggle('active',link.dataset.page===page));
 byId('mobile-nav').classList.remove('open');byId('menu-toggle').setAttribute('aria-expanded','false');
 if(page==='home')renderHome();
 if(page==='shop')renderShop();
 if(page==='commission')renderCommission();
 if(page==='receipt')renderReceipt();
 if(page==='about')renderAbout();
 if(page==='founder')renderAdmin();
 window.scrollTo({top:0,behavior:'auto'});
 document.title=(page==='home'?'KIANA STUDIO':({shop:'La boutique',commission:'Créer ma tenue',tracking:'Suivi de commande',booking:'Rendez-vous',about:'À propos',receipt:'Mon reçu',founder:'Backstage'}[page]||'KIANA STUDIO')+' | KIANA STUDIO');
}
function capsuleFor(p){return db.capsules.find(c=>String(c.id)===String(p.capsuleId))}
function renderHome(){
 byId('hero-intro').textContent=db.intro;
 byId('hero-image').innerHTML=safeImg(db.heroImage,'Ambiance mode KIANA');
 const shown=db.capsules.filter(c=>c.visible!==false);
 byId('home-capsules').innerHTML=shown.map(c=>'<button class="capsule" data-action="view-capsule" data-id="'+escapeHtml(c.id)+'">'+safeImg(c.image,c.name)+'<div><span class="eyebrow">CAPSULE COLLECTION</span><h3>'+escapeHtml(c.name)+'</h3><p>'+escapeHtml(c.description)+'</p><span class="capsule-link">DÉCOUVRIR ↗</span></div></button>').join('')||'<p class="muted">De nouvelles collections arrivent bientôt ♡</p>';
 const p=db.looks.find(p=>String(p.id)===String(db.monthLookId)&&p.visible!==false);
 const feature=byId('monthly-feature');
 if(db.monthEnabled===false||!p){feature.hidden=true}
 else{
  feature.hidden=false;
  byId('home-month').innerHTML='<div class="month-art">'+safeImg(p.image,p.name)+'<b>✦ LOOK DU MOIS</b></div><div class="month-copy"><span class="eyebrow">THE KIANA EDIT</span><h3>'+escapeHtml(db.monthTitle||p.name)+'</h3><p>'+escapeHtml(db.monthDescription||p.desc)+'</p><div class="price">'+price(p.price)+'</div><div style="margin-top:20px"><button class="btn btn-primary" data-action="order-look" data-id="'+escapeHtml(p.id)+'">PERSONNALISER CE LOOK ↗</button></div></div>'
 }
 const published=db.looks.filter(p=>p.visible!==false);
 const loved=published.filter(p=>p.likedByFounder);
 const picks=[...loved,...published.filter(p=>!p.likedByFounder)].slice(0,3);
 byId('home-looks').innerHTML=picks.map(lookCard).join('')||'<p class="muted">Des looks arrivent bientôt ♡</p>'
}
function lookCard(p){
 const fav=customerFavs.has(String(p.id));
 return '<article class="look-card"><div class="look-photo">'+safeImg(p.image,p.name)+(p.likedByFounder?'<span class="pill">♡ COUP DE CŒUR</span>':'')+
 '<button class="admin-heart" style="top:12px;right:12px" data-action="customer-fav" data-id="'+escapeHtml(p.id)+'" aria-label="'+(fav?'Retirer des favoris':'Ajouter aux favoris')+'">'+(fav?'♥':'♡')+'</button></div>'+
 '<div class="look-info"><small>'+escapeHtml(capsuleFor(p)?.name||p.category||'Collection')+'</small><h3>'+escapeHtml(p.name)+'</h3><p>'+escapeHtml(p.desc)+'</p>'+
 '<div class="look-foot"><strong class="price">'+price(p.price)+'</strong><button class="btn btn-primary btn-small" data-action="detail-look" data-id="'+escapeHtml(p.id)+'">VOIR LE LOOK ↗</button></div></div></article>'
}
function renderShop(){
 const filterList=[['all','Toutes'],...db.capsules.filter(c=>c.visible!==false).map(c=>[String(c.id),c.name]),['favorites','Mes favoris']];
 byId('shop-filters').innerHTML=filterList.map(([id,label])=>'<button class="chip '+(chosenFilter===id?'selected':'')+'" data-action="shop-filter" data-id="'+escapeHtml(id)+'">'+escapeHtml(label)+'</button>').join('');
 let looks=db.looks.filter(p=>p.visible!==false);
 if(chosenFilter==='favorites')looks=looks.filter(p=>customerFavs.has(String(p.id)));
 else if(chosenFilter!=='all')looks=looks.filter(p=>String(p.capsuleId)===chosenFilter);
 const q=byId('shop-search').value.trim().toLowerCase();
 if(q)looks=looks.filter(p=>(p.name+' '+p.desc+' '+(capsuleFor(p)?.name||'')).toLowerCase().includes(q));
 if(chosenSort==='price-low')looks.sort((a,b)=>a.price-b.price);
 else if(chosenSort==='price-high')looks.sort((a,b)=>b.price-a.price);
 else looks.sort((a,b)=>Number(!!b.likedByFounder)-Number(!!a.likedByFounder));
 byId('shop-result-count').textContent=looks.length+' tenue'+(looks.length>1?'s':'');
 byId('shop-looks').innerHTML=looks.map(lookCard).join('')||'<div class="panel" style="grid-column:1/-1;text-align:center">Aucune tenue pour ces filtres. ♡</div>';
}
function openLook(id){
 const p=db.looks.find(p=>String(p.id)===String(id)&&p.visible!==false);if(!p)return;
 openModal('<div class="detail-grid"><div class="detail-photo">'+safeImg(p.image,p.name)+'</div><div class="detail-info"><span class="eyebrow">'+escapeHtml(capsuleFor(p)?.name||p.category)+'</span><h2>'+escapeHtml(p.name)+'</h2><p>'+escapeHtml(p.desc)+'</p><p class="price">'+price(p.price)+'</p><div class="notice" style="margin:25px 0">Personnalise la couleur, les accessoires et les détails de cette tenue dans l’atelier.</div><button class="btn btn-primary btn-block" data-action="order-look" data-id="'+escapeHtml(p.id)+'">COMMANDER CE LOOK ↗</button></div></div>')
}
function openOrder(id){
 const p=db.looks.find(x=>String(x.id)===String(id)&&x.visible!==false);
 selectedProduct=p?String(p.id):null;source=p?'catalog':'custom';
 colorSelected=null;colorConfirmed=null;mode='free';
 closeModal();location.hash='commission';showRoute()
}
function renderCommission(){
 const published=db.looks.filter(p=>p.visible!==false);
 byId('source-select').innerHTML=published.map(p=>'<option value="'+escapeHtml(p.id)+'" '+(String(p.id)===String(selectedProduct)?'selected':'')+'>'+escapeHtml(p.name)+' — '+price(p.price)+'</option>').join('');
 if(!selectedProduct&&published.length)selectedProduct=String(published[0].id);
 byId('source-catalog').classList.toggle('active',source==='catalog');
 byId('source-custom').classList.toggle('active',source==='custom');
 byId('look-select-wrap').hidden=source!=='catalog';
 byId('mode-free').classList.toggle('active',mode==='free');
 byId('mode-custom').classList.toggle('active',mode==='custom');
 byId('accessory-area').hidden=mode!=='custom';
 byId('accessory-area').innerHTML=ACCESSORIES.map(([id,label])=>'<div class="acc"><span>'+label+'</span><div class="yesno"><label><input type="radio" name="acc-'+id+'" value="Oui"><span>Oui</span></label><label><input type="radio" name="acc-'+id+'" value="Non" checked><span>Non</span></label></div></div>').join('');
 byId('color-options').innerHTML=COLOR_LIST.map(([name,hex],i)=>'<button type="button" class="color-swatch '+(colorSelected===i?'selected':'')+'" style="background:'+hex+'" data-action="color" data-id="'+i+'" aria-label="'+name+'" title="'+name+'" aria-pressed="'+(colorSelected===i)+'"></button>').join('');
 renderColorStatus();
 byId('order-service').innerHTML=SERVICES.map(s=>'<option>'+escapeHtml(s)+'</option>').join('');
 byId('order-other-wrap').hidden=true;
 byId('order-other').required=false;
 byId('order-source-summary').textContent=source==='catalog'?'Un look déjà créé, à personnaliser selon tes envies.':'Une tenue imaginée spécialement pour toi.';
 renderCommissionPrice()
}
function renderCommissionPrice(){
 const p=source==='catalog'?db.looks.find(x=>String(x.id)===String(selectedProduct)):null;
 byId('order-summary-name').textContent=p?.name||'Création sur mesure';
 byId('order-summary-price').textContent=p?price(p.price):'Tarif à définir';
 byId('order-summary-info').textContent=p?'Look de départ : '+p.name+'. Tu peux personnaliser sa couleur, ses pièces et tes demandes.':'Kiana créera une tenue selon tes indications. Le tarif sera convenu lors de l’échange.';
}
function renderColorStatus(){
 document.querySelectorAll('.color-swatch').forEach(b=>{
 const active=Number(b.dataset.id)===colorSelected;
 b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))
 });
 const name=colorSelected===null?'Aucune couleur choisie':COLOR_LIST[colorSelected][0];
 const verified=colorConfirmed!==null&&colorConfirmed===colorSelected;
 byId('color-status').textContent=(verified?'✓ Validée : ':'Sélection : ')+name;
 byId('color-status').classList.toggle('verified',verified);
 byId('confirm-color').disabled=colorSelected===null||verified;
 byId('confirm-color').textContent=verified?'✓ COULEUR VALIDÉE':'VALIDER LA COULEUR';
}
function phoneDigits(v){return String(v||'').replace(/\D/g,'')}
function nextOrderId(){
 const maxExisting=Math.max(0,...db.orders.map(o=>Number((/^COMMANDE-(\d+)$/i.exec(String(o.id))||[])[1])||0));
 const n=Math.max(maxExisting,Number(db.orderSequence)||0)+1;
 return [n,'COMMANDE-'+String(n).padStart(2,'0')]
}
function submitOrder(){
 const name=byId('order-name').value.trim(),phone=byId('order-phone').value.trim();
 const service=byId('order-service').value;
 if(name.length<2){toast('Indique ton nom.');byId('order-name').focus();return}
 if(!/^\+?[\d\s().-]+$/.test(phone)||phoneDigits(phone).length<5||phoneDigits(phone).length>18){toast('Indique un numéro de téléphone valide.');byId('order-phone').focus();return}
 if(colorConfirmed===null||colorSelected!==colorConfirmed){toast('Choisis et valide une couleur avant de commander.');byId('color-options').scrollIntoView({block:'center',behavior:'smooth'});return}
 if(service==='Autre (à préciser)'&&!byId('order-other').value.trim()){toast('Précise le service demandé.');byId('order-other').focus();return}
 const p=source==='catalog'?db.looks.find(x=>String(x.id)===String(selectedProduct)&&x.visible!==false):null;
 if(source==='catalog'&&!p){toast('Sélectionne une tenue disponible.');return}
 const options={};
 if(mode==='custom')ACCESSORIES.forEach(([id])=>{options[id]=document.querySelector('input[name="acc-'+id+'"]:checked')?.value||'Non'});
 const [seq,id]=nextOrderId();
 const order={id,createdAt:new Date().toISOString(),status:'En préparation',name,phone,
 service:service==='Autre (à préciser)'?'Autre : '+byId('order-other').value.trim():service,
 source:source==='catalog'?'Look du catalogue':'Création sur mesure',
 lookId:p?.id||null,lookName:p?.name||'Création originale',price:p?.price??null,
 mode:mode==='custom'?'Customisation':'Choix libre',color:COLOR_LIST[colorConfirmed][0],
 options,wants:byId('order-wants').value.trim(),avoid:byId('order-avoid').value.trim()};
 db.orders.unshift(order);db.orderSequence=seq;
 if(!save()){db.orders.shift();db.orderSequence=seq-1;return}
 lastReceipt=order;
 colorSelected=null;colorConfirmed=null;
 ['order-name','order-phone','order-wants','order-avoid','order-other'].forEach(id=>{if(byId(id))byId(id).value=''});
 toast('Commande '+id+' créée sur cet appareil ♡');
 nav('receipt')
}
function orderOptionsText(o){
 return o.mode==='Customisation'?ACCESSORIES.map(([id,label])=>label+' : '+(o.options?.[id]||'Non')).join(' · '):'Kiana choisit les détails'
}
function orderSummaryText(o){
 return ['KIANA STUDIO · '+o.id,'Nom : '+o.name,'Téléphone : '+o.phone,'Service : '+o.service,'Base : '+o.lookName,
 'Mode : '+o.mode,'Couleur : '+o.color,'Accessoires : '+orderOptionsText(o),
 'Mes envies : '+(o.wants||'Non précisées'),'À éviter : '+(o.avoid||'Aucune précision'),
 'Prix : '+price(o.price),'Statut : '+o.status,'À transmettre à Kiana pour valider la demande.'].join('\n')
}
function renderReceipt(){
 const o=lastReceipt;
 if(!o){byId('receipt-area').innerHTML='<p class="panel">Aucun reçu en cours. Va dans la boutique pour commander une tenue.</p>';return}
 byId('receipt-area').innerHTML='<div class="receipt-wrap"><div class="receipt"><h2>KIANA STUDIO ✦</h2><p>FASHION ORDER · MERCI ♡</p>'+
 receiptRow('Commande',o.id)+receiptRow('Nom',o.name)+receiptRow('Téléphone',o.phone)+receiptRow('Service',o.service)+receiptRow('Tenue',o.lookName)+
 receiptRow('Mode',o.mode)+receiptRow('Couleur',o.color)+receiptRow('Total',price(o.price))+
 '<div class="receipt-notes"><b>Personnalisation :</b> '+escapeHtml(orderOptionsText(o))+
 '<hr style="border:0;border-top:1px dashed #b98bab;margin:12px 0"><b>Demandes :</b> '+escapeHtml(o.wants||'Aucune précision')+
 '<hr style="border:0;border-top:1px dashed #b98bab;margin:12px 0"><b>À éviter :</b> '+escapeHtml(o.avoid||'Aucune précision')+'</div>'+
 '<div class="barcode"></div><p>THANK YOU, PRETTY ♡</p></div>'+
 '<div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin:35px 0"><button class="btn btn-primary" data-action="copy-receipt">COPIER LE REÇU</button><button class="btn" data-action="track-last">SUIVRE MA COMMANDE</button></div>'+
 '<p class="notice" style="text-align:center">Commande enregistrée sur ce navigateur uniquement. Copie le reçu pour l’envoyer à Kiana : il n’est pas transmis automatiquement.</p></div>'
}
function receiptRow(label,v){return '<div class="receipt-line"><span>'+escapeHtml(label)+'</span><span><b>'+escapeHtml(v)+'</b></span></div>'}
function trackOrder(){
 const num=byId('track-id').value.trim().toUpperCase();
 const phone=phoneDigits(byId('track-phone').value.trim());
 const el=byId('track-result');
 if(!num||phone.length<5){el.innerHTML='<div class="notice">Renseigne ton numéro de commande et ton numéro de téléphone.</div>';return}
 const o=db.orders.find(o=>String(o.id).toUpperCase()===num&&phoneDigits(o.phone)===phone);
 if(!o){el.innerHTML='<div class="notice">Commande introuvable sur cet appareil. Vérifie les informations. Le suivi entre plusieurs appareils nécessitera la synchronisation de la base de données.</div>';return}
 el.innerHTML='<div class="panel" style="margin-top:24px"><span class="eyebrow">FASHION ORDER TRACKING</span><h3 class="serif" style="font-size:2rem;margin:10px 0">'+escapeHtml(o.id)+'</h3>'+
 '<p class="muted">'+escapeHtml(o.name)+' · '+escapeHtml(o.lookName)+'</p>'+
 '<div class="timeline"><div class="node active"><b>✂</b>En préparation</div><div class="node '+(o.status==='Livrée'?'active':'')+'"><b>♡</b>Livrée</div></div>'+
 '<p><strong>Statut actuel :</strong> '+escapeHtml(o.status)+'</p><p class="help">Service : '+escapeHtml(o.service)+' · Couleur : '+escapeHtml(o.color)+'</p></div>'
}
function renderAbout(){byId('about-bio').textContent=db.bio}
function submitBooking(){
 const form=byId('booking-form');
 if(!form.reportValidity())return;
 const msg=['KIANA STUDIO — RENDEZ-VOUS','Nom : '+byId('booking-name').value.trim(),'Contact : '+byId('booking-phone').value.trim(),
 'Prestation : '+byId('booking-service').value,'Date souhaitée : '+byId('booking-date').value,
 'Heure souhaitée : '+byId('booking-time').value,'Précisions : '+byId('booking-note').value.trim(),
 'Merci de confirmer la disponibilité.'].join('\n');
 bookingMessage=msg;openModal('<span class="eyebrow">RENDEZ-VOUS</span><h2 class="serif" style="font-size:2.5rem">Demande prête ♡</h2><p class="muted">La date n’est pas réservée automatiquement. Copie ce récapitulatif pour l’envoyer à Kiana.</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:.8rem;color:#fce7f1">'+escapeHtml(msg)+'</pre><button class="btn btn-primary" data-action="copy-booking">COPIER LA DEMANDE</button>')
}
function copyText(s){if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(s).then(()=>toast('Copié ♡')).catch(()=>fallbackCopy(s));else fallbackCopy(s)}
function fallbackCopy(s){window.prompt('Copie le texte :',s)}
function openModal(html){byId('modal-content').innerHTML=html;byId('overlay').classList.add('open');document.body.style.overflow='hidden';byId('modal-close').focus()}
function closeModal(){byId('overlay').classList.remove('open');document.body.style.overflow='';byId('modal-content').innerHTML=''}
function handleCoreAction(a,node){
 const id=node.dataset.id;
 if(a==='menu'){const menu=byId('mobile-nav');menu.classList.toggle('open');byId('menu-toggle').setAttribute('aria-expanded',String(menu.classList.contains('open')))}
 else if(a==='detail-look')openLook(id);
 else if(a==='order-look')openOrder(id);
 else if(a==='order-custom')openOrder(null);
 else if(a==='view-capsule'){chosenFilter=String(id);nav('shop');renderShop()}
 else if(a==='shop-filter'){chosenFilter=String(id);renderShop()}
 else if(a==='customer-fav'){let key=String(id);customerFavs.has(key)?customerFavs.delete(key):customerFavs.add(key);try{localStorage.setItem(FAV_KEY,JSON.stringify([...customerFavs]))}catch{}renderHome();renderShop()}
 else if(a==='source'){source=id==='catalog'?'catalog':'custom';renderCommissionPrice();byId('source-catalog').classList.toggle('active',source==='catalog');byId('source-custom').classList.toggle('active',source==='custom');byId('look-select-wrap').hidden=source!=='catalog'}
 else if(a==='mode'){mode=id==='custom'?'custom':'free';byId('mode-free').classList.toggle('active',mode==='free');byId('mode-custom').classList.toggle('active',mode==='custom');byId('accessory-area').hidden=mode!=='custom'}
 else if(a==='color'){colorSelected=Number(id);colorConfirmed=null;renderColorStatus()}
 else if(a==='confirm-color'){if(colorSelected!==null){colorConfirmed=colorSelected;renderColorStatus();toast(COLOR_LIST[colorSelected][0]+' validée ♡')}}
 else if(a==='track-last'){if(lastReceipt){byId('track-id').value=lastReceipt.id;byId('track-phone').value=lastReceipt.phone}nav('tracking');trackOrder()}
 else if(a==='copy-receipt'&&lastReceipt)copyText(orderSummaryText(lastReceipt));
 else if(a==='copy-booking')copyText(bookingMessage);
 else if(a==='close-modal')closeModal();
 else if(a==='open-gate')founderUnlocked?nav('founder'):openGate();
 else if(a.startsWith('admin-'))handleAdminAction(a,node)
}
document.addEventListener('click',e=>{
 const target=e.target.closest('[data-action]');if(!target)return;e.preventDefault();handleCoreAction(target.dataset.action,target)
});
document.addEventListener('change',e=>{
 const node=e.target;
 if(node.id==='shop-sort'){chosenSort=node.value;renderShop()}
 if(node.id==='source-look'){selectedProduct=node.value;renderCommissionPrice()}
 if(node.id==='order-service'){const isOther=node.value==='Autre (à préciser)';byId('order-other-wrap').hidden=!isOther;byId('order-other').required=isOther}
 if(node.dataset.adminChange)handleAdminChange(node)
});
document.addEventListener('input',e=>{
 if(e.target.id==='shop-search')renderShop();
 if(e.target.dataset.adminInput)handleAdminInput(e.target)
});
document.addEventListener('submit',e=>{
 const id=e.target.id;
 if(['order-form','track-form','booking-form','pin-form','admin-editor-form','admin-capsule-form','admin-month-form','admin-text-form','admin-settings-form'].includes(id))e.preventDefault();else return;
 if(id==='order-form')submitOrder();
 else if(id==='track-form')trackOrder();
 else if(id==='booking-form')submitBooking();
 else handleAdminSubmit(id,e.target)
});
window.addEventListener('hashchange',showRoute);
window.addEventListener('scroll',()=>{const range=document.documentElement.scrollHeight-innerHeight;byId('topbar')?.style.setProperty('--progress',range>0?(100*scrollY/range)+'%':'0%')},{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
byId('overlay').addEventListener('click',e=>{if(e.target===byId('overlay'))closeModal()});

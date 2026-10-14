
'use strict';
/* KIANA STUDIO — unified V8 client.
   All order/admin data is browser-local pending a secure Supabase backend. */
const STORE='kiana-demo-new-build';
const PIN_KEY='kiana-founder-demo-code-v1';
const CART_KEY='kiana-v9-cart';
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
 monthEnabled:true,monthLookId:1,monthTitle:'',monthDescription:'',orders:[],appointments:[],photos:[{title:'CITY GIRL',image:FALLBACK_IMG[0]},{title:'AFTER DARK',image:FALLBACK_IMG[1]},{title:'THE IT GIRL',image:FALLBACK_IMG[2]}],
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
 if(!Array.isArray(db.photos))db.photos=[];
 if(!Array.isArray(old.capsules))db.capsules=Array.isArray(db.seasons)?db.seasons.map(s=>({id:String(s.id||uid()),name:s.name,category:s.category||'Baddie',description:s.description,image:s.image,visible:s.active!==false})):structuredClone(DEFAULT_CAPSULES);
 db.looks=db.looks.map((p,i)=>({...p,id:p.id||uid(),desc:p.desc||'',price:Number(p.price)||0,visible:p.visible!==false,likedByFounder:!!(p.likedByFounder??p.featured),capsuleId:p.capsuleId||(db.capsules.find(x=>x.category===p.category)?.id||'')}));
 db.capsules=db.capsules.map(c=>({...c,id:String(c.id||uid()),visible:c.visible!==false}));
 if(db.monthEnabled===undefined)db.monthEnabled=true;
 db.orderSequence=Number(db.orderSequence)||0;
 return db
}
let db=initialState(),founderUnlocked=false,adminTab='overview',selectedProduct=null,source='custom',mode='free',colorSelected=[],colorConfirmed=[],lastReceipt=null,chosenFilter='all',chosenSort='featured',chosenCapsule='all',adminFilter='all',adminSearch='',editorImage=null,editorId=null,bookingMessage='',loginAttempts=0;
let cart=Array.isArray(readStorage(CART_KEY))?readStorage(CART_KEY).filter(x=>x&&x.id!=null).map(x=>({id:String(x.id),qty:Math.min(99,Math.max(1,Number(x.qty)||1))})):[];
function save(){
 try{localStorage.setItem(STORE,JSON.stringify(db));return true}
 catch{toast('Stockage saturé : fais une sauvegarde JSON ou réduis les photos.');return false}
}
function toast(s){let t=byId('toast');t.textContent=s;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3200)}
function nav(page){
 const allowed=['home','shop','cart','portfolio','community','account','commission','tracking','booking','about','receipt','founder'];
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
 if(page==='cart')renderCart();
 if(page==='portfolio')renderPortfolio();
 if(page==='community'||page==='account')window.kianaCommunityRoute?.(page);
 if(page==='commission')renderCommission();
 if(page==='receipt')renderReceipt();
 if(page==='about')renderAbout();
 if(page==='founder')renderAdmin();
 updateCartCount();
 window.scrollTo({top:0,behavior:'auto'});
 document.title=(page==='home'?'KIANA STUDIO':({shop:'La boutique',cart:'Mon panier',portfolio:'Lookbook',community:'Communauté',account:'Mon compte',commission:'Créer ma tenue',tracking:'Suivi de commande',booking:'Rendez-vous',about:'À propos',receipt:'Mon reçu',founder:'Backstage'}[page]||'KIANA STUDIO')+' | KIANA STUDIO');
}
function capsuleFor(p){return db.capsules.find(c=>String(c.id)===String(p.capsuleId))}
function renderHome(){
 byId('hero-intro').textContent=db.intro;
 byId('hero-image').innerHTML=safeImg(db.heroImage,'Ambiance mode KIANA');
 const published=db.looks.filter(p=>p.visible!==false);
 byId('home-looks').innerHTML=published.slice(0,6).map(lookCard).join('')||'<p class="muted">De nouvelles tenues arrivent bientôt ♡</p>';
 byId('home-portfolio').innerHTML=polaroids(db.photos.slice(0,3),0);
}
function polaroids(items,startIndex){return items.map((p,i)=>'<button class="polaroid" data-action="open-photo" data-id="'+(startIndex+i)+'"><div class="polaroid-photo">'+safeImg(p.image,p.title)+'</div><strong>'+escapeHtml(p.title)+'</strong><small>KIANA STUDIO · FASHION DIARY</small></button>').join('')||'<p class="muted">De nouvelles photos arrivent bientôt ♡</p>'}
function renderPortfolio(){byId('portfolio-grid').innerHTML=polaroids(db.photos,0)}
function lookPhotos(p){
 const sources=[p?.image,...(Array.isArray(p?.images)?p.images:[])].filter(imageUrl);
 return [...new Set(sources.map(String))].slice(0,8)
}
let activeLookPhoto=0,activeLookId=null;
function setLookPhoto(index){
 const p=db.looks.find(x=>String(x.id)===String(activeLookId)),images=lookPhotos(p);
 if(!images.length)return;
 activeLookPhoto=(Number(index)+images.length)%images.length;
 const image=byId('look-gallery-main');
 if(image){image.src=images[activeLookPhoto];image.alt=(p?.name||'Tenue')+' — photo '+(activeLookPhoto+1)}
 document.querySelectorAll('[data-action="gallery-photo"]').forEach(x=>x.classList.toggle('active',Number(x.dataset.id)===activeLookPhoto));
 const counter=byId('look-gallery-counter');if(counter)counter.textContent=(activeLookPhoto+1)+' / '+images.length
}
function lookCard(p){
 return '<article class="look-card"><button class="look-photo look-photo-button" data-action="detail-look" data-id="'+escapeHtml(p.id)+'" aria-label="Voir '+escapeHtml(p.name)+'">'+safeImg(p.image,p.name)+'</button>'+
 '<div class="look-info"><small>KIANA STUDIO · FASHION</small><h3>'+escapeHtml(p.name)+'</h3><p>'+escapeHtml(p.desc)+'</p>'+
 '<div class="look-foot"><strong class="price">'+price(p.price)+'</strong><div class="look-buttons"><button class="btn btn-small" data-action="detail-look" data-id="'+escapeHtml(p.id)+'">DÉTAILS</button><button class="btn btn-primary btn-small" data-action="cart-add" data-id="'+escapeHtml(p.id)+'">+ PANIER</button></div></div></div></article>';
}
function renderShop(){
 const q=byId('shop-search').value.trim().toLowerCase();
 let looks=db.looks.filter(p=>p.visible!==false&&(!q||(p.name+' '+p.desc).toLowerCase().includes(q)));
 if(chosenSort==='price-low')looks.sort((a,b)=>a.price-b.price);
 else if(chosenSort==='price-high')looks.sort((a,b)=>b.price-a.price);
 byId('shop-result-count').textContent=looks.length+' tenue'+(looks.length>1?'s':'');
 byId('shop-looks').innerHTML=looks.map(lookCard).join('')||'<div class="panel" style="grid-column:1/-1;text-align:center">Aucune tenue trouvée ♡</div>';
 updateCartCount()
}
function openLook(id){
 const p=db.looks.find(x=>String(x.id)===String(id)&&x.visible!==false);if(!p)return;
 activeLookId=String(id);activeLookPhoto=0;
 const photos=lookPhotos(p),inCart=cart.find(x=>x.id===String(id))?.qty||0;
 const main=photos.length?'<img id="look-gallery-main" src="'+escapeHtml(photos[0])+'" alt="'+escapeHtml(p.name)+' — photo 1">':
 '<div class="gallery-placeholder">KIANA ✦</div>';
 const thumbnails=photos.length>1?
 '<div class="gallery-thumbs" role="group" aria-label="Autres vues">'+photos.map((url,i)=>
 '<button type="button" class="gallery-thumb '+(i===0?'active':'')+'" data-action="gallery-photo" data-id="'+i+'" aria-label="Photo '+(i+1)+'"><img src="'+escapeHtml(url)+'" alt=""></button>').join('')+'</div>':
 '';
 openModal('<div class="detail-grid"><div><div class="gallery-stage">'+main+'</div>'+thumbnails+
 (photos.length>1?'<div class="gallery-nav"><span class="gallery-counter" id="look-gallery-counter">1 / '+photos.length+'</span><div><button class="btn btn-small" data-action="gallery-prev">←</button> <button class="btn btn-small" data-action="gallery-next">→</button></div></div>':'')+
 '</div><div class="detail-info"><span class="eyebrow">KIANA STUDIO · BOUTIQUE</span><h2>'+escapeHtml(p.name)+'</h2><p>'+escapeHtml(p.desc)+'</p>'+
 '<p class="price">'+price(p.price)+'</p><p class="help">Découvre toutes les photos de cette tenue et ajoute-la au panier.</p>'+
 '<button class="btn btn-primary btn-block" data-action="cart-add" data-id="'+escapeHtml(p.id)+'">+ AJOUTER AU PANIER</button>'+
 (inCart?'<p class="help">'+inCart+' déjà dans le panier</p>':'')+
 '<button class="btn btn-outline btn-block" style="margin-top:10px" data-action="go-cart">VOIR MON PANIER ↗</button></div></div>')
}
function openOrder(){
 colorSelected=[];colorConfirmed=[];mode='free';
 closeModal();nav('commission')
}
function updateCartCount(){
 const n=cart.reduce((sum,x)=>sum+x.qty,0);
 if(byId('nav-cart-count'))byId('nav-cart-count').textContent=n;
 if(byId('mobile-cart-count'))byId('mobile-cart-count').textContent=n;
}
function persistCart(){
 try{localStorage.setItem(CART_KEY,JSON.stringify(cart));updateCartCount();return true}
 catch{toast('Impossible de sauvegarder ce panier.');return false}
}
function cartProduct(id){return db.looks.find(x=>String(x.id)===String(id)&&x.visible!==false)}
function cartAdd(id){
 const p=cartProduct(id);if(!p){toast('Cette tenue n’est plus disponible.');return}
 const existing=cart.find(x=>x.id===String(id));
 if(existing){if(existing.qty>=99){toast('Limite de 99 articles par tenue.');return}existing.qty++}
 else cart.push({id:String(id),qty:1});
 persistCart();renderCart();toast(p.name+' ajouté au panier ♡')
}
function cartAdjust(id,delta){
 const entry=cart.find(x=>x.id===String(id));if(!entry)return;
 if(delta===0){cart=cart.filter(x=>x!==entry)}
 else entry.qty=Math.min(99,entry.qty+delta);
 if(entry.qty<=0)cart=cart.filter(x=>x!==entry);
 persistCart();renderCart()
}
function cartSetQty(id,value){
 const entry=cart.find(x=>x.id===String(id));if(!entry)return;
 const amount=Number(value);
 entry.qty=Number.isFinite(amount)?Math.max(1,Math.min(99,Math.floor(amount))):1;
 persistCart();renderCart()
}
function renderCart(){
 const items=cart.map(entry=>({entry,p:cartProduct(entry.id)})).filter(x=>x.p);
 const total=items.reduce((sum,x)=>sum+x.p.price*x.entry.qty,0);
 const n=items.reduce((sum,x)=>sum+x.entry.qty,0);
 byId('cart-items').innerHTML=items.length?items.map(({entry,p})=>
 '<article class="cart-row"><div class="cart-thumbnail">'+safeImg(p.image,p.name)+'</div><div class="cart-row-info"><strong>'+escapeHtml(p.name)+'</strong><p class="muted">'+price(p.price)+' / tenue</p><button class="cart-remove" data-action="cart-remove" data-id="'+escapeHtml(p.id)+'">Retirer</button></div>'+
 '<div class="cart-qty"><button aria-label="Diminuer" data-action="cart-dec" data-id="'+escapeHtml(p.id)+'">−</button><input class="cart-qty-value" type="number" min="1" max="99" inputmode="numeric" value="'+entry.qty+'" data-cart-input="'+escapeHtml(p.id)+'" aria-label="Quantité pour '+escapeHtml(p.name)+'"><button aria-label="Augmenter" data-action="cart-inc" data-id="'+escapeHtml(p.id)+'">+</button></div>'+
 '<strong class="price">'+price(p.price*entry.qty)+'</strong></article>').join(''):
 '<div class="panel cart-empty"><h3 class="serif" style="font-size:2.2rem">Ton panier est vide ♡</h3><p class="muted">Ajoute une ou plusieurs tenues depuis la boutique.</p><a href="#shop" class="btn btn-primary">VOIR LES TENUES ↗</a></div>';
 byId('cart-totals').innerHTML='<div class="cart-total-line"><span>'+n+' tenue'+(n>1?'s':'')+'</span><strong>'+price(total)+'</strong></div>'+
 '<div class="cart-total-line"><span>Total à régler dans le jeu</span><strong class="price">'+price(total)+'</strong></div>';
 byId('cart-checkout-form').hidden=items.length===0;
 updateCartCount()
}
function submitCart(){
 const active=cart.map(entry=>({entry,p:cartProduct(entry.id)})).filter(x=>x.p);
 if(!active.length){toast('Ajoute une tenue à ton panier.');return}
 const name=byId('cart-name').value.trim(),phone=byId('cart-phone').value.trim();
 if(name.length<2){toast('Indique ton nom.');return}
 if(!validPhone(phone)){toast('Indique un numéro de téléphone valide.');return}
 const items=active.map(({entry,p})=>({id:String(p.id),name:p.name,price:p.price,qty:entry.qty,image:p.image}));
 const total=items.reduce((sum,item)=>sum+item.price*item.qty,0);
 const [seq,id]=nextOrderId();
 const order={id,kind:'boutique',createdAt:new Date().toISOString(),status:'En préparation',
 name,phone,service:'Commande boutique',lookName:items.length+' tenue'+(items.length>1?'s':''),
 items,price:total,total,mode:'Catalogue',color:'—',options:{},wants:byId('cart-note').value.trim(),avoid:''};
 if(!storeOrder(order,seq))return;
 cart=[];persistCart();byId('cart-checkout-form').reset();nav('receipt');
 toast('Commande '+id+' créée ♡')
}

function renderCommission(){
 byId('mode-free').classList.toggle('active',mode==='free');
 byId('mode-custom').classList.toggle('active',mode==='custom');
 byId('accessory-area').hidden=mode!=='custom';
 byId('accessory-area').innerHTML=ACCESSORIES.map(([id,label])=>
 '<div class="acc"><span>'+label+'</span><div class="yesno"><label><input type="radio" name="acc-'+id+'" value="Oui"><span>Oui</span></label><label><input type="radio" name="acc-'+id+'" value="Non" checked><span>Non</span></label></div></div>').join('');
 byId('color-options').innerHTML=COLOR_LIST.map(([name,hex],i)=>'<button type="button" class="color-swatch '+(colorSelected.includes(i)?'selected':'')+'" style="background:'+hex+'" data-action="color" data-id="'+i+'" aria-label="'+name+'" title="'+name+'" aria-pressed="'+colorSelected.includes(i)+'"></button>').join('');
 renderColorStatus();
 byId('order-service').innerHTML=SERVICES.map(s=>'<option>'+escapeHtml(s)+'</option>').join('');
 byId('order-other-wrap').hidden=true;byId('order-other').required=false;
 byId('order-summary-name').textContent='Création sur mesure';
 byId('order-summary-price').textContent='Tarif à définir';
 byId('order-summary-info').textContent='Envoie tes préférences et ta couleur : Kiana prépare ta tenue à distance, sans rendez-vous.';
}
function chosenColorNames(){
 return colorSelected.map(i=>COLOR_LIST[i]?.[0]).filter(Boolean);
}
function validatedColorNames(){
 return colorConfirmed.map(i=>COLOR_LIST[i]?.[0]).filter(Boolean);
}
function colorsValidated(){
 return colorSelected.length>0&&colorSelected.length===colorConfirmed.length&&colorSelected.every(i=>colorConfirmed.includes(i));
}
function renderColorStatus(){
 document.querySelectorAll('.color-swatch').forEach(b=>{
  const active=colorSelected.includes(Number(b.dataset.id));
  b.classList.toggle('selected',active);
  b.setAttribute('aria-pressed',String(active))
 });
 const names=chosenColorNames(),verified=colorsValidated();
 const status=byId('color-status');
 status.textContent=names.length?(verified?'✓ Couleurs validées : ':'Sélection ('+names.length+') : ')+names.join(', '):
  'Aucune couleur choisie — tu peux en sélectionner plusieurs';
 status.classList.toggle('verified',verified);
 const confirm=byId('confirm-color');
 confirm.disabled=names.length===0||verified;
 confirm.textContent=verified?'✓ COULEURS VALIDÉES':'VALIDER MES '+(names.length>1?'COULEURS':'COULEUR');
}

function phoneDigits(v){return String(v||'').replace(/\D/g,'')}
function validPhone(v){return /^\+?[\d\s().-]+$/.test(v)&&phoneDigits(v).length>=5&&phoneDigits(v).length<=18}
function nextOrderId(){
 const maxExisting=Math.max(0,...db.orders.map(o=>Number((/^COMMANDE-(\d+)$/i.exec(String(o.id))||[])[1])||0));
 const n=Math.max(maxExisting,Number(db.orderSequence)||0)+1;
 return [n,'COMMANDE-'+String(n).padStart(2,'0')]
}
function storeOrder(order,seq){
 db.orders.unshift(order);const previous=db.orderSequence;db.orderSequence=seq;
 if(!save()){db.orders.shift();db.orderSequence=previous;return false}
 lastReceipt=order;return true
}
function submitOrder(){
 const name=byId('order-name').value.trim(),phone=byId('order-phone').value.trim(),service=byId('order-service').value;
 if(name.length<2){toast('Indique ton nom.');byId('order-name').focus();return}
 if(!validPhone(phone)){toast('Indique un numéro de téléphone valide.');byId('order-phone').focus();return}
 if(!colorsValidated()){toast('Choisis une ou plusieurs couleurs et valide-les.');byId('color-options').scrollIntoView({block:'center',behavior:'smooth'});return}
 if(service==='Autre (à préciser)'&&!byId('order-other').value.trim()){toast('Précise le service demandé.');return}
 const options={};if(mode==='custom')ACCESSORIES.forEach(([id])=>{options[id]=document.querySelector('input[name="acc-'+id+'"]:checked')?.value||'Non'});
 const [seq,id]=nextOrderId();
 const order={id,kind:'sur-mesure',createdAt:new Date().toISOString(),status:'En préparation',name,phone,
 service:service==='Autre (à préciser)'?'Autre : '+byId('order-other').value.trim():service,
 lookName:'Création sur mesure à distance',items:[],price:null,total:null,
 mode:mode==='custom'?'Customisation':'Choix libre',color:validatedColorNames().join(', '),colors:validatedColorNames(),
 options,wants:byId('order-wants').value.trim(),avoid:byId('order-avoid').value.trim()};
 if(!storeOrder(order,seq))return;
 colorSelected=[];colorConfirmed=[];
 ['order-name','order-phone','order-wants','order-avoid','order-other'].forEach(id=>{if(byId(id))byId(id).value=''});
 nav('receipt');toast('Demande '+id+' préparée ♡')
}
function orderOptionsText(o){
 if(o.kind==='boutique'||o.mode==='Catalogue')return'Articles du catalogue, sans customisation';
 return o.mode==='Customisation'?ACCESSORIES.map(([id,label])=>label+' : '+(o.options?.[id]||'Non')).join(' · '):'Kiana choisit les détails'
}
function orderItems(o){
 if(Array.isArray(o.items)&&o.items.length)return o.items;
 return []
}
function orderAmount(o){
 if(o.kind==='boutique')return Number(o.price??o.total??0);
 return o.price??o.total??null
}
function orderSummaryText(o){
 const lines=['KIANA STUDIO · '+o.id,'Client : '+o.name,'Téléphone : '+o.phone,'Service : '+(o.service||'Commande'),
 ...orderItems(o).map(x=>x.qty+' × '+x.name+' — '+price(Number(x.price)*Number(x.qty))),
 ...(!orderItems(o).length?['Création : '+(o.lookName||'Sur mesure'),'Mode : '+o.mode,'Couleur : '+(o.color||'À définir'),'Options : '+orderOptionsText(o)]:[]),
 ...(o.wants?['Précisions : '+o.wants]:[]),...(o.avoid?['À éviter : '+o.avoid]:[]),
 'Total : '+price(orderAmount(o)),'Statut : '+o.status,'À transmettre à Kiana pour confirmer la commande.'];
 return lines.join('\n')
}
function renderReceipt(){
 const o=lastReceipt;
 if(!o){byId('receipt-area').innerHTML='<div class="panel">Aucun reçu en cours.</div>';return}
 const items=orderItems(o);
 const lines=items.length?items.map(x=>receiptRow(Number(x.qty)+' × '+x.name,price(Number(x.price)*Number(x.qty)))).join(''):
 receiptRow('Création',o.lookName||'Sur mesure')+receiptRow('Formule',o.mode||'Choix libre')+receiptRow('Couleur',o.color||'À définir');
 byId('receipt-area').innerHTML='<div class="receipt-wrap"><div class="receipt"><h2>KIANA STUDIO ✦</h2><p>FASHION ORDER · MERCI ♡</p>'+
 receiptRow('Commande',o.id)+receiptRow('Nom',o.name)+receiptRow('Téléphone',o.phone)+receiptRow('Service',o.service||'Commande boutique')+
 lines+receiptRow('TOTAL',price(orderAmount(o)))+
 '<div class="receipt-notes"><b>'+ (items.length?'Tes articles':'Personnalisation')+':</b> '+escapeHtml(items.length?items.map(x=>x.qty+' × '+x.name).join(', '):orderOptionsText(o))+
 (o.wants?'<hr style="border:0;border-top:1px dashed #b98bab;margin:12px 0"><b>Demandes :</b> '+escapeHtml(o.wants):'')+
 (o.avoid?'<hr style="border:0;border-top:1px dashed #b98bab;margin:12px 0"><b>À éviter :</b> '+escapeHtml(o.avoid):'')+'</div>'+
 '<div class="barcode"></div><p>THANK YOU, PRETTY ♡</p></div>'+
 '<div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin:35px 0"><button class="btn btn-primary" data-action="copy-receipt">COPIER LE REÇU</button><button class="btn" data-action="track-last">SUIVRE MA COMMANDE</button></div>'+
 '<p class="notice" style="text-align:center">Le reçu est enregistré sur cet appareil. Copie-le pour l’envoyer à Kiana : les commandes ne lui parviennent pas automatiquement.</p></div>'
}
function receiptRow(label,v){return '<div class="receipt-line"><span>'+escapeHtml(label)+'</span><span><b>'+escapeHtml(v)+'</b></span></div>'}
function trackOrder(){
 const num=byId('track-id').value.trim().toUpperCase(),phone=phoneDigits(byId('track-phone').value.trim()),el=byId('track-result');
 if(!num||phone.length<5){el.innerHTML='<div class="notice">Renseigne ton numéro de commande et ton téléphone.</div>';return}
 const o=db.orders.find(o=>String(o.id).toUpperCase()===num&&phoneDigits(o.phone||o.contact)===phone);
 if(!o){el.innerHTML='<div class="notice">Commande introuvable sur cet appareil. Le suivi entre plusieurs téléphones nécessite une base de données partagée.</div>';return}
 el.innerHTML='<div class="panel" style="margin-top:24px"><span class="eyebrow">SUIVI DE COMMANDE</span>'+
 '<h3 class="serif" style="font-size:2rem;margin:10px 0">'+escapeHtml(o.id)+'</h3>'+
 '<p class="muted">'+escapeHtml(o.name)+' · '+escapeHtml(o.service||'Commande')+'</p>'+
 '<div class="timeline"><div class="node active"><b>✂</b>En préparation</div><div class="node '+(o.status==='Livrée'?'active':'')+'"><b>♡</b>Livrée</div></div>'+
 '<p><strong>Statut actuel :</strong> '+escapeHtml(o.status)+'</p>'+
 (orderItems(o).length?'<p class="help">'+orderItems(o).map(x=>escapeHtml(x.qty+' × '+x.name)).join(' · ')+'</p>':
 '<p class="help">Création sur mesure à distance · Couleurs : '+escapeHtml(o.color||'Non précisées')+'</p>')+'</div>'
}
function renderAbout(){byId('about-bio').textContent=db.bio}
function submitBooking(){
 const form=byId('booking-form');
 if(!form.reportValidity())return;
 const msg=['KIANA STUDIO — RENDEZ-VOUS EN PERSONNE','Présence avec Kiana requise : oui','Nom : '+byId('booking-name').value.trim(),'Contact : '+byId('booking-phone').value.trim(),
 'Prestation : '+byId('booking-service').value,'Date souhaitée : '+byId('booking-date').value,
 'Heure souhaitée : '+byId('booking-time').value,'Précisions : '+byId('booking-note').value.trim(),
 'Merci de confirmer la disponibilité.'].join('\n');
 bookingMessage=msg;openModal('<span class="eyebrow">RENDEZ-VOUS</span><h2 class="serif" style="font-size:2.5rem">Demande prête ♡</h2><p class="muted">Ce rendez-vous nécessite ta présence avec Kiana. La date n’est pas confirmée automatiquement : copie la demande pour l’envoyer.</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:.8rem;color:#fce7f1">'+escapeHtml(msg)+'</pre><button class="btn btn-primary" data-action="copy-booking">COPIER LA DEMANDE</button>')
}
function copyText(s){if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(s).then(()=>toast('Copié ♡')).catch(()=>fallbackCopy(s));else fallbackCopy(s)}
function fallbackCopy(s){window.prompt('Copie le texte :',s)}
function openModal(html){byId('modal-content').innerHTML=html;byId('overlay').classList.add('open');document.body.style.overflow='hidden';byId('modal-close').focus()}
function closeModal(){byId('overlay').classList.remove('open');document.body.style.overflow='';byId('modal-content').innerHTML=''}
function handleCoreAction(a,node){
 const id=node.dataset.id;
 if(a==='menu'){const menu=byId('mobile-nav');menu.classList.toggle('open');byId('menu-toggle').setAttribute('aria-expanded',String(menu.classList.contains('open')))}
 else if(a==='detail-look')openLook(id);
 else if(a==='gallery-photo')setLookPhoto(Number(id));
 else if(a==='gallery-prev')setLookPhoto(activeLookPhoto-1);
 else if(a==='gallery-next')setLookPhoto(activeLookPhoto+1);
 else if(a==='open-photo'){const p=db.photos[Number(id)];if(p)openModal('<div style="text-align:center"><span class="eyebrow">KIANA FASHION DIARY</span><h2 class="serif" style="font-size:2.7rem;margin:12px">'+escapeHtml(p.title)+'</h2></div><div style="height:min(70vh,560px);background:#4e2755;border-radius:12px;overflow:hidden">'+safeImg(p.image,p.title)+'</div>')}
 else if(a==='cart-add')cartAdd(id);
 else if(a==='go-cart'){closeModal();nav('cart')}
 else if(a==='cart-inc')cartAdjust(id,1);
 else if(a==='cart-dec')cartAdjust(id,-1);
 else if(a==='cart-remove')cartAdjust(id,0);
 else if(a==='order-custom')openOrder();
 else if(a==='mode'){mode=id==='custom'?'custom':'free';byId('mode-free').classList.toggle('active',mode==='free');byId('mode-custom').classList.toggle('active',mode==='custom');byId('accessory-area').hidden=mode!=='custom'}
 else if(a==='color'){const i=Number(id);if(!Number.isInteger(i)||!COLOR_LIST[i])return;if(colorSelected.includes(i))colorSelected=colorSelected.filter(x=>x!==i);else colorSelected.push(i);colorConfirmed=[];renderColorStatus()}
 else if(a==='confirm-color'){if(colorSelected.length){colorConfirmed=[...colorSelected];renderColorStatus();toast(colorConfirmed.length+' couleur'+(colorConfirmed.length>1?'s':'')+' validée'+(colorConfirmed.length>1?'s':'')+' ♡')}}
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
 if(node.dataset.cartInput)cartSetQty(node.dataset.cartInput,node.value)
 if(node.id==='order-service'){const isOther=node.value==='Autre (à préciser)';byId('order-other-wrap').hidden=!isOther;byId('order-other').required=isOther}
 if(node.dataset.adminChange)handleAdminChange(node)
});
document.addEventListener('input',e=>{
 if(e.target.id==='shop-search')renderShop();
 if(e.target.dataset.adminInput)handleAdminInput(e.target)
});
document.addEventListener('submit',e=>{
 const id=e.target.id;
 if(['order-form','cart-checkout-form','track-form','booking-form','pin-form','admin-editor-form','admin-capsule-form','admin-month-form','admin-text-form','admin-settings-form','admin-photo-form'].includes(id))e.preventDefault();else return;
 if(id==='order-form')submitOrder();
 else if(id==='cart-checkout-form')submitCart();
 else if(id==='track-form')trackOrder();
 else if(id==='booking-form')submitBooking();
 else handleAdminSubmit(id,e.target)
});
window.addEventListener('hashchange',showRoute);
window.addEventListener('scroll',()=>{const range=document.documentElement.scrollHeight-innerHeight;byId('topbar')?.style.setProperty('--progress',range>0?(100*scrollY/range)+'%':'0%')},{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
byId('overlay').addEventListener('click',e=>{if(e.target===byId('overlay'))closeModal()});

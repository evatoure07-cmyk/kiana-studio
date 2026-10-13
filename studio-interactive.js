
/* KIANA STUDIO interactive layer. Demo only: no backend auth or public sync. */
var studioUnlocked=false,studioSelectedLook=null,studioSelectedPhoto=0,studioFavs=new Set(),studioSort='featured';
var STUDIO_CODE_KEY='kiana-founder-demo-code-v1';
try{studioFavs=new Set(JSON.parse(localStorage.getItem('kiana-favorites-v1')||'[]'))}catch{}
function studioToast(s){let t=document.getElementById('studioToast');if(!t){t=document.createElement('div');t.id='studioToast';t.className='studio-toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=s;t.classList.add('shown');clearTimeout(window.studioToastTimer);window.studioToastTimer=setTimeout(()=>t.classList.remove('shown'),3000)}
function studioSetMenu(on){let d=document.getElementById('studioMobileMenu'),b=document.getElementById('studioMobileToggle');if(d)d.classList.toggle('open',on);if(b)b.setAttribute('aria-expanded',String(on))}
function studioToggleMenu(){studioSetMenu(!document.getElementById('studioMobileMenu').classList.contains('open'))}
const oldNavigate=navigate;
navigate=function(p){if(p==='founder'&&!studioUnlocked){studioGate();return}oldNavigate(p);studioSetMenu(false)};
showFounder=function(){if(studioUnlocked)navigate('founder');else studioGate()};
async function studioDigest(v,salt){const encoded=new TextEncoder().encode(salt+':'+v),hash=await crypto.subtle.digest('SHA-256',encoded);return Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('')}
function studioSalt(){return Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('')}
function studioGate(){
 const exists=!!localStorage.getItem(STUDIO_CODE_KEY);
 showModal('<div style="text-align:center"><span style="font-size:42px">🔐</span><p class="eyebrow">KIANA STUDIO BACKSTAGE</p><h2>'+(exists?'Accès fondatrice':'Créer un code démo')+' ♡</h2></div><p class="hint">'+(exists?'Saisis le code choisi sur cet appareil.':'Choisis un code de 6 caractères minimum pour essayer le tableau de bord.')+'</p><form id="studioGateForm"><label>Code local</label><input class="field" id="studioGateCode" type="password" minlength="6" maxlength="64" autocomplete="off" required placeholder="6 caractères minimum">'+(exists?'':'<label>Confirmer le code</label><input class="field" id="studioGateConfirm" type="password" minlength="6" maxlength="64" required autocomplete="off" placeholder="Confirmer le code">')+'<button class="btn hot" style="width:100%;margin:20px 0" type="submit">'+(exists?'ENTRER DANS LE STUDIO':'CRÉER MON CODE DÉMO')+'</button></form><div class="demo-notice"><b>Démo locale — pas un compte sécurisé.</b> Le code et tes créations restent dans ce navigateur. Chaque visiteur peut créer sa propre démo, sans modifier le site public. N’utilise pas un vrai mot de passe.</div>');
 document.getElementById('studioGateForm').addEventListener('submit',studioGateSubmit)
}
async function studioGateSubmit(e){
 e.preventDefault();let code=document.getElementById('studioGateCode').value,stored=localStorage.getItem(STUDIO_CODE_KEY),button=e.target.querySelector('button');button.disabled=true;
 try{
  if(!stored){if(code.length<6||code!==document.getElementById('studioGateConfirm').value)throw Error('Les codes ne correspondent pas.');let salt=studioSalt();localStorage.setItem(STUDIO_CODE_KEY,JSON.stringify({salt,hash:await studioDigest(code,salt)}))}
  else{let item=JSON.parse(stored);if(await studioDigest(code,item.salt)!==item.hash)throw Error('Code incorrect.')}
  studioUnlocked=true;closeModal();adminTab='overview';navigate('founder');studioToast('Bienvenue dans le backstage ♡')
 }catch(err){studioToast(err.message||'Impossible de valider le code.')}finally{button.disabled=false}
}
function studioLogout(){studioUnlocked=false;navigate('home');studioToast('Session démo terminée ♡')}
function studioTab(v){adminTab=v;drawAdmin()}
const oldLookCard=lookCard;
lookCard=function(p){let v=oldLookCard(p);return v.replace('<div class="lookphoto">','<div class="lookphoto"><button class="heart-btn '+(studioFavs.has(p.id)?'active':'')+'" onclick="studioToggleFav('+Number(p.id)+')" title="Favori" aria-label="Ajouter ou retirer des favoris">'+(studioFavs.has(p.id)?'♥':'♡')+'</button>')}
function studioToggleFav(id){if(studioFavs.has(id))studioFavs.delete(id);else studioFavs.add(id);localStorage.setItem('kiana-favorites-v1',JSON.stringify([...studioFavs]));drawAll();studioToast('Favoris mis à jour ♡')}
drawShop=function(){
 const options=['Tout','Baddie','Glam','Y2K','Soft','Favoris ♡'];
 document.getElementById('filters').innerHTML=options.map(x=>'<button class="filter '+(category===x?'selected':'')+'" onclick="category='+JSON.stringify(x)+';drawShop()">'+x+'</button>').join('');
 const q=(document.getElementById('search').value||'').toLowerCase();
 let entries=db.looks.filter(x=>x.visible!==false&&(category==='Tout'||(category==='Favoris ♡'?studioFavs.has(x.id):x.category===category))&&[x.name,x.desc,x.parts].join(' ').toLowerCase().includes(q));
 if(studioSort==='priceAsc')entries.sort((a,b)=>a.price-b.price);
 if(studioSort==='priceDesc')entries.sort((a,b)=>b.price-a.price);
 if(studioSort==='featured')entries.sort((a,b)=>Number(!!b.featured)-Number(!!a.featured));
 document.getElementById('shopProducts').innerHTML=entries.length?entries.map(lookCard).join(''):'<p>Aucune tenue correspondant à ta recherche ♡</p>';
 const counter=document.getElementById('studioProductCount');if(counter)counter.textContent=entries.length+' look(s) disponibles';
};
const oldRenderReceipt=renderReceipt;
renderReceipt=function(){oldRenderReceipt();const r=document.querySelector('#receiptRender .bigreceipt');if(r)for(let i=0;i<9;i++){const star=document.createElement('span');star.textContent=i%2?'✦':'✧';star.style.cssText='position:absolute;pointer-events:none;left:'+((i*27)%94)+'%;top:'+((i*39)%93)+'%;font-size:'+(15+i%3*6)+'px;color:#e890c6;animation:twinkle '+(1+i*.25)+'s ease-in-out infinite alternate';r.appendChild(star)}};
function studioPreviewImg(url,id){let d=document.getElementById(id);if(d)d.innerHTML=img(url)?'<img src="'+esc(img(url))+'" alt="Aperçu image">':'<span>TON LOOK ♡</span>'}
function studioUploadImage(input,kind){
 let file=input.files?.[0];if(!file)return;if(!file.type.startsWith('image/')||file.size>15000000){studioToast('Utilise une image de moins de 15 Mo.');return}
 let reader=new FileReader();reader.onload=()=>{let image=new Image;image.onload=()=>{let canvas=document.createElement('canvas'),r=Math.min(1,850/image.width,850/image.height);canvas.width=Math.max(1,Math.round(image.width*r));canvas.height=Math.max(1,Math.round(image.height*r));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);let data=canvas.toDataURL('image/jpeg',.66);if(kind==='look'){let p=db.looks.find(p=>p.id===studioSelectedLook);if(p)p.image=data}else if(db.photos[studioSelectedPhoto])db.photos[studioSelectedPhoto].image=data;if(save()){drawAdmin();studioToast('Image ajoutée à ta démo ♡')}};image.onerror=()=>studioToast('Image non compatible');image.src=reader.result};reader.readAsDataURL(file)
}
function studioScroll(){let d=document.documentElement,full=d.scrollHeight-innerHeight;document.querySelector('.top')?.style.setProperty('--scroll',full>0?100*scrollY/full+'%':'0%')}
addEventListener('scroll',studioScroll,{passive:true});studioScroll();
let glow=document.createElement('div');glow.className='ambient-glow';document.body.appendChild(glow);
if(matchMedia('(pointer:fine)').matches)addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--mouseX',e.clientX+'px');document.documentElement.style.setProperty('--mouseY',e.clientY+'px')},{passive:true});
let sort=document.createElement('div');sort.className='sortbar';sort.innerHTML='<p id="studioProductCount">Collections Kiana</p><select id="studioSort" aria-label="Trier les looks"><option value="featured">Choix de Kiana</option><option value="priceAsc">Prix croissant</option><option value="priceDesc">Prix décroissant</option></select>';document.getElementById('shopProducts').insertAdjacentElement('beforebegin',sort);sort.querySelector('select').onchange=e=>{studioSort=e.target.value;drawShop()};drawAll();
if(document.getElementById('founder').classList.contains('active')){navigate('home');studioGate()}

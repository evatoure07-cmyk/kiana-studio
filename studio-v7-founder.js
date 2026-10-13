
/* KIANA STUDIO V7 — founder-first visual catalog and standalone monthly feature. */
var v7GalleryFilter='all';
function v7GalleryItem(p){
 const liked=!!p.likedByFounder,src=img(p.image);
 return '<article class="v7-look" data-id="'+Number(p.id)+'" data-search="'+esc((p.name+' '+p.category+' '+p.desc).toLocaleLowerCase())+'" data-liked="'+liked+'" data-visible="'+(p.visible!==false)+'">'+
 '<button class="v7-look-photo" aria-label="Afficher les détails de '+esc(p.name)+'" onclick="v7OpenLook('+Number(p.id)+')">'+
 (src?'<img loading="lazy" src="'+esc(src)+'" alt="'+esc(p.name)+'">':'<span class="v7-no-photo">KIANA ✦</span>')+'</button>'+
 '<button class="v7-like '+(liked?'active':'')+'" aria-label="'+(liked?'Retirer mon coup de cœur':'Aimer cette tenue')+'" title="Mon coup de cœur" onclick="v7ToggleLike('+Number(p.id)+')">'+(liked?'♥':'♡')+'</button>'+
 '<div class="v7-look-meta"><small>'+esc(p.category)+'</small><h4 title="'+esc(p.name)+'">'+esc(p.name)+'</h4><span class="v7-price">'+money(p.price)+'</span>'+
 '<div class="v7-tags"><span class="'+(p.visible!==false?'visible':'')+'">'+(p.visible!==false?'Visible':'Masquée')+'</span><button class="v7-open" onclick="v7OpenLook('+Number(p.id)+')">DÉTAILS ↗</button></div></div></article>'
}
studioDrawLooks=function(){
 const panel=document.getElementById('adminPanel');if(!panel)return;
 panel.innerHTML=studioAdminHeader('Mon dressing ♡','Toutes tes tenues en images. Clique sur une tenue pour afficher sa fiche, ou sur le cœur pour l’aimer.',
 '<button class="btn hot" onclick="v7NewLook()">+ NOUVELLE TENUE</button>')+
 '<div class="v7-gallery-controls"><input class="field" id="v7SearchLooks" placeholder="Rechercher une tenue..." oninput="v7FilterGallery()">'+
 '<div class="v7-filterbar"><button data-filter="all" onclick="v7SetFilter(\'all\')">Toutes</button><button data-filter="liked" onclick="v7SetFilter(\'liked\')">♥ Mes coups de cœur</button><button data-filter="visible" onclick="v7SetFilter(\'visible\')">Visibles</button><button data-filter="hidden" onclick="v7SetFilter(\'hidden\')">Masquées</button></div></div>'+
 '<p class="v7-gallery-summary"><span id="v7GalleryCount">'+db.looks.length+'</span> tenues · Fais défiler pour parcourir toute la collection</p>'+
 '<div class="v7-scrollbox" id="v7GalleryScroll"><div class="v7-gallery" id="v7Gallery">'+db.looks.map(v7GalleryItem).join('')+'</div>'+
 (!db.looks.length?'<div class="v7-empty">Ta galerie est vide. Ajoute ta première création ♡</div>':'')+'</div>';
 v7FilterGallery();
};
function v7SetFilter(v){
 v7GalleryFilter=v;
 document.querySelectorAll('#adminPanel [data-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.filter===v));
 v7FilterGallery()
}
function v7FilterGallery(){
 const query=(document.getElementById('v7SearchLooks')?.value||'').trim().toLocaleLowerCase();
 let count=0;
 document.querySelectorAll('#v7Gallery .v7-look').forEach(card=>{
  const eligible=(v7GalleryFilter==='all'||(v7GalleryFilter==='liked'&&card.dataset.liked==='true')||(v7GalleryFilter==='visible'&&card.dataset.visible==='true')||(v7GalleryFilter==='hidden'&&card.dataset.visible==='false'))&&card.dataset.search.includes(query);
  card.hidden=!eligible;if(eligible)count++;
 });
 const el=document.getElementById('v7GalleryCount');if(el)el.textContent=count;
 document.querySelectorAll('#adminPanel [data-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.filter===v7GalleryFilter));
}
function v7ToggleLike(id){
 const p=db.looks.find(x=>x.id===id);if(!p)return;
 p.likedByFounder=!p.likedByFounder;
 const card=Array.from(document.querySelectorAll('#v7Gallery .v7-look')).find(x=>Number(x.dataset.id)===id);
 if(card){card.dataset.liked=String(!!p.likedByFounder);let heart=card.querySelector('.v7-like');heart.classList.toggle('active',p.likedByFounder);heart.textContent=p.likedByFounder?'♥':'♡';heart.setAttribute('aria-label',p.likedByFounder?'Retirer mon coup de cœur':'Aimer cette tenue')}
 save();v7FilterGallery();studioToast(p.likedByFounder?'Ajoutée à tes coups de cœur ♡':'Retirée des coups de cœur')
}
function v7NewLook(){
 const p={id:Date.now(),name:'Nouvelle tenue',category:'Baddie',price:0,desc:'',image:'',visible:false,likedByFounder:false,featured:false,parts:''};
 db.looks.unshift(p);save();drawAdmin();v7OpenLook(p.id)
}
function v7OpenLook(id){
 const p=db.looks.find(x=>x.id===id);if(!p)return;
 studioSelectedLook=p.id;
 const photo=img(p.image);
 showModal('<div class="v7-dialog-title"><span class="eyebrow">KIANA / FASHION ARCHIVE</span><h2 class="v7-editor-title">'+esc(p.name)+'</h2><p class="hint">Modifie les détails de cette tenue. Rien ne change avant l’enregistrement.</p></div>'+
 '<div class="v7-look-editor"><div class="v7-editor-photo" id="v7EditorPreview">'+(photo?'<img src="'+esc(photo)+'" alt="'+esc(p.name)+'">':'KIANA ♡')+'</div>'+
 '<div class="v7-editor-form">'+
 '<label for="v7Name">Nom de la tenue</label><input id="v7Name" class="field" maxlength="80" value="'+esc(p.name)+'">'+
 '<div class="twocol"><div><label for="v7Price">Prix ($)</label><input id="v7Price" class="field" type="number" min="0" max="9999999" value="'+Number(p.price)||0+'"></div>'+
 '<div><label for="v7Category">Collection</label><select id="v7Category" class="field">'+['Baddie','Glam','Y2K','Soft'].map(x=>'<option '+(p.category===x?'selected':'')+'>'+x+'</option>').join('')+'</select></div></div>'+
 '<label for="v7Description">Description de la tenue</label><textarea id="v7Description" class="field" rows="3" maxlength="1200">'+esc(p.desc||'')+'</textarea>'+
 '<label for="v7Image">Adresse de la photo</label><input id="v7Image" class="field" value="'+esc(p.image||'')+'" oninput="v7PreviewPhoto(this.value)">'+
 '<label for="v7File">Ou importer une image</label><input id="v7File" class="field" type="file" accept="image/*" onchange="v7ImportLookPhoto(this)">'+
 '<label class="v7-check"><input type="checkbox" id="v7Visible" '+(p.visible!==false?'checked':'')+'> Afficher dans la boutique</label>'+
 '<div class="editor-actions"><button class="btn hot" onclick="v7SaveLook()">ENREGISTRER ♡</button><button class="btn" onclick="v7SetMonthFromGallery()">LOOK DU MOIS ✦</button><button class="btn" onclick="v7DuplicateLook()">DUPLIQUER</button><button class="btn v7-delete" onclick="v7DeleteLook()">SUPPRIMER</button></div>'+
 '</div></div>');
 const modal=document.querySelector('#overlay .dialog');if(modal)modal.style.maxWidth='960px';
}
function v7PreviewPhoto(url){
 const div=document.getElementById('v7EditorPreview');if(!div)return;
 div.innerHTML=img(url)?'<img src="'+esc(img(url))+'" alt="Aperçu du vêtement">':'KIANA ♡'
}
function v7ImportLookPhoto(input){
 const file=input.files?.[0];if(!file)return;
 if(!file.type.startsWith('image/')||file.size>15_000_000){studioToast('Choisis une image de moins de 15 Mo.');return}
 const reader=new FileReader();reader.onload=()=>{
  const image=new Image;image.onload=()=>{
   const cv=document.createElement('canvas'),ratio=Math.min(1,850/image.width,850/image.height);
   cv.width=Math.max(1,Math.round(image.width*ratio));cv.height=Math.max(1,Math.round(image.height*ratio));
   cv.getContext('2d').drawImage(image,0,0,cv.width,cv.height);
   const data=cv.toDataURL('image/jpeg',.7);document.getElementById('v7Image').value=data;
   v7PreviewPhoto(data);studioToast('Photo prête, clique sur Enregistrer ♡')
  };image.onerror=()=>studioToast('Impossible de lire cette image');image.src=reader.result
 };reader.onerror=()=>studioToast('Erreur de lecture');reader.readAsDataURL(file)
}
function v7SaveLook(){
 const p=db.looks.find(x=>x.id===studioSelectedLook);if(!p)return;
 const name=document.getElementById('v7Name').value.trim();if(!name){studioToast('Donne un nom à la tenue.');return}
 p.name=name;p.price=Math.max(0,Number(document.getElementById('v7Price').value)||0);p.category=document.getElementById('v7Category').value;
 p.desc=document.getElementById('v7Description').value;p.image=document.getElementById('v7Image').value;
 p.visible=document.getElementById('v7Visible').checked;
 if(save()){closeModal();studioDrawLooks();studioToast('Tenue sauvegardée sur cet appareil ♡')}
}
function v7DuplicateLook(){
 const p=db.looks.find(x=>x.id===studioSelectedLook);if(!p)return;
 const copy={...p,id:Date.now(),name:p.name+' copie',visible:false,likedByFounder:false};
 db.looks.unshift(copy);if(save()){closeModal();studioDrawLooks();v7OpenLook(copy.id)}
}
function v7DeleteLook(){
 const p=db.looks.find(x=>x.id===studioSelectedLook);if(!p)return;
 if(!confirm('Supprimer définitivement « '+p.name+' » de ta maquette ?'))return;
 db.looks=db.looks.filter(x=>x.id!==p.id);
 if(db.monthLookId===p.id){db.monthLookId=null;db.monthEnabled=false}
 if(save()){closeModal();studioDrawLooks();studioToast('Tenue supprimée')}
}
function v7SetMonthFromGallery(){
 const p=db.looks.find(x=>x.id===studioSelectedLook);if(!p)return;
 p.visible=true;
 db.monthLookId=p.id;db.monthEnabled=true;
 db.monthTitle=p.name;db.monthDescription=p.desc;db.monthImage='';
 if(save()){closeModal();studioDrawLooks();studioToast('Cette tenue est ton look du mois ✦')}
}
const v7OldRenderMonth=v5RenderMonth;
v5RenderMonth=function(){
 const area=document.getElementById('lookmonth');
 const target=document.getElementById('monthLook');
 if(!area||!target)return;
 if(db.monthEnabled===false){area.hidden=true;target.innerHTML='';return}
 const p=db.looks.find(x=>x.id===db.monthLookId&&x.visible!==false);
 if(!p){area.hidden=true;target.innerHTML='';return}
 area.hidden=false;
 const title=db.monthTitle||p.name,description=db.monthDescription||p.desc,photo=img(db.monthImage||p.image);
 target.innerHTML='<div class="month-photo">'+(photo?'<img src="'+esc(photo)+'" alt="'+esc(title)+'">':'')+'<span class="month-sticker">✦ LOOK DU MOIS ✦</span></div>'+
 '<div class="month-copy"><span class="month-label">KIANA / FEATURED LOOK</span><h3>'+esc(title)+'</h3><p>'+esc(description)+'</p>'+
 '<span class="eyebrow">'+esc(p.category)+'</span><span class="month-price">'+money(p.price)+'</span>'+
 '<div class="actions"><button class="btn hot" onclick="v5OpenFitting('+Number(p.id)+')">PERSONNALISER ♡</button><button class="btn" onclick="navigate(\'shop\')">VOIR LA BOUTIQUE ↗</button></div></div>'
};
v5FounderSeasons=function(){
 const p=db.looks.find(x=>x.id===db.monthLookId);
 const options=db.looks.filter(x=>x.visible!==false).map(x=>'<option value="'+Number(x.id)+'" '+(p?.id===x.id?'selected':'')+'>'+esc(x.name)+'</option>').join('');
 let html=studioAdminHeader('Collections & look du mois','Choisis ton coup de cœur du mois, ou retire-le en un clic.')+
 '<div class="month-admin"><h3>✦ Look du mois</h3><p class="hint">Un seul visuel mis en avant sur la page d’accueil. Le titre et la description sont entièrement personnalisables.</p>'+
 '<div class="v7-month-editor"><div><label for="v7MonthLook">Choisir une tenue</label><select class="field" id="v7MonthLook">'+options+'</select></div>'+
 '<div><label for="v7MonthTitle">Nom de la mise en avant</label><input class="field" id="v7MonthTitle" placeholder="Ex. THE IT GIRL" maxlength="100" value="'+esc(db.monthTitle||p?.name||'')+'"></div>'+
 '<div class="full"><label for="v7MonthDesc">Petite description</label><textarea class="field" rows="3" maxlength="600" id="v7MonthDesc">'+esc(db.monthDescription||p?.desc||'')+'</textarea></div>'+
 '<div class="full"><label for="v7MonthImage">Photo différente (facultatif)</label><input class="field" id="v7MonthImage" placeholder="Lien HTTPS de l’image" value="'+esc(db.monthImage||'')+'"></div></div>'+
 '<div class="editor-actions"><button class="btn hot" onclick="v7SaveMonth()">AFFICHER LE LOOK DU MOIS ♡</button><button class="btn v7-delete" onclick="v7RemoveMonth()">RETIRER LE LOOK DU MOIS</button></div>'+
 (p&&db.monthEnabled!==false?'<div class="v7-month-preview">'+(img(db.monthImage||p.image)?'<img src="'+esc(img(db.monthImage||p.image))+'" alt="">':'')+'<span><strong>'+esc(db.monthTitle||p.name)+'</strong><small>Actuellement affiché sur l’accueil</small></span></div>':'<p class="hint">Aucun look du mois n’est actuellement affiché.</p>')+
 '</div><h3>Collections saisonnières</h3><p class="hint">Elles restent présentées sur l’accueil. Ouvre uniquement celle que tu souhaites modifier.</p>';
 html+=db.seasons.map((s,i)=>'<details class="season-editor"><summary style="cursor:pointer;font-weight:800">'+esc(s.name)+(s.active===false?' · Masquée':' · Visible')+' ↗</summary>'+
 '<label>Nom de la collection</label><input class="field" id="v5SN'+i+'" value="'+esc(s.name)+'"><label>Collection liée</label><select id="v5SC'+i+'">'+['Baddie','Glam','Y2K','Soft'].map(x=>'<option '+(s.category===x?'selected':'')+'>'+x+'</option>').join('')+'</select>'+
 '<label>Description</label><textarea id="v5SD'+i+'" rows="2">'+esc(s.description)+'</textarea>'+
 '<label>Photo</label><input class="field" id="v5SI'+i+'" value="'+esc(s.image)+'">'+
 '<label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="v5SA'+i+'" '+(s.active!==false?'checked':'')+'> Visible sur l’accueil</label>'+
 '<button class="btn hot" onclick="v5SaveSeason('+i+')">ENREGISTRER LA COLLECTION</button></details>').join('');
 document.getElementById('adminPanel').innerHTML=html
};
function v7SaveMonth(){
 const id=Number(document.getElementById('v7MonthLook')?.value);
 const p=db.looks.find(x=>x.id===id);
 if(!p){studioToast('Choisis une tenue visible.');return}
 db.monthLookId=p.id;db.monthEnabled=true;
 db.monthTitle=document.getElementById('v7MonthTitle').value.trim()||p.name;
 db.monthDescription=document.getElementById('v7MonthDesc').value.trim()||p.desc;
 db.monthImage=document.getElementById('v7MonthImage').value.trim();
 if(save()){v5FounderSeasons();studioToast('Look du mois mis en avant ♡')}
}
function v7RemoveMonth(){
 if(!confirm('Retirer la mise en avant du look du mois ? La tenue restera dans le dressing.'))return;
 db.monthEnabled=false;db.monthLookId=null;db.monthTitle='';db.monthDescription='';db.monthImage='';
 if(save()){v5FounderSeasons();studioToast('Look du mois retiré de l’accueil')}
}
const v7OldShowFitting=v5ShowFitting;
v5ShowFitting=function(){
 v7OldShowFitting();
 document.querySelector('.outfit-config .outfit-pieces')?.remove();
 const subs=Array.from(document.querySelectorAll('.outfit-config .outfit-sub'));
 if(subs[0]?.textContent?.toLowerCase().includes('composition'))subs[0].remove()
};


/* KIANA STUDIO founder dashboard — browser-local demo */
function studioAdminHeader(title,subtitle,button){
 return '<div class="studio-admin-top"><div><span class="eyebrow">KIANA / FOUNDER DESK</span><h3>'+title+'</h3><p>'+subtitle+'</p></div>'+(button||'<span class="admin-chip">✦ LOCAL DEMO</span>')+'</div>'
}
function studioSetTab(tab){adminTab=tab;drawAdmin()}
function studioThumb(item){return img(item.image)?'<img class="manage-thumb" src="'+esc(img(item.image))+'" alt="">':'<span class="manage-thumb" style="display:grid;place-items:center">✦</span>'}
drawAdmin=function(){
 if(!studioUnlocked){studioGate();return}
 document.querySelectorAll('[data-admin-tab]').forEach(b=>b.classList.toggle('active',b.dataset.adminTab===adminTab));
 let main=document.getElementById('adminPanel');if(!main)return;
 if(adminTab==='overview'){
  main.innerHTML=studioAdminHeader('Bonsoir, Kiana ♡','Ton espace créatif pour préparer les collections et mettre le studio en valeur.')+
  '<div class="dashboard-stats"><div class="metric"><strong>'+db.looks.length+'</strong><small>Tenues</small></div><div class="metric"><strong>'+db.looks.filter(p=>p.visible!==false).length+'</strong><small>Looks visibles</small></div><div class="metric"><strong>'+db.photos.length+'</strong><small>Photos portfolio</small></div></div>'+
  '<div class="admin-feature"><span class="eyebrow">LET’S MAKE IT ICONIC</span><h4>Crée ton prochain best-seller .</h4><p>Choisis tes photos, tes compositions et les tenues à afficher dans la boutique.</p><button class="btn hot" onclick="studioNewLook()">+ AJOUTER UNE TENUE</button></div>'+
  '<h4>Accès rapide</h4><div class="admin-quick"><button class="quick-card" onclick="studioSetTab(\'looks\')"><span>✦</span><strong>Mes collections ↗</strong><small>Gérer les articles, prix et visuels</small></button><button class="quick-card" onclick="studioSetTab(\'photos\')"><span>♡</span><strong>Galerie ↗</strong><small>Mettre à jour les photos Polaroid</small></button><button class="quick-card" onclick="studioSetTab(\'text\')"><span>✎</span><strong>Mon histoire ↗</strong><small>Personnaliser la présentation</small></button><button class="quick-card" onclick="navigate(\'shop\')"><span>↗</span><strong>Prévisualiser ↗</strong><small>Voir le résultat sur cet appareil</small></button></div>'+
  '<div class="demo-notice" style="margin-top:23px"><b>À savoir :</b> les modifications sont enregistrées sur cet appareil seulement. Pour les partager avec tous tes clients , il faudra connecter ta base de données.</div>';return
 }
 if(adminTab==='looks'){studioDrawLooks();return}
 if(adminTab==='photos'){studioDrawPhotos();return}
 if(adminTab==='text'){studioDrawTexts();return}
 studioDrawSettings()
};
function studioDrawLooks(){
 if(!db.looks.some(p=>p.id===studioSelectedLook))studioSelectedLook=db.looks[0]?.id||null;
 let p=db.looks.find(p=>p.id===studioSelectedLook);
 let h=studioAdminHeader('Mon dressing','Un look peut rester brouillon ou être affiché dans le catalogue.','<button class="btn hot" onclick="studioNewLook()">+ NOUVEAU LOOK</button>');
 h+='<div class="manage-grid"><div class="collection-list">'+db.looks.map(x=>'<button class="manage-item '+(x.id===studioSelectedLook?'active':'')+'" onclick="studioSelectedLook='+Number(x.id)+';drawAdmin()">'+studioThumb(x)+'<span><strong>'+esc(x.name)+'</strong><small>'+esc(x.category)+' · '+(x.visible===false?'Brouillon':'Visible')+'</small></span></button>').join('')+'</div>';
 if(!p){document.getElementById('adminPanel').innerHTML=h+'<div class="editor-card">Ajoute ton premier look ♡</div></div>';return}
 h+='<div class="editor-card"><div class="editor-photo" id="studioLookPreview">'+(img(p.image)?'<img src="'+esc(img(p.image))+'" alt="Aperçu look">':'<span>KIANA ♡</span>')+'</div>'+
 '<div class="twocol"><div><label for="stName">Nom du look</label><input class="field" id="stName" maxlength="80" value="'+esc(p.name)+'"></div><div><label for="stPrice">Prix ($ )</label><input class="field" id="stPrice" type="number" min="0" max="9999999" value="'+Number(p.price||0)+'"></div></div>'+
 '<label for="stCategory">Collection</label><select id="stCategory">'+['Baddie','Glam','Y2K','Soft'].map(c=>'<option '+(p.category===c?'selected':'')+'>'+c+'</option>').join('')+'</select>'+
 '<label for="stDesc">Description</label><textarea rows="3" maxlength="1500" id="stDesc">'+esc(p.desc)+'</textarea>'+
 '<label for="stParts">Composition du look</label><textarea rows="3" maxlength="1500" id="stParts">'+esc(p.parts)+'</textarea>'+
 '<label for="stImage">URL HTTPS de la photo</label><input class="field" id="stImage" value="'+esc(p.image||'')+'" oninput="studioPreviewImg(this.value,\'studioLookPreview\')">'+
 '<label for="stFile">Ou importer une image</label><input class="field" id="stFile" type="file" accept="image/*" onchange="studioUploadImage(this,\'look\')"><p class="editor-help">Import local uniquement : les images ne sont pas encore envoyées sur Render/Supabase.</p>'+
 '<label class="checkbox-line"><input type="checkbox" id="stVisible" '+(p.visible!==false?'checked':'')+'> Afficher cette tenue en boutique</label>'+
 '<label class="checkbox-line"><input type="checkbox" id="stFeatured" '+(p.featured?'checked':'')+'> Sélection de Kiana (accueil)</label>'+
 '<div class="editor-actions"><button class="btn hot" onclick="studioSaveLook()">ENREGISTRER ♡</button><button class="btn" onclick="studioDuplicateLook()">DUPLIQUER</button><button class="btn" onclick="studioDeleteLook()">SUPPRIMER</button></div></div></div>';
 document.getElementById('adminPanel').innerHTML=h;
}
function studioNewLook(){let p={id:Date.now(),name:'Nouveau look',category:'Baddie',price:0,desc:'À personnaliser',parts:'À compléter',image:'',visible:false,featured:false};db.looks.unshift(p);studioSelectedLook=p.id;adminTab='looks';save();drawAdmin();studioToast('Brouillon prêt à personnaliser ♡')}
function studioSaveLook(){
 let p=db.looks.find(p=>p.id===studioSelectedLook);if(!p)return;
 let name=document.getElementById('stName').value.trim();if(!name){studioToast('Il faut un nom pour ce look.');return}
 p.name=name;p.price=Math.max(0,Math.min(9999999,Number(document.getElementById('stPrice').value)||0));p.category=document.getElementById('stCategory').value;
 p.desc=document.getElementById('stDesc').value;p.parts=document.getElementById('stParts').value;p.image=document.getElementById('stImage').value;
 p.visible=document.getElementById('stVisible').checked;p.featured=document.getElementById('stFeatured').checked;
 if(save()){drawAdmin();studioToast('Look enregistré localement ✦')}
}
function studioDuplicateLook(){let p=db.looks.find(p=>p.id===studioSelectedLook);if(!p)return;let clone={...p,id:Date.now(),name:p.name+' - copie',visible:false,featured:false};db.looks.unshift(clone);studioSelectedLook=clone.id;save();drawAdmin()}
function studioDeleteLook(){let p=db.looks.find(p=>p.id===studioSelectedLook);if(!p)return;if(!confirm('Supprimer « '+p.name+' » de cette démo ?'))return;db.looks=db.looks.filter(x=>x.id!==p.id);studioSelectedLook=null;save();drawAdmin();studioToast('Look supprimé de la démo')}
function studioDrawPhotos(){
 if(studioSelectedPhoto>=db.photos.length)studioSelectedPhoto=Math.max(0,db.photos.length-1);
 let p=db.photos[studioSelectedPhoto];
 let h=studioAdminHeader('Mon portfolio','Chaque souvenir mode mérite son propre Polaroid.','<button class="btn hot" onclick="studioNewPhoto()">+ AJOUTER UNE PHOTO</button>');
 h+='<div class="manage-grid"><div class="collection-list">'+db.photos.map((x,i)=>'<button class="manage-item '+(i===studioSelectedPhoto?'active':'')+'" onclick="studioSelectedPhoto='+i+';drawAdmin()">'+studioThumb(x)+'<span><strong>'+esc(x.title)+'</strong><small>Polaroid #'+(i+1)+'</small></span></button>').join('')+'</div>';
 if(!p)h+='<div class="editor-card">Ton album attend sa première photo ♡</div></div>';
 else h+='<div class="editor-card"><div class="editor-photo" id="studioPhotoPreview">'+(img(p.image)?'<img src="'+esc(img(p.image))+'" alt="Aperçu photo">':'<span>POLAROID ♡</span>')+'</div><label for="stPhotoTitle">Titre du Polaroid</label><input class="field" id="stPhotoTitle" maxlength="100" value="'+esc(p.title)+'"><label for="stPhotoUrl">Photo (URL HTTPS)</label><input class="field" id="stPhotoUrl" value="'+esc(p.image||'')+'" oninput="studioPreviewImg(this.value,\'studioPhotoPreview\')"><label for="stPhotoUpload">Ou importer depuis ton appareil</label><input class="field" type="file" id="stPhotoUpload" accept="image/*" onchange="studioUploadImage(this,\'photo\')"><div class="editor-actions"><button class="btn hot" onclick="studioSavePhoto()">SAUVEGARDER ♡</button><button class="btn" onclick="studioDeletePhoto()">SUPPRIMER</button></div></div></div>';
 document.getElementById('adminPanel').innerHTML=h
}
function studioNewPhoto(){db.photos.push({title:'Nouveau Polaroid',image:''});studioSelectedPhoto=db.photos.length-1;adminTab='photos';save();drawAdmin()}
function studioSavePhoto(){let p=db.photos[studioSelectedPhoto];if(!p)return;p.title=document.getElementById('stPhotoTitle').value.trim()||'Photo ';p.image=document.getElementById('stPhotoUrl').value;if(save()){drawAdmin();studioToast('Photo mise à jour ♡')}}
function studioDeletePhoto(){if(!confirm('Supprimer cette photo de la démo ?'))return;db.photos.splice(studioSelectedPhoto,1);studioSelectedPhoto=Math.max(0,studioSelectedPhoto-1);save();drawAdmin()}
function studioDrawTexts(){
 document.getElementById('adminPanel').innerHTML=studioAdminHeader('Ton histoire','Écris tes textes et regarde le résultat en direct.')+
 '<div class="preview-split"><div class="editor-card"><label for="stIntro">Texte de l’accueil</label><textarea rows="6" id="stIntro" maxlength="1800" oninput="studioTextPreview()">'+esc(db.intro)+'</textarea><label for="stBio">Biographie de Kiana</label><textarea rows="8" id="stBio" maxlength="4000" oninput="studioTextPreview()">'+esc(db.bio)+'</textarea><div class="editor-actions"><button class="btn hot" onclick="studioSaveTexts()">ENREGISTRER MES TEXTES ♡</button></div></div><div class="mini-preview"><span class="eyebrow">APERÇU EN DIRECT</span><h4>KIANA STUDIO ♡</h4><p id="stPreviewIntro"></p><hr style="border-color:#b783a1"><h4 style="font-size:1.5rem">Meet Kiana</h4><p id="stPreviewBio"></p></div></div>';
 studioTextPreview()
}
function studioTextPreview(){document.getElementById('stPreviewIntro').textContent=document.getElementById('stIntro').value;document.getElementById('stPreviewBio').textContent=document.getElementById('stBio').value}
function studioSaveTexts(){db.intro=document.getElementById('stIntro').value;db.bio=document.getElementById('stBio').value;if(save())studioToast('Présentation actualisée sur cet appareil ♡')}
function studioDrawSettings(){
 document.getElementById('adminPanel').innerHTML=studioAdminHeader('Paramètres','Sauvegardes et code d’accès pour ta démo.')+
 '<div class="editor-card"><h4>Code fondatrice local</h4><p class="hint">Ce code est propre à ton navigateur et n’est pas un système de connexion public sécurisé.</p><label for="stNewCode">Changer le code de démonstration</label><input class="field" id="stNewCode" type="password" minlength="6" maxlength="64" autocomplete="new-password" placeholder="Nouveau code (6 caractères minimum)"><div class="editor-actions"><button class="btn hot" onclick="studioChangeCode()">MODIFIER MON CODE</button><button class="btn" onclick="studioLogout()">SE DÉCONNECTER</button></div></div>'+
 '<div class="editor-card" style="margin-top:17px"><h4>Sauvegarde de la maquette</h4><p class="hint">Télécharge un fichier pour garder tes créations, ou importe une sauvegarde.</p><button class="btn hot" onclick="exportData()">EXPORTER JSON</button><label>Importer une sauvegarde JSON</label><input class="field" type="file" accept=".json,application/json" onchange="studioImport(this)"></div>'+
 '<div class="demo-notice" style="margin-top:19px">Pour passer en version réelle, il reste à relier la base Supabase dédiée, activer les comptes sécurisés et stocker les photos dans un espace partagé.</div>'
}
async function studioChangeCode(){let code=document.getElementById('stNewCode').value;if(code.length<6){studioToast('Minimum 6 caractères.');return}try{let salt=studioSalt();localStorage.setItem(STUDIO_CODE_KEY,JSON.stringify({salt,hash:await studioDigest(code,salt)}));document.getElementById('stNewCode').value='';studioToast('Code local modifié ♡')}catch{studioToast('Erreur lors du changement de code')}}
function studioImport(el){if(!confirm('Importer ce fichier à la place des données actuelles de cette démo ?'))return;importData(el);setTimeout(()=>drawAdmin(),200)}

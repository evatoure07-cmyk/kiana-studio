
/* KIANA STUDIO V7 / palettes + order polish — browser-local demonstration */
const v7Colors=[
 ['Noir couture','#17141d'],['Blanc ivoire','#faf8ef'],['Rouge passion','#e32637'],['Cerise','#a80c3b'],
 ['Rose fuchsia','#ed288d'],['Rose bonbon','#ff55ae'],['Prune','#6c215e'],['Violet royal','#7933c7'],
 ['Bleu électrique','#2059e8'],['Bleu nuit','#142a68'],['Turquoise','#00b7be'],['Vert émeraude','#087b50'],
 ['Vert forêt','#244b30'],['Orange vitaminé','#ff7226'],['Jaune soleil','#f8cb1f'],['Doré','#ba923d'],
 ['Chocolat','#633a31'],['Argent','#a3a5b2']
];
const v7ColorDraft={},v7ColorValidated={};
function v7PaletteMarkup(prefix){
 const draft=v7ColorDraft[prefix],verified=v7ColorValidated[prefix],chosen=v7Colors[draft];
 return '<section class="commission-section" id="v7Palette-'+prefix+'"><span class="commission-step">LA COULEUR / TON STYLE</span>'+
 '<h3>Quelle couleur veux-tu ? ♡</h3><p class="commission-intro">Choisis une couleur dominante, que tu sois en choix libre ou en customisation. Tu pourras donner d’autres précisions juste après.</p>'+
 '<div class="v7-color-palette" role="group" aria-label="Choix de la couleur dominante">'+
 v7Colors.map(([name,hex],i)=>'<button type="button" class="v7-color-option '+(draft===i?'selected':'')+'" data-color-index="'+i+'" style="background:'+hex+'" aria-label="'+name+'" aria-pressed="'+String(draft===i)+'" title="'+name+'" onclick="v7PickColor(\''+prefix+'\','+i+')"></button>').join('')+
 '</div><div class="v7-color-description"><span class="v7-color-chip" style="background:'+(chosen?chosen[1]:'#49204b')+'"></span><span id="v7PaletteName-'+prefix+'">'+(chosen?'Couleur choisie : '+chosen[0]:'Choisis une couleur ci-dessus ✧')+'</span></div>'+
 '<button type="button" class="btn hot v7-confirm-color" id="v7Confirm-'+prefix+'" onclick="v7ConfirmColor(\''+prefix+'\')" '+(draft===undefined?'disabled':'')+'>'+(verified!==undefined&&verified===draft?'✓ COULEUR VALIDÉE':'VALIDER CETTE COULEUR ↗')+'</button>'+
 '<div class="v7-color-confirmed" id="v7Confirmed-'+prefix+'" '+(verified===undefined||verified!==draft?'hidden':'')+'>✦ Couleur confirmée : '+(chosen?chosen[0]:'')+'</div><p class="v7-hint">Pour continuer, clique sur « Valider cette couleur » après l’avoir choisie.</p></section>'
}
const v7OldFields=v6Fields;
v6Fields=function(prefix,defaultService){
 const body=v7OldFields(prefix,defaultService);
 const marker='<section class="commission-section"><span class="commission-step">ÉTAPE 04 / DERNIERS DÉTAILS</span>';
 return body.replace(marker,v7PaletteMarkup(prefix)+marker)
};
function v7PickColor(prefix,index){
 v7ColorDraft[prefix]=index;
 delete v7ColorValidated[prefix];
 const region=document.getElementById('v7Palette-'+prefix);
 if(!region)return;
 region.querySelectorAll('[data-color-index]').forEach((b,i)=>{
  const selected=i===index;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))
 });
 const [name,hex]=v7Colors[index];
 const chip=region.querySelector('.v7-color-chip');if(chip)chip.style.background=hex;
 document.getElementById('v7PaletteName-'+prefix).textContent='Couleur choisie : '+name;
 const confirm=document.getElementById('v7Confirm-'+prefix);confirm.disabled=false;confirm.textContent='VALIDER CETTE COULEUR ↗';
 const validated=document.getElementById('v7Confirmed-'+prefix);validated.hidden=true;
}
function v7ConfirmColor(prefix){
 const index=v7ColorDraft[prefix];if(index===undefined){studioToast('Sélectionne une couleur d’abord ♡');return}
 v7ColorValidated[prefix]=index;
 document.getElementById('v7Confirm-'+prefix).textContent='✓ COULEUR VALIDÉE';
 const feedback=document.getElementById('v7Confirmed-'+prefix);
 feedback.textContent='✦ Couleur confirmée : '+v7Colors[index][0];feedback.hidden=false;
 studioToast('Couleur '+v7Colors[index][0]+' validée ♡')
}
const v7OldRead=v6Read;
v6Read=function(prefix){
 const info=v7OldRead(prefix);if(!info)return null;
 const index=v7ColorValidated[prefix];
 if(index===undefined||index!==v7ColorDraft[prefix]){
  studioToast('Choisis et valide la couleur de ta tenue ♡');
  document.getElementById('v7Palette-'+prefix)?.scrollIntoView({behavior:'smooth',block:'center'});
  return null
 }
 info.color=v7Colors[index][0];info.colorHex=v7Colors[index][1];
 return info
};
const v7OldCreate=v6CreateOrder;
v6CreateOrder=function(info,items,total){
 const result=v7OldCreate(info,items,total);
 if(result){delete v7ColorDraft.cart;delete v7ColorValidated.cart;delete v7ColorDraft.commission;delete v7ColorValidated.commission}
 return result
};
const v7OldReceiptHTML=v6ReceiptHTML;
v6ReceiptHTML=function(o){
 const html=v7OldReceiptHTML(o);
 return o.color?html.replace('<div class="barcode"></div>','<div class="receiptline"><b>Couleur</b><span>'+esc(o.color)+'</span></div><div class="barcode"></div>'):html
};
const v7OldReceiptText=receiptText;
receiptText=function(){
 let text=v7OldReceiptText();if(lastReceipt?.color)text+='\nCouleur dominante : '+lastReceipt.color;return text
};
const v7OldTrack=v5Track;
v5Track=function(){
 v7OldTrack();
 const code=document.getElementById('trackNumber')?.value.trim().toUpperCase();
 const phone=document.getElementById('trackContact')?.value.trim();
 const o=db.orders.find(x=>String(x.id).toUpperCase()===code&&v6PhoneNumber(x.phone||x.contact)===v6PhoneNumber(phone)&&v6PhoneNumber(phone).length>=5);
 const details=document.querySelector('#trackResult .order-details');
 if(o?.color&&details){const p=document.createElement('p');p.textContent='Couleur dominante : '+o.color;details.appendChild(p)}
};
const v7OldFounderOrders=v5FounderOrders;
v5FounderOrders=function(){
 v7OldFounderOrders();
 document.querySelectorAll('#adminPanel .admin-order-card').forEach((card,i)=>{
  const o=db.orders[i];if(!o)return;
  const details=card.querySelector('.order-details');
  if(o.color&&details){const p=document.createElement('p');p.textContent='Couleur souhaitée : '+o.color;details.appendChild(p)}
  const actions=card.querySelector('.editor-actions');
  if(actions){
   const button=document.createElement('button');button.className='btn v7-delete';button.type='button';button.textContent='SUPPRIMER LA COMMANDE';button.onclick=()=>v7DeleteOrder(i);actions.appendChild(button)
  }
 })
};
function v7DeleteOrder(i){
 const o=db.orders[i];if(!o)return;
 if(!confirm('Supprimer définitivement '+o.id+' de cet appareil ?'))return;
 db.orders.splice(i,1);
 if(save()){v5FounderOrders();studioToast('Commande supprimée de la démo ♡')}
}
(function v7RefreshCommission(){
 const fields=document.getElementById('commissionFields');
 if(fields)fields.innerHTML=v6Fields('commission','Création de tenue sur mesure');
})();

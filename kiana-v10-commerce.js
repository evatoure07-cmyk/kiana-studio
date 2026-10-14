/* KIANA STUDIO — Commerce improvements: budgets, express delivery and photo gallery */
const KIANA_EXPRESS_FEE=500;
function kianaToday(){
 const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')
}
function kianaDaysUntil(date){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return null;
 const [y,m,d]=date.split('-').map(Number),utc=Date.UTC(y,m-1,d),check=new Date(utc);
 if(check.getUTCFullYear()!==y||check.getUTCMonth()+1!==m||check.getUTCDate()!==d)return null;
 const [ty,tm,td]=kianaToday().split('-').map(Number);
 return Math.round((utc-Date.UTC(ty,tm-1,td))/86400000)
}
function kianaExpress(date){const days=kianaDaysUntil(date);return days!==null&&days>=0&&days<=3?500:0}
function kianaValidDate(date){
 const days=kianaDaysUntil(date);
 if(days===null||days<0||days>365){toast('Indique une date valide dans les 12 prochains mois.');return false}
 return true
}
function kianaBudget(){
 const choice=byId('order-budget')?.value||'';
 return choice==='other'?(Number(byId('order-budget-custom')?.value)||0):(Number(choice)||0)
}
function kianaDateInfo(date){
 if(!date)return'Choisis ta date de livraison.';
 const days=kianaDaysUntil(date);
 if(days===null||days<0||days>365)return'Choisis une date à venir, dans les 12 prochains mois.';
 return days<=3?'✦ Commande express : +500 $ (délai de 3 jours ou moins).':'Date standard : aucun supplément express.'
}
function kianaRefreshCartFee(){
 const fee=kianaExpress(byId('cart-date')?.value);
 const sum=cart.map(x=>({p:cartProduct(x.id),qty:x.qty})).filter(x=>x.p).reduce((t,x)=>t+x.p.price*x.qty,0);
 const count=cart.reduce((t,x)=>t+x.qty,0);
 const totals=byId('cart-totals');
 if(totals)totals.innerHTML='<div class="cart-total-line"><span>'+count+' tenue'+(count>1?'s':'')+'</span><strong>'+price(sum)+'</strong></div>'+
 '<div class="cart-total-line"><span>Supplément express</span><strong>'+price(fee)+'</strong></div>'+
 '<div class="cart-total-line"><span>Total</span><strong class="price">'+price(sum+fee)+'</strong></div>';
 const el=byId('cart-urgent');if(el){el.textContent=kianaDateInfo(byId('cart-date')?.value);el.classList.toggle('urgent',fee>0)}
}
function kianaRefreshOrderFee(){
 const fee=kianaExpress(byId('order-date')?.value),budget=kianaBudget(),box=byId('order-price-breakdown');
 if(box)box.innerHTML='<div class="estimate-line"><span>Budget de la création</span><strong>'+(budget?price(budget):'À choisir')+'</strong></div>'+
 '<div class="estimate-line"><span>Prix de la tenue</span><strong>Sur devis</strong></div>'+
 '<div class="estimate-line"><span>Supplément express</span><strong>'+price(fee)+'</strong></div>'+
 '<div class="estimate-line"><span>Total</span><strong>'+(fee?'Sur devis + 500 $':'Sur devis')+'</strong></div>';
 const total=byId('order-summary-price');if(total)total.textContent=fee?'Sur devis + 500 $':'Sur devis';
 const el=byId('order-deadline-feedback');if(el){el.textContent=kianaDateInfo(byId('order-date')?.value);el.classList.toggle('urgent',fee>0)}
}
const kianaOldRenderCart=renderCart;
renderCart=function(){kianaOldRenderCart();kianaRefreshCartFee()};
const kianaOldRenderCommission=renderCommission;
renderCommission=function(){kianaOldRenderCommission();kianaRefreshOrderFee()};
submitCart=function(){
 const active=cart.map(entry=>({entry,p:cartProduct(entry.id)})).filter(x=>x.p);
 if(!active.length){toast('Ajoute une tenue dans ton panier.');return}
 const name=byId('cart-name').value.trim(),phone=byId('cart-phone').value.trim(),date=byId('cart-date').value;
 if(name.length<2){toast('Indique ton nom.');return}
 if(!validPhone(phone)){toast('Indique un numéro de téléphone valide.');return}
 if(!kianaValidDate(date))return;
 const items=active.map(({entry,p})=>({id:String(p.id),name:p.name,price:p.price,qty:entry.qty,image:p.image}));
 const subtotal=items.reduce((n,x)=>n+x.price*x.qty,0),fee=kianaExpress(date),total=subtotal+fee;
 const [seq,id]=nextOrderId();
 const order={id,kind:'boutique',createdAt:new Date().toISOString(),status:'En préparation',
 name,phone,service:'Commande boutique',lookName:items.length+' tenue'+(items.length>1?'s':''),
 items,subtotal,expressFee:fee,requestedDate:date,price:total,total,mode:'Catalogue',color:'—',options:{},
 wants:byId('cart-note').value.trim(),avoid:''};
 if(!storeOrder(order,seq))return;
 cart=[];persistCart();byId('cart-checkout-form').reset();nav('receipt');
 toast('Commande '+id+' créée ♡')
};
submitOrder=function(){
 const name=byId('order-name').value.trim(),phone=byId('order-phone').value.trim(),service=byId('order-service').value;
 const date=byId('order-date').value,budget=kianaBudget();
 if(name.length<2){toast('Indique ton nom.');return}
 if(!validPhone(phone)){toast('Indique un numéro de téléphone valide.');return}
 if(!colorsValidated()){toast('Choisis une ou plusieurs couleurs et valide-les.');byId('color-options').scrollIntoView({block:'center',behavior:'smooth'});return}
 if(!budget||budget<1||budget>9999999){toast('Choisis un budget maximum.');return}
 if(!kianaValidDate(date))return;
 if(service==='Autre (à préciser)'&&!byId('order-other').value.trim()){toast('Précise ton service.');return}
 const options={};if(mode==='custom')ACCESSORIES.forEach(([id])=>{options[id]=document.querySelector('input[name="acc-'+id+'"]:checked')?.value||'Non'});
 const [seq,id]=nextOrderId(),fee=kianaExpress(date);
 const order={id,kind:'sur-mesure',createdAt:new Date().toISOString(),status:'En préparation',name,phone,
 service:service==='Autre (à préciser)'?'Autre : '+byId('order-other').value.trim():service,
 lookName:'Création sur mesure à distance',items:[],price:null,total:null,
 budget,requestedDate:date,expressFee:fee,
 mode:mode==='custom'?'Customisation':'Choix libre',color:validatedColorNames().join(', '),colors:validatedColorNames(),
 options,wants:byId('order-wants').value.trim(),avoid:byId('order-avoid').value.trim()};
 if(!storeOrder(order,seq))return;
 colorSelected=[];colorConfirmed=[];
 ['order-name','order-phone','order-wants','order-avoid','order-other','order-date','order-budget-custom'].forEach(k=>{if(byId(k))byId(k).value=''});
 byId('order-budget').value='';nav('receipt');toast('Demande '+id+' préparée ♡')
};
const kianaReceiptAmount=o=>orderAmount(o)===null?(o.expressFee?'Sur devis + '+price(o.expressFee):'Sur devis'):price(orderAmount(o));
orderSummaryText=function(o){
 return ['KIANA STUDIO · '+o.id,'Client : '+o.name,'Téléphone : '+o.phone,'Service : '+o.service,
 ...orderItems(o).map(x=>x.qty+' × '+x.name+' — '+price(Number(x.price)*Number(x.qty))),
 ...(!orderItems(o).length?['Création : '+o.lookName,'Mode : '+o.mode,'Couleurs : '+o.color,'Accessoires : '+orderOptionsText(o)]:[]),
 ...(o.budget?['Budget maximum (création) : '+price(o.budget)]:[]),
 ...(o.requestedDate?['Date souhaitée : '+o.requestedDate]:[]),
 'Supplément express : '+price(Number(o.expressFee)||0),
 ...(o.wants?['Souhaits : '+o.wants]:[]),...(o.avoid?['À éviter : '+o.avoid]:[]),
 'Total : '+kianaReceiptAmount(o),'Statut : '+o.status,'À transmettre à Kiana.'].join('\n')
};
renderReceipt=function(){
 const o=lastReceipt;if(!o){byId('receipt-area').innerHTML='<div class="panel">Aucun reçu en cours.</div>';return}
 const items=orderItems(o);
 const itemLines=items.length?items.map(x=>receiptRow(x.qty+' × '+x.name,price(x.qty*x.price))).join(''):
 receiptRow('Création',o.lookName||'Sur mesure')+receiptRow('Formule',o.mode||'Choix libre')+receiptRow('Couleurs',o.color||'À définir');
 const footer=receiptRow('Livraison souhaitée',o.requestedDate||'Non renseignée')+
 (o.budget?receiptRow('Budget de la création',price(o.budget)):'')+
 receiptRow('Supplément express',price(Number(o.expressFee)||0))+
 receiptRow('TOTAL',kianaReceiptAmount(o));
 byId('receipt-area').innerHTML='<div class="receipt-wrap"><div class="receipt"><h2>KIANA STUDIO ✦</h2><p>FASHION ORDER · MERCI ♡</p>'+
 receiptRow('Commande',o.id)+receiptRow('Nom',o.name)+receiptRow('Téléphone',o.phone)+receiptRow('Service',o.service)+itemLines+footer+
 '<div class="receipt-notes"><b>'+(items.length?'Articles':'Personnalisation')+':</b> '+
 escapeHtml(items.length?items.map(x=>x.qty+' × '+x.name).join(', '):orderOptionsText(o))+
 (o.wants?'<hr><b>Souhaits :</b> '+escapeHtml(o.wants):'')+
 (o.avoid?'<hr><b>À éviter :</b> '+escapeHtml(o.avoid):'')+'</div>'+
 '<div class="barcode"></div><p>THANK YOU, PRETTY ♡</p></div>'+
 '<div class="hero-actions" style="justify-content:center;margin:30px 0"><button class="btn btn-primary" data-action="copy-receipt">COPIER LE REÇU</button><button class="btn" data-action="track-last">SUIVRE MA COMMANDE</button></div>'+
 '<p class="notice" style="text-align:center">Commande enregistrée sur cet appareil uniquement. Copie-la pour la transmettre à Kiana.</p></div>'
};
/* New date/amount inputs update the quote without refreshing other fields. */
document.addEventListener('input',e=>{
 if(e.target.id==='order-budget-custom')kianaRefreshOrderFee();
 if(e.target.id==='order-date')kianaRefreshOrderFee();
 if(e.target.id==='cart-date')kianaRefreshCartFee()
});
document.addEventListener('change',e=>{
 if(e.target.id==='order-budget'){
  const custom=e.target.value==='other';byId('order-budget-custom-wrap').hidden=!custom;byId('order-budget-custom').required=custom;
  kianaRefreshOrderFee()
 }
 if(e.target.id==='order-date')kianaRefreshOrderFee();
 if(e.target.id==='cart-date')kianaRefreshCartFee()
});
['cart-date','order-date'].forEach(id=>{const el=byId(id);if(el)el.min=kianaToday()});

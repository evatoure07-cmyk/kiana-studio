/* KIANA STUDIO — founder work planner, week overview and authenticated messages */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const client=()=>window.kianaClient;
const admin=()=>window.kianaIsFounder?.()===true && !!window.kianaMemberUser?.();
const notify=x=>typeof toast==='function'?toast(x):console.info(x);
const KEY='kiana-founder-workplan-v11';
let weekOffset=0,orders=[],tasks=[],source='local',filter='all';
const loadLocal=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
function saveLocal(){try{localStorage.setItem(KEY,JSON.stringify(tasks));return true}catch{notify('Planning non sauvegardé, stockage plein.');return false}}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function dateOf(s){const [y,m,d]=String(s||'').split('-').map(Number);return new Date(y,m-1,d)}
function monday(offset){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7+offset*7);return d}
const niceDate=s=>{try{return dateOf(s).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}catch{return s}};
async function loadData(){
 source=admin()?'cloud':'local';
 if(source==='cloud'){
  const c=client();
  const [o,t]=await Promise.all([
   c.from('kiana_member_orders').select('id,order_number,order_kind,status,order_details,requested_date,created_at,total,user_id').order('created_at',{ascending:false}).limit(200),
   c.from('kiana_work_tasks').select('id,title,notes,due_date,status,created_at').order('due_date',{ascending:true}).limit(300)
  ]);
  if(o.error||t.error)throw Error(o.error?.message||t.error?.message);
  orders=o.data||[];tasks=t.data||[]
 }else{
  orders=Array.isArray(db.orders)?db.orders.map(o=>({
   id:o.remoteId||o.id,order_number:o.id,requested_date:o.requestedDate||null,
   status:o.status,order_kind:o.kind||'boutique',order_details:o,
   created_at:o.createdAt||'',local:true
  })):[];
  tasks=loadLocal().filter(x=>x&&x.id!=null)
 }
}
function weekRows(){
 const first=monday(weekOffset),days=[];
 for(let i=0;i<7;i++){const date=new Date(first);date.setDate(first.getDate()+i);const day=iso(date);
  const dueOrders=orders.filter(o=>o.requested_date===day);
  const dueTasks=tasks.filter(t=>t.due_date===day);
  days.push('<div class="kp-day '+(iso(new Date())===day?'today':'')+'"><span>'+date.toLocaleDateString('fr-FR',{weekday:'short'}).replace('.','')+'</span><b>'+date.getDate()+'</b>'+
   (dueOrders.length?'<small>'+dueOrders.length+' commande'+(dueOrders.length>1?'s':'')+'</small>':'')+
   (dueTasks.length?'<small>'+dueTasks.length+' tâche'+(dueTasks.length>1?'s':'')+'</small>':'')+'</div>')
 }
 return days.join('')
}
function render(){
 const el=$('admin-body');if(!el)return;
 const first=iso(monday(weekOffset)),end=new Date(monday(weekOffset));end.setDate(end.getDate()+6);
 const weekEnd=iso(end);
 const openOrders=orders.filter(o=>o.status!=='Livrée'),pending=tasks.filter(t=>t.status!=='Terminée');
 const dayEvents=[
  ...orders.filter(o=>o.requested_date&&o.requested_date>=first&&o.requested_date<=weekEnd).map(o=>({date:o.requested_date,kind:'order',record:o})),
  ...tasks.filter(t=>t.due_date>=first&&t.due_date<=weekEnd).map(t=>({date:t.due_date,kind:'task',record:t}))
 ].sort((a,b)=>a.date.localeCompare(b.date));
 el.innerHTML='<div class="admin-title"><div><span class="eyebrow">KIANA · THE WORK EDIT</span><h3 class="serif">Planning de travail ♡</h3>'+
 '<p class="help">Organise ta semaine, les commandes à préparer et tes tâches personnelles.</p></div>'+
 '<button class="btn btn-small" id="kp-reload" type="button">ACTUALISER ↻</button></div>'+
 '<div class="notice">'+(source==='cloud'?'Planning synchronisé avec Supabase. Seule une fondatrice autorisée peut le modifier.':
 'Mode local : ce planning utilise le navigateur de la fondatrice. La synchronisation partagée nécessite un compte KIANA autorisé administrateur dans Supabase.')+'</div>'+
 '<div class="kp-pulse"><div><strong>'+openOrders.length+'</strong><span>Commandes en préparation</span></div><div><strong>'+pending.length+'</strong><span>Tâches à terminer</span></div>'+
 '<div><strong>'+openOrders.filter(o=>o.requested_date&&o.requested_date<=iso(new Date())).length+'</strong><span>Échéances aujourd’hui / en retard</span></div></div>'+
 '<div class="kp-week-controls"><button class="btn btn-small" id="kp-prev">←</button><h4>'+niceDate(first)+' — '+niceDate(weekEnd)+'</h4><button class="btn btn-small" id="kp-next">→</button><button class="btn btn-small" id="kp-today">CETTE SEMAINE</button></div>'+
 '<div class="kp-week-grid">'+weekRows()+'</div>'+
 '<div class="kp-layout"><section class="kp-panel"><h3 class="serif">À faire cette semaine ✦</h3>'+
 (dayEvents.length?dayEvents.map(e=>e.kind==='order'?renderOrderEvent(e.record):renderTaskEvent(e.record)).join(''):
 '<div class="kp-empty">Aucune échéance cette semaine. Tu peux ajouter une tâche ♡</div>')+'</section>'+
 '<aside class="kp-panel"><h3 class="serif">Ajouter une tâche</h3><form id="kp-task-form">'+
 '<label>Nom de la tâche *</label><input class="field" id="kp-title" required minlength="2" maxlength="120" placeholder="Ex. Préparer les shootings">'+
 '<label>Date prévue *</label><input class="field" id="kp-date" type="date" required value="'+iso(new Date())+'">'+
 '<label>Notes</label><textarea class="field" id="kp-notes" rows="3" maxlength="1200" placeholder="Détails utiles…"></textarea>'+
 '<button type="submit" class="btn btn-primary btn-block" style="margin-top:15px">+ AJOUTER AU PLANNING</button></form>'+
 '<div class="kp-more"><h4>Toutes mes tâches</h4>'+(!tasks.length?'<p class="help">Aucune tâche personnelle.</p>':
 tasks.slice().sort((a,b)=>a.due_date.localeCompare(b.due_date)).slice(0,40).map(t=>renderTaskEvent(t)).join(''))+'</div></aside></div>';
 $('kp-prev').onclick=()=>{weekOffset--;render()};
 $('kp-next').onclick=()=>{weekOffset++;render()};
 $('kp-today').onclick=()=>{weekOffset=0;render()};
 $('kp-reload').onclick=()=>window.kianaFounderPlan();
 $('kp-task-form').onsubmit=createTask;
 el.querySelectorAll('[data-kp-task-status]').forEach(node=>node.onchange=()=>updateTask(node.dataset.kpTaskStatus,node.value));
 el.querySelectorAll('[data-kp-task-delete]').forEach(node=>node.onclick=()=>deleteTask(node.dataset.kpTaskDelete));
 el.querySelectorAll('[data-kp-chat]').forEach(node=>node.onclick=()=>window.kianaOpenOrderChat?.(node.dataset.kpChat));
 el.querySelectorAll('[data-kp-order-status]').forEach(node=>node.onchange=()=>updateOrder(node.dataset.kpOrderStatus,node.value))
}
function renderTaskEvent(t){
 return '<div class="kp-event"><div><span class="kp-type">✦ TÂCHE · '+esc(niceDate(t.due_date))+'</span><strong>'+esc(t.title)+'</strong>'+
 (t.notes?'<p>'+esc(t.notes)+'</p>':'')+'</div><div class="kp-event-actions">'+
 '<select class="field" data-kp-task-status="'+esc(t.id)+'"><option '+(t.status==='À faire'?'selected':'')+'>À faire</option>'+
 '<option '+(t.status==='En cours'?'selected':'')+'>En cours</option><option '+(t.status==='Terminée'?'selected':'')+'>Terminée</option></select>'+
 '<button class="btn btn-small btn-danger" data-kp-task-delete="'+esc(t.id)+'">SUPPRIMER</button></div></div>'
}
function renderOrderEvent(o){
 const info=o.order_details||{},name=info.name||'Client',look=info.lookName||'Commande';
 return '<div class="kp-event order"><div><span class="kp-type">▤ COMMANDE · '+esc(niceDate(o.requested_date))+'</span>'+
 '<strong>'+esc(o.order_number||o.id)+' — '+esc(look)+'</strong><p>'+esc(name)+' · '+esc(o.status)+'</p></div>'+
 '<div class="kp-event-actions">'+
 (o.local?'<span class="help">Commande locale</span>':
 '<select class="field" data-kp-order-status="'+Number(o.id)+'"><option '+(o.status==='En préparation'?'selected':'')+'>En préparation</option><option '+(o.status==='Livrée'?'selected':'')+'>Livrée</option></select>'+
 '<button class="btn btn-primary btn-small" data-kp-chat="'+Number(o.id)+'">MESSAGES ↗</button>')+'</div></div>'
}
async function createTask(e){
 e.preventDefault();
 const title=$('kp-title').value.trim(),date=$('kp-date').value,notes=$('kp-notes').value.trim();
 if(title.length<2||!date)return;
 const button=e.target.querySelector('button');button.disabled=true;
 if(source==='cloud'){
  const {error}=await client().from('kiana_work_tasks').insert({title,due_date:date,notes,status:'À faire'});
  if(error){notify('Tâche non créée : '+error.message);button.disabled=false;return}
 }else{
  tasks.unshift({id:'local-'+Date.now()+'-'+Math.random().toString(36).slice(2,5),title,due_date:date,notes,status:'À faire'});
  if(!saveLocal()){button.disabled=false;return}
 }
 notify('Tâche ajoutée au planning ♡');await window.kianaFounderPlan()
}
async function updateTask(id,status){
 if(!['À faire','En cours','Terminée'].includes(status))return;
 if(source==='cloud'){
  const {error}=await client().from('kiana_work_tasks').update({status}).eq('id',Number(id));
  if(error){notify(error.message);return}
 }else{
  const task=tasks.find(t=>String(t.id)===String(id));if(task){task.status=status;saveLocal()}
 }
 await window.kianaFounderPlan()
}
async function deleteTask(id){
 if(!confirm('Supprimer cette tâche du planning ?'))return;
 if(source==='cloud'){
  const {error}=await client().from('kiana_work_tasks').delete().eq('id',Number(id));
  if(error){notify(error.message);return}
 }else{tasks=tasks.filter(t=>String(t.id)!==String(id));saveLocal()}
 await window.kianaFounderPlan()
}
async function updateOrder(id,status){
 if(source!=='cloud'||!['En préparation','Livrée'].includes(status))return;
 const {error}=await client().from('kiana_member_orders').update({status}).eq('id',Number(id));
 if(error){notify('Changement impossible : '+error.message);return}
 notify('Commande mise à jour ♡');await window.kianaFounderPlan()
}
window.kianaFounderPlan=async()=>{
 const el=$('admin-body');if(!el||adminTab!=='workplan')return;
 el.innerHTML='<div class="community-loading">Ouverture du planning KIANA… ♡</div>';
 try{await loadData();if(adminTab==='workplan')render()}
 catch(err){el.innerHTML='<div class="notice">Impossible de charger le planning : '+esc(err.message||'Erreur')+' <button class="btn btn-small" id="kp-retry">Réessayer</button></div>';if($('kp-retry'))$('kp-retry').onclick=()=>window.kianaFounderPlan()}
}
})();

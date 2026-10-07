const $=s=>document.querySelector(s),K='tasklane.v1';
const iso=d=>d.toISOString().slice(0,10),day=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const uid=()=>Math.random().toString(36).slice(2,9);
let S;
try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
if(!S||!S.tasks){S={projects:[{id:'p1',name:'Website launch'},{id:'p2',name:'Q4 planning'}],tasks:[
{id:uid(),t:'Finalize homepage copy',n:'',p:'p1',s:'doing',r:'high',d:day(1),m:'15:00'},
{id:uid(),t:'Set up analytics events',n:'',p:'p1',s:'todo',r:'med',d:day(4)},
{id:uid(),t:'Review pricing page with legal',n:'',p:'p1',s:'todo',r:'high',d:day(-1)},
{id:uid(),t:'Draft team OKRs',n:'',p:'p2',s:'todo',r:'med',d:day(7)},
{id:uid(),t:'Book offsite venue',n:'',p:'p2',s:'done',r:'low',d:''}]}}
let cur='all',view='list',edit=null;
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PL={high:'High',med:'Medium',low:'Low'},SL={todo:'To do',doing:'In progress',done:'Done'};
const isLate=t=>!!t.d&&t.s!=='done'&&new Date(t.d+'T'+(t.m||'23:59'))<new Date();
const inView=t=>cur==='all'?true:cur==='today'?(t.d===day(0)&&t.s!=='done'):cur==='week'?(!!t.d&&t.d>=day(0)&&t.d<=day(7)&&t.s!=='done'):t.p===cur;
const vis=()=>{const q=$('#q').value.toLowerCase(),pf=$('#pf').value;
return S.tasks.filter(t=>inView(t)&&(!pf||t.r===pf)&&(!q||t.t.toLowerCase().includes(q)||t.n.toLowerCase().includes(q)))
.sort((a,b)=>(a.s==='done')-(b.s==='done')||((a.d||'9')+(a.m||'')).localeCompare((b.d||'9')+(b.m||'')))};
const fmt=d=>d?new Date(d+'T00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}):'No date';
function dueEl(t){const late=isLate(t),rel=t.d===day(0)?'Today':t.d===day(1)?'Tomorrow':fmt(t.d);return `<span class="due${late?' late':''}">${late?'Overdue ':''}${t.d?rel+(t.m?', '+t.m:''):'No date'}</span>`}
function side(){const c=id=>S.tasks.filter(t=>t.s!=='done'&&(id==='all'||(id==='today'?t.d===day(0):id==='week'?(t.d&&t.d>=day(0)&&t.d<=day(7)):t.p===id))).length;
$('#side').innerHTML=`<div class="brand">Tasklane</div><button class="nav ${cur==='all'?'on':''}" data-p="all">All tasks <small>${c('all')}</small></button><button class="nav ${cur==='today'?'on':''}" data-p="today">Today <small>${c('today')}</small></button><button class="nav ${cur==='week'?'on':''}" data-p="week">Next 7 days <small>${c('week')}</small></button><div class="side-h">Projects</div>`+
S.projects.map(p=>`<button class="nav ${cur===p.id?'on':''}" data-p="${p.id}">${esc(p.name)} <small>${c(p.id)}</small></button>`).join('')+
`<form class="addp" id="ap"><input placeholder="New project" aria-label="New project name"><button class="btn">Add</button></form>`;
$('#title').textContent={all:'All tasks',today:'Today',week:'Next 7 days'}[cur]||S.projects.find(p=>p.id===cur).name}
function stats(){const T=S.tasks.filter(inView),n=day(0),w=day(7);
const o=T.filter(t=>t.s!=='done');
const v=[['Open',o.length],['Due this week',o.filter(t=>t.d&&t.d>=n&&t.d<=w).length],['Overdue',o.filter(isLate).length],['Completed',T.length-o.length]];
$('#stats').innerHTML=v.map(([l,x])=>`<div><b>${x}</b><span>${l}</span></div>`).join('')}
function render(){side();stats();$('#vl').className=view==='list'?'on':'';$('#vb').className=view==='board'?'on':'';
const T=vis(),V=$('#view');
if(view==='list'){V.innerHTML=T.length?`<div class="list">`+T.map(t=>`<div class="row ${t.s==='done'?'done':''}"><input type="checkbox" class="chk" data-c="${t.id}" ${t.s==='done'?'checked':''} aria-label="Mark complete"><button class="t" data-e="${t.id}">${esc(t.t)}</button><span class="tag p-${t.r}">${PL[t.r]}</span>${dueEl(t)}<button class="x" data-x="${t.id}" aria-label="Delete task">×</button></div>`).join('')+`</div>`:`<div class="list empty">No tasks match. Add one above to get started.</div>`}
else{V.innerHTML=`<div class="board">`+Object.keys(SL).map(s=>{const L=T.filter(t=>t.s===s);return `<div class="col" data-s="${s}"><h3>${SL[s]}<span>${L.length}</span></h3>`+L.map(t=>`<div class="card" draggable="true" data-id="${t.id}"><button class="t" data-e="${t.id}">${esc(t.t)}</button><div><span class="tag p-${t.r}">${PL[t.r]}</span>${dueEl(t)}</div></div>`).join('')+`</div>`}).join('')+`</div>`}
save()}
document.addEventListener('click',e=>{const g=a=>e.target.closest('['+a+']');let b;
if(b=g('data-p')){cur=b.dataset.p;render()}
else if(b=g('data-e'))open(b.dataset.e)
else if(b=g('data-x')){S.tasks=S.tasks.filter(t=>t.id!==b.dataset.x);render()}});
document.addEventListener('change',e=>{if(e.target.dataset.c){const t=S.tasks.find(t=>t.id===e.target.dataset.c);t.s=e.target.checked?'done':'todo';render()}});
document.addEventListener('submit',e=>{if(e.target.id==='ap'){e.preventDefault();const i=e.target.querySelector('input'),n=i.value.trim();if(n){const p={id:uid(),name:n};S.projects.push(p);cur=p.id;render()}}});
$('#quick').onsubmit=e=>{e.preventDefault();const v=$('#qt').value.trim();if(!v)return;let d=$('#qd').value,m=$('#qm').value;if(!d&&cur==='today')d=day(0);if(m&&!d)d=day(0);
S.tasks.push({id:uid(),t:v,n:'',p:S.projects.some(p=>p.id===cur)?cur:S.projects[0].id,s:'todo',r:$('#qr').value,d,m});
if(m){try{if(Notification.permission==='default')Notification.requestPermission()}catch(x){}}
$('#qt').value='';$('#qd').value='';$('#qm').value='';$('#qr').value='med';render();toast('Task added')};
['#q','#pf'].forEach(s=>$(s).oninput=render);
$('#vl').onclick=()=>{view='list';render()};$('#vb').onclick=()=>{view='board';render()};
$('#th').onclick=()=>{const r=document.documentElement,d=r.dataset.theme==='dark'||(!r.dataset.theme&&matchMedia('(prefers-color-scheme:dark)').matches);r.dataset.theme=d?'light':'dark'};
function open(id){edit=S.tasks.find(t=>t.id===id);$('#fP').innerHTML=S.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
$('#fT').value=edit.t;$('#fN').value=edit.n;$('#fP').value=edit.p;$('#fS').value=edit.s;$('#fR').value=edit.r;$('#fD').value=edit.d;$('#fM').value=edit.m||'';$('#dlg').showModal()}
$('#f').onsubmit=()=>{Object.assign(edit,{t:$('#fT').value.trim(),n:$('#fN').value,p:$('#fP').value,s:$('#fS').value,r:$('#fR').value,d:$('#fD').value,m:$('#fM').value});render()};
$('#cn').onclick=()=>$('#dlg').close();
$('#del').onclick=()=>{S.tasks=S.tasks.filter(t=>t!==edit);$('#dlg').close();render()};
function toast(msg){const e=$('#toast');e.textContent=msg;e.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>e.hidden=true,6000)}
const sent={};
function check(){const now=new Date();S.tasks.forEach(t=>{const k=t.id+t.d+t.m;if(t.s==='done'||!t.d||!t.m||sent[k])return;const at=new Date(t.d+'T'+t.m);if(at<=now&&now-at<36e5){sent[k]=1;toast('Due now: '+t.t);try{if(Notification.permission==='granted')new Notification('Task due',{body:t.t})}catch(x){}}});render()}
setInterval(check,30000);
let drag=null;
document.addEventListener('dragstart',e=>{const c=e.target.closest('.card');if(c){drag=c.dataset.id;e.dataTransfer.effectAllowed='move'}});
document.addEventListener('dragover',e=>{const c=e.target.closest('.col');if(c&&drag){e.preventDefault();c.classList.add('over')}});
document.addEventListener('dragleave',e=>{const c=e.target.closest('.col');if(c)c.classList.remove('over')});
document.addEventListener('drop',e=>{const c=e.target.closest('.col');if(c&&drag){e.preventDefault();S.tasks.find(t=>t.id===drag).s=c.dataset.s;drag=null;render()}});
render();

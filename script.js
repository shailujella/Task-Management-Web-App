const $=s=>document.querySelector(s),K='tasklane.v2';
const iso=d=>d.toISOString().slice(0,10),day=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const uid=()=>Math.random().toString(36).slice(2,9);
let S;
try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
if(!S||!S.tasks)S={projects:[],tasks:[]};
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
S.projects.map(p=>`<div class="prow"><button class="nav ${cur===p.id?'on':''}" data-p="${p.id}"><span>${esc(p.name)}</span> <small>${c(p.id)}</small></button><button class="x px" data-dp="${p.id}" aria-label="Delete project ${esc(p.name)}">×</button></div>`).join('')+
`<form class="addp" id="ap"><input placeholder="New project" aria-label="New project name"><button class="btn">Add</button></form><div class="data"><div class="side-h">Data</div><button class="nav" data-act="ex">Export backup</button><button class="nav" data-act="im">Import backup</button><button class="nav" data-act="cc">Clear completed</button><input type="file" id="fi" accept="application/json" hidden></div>`;
$('#title').textContent={all:'All tasks',today:'Today',week:'Next 7 days'}[cur]||S.projects.find(p=>p.id===cur).name}
function stats(){const T=S.tasks.filter(inView),n=day(0),w=day(7);
const o=T.filter(t=>t.s!=='done');
const v=[['Open',o.length],['Due this week',o.filter(t=>t.d&&t.d>=n&&t.d<=w).length],['Overdue',o.filter(isLate).length],['Completed',T.length-o.length]];
const pct=T.length?Math.round((T.length-o.length)/T.length*100):0;
$('#stats').innerHTML=v.map(([l,x])=>`<div><b>${x}</b><span>${l}</span></div>`).join('')+`<div class="prog"><span>${pct}% complete</span><i><u style="width:${pct}%"></u></i></div>`}
function render(){side();stats();$('#vl').className=view==='list'?'on':'';$('#vb').className=view==='board'?'on':'';
const T=vis(),V=$('#view');
if(view==='list'){V.innerHTML=T.length?`<div class="list">`+T.map(t=>`<div class="row ${t.s==='done'?'done':''}"><input type="checkbox" class="chk" data-c="${t.id}" ${t.s==='done'?'checked':''} aria-label="Mark complete"><button class="t" data-e="${t.id}">${esc(t.t)}</button><span class="tag p-${t.r}">${PL[t.r]}</span>${dueEl(t)}<button class="x" data-x="${t.id}" aria-label="Delete task">×</button></div>`).join('')+`</div>`:`<div class="list empty"><b>${S.tasks.length?'No tasks match your filters':'Nothing here yet'}</b>${S.tasks.length?'Try clearing the search or priority filter.':'Add your first task above. Give it a date and time and Tasklane will remind you.'}</div>`}
else{V.innerHTML=`<div class="board">`+Object.keys(SL).map(s=>{const L=T.filter(t=>t.s===s);return `<div class="col" data-s="${s}"><h3>${SL[s]}<span>${L.length}</span></h3>`+(L.length?'':'<p class="empty-col">Drop tasks here</p>')+L.map(t=>`<div class="card" draggable="true" data-id="${t.id}"><button class="t" data-e="${t.id}">${esc(t.t)}</button><div><span class="tag p-${t.r}">${PL[t.r]}</span>${dueEl(t)}</div></div>`).join('')+`</div>`}).join('')+`</div>`}
save()}
document.addEventListener('click',e=>{const g=a=>e.target.closest('['+a+']');let b;
if(b=g('data-p')){cur=b.dataset.p;render()}
else if(b=g('data-e'))open(b.dataset.e)
else if(b=g('data-x'))removeTask(b.dataset.x)
else if(b=g('data-dp'))removeProject(b.dataset.dp)
else if(b=g('data-act'))act(b.dataset.act)});
document.addEventListener('change',e=>{if(e.target.id==='fi'){imp(e.target.files[0]);e.target.value='';return}if(e.target.dataset.c){const t=S.tasks.find(t=>t.id===e.target.dataset.c);t.s=e.target.checked?'done':'todo';render()}});
document.addEventListener('submit',e=>{if(e.target.id==='ap'){e.preventDefault();const i=e.target.querySelector('input'),n=i.value.trim();if(n){const p={id:uid(),name:n};S.projects.push(p);cur=p.id;render()}}});
$('#quick').onsubmit=e=>{e.preventDefault();const v=$('#qt').value.trim();if(!v)return;let d=$('#qd').value,m=$('#qm').value;if(!d&&cur==='today')d=day(0);if(m&&!d)d=day(0);
S.tasks.push({id:uid(),t:v,n:'',p:S.projects.some(p=>p.id===cur)?cur:'',s:'todo',r:$('#qr').value,d,m});
if(m){try{if(Notification.permission==='default')Notification.requestPermission()}catch(x){}}
$('#qt').value='';$('#qd').value='';$('#qm').value='';$('#qr').value='med';render();toast('Task added')};
['#q','#pf'].forEach(s=>$(s).oninput=render);
$('#vl').onclick=()=>{view='list';render()};$('#vb').onclick=()=>{view='board';render()};
$('#th').onclick=()=>{const r=document.documentElement,d=r.dataset.theme==='dark'||(!r.dataset.theme&&matchMedia('(prefers-color-scheme:dark)').matches);r.dataset.theme=d?'light':'dark'};
function open(id){edit=S.tasks.find(t=>t.id===id);$('#fP').innerHTML='<option value="">No project</option>'+S.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
$('#fT').value=edit.t;$('#fN').value=edit.n;$('#fP').value=edit.p;$('#fS').value=edit.s;$('#fR').value=edit.r;$('#fD').value=edit.d;$('#fM').value=edit.m||'';$('#dlg').showModal()}
$('#f').onsubmit=()=>{Object.assign(edit,{t:$('#fT').value.trim(),n:$('#fN').value,p:$('#fP').value,s:$('#fS').value,r:$('#fR').value,d:$('#fD').value,m:$('#fM').value});render()};
$('#cn').onclick=()=>$('#dlg').close();
$('#del').onclick=()=>{$('#dlg').close();removeTask(edit.id)};
function toast(msg,undo){const e=$('#toast');e.textContent=msg;if(undo){const b=document.createElement('button');b.textContent='Undo';b.onclick=()=>{undo();e.hidden=true};e.append(' ',b)}e.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>e.hidden=true,undo?8000:6000)}
function removeTask(id){const i=S.tasks.findIndex(t=>t.id===id);if(i<0)return;const [t]=S.tasks.splice(i,1);render();toast('Task deleted',()=>{S.tasks.splice(i,0,t);render()})}
function removeProject(id){const i=S.projects.findIndex(p=>p.id===id);if(i<0)return;const [p]=S.projects.splice(i,1),aff=S.tasks.filter(t=>t.p===id);aff.forEach(t=>t.p='');if(cur===id)cur='all';render();toast('Project removed, its tasks were kept',()=>{S.projects.splice(i,0,p);aff.forEach(t=>t.p=id);render()})}
function act(a){if(a==='im')return $('#fi').click();
if(a==='ex'){const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),l=document.createElement('a');l.href=URL.createObjectURL(b);l.download='tasklane-backup.json';l.click();toast('Backup downloaded');return}
const old=S.tasks,n=old.filter(t=>t.s==='done').length;if(!n)return toast('No completed tasks to clear');S.tasks=old.filter(t=>t.s!=='done');render();toast(n+' completed task'+(n>1?'s':'')+' cleared',()=>{S.tasks=old;render()})}
function imp(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x.tasks)||!Array.isArray(x.projects))throw 0;S=x;cur='all';render();toast('Backup imported')}catch(e){toast('That file is not a valid Tasklane backup')}};r.readAsText(f)}
document.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey||$('#dlg').open||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;if(e.key==='n'){e.preventDefault();$('#qt').focus()}else if(e.key==='/'){e.preventDefault();$('#q').focus()}});
document.addEventListener('dragend',()=>{drag=null});
const sent={};
function check(){const now=new Date();S.tasks.forEach(t=>{const k=t.id+t.d+t.m;if(t.s==='done'||!t.d||!t.m||sent[k])return;const at=new Date(t.d+'T'+t.m);if(at<=now&&now-at<36e5){sent[k]=1;toast('Due now: '+t.t);try{if(Notification.permission==='granted')new Notification('Task due',{body:t.t})}catch(x){}}});if(!drag&&!$('#dlg').open)render()}
setInterval(check,30000);
let drag=null;
document.addEventListener('dragstart',e=>{const c=e.target.closest('.card');if(c){drag=c.dataset.id;e.dataTransfer.effectAllowed='move'}});
document.addEventListener('dragover',e=>{const c=e.target.closest('.col');if(c&&drag){e.preventDefault();c.classList.add('over')}});
document.addEventListener('dragleave',e=>{const c=e.target.closest('.col');if(c)c.classList.remove('over')});
document.addEventListener('drop',e=>{const c=e.target.closest('.col');if(c&&drag){e.preventDefault();S.tasks.find(t=>t.id===drag).s=c.dataset.s;drag=null;render()}});
render();

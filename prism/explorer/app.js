(() => {
'use strict';
const boot = window.PRISM_BOOTSTRAP;
const catalog = boot.catalog;
let data = boot.data, videoIndex = boot.videos;
let state = {cohort:'current',actor:'prism',condition:'friction_0p2',clip:0,mode:'physics',lastPhysics:'friction_0p2'};
const labels={prism:'PRISM',standard:'MLP',matched:'Matched'};
const colors={prism:'#D55E00',standard:'#0072B2',matched:'#56B4E9'};
const actors=['standard','matched','prism'];
const axisInfo={nominal:['Nominal','baseline'],friction:['Friction','coefficient μ'],mass:['Mass','robot mass ratio'],payload:['Payload','kg'],speed:['Speed','m/s']};
const param={friction:'foot_friction',mass:'global_link_density_ratio',payload:'payload_kg',speed:'command_vx'};
const $=id=>document.getElementById(id);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>Number.isFinite(n)?String(Number(n.toFixed(3))):'—';
const cells=()=>data.cohorts?.[state.cohort]?.cells||[];
const cell=(condition,actor)=>cells().find(c=>c.condition_id===condition&&c.actor===actor);
function measured(c){return c?.validated===true&&c.status==='complete'&&c.attempts===100&&Number.isInteger(c.survivors)&&c.survivors>=0&&c.survivors<=100&&Number.isFinite(c.survival_rate)&&Math.abs(c.survival_rate-c.survivors/100)<1e-10;}
function wilson(c){const n=c.attempts,p=c.survivors/n,z=1.959963984540054,d=1+z*z/n,m=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [Math.max(0,Math.min(p,m-h)),Math.min(1,Math.max(p,m+h))];}
function conditionById(id){return [...catalog.conditions,...catalog.extra_conditions].find(c=>c.condition_id===id);}
function title(c){return c.axis==='nominal'?'Nominal':c.axis==='terrain'?'Random rough':axisInfo[c.axis][0]+' '+number(c.x)+(c.axis==='payload'?' kg':c.axis==='speed'?' m/s':c.axis==='mass'?'×':'');}
function choose(condition,actor){state.condition=condition;if(actor)state.actor=actor;state.clip=0;state.mode=condition==='random_rough'?'terrain':'physics';if(state.mode==='physics')state.lastPhysics=condition;render();}
function chart(axis){
 const list=catalog.conditions.filter(c=>c.axis===axis),values=list.map(c=>axis==='nominal'?0:Number(c.x));
 const min=axis==='nominal'?-1:axis==='speed'?0:Math.min(...values),max=axis==='nominal'?1:Math.max(...values);
 const x=v=>42+(v-min)/(max-min)*251,y=v=>164-v*1.36;
 let out='<svg viewBox="0 0 320 213" role="img" aria-label="'+escape(axisInfo[axis][0])+' survival rate">';
 if(axis!=='nominal'){
  const band=catalog.cohorts[state.cohort].training_support[param[axis]],bounds=axis==='speed'?band.positive_panel_projection:band.support;
  const lo=x(Math.max(min,bounds[0])),hi=x(Math.min(max,bounds[1]));
  if(bounds[0]===bounds[1])out+='<line x1="'+lo+'" x2="'+lo+'" y1="28" y2="164" stroke="#b9c7da" stroke-dasharray="3 3"/>';
  else out+='<rect x="'+lo+'" y="28" width="'+Math.max(0,hi-lo)+'" height="136" fill="#edf1f7"/>';
 }
 [0,25,50,75,100].forEach(v=>{out+='<line x1="42" x2="293" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#e6ebf2"/><text x="34" y="'+(y(v)+3)+'" text-anchor="end" fill="#8995a6" font-size="9">'+v+'</text>';});
 if(axis!=='nominal')[...actors.filter(a=>a!==state.actor),state.actor].forEach(actor=>{
  for(let i=0;i<list.length-1;i++){
   const left=cell(list[i].condition_id,actor),right=cell(list[i+1].condition_id,actor);
   if(!measured(left)||!measured(right))continue;
   const x1=x(values[i]),x2=x(values[i+1]),y1=y(left.survival_rate*100),y2=y(right.survival_rate*100),d='M '+x1+' '+y1+' L '+x2+' '+y2;
   out+='<path d="'+d+'" fill="none" stroke="'+colors[actor]+'" stroke-width="1.7" opacity="'+(actor===state.actor ? .95 : .45)+'" pointer-events="none"/><path class="curve-hit" d="'+d+'" fill="none" stroke="transparent" stroke-width="12" pointer-events="stroke" data-curve-left="'+list[i].condition_id+'" data-curve-right="'+list[i+1].condition_id+'" data-actor="'+actor+'" data-x-left="'+x1+'" data-x-right="'+x2+'" tabindex="0" role="button" aria-label="'+escape(labels[actor]+' measured curve, '+title(list[i])+' to '+title(list[i+1])+'. Enter selects left; Shift Enter selects right.')+'"/>';
  }
 });
 list.forEach((c,i)=>{
  const px=x(values[i]),selected=state.condition===c.condition_id,targetWidth=axis==='nominal'?54:18;
  out+='<rect class="pending-target" x="'+(px-targetWidth/2)+'" y="170" width="'+targetWidth+'" height="25" rx="4" fill="'+(selected?'#fff0e5':'transparent')+'" data-condition="'+c.condition_id+'" tabindex="0" role="button" aria-label="Select '+escape(title(c))+'"/><text class="tick '+(selected?'selected-tick':'')+'" x="'+px+'" y="187" text-anchor="middle" data-condition="'+c.condition_id+'">'+(axis==='nominal'?'Nominal':number(c.x))+'</text>';
  [...actors.filter(a=>a!==state.actor),state.actor].forEach(actor=>{const j=actors.indexOf(actor),m=cell(c.condition_id,actor);if(!measured(m))return;
   const pxm=px+(axis==='nominal'?(j-1)*16:0),py=y(m.survival_rate*100),interval=wilson(m),opacity=actor===state.actor?1:.62;
   out+='<g opacity="'+opacity+'"><line x1="'+pxm+'" x2="'+pxm+'" y1="'+y(interval[0]*100)+'" y2="'+y(interval[1]*100)+'" stroke="'+colors[actor]+'" stroke-width="1.1"/><circle class="point" cx="'+pxm+'" cy="'+py+'" r="'+(actor===state.actor?5:3.7)+'" fill="'+colors[actor]+'" stroke="white" stroke-width="1.4" data-condition="'+c.condition_id+'" data-actor="'+actor+'" tabindex="0" role="button" aria-label="'+escape(title(c)+' '+labels[actor]+' '+m.survivors+'/100 survived')+'"><title>'+escape(labels[actor]+': '+m.survivors+'/100 survived')+'</title></circle></g>';
  });
 });
 out+='</svg>';return out;
}
function trainLabel(axis){if(axis==='nominal')return 'Nominal reference';const b=catalog.cohorts[state.cohort].training_support[param[axis]],r=axis==='speed'?b.positive_panel_projection:b.support;if(axis==='speed')return 'Training: −2–3 m/s · positive range shaded';return r[0]===r[1]?'Training: fixed '+number(r[0])+(axis==='mass'?'×':axis==='payload'?' kg':''):'Training: '+number(r[0])+'–'+number(r[1])+(axis==='payload'?' kg':'');}
function renderCharts(){
 $('panels').hidden=state.mode!=='physics';$('rough-chart').hidden=state.mode!=='terrain';$('band-key').hidden=state.mode!=='physics';$('section-title').textContent=state.mode==='physics'?'20 s survival rate':'Random rough · 20 s survival';document.querySelectorAll('[data-mode]').forEach(e=>e.classList.toggle('active',e.dataset.mode===state.mode));
 $('panels').innerHTML=catalog.axes.map(axis=>'<article class="panel '+(conditionById(state.condition).axis===axis?'selected':'')+'"><div class="panel-header"><h3>'+axisInfo[axis][0]+'</h3><span class="unit">'+axisInfo[axis][1]+'</span></div>'+chart(axis)+'<div class="train-label">'+trainLabel(axis)+'</div></article>').join('');
 $('panels').querySelectorAll('[data-condition]').forEach(el=>{const act=()=>choose(el.dataset.condition,el.dataset.actor);el.addEventListener('click',act);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}});});
 $('panels').querySelectorAll('[data-curve-left]').forEach(el=>{
  el.addEventListener('click',event=>{const p=el.ownerSVGElement.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const local=p.matrixTransform(el.ownerSVGElement.getScreenCTM().inverse());const left=Number(el.dataset.xLeft),right=Number(el.dataset.xRight);choose(Math.abs(local.x-left)<=Math.abs(local.x-right)?el.dataset.curveLeft:el.dataset.curveRight,el.dataset.actor);});
  el.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(event.shiftKey?el.dataset.curveRight:el.dataset.curveLeft,el.dataset.actor);}});
 });
 const complete=cells().filter(measured).length;$('progress').textContent=complete+' / 75 method–condition results closed · 100 trials per result';
 const rough=data.random_rough?.filter(r=>r.cohort===state.cohort)||[];
 if(state.mode==='terrain'){
  let svg='<svg viewBox="0 0 650 286" role="img" aria-label="Random rough survival comparison">';const y=v=>222-v*1.72;
  [0,25,50,75,100].forEach(v=>{svg+='<line x1="58" x2="620" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#e1e7ef"/><text x="46" y="'+(y(v)+4)+'" text-anchor="end" fill="#7c8ba1" font-size="12">'+v+'</text>';});
  actors.forEach((a,i)=>{const r=rough.find(r=>r.actor===a);if(!r)return;const x=151+i*187,interval=wilson(r);svg+='<g class="point" data-rough-actor="'+a+'" role="button" tabindex="0" aria-label="'+labels[a]+' '+r.survivors+' of100 survived"><rect x="'+(x-47)+'" y="'+y(r.survival_rate*100)+'" width="94" height="'+(222-y(r.survival_rate*100))+'" rx="4" fill="'+colors[a]+'" opacity="'+(a===state.actor?1:.78)+'"/><line x1="'+x+'" x2="'+x+'" y1="'+y(interval[0]*100)+'" y2="'+y(interval[1]*100)+'" stroke="#243a54" stroke-width="1.3"/><text x="'+x+'" y="208" text-anchor="middle" fill="white" font-weight="700" font-size="15">'+r.survivors+'/100</text><text x="'+x+'" y="248" text-anchor="middle" fill="#17263c" font-size="13">'+labels[a]+'</text></g>';});svg+='</svg>';$('rough-chart').innerHTML=svg;$('rough-chart').querySelectorAll('[data-rough-actor]').forEach(e=>{const pick=()=>choose('random_rough',e.dataset.roughActor);e.addEventListener('click',pick);e.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();pick();}});});
  $('progress').textContent='All 3 methods measured · 100 trials each · native noise range 0.02–0.10 m';
 }
 $('chart-note').textContent=state.mode==='terrain'?'Conditional episode Wilson 95% intervals across five fixed layouts; one training seed. Random-rough focus chosen after the seven-terrain sweep.':'Points show validated 100-trial measurements; lines join only adjacent closed conditions. Clicking a curve selects the nearest measured endpoint. Pending x values remain selectable. Error bars: conditional episode Wilson 95% intervals; one training seed.';
 $('rough-results').innerHTML=rough.length?'<div class="rough-bars">'+actors.map(actor=>{const r=rough.find(v=>v.actor===actor);return r?'<button class="rough-bar" data-actor="'+actor+'"><span style="color:'+colors[actor]+'">'+labels[actor]+'</span><b>'+r.survivors+'%</b><small>'+r.survivors+'/100 survived</small></button>':'';}).join('')+'</div>':'<p>Validated random-rough results pending.</p>';
 $('rough-results').querySelectorAll('button').forEach(el=>el.addEventListener('click',()=>choose('random_rough',el.dataset.actor)));
}
function matchingVideos(){return (videoIndex.videos||[]).filter(v=>v.cohort===state.cohort&&v.condition_id===state.condition&&v.actor===state.actor);}
function safeMedia(path){if(typeof path!=='string'||!path)return null;try{const u=new URL(path,location.href);return u.origin===location.origin&&['file:','http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}}
function videoContract(v,c){return v&&v.command?.length===3&&v.command.every((x,i)=>Math.abs(x-c.command[i])<1e-8)&&v.physics&&Object.keys(c.physics).every(k=>Math.abs(v.physics[k]-c.physics[k])<1e-8)&&v.measurement_seconds===c.measurement_seconds&&v.warmup_seconds===c.warmup_seconds&&v.total_horizon_seconds===c.total_horizon_seconds;}
function renderRecording(){
 const c=conditionById(state.condition),m=cell(state.condition,state.actor),r=state.condition==='random_rough'?data.random_rough?.find(r=>r.cohort===state.cohort&&r.actor===state.actor):null;
 $('selection-title').textContent=title(c)+' · '+labels[state.actor];const badge=$('result-badge');badge.className='badge '+(measured(m)||r?'measured':'pending');badge.textContent=measured(m)?m.survivors+'% survived · 100/100 trials':r?r.survivors+'% survived · 100/100 trials':m?.attempts?m.attempts+'/100 trials · final result pending':'Measurement pending · 0/100 trials';
 const candidates=matchingVideos();state.clip=Math.min(state.clip,Math.max(0,candidates.length-1));const selected=candidates[state.clip];const clip=$('clip');clip.disabled=!candidates.length;clip.innerHTML=candidates.length?candidates.map((v,i)=>'<option value="'+i+'">Seed '+escape(v.episode_seed)+' · '+escape(v.backend||'recording')+'</option>').join(''):'<option value="0">No recording available</option>';clip.value=String(state.clip);
 const src=selected?.status==='ready'&&videoContract(selected,c)?safeMedia(selected.path):null;const video=$('video');video.hidden=!src;$('video-empty').hidden=!!src;
 if(src){if(video.dataset.source!==src){video.pause();video.muted=true;video.src=src;video.dataset.source=src;video.load();video.play().catch(()=>{ /* Native controls remain available if autoplay is blocked. */ });}}else{video.pause();video.removeAttribute('src');delete video.dataset.source;}
 $('video-status').textContent=selected?.status==='recording'?'Recording in progress':selected?.status==='failed'?'Recording unavailable':'Recording pending';
 $('video-message').textContent=selected?.status==='ready'&&!src?'Recording metadata does not match this condition.':'A real clip will appear here when it is ready.';
 $('clip-caption').textContent=selected?.illustrative_replay===true?'Illustrative '+(selected.backend||'replay')+'; quantitative results use the recorded evaluation.':selected?.exact_quantitative_trajectory===true?'Recording of the corresponding quantitative episode.':'';
 const facts=[['Friction',number(c.physics.foot_friction)],['Mass ratio',number(c.physics.global_link_density_ratio)+'×'],['Payload',number(c.physics.payload_kg)+' kg'],['Forward speed',number(c.command[0])+' m/s'],['Measurement',number(c.measurement_seconds)+' s'],['Warmup',number(c.warmup_seconds)+' s']];$('facts').innerHTML=facts.map(f=>'<div class="fact"><span>'+f[0]+'</span><strong>'+f[1]+'</strong></div>').join('');
 const details=[['Seed',selected?.episode_seed??'Pending'],['Backend',selected?.backend??'Pending'],['Checkpoint',selected?.checkpoint_sha256??'Pending'],['Cohort',state.cohort==='current'?'Original training':'Friction / mass / payload DR']];$('record-details').innerHTML=details.map(d=>'<dt>'+d[0]+'</dt><dd>'+escape(d[1])+'</dd>').join('');
 $('condition').innerHTML=catalog.conditions.map(c=>'<option value="'+c.condition_id+'">'+title(c)+'</option>').join('')+'<option value="random_rough">Random rough</option>';$('condition').value=state.condition;
}
function render(){document.querySelectorAll('[data-cohort]').forEach(e=>e.classList.toggle('active',e.dataset.cohort===state.cohort));document.querySelectorAll('#methods [data-actor]').forEach(e=>e.classList.toggle('active',e.dataset.actor===state.actor));renderCharts();renderRecording();$('updated').textContent=data.updated_at_utc?'Snapshot '+new Date(data.updated_at_utc).toISOString().replace('T',' ').slice(0,19)+' UTC':'Embedded snapshot';}
document.querySelectorAll('[data-cohort]').forEach(e=>e.addEventListener('click',()=>{state.cohort=e.dataset.cohort;state.clip=0;render();}));document.querySelectorAll('#methods [data-actor]').forEach(e=>e.addEventListener('click',()=>{state.actor=e.dataset.actor;state.clip=0;render();}));$('condition').addEventListener('change',e=>choose(e.target.value));$('clip').addEventListener('change',e=>{state.clip=Number(e.target.value);renderRecording();});
document.querySelectorAll('[data-mode]').forEach(e=>e.addEventListener('click',()=>choose(e.dataset.mode==='terrain'?'random_rough':state.lastPhysics)));
$('video').addEventListener('error',()=>{if(!$('video').dataset.source)return;$('video').hidden=true;$('video-empty').hidden=false;$('video-status').textContent='Recording unavailable';$('video-message').textContent='The selected media file could not be loaded.';});
async function refresh(){if(location.protocol==='file:')return;const params=new URLSearchParams(location.search);for(const [key,fallback] of [['data','data.json'],['videos','videos.json']]){try{const url=new URL(params.get(key)||fallback,location.href);if(url.origin!==location.origin)continue;const response=await fetch(url,{cache:'no-store'});if(!response.ok)continue;const value=await response.json();if(key==='data'&&value.schema==='prism_robustness_viewer_v1'&&value.cohorts)data={...value,random_rough:value.random_rough||boot.data.random_rough};else if(key==='videos'&&value.schema==='prism_robustness_videos_v1'&&Array.isArray(value.videos))videoIndex=value;}catch{ /* Preserve the last actual snapshot while a local updater is busy. */ }}render();}
$('refresh').addEventListener('click',refresh);render();refresh();if(location.protocol!=='file:')setInterval(refresh,20000);
})();

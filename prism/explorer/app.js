(() => {
  'use strict';
  const data = window.PRISM_ROUGH21;
  if (!data || data.schema !== 'prism_rough21_physical_viewer_v1') throw new Error('Missing admitted rough data');
  const $ = id => document.getElementById(id);
  const actors = ['standard','prism'];
  const labels = {standard:'MLP',prism:'PRISM'};
  const colors = {standard:'#0072B2',prism:'#D55E00'};
  const axes = ['nominal','friction','mass','payload'];
  const titles = {nominal:'Nominal',friction:'Friction',mass:'Mass',payload:'Payload'};
  const xLabels = {friction:'Foot–ground friction',mass:'Link mass/inertia ratio',payload:'Torso payload (kg)'};
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = n => Number.isFinite(n) ? String(Number(n.toFixed(3))) : '—';
  const percentage = n => Number(n).toFixed(1);
  const firstReady=data.videos.find(v=>v.actor==='prism' && v.condition_id==='nominal' && v.status==='ready') || data.videos.find(v=>v.actor==='prism' && v.status==='ready');
  let selected = {condition_id:firstReady?.condition_id || 'nominal',actor:'prism'};
  const condition = id => data.conditions.find(c=>c.condition_id===id);
  const metric = (id,actor) => data.metrics.find(r=>r.condition_id===id && r.actor===actor);
  const conditionLabel = c => c.axis==='nominal' ? 'Nominal' : c.axis==='friction' ? 'Friction μ = '+num(c.x) : c.axis==='mass' ? 'Mass / inertia × '+num(c.x) : 'Payload '+num(c.x)+' kg';
  function grid(y,left,right) {
    return [0,25,50,75,100].map(v=>'<line x1="'+left+'" x2="'+right+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#e3e8ee"/><text x="'+(left-8)+'" y="'+(y(v)+4)+'" text-anchor="end" fill="#66788c" font-size="11">'+v+'</text>').join('');
  }
  function point(id,actor,x,y,survival) {
    const chosen=selected.condition_id===id && selected.actor===actor;
    return '<g class="point" data-condition="'+id+'" data-actor="'+actor+'" role="button" tabindex="0" aria-label="'+esc(labels[actor]+' '+conditionLabel(condition(id))+' '+percentage(survival)+' percent survival')+'"><title>'+esc(labels[actor]+' · '+conditionLabel(condition(id))+' · '+percentage(survival)+'%')+'</title><circle cx="'+x+'" cy="'+y+'" r="13" fill="transparent"/>'+(chosen?'<circle cx="'+x+'" cy="'+y+'" r="8" fill="white" stroke="#17283b" stroke-width="2"/>':'')+'<circle cx="'+x+'" cy="'+y+'" r="4.5" fill="'+colors[actor]+'"/></g>';
  }
  function nominal() {
    const y=v=>214-v*1.7;
    let s='<svg viewBox="0 0 350 280" role="img" aria-label="Nominal rough terrain survival">'+grid(y,40,330);
    actors.forEach((a,i)=>{const r=metric('nominal',a),x=115+i*130,percent=r.survival_rate*100;
      s+='<g class="bar" data-condition="nominal" data-actor="'+a+'" role="button" tabindex="0" aria-label="'+esc(labels[a]+' nominal '+percentage(percent)+' percent survival')+'"><rect x="'+(x-29)+'" y="'+y(percent)+'" width="58" height="'+(214-y(percent))+'" fill="'+colors[a]+'"/>'+[r.survival_wilson_low,r.survival_wilson_high].map(v=>'<line x1="'+(x-6)+'" x2="'+(x+6)+'" y1="'+y(v*100)+'" y2="'+y(v*100)+'" stroke="#22354b"/>').join('')+'<line x1="'+x+'" x2="'+x+'" y1="'+y(r.survival_wilson_low*100)+'" y2="'+y(r.survival_wilson_high*100)+'" stroke="#22354b"/><text x="'+x+'" y="'+(y(percent)+25)+'" text-anchor="middle" fill="white" font-size="15">'+percentage(percent)+'%</text><text x="'+x+'" y="242" text-anchor="middle" fill="#253b51" font-size="13">'+labels[a]+'</text></g>';
    });return s+'</svg>';
  }
  function curve(axis) {
    const cs=data.conditions.filter(c=>c.axis===axis),values=cs.map(c=>c.x),lo=Math.min(...values),hi=Math.max(...values),pad=(hi-lo)*.045;
    const x=v=>43+(v-lo+pad)/(hi-lo+2*pad)*283,y=v=>214-v*1.7;
    const support=data.training_ranges[axis];
    let s='<svg viewBox="0 0 350 290" role="img" aria-label="'+esc(titles[axis]+' survival on rough terrain')+'"><rect x="'+x(Math.max(lo-pad,support[0]))+'" y="44" width="'+(x(Math.min(hi+pad,support[1]))-x(Math.max(lo-pad,support[0])))+'" height="170" fill="#eaedf0"/>'+grid(y,43,326);
    s+='<line x1="'+x(data.nominal_references[axis])+'" x2="'+x(data.nominal_references[axis])+'" y1="44" y2="214" stroke="#6a737c" stroke-dasharray="5 4"/>';
    actors.forEach(a=>{const rs=cs.map(c=>metric(c.condition_id,a)),upper=rs.map(r=>x(r.x)+','+y(r.survival_wilson_high*100)),lower=[...rs].reverse().map(r=>x(r.x)+','+y(r.survival_wilson_low*100));s+='<polygon points="'+[...upper,...lower].join(' ')+'" fill="'+colors[a]+'" fill-opacity=".13"/><polyline points="'+rs.map(r=>x(r.x)+','+y(r.survival_rate*100)).join(' ')+'" fill="none" stroke="'+colors[a]+'" stroke-width="2.7"/>';rs.forEach(r=>{s+=point(r.condition_id,a,x(r.x),y(r.survival_rate*100),r.survival_rate*100);});});
    cs.forEach(c=>{s+='<line x1="'+x(c.x)+'" x2="'+x(c.x)+'" y1="214" y2="220" stroke="#627486"/><text transform="translate('+x(c.x)+',233) rotate('+ (axis==='friction'?-48:0)+')" text-anchor="'+(axis==='friction'?'end':'middle')+'" fill="#627486" font-size="11">'+num(c.x)+'</text>';});
    return s+'<text x="185" y="282" text-anchor="middle" fill="#52677e" font-size="12">'+xLabels[axis]+'</text></svg>';
  }
  function validClip(clip,c) {
    if (!clip || clip.status!=='ready' || clip.actor!==selected.actor || clip.condition_id!==c.condition_id) return false;
    const p=clip.requested_physics||clip.physics;
    return clip.episode_seed===401000 && clip.geometry_seed===401 && clip.illustrative_replay===true && clip.exact_quantitative_trajectory===false && clip.trained_normalizer_unchanged===true && clip.runtime_physics_verified===true && clip.checkpoint_sha256===data.checkpoints[selected.actor] && clip.checkpoint_map_sha256===data.checkpoint_map_sha256 && clip.geometry_proof_sha256===data.geometry_proof_sha256 && clip.evaluator_sha256===data.evaluator_sha256 && clip.protocol_file_sha256===data.protocol_file_sha256 && JSON.stringify(clip.grid_shape)==='[21,21]' && p && p.foot_friction===c.physics.foot_friction && p.global_link_density_ratio===c.physics.global_link_density_ratio && p.payload_kg===c.physics.payload_kg && JSON.stringify(clip.command)===JSON.stringify(c.command) && clip.warmup_seconds===0 && clip.measurement_seconds===20 && clip.total_horizon_seconds===20 && /^[0-9a-f]{64}$/.test(clip.video_sha256||'') && clip.path==='videos/rough21-'+c.condition_id+'-'+selected.actor+'-seed401000.mp4';
  }
  function render() {
    $('charts').innerHTML=axes.map(a=>'<article class="chart-card"><h3>'+titles[a]+'</h3>'+(a==='nominal'?nominal():curve(a))+'</article>').join('');
    $('charts').querySelectorAll('[data-condition]').forEach(el=>{const choose=()=>pick(el.dataset.condition,el.dataset.actor);el.addEventListener('click',choose);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});});
    const c=condition(selected.condition_id),r=metric(selected.condition_id,selected.actor),clip=data.videos.find(v=>v.condition_id===c.condition_id && v.actor===selected.actor);
    $('condition').value=c.condition_id;document.querySelectorAll('#methods button').forEach(b=>{
      b.setAttribute('aria-pressed',String(b.dataset.actor===selected.actor));
      const available=data.videos.some(v=>v.condition_id===c.condition_id && v.actor===b.dataset.actor && v.status==='ready');
      b.textContent=labels[b.dataset.actor]+(available?'':' · pending');
      b.setAttribute('aria-label',labels[b.dataset.actor]+' '+(available?'recording ready':'recording pending; measured values available'));
    });
    const count=data.videos.filter(v=>v.status==='ready').length;
    $('recording-progress').textContent=count+' / '+data.videos.length+' recordings ready'+(count<data.videos.length?' · more conditions are being recorded.':'.');
    $('selection').textContent=labels[selected.actor]+' · '+conditionLabel(c);
    $('measurement').textContent=percentage(r.survival_rate*100)+'% survived · '+r.survivors+' / '+r.attempts+' attempts';
    $('interval').textContent='Wilson 95% interval: '+percentage(r.survival_wilson_low*100)+'–'+percentage(r.survival_wilson_high*100)+'%';
    const video=$('video');const ok=validClip(clip,c);const url=ok?new URL(clip.path,location.href):null;const usable=url && url.origin===location.origin;
    video.hidden=!usable;$('unavailable').hidden=!!usable;
    if(usable){if(video.dataset.source!==url.href){video.pause();video.muted=true;video.src=url.href;video.dataset.source=url.href;video.load();video.play().catch(()=>{});} $('replay-outcome').textContent=clip.survived_horizon?'Recorded rollout completed 20 s':'Recorded rollout ended at '+num(clip.physical_duration_seconds)+' s';}
    else{video.pause();video.removeAttribute('src');delete video.dataset.source;video.load();$('unavailable').textContent=clip?.status==='recording'?'Recording this condition.':'Preparing the recording for this condition.';$('replay-outcome').textContent='This condition’s recording is not ready yet.';}
    $('continuous').innerHTML=[['Linear RMSE',num(r.linear_rmse_m_s)+' m/s'],['Yaw RMSE',num(r.yaw_rmse_rad_s)+' rad/s'],['Forward distance',num(r.forward_distance_m)+' m'],['Compound successes',r.compound_successes+' / '+r.attempts]].map(([k,v])=>'<div><span>'+esc(k)+'</span><strong>'+esc(v)+'</strong></div>').join('');
    $('record-details').innerHTML=[['Episode seed','401000'],['Terrain','Random rough · 21 × 21 grid'],['Command','0.5 m/s forward'],['Friction / mass / payload',num(c.physics.foot_friction)+' / '+num(c.physics.global_link_density_ratio)+'× / '+num(c.physics.payload_kg)+' kg'],['Backend',clip?.backend||'Pending'],['Checkpoint',data.checkpoints[selected.actor]],['Video SHA-256',usable?clip.video_sha256:'Pending']].map(([k,v])=>'<dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd>').join('');
  }
  function pick(id,actor){if(!condition(id)||!actors.includes(actor))return;selected={condition_id:id,actor};render();}
  $('condition').innerHTML=data.conditions.map(c=>'<option value="'+c.condition_id+'">'+esc(conditionLabel(c))+'</option>').join('');
  $('condition').addEventListener('change',e=>pick(e.target.value,selected.actor));
  document.querySelectorAll('#methods button').forEach(b=>b.addEventListener('click',()=>pick(selected.condition_id,b.dataset.actor)));
  $('video').addEventListener('error',()=>{if(!$('video').dataset.source)return;$('video').hidden=true;$('unavailable').hidden=false;$('unavailable').textContent='The recording could not be loaded. Please retry.';});
  window.PRISM_ROUGH21_SELECT=pick;
  render();
})();

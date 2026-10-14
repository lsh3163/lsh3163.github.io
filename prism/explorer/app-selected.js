(() => {
  'use strict';
  const data = window.PRISM_ROUGH21;
  if (!data || data.schema !== 'prism_rough21_physical_viewer_v1') throw new Error('Missing admitted rough data');
  const $ = id => document.getElementById(id);
  const actors = ['standard','prism'];
  const labels = {standard:'MLP',prism:'PRISM'};
  const colors = {standard:'#858B94',prism:'#4285F4'};
  const segmentCatalog = window.PRISM_VIDEO_SEGMENTS;
  const axes = ['nominal','friction','mass','payload'];
  const titles = {nominal:'Nominal',friction:'Friction',mass:'Mass',payload:'Payload'};
  const xLabels = {friction:'Foot–ground friction μ',mass:'Link mass / inertia (×)',payload:'Payload (kg)'};
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = n => Number.isFinite(n) ? String(Number(n.toFixed(3))) : '—';
  const percentage = n => Number(n).toFixed(1);
  const params=new URLSearchParams(location.search);
  const requestedCondition=data.conditions.find(c=>c.condition_id===params.get('condition'));
  let selected={condition_id:requestedCondition?.condition_id || 'friction_0p2',actor:actors.includes(params.get('actor'))?params.get('actor'):'prism'};
  let selectedAxis=data.conditions.find(c=>c.condition_id===selected.condition_id).axis;
  let playbackKey = null, playbackRequest = 0, playbackController = null, playbackBlob = null;
  const condition = id => data.conditions.find(c=>c.condition_id===id);
  const metric = (id,actor) => data.metrics.find(r=>r.condition_id===id && r.actor===actor);
  const conditionLabel = c => c.axis==='nominal' ? 'Nominal' : c.axis==='friction' ? 'Friction μ = '+num(c.x) : c.axis==='mass' ? 'Mass / inertia × '+num(c.x) : 'Payload '+num(c.x)+' kg';
  function grid(y,left,right) {
    return [0,20,40,60,80,100].map(v=>'<line x1="'+left+'" x2="'+right+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#e3e8ee"/><text x="'+(left-8)+'" y="'+(y(v)+4)+'" text-anchor="end" fill="#66788c" font-size="11">'+v+'</text>').join('');
  }
  function point(id,actor,x,y,survival) {
    const chosen=selected.condition_id===id && selected.actor===actor;
    return '<g class="point" data-condition="'+id+'" data-actor="'+actor+'" data-plot-x="'+x+'" data-plot-y="'+y+'" role="button" tabindex="0" aria-label="'+esc(labels[actor]+' '+conditionLabel(condition(id))+' '+percentage(survival)+' percent survival')+'"><title>'+esc(labels[actor]+' · '+conditionLabel(condition(id))+' · '+percentage(survival)+'%')+'</title><circle cx="'+x+'" cy="'+y+'" r="13" fill="transparent"/>'+(chosen?'<circle cx="'+x+'" cy="'+y+'" r="8" fill="white" stroke="#17283b" stroke-width="2"/>':'')+'<circle cx="'+x+'" cy="'+y+'" r="4.5" fill="'+colors[actor]+'"/></g>';
  }
  function nominal() {
    const y=v=>214-v*1.7;
    let s='<svg viewBox="0 0 350 280" role="img" aria-label="Nominal rough terrain survival">'+grid(y,40,330);
    actors.forEach((a,i)=>{const r=metric('nominal',a),x=115+i*130,percent=r.survival_rate*100;
      s+='<g class="bar" data-condition="nominal" data-actor="'+a+'" role="button" tabindex="0" aria-label="'+esc(labels[a]+' nominal '+percentage(percent)+' percent survival')+'"><rect x="'+(x-29)+'" y="'+y(percent)+'" width="58" height="'+(214-y(percent))+'" fill="'+colors[a]+'"/>'+[r.survival_wilson_low,r.survival_wilson_high].map(v=>'<line x1="'+(x-6)+'" x2="'+(x+6)+'" y1="'+y(v*100)+'" y2="'+y(v*100)+'" stroke="#22354b"/>').join('')+'<line x1="'+x+'" x2="'+x+'" y1="'+y(r.survival_wilson_low*100)+'" y2="'+y(r.survival_wilson_high*100)+'" stroke="#22354b"/><text x="'+x+'" y="'+(y(percent)+25)+'" text-anchor="middle" fill="white" font-size="15">'+percentage(percent)+'%</text><text x="'+x+'" y="242" text-anchor="middle" fill="#253b51" font-size="13">'+labels[a]+'</text></g>';
    });return s+'<rect x="40" y="44" width="290" height="170" fill="none" stroke="#8592a1"/></svg>';
  }
  function curve(axis) {
    const cs=data.conditions.filter(c=>c.axis===axis),values=cs.map(c=>c.x),lo=axis==='friction'?0:Math.min(...values),hi=Math.max(...values),pad=(hi-lo)*.045;
    const x=v=>43+(v-lo+pad)/(hi-lo+2*pad)*283,y=v=>214-v*1.7;
    const support=data.training_ranges[axis];
    let s='<svg viewBox="0 0 350 290" role="img" aria-label="'+esc(titles[axis]+' survival on rough terrain')+'"><rect x="'+x(Math.max(lo-pad,support[0]))+'" y="44" width="'+(x(Math.min(hi+pad,support[1]))-x(Math.max(lo-pad,support[0])))+'" height="170" fill="#eaedf0"/>'+grid(y,43,326);
    s+='<line x1="'+x(data.nominal_references[axis])+'" x2="'+x(data.nominal_references[axis])+'" y1="44" y2="214" stroke="#6a737c" stroke-dasharray="5 4"/>';
    actors.forEach(a=>{const rs=cs.map(c=>metric(c.condition_id,a)),upper=rs.map(r=>x(r.x)+','+y(r.survival_wilson_high*100)),lower=[...rs].reverse().map(r=>x(r.x)+','+y(r.survival_wilson_low*100));s+='<polygon points="'+[...upper,...lower].join(' ')+'" fill="'+colors[a]+'" fill-opacity=".13"/><polyline points="'+rs.map(r=>x(r.x)+','+y(r.survival_rate*100)).join(' ')+'" fill="none" stroke="'+colors[a]+'" stroke-width="2.7"/>';rs.forEach(r=>{s+=point(r.condition_id,a,x(r.x),y(r.survival_rate*100),r.survival_rate*100);});});
    const ticks=axis==='friction'?[0,.3,.6,.9,1.2,1.5]:values;
    ticks.forEach(v=>{s+='<line x1="'+x(v)+'" x2="'+x(v)+'" y1="214" y2="220" stroke="#627486"/><text x="'+x(v)+'" y="236" text-anchor="middle" fill="#627486" font-size="11">'+v.toFixed(1)+'</text>';});
    return s+'<rect x="43" y="44" width="283" height="170" fill="none" stroke="#8592a1"/><text x="185" y="270" text-anchor="middle" fill="#52677e" font-size="12">'+xLabels[axis]+'</text></svg>';
  }
  function selectedClip(clip) {
    const catalog=window.PRISM_SELECTED_ROUGH_PAIRS;
    if(!clip || catalog?.schema!=='prism_selected_rough_pairs_v1' || catalog.dataset!==data.dataset)return false;
    const pair=catalog.pairs?.find(p=>p.condition_id===clip.condition_id && p.videos?.includes(clip));
    return Boolean(pair && /^[0-9a-f]{64}$/.test(pair.initial_state_sha256||'')
      && pair.videos.length===2 && actors.every(a=>pair.videos.some(v=>v.actor===a))
      && pair.videos.every(v=>v.episode_seed===pair.episode_seed && v.geometry_seed===pair.geometry_seed
        && v.initial_state_sha256===pair.initial_state_sha256 && v.condition_id===pair.condition_id
        && /^[0-9a-f]{64}$/.test(v.video_sha256||'') && v.path.startsWith('videos/selected-')));
  }
  function validClip(clip,c,actor=selected.actor) {
    if (!clip || clip.status!=='ready' || clip.actor!==actor || clip.condition_id!==c.condition_id) return false;
    const p=clip.requested_physics||clip.physics;
    return data.dataset==='admitted_rough1000_physical_v1' && clip.compatible_with_dataset===data.dataset && (selectedClip(clip) || (clip.episode_seed===401000 && clip.geometry_seed===401)) && clip.illustrative_replay===true && clip.exact_quantitative_trajectory===false && JSON.stringify(clip.grid_shape)==='[21,21]' && p && p.foot_friction===c.physics.foot_friction && p.global_link_density_ratio===c.physics.global_link_density_ratio && p.payload_kg===c.physics.payload_kg && JSON.stringify(clip.command)===JSON.stringify(c.command) && clip.warmup_seconds===0 && clip.measurement_seconds===20 && clip.total_horizon_seconds===20 && /^[0-9a-f]{64}$/.test(clip.video_sha256||'') && (selectedClip(clip) || clip.path==='videos/rough21-'+c.condition_id+'-'+actor+'-seed401000.mp4');
  }
  const isAvailable = clip => clip?.status==='ready' && clip.delivery_status!=='pending';
  function requireMedia(value,message) { if(!value) throw new Error(message); }
  async function digest(bytes) {
    requireMedia(window.crypto?.subtle,'Recording integrity requires a secure connection.');
    return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  function localURL(path) {
    const url=new URL(path,location.href);
    requireMedia(url.origin===location.origin,'Recording must use this website.');
    return url;
  }
  async function fetchBytes(path,signal,maxBytes) {
    const response=await fetch(localURL(path),{signal,redirect:'error',cache:'force-cache'});
    requireMedia(response.ok,'Recording is still being added. Please retry shortly.');
    const bytes=new Uint8Array(await response.arrayBuffer());
    requireMedia(bytes.byteLength>0 && bytes.byteLength<=maxBytes,'Invalid recording data.');
    return bytes;
  }
  async function assemble(clip,descriptor,signal) {
    const stem=clip.path.slice('videos/'.length,-4),base='videos/chunks/'+stem+'/';
    requireMedia(segmentCatalog?.schema==='prism_exact_byte_video_segment_catalog_v1'
      && descriptor.actor===clip.actor && descriptor.condition_id===clip.condition_id
      && descriptor.source_path===clip.path && descriptor.source_sha256===clip.video_sha256
      && descriptor.source_size===clip.video_bytes && Number.isSafeInteger(descriptor.source_size)
      && descriptor.source_size>0 && descriptor.source_size<=25*1024*1024
      && descriptor.map_path===base+'segments.json' && /^[0-9a-f]{64}$/.test(descriptor.map_sha256),
      'Recording source identity differs.');
    const mapBytes=await fetchBytes(descriptor.map_path,signal,256*1024);
    requireMedia(await digest(mapBytes)===descriptor.map_sha256,'Recording index integrity check failed.');
    const map=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(mapBytes));
    requireMedia(map.actor===clip.actor && map.condition_id===clip.condition_id && map.source_path===clip.path
      && map.source_sha256===clip.video_sha256 && map.source_size===clip.video_bytes
      && Array.isArray(map.segments) && map.segments.length===descriptor.segment_count
      && map.segments.length===Math.ceil(map.source_size/24576),'Recording segment index differs.');
    const output=new Uint8Array(map.source_size);let next=0;
    await Promise.all(Array.from({length:Math.min(6,map.segments.length)},async()=>{
      while(next<map.segments.length) {
        const index=next++,segment=map.segments[index],offset=index*24576;
        requireMedia(segment.path===base+String(index).padStart(3,'0')+'.part'
          && segment.size===Math.min(24576,map.source_size-offset) && /^[0-9a-f]{64}$/.test(segment.sha256),
          'Recording segment path or size differs.');
        const bytes=await fetchBytes(segment.path,signal,24576);
        requireMedia(bytes.byteLength===segment.size && await digest(bytes)===segment.sha256,'Recording segment integrity check failed.');
        output.set(bytes,offset);
      }
    }));
    requireMedia(await digest(output)===clip.video_sha256,'Complete recording integrity check failed.');
    return new Blob([output],{type:'video/mp4'});
  }
  function clearPlayback() {
    playbackRequest++;
    playbackController?.abort();playbackController=null;playbackKey=null;
    const video=$('video');video.pause();video.removeAttribute('src');video.load();
    delete video.dataset.source;delete video.dataset.recordingPath;delete video.dataset.videoSha256;delete video.dataset.delivery;
    if(playbackBlob)URL.revokeObjectURL(playbackBlob);playbackBlob=null;
  }
  async function playRecording(clip) {
    const key=clip.path+'|'+clip.video_sha256;
    if(playbackKey===key)return;
    clearPlayback();playbackKey=key;
    const request=playbackRequest,controller=new AbortController();playbackController=controller;
    const video=$('video');video.hidden=true;$('unavailable').hidden=false;$('unavailable').textContent='Loading this recording…';
    try {
      const descriptor=segmentCatalog?.videos?.find(v=>v.actor===clip.actor && v.condition_id===clip.condition_id && v.source_path===clip.path);
      let source;
      if(descriptor) {
        const blob=await assemble(clip,descriptor,controller.signal);
        if(request!==playbackRequest || playbackKey!==key || controller.signal.aborted)return;
        playbackBlob=URL.createObjectURL(blob);source=playbackBlob;
      } else if (selectedClip(clip)) {
        const bytes=await fetchBytes(clip.path,controller.signal,25*1024*1024);
        requireMedia(bytes.byteLength===clip.video_bytes && await digest(bytes)===clip.video_sha256,'Selected recording integrity check failed.');
        if(request!==playbackRequest || controller.signal.aborted)return;
        playbackBlob=URL.createObjectURL(new Blob([bytes],{type:'video/mp4'}));source=playbackBlob;
      } else source=localURL(clip.path).href;
      if(request!==playbackRequest || playbackKey!==key || controller.signal.aborted)return;
      video.muted=true;video.dataset.source=key;video.dataset.recordingPath=clip.path;
      video.dataset.videoSha256=clip.video_sha256;video.dataset.delivery=descriptor?'verified-segments':'direct';
      video.src=source;video.hidden=false;$('unavailable').hidden=true;video.load();video.play().catch(()=>{});
    } catch(error) {
      if(request!==playbackRequest || controller.signal.aborted || error.name==='AbortError')return;
      playbackKey=null;video.hidden=true;$('unavailable').hidden=false;
      $('unavailable').textContent=error.message||'The recording could not be loaded. Please retry.';
    }
  }
  function render() {
    $('axis-tabs').innerHTML=axes.map(a=>'<button type="button" id="tab-'+a+'" role="tab" data-axis="'+a+'" aria-controls="panel-'+a+'" aria-selected="'+(selectedAxis===a)+'" tabindex="'+(selectedAxis===a?'0':'-1')+'">'+titles[a]+'</button>').join('');
    $('axis-tabs').querySelectorAll('[data-axis]').forEach(b=>{b.addEventListener('click',()=>chooseAxis(b.dataset.axis));b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=axes.indexOf(b.dataset.axis),next=e.key==='Home'?axes[0]:e.key==='End'?axes.at(-1):axes[(i+(e.key==='ArrowRight'?1:-1)+axes.length)%axes.length];chooseAxis(next);$('tab-'+next).focus();});});
    $('charts').innerHTML=axes.map(a=>'<article class="chart-card" role="tabpanel" id="panel-'+a+'" aria-labelledby="tab-'+a+'"'+(selectedAxis===a?'':' hidden')+'>'+(a==='nominal'?nominal():curve(a))+'</article>').join('');
    $('charts').querySelectorAll('[data-condition]').forEach(el=>{const choose=()=>pick(el.dataset.condition,el.dataset.actor);if(el.classList.contains('bar'))el.addEventListener('click',choose);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});});
    $('charts').querySelectorAll('svg').forEach(svg=>{if(!svg.querySelector('.point'))return;svg.addEventListener('click',e=>{const matrix=svg.getScreenCTM();if(!matrix)return;const position=svg.createSVGPoint();position.x=e.clientX;position.y=e.clientY;const at=position.matrixTransform(matrix.inverse());let nearest=null,distance=18*18;svg.querySelectorAll('.point').forEach(point=>{const d=(at.x-Number(point.dataset.plotX))**2+(at.y-Number(point.dataset.plotY))**2;if(d<distance){nearest=point;distance=d;}});if(nearest)pick(nearest.dataset.condition,nearest.dataset.actor);});});
    const c=condition(selected.condition_id),r=metric(selected.condition_id,selected.actor),clip=data.videos.find(v=>v.condition_id===c.condition_id && v.actor===selected.actor);
    $('condition').value=c.condition_id;document.querySelectorAll('#methods button').forEach(b=>{
      b.setAttribute('aria-pressed',String(b.dataset.actor===selected.actor));
      const available=data.videos.some(v=>v.condition_id===c.condition_id && v.actor===b.dataset.actor && isAvailable(v));
      b.textContent=labels[b.dataset.actor]+(available?'':' · pending');
      b.setAttribute('aria-label',labels[b.dataset.actor]+' '+(available?'recording ready':'recording pending; measured values available'));
    });
    const count=data.videos.filter(isAvailable).length;
    $('recording-progress').textContent=count+' / '+data.videos.length+' recordings available'+(count<data.videos.length?' · the remaining recordings are being added.':'.');
    $('selection').textContent=labels[selected.actor]+' · '+conditionLabel(c);
    document.querySelectorAll('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===c.condition_id)));
    $('aggregate-pair').innerHTML=['prism','standard'].map(a=>{const value=metric(c.condition_id,a);return '<div class="aggregate-card" data-actor="'+a+'"><span class="metric-label">'+labels[a]+' · across '+value.attempts.toLocaleString('en-US')+' trials</span><strong>'+percentage(value.survival_rate*100)+'%</strong><p class="small">'+value.survivors+' / '+value.attempts.toLocaleString('en-US')+' survived · 95% CI '+percentage(value.survival_wilson_low*100)+'–'+percentage(value.survival_wilson_high*100)+'%</p></div>';}).join('');
    const video=$('video'),usable=validClip(clip,c)&&isAvailable(clip);
    const currentOutcome=recordedOutcome(usable?clip:null);
    $('replay-outcome').dataset.outcome=currentOutcome.kind;
    if(usable){playRecording(clip);$('replay-outcome').textContent=currentOutcome.text;}
    else{clearPlayback();video.hidden=true;$('unavailable').hidden=false;$('unavailable').textContent='This recording is being added.';$('replay-outcome').textContent='The measured result is available; the recording is being added.';}
    const pair=['prism','standard'].map(a=>{const other=data.videos.find(v=>v.condition_id===c.condition_id&&v.actor===a);return{actor:a,outcome:recordedOutcome(validClip(other,c,a)?other:null)};});
    $('paired-outcomes').innerHTML=pair.map(v=>'<div class="paired-item" data-actor="'+v.actor+'" data-outcome="'+v.outcome.kind+'"><strong>'+labels[v.actor]+'</strong><span>'+esc(v.outcome.text)+'</span></div>').join('');
    $('pair-note').textContent=selectedClip(clip)?'Selected paired example: both methods share the initial state. The curves summarize all 1,000 evaluation attempts.':pair.every(v=>v.outcome.kind==='survived')?'Both recordings survived this 20 s reset. The curves summarize the separate 1,000-trial evaluation.':pair.every(v=>v.outcome.kind==='fall')?'Both policies fell in this recorded pair. Their aggregate survival rates are shown separately.':'Both recordings use the same initial state; individual outcomes are shown above.';
    $('record-details').innerHTML=[['Initial state',selectedClip(clip)?'Shared selected reset for both models':'The same fixed reset for both models'],['Terrain','Random rough'],['Command','0.5 m/s forward'],['Friction / mass / payload',num(c.physics.foot_friction)+' / '+num(c.physics.global_link_density_ratio)+'× / '+num(c.physics.payload_kg)+' kg'],['Replay backend','CPU']].map(([k,v])=>'<dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd>').join('');
    postHeight();
  }
  function recordedOutcome(clip){
    if(!isAvailable(clip))return{kind:'pending',text:'Recording pending'};
    if(clip.survived_horizon)return{kind:'survived',text:'Survived 20 s'};
    const time=Number(clip.physical_duration_seconds).toFixed(2)+' s';
    if(clip.termination_reasons?.some(reason=>reason.startsWith('fell_over')))return{kind:'fall',text:'Fell at '+time};
    if(clip.termination_reasons?.includes('support_exit'))return{kind:'support_exit',text:'Left terrain support at '+time};
    return{kind:'ended',text:'Ended at '+time};
  }
  function chooseAxis(axis){const preferred=axis==='nominal'?'nominal':axis==='friction'?'friction_0p2':axis==='mass'?'mass_1':'payload_0';pick(condition(selected.condition_id).axis===axis?selected.condition_id:preferred,selected.actor);}
  function pick(id,actor){if(!condition(id)||!actors.includes(actor))return;selected={condition_id:id,actor};selectedAxis=condition(id).axis;const url=new URL(location.href);url.searchParams.set('condition',id);url.searchParams.set('actor',actor);history.replaceState(null,'',url);render();}
  function postHeight(){if(window.parent!==window)requestAnimationFrame(()=>window.parent.postMessage({type:'prism-explorer-height',height:Math.ceil(document.querySelector('main.shell').getBoundingClientRect().height)},location.origin));}
  $('condition').innerHTML=data.conditions.map(c=>'<option value="'+c.condition_id+'">'+esc(conditionLabel(c))+'</option>').join('');
  $('condition').addEventListener('change',e=>pick(e.target.value,selected.actor));
  document.querySelectorAll('#methods button').forEach(b=>b.addEventListener('click',()=>pick(selected.condition_id,b.dataset.actor)));
  document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>pick(b.dataset.case,b.dataset.exampleActor||selected.actor)));
  $('video').addEventListener('error',()=>{if(!$('video').dataset.source||!$('video').error)return;$('video').hidden=true;$('unavailable').hidden=false;$('unavailable').textContent='The recording could not be loaded. Please retry.';playbackKey=null;});
  window.addEventListener('pagehide',clearPlayback);
  new ResizeObserver(postHeight).observe(document.body);
  window.PRISM_ROUGH21_SELECT=pick;
  render();
})();

(() => {
  'use strict';
  const source = window.PRISM_ROUGH;
  const labels = {standard:'MLP', matched:'Matched', prism:'PRISM'};
  const colors = {standard:'#0072B2', matched:'#56B4E9', prism:'#D55E00'};
  const actors = ['standard','matched','prism'];
  const trainingKey = source.selected_training_identity;
  const cohortLabel = () => 'Random rough terrain';
  const $ = id => document.getElementById(id);
  const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = n => Number.isFinite(n) ? String(Number(n.toFixed(3))) : '—';
  let selected = {cohort:trainingKey, actor:'prism'};

  function graph(cohort) {
    const y = percent => 222 - percent * 1.82;
    let svg = '<svg viewBox="0 0 440 280" aria-label="'+escape(cohortLabel(cohort))+' 20-second survival" role="img">';
    [0,25,50,75,100].forEach(v => {
      svg += '<line x1="40" x2="425" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#e2e8f0"/><text x="32" y="'+(y(v)+4)+'" text-anchor="end" fill="#8090a5" font-size="11">'+v+'</text>';
    });
    actors.forEach((actor, i) => {
      const row = source.metrics.find(r=>r.cohort===cohort && r.actor===actor);
      const x = 110 + i * 128;
      const chosen = selected.cohort===cohort && selected.actor===actor;
      svg += '<g class="bar" data-cohort="'+cohort+'" data-actor="'+actor+'" role="button" tabindex="0" aria-label="'+escape(cohortLabel(cohort)+' '+labels[actor]+' '+row.survivors+' of 100 survived')+'">';
      svg += '<rect x="'+(x-37)+'" y="'+y(row.survival_rate*100)+'" width="74" height="'+(222-y(row.survival_rate*100))+'" rx="4" fill="'+colors[actor]+'" stroke="'+(chosen?'#182d46':'none')+'" stroke-width="2.5"/>';
      svg += '<line x1="'+x+'" x2="'+x+'" y1="'+y(row.wilson_low*100)+'" y2="'+y(row.wilson_high*100)+'" stroke="#263c55" stroke-width="1.2"/>';
      [row.wilson_low,row.wilson_high].forEach(p=>{ svg+='<line x1="'+(x-6)+'" x2="'+(x+6)+'" y1="'+y(p*100)+'" y2="'+y(p*100)+'" stroke="#263c55" stroke-width="1.2"/>'; });
      svg += '<text x="'+x+'" y="208" text-anchor="middle" fill="white" font-size="16" font-weight="700">'+row.survivors+'/100</text>';
      svg += '<text x="'+x+'" y="247" text-anchor="middle" fill="#263c55" font-size="14">'+labels[actor]+'</text></g>';
    });
    return svg + '</svg>';
  }

  function choose(cohort, actor) {
    selected = {cohort,actor};
    render();
  }

  function render() {
    $('charts').innerHTML = [trainingKey].map(c=>'<article class="chart-card"><h2>'+cohortLabel(c)+'</h2><p>100 paired attempts per method</p>'+graph(c)+'</article>').join('');
    $('charts').querySelectorAll('[data-actor]').forEach(el=>{
      const pick = () => choose(el.dataset.cohort,el.dataset.actor);
      el.addEventListener('click',pick);
      el.addEventListener('keydown',event=>{ if(event.key==='Enter'||event.key===' '){event.preventDefault();pick();} });
    });
    document.querySelectorAll('#cohorts button').forEach(b=>b.classList.toggle('active',b.dataset.cohort===selected.cohort));
    document.querySelectorAll('#methods button').forEach(b=>b.classList.toggle('active',b.dataset.actor===selected.actor));
    const row = source.metrics.find(r=>r.cohort===selected.cohort && r.actor===selected.actor);
    const clip = source.videos.videos.find(v=>v.cohort===selected.cohort && v.actor===selected.actor && v.condition_id==='random_rough');
    $('selection').textContent = labels[selected.actor] + ' · ' + cohortLabel(selected.cohort);
    $('measurement').textContent = row.survivors + '% survived · 100 attempts';
    $('interval').textContent = 'Conditional Wilson 95% interval: '+number(100*row.wilson_low)+'–'+number(100*row.wilson_high)+'%';
    const video = $('video');
    const valid = clip?.status==='ready' && clip.episode_seed===401000 && clip.illustrative_replay===true && clip.exact_quantitative_trajectory===false && clip.physics.foot_friction===.6 && clip.physics.global_link_density_ratio===1 && clip.physics.payload_kg===0 && clip.command.join(',')==='0.5,0,0' && clip.total_horizon_seconds===20 && clip.warmup_seconds===0;
    const url = valid ? new URL(clip.path,location.href) : null;
    const usable = url && url.origin===location.origin && /\/videos\/[A-Za-z0-9_-]+\.mp4$/.test(url.pathname);
    video.hidden = !usable;
    $('unavailable').hidden = !!usable;
    if(usable) {
      if(video.dataset.source!==url.href) {
        video.pause();video.muted=true;video.src=url.href;video.dataset.source=url.href;video.load();video.play().catch(()=>{});
      }
      $('replay-outcome').textContent = clip.survived_horizon ? 'Replay completed the 20 s horizon' : (clip.termination_reasons?.some(r=>r.startsWith('fell_over')) ? 'Replay: fall at ' : 'Replay ended at ')+number(clip.physical_duration_seconds)+' s';
    } else {
      video.pause();video.removeAttribute('src');delete video.dataset.source;$('replay-outcome').textContent='Recording unavailable';
    }
    $('continuous').innerHTML = [['Linear RMSE',number(row.linear_rmse_m_s)+' m/s'],['Yaw RMSE',number(row.yaw_rmse_rad_s)+' rad/s'],['Forward distance',number(row.forward_distance_m)+' m'],['Compound successes','0 / 100']].map(([label,value])=>'<div><span>'+label+'</span><strong>'+value+'</strong></div>').join('');
    $('record-details').innerHTML = [['Episode seed',401000],['Backend','CPU replay'],['Command','0.5 m/s forward'],['Friction / mass / payload','0.6 / 1× / 0 kg'],['Checkpoint',clip?.checkpoint_sha256||'Unavailable'],['Video SHA-256',clip?.video_sha256||'Unavailable']].map(([label,value])=>'<dt>'+label+'</dt><dd>'+escape(value)+'</dd>').join('');
  }
  document.querySelectorAll('#cohorts button').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.cohort,selected.actor)));
  document.querySelectorAll('#methods button').forEach(b=>b.addEventListener('click',()=>choose(selected.cohort,b.dataset.actor)));
  $('video').addEventListener('error',()=>{if(!$('video').dataset.source)return;$('video').hidden=true;$('unavailable').hidden=false;});
  render();
})();

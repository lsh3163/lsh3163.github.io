(() => {
  'use strict';
  const video=document.getElementById('hero-video');
  const asset='assets/prism/paper-20261013/';
  const sequence=JSON.parse(document.getElementById('rough-sequence-data').textContent);
  const chapters=sequence.chapters;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let terrain='rough', lastChapter=null, roughTime=0;
  function respectMotion(){if(reduced.matches){video.autoplay=false;video.pause();}}
  respectMotion();reduced.addEventListener('change',respectMotion);
  function updateChapter(){
    if(terrain!=='rough')return;
    const c=chapters.find(c=>video.currentTime>=c.start_s&&video.currentTime<c.end_s)||chapters.at(-1);
    if(c.id===lastChapter)return;
    lastChapter=c.id;
    document.querySelectorAll('[data-chapter]').forEach(b=>{
      const selected=b.dataset.chapter===c.id;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));
    });
    document.getElementById('demo-description').textContent=c.caption;
    document.getElementById('full-demo-link').href=asset+c.full_video;
    document.getElementById('condition-explorer-link').href='explorer/?condition='+encodeURIComponent(c.condition_id)+'&actor=standard';
  }
  video.addEventListener('timeupdate',()=>{if(terrain==='rough'){roughTime=video.currentTime;updateChapter();}});
  document.querySelectorAll('[data-chapter]').forEach(b=>b.addEventListener('click',()=>{
    const c=chapters.find(c=>c.id===b.dataset.chapter);if(!c)return;
    video.currentTime=c.start_s;roughTime=c.start_s;lastChapter=null;updateChapter();
  }));
  document.querySelectorAll('[data-terrain]').forEach(b=>b.addEventListener('click',()=>{
    if(terrain===b.dataset.terrain)return;
    const playing=!video.paused&&!reduced.matches;
    video.pause();terrain=b.dataset.terrain;
    document.querySelectorAll('[data-terrain]').forEach(other=>{const active=other===b;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active));});
    const rough=terrain==='rough';
    document.getElementById('rough-chapters').hidden=!rough;
    document.getElementById('flat-condition').hidden=rough;
    document.getElementById('condition-explorer-link').hidden=!rough;
    video.poster=asset+(rough?'rough-sequence-poster.jpg':'humanoid-low-friction-paired-poster.jpg');
    video.querySelector('source').src=asset+(rough?sequence.file:'humanoid-low-friction-paired-hero.mp4');
    video.setAttribute('aria-label',rough?'MLP and PRISM across low friction, increased mass, and payload on rough terrain':'Matched MLP and PRISM on low-friction flat terrain');
    video.load();
    if(rough){
      lastChapter=null;
      video.addEventListener('loadedmetadata',()=>{if(terrain==='rough'){video.currentTime=roughTime;updateChapter();}},{once:true});
    }else{
      document.getElementById('demo-description').textContent='Low-friction flat terrain · MLP falls at 12.08 s; PRISM completes 24 s.';
      document.getElementById('full-demo-link').href=asset+'humanoid-low-friction-paired-full.mp4';
    }
    if(playing)video.play().catch(()=>{});
  }));
  updateChapter();
  document.getElementById('copy-citation').addEventListener('click',async()=>{
    const citation=document.getElementById('citation'),status=document.getElementById('copy-status');
    try{await navigator.clipboard.writeText(citation.textContent);status.textContent='Copied';}
    catch(_){const range=document.createRange();range.selectNodeContents(citation);const selected=getSelection();selected.removeAllRanges();selected.addRange(range);status.textContent='Citation selected — copy with Ctrl/Cmd+C';}
  });
})();

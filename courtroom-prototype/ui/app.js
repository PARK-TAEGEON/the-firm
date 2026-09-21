(function () {
  'use strict';
  const service = FirmService.createService(FirmCase), $ = q => document.querySelector(q);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const strength = { limited:'제한적', strong:'강함', compelling:'매우 강함' };
  const actionNames = { maintain:'질문 유지', basis:'근거 제시', narrow:'좁혀 묻기', withdraw:'철회', justify:'기록 연결' };
  let filter = 'all', noticeTimer;
  const button = (action,label,enabled=true,title='') => `<button class="plain" data-action="${action}" ${enabled?'':'disabled'} ${title?`title="${esc(title)}"`:''}>${esc(label)}</button>`;
  function updateLane(v) {
    const x = scrollX, y = scrollY;
    document.querySelectorAll('[data-premise]').forEach(b => {
      b.setAttribute('aria-pressed',String(v.state.selected.includes(b.dataset.premise)));
      b.disabled = !v.availability.premises.find(a => a.id === b.dataset.premise).available;
    });
    const a = v.argument;
    $('.conclusion').textContent = a.valid ? a.inference.title : '';
    $('.conclusion').title = a.valid ? `${strength[a.inference.strength]} · ${a.inference.text}` : a.reason;
    $('#inferenceDetail').innerHTML = a.valid ? `<summary>논증 상세</summary><p>${esc(a.inference.text)}</p><p>${esc(strength[a.inference.strength])} · ${v.strategy.preferred?'핵심 쟁점':'보조 쟁점'}</p>` : '';
    $('#inferenceDetail').hidden = !a.valid;
    for (const act of ['press','frame']) $(`[data-action="${act}"]`).disabled = !v.availability[act];
    scrollTo(x,y);
  }
  function recordHTML(v) {
    const d = v.case, s = v.state;
    const entries = ['evidence','advocacy','procedural'].flatMap(layer => s.records[layer].map(r => ({r,layer}))).sort((a,b) => Number(a.r.id.split(':').at(-1))-Number(b.r.id.split(':').at(-1)));
    return `<div class="record-tools"><label for="recordFilter">Court Record</label><select id="recordFilter" aria-label="기록 종류">${[['all','전체'],['evidence','증언'],['advocacy','논증'],['procedural','절차']].map(([id,name])=>`<option value="${id}" ${id===filter?'selected':''}>${name}</option>`).join('')}</select></div><div class="record-stack">${entries.filter(e=>filter==='all'||e.layer===filter).map(({r,layer})=>{
      let title, body;
      if (layer==='evidence') {
        const prop = d.propositions.find(p=>p.id===r.propositionId), qualified = v.assessment.qualifiedCounterRefs.includes(r.id);
        title = prop.short;
        body = `<p>${esc(prop.text)}</p><p>${esc(r.testimony)}</p>${qualified?'<p>친분과 당시 식별의 확신은 구분됨.</p>':''}${prop.counterNote?`<p>${esc(prop.counterNote)}</p>`:''}<small>${esc(d.witnesses[0].name)}${r.basis.length?' · '+r.basis.map(id=>esc(d.evidence.find(e=>e.id===id).title)).join(', '):''}</small>`;
        for (const c of v.availability.counters.filter(c=>c.target===prop.id&&c.visible&&!c.completed)) body += `<button class="plain" data-counter="${esc(c.id)}" ${c.available?'':'disabled'}>최초 진술과 대조</button>${c.missing.length?`<p>필요한 기록: ${c.missing.map(id=>esc(d.propositions.find(p=>p.id===id).short)).join(', ')}</p>`:''}`;
      } else if (layer==='advocacy') {
        const plan = d.argumentPlans.find(p=>p.id===r.planId), inf = plan?.inferenceVariants.find(i=>i.id===r.inferenceId);
        title = r.kind==='major_commitment'?'공개 입장':r.kind==='press'?'결론 질문':inf?.title||'논증';
        body = `<p>${esc(r.text)}</p>${r.premises?`<p>${r.premises.map(id=>esc(d.propositions.find(p=>p.id===id).short)).join(' · ')}</p>`:''}`;
      } else {
        title = r.kind==='objection'?`이의 · ${r.title}`:r.kind==='court_ruling'?r.text:r.kind==='response'?actionNames[r.response]:r.kind==='court_instruction'?'재판장 설명 요청':r.kind==='question_limited'?'질문 범위 제한':'질문 철회';
        body = `<p>${esc(r.question||r.original||r.text||actionNames[r.response])}</p>${r.basis?.length?`<p>${r.basis.map(b=>{ const e = b.kind==='evidence'?d.evidence.find(x=>x.id===b.refId):s.records.evidence.find(x=>x.id===b.refId); return esc(b.kind==='evidence'?e?.title:d.propositions.find(p=>p.id===e?.propositionId)?.short); }).join(' · ')}</p>`:''}`;
      }
      return `<details class="record-item ${layer}" data-detail="${esc(r.id)}"><summary>${esc(title)}</summary>${body}</details>`;
    }).join('')||'<p class="note">기록 없음</p>'}</div>`;
  }
  function render() {
    const expanded = new Set([...document.querySelectorAll('details[open][data-detail]')].map(e=>e.dataset.detail));
    const saved = {x:scrollX,y:scrollY,record:$('#recordDialog').scrollTop};
    const focused = document.activeElement, focusAttr = ['data-premise','data-action','data-goal','data-counter','data-response'].find(k=>focused?.hasAttribute(k));
    const focusValue = focusAttr?focused.getAttribute(focusAttr):null;
    const v = service.projection(), s = v.state, d = v.case;
    $('#caseTitle').textContent = d.title; $('#phaseLabel').textContent = d.profile.phases[s.phase];
    $('#casePanel').innerHTML = `<section class="section"><div class="theory">${esc(v.strategy?.title||'변호 전략')}</div>${button('open-strategy','전략',v.availability.strategy)}<details data-detail="theory"><summary>입장</summary>${v.strategy?`<p>${esc(v.strategy.relevance)}</p><p>${v.strategy.concessions.map(esc).join(' · ')}</p>`:''}</details></section><section class="section" id="mobileCaseInfo" tabindex="-1"><details data-detail="case-issues"><summary>쟁점 · 의뢰인 목표</summary>${d.issues.map(i=>`<p>${esc(i.question)}</p>`).join('')}<p>${esc(d.client.name)} · ${esc(d.clientObjectives.primary)}</p><p>${d.facts.map(esc).join('<br>')}</p></details></section><section class="section">${d.evidence.map(e=>`<button class="evidence" data-evidence="${esc(e.id)}">${esc(e.title)}</button>`).join('')}</section>`;
    const latest = s.dialogue.at(-1), previous = s.dialogue.at(-2);
    const history = `<details class="history" data-detail="dialogue"><summary>대화</summary>${s.dialogue.map(l=>`<p><b>${esc(l.speaker)}</b> ${esc(l.text)}</p>`).join('')}</details>`;
    if (s.resolution) {
      const r = s.resolution;
      $('#scene').innerHTML = `<div class="result-box"><h1>${esc(r.title)}</h1><details data-detail="result"><summary>기록 검토</summary><p>${esc(r.text)}</p><p>${r.framedArguments.map(a=>esc(a.title)+' · '+esc(strength[a.strength])).join('<br>')}</p><p>${r.strategy.unresolvedIssues.length?'남은 쟁점: '+r.strategy.unresolvedIssues.map(id=>esc(d.issues.find(i=>i.id===id).title)).join(', '):'식별 쟁점의 근거 확보'}</p><p>${esc(r.limitation)}</p></details></div>${history}`;
    } else {
      $('#scene').innerHTML = `${latest.kind==='answer'&&previous?.kind==='ruling'?`<p class="court-notice">${esc(previous.text)}</p>`:''}<div class="speaker">${esc(latest.speaker)}</div><h1 class="statement">${esc(latest.text)}</h1>${history}`;
    }
    if (v.procedure) {
      const o = v.procedure;
      $('#examination').innerHTML = `<div id="procedureActions">${o.stage==='address'?`<p id="addressContext">${esc(o.justification)}</p>`:''}<details data-detail="pending-question"><summary>질문과 근거</summary><p>${esc(o.question)}</p><p>${o.basis.map(b=>esc(b.title)).join(' · ')}</p></details><div class="procedure-buttons">${o.actions.map(action=>`<button class="plain" data-response="${action}" title="${action==='narrow'?'원 결론 대신 관찰 조건만 확인':action==='basis'?'현재 질문에 연결된 기록 제시':''}">${actionNames[action]}</button>`).join('')}</div></div>`;
    } else if (s.phase==='resolved') $('#examination').innerHTML = button('reset','다시 신문');
    else if (s.phase==='plan') $('#examination').innerHTML = button('open-strategy','전략 선택');
    else {
      $('#examination').innerHTML = `<div class="goal-grid">${d.goals.map(g=>`<button class="plain" data-goal="${esc(g.id)}" ${v.availability.goals.find(a=>a.id===g.id).available?'':'disabled'} title="${esc(g.question)}">${esc(g.title)}</button>`).join('')}</div><div class="lane"><div class="chips">${v.argument.plan.premises.map(id=>`<button class="chip" data-premise="${esc(id)}" aria-pressed="false" title="${esc(d.propositions.find(p=>p.id===id).text)}">${esc(d.propositions.find(p=>p.id===id).short)}</button>`).join('')}</div><p class="conclusion"></p><details id="inferenceDetail" data-detail="inference"></details></div><div class="decisions">${button('stop','신문 종료',true)}${button('press','압박',v.availability.press,'현재 근거로 증인에게 결론 질문')}${button('frame','논증 기록',v.availability.frame,'선택한 근거의 논증을 보존')}</div>`;
      updateLane(v);
    }
    $('#recordPanel').innerHTML = recordHTML(v);
    $('#strategyChoices').innerHTML = d.theories.map(t=>`<button class="choice" data-theory="${esc(t.id)}" ${s.theoryId===t.id?'disabled':''}><b>${esc(t.title)}</b></button>`).join('');
    $('#closeStrategy').hidden = s.phase==='plan';
    document.querySelectorAll('details[data-detail]').forEach(e=>{e.open=expanded.has(e.dataset.detail);});
    if (focusAttr) { const b = [...document.querySelectorAll(`[${focusAttr}]`)].find(e=>e.getAttribute(focusAttr)===focusValue); if (b&&!b.disabled) b.focus({preventScroll:true}); else if(focusAttr==='data-response') $('#examination button:not(:disabled)')?.focus({preventScroll:true}); }
    scrollTo(saved.x,saved.y); $('#recordDialog').scrollTop=saved.record;
  }
  function closeDialogs() { document.querySelectorAll('dialog[open]').forEach(d=>d.close()); if ($('#recordSheet').contains($('#recordPanel'))) $('.main').appendChild($('#recordPanel')); }
  function openDialog(selector) { closeDialogs(); $(selector).showModal(); }
  function run(action,payload) {
    const before = service.projection().state.dialogue.length;
    let r = service.command(action,payload);
    if (!r.ok) { clearTimeout(noticeTimer); $('#notification').textContent=r.error; noticeTimer=setTimeout(()=>{$('#notification').textContent='';},2400); return; }
    // Ruling and witness execution are distinct service transactions. No extra
    // player click is needed after the court allows the question.
    if (r.view.procedure?.stage==='answer') r=service.command('answer',{pendingId:r.view.procedure.pendingId});
    if (!r.ok) { $('#notification').textContent=r.error; return; }
    if (action==='select') updateLane(r.view);
    else {
      if (r.view.procedure) closeDialogs();
      render();
      const changes=r.view.state.dialogue.slice(before).filter(l=>['answer','objection','ruling','instruction'].includes(l.kind));
      $('#announcement').textContent=changes.slice(-2).map(l=>`${l.speaker}: ${l.text}`).join(' ');
      if (r.view.procedure) $('#procedureActions button')?.focus({preventScroll:true});
    }
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button'); if(!b||b.disabled)return;
    const v=service.projection(), o=v.procedure;
    if(b.dataset.goal){const g=v.case.goals.find(g=>g.id===b.dataset.goal);run('establish',{id:g.id,basis:g.basis});}
    else if(b.dataset.premise){const id=b.dataset.premise;run('select',{ids:v.state.selected.includes(id)?v.state.selected.filter(x=>x!==id):[...v.state.selected,id]});}
    else if(b.dataset.counter)run('counter',{id:b.dataset.counter});
    else if(b.dataset.response){const response=b.dataset.response;run(o.stage==='address'?'address':'respond',{pendingId:o.pendingId,response,...(['basis','justify'].includes(response)?{basis:o.basis.map(({kind,refId})=>({kind,refId})),issue:o.issue,inferenceId:o.inferenceId}:{})});}
    else if(b.dataset.theory){run('strategy',{id:b.dataset.theory});$('#strategyDialog').close();}
    else if(b.dataset.evidence){const e=v.case.evidence.find(e=>e.id===b.dataset.evidence);$('#evidenceTitle').textContent=e.title;$('#evidenceText').textContent=e.text;openDialog('#evidenceDialog');}
    else if(b.dataset.action==='open-strategy')openDialog('#strategyDialog');
    else if(b.dataset.action==='open-record'){closeDialogs();$('#recordSheet').appendChild($('#recordPanel'));$('#recordDialog').showModal();}
    else if(b.dataset.action==='mobile-case'){const el=$('#mobileCaseInfo');el.querySelector('details').open=true;el.scrollIntoView({block:'center'});el.focus({preventScroll:true});}
    else if(b.dataset.action==='reset'){closeDialogs();service.reset();filter='all';$('#announcement').textContent='';$('#notification').textContent='';render();openDialog('#strategyDialog');}
    else if(b.dataset.action)run(b.dataset.action);
  });
  document.addEventListener('change',e=>{if(e.target.id==='recordFilter'){filter=e.target.value;render();$('#recordFilter').focus({preventScroll:true});}});
  $('#closeStrategy').onclick=()=>$('#strategyDialog').close(); $('#closeEvidence').onclick=()=>$('#evidenceDialog').close(); $('#closeRecord').onclick=()=>$('#recordDialog').close();
  $('#recordDialog').addEventListener('close',()=>{if(!$('#recordDialog').open&&$('#recordSheet').contains($('#recordPanel')))$('.main').appendChild($('#recordPanel'));});
  $('#strategyDialog').addEventListener('cancel',e=>{if(service.projection().state.phase==='plan')e.preventDefault();});
  render(); openDialog('#strategyDialog');
})();

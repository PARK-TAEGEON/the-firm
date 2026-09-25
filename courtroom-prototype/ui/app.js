(function () {
  'use strict';
  const service = FirmService.createService(FirmCase), $ = q => document.querySelector(q);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const strength = { limited:'제한적', strong:'강함', compelling:'매우 강함' };
  const actionNames = { maintain:'그대로 요청', basis:'이 기록을 근거로', narrow:'좁혀 묻기', withdraw:'철회', justify:'기록 연결' };
  let filter = 'all', noticeTimer, argumentOpen=false, claimOpen=false, basisPicked=[], openingDraft=[], closingDraft={issueIds:[],argumentIds:[],evidenceRefs:[],counterRefs:[],positions:[]};
  const button = (action,label,enabled=true,title='') => `<button class="plain" data-action="${action}" ${enabled?'':'disabled'} ${title?`title="${esc(title)}"`:''}>${esc(label)}</button>`;
  function updateLane(v) {
    const x = scrollX, y = scrollY;
    document.querySelectorAll('[data-premise]').forEach(b => {
      b.setAttribute('aria-pressed',String(v.state.selected.includes(b.dataset.premise)));
      b.disabled = !v.availability.premises.find(a => a.id === b.dataset.premise).available;
    });
    const a = v.argument;
    if(!$('.conclusion'))return;
    $('#selectedRecord').textContent=v.state.selected.map(id=>v.case.propositions.find(p=>p.id===id).short).join(' + ');
    $('.conclusion').textContent = a.valid ? '→ '+a.inference.title : '';
    $('.conclusion').title = a.valid ? a.inference.text : '';
    $('#inferenceDetail').innerHTML = a.valid ? `<summary>논증 상세</summary><p>${esc(a.inference.text)}</p>` : '';
    $('#inferenceDetail').hidden = !a.valid;
    for (const act of ['press','frame']) $(`[data-action="${act}"]`) && ($(`[data-action="${act}"]`).disabled = !v.availability[act]);
    scrollTo(x,y);
  }
  function recordHTML(v) {
    const d = v.case, s = v.state;
    const transactions=new Map();
    for(const event of s.records.procedural){if(!transactions.has(event.questionId))transactions.set(event.questionId,{id:event.questionId,events:[]});transactions.get(event.questionId).events.push(event);}
    const testimonyRows=new Map();
    for(const r of s.records.evidence){const key=s.phase==='closing'?r.id:r.propositionId;const prior=testimonyRows.get(key);if(prior){prior.testimony+=' '+r.testimony;prior.relations.push(...(r.relations||[]));}else testimonyRows.set(key,{...r,relations:[...(r.relations||[])]});}
    const entries = [...[...testimonyRows.values()].map(r=>({r,layer:'evidence'})),...s.records.advocacy.map(r=>({r,layer:'advocacy'})),...[...transactions.values()].map(r=>({r,layer:'procedural'}))].sort((a,b) => Number(a.r.id.split(':').at(-1))-Number(b.r.id.split(':').at(-1)));
    return `<div class="record-tools"><label for="recordFilter">법정 기록</label><select id="recordFilter" aria-label="기록 종류">${[['all','전체'],['evidence','증언'],['advocacy','논증'],['procedural','절차']].map(([id,name])=>`<option value="${id}" ${id===filter?'selected':''}>${name}</option>`).join('')}</select></div><div class="record-stack">${entries.filter(e=>filter==='all'||e.layer===filter).map(({r,layer})=>{
      let title, body, selection='';
      if (layer==='evidence') {
        const prop = d.propositions.find(p=>p.id===r.propositionId), qualified = v.assessments.some(a=>a.qualifiedCounterRefs.includes(r.id));
        title = prop.short;
        if(argumentOpen&&!claimOpen&&!v.procedure&&s.phase==='examine'&&v.argument.plan.premises.includes(prop.id))selection='<button class="chip material" data-premise="'+prop.id+'" aria-pressed="'+s.selected.includes(prop.id)+'" '+(v.availability.premises.find(x=>x.id===prop.id).available?'':'disabled')+' aria-label="'+esc(prop.short)+' 근거로">근거</button>';
        if(s.phase==='closing'&&closingDraft.issueIds.includes(v.closingCatalog.evidence.find(e=>e.id===r.id).issue))selection='<button class="chip material" data-closing-'+(prop.side==='counter'?'counter':'evidence')+'="'+r.id+'" aria-pressed="'+(prop.side==='counter'?closingDraft.counterRefs:closingDraft.evidenceRefs).includes(r.id)+'">'+(prop.side==='counter'?'다룬다':'인용')+'</button>';
        body = `<p>${esc(prop.text)}</p><p>${esc(r.testimony)}</p>${(r.relations||[]).map(rel=>{const prior=s.records.evidence.find(e=>e.id===rel.recordRef);return '<p>'+esc(d.propositions.find(p=>p.id===prior?.propositionId)?.short)+' — '+esc({qualification:'범위를 한정함',clarification:'뜻을 설명함',contradiction:'앞선 진술과 충돌',retreat:'앞선 진술을 물림'}[rel.kind])+'</p>';}).join('')}${qualified?'<p>'+esc(prop.qualificationText||'기록의 의미가 제한됨.')+'</p>':''}${prop.counterNote?`<p>${esc(prop.counterNote)}</p>`:''}<small>${esc(d.witnesses.find(w=>w.id===r.witnessId).name)}${r.basis.length?' · '+r.basis.map(id=>esc(d.evidence.find(e=>e.id===id).title)).join(', '):''}</small>`;
        for (const c of v.availability.counters.filter(c=>c.target===prop.id&&c.visible&&!c.completed)) body += `<button class="plain" data-counter="${esc(c.id)}" ${c.available?'':'disabled'}>${esc(d.counterResponses.find(x=>x.id===c.id).title)}</button>${c.missing.length?`<p>필요한 기록: ${c.missing.map(id=>esc(d.propositions.find(p=>p.id===id).short)).join(', ')}</p>`:''}`;
      } else if (layer==='advocacy') {
        const plan = d.argumentPlans.find(p=>p.id===r.planId), inf = plan?.inferenceVariants.find(i=>i.id===r.inferenceId);
        title = r.kind==='closing_position'?'최종변론':r.kind==='closing_started'?'변론 준비':r.kind==='closing_revision'?'최종 입장 수정':r.kind==='opening_position'?'개회사':r.kind==='strategy_revision'?'전략 변경':r.kind==='commitment_conflict'?'공개 입장과 충돌':r.kind==='major_commitment'?'공개 입장':r.kind==='press'?'결론 질문':inf?.title||'논증';
        body = `<p>${esc(r.text)}</p>${r.premises?`<p>${r.premises.map(id=>esc(d.propositions.find(p=>p.id===id).short)).join(' · ')}</p>`:''}`;
      } else {
        const opening=r.events.find(e=>e.kind==='objection'), ruling=r.events.filter(e=>e.kind==='court_ruling').at(-1);
        const outcome={overruled:'이의 기각',sustained:'질문 차단',limited:'범위 제한',withdrawn:'질문 철회'};
        title=(opening?.titleShort||'질문')+' · '+(ruling?outcome[ruling.outcome]:'이의 중');
        body=r.events.map(e=>'<p>'+esc(e.kind==='objection'?e.title:e.kind==='response'?actionNames[e.response]:e.question||e.original||e.text||'')+(e.basis?.length?' · '+e.basis.map(b=>{const x=b.kind==='evidence'?d.evidence.find(x=>x.id===b.refId):s.records.evidence.find(x=>x.id===b.refId);return esc(b.kind==='evidence'?x?.title:d.propositions.find(p=>p.id===x?.propositionId)?.short);}).join(' + '):'')+'</p>').join('');
      }
      return `<div class="record-row"><details class="record-item ${layer}" data-detail="${esc(r.id)}"><summary>${esc(title)}</summary>${body}</details>${selection}</div>`;
    }).join('')||'<p class="note">기록 없음</p>'}</div>`;
  }
  function render() {
    const expanded = new Set([...document.querySelectorAll('details[open][data-detail]')].map(e=>e.dataset.detail));
    const saved = {x:scrollX,y:scrollY,record:$('#recordDialog').scrollTop,panel:$('#recordPanel').scrollTop};
    const focused = document.activeElement, focusAttr = ['data-closing-issue','data-closing-argument','data-closing-evidence','data-closing-counter','data-closing-position','data-opening','data-claim','data-premise','data-action','data-goal','data-counter','data-response','data-thread','data-basis','data-witness'].find(k=>focused?.hasAttribute(k));
    const focusValue = focusAttr?focused.getAttribute(focusAttr):null;
    const v = service.projection(), s = v.state, d = v.case;
    document.body.classList.toggle('closing-phase',['closing','closed'].includes(s.phase));
    $('#caseTitle').textContent = d.title; $('#phaseLabel').textContent = s.phase==='closed'?'최종변론':s.phase==='closing'?'최종변론 준비':s.phase==='plan'?'변호 전략':s.phase==='opening'?'개회사 준비':v.witness.name+' · '+(s.phase==='resolved'?'신문 종료':v.witness.role);
    $('#casePanel').innerHTML = `<section class="section witnesses">${d.witnesses.map(w=>`<button class="plain" data-witness="${w.id}" aria-pressed="${s.witnessId===w.id}" ${!v.availability.witness||s.witnessId===w.id?'disabled':''}>${esc(w.name)}</button>`).join('')}</section><section class="section"><div class="theory">${esc(v.strategy?.title||'변호 전략')}</div>${button('open-strategy','전략',v.availability.strategy)}<details data-detail="theory"><summary>입장</summary>${v.strategy?`<p>${esc(v.strategy.relevance)}</p><p>${v.strategy.concessions.map(esc).join(' · ')}</p>`:''}</details></section><section class="section" id="mobileCaseInfo" tabindex="-1"><details data-detail="case-issues"><summary>쟁점 · 의뢰인 목표</summary>${d.issues.map(i=>`<p>${esc(i.question)}</p>`).join('')}<p>${esc(d.client.name)} · ${esc(d.clientObjectives.primary)}</p><p>${d.facts.map(esc).join('<br>')}</p></details></section><section class="section">${d.evidence.filter(e=>v.witness.evidenceIds.includes(e.id)).map(e=>`<button class="evidence" data-evidence="${esc(e.id)}">${esc(e.title)}</button>`).join('')}</section>`;
    const latest = s.dialogue.at(-1), previous = s.dialogue.at(-2);
    const history = `<details class="history" data-detail="dialogue"><summary>대화</summary>${s.dialogue.map(l=>`<p><b>${esc(l.speaker)}</b> ${esc(l.text)}</p>`).join('')}</details>`;
    if (s.resolution) {
      const r = s.resolution;
      $('#scene').innerHTML = `<div class="result-box"><h1>${esc(r.title)}</h1><details data-detail="result"><summary>기록 검토</summary><p>${esc(r.text)}</p><p>${r.framedArguments.map(a=>esc(a.title)+' · '+esc(strength[a.strength])).join('<br>')}</p><p>${r.strategy.unresolvedIssues.length?'남은 쟁점: '+r.strategy.unresolvedIssues.map(id=>esc(d.issues.find(i=>i.id===id).title)).join(', '):'이 쟁점의 근거 확보'}</p><p>${esc(r.limitation)}</p></details></div>${history}`;
    } else {
      $('#scene').innerHTML = `${latest.kind==='answer'&&s.dialogue.findLast(l=>l.kind==='question'&&l.witnessId===s.witnessId)?`<p class="question-echo">${esc(s.dialogue.findLast(l=>l.kind==='question'&&l.witnessId===s.witnessId).text)}</p>`:''}${latest.kind==='answer'&&previous?.kind==='ruling'?`<p class="court-notice">${esc(previous.text)}</p>`:''}<div class="speaker">${esc(latest.speaker)}</div><h1 class="statement">${esc(latest.text)}</h1>${history}`;
    }
    if(s.phase==='closing') {
      $('#scene').innerHTML='<h1>최종변론 준비</h1>';
      const c=v.closingCatalog, chip=(kind,id,label,on)=>'<button class="chip" data-closing-'+kind+'="'+esc(id)+'" aria-pressed="'+on+'">'+esc(label)+'</button>';
      const args=c.arguments.filter(a=>closingDraft.issueIds.includes(a.issue));
      $('#examination').innerHTML='<fieldset class="opening-group"><legend>중심 쟁점</legend>'+d.issues.map(i=>chip('issue',i.id,i.title,closingDraft.issueIds.includes(i.id))).join('')+'</fieldset>'+
        '<details data-detail="closing-arguments"><summary>사용할 논증</summary>'+args.map(a=>chip('argument',a.id,a.title,closingDraft.argumentIds.includes(a.id))).join('')+(!args.length?'<p>연결할 논증 없음</p>':'')+'</details>'+
        '<details data-detail="closing-citations"><summary>인용과 약점 대응</summary>'+button('choose-record','기록에서 고른다')+'<p>'+closingDraft.evidenceRefs.map(id=>esc(c.evidence.find(e=>e.id===id).title)).join(' · ')+'</p><p>'+closingDraft.counterRefs.map(id=>esc(c.counters.find(e=>e.id===id).title)).join(' · ')+'</p></details>'+
        '<details data-detail="closing-positions"><summary>개회사 입장</summary>'+c.commitments.map(p=>{const picked=closingDraft.positions.find(x=>x.commitmentRef===p.id);return '<label class="closing-position">'+esc(p.text)+'<select data-closing-position="'+p.id+'" aria-label="'+esc(p.text)+' 처리"><option value="">다루지 않음</option><option value="maintain" '+(picked?.mode==='maintain'?'selected':'')+'>유지</option>'+d.opening.options.filter(o=>o.id!==p.choiceId&&(o.issue===p.issue||o.position&&p.position&&o.position.key===p.position.key)).map(o=>'<option value="'+o.id+'" '+(picked?.choiceId===o.id?'selected':'')+'>수정: '+esc(o.label)+'</option>').join('')+'</select></label>';}).join('')+'</details>'+
        '<div class="decisions">'+button('preview-closing','변론 미리보기',closingDraft.issueIds.length>0)+'</div>';
    } else if(s.phase==='closed') {
      $('#scene').innerHTML='<h1>최종변론</h1><div class="closing-speech">'+esc(v.closing.position.text)+'</div>';
      $('#examination').innerHTML=button('open-record','법정 기록')+button('reset','처음부터');
    } else if (s.phase==='opening') {
      $('#scene').innerHTML='<h1>개회사 준비</h1>';
      $('#examination').innerHTML=Object.entries({admit:'인정',contest:'다툼',emphasize:'강조',introduce:'소개할 논증'}).map(([group,label])=>'<fieldset class="opening-group"><legend>'+label+'</legend>'+d.opening.options.filter(c=>c.group===group).map(c=>'<button class="chip" data-opening="'+c.id+'" aria-pressed="'+openingDraft.includes(c.id)+'">'+esc(c.label)+'</button>').join('')+'</fieldset>').join('')+'<div class="decisions">'+button('opening','이 입장으로 시작',openingDraft.length>0)+'</div>';
    } else if (v.procedure) {
      const o = v.procedure;
      $('#examination').innerHTML = `<div id="procedureActions">${o.stage==='address'?`<p id="addressContext">${esc(o.justification)}</p>`:''}<details data-detail="pending-question"><summary>질문과 근거</summary><p>${esc(o.question)}</p><p>${o.basis.map(b=>esc(b.title)).join(' · ')}</p></details><div id="basisChoices">${o.pickBasis?`<p class="basis-question">${esc(o.question)}</p><div class="basis-options" role="group" aria-label="질문에 연결할 근거, 최대 두 개">${o.basis.map((b,i)=>`<button class="chip" data-basis="${i}" aria-pressed="${basisPicked.includes(i)}" ${basisPicked.length>=o.basisMax&&!basisPicked.includes(i)?'disabled':''}>${esc(b.title)}</button>`).join('')}</div>`:''}</div><div class="procedure-buttons">${o.actions.map(action=>`<button class="plain" data-response="${action}" ${o.pickBasis&&['basis','justify'].includes(action)&&(basisPicked.length<o.basisMin||basisPicked.length>o.basisMax)?'disabled':''} title="${action==='narrow'?'원 결론 대신 관찰 조건만 확인':action==='basis'?'현재 질문에 연결된 기록 제시':''}">${actionNames[action]}</button>`).join('')}</div></div>`;
    } else if (s.phase==='resolved') $('#examination').innerHTML = (v.availability.beginClosing?button('beginClosing','최종변론을 준비한다'):'')+button('reset','다시 신문');
    else if (s.phase==='plan') $('#examination').innerHTML = button('open-strategy','전략 선택');
    else {
      const t=v.threads.find(t=>t.id===s.threadId), follow=s.followupGoalId&&d.goals.find(g=>g.id===s.followupGoalId&&v.availability.goals.some(a=>a.id===g.id&&a.available));
      const topics='<div class="thread-nav">'+v.threads.map(t=>{const remaining=t.goals.filter(id=>v.availability.goals.some(g=>g.id===id&&g.available)); if(!remaining.length || (remaining.length===1&&s.threadId===t.id))return ''; if(remaining.length===1){const g=d.goals.find(g=>g.id===remaining[0]);return '<button class="plain" data-goal="'+g.id+'">'+esc(g.title)+'</button>';} return '<button class="plain" data-thread="'+t.id+'" aria-pressed="'+(s.threadId===t.id)+'">'+esc(t.title)+'</button>';}).join('')+'</div>';
      const goals=t?'<div class="thread-questions">'+(follow?'<button class="plain" data-goal="'+follow.id+'">'+esc(follow.followupLabel)+'</button>'+button('endThread','다른 논점으로'):t.goals.filter(id=>v.availability.goals.some(g=>g.id===id&&g.available)).map(id=>{const g=d.goals.find(g=>g.id===id);return '<button class="plain" data-goal="'+g.id+'" title="'+esc(g.question)+'">'+esc(g.title)+'</button>';}).join('')+button('endThread','이 논점은 여기까지'))+'</div>':'';
      const recorded=v.argument.plan.premises.filter(id=>s.records.evidence.some(r=>r.propositionId===id));
      const claims=claimOpen?'<div class="claim-questions">'+v.argument.plan.claimVariants.map(c=>'<button class="claim-question" data-claim="'+c.id+'">'+esc(c.question)+'</button>').join('')+'</div><div class="decisions">'+button('close-claims','질문으로')+button('stop','신문을 마친다')+'</div>':null;
      const lane=argumentOpen?'<div class="lane">'+button('choose-record','기록에서 고른다')+'<p id="selectedRecord"></p><p class="conclusion"></p><details id="inferenceDetail" data-detail="inference"></details></div><div class="decisions">'+button('close-argument','질문으로')+button('frame','이 논점을 남긴다',v.availability.frame)+button('press','확답을 요구한다',v.availability.press)+'</div>':'';
      $('#examination').innerHTML=claims || (argumentOpen?lane:topics+goals+'<div class="decisions flow-actions">'+button('stop','신문을 마친다')+button('compose','기록을 연결한다',recorded.length>=v.argument.plan.min)+button('press','확답을 요구한다')+'</div>');
      if(argumentOpen&&!claimOpen)updateLane(v);
    }
    $('#recordPanel').innerHTML = recordHTML(v);
    if(argumentOpen&&!claimOpen&&!v.procedure&&s.phase==='examine')updateLane(v);
    $('#strategyChoices').innerHTML = d.theories.map(t=>`<button class="choice" data-theory="${esc(t.id)}" ${s.theoryId===t.id?'disabled':''}><b>${esc(t.title)}</b></button>`).join('');
    $('#closeStrategy').hidden = s.phase==='plan';
    document.querySelectorAll('details[data-detail]').forEach(e=>{e.open=expanded.has(e.dataset.detail);});
    if (focusAttr) { const b = [...document.querySelectorAll(`[${focusAttr}]`)].find(e=>e.getAttribute(focusAttr)===focusValue); if (b&&!b.disabled) b.focus({preventScroll:true}); else if(focusAttr==='data-response') $('#examination .decisions button:not(:disabled)')?.focus({preventScroll:true}); }
    scrollTo(saved.x,saved.y); $('#recordDialog').scrollTop=saved.record;$('#recordPanel').scrollTop=saved.panel;
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
      if(action==='witness'||action==='thread'||action==='endThread')argumentOpen=false;
      claimOpen=false;
      basisPicked=[];
      render();
      const changes=r.view.state.dialogue.slice(before).filter(l=>['answer','objection','ruling','instruction','opening_position','closing_position'].includes(l.kind));
      $('#announcement').textContent=changes.slice(-2).map(l=>`${l.speaker}: ${l.text}`).join(' ');
      if (r.view.procedure) $('#procedureActions button:not(:disabled)')?.focus({preventScroll:true});
      else if(action==='beginClosing'||action==='submitClosing'||action==='opening'||action==='strategy'||action==='witness'||action==='endThread')$('#examination button:not(:disabled)')?.focus({preventScroll:true});
    }
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button'); if(!b||b.disabled)return;
    const v=service.projection(), o=v.procedure;
    const field=['issue','argument','evidence','counter'].find(k=>b.hasAttribute('data-closing-'+k));
    if(field){const key={issue:'issueIds',argument:'argumentIds',evidence:'evidenceRefs',counter:'counterRefs'}[field],id=b.getAttribute('data-closing-'+field);closingDraft[key]=closingDraft[key].includes(id)?closingDraft[key].filter(x=>x!==id):[...closingDraft[key],id];if(field==='issue'){closingDraft.argumentIds=closingDraft.argumentIds.filter(id=>v.closingCatalog.arguments.some(a=>a.id===id&&closingDraft.issueIds.includes(a.issue)));closingDraft.evidenceRefs=closingDraft.evidenceRefs.filter(id=>v.closingCatalog.evidence.some(e=>e.id===id&&closingDraft.issueIds.includes(e.issue)));closingDraft.counterRefs=closingDraft.counterRefs.filter(id=>v.closingCatalog.counters.some(e=>e.id===id&&closingDraft.issueIds.includes(e.issue)));}render();}
    else if(b.dataset.action==='preview-closing'){
      try{const draft=FirmClosing.synthesize(v.case,v.state.records,v.state.theoryId,closingDraft);$('#notification').textContent='';$('#closingPreviewText').textContent=draft.text;openDialog('#closingPreview');}catch(e){$('#notification').textContent=e.message;}
    }
    else if(b.dataset.action==='submitClosing'){closeDialogs();run('submitClosing',closingDraft);}
    else if(b.dataset.opening){const id=b.dataset.opening;openingDraft=openingDraft.includes(id)?openingDraft.filter(x=>x!==id):[...openingDraft,id];render();}
    else if(b.dataset.action==='opening')run('opening',{ids:openingDraft});
    else if(b.dataset.claim)run('press',{claimId:b.dataset.claim});
    else if(b.dataset.witness)run('witness',{id:b.dataset.witness});
    else if(b.dataset.thread)run('thread',{id:b.dataset.thread});
    else if(b.hasAttribute('data-basis')){const i=Number(b.dataset.basis);if(basisPicked.includes(i))basisPicked=basisPicked.filter(x=>x!==i);else if(basisPicked.length<o.basisMax)basisPicked.push(i);document.querySelectorAll('[data-basis]').forEach(e=>{const picked=basisPicked.includes(Number(e.dataset.basis));e.setAttribute('aria-pressed',String(picked));e.disabled=!picked&&basisPicked.length>=o.basisMax;});document.querySelectorAll('[data-response]').forEach(e=>{if(['basis','justify'].includes(e.dataset.response))e.disabled=basisPicked.length<o.basisMin;});}
    else if(b.dataset.goal){const g=v.case.goals.find(g=>g.id===b.dataset.goal);run('establish',{id:g.id,basis:g.basis});}
    else if(b.dataset.premise){event.preventDefault();const id=b.dataset.premise;run('select',{ids:v.state.selected.includes(id)?v.state.selected.filter(x=>x!==id):[...v.state.selected,id]});}
    else if(b.dataset.counter)run('counter',{id:b.dataset.counter});
    else if(b.dataset.response){const response=b.dataset.response;run(o.stage==='address'?'address':'respond',{pendingId:o.pendingId,response,...(['basis','justify'].includes(response)?{basis:(o.pickBasis?o.basis.filter((_,i)=>basisPicked.includes(i)):o.basis).map(({kind,refId})=>({kind,refId})),issue:o.issue,inferenceId:o.inferenceId}:{})});}
    else if(b.dataset.theory){run('strategy',{id:b.dataset.theory});$('#strategyDialog').close();$('#examination button:not(:disabled)')?.focus({preventScroll:true});}
    else if(b.dataset.evidence){const e=v.case.evidence.find(e=>e.id===b.dataset.evidence);$('#evidenceTitle').textContent=e.title;$('#evidenceText').textContent=e.text;openDialog('#evidenceDialog');}
    else if(b.dataset.action==='press'){if(!v.argument.plan.claimVariants?.length){run('press');return;}claimOpen=true;render();document.querySelector('[data-claim]')?.focus({preventScroll:true});}
    else if(b.dataset.action==='close-claims'){claimOpen=false;render();}
    else if(b.dataset.action==='compose'){argumentOpen=true;filter='all';render();document.querySelector('[data-premise]')?.focus({preventScroll:true});}
    else if(b.dataset.action==='close-argument'){argumentOpen=false;render();document.querySelector('[data-action=compose]')?.focus({preventScroll:true});}
    else if(b.dataset.action==='open-strategy')openDialog('#strategyDialog');
    else if(['open-record','choose-record'].includes(b.dataset.action)){closeDialogs();$('#recordSheet').appendChild($('#recordPanel'));$('#recordDialog').showModal();}
    else if(b.dataset.action==='mobile-case'){const el=$('#mobileCaseInfo');el.querySelector('details').open=true;el.scrollIntoView({block:'center'});el.focus({preventScroll:true});}
    else if(b.dataset.action==='reset'){closeDialogs();service.reset();openingDraft=[];closingDraft={issueIds:[],argumentIds:[],evidenceRefs:[],counterRefs:[],positions:[]};filter='all';argumentOpen=false;claimOpen=false;basisPicked=[];$('#announcement').textContent='';$('#notification').textContent='';render();openDialog('#strategyDialog');}
    else if(b.dataset.action)run(b.dataset.action);
  });
  document.addEventListener('change',e=>{if(e.target.hasAttribute('data-closing-position')){const id=e.target.dataset.closingPosition,value=e.target.value;closingDraft.positions=closingDraft.positions.filter(x=>x.commitmentRef!==id);if(value)closingDraft.positions.push({commitmentRef:id,mode:value==='maintain'?'maintain':'revise',...(value==='maintain'?{}:{choiceId:value})});}else if(e.target.id==='recordFilter'){filter=e.target.value;render();$('#recordFilter').focus({preventScroll:true});}});
  $('#closeClosingPreview').onclick=()=>$('#closingPreview').close();
  $('#closeStrategy').onclick=()=>$('#strategyDialog').close(); $('#closeEvidence').onclick=()=>$('#evidenceDialog').close(); $('#closeRecord').onclick=()=>$('#recordDialog').close();
  $('#recordDialog').addEventListener('close',()=>{if(!$('#recordDialog').open&&$('#recordSheet').contains($('#recordPanel')))$('.main').appendChild($('#recordPanel'));});
  $('#strategyDialog').addEventListener('cancel',e=>{if(service.projection().state.phase==='plan')e.preventDefault();});
  render(); openDialog('#strategyDialog');
})();

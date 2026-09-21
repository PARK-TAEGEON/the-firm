(function () {
  'use strict';
  const service = FirmService.createService(FirmCase);
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const responseLabels = { ADMIT: '인정', RESIST: '버팀', EXPLAIN: '설명', EVADE: '회피', CONTRADICT: '모순' };
  let notificationTimer;
  const pressureLabels = { first: '첫 압박', reinforced: '근거 보강 재압박', repeated: '같거나 줄어든 근거 · 반복 압박', new_basis: '다른 근거의 압박' };
  const developmentLabels = { facts_only: '전제 확보 · 아직 핵심 논증/인정 없음', developed: '현재 핵심 쟁점의 논증 근거 확보', contested: '핵심 공격에 반대 근거가 남음', peripheral: '보조 성과 · 핵심 쟁점은 미해결' };
  const positionLabels = { flexible: '추가 공개 입장 없음 · 전략 선택 여지 보존', aligned: '공개 입장이 현재 쟁점과 연결됨', review_required: '공개 입장 설명 필요 · 우선 쟁점과 다르거나 반대 기록이 남음' };
  function updateLane(v) {
    const scroll = { x: window.scrollX, y: window.scrollY };
    const s = v.state, p = v.argument.plan, d = v.case;
    document.querySelectorAll('[data-premise]').forEach(b => { b.setAttribute('aria-pressed', String(s.selected.includes(b.dataset.premise))); b.disabled = !v.availability.premises.find(a => a.id === b.dataset.premise).available; });
    $('.selection-count').textContent = `${s.selected.length} / ${p.max}`;
    $('.conclusion').innerHTML = v.argument.valid ? `${s.selected.map(id => esc(d.propositions.find(x => x.id === id).short)).join(' + ')}<br>→ ${esc(p.title)}` : '<span class="empty-lane">선택한 사실을 하나의 논증으로 연결합니다.</span>';
    for (const action of ['press', 'frame']) $(`[data-action="${action}"]`).disabled = !v.availability[action];
    $('#pressureHint').textContent = v.argument.valid ? pressureLabels[v.pressure.kind] : '근거를 선택하면 압박 방식을 확인할 수 있습니다.';
    window.scrollTo(scroll.x, scroll.y);
  }
  function notify(text) { clearTimeout(notificationTimer); $('#notification').textContent = text; notificationTimer = setTimeout(() => { $('#notification').textContent = ''; }, 2400); }
  function button(action, title, hint, enabled = true, cls = '') { return `<button class="choice ${cls}" data-action="${action}" ${enabled ? '' : 'disabled'}><b>${title}</b><span>${hint}</span></button>`; }
  function render() {
    const expanded = new Set([...document.querySelectorAll('details[open][data-detail]')].map(e => e.dataset.detail));
    const scroll = { x: window.scrollX, y: window.scrollY, record: $('#recordDialog').scrollTop };
    const v = service.projection(), s = v.state, d = v.case, strategy = v.strategy;
    const p = v.argument.plan;
    $('#caseTitle').textContent = d.title;
    $('#phaseLabel').textContent = d.profile.phases[s.phase];
    $('#casePanel').innerHTML = `<section class="section case-primary"><div class="eyebrow">Case Theory</div><div class="theory">${esc(strategy?.title || '전략을 선택하세요.')}</div>${strategy ? `<div class="compact strategy-meta">${esc(strategy.relevance)}</div><button class="plain strategy-change" data-action="open-strategy" ${v.availability.strategy ? '' : 'disabled'}>전략 변경</button><details class="case-panel-details" data-detail="theory"><summary>주장과 인정한 사실</summary><ul class="compact-list">${strategy.claims.map(t => `<li>주장 · ${esc(t)}</li>`).join('')}${strategy.concessions.map(t => `<li>인정 · ${esc(t)}</li>`).join('')}</ul></details>` : ''}${strategy?.potentialConflict ? '<p class="note warning">이전 공개 논증과 현재 전략의 관계를 확인하세요. 공개 입장은 그대로 남아 있습니다.</p>' : ''}</section>
      <section class="section case-secondary" id="mobileCaseInfo" tabindex="-1"><div class="eyebrow">우선 쟁점 · ${strategy ? strategy.contestedIssues.map(id => esc(d.issues.find(i => i.id === id).title)).join(' · ') : '미선택'}</div><details data-detail="case-issues"><summary>쟁점 확인</summary>${d.issues.map(i => `<p class="compact"><b>${esc(i.title)}</b><br>${esc(i.question)}</p>`).join('')}</details><p class="note">의뢰인 목표 · ${esc(d.clientObjectives.primary)}</p><details data-detail="case-facts"><summary>사건 정보</summary><ul class="compact-list">${d.facts.map(f => `<li>${esc(f)}</li>`).join('')}<li>의뢰인 · ${esc(d.client.name)}</li></ul></details><p class="note strategy-assessment">${esc(developmentLabels[v.assessment.strategy.development])}</p>${v.assessment.strategy.conflicts.length ? `<p class="note warning">현재 전략에 불리한 기록: ${v.assessment.strategy.conflicts.map(c => esc(d.propositions.find(p => p.id === c.propositionId).short) + (c.qualified ? ' (의미 제한됨)' : '')).join(', ')}</p>` : ''}</section>
      <section class="section"><div class="eyebrow">Evidence / 사건 자료</div>${d.evidence.map(e => `<button class="evidence" data-evidence="${esc(e.id)}"><b>${esc(e.title)}</b><span>내용 보기 · 대조 질문 시 제시</span></button>`).join('')}</section>`;
    const latest = s.dialogue.at(-1), recentQuestion = s.dialogue.at(-2);
    const history = `<details class="history" data-detail="dialogue"><summary>대화 기록 (${s.dialogue.length})</summary>${s.dialogue.map(l => `<div class="history-line"><b>${esc(l.speaker)}</b> · ${esc(l.text)}</div>`).join('')}</details>`;
    if (s.resolution) {
      const r = s.resolution;
      $('#scene').innerHTML = `<div class="result-box"><div class="eyebrow">Court Finding / 시연 판정</div><h1>${esc(r.title)}</h1><p>${esc(r.text)}</p><div class="finding"><strong>세 가지 성과</strong><p>증언 전제 ${r.evidenceRefs.length}건 · 식별 한계 인정 ${r.admissionRefs.length}건<br>재사용 가능한 논증 ${r.framedArguments.length}건 · 미해소 반대 기록 ${r.activeCounterRefs.length}건</p></div><div class="finding"><strong>현재 전략과의 연결</strong><p>${esc(developmentLabels[r.strategy.development])}</p><p>후속 검토가 필요한 우선 쟁점: ${r.strategy.unresolvedIssues.map(id => esc(d.issues.find(i => i.id === id).title)).join(', ') || '이 시연 범위의 식별 근거 확보 (사건 종결 아님)'}</p></div><div class="finding"><strong>Advocacy / 공개 입장</strong><p>공개 입장 ${r.strategy.publicPositionRefs.length}건. ${r.framedArguments.map(a => a.value === 'core' ? '핵심 쟁점 논증' : a.value === 'relevant' ? '관련 쟁점 논증' : '보조 논증').join(', ') || '재사용 논증 없음'}. 논증을 증거로 계산하지 않았습니다.</p></div><p class="note">${esc(r.limitation)}</p>${strategy ? `<p class="note">${esc(strategy.relevance)}</p>` : ''}</div>${history}`;
    } else {
      $('#scene').innerHTML = `${latest.kind === 'answer' && recentQuestion?.kind === 'question' ? `<div class="question-echo">${esc(recentQuestion.speaker)} · ${esc(recentQuestion.text)}</div>` : ''}<div class="speaker">${esc(latest.speaker)}</div>${latest.kind === 'answer' ? `<div class="response-type">${esc(responseLabels[s.lastResponseType])}</div>` : ''}<h1 class="statement">${esc(latest.text)}</h1><div class="subline">${latest.kind === 'argument' ? '논증이 Advocacy Record에 남았습니다. 증언 사실과는 구분됩니다.' : s.phase === 'plan' ? '어떤 사실을 확보하고, 무엇을 근거로 주장할지 결정하세요.' : esc(s.witnessObservation)}</div>${history}`;
    }
    if (s.phase === 'resolved') $('#examination').innerHTML = `<div class="prompt"><b>확보한 기록은 오른쪽에서 검토할 수 있습니다.</b></div>${button('reset', '다른 전략으로 다시 신문', '기록을 새로 만들어 비교해 보세요.', true, 'stop')}`;
    else if (s.phase === 'plan') $('#examination').innerHTML = button('open-strategy', '신문 전략 선택', '목표와 다툴 쟁점을 확인합니다.');
    else $('#examination').innerHTML = `<div class="goal-heading"><div><span class="step">ESTABLISH / 사실 확보</span><h2>${esc(p.goal)}</h2></div><span class="note">자유로운 순서</span></div><div class="goal-grid">${d.goals.map(g => { const enabled = v.availability.goals.find(a => a.id === g.id).available; return `<button class="choice ${enabled ? '' : 'done'}" data-goal="${esc(g.id)}" ${enabled ? '' : 'disabled'}><b>${esc(g.title)}${enabled ? '' : ' ✓'}</b><span>${esc(g.hint)}</span></button>`; }).join('')}</div>
      <div class="lane"><h3><span class="step">SYNTHESIZE / Argument Lane</span><span class="selection-count">${s.selected.length} / ${p.max}</span></h3><p class="note">법정에서 확보한 전제 2–4개를 직접 선택하세요.</p><div class="chips">${p.premises.map(id => { const prop = d.propositions.find(x => x.id === id), a = v.availability.premises.find(x => x.id === id); return `<button class="chip" data-premise="${esc(id)}" aria-pressed="${s.selected.includes(id)}" ${a.available ? '' : 'disabled'}>${esc(prop.short)}${s.records.evidence.some(r => r.propositionId === id) ? ' ✓' : ' · 미확보'}</button>`; }).join('')}</div><div class="conclusion">${v.argument.valid ? `${s.selected.map(id => esc(d.propositions.find(x => x.id === id).short)).join(' + ')}<br>→ ${esc(p.title)}` : '<span class="empty-lane">선택한 사실을 하나의 논증으로 연결합니다.</span>'}</div></div>
      <p class="note" id="pressureHint">${esc(pressureLabels[v.pressure.kind])}</p><div class="decisions">${button('stop', '기록만 남기고 종료', '추가 노출 없이 보존 · 새 논증/인정 없음', v.availability.stop, 'stop')}${button('press', '증인에게 압박', '성공하면 직접 인정 · 실패하면 반대 기록', v.availability.press, 'risk')}${button('frame', '논증으로 정리', '변론에 재사용 · 공개 입장이 남습니다.', v.availability.frame)}</div><p class="note">${strategy?.preferred ? '이 논증은 현재 전략의 핵심입니다.' : '이 논증은 보조적입니다. 현재 우선 쟁점은 별도로 다뤄야 합니다.'} Frame은 공개 입장을 확정하므로 전략 변경 시 그 입장을 설명해야 합니다.</p>${s.records.advocacy.some(r => r.kind === 'argument') ? '<div class="frame-confirmation">논증 보존됨 · 다른 사실을 확보하거나 신문을 마칠 수 있습니다.</div>' : ''}`;
    const records = s.records.evidence.map(r => { const prop = d.propositions.find(x => x.id === r.propositionId), qualified = v.assessment.qualifiedCounterRefs.includes(r.id); const routes = v.availability.counters.filter(c => c.target === prop.id && c.visible); return `<div class="record-item ${prop.side === 'counter' ? 'counter' : ''}"><b>${esc(prop.short)}${prop.side === 'counter' ? ' · 반대 기록' : ''}${qualified ? ' · 의미 제한됨' : ''}</b>${esc(prop.text)}<details data-detail="${esc(r.id)}"><summary>증언과 출처</summary>${esc(r.testimony)}<small>${esc(d.witnesses.find(w => w.id === r.witnessId).name)}${r.basis.length ? ' · ' + r.basis.map(id => esc(d.evidence.find(e => e.id === id).title)).join(', ') : ''}${r.qualifiesRecordId ? ' · 원 반대 기록 및 최초 진술에 연결됨' : ''}</small></details>${routes.map(c => `<button class="plain counter-action" data-counter="${esc(c.id)}" ${c.available ? '' : 'disabled'}>${c.completed ? '반박 기록됨' : esc(d.counterResponses.find(x => x.id === c.id).title)}</button>${c.missing.length ? `<p class="note">필요한 전제: ${c.missing.map(id => esc(d.propositions.find(x => x.id === id).short)).join(', ')}</p>` : ''}`).join('')}</div>`; }).join('');
    $('#recordPanel').innerHTML = `<section class="section"><div class="eyebrow">법정 참여자</div><div class="participants"><div class="person"><div class="person-head"><b>${esc(d.profile.roles.factFinder)}</b></div><div class="person-state">${esc(s.judgeObservation)}</div></div><div class="person"><div class="person-head"><b>증인 · ${esc(d.witnesses[0].name)}</b></div><div class="person-state">${esc(s.witnessObservation)}</div></div></div></section>
      <div class="record-columns"><section class="section"><div class="eyebrow">Evidence Record <span class="record-count">${s.records.evidence.length}</span></div><div class="record-stack">${records || '<div class="record-empty">확보된 증언이 없습니다.<br>불리한 답변도 여기에 남습니다.</div>'}</div></section><section class="section"><div class="eyebrow">Advocacy Record <span class="record-count">${s.records.advocacy.length}</span></div><div class="record-stack">${s.records.advocacy.map(r => `<div class="record-item advocacy"><b>${r.kind === 'press' ? '결론 질문' : '논증'} · ${esc(d.argumentPlans.find(x => x.id === r.planId).title)}</b>${r.premises.map(id => esc(d.propositions.find(x => x.id === id).short)).join(' + ')}<small>${esc(d.theories.find(t => t.id === r.theoryId).title)}</small></div>`).join('') || '<div class="record-empty">논증은 증언 사실과 별도로 보존됩니다.</div>'}<details data-detail="commitments"><summary>공개 입장 (${s.commitments.length})</summary>${s.commitments.map(c => `<div class="public-position">${esc(c.text)}<br>${esc(d.theories.find(t => t.id === c.theoryId).title)}</div>`).join('') || '<p class="note">아직 공개한 논증이 없습니다.</p>'}</details><details data-detail="procedural"><summary>Procedural Record (${s.records.procedural.length})</summary><p class="note">이 시연에서는 이의·배제·명령을 생성하지 않습니다.</p></details></div></section></div><p class="note source-note">Courtroom Core v0.3 · 실험용<br>증언 기록은 객관적 진실 확정이 아닙니다.</p>`;
    $('#strategyChoices').innerHTML = d.theories.map(t => `<button class="choice" data-theory="${esc(t.id)}" ${s.theoryId === t.id ? 'disabled' : ''}><b>${esc(t.title)}</b><span>${esc(t.workingStrategy)}</span></button>`).join('');
    $('#closeStrategy').hidden = s.phase === 'plan';
    const positionNote = document.createElement('p'); positionNote.className = 'note position-status'; positionNote.textContent = positionLabels[v.assessment.strategy.positionStatus];
    $('#mobileCaseInfo').appendChild(positionNote);
    if (s.resolution) { const resultNote = positionNote.cloneNode(true); $('.result-box').appendChild(resultNote); }
    document.querySelectorAll('details[data-detail]').forEach(e => { e.open = expanded.has(e.dataset.detail); });
    if (s.phase === 'examine') updateLane(v);
    window.scrollTo(scroll.x, scroll.y); $('#recordDialog').scrollTop = scroll.record;
  }
  function run(action, payload) {
    const result = service.command(action, payload);
    if (!result.ok) { notify(result.error); return; }
    if (action === 'select') updateLane(result.view); else render();
  }
  document.addEventListener('click', event => {
    const b = event.target.closest('button'); if (!b || b.disabled) return;
    const v = service.projection();
    if (b.dataset.goal) { const g = v.case.goals.find(g => g.id === b.dataset.goal); run('establish', { id: g.id, basis: g.basis }); }
    else if (b.dataset.counter) run('counter', { id: b.dataset.counter });
    else if (b.dataset.premise) { const id = b.dataset.premise; run('select', { ids: v.state.selected.includes(id) ? v.state.selected.filter(x => x !== id) : [...v.state.selected, id] }); }
    else if (b.dataset.theory) { run('strategy', { id: b.dataset.theory }); $('#strategyDialog').close(); }
    else if (b.dataset.evidence) { const e = v.case.evidence.find(e => e.id === b.dataset.evidence); $('#evidenceTitle').textContent = e.title; $('#evidenceText').textContent = e.text; $('#evidenceDialog').showModal(); }
    else if (b.dataset.action === 'open-strategy') $('#strategyDialog').showModal();
    else if (b.dataset.action === 'open-record') { $('#recordSheet').appendChild($('#recordPanel')); $('#recordDialog').showModal(); }
    else if (b.dataset.action === 'mobile-case') { const target = $('#mobileCaseInfo'); target.querySelector('details').open = true; target.scrollIntoView({ block: 'center' }); target.focus({ preventScroll: true }); }
    else if (b.dataset.action === 'reset') { service.reset(); clearTimeout(notificationTimer); $('#notification').textContent = ''; document.querySelectorAll('dialog[open]').forEach(d => d.close()); render(); $('#strategyDialog').showModal(); }
    else if (b.dataset.action) run(b.dataset.action);
  });
  $('#closeStrategy').onclick = () => $('#strategyDialog').close();
  $('#closeEvidence').onclick = () => $('#evidenceDialog').close();
  $('#closeRecord').onclick = () => $('#recordDialog').close();
  $('#recordDialog').addEventListener('close', () => { $('.main').appendChild($('#recordPanel')); });
  $('#strategyDialog').addEventListener('cancel', event => { if (service.projection().state.phase === 'plan') event.preventDefault(); });
  render(); $('#strategyDialog').showModal();
})();

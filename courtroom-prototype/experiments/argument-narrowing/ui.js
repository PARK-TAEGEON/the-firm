(function (root) {
'use strict';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function render(t, stage, command) {
  const p = t.argumentRevision, opening = t.state.phase === 'opening';
  const closing = t.state.phase === 'trial' && t.state.cursor.part === 'closing';
  if (!opening && !closing && t.state.phase !== 'verdict') return;
  const panel = document.createElement('section');
  panel.className = 'desk'; panel.id = 'argumentRevision'; panel.setAttribute('aria-label', '내 논증 수정');
  const row = (r, select) => '<li style="margin:12px 0;overflow-wrap:anywhere">' +
    (select ? '<label><input type="checkbox" name="revisionBasis" value="' + esc(r.id) + '"> ' + esc(r.text) + '</label>' : esc(r.text)) +
    (r.qualifiedBy.length ? '<p>반론 일부 한정: 다른 낙상 경로는 검토되지 않음. 원인은 미확정.</p>' : '') +
    '<details><summary>법정 기록 보기</summary>' + r.lines.map(l => '<p>' + esc(l.text) + '</p>').join('') + '</details></li>';
  panel.innerHTML = '<h2 tabindex="-1">내 논증 · 범위 축소 실험</h2>' +
    '<p>주장 수정은 증거를 바꾸지 않습니다. 선택만으로 판결이 유리해지지 않습니다.</p>';
  if (opening) {
    panel.innerHTML += '<p>' + esc(p.strong) + '</p>' + (p.claim ? '<p>강한 주장을 공개했습니다. 최후변론 전에 기록에 맞게 좁힐 수 있습니다.</p>' :
      '<button class="btn" data-revision="claim">이 강한 주장을 공개한다</button><p>선택하지 않고 기존 모두진술로 진행할 수도 있습니다.</p>');
  } else if (!p.claim) {
    panel.innerHTML += '<p>수정할 강한 인과관계 부정 주장이 없습니다. 기존 최후변론으로 진행하세요.</p>';
  } else {
    panel.innerHTML += '<p><b>처음 주장</b> ' + esc(p.strong) + '</p>' +
      (p.revision ? '<details><summary>근거 기록 다시 살펴보기</summary>' : '') +
      '<h3>법정에서 확인된 내용</h3><p>증언·자료의 내용이며 재판부의 최종 사실인정과는 다릅니다.</p><ul>' +
      (p.facts.map(r => row(r, false)).join('') || '<li>이 실험이 연결할 확인 기록이 없습니다.</li>') + '</ul>' +
      '<h3>논증에 사용할 한계</h3><ul>' + (p.bases.map(r => row(r, closing && !p.revision)).join('') || '<li>확인된 근거 없음 — 준비 자료 확보만으로는 충분하지 않습니다.</li>') + '</ul>' +
      (p.revision ? '</details>' : '') +
      '<h3>남은 반론</h3><ul>' + (p.counters.map(r => row(r, false)).join('') || '<li>연결된 반론 기록 없음. 입증 부족이 자동으로 성립하지는 않습니다.</li>') + '</ul>';
    if (p.revision) {
      panel.innerHTML += '<h3>수정한 주장</h3><p>' + esc(p.withdrawn + ' ' + p.narrow + ' ' + p.reservation) + '</p>' +
        '<p>선택한 근거: ' + p.bases.filter(b => p.revision.basisIds.includes(b.id)).map(b => esc(b.text)).join(' / ') + '</p>' +
        '<h3>검사의 대응</h3><p>' + esc(p.response.lines[0].text) + '</p>';
      if (closing) {
        const speech = root.FirmNarrowing.closing(t.records, p.finalId);
        panel.innerHTML += '<details><summary>최후변론 미리 보기</summary><p>' + esc(speech.text) + '</p></details>' +
          '<button class="btn primary" data-revision="final">수정한 논증으로 최후변론</button>';
      } else {
        const final = t.records.find(r => r.kind === 'closing_argument');
        panel.innerHTML += '<p>' + (final?.revisionId ? '수정한 논증이 최후변론에 반영되었습니다.' : '다른 최후변론을 선택해 수정 논증을 사용하지 않았습니다.') + '</p>';
      }
    } else if (closing) {
      panel.innerHTML += '<h3>좁히면 무엇이 바뀌나</h3><p>' + esc(p.withdrawn + ' ' + p.narrow + ' ' + p.reservation) + '</p>' +
        '<label><input type="checkbox" name="revisionCounters"> 남은 반론을 인정하고 입증 충분성만 다툽니다.</label>' +
        '<p>근거를 하나 이상 고르고 남은 반론을 확인하면 수정할 수 있습니다.</p>' +
        '<p><button class="btn primary" data-revision="revise" disabled>주장 범위 축소</button></p>' +
        '<button class="btn" data-revision="retain">기존의 강한 주장으로 최후변론</button>';
    }
  }
  // Place the argument before the legacy final choices, keeping alternative closings available.
  if (closing) {
    if (p.claim) {
      const alternatives = document.createElement('details');
      alternatives.innerHTML = '<summary>다른 최후변론 선택</summary>';
      while (stage.firstChild) alternatives.append(stage.firstChild);
      stage.append(alternatives);
    }
    stage.prepend(panel);
  } else stage.append(panel);
  panel.addEventListener('change', () => {
    const revise = panel.querySelector('[data-revision=revise]');
    if (revise) revise.disabled = !panel.querySelector('[name=revisionBasis]:checked') || !panel.querySelector('[name=revisionCounters]').checked;
  });
  panel.addEventListener('click', event => {
    const action = event.target.closest('[data-revision]')?.dataset.revision;
    if (!action) return;
    if (action === 'claim') command('commitCauseClaim');
    if (action === 'revise') command('narrowArgument', {
      basisIds: [...panel.querySelectorAll('[name=revisionBasis]:checked')].map(x => x.value),
      acknowledgeCounters: panel.querySelector('[name=revisionCounters]').checked
    });
    if (action === 'final' || action === 'retain') command('closingArgument', { id: action === 'final' ? p.finalId : p.retainId });
    document.querySelector('#argumentRevision h2')?.focus({ preventScroll: true });
  });
}
root.FirmNarrowingUI = { render };
})(window);

(function (root) {
'use strict';
// Local presentation state only. No service commands or trial records.
const dialog = document.querySelector('#consultation');
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let scene, index = 0, all = false, onFinish = null;

function portrait(person) {
  const url = root.FirmDemoPortraits.byId[person.id] || root.FirmDemoPortraits.default;
  return '<span class="scene-portrait" aria-hidden="true"><span>' + esc(person.initial) + '</span>' +
    (url ? '<img src="' + esc(url) + '" alt="">' : '') + '</span>';
}
function lineMarkup(line) {
  const person = scene.speakers.find(p => p.id === line.speaker);
  return portrait(person) + '<span class="scene-utterance"><b>' + esc(person.name) + '</b><small>' + esc(person.detail) + '</small><span>' + esc(line.text) + '</span></span>';
}
function render(focus) {
  const location = root.FirmDemoLocations.find(l => l.key === scene.location);
  dialog.classList.toggle('has-photo', !!(location && location.image));
  const finished = all || index === scene.lines.length - 1;
  dialog.innerHTML = (location && location.image ? '<img class="scene-photo" src="' + esc(location.image) + '" alt="">' : '') +
    '<div class="scene-shade" aria-hidden="true"></div><div class="scene-layout"><header><span class="scene-location">' + esc(location ? location.label : scene.location) +
    '</span><h1 id="consultationTitle" tabindex="-1">첫 상담</h1></header><div class="scene-dock">' +
    '<div class="scene-controls"><span>' + (all ? '상담 대화' : (index + 1) + ' / ' + scene.lines.length) + '</span>' +
    (all ? '' : '<button class="btn quiet" data-scene="all">전체 보기</button>') + '</div>' +
    (all ? '<ol class="scene-transcript">' + scene.lines.map(l => '<li>' + lineMarkup(l) + '</li>').join('') + '</ol>' :
      '<div class="scene-speech">' + lineMarkup(scene.lines[index]) + '</div>') +
    (finished ? '<div class="scene-tasks"><h2>이제 할 일</h2><ul>' + scene.tasks.map(t => '<li>' + esc(t) + '</li>').join('') +
      '</ul><button class="btn primary" data-scene="finish">사건 파일 열기</button></div>' : '<div class="scene-next"><button class="btn primary" data-scene="next">계속 ▸</button></div>') + '</div></div>';
  // Missing optional art falls back to the compact location / initial without affecting play.
  dialog.querySelectorAll('img').forEach(img => img.addEventListener('error', () => { if (img.classList.contains('scene-photo')) dialog.classList.remove('has-photo'); img.remove(); }, { once: true }));
  if (focus) dialog.querySelector(finished ? '[data-scene=finish]' : '[data-scene=next]').focus({ preventScroll: true });
}
function next() {
  if (!all && index < scene.lines.length - 1) { index++; render(true); }
}
dialog.addEventListener('click', e => {
  const button = e.target.closest('[data-scene]');
  if (!button || button.disabled) return;
  if (button.dataset.scene === 'next') next();
  if (button.dataset.scene === 'all') { all = true; render(false); dialog.querySelector('#consultationTitle').focus(); }
  if (button.dataset.scene === 'finish') dialog.close();
});
dialog.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.repeat) { e.preventDefault(); return; }
  if (e.key === 'Enter' && !e.target.closest('button')) { e.preventDefault(); next(); }
});
dialog.addEventListener('cancel', e => e.preventDefault());
dialog.addEventListener('close', () => {
  const finish = onFinish; onFinish = null;
  if (finish) finish();
  else document.querySelector('#phaseTitle').focus({ preventScroll: true });
});
root.FirmDemoConsultation = { open(data, finish) {
  onFinish = finish; scene = data; index = 0; all = false; render(false); dialog.showModal();
  dialog.querySelector('[data-scene=next]').focus();
} };
})(window);

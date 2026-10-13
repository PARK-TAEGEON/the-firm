(function () {
'use strict';
// A compact presentation for the existing case-backed engine and approved plan.
// All hearings are executed by FirmPlanDemo.play; this file only renders its record.
const root = document.getElementById('app');
let page = 'plan', editing = false, useLayout = true, beforeEdit = true;
let report = null, error = '';
const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const txt = x => esc(x);
const witnessNames = { DEFENSE:'변호인', PROSECUTOR:'검사', JUDGE:'재판장',
  W_SIG_OBSERVER:'한지수', W_SIG_INVESTIGATOR:'서동국', CLIENT:'정민호' };
const records = () => report ? report.records : [];
const find = (kind, id) => records().find(r => r.kind === kind && (!id || r.refId === id));
const fromSpeaker = (r, speaker) => r ? (r.lines || []).find(x => x.speaker === speaker)?.text : null;
const witnessAnswer = r => r ? (r.lines || []).find(x => x.speaker === 'W_SIG_INVESTIGATOR')?.text || r.memo || '' : '';
const titleBar = () => '<header class="mast"><div><div class="brand">THE <span>FIRM</span></div><div class="meta">변론 계획 · 자동 법정 실행 실험</div></div><div class="meta">정민호 / 상해 사건<br>실험용 별도 화면</div></header>'
  + '<ol class="steps">'+[['plan','계획 검토'],['court','법정 진행'],['record','기록 확인']].map(([id,name],i)=>
    '<li class="'+(page===id?'active':(['plan','court','record'].indexOf(page)>i?'past':''))+'"'+(page===id?' aria-current="step"':'')+'>'+(i+1)+'. '+name+'</li>').join('')+'</ol>';
const button = (text,action,style='')=>'<button type="button" class="btn '+style+'" data-action="'+action+'">'+text+'</button>';
const header = (kicker,title,sub,tag) => '<div class="headline"><div><div class="eyebrow">'+esc(kicker)+'</div><h1>'+esc(title)+'</h1><div class="sub">'+esc(sub)+'</div></div>'+(tag?'<span class="pill">'+esc(tag)+'</span>':'')+'</div>';
function plan() {
 const proposed = useLayout ? '수사관의 현장 조사 범위를 확인하는 대응 준비' : '이번 계획에서 제외';
 return header('PREPARATION / 01','상해 인과관계 · 변론 계획','내부 계획. 법원이나 검찰에 그대로 공개되지 않습니다.', '초안 검토')
 + '<div class="columns">'
 + '<section class="panel"><div class="panel-head"><h2><span class="icon">§</span> 법률 검토</h2><span class="tag">읽기</span></div>'
 + '<div class="claim">검찰은 밀침 때문에 피해자가 넘어져 손목을 다쳤다고 주장합니다.</div>'
 + '<div class="section"><h3>담당 변호사의 검토</h3><p class="info-line">의뢰인은 재면담에서 <strong>어깨를 한 번 민 사실</strong>을 인정했습니다.</p>'
 + '<p class="info-line">다만 밀침과 손목 상해 사이의 경위는 확보된 자료를 따져봐야 합니다.</p></div>'
 + '<div class="section"><h3>관련 자료</h3>'
 + '<div class="evidence"><b>연속 영상</b><p>피해자가 다시 선 뒤 가림막 뒤로 이동. 낙상은 화면 밖.</p></div>'
 + '<div class="evidence"><b>진료기록</b><p>손목 타박상 기록. 별도의 상해 원인 감정 없음.</p></div>'
 + '<div class="evidence"><b>현장 동선 조사</b><p>가림막 뒤 운반대 및 바퀴 자국. 이것만으로 원인 확정 불가.</p></div>'
 + '</div></section>'
 + '<section class="panel"><div class="panel-head"><h2><span class="icon">▤</span> 변론 계획</h2><span class="tag">검토 · 수정</span></div>'
 + '<div class="section"><h3>법정 입장</h3><p class="info-line"><strong>밀침 인정 · 상해와의 연결 다툼</strong></p></div>'
 + '<div class="section"><h3>담당 변호사의 기본 계획</h3>'
 + '<div class="plan-row"><span class="static-mark">✓</span><div><div class="row-title">연속 영상</div><div class="row-note">자세 회복과 낙상 미촬영 구간 확인</div></div></div>'
 + '<div class="plan-row"><span class="static-mark">✓</span><div><div class="row-title">진료기록</div><div class="row-note">손상 기록과 원인 감정 여부 확인</div></div></div>'
 + '<div class="plan-row"><span class="static-mark">'+(useLayout?'✓':'−')+'</span><div><div class="row-title">현장 동선</div><div class="row-note">'+esc(proposed)+'</div></div><span class="status">'+(useLayout?'준비':'제외')+'</span></div>'
 + '</div>'
 + (editing ? '<div class="edit-zone"><h3>현장 동선 대응 수정</h3><label class="checkbox-label"><input type="checkbox" id="layout-toggle" '+(useLayout?'checked':'')+'>검찰의 수습에 대비해 현장 동선 자료 사용</label>'
   + '<p class="edit-note">'+(useLayout?'해당 신문 기회가 오면 기존 자료로 조사 범위를 확인합니다.':'기본 영상·진료 신문은 그대로 유지합니다.')+'</p>'
   + '<div class="controls">'+button('수정 취소','cancel-edit')+button('수정 완료','save-edit','primary')+'</div></div>'
   : '<div class="controls">'+button('부분 수정','edit')+button('기본 계획 승인','approve','primary')+'</div>')
 + '</section></div>'
 + '<div class="note"><strong>실행 미리보기</strong><p>서동국 수사관에게 영상·진료자료의 설명 범위를 확인합니다. '+(useLayout?'검찰이 경위를 보강하는 경우 현장 동선으로 대응합니다.':'현장 동선에 관한 별도 대응은 하지 않습니다.')+'</p></div>';
}
function speech(r, speaker) {
 const line = fromSpeaker(r,speaker);
 return line ? '<div class="quote"><div class="who">'+esc(witnessNames[speaker]||speaker)+'</div><p>'+txt(line)+'</p></div>' : '';
}
function court() {
 const opener = find('opening'), video = report.results.video.record, medical = report.results.medical.record;
 const layout = report.results.layout.record;
 const obs = records().find(r => r.witnessId==='W_SIG_OBSERVER' && r.kind==='direct');
 const redirect = records().find(r => r.kind==='redirect' && r.witnessId==='W_SIG_INVESTIGATOR');
 const closing = find('closing_argument');
 const q = report.outcome?.judgment?.label || report.outcome?.key || '선고 기록 생성';
 const bits = [
   ['01','모두진술','밀침은 인정하고 손목 상해와의 연결을 다툰다.',speech(opener,'DEFENSE')],
   ['02','목격자 한지수','기존 목격 진술에 대한 주신문을 진행했다.',speech(obs,'W_SIG_OBSERVER')],
   ['03','수사관 서동국','영상과 진료기록에 관한 준비된 신문을 수행했다.',
      speech(video,'W_SIG_INVESTIGATOR')+speech(medical,'W_SIG_INVESTIGATOR')],
   ['04','검찰의 대응과 종결','검찰의 재주신문과 준비한 후속 대응을 진행했다.',
      speech(redirect,'W_SIG_INVESTIGATOR')+(layout?speech(layout,'W_SIG_INVESTIGATOR'):'')
        +(closing?speech(closing,'DEFENSE'):'')]
 ];
 return header('HEARING / 02','공판 진행','승인한 내부 계획에 따라 기존 사건 서비스가 법정 절차를 실행했습니다.','자동 수행')
 + '<div class="court-banner"><h2>수사관 신문 · 자동 수행 완료</h2><p>연속 영상과 진료기록 확인'+(report.plan.useLayout?' · 현장 동선 대응 계획 포함':' · 현장 동선 대응 제외')+'</p></div>'
 + '<div class="timeline">'+bits.map(([number,name,summary,quotes])=>'<article class="court-block"><div class="step-label">COURT '+number+'</div><h3>'+esc(name)+'</h3><p>'+esc(summary)+'</p>'+quotes+'</article>').join('')+'</div>'
 + '<details class="full-record"><summary>전체 법정 발언 펼치기</summary><div class="transcript">'
 + records().flatMap(r=>(r.lines||[]).map(l=>'<div class="utterance"><span class="speaker">'+txt(witnessNames[l.speaker]||l.speaker)+'</span><span>'+txt(l.text)+'</span></div>')).join('')
 + '</div></details>'
 + '<div class="controls">'+button('실제 실행 기록 확인','show-record','primary')+'</div>'
 + '<div class="note"><strong>기존 데모의 실험 판정: '+txt(q)+'</strong><p>판결 판단과 변론 계획의 실행 여부는 별개입니다. 원본 데모의 간이 법률·양형 규칙을 사용했습니다.</p></div>';
}
function recordItem(label, r, isDone, planned) {
 const tag = isDone ? '신문 수행' : planned ? '실행 불가 / 기회 없음' : '미실행';
 const ans = isDone ? witnessAnswer(r) : planned ? '해당 계획에 따른 답변은 기록되지 않았습니다.' : '이번 변론 계획에 포함되지 않았습니다.';
 return '<div class="record-line"><h3><span class="'+(isDone?'mark':'mutedmark')+'">'+(isDone?'✓':'−')+'</span>'+esc(label)+' · '+tag+'</h3>'
 + '<p>'+txt(ans)+'</p></div>';
}
function record() {
 const video = report.results.video, medical=report.results.medical, layout=report.results.layout;
 const rec = records().find(r=>r.kind==='redirect' && r.witnessId==='W_SIG_INVESTIGATOR');
 const prosecution = (layout.record && (layout.record.lines||[]).find(l=>l.speaker==='PROSECUTOR')?.text)
   || fromSpeaker(rec,'PROSECUTOR') || rec?.memo || '검찰의 기존 주장은 남아 있습니다.';
 const decision = report.outcome?.judgment?.label || report.outcome?.key || '판결 기록';
 return header('COURT RECORD / 03','법정 기록','서동국 수사관 · 상해 인과관계', '신문 종료')
 + '<div class="record-grid">'
 + '<section class="panel"><div class="panel-head"><h2>실행 기록</h2></div>'
 + recordItem('연속 영상', video.record, video.performed, true)
 + recordItem('진료기록',medical.record,medical.performed,true)
 + recordItem('현장 동선',layout.record,layout.performed,report.plan.useLayout)
 + '</section>'
 + '<section class="panel"><div class="panel-head"><h2>상대 대응 · 판단</h2></div>'
 + '<div class="prosecution"><h3>검찰 반론</h3><p>'+txt(prosecution)+'</p></div>'
 + '<div class="verdict"><div class="label">원본 데모 판정 · 별도 단계</div><strong>'+txt(decision)+'</strong>'
 + '<div class="smallprint">신문을 수행했다는 표시가 곧 법원의 사실 인정을 뜻하지 않습니다.</div></div>'
 + '</section></div>'
 + '<div class="controls">'+button('반대 계획으로 다시 비교','flip','primary')+button('현재 계획 다시 보기','restart')+'</div>';
}
function render() {
 root.innerHTML = '<main class="shell">'+titleBar()+(error?'<div role="alert" class="error">'+txt(error)+'</div>':'')
  +(page==='plan'?plan():page==='court'?court():record())
  +'<footer class="footer">PLAN-DEMO-001 · 기존 DEMO-001 사건과 공판 엔진 기반 실험. 원본 사건·판정 로직 미수정.</footer></main>';
}
root.addEventListener('click', e => {
 const act = e.target.closest('button[data-action]')?.dataset.action;
 if (!act) return;
 error = '';
 try {
   if(act==='edit'){beforeEdit=useLayout;editing=true;}
   if(act==='cancel-edit'){useLayout=beforeEdit;editing=false;}
   if(act==='save-edit'){editing=false;}
   if(act==='approve'){report=window.FirmPlanDemo.play({useLayout});page='court';}
   if(act==='show-record'){page='record';}
   if(act==='flip'){useLayout=!report.plan.useLayout;editing=false;report=null;page='plan';}
   if(act==='restart'){useLayout=report.plan.useLayout;editing=false;report=null;page='plan';}
 } catch(ex){ error=ex.message; page='plan';report=null; }
 render();
 if(act==='approve'||act==='show-record'||act==='flip'||act==='restart')window.scrollTo(0,0);
});
root.addEventListener('change',e=>{
 if(e.target?.id==='layout-toggle'){useLayout=!!e.target.checked;render();}
});
render();
})();

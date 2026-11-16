'use strict';
const F=window.TF_FIXTURE,root=document.querySelector('#app');
const params=new URLSearchParams(location.search),variant=document.body.dataset.variant||'A';
const stages=['consultation','plan','court','record'],stageNames=['첫 상담','계획 검토','법정 진행','기록 확인'];
let stage=stages.includes(params.get('stage'))?params.get('stage'):'consultation';
let line=0,all=false,editing=false,useLayout=params.get('path')!=='excluded',draft=useLayout,replay=false;
const names={A:'사건철',B:'법정 장면',C:'업무 화면'};
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(text,act,cls='')=>'<button class="'+cls+'" type="button" data-action="'+act+'">'+text+'</button>';
const report=()=>F.reports[useLayout?'included':'excluded'];
const rec=id=>report().records.find(r=>r.id===id);
const cite=(text,body)=>'<details class="source"><summary>'+text+'</summary><div class="source-body">'+body+'</div></details>';
const origin=(file,id)=>'<p class="provenance">출처 · <a target="_blank" rel="noopener" href="https://github.com/PARK-TAEGEON/the-firm/blob/'+F.baseline+'/courtroom-prototype/'+file+'">'+E(file)+'</a>'+(id?' · '+E(id):'')+'</p>';
const card=(id)=>F.cards.find(c=>c.id===id);
const cardSource=(id)=>{const c=card(id);return cite('자료 원문 읽기', '<blockquote>'+E(c.text)+'</blockquote>'+origin('data/demo-separated-moments.js',id))};
const smallSource=r=>origin('services/plan-demo.js',r.id+' · '+r.kind);
function speech(l,r){
 const role=l.speaker==='PROSECUTOR'?'opponent':l.speaker==='JUDGE'?'judicial':l.speaker==='DEFENSE'?'counsel':'witness';
 return '<article class="speech '+role+'"><div class="speaker"><span class="role-symbol">'+({opponent:'↳',judicial:'§',counsel:'—',witness:'“'}[role])+'</span>'+E(F.speakers[l.speaker]||l.speaker)+'</div><blockquote>'+E(l.text)+'</blockquote>'+(r?'<small>기록 '+r.seq+' · '+E(r.kind==='rebuttal'?'재반대신문':r.kind==='redirect'?'재주신문':r.kind==='approach'?'반대신문':r.kind)+'</small>':'')+'</article>';
}
function transcript(r){return (r.lines||[]).map(l=>speech(l,r)).join('')+smallSource(r)}
function verdict(){
 const o=report().outcome;
 return '<section class="judgment"><div class="eyebrow">§ 법원의 판단 · 원본 데모 판정</div><h2>'+E(o.headline)+'</h2><p>'+E(o.text)+'</p>'+cite('주문과 쟁점별 판단', '<blockquote>'+E(o.pronouncement)+'</blockquote>'+o.issues.map(i=>'<p><b>'+E(i.title)+' · '+E(i.bandLabel)+'</b><br>'+E(i.memo)+'</p>').join('')+origin('services/demo-outcome.js','report.outcome'))+'<small>'+E(o.sentence.disclaimer)+' · '+E(o.sentence.premise)+'</small></section>';
}
function consult(){
 const lines=F.consultation.lines,l=lines[line],name=F.speakers[l.speaker];
 return '<div class="content consultation-layout"><section class="interview-visual"><div class="location">사무실 회의실 · 첫 만남</div><img class="portrait" src="../../../../../courtroom-prototype/assets/portraits/default.svg" alt="기존 의뢰인 기본 실루엣"><div class="person-caption"><span>CLIENT</span><h2>정민호</h2><p>38세 · 프리랜서 영상 편집자</p></div></section><section class="interview-copy"><div class="eyebrow">사건의 시작</div><h2>그날의 이야기를<br>먼저 듣습니다.</h2><div class="interview-line"><span class="counter">'+String(line+1).padStart(2,'0')+' / 08</span><h3>'+E(name)+'</h3><blockquote>'+E(l.text)+'</blockquote></div><div class="actions">'+btn(line===7?'계획 검토로':'다음 대사 →','next','primary')+btn(all?'순차 보기':'전체 보기','all','quiet')+'</div>'+cite('상담 출처',origin('data/demo-separated-moments.js','presentation.consultation.lines · 원본 8개'))+'<p class="support">진술은 의뢰인의 말입니다. 사실 인정이나 법원의 판단과 구별합니다.</p></section></div>'+(all?'<section class="full-consultation panel"><div class="eyebrow">상담 전문 · 원문 8개</div>'+lines.map(l=>speech(l)).join('')+btn(replay?'계획으로 돌아가기':'상담을 마치고 계획 검토','finish','primary')+'</section>':'');
}
function plan(){
 const state=editing?draft:useLayout;
 return '<div class="action-bar'+(editing?' editing':'')+'"><div><span class="scope-label">내부 계획 · 외부 비공개</span><p>재면담과 기존 자료 검토를 마친 시점입니다.</p></div><div class="actions">'+btn('상담 다시 보기','replay','quiet')+(editing?btn('수정 취소','cancel')+btn('수정 저장','save','primary'):btn('부분 수정','edit')+btn('이 계획 승인','approve','primary'))+'</div></div><div class="content plan-layout"><section class="legal panel"><div class="eyebrow">01 / 법률 검토</div><h2>밀침과 상해 사이,<br> 무엇이 확인되었나</h2><p class="lead">밀침은 인정합니다.<br> 손목 상해와의 연결은 다툽니다.</p><div class="opposition-summary"><b>검찰의 주장</b><p>밀침 때문에 피해자가 넘어져 손목을 다쳤다는 주장입니다.</p></div><div class="source-card"><h3>의뢰인 재면담</h3><p>어깨를 한 번 민 사실을 인정했습니다. 상해의 원인까지 인정한 것은 아닙니다.</p>'+cardSource('CARD_SIG_CONTACT')+'</div><div class="scope-note">두 쟁점 · 밀침 / 상해와의 연결</div></section><section class="plan-body panel"><div class="eyebrow">02 / 담당 변호사의 기본 계획</div><h2>자료가 말하는 범위를 묻습니다.</h2><div class="plan-row"><span class="ordinal">01</span><div><h3>연속 영상</h3><p>자세 회복과 낙상 미촬영 구간 확인</p><span class="state planned">계획 포함 · 아직 미수행</span>'+cardSource('CARD_SIG_SEQUENCE')+'</div></div><div class="plan-row"><span class="ordinal">02</span><div><h3>진료기록</h3><p>손상 기록과 원인 감정 여부 확인</p><span class="state planned">계획 포함 · 아직 미수행</span>'+cardSource('CARD_SIG_MEDICAL')+'</div></div><div class="plan-row optional"><span class="ordinal">03</span><div><h3>현장 동선 대응</h3><p>검찰의 재주신문 뒤, 현장 조사 범위를 확인</p><span class="state '+(state?'planned':'absent')+'">'+(state?'계획 포함 · 기회가 있을 때 수행':'계획 제외 · 미실행 예정')+'</span>'+(editing?'<label class="edit-choice"><input id="layout" type="checkbox" '+(draft?'checked':'')+'> 현장 동선 대응을 계획에 포함</label>':'')+cardSource('CARD_SIG_LAYOUT')+'</div></div><p class="support">내부 승인은 외부 제출이나 법정 발언이 아닙니다. 수행 여부와 답변은 법정 기록에서 확인합니다.</p></section></div>';
}
function court(){
 const r=report(),medical=rec(r.results.medical.recordId),video=rec(r.results.video.recordId),layout=rec(r.results.layout.recordId);
 const redirect=r.records.find(x=>x.kind==='redirect'&&x.witnessId==='W_SIG_INVESTIGATOR');
 return '<div class="action-bar"><div><span class="scope-label">완료된 공판 기록 재생</span><p>진료기록 → 연속 영상 → 검찰 재주신문'+(layout?' → 현장 동선':'')+'</p></div>'+btn('기록과 판단 확인 →','record','primary')+'</div><div class="content court-layout"><aside class="case-rail panel"><div class="eyebrow">이번 신문</div><img class="witness-portrait" src="../../../../../courtroom-prototype/assets/portraits/default.svg" alt="기존 인물 기본 실루엣"><h2>서동국</h2><p>담당 수사관 · 증인</p><hr><h3>승인한 계획</h3><p>밀침 인정<br>상해와의 연결 다툼</p><span class="state planned">현장 동선 '+(useLayout?'계획 포함':'계획 제외')+'</span>'+cite('내 계획과 근거', '<p>영상·진료자료 기본 신문, '+(useLayout?'현장 동선 대응 포함':'현장 동선 대응 제외')+'</p>'+cardSource('CARD_SIG_SEQUENCE')+cardSource('CARD_SIG_MEDICAL'))+'</aside><section class="court-main"><div class="scene-label"><span>공판 기록</span><span>서동국 · 반대신문</span></div>'+speech(medical.lines[0],medical)+speech(medical.lines[1],medical)+speech(video.lines[0],video)+speech(video.lines[1],video)+'<details class="panel exchange"><summary>검찰 재주신문'+(layout?'과 현장 동선 대응':' · 현장 동선은 미실행')+'</summary>'+transcript(redirect)+(layout?transcript(layout):'<p class="state absent">현장 동선 · 계획 제외로 미실행</p>')+'</details></section></div><details class="panel transcript"><summary>전체 법정 발언 · 기록 순서대로</summary>'+r.records.filter(x=>x.lines.length).map(transcript).join('')+'</details>';
}
function record(){
 const r=report(),layout=rec(r.results.layout.recordId),redirect=r.records.find(x=>x.kind==='redirect'&&x.witnessId==='W_SIG_INVESTIGATOR'),opp=layout||redirect;
 const opplines=opp.lines.filter(l=>l.speaker==='PROSECUTOR');
 return '<div class="action-bar"><div><span class="scope-label">실행 기록 / 진술 / 판단</span><p>신문 수행 표시는 유리한 결과나 사실 인정을 뜻하지 않습니다.</p></div><div class="actions">'+btn('전체 발언 보기','court')+btn('현재 계획 다시 보기','plan','primary')+'</div></div><div class="content record-layout"><section class="record-body panel"><div class="eyebrow">01 / 무엇을 했고, 어떤 답을 받았나</div><h2>계획이 남긴 실제 기록</h2>'+[['medical','진료기록'],['video','연속 영상'],['layout','현장 동선']].map(([k,title])=>{const x=r.results[k],record=rec(x.recordId),planned=k!=='layout'||useLayout;return '<article class="record-row"><div class="record-row-head"><h3>'+title+'</h3><span class="state '+(x.performed?'performed':'absent')+'">'+(x.performed?'신문 수행':planned?'실행 불가 / 기회 없음':'미실행')+'</span></div><small>계획 · '+(planned?'포함':'제외')+'</small>'+(record?'<blockquote><span class="quote-name">서동국의 답변</span>'+E(record.lines.find(l=>l.speaker==='W_SIG_INVESTIGATOR').text)+'</blockquote>'+cite('질문·답변 원문과 출처',transcript(record)):'<p>'+(planned?'계획에는 포함되었지만 해당 답변은 기록되지 않았습니다.':'이번 계획에서 제외되어 해당 답변이 기록되지 않았습니다.')+'</p>')+'</article>'}).join('')+'</section><aside class="result-column"><section class="opponent-card panel"><div class="eyebrow">02 / 상대가 다투는 부분</div><h2>검찰 반론</h2>'+opplines.map(l=>'<blockquote>'+E(l.text)+'</blockquote>').join('')+cite('앞뒤 발언과 출처',transcript(opp))+'</section>'+verdict()+'</aside></div>';
}
function go(next){stage=next;editing=false;all=false;line=0;render(true);window.scrollTo(0,0)}
function render(focus=false){
 const i=stages.indexOf(stage),titles=['의뢰인의 말에서 시작하다','변론의 방향을 검토하다','말과 답변을 따라가다','수행과 판단을 나누어 읽다'];
 document.title=names[variant]+' · '+stageNames[i]+' | THE FIRM';
 root.innerHTML='<div class="prototype-bar"><a href="../../index.html">← 세 안 비교</a><span>'+variant+' · '+names[variant]+' / v1.0.0</span><span>디자인 목업 · 고정 fixture</span></div><div class="workspace"><header class="brand-header"><a class="brand" href="?stage=consultation">THE <b>FIRM</b><span>법률사무소</span></a><div class="case-name">정민호 사건<span>상해 · 기존 두 쟁점</span></div><a class="system-link" href="../../components.html?variant='+variant+'">디자인 시스템 ↗</a></header><nav class="step-nav" aria-label="사건 단계">'+stages.map((s,n)=>'<button type="button" data-stage="'+s+'" '+(s===stage?'aria-current="step"':'')+'><span>'+String(n+1).padStart(2,'0')+'</span>'+stageNames[n]+'</button>').join('')+'</nav><main><header class="page-header"><div><div class="eyebrow">THE FIRM / '+String(i+1).padStart(2,'0')+'</div><h1 id="page-title" tabindex="-1">'+titles[i]+'</h1></div><span class="chapter-mark">'+String(i+1).padStart(2,'0')+'</span></header>'+(stage==='consultation'?consult():stage==='plan'?plan():stage==='court'?court():record())+'<footer><span>TF–UI–001 · '+variant+' / '+stageNames[i]+'</span><span>공개 고정 데이터 · 기준 d6fa4a3 · 실제 게임 실행 없음</span></footer></main></div><div id="announcement" class="sr-only" aria-live="polite"></div>';
 if(focus)document.querySelector('#page-title').focus({preventScroll:true});
}
root.addEventListener('click',e=>{
 const s=e.target.closest('[data-stage]')?.dataset.stage;
 if(s){go(s);return}
 const a=e.target.closest('[data-action]')?.dataset.action;if(!a)return;
 if(a==='next'){if(line<7){line++;render();document.querySelector('[data-action=next]').focus();document.querySelector('#announcement').textContent=F.consultation.lines[line].text}else go('plan')}
 if(a==='all'){all=!all;render();document.querySelector('[data-action=all]').focus()}
 if(a==='finish')go('plan');
 if(a==='replay'){replay=true;go('consultation')}
 if(a==='edit'){editing=true;draft=useLayout;render();document.querySelector('#layout').scrollIntoView({block:'center'});document.querySelector('#layout').focus({preventScroll:true})}
 if(a==='cancel'){editing=false;render();document.querySelector('[data-action=edit]').focus()}
 if(a==='save'){useLayout=draft;editing=false;render();document.querySelector('[data-action=edit]').focus()}
 if(a==='approve')go('court'); // Switches between pre-exported fixtures; no execution.
 if(['court','record','plan'].includes(a))go(a);
});
root.addEventListener('change',e=>{if(e.target.id==='layout'){draft=e.target.checked;render();document.querySelector('#layout').focus()}});
render();

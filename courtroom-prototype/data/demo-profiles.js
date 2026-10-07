(function (root) {
'use strict';
// Authored fictional presentation only. Never imported by judgment or NPC behavior.
const portrait = 'assets/portraits/default.svg';
const profiles = [
  { id:'novice', name:'윤가람', role:'신참 검사', org:'지방검찰청 공판부', years:'임용 1년차', reputation:1.5, portrait,
    history:[{when:'임용 전',text:'법학전문대학원을 졸업했다.'},{when:'임용',text:'검사로 임용되어 실무 교육을 받았다.'},{when:'현재',text:'공판부에 배치되어 단독 사건을 여러 건 맡고 있다.'}],
    style:['기록을 성실히 읽지만 증인 사전 준비는 아직 얕다는 평','변호인 질문에 이의를 잘 하지 않는다'] },
  { id:'veteran', name:'최형석', role:'노련한 공판검사', org:'지방검찰청 공판부', years:'공판 전담 10년차', reputation:3.5, portrait,
    history:[{when:'초임',text:'검사로 임용되어 형사 사건을 맡았다.'},{when:'공판 전담 배치',text:'증인신문과 법정 증거 정리를 주로 담당하기 시작했다.'},{when:'현재',text:'공판부에서 다툼이 있는 단독 사건을 꾸준히 맡고 있다.'}],
    style:['증인에게 본 것과 들은 것을 미리 나눠 말하게 한다는 평','근거 없는 추궁에는 곧바로 이의한다','변호인이 미리 낸 자료는 반드시 대비해 온다'] },
  { id:'JUDGE', name:'문혜진', role:'단독 판사', org:'지방법원 형사단독', years:'법관 12년차', reputation:3, portrait,
    history:[{when:'임관',text:'법관으로 임관해 재판 실무를 익혔다.'},{when:'형사재판 담당',text:'증인 진술과 서류 증거가 엇갈리는 사건을 맡아 왔다.'},{when:'현재',text:'형사단독 재판부에서 심리와 선고를 담당한다.'}],
    style:['증거와 판단을 구분하고 근거가 기록에 남았는지 살핀다는 평','근거 없는 이의와 다툴 이유 없는 부동의에 엄격하다','상해 사건에서 피해 회복 노력을 양형에 반영한다는 평'] }
];
if (typeof module !== 'undefined' && module.exports) module.exports = profiles;
else root.FirmDemoProfiles = profiles;
})(typeof globalThis !== 'undefined' ? globalThis : this);

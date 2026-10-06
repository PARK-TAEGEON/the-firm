'use strict';
const rows = require('./catalog-data.json');
const { createRng, seedFor } = require('../core/rng');
const settings = [
  [['달우림 소극장', '해솔 문화창고', '물든마루 공연장'], ['순회 공연 동료', '장비 공동 대여자', '축제 스태프 동료'], [45, 70, 110]],
  [['별꽃 사진 동호회', '달빛 장비 장터', '새물 촬영 모임'], ['동호회 회원', '이전 거래 상대', '지인의 소개로 만난 사이'], [32, 68, 95]],
  [['솔결 가구공방', '모래빛 인쇄소', '푸른실 봉제공방'], ['창업 때부터 일한 동료', '전 직장 선후배', '협력업체에서 옮겨 온 직원과 대표'], [240, 380, 620]],
  [['느린책 독서모임', '별이든 책방 모임', '물소리 낭독회'], ['공동구매 담당 동료', '모임 운영진', '오래된 독서 친구'], [18, 35, 52]],
  [['느티골 시장길', '하늘못 상가 앞', '가온뜰 골목'], ['서로 모르는 사이', '이웃 가게 직원', '단골 배달처의 이웃'], [75, 120, 180]],
  [['연두빌라', '물결주택', '달고개 다세대주택'], ['지난 전시의 협업자', '소품을 빌려 준 이웃', '행사 운영 동료'], [25, 60, 85]],
  [['은빛 공유작업실', '새잎 제작소', '돌담 창작실'], ['작업실 공동 운영자', '납품 담당 동료', '장비 관리 교대자'], [55, 90, 140]],
  [['잔솔 수선공방', '구름실 작업장', '꽃비 의상실'], ['이전 점검에서 만난 사이', '이번에 처음 만난 사이', '보완 서류를 주고받은 사이'], [80, 160, 230]]
];
function settingFor(id, seed) {
  const row = settings[rows.findIndex(r => r.id === id)];
  const rng = createRng(seedFor(seed, id + ':scene'));
  const pick = a => a[Math.floor(rng() * a.length)];
  return { place: pick(row[0]), relation: pick(row[1]), amount: pick(row[2]),
    date: `9월 ${1 + Math.floor(rng() * 28)}일`, time: `${9 + Math.floor(rng() * 12)}시 ${pick(['10', '25', '40', '55'])}분` };
}
// Coherent authored profiles, rather than independently combining incompatible factual alternatives.
function factsFor(id, truth, seed = 0) {
  const row = rows.find(r => r.id === id);
  const facts = Object.fromEntries(Object.entries(row.variables).map(([key, values]) => [key, values.split(' / ')[0].replace(/\.$/, '')]));
  const [a, b, c] = [1, 2, 3].map(i => truth[`twist_${i}`] >= .6);
  const patches = {
    ARCH_THEFT: { camera_gap: '교체 순간이 사람에게 가려짐', taking_permission: b ? '특정 물건의 반출 허락 메시지, 대상 해석은 다툼' : '허락 없음',
      recognition_at_take: c ? '타인 물건임을 앎' : '자기 물건으로 믿음', appropriation_plan: c ? '자기 것처럼 처분할 판매 초안 작성' : '착오 반출 후 보관' },
    ARCH_RESALE_FRAUD: { seller_identity: b ? '다른 성인과 계정 공유' : '의뢰인이 대화·입금 계정을 직접 사용', goods_status: c ? '대체품만 보유' : '약속한 물품 보유',
      delivery_path: a ? '송장 발급, 접수 실재는 자료로 확정되지 않음' : '정상 접수 뒤 분실' },
    ARCH_BUSINESS_EMBEZZLEMENT: { custody_role: '업무상 운영비 담당, 이체에는 별도 승인 필요', spend_purpose: c ? '개인 용도 지출' : '실제 업무 지출',
      approval_scope: c ? '문제 개인 사용에는 승인 없음' : b ? '목적·한도 내 구두 재량 승인' : '해당 업무 목적만 승인', ledger_gap: a ? '항목 오분류' : '영수증 제출 지연' },
    ARCH_ONLINE_DEFAMATION: { statement_truth: c ? '일부 핵심 사실 허위' : '핵심 사실 진실', belief_basis: c ? '기록을 오독' : '직접 확인',
      identifiability: a ? '모임 독자가 특정인을 알아볼 단서 있음' : '단서 부족', audience_scope: '다수 열람', posting_purpose: b ? '주의 환기와 개인 비난 혼재' : '개인 비난 중심' },
    ARCH_TRAFFIC_INJURY: { visibility: '주차 차량에 가려짐', injury_link: b ? '기존 증상의 악화' : '사고로 새 경상 발생',
      crossing_location: c ? '횡단보도 위' : '횡단보도 밖' },
    ARCH_RESIDENTIAL_INTRUSION: { entry_area: '세대 현관 안', permission_scope: b ? '문 앞 전달만 동의' : '과거 방문만 동의',
      withdrawal_received: c ? '동의 철회 메시지를 입장 전에 읽음' : '철회 없음', entry_method: c ? '남아 있던 비밀번호 사용' : '초인종 후 열린 문',
      entry_awareness: c ? '제한을 알면서 넘어감' : '허용 범위 안이라고 믿음' },
    ARCH_FALSE_REPORT: { underlying_event: '물품은 승인된 이동·보관으로 사라져 보였음', report_content: a ? '관찰 사실과 의심을 구분해 전달' : '범행을 직접 봤다고 단정',
      knowledge_at_report: b ? '이동 알림 수신, 실제 열람과 이해는 조사 대상' : '불완전한 정보로 진실이라고 믿음',
      report_purpose: '소재 확인 요청과 처분 요구의 범위 다툼' },
    ARCH_OBSTRUCTION_THREAT: { duty_basis: b ? '점검 안내와 집행 범위가 다름, 별도 근거의 적용 조건 검토' : '적법한 권한·절차에 따른 점검',
      utterance: a ? '공식 불복 예고와 별도 해악 고지의 경계가 문제 된 발언' : '구체적 불이익을 가하겠다는 해악 고지',
      context: c ? '반복적·강압적인 발언 상황' : '한 차례 항의' }
  };
  return { ...facts, ...patches[id], ...settingFor(id, seed), observation_detail: [truth.observation_a >= .6, truth.observation_b >= .6],
    discoveries: row.twists.filter((_, i) => [a, b, c][i]).map(t => t[0]) };
}
module.exports = { factsFor, settingFor };

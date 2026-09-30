'use strict';

/** @type {import('../core/format.js').TwistModule[]} */
module.exports = [
  {
    id: 'TWIST_WITNESS_CONFLICT_OF_INTEREST', title: '목격자에게 돌아갈 정산금',
    appliesTo: ['ARCH_CRIMINAL_ASSAULT'], targetIssue: 'ISSUE_IDENTITY',
    activation: { param: 'witness_interest', op: '>=', value: 0.6 },
    truthEffect: '목격자는 피해자와 공동 판매대의 수익을 나눈다. 피해자가 피고인에게 받으려는 미정산금 중 일부는 목격자 몫이다. 이 관계는 목격 여부 자체를 부정하지 않는다.',
    investigationCard: {
      investigationId: 'INV_ASSAULT_WITNESS_INTEREST', investigationTitle: '목격자와 피해자의 정산 관계 확인', cost: 1,
      cardId: 'CARD_ASSAULT_WITNESS_INTEREST', cardTitle: '공동 판매대 정산 약정',
      cardText: '정산 약정에는 피해자가 피고인에게 받을 금액을 목격자와 나누기로 한 내용이 있다. 목격자는 최초 진술에서 피해자를 단순한 지인이라고만 소개했다.'
    },
    opponentRecovery: {
      text: '정산금을 받을 관계라는 사정만으로 직접 본 장면까지 거짓이 되지는 않습니다. 증인이 현장에서 피고인을 지목한 진술은 여전히 남아 있습니다.',
      effect: { issue: 'ISSUE_IDENTITY', delta: 1 }
    },
    playerCounter: {
      text: '정산 약정을 제시합니다. 증인에게도 받을 몫이 있는데 최초 진술에서는 이 관계를 밝히지 않았습니다. 지목 진술의 정확성은 영상과 별도로 대조해야 합니다.',
      effect: { issue: 'ISSUE_IDENTITY', delta: -1 }
    }
  },
  {
    id: 'TWIST_MEDIA_ATTENTION', title: '기사 뒤에 선명해진 기억',
    appliesTo: ['ARCH_CRIMINAL_ASSAULT'], targetIssue: 'ISSUE_IDENTITY',
    activation: { param: 'media_contamination', op: '>=', value: 0.6 },
    truthEffect: '목격자는 최초 진술 뒤 사건 게시물의 편집 영상을 읽고 보았다. 이후 진술에는 최초 진술에 없던 옷소매 표식이 추가되었다. 이는 직접 관찰한 부분과 사후 접한 부분이 섞인 상태다.',
    investigationCard: {
      investigationId: 'INV_ASSAULT_MEDIA_SEQUENCE', investigationTitle: '진술과 사건 게시물의 순서 대조', cost: 1,
      cardId: 'CARD_ASSAULT_MEDIA_SEQUENCE', cardTitle: '표식이 등장한 순서',
      cardText: '최초 진술에는 옷소매 표식이 없다. 게시물 열람 확인 뒤 작성된 추가 진술에서 처음 표식이 등장한다. 편집 영상은 얼굴과 접촉 순간을 한 화면에 보여주지 않는다.'
    },
    opponentRecovery: {
      text: '영상을 보고 당시 기억이 되살아났을 수도 있습니다. 세부 사항을 나중에 떠올렸다는 이유만으로 최초의 지목까지 버릴 수는 없습니다.',
      effect: { issue: 'ISSUE_IDENTITY', delta: 1 }
    },
    playerCounter: {
      text: '최초 진술과 게시물 열람 순서를 제시합니다. 표식은 게시물을 본 뒤에야 등장합니다. 사건 당시 본 얼굴과 나중에 영상에서 본 표식을 같은 관찰로 취급해서는 안 됩니다.',
      effect: { issue: 'ISSUE_IDENTITY', delta: -1 }
    }
  },
  {
    id: 'TWIST_LATE_DECISIVE_DOCUMENT', title: '뒤늦게 도착한 이전 진료기록',
    appliesTo: ['ARCH_CRIMINAL_ASSAULT'], targetIssue: 'ISSUE_CAUSATION',
    activation: { param: 'prior_injury_record', op: '>=', value: 0.6 },
    truthEffect: '피해자에게 사건 전부터 같은 손목 부위의 통증과 치료 이력이 있었다. 사건 후 새 타박상도 확인되지만 현재 진단서에는 이전 증상과 새 손상의 구분이 없다.',
    investigationCard: {
      investigationId: 'INV_ASSAULT_PRIOR_RECORD', investigationTitle: '이전 진료기록과 현재 진단서 대조', cost: 1,
      cardId: 'CARD_ASSAULT_PRIOR_RECORD', cardTitle: '같은 손목의 이전 통증 기록',
      cardText: '추가로 확보한 이전 진료기록에 같은 손목의 통증이 기재돼 있다. 현재 진단서는 새 타박상을 확인하지만, 치료 필요 기간 중 어느 부분이 이전 증상 때문인지는 구분하지 않는다.'
    },
    opponentRecovery: {
      text: '이전 통증이 있었다고 해도 사건 후 새 타박상이 확인된 사실은 남습니다. 이번 접촉이 손목 상태를 악화시켰을 가능성까지 배제할 수는 없습니다.',
      effect: { issue: 'ISSUE_CAUSATION', delta: 2 }
    },
    playerCounter: {
      text: '이전 진료기록을 함께 제시합니다. 새 타박상을 부정하는 것이 아닙니다. 현재 진단서만으로 기존 통증까지 모두 이번 행위의 결과라고 볼 근거가 있는지 확인해 주십시오.',
      effect: { issue: 'ISSUE_CAUSATION', delta: -2 }
    }
  },
  {
    id: 'TWIST_CLIENT_HIDES_CONTACT', title: '의뢰인이 숨긴 첫 밀침',
    appliesTo: ['ARCH_CRIMINAL_ASSAULT'], targetIssue: 'ISSUE_CAUSATION',
    activation: { param: 'hidden_contact', op: '>=', value: 0.6 },
    truthEffect: '의뢰인은 접촉이 없었다고 상담했지만 실제로는 말다툼 중 피해자의 어깨를 한 차례 밀었다. 피해자는 곧바로 자세를 회복했고 이후 화면 밖에서 넘어졌다. 최초 밀침과 낙상 사이의 과정은 영상에 없다.',
    investigationCard: {
      investigationId: 'INV_ASSAULT_CLIENT_CONTACT', investigationTitle: '의뢰인 재면담과 연속 영상 확인', cost: 1,
      cardId: 'CARD_ASSAULT_CLIENT_CONTACT', cardTitle: '밀침 뒤 자세를 회복한 장면',
      cardText: '의뢰인은 어깨를 민 사실을 뒤늦게 인정했다. 연속 영상에는 피해자가 자세를 회복한 뒤 화면 밖으로 이동하는 모습이 있다. 이후 낙상의 직접 원인은 영상으로 확인되지 않는다.'
    },
    opponentRecovery: {
      text: '피고인은 밀친 사실조차 처음에는 숨겼습니다. 최초 부인은 믿기 어렵습니다. 검찰은 이 밀침이 뒤이은 상해로 연결됐다는 주장을 유지합니다.',
      effect: { issue: 'ISSUE_CAUSATION', delta: 2 }
    },
    playerCounter: {
      text: '최초 부인이 잘못됐다는 점은 인정합니다. 그러나 연속 영상에서 피해자는 밀침 뒤 자세를 회복합니다. 그 뒤 화면 밖에서 발생한 낙상까지 같은 행위의 결과로 연결할 근거를 구분해 주십시오.',
      effect: { issue: 'ISSUE_CAUSATION', delta: -2 }
    }
  },
  {
    id: 'TWIST_DUI_MEASUREMENT_GAP', title: '접수표에 남은 측정 대기',
    appliesTo: ['ARCH_DUI'], targetIssue: 'ISSUE_INTOXICATION',
    activation: { param: 'measurement_delay', op: '>=', value: 0.6 },
    truthEffect: '차량이 정차한 뒤 측정 장비가 도착할 때까지 대기 시간이 있었다. 현장 접수표에는 장비 도착을 기다렸다는 기록이 있다. 시계 대조 자료의 유무와 별개로 실제 대기는 있었으며, 운전 당시 수치를 계산한 자료는 없다.',
    investigationCard: {
      investigationId: 'INV_DUI_WAIT_LOG', investigationTitle: '현장 접수표와 장비 도착 기록 대조', cost: 1,
      cardId: 'CARD_DUI_WAIT_LOG', cardTitle: '측정 전 장비 도착 대기 기록',
      cardText: '현장 접수표에는 차량 정차 후 장비 도착을 기다린 사실이 적혀 있다. 측정 기록은 그 뒤 작성됐다. 두 시계의 정확한 차이를 확정하지 않아도 대기했다는 순서는 확인된다. 운전 당시 상태의 계산 자료는 첨부되지 않았다.'
    },
    opponentRecovery: {
      text: '장비를 기다렸다고 해도 현장에서 확인한 피고인을 측정한 것입니다. 대상자와 측정 결과가 연결된다는 사실은 바뀌지 않습니다.',
      effect: { issue: 'ISSUE_INTOXICATION', delta: 2 }
    },
    playerCounter: {
      text: '접수표와 장비 도착 기록을 제시합니다. 대상자가 같다는 점은 다투지 않습니다. 실제 대기 구간이 있는데, 그 뒤 측정 결과를 운전 당시 상태에 연결한 근거는 무엇입니까?',
      effect: { issue: 'ISSUE_INTOXICATION', delta: -2 }
    }
  },
  {
    id: 'TWIST_DUI_DRIVER_REVISION', title: '대리기사의 달라진 하차 설명',
    appliesTo: ['ARCH_DUI'], targetIssue: 'ISSUE_DRIVER',
    activation: { param: 'driver_revision', op: '>=', value: 0.6 },
    truthEffect: '대리기사는 피고인의 요청으로 문제의 차량을 운전한 적이 있다. 최초 진술에서는 차량을 세운 뒤 자리를 떠났다고 했지만, 이후 피고인이 운전대를 잡고 출발하는 것을 보았다고 덧붙였다. 배차 종료 통화에서는 떠난 뒤의 이동을 못 봤다고 말한 기록이 남아 있다. 문제의 이동 구간을 누가 운전했는지는 이 사실만으로 확정되지 않는다.',
    investigationCard: {
      investigationId: 'INV_DUI_DRIVER_CALL', investigationTitle: '대리기사 배차 종료 통화와 진술 대조', cost: 1,
      cardId: 'CARD_DUI_DRIVER_CALL', cardTitle: '배차 종료 통화의 관찰 범위',
      cardText: '배차 종료 통화에서 기사는 차량을 세우고 떠났으며 그 뒤 이동은 보지 못했다고 말했다. 이후 진술에는 피고인이 운전대를 잡고 출발하는 것을 봤다는 내용이 추가됐다. 기사가 운전한 이전 구간과 이번 공소사실의 이동 구간은 구분해야 한다.'
    },
    opponentRecovery: {
      text: '대리기사의 추가 진술도 피고인이 운전했다고 지목합니다. 최초 진술이 짧았다는 이유만으로 뒤에 덧붙인 설명을 모두 버릴 수는 없습니다.',
      effect: { issue: 'ISSUE_DRIVER', delta: 1 }
    },
    playerCounter: {
      text: '배차 종료 통화에는 단순히 설명을 생략한 것이 아니라, 떠난 뒤 이동을 보지 못했다고 말한 대목이 있습니다. 추가 지목을 직접 목격으로 받아들이려면 이 차이부터 설명해야 합니다.',
      effect: { issue: 'ISSUE_DRIVER', delta: -1 }
    }
  },
  {
    id: 'TWIST_DUI_DEVICE_LOG', title: '다른 장비 번호의 점검표',
    appliesTo: ['ARCH_DUI'], targetIssue: 'ISSUE_INTOXICATION',
    activation: { param: 'device_log_gap', op: '>=', value: 0.6 },
    truthEffect: '제출된 관리 점검표의 장비 번호가 피고인 측정 기록의 장비 번호와 다르다. 피고인을 측정한 장비가 실제로 고장 났는지는 확인되지 않았다. 측정 시각 자료의 유무와 이 문서 연결 오류는 별개다.',
    investigationCard: {
      investigationId: 'INV_DUI_DEVICE_REGISTER', investigationTitle: '측정 장비 번호와 관리 대장 대조', cost: 1,
      cardId: 'CARD_DUI_DEVICE_REGISTER', cardTitle: '측정 기록과 점검표의 장비 번호 불일치',
      cardText: '측정 기록에 적힌 장비 번호와 제출된 점검표의 번호가 다르다. 관리 대장상 두 번호는 서로 다른 장비다. 현재 자료에는 실제 사용 장비에 대응하는 점검표가 없으며, 고장이나 측정값 오류가 입증된 것은 아니다.'
    },
    opponentRecovery: {
      text: '측정 결과는 기록으로 남아 있고 장비 점검 자료도 제출했습니다. 문서 연결에 문제가 있다는 주장만으로 측정값 자체가 틀렸다고 할 수는 없습니다.',
      effect: { issue: 'ISSUE_INTOXICATION', delta: 2 }
    },
    playerCounter: {
      text: '관리 대장의 장비 번호를 대조해 주십시오. 제출된 점검표는 다른 장비의 것입니다. 고장을 단정하는 것이 아니라, 이 점검표로 실제 사용 장비의 관리 상태를 뒷받침할 수 있느냐고 묻는 것입니다.',
      effect: { issue: 'ISSUE_INTOXICATION', delta: -2 }
    }
  }
];

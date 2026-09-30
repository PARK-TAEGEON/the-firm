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
      effect: { issue: 'ISSUE_IDENTITY', delta: -2 }
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
      effect: { issue: 'ISSUE_IDENTITY', delta: -2 }
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
      effect: { issue: 'ISSUE_CAUSATION', delta: -3 }
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
      effect: { issue: 'ISSUE_CAUSATION', delta: -3 }
    }
  }
];

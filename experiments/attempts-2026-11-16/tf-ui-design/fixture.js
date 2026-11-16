window.TF_FIXTURE = {
  "version": "1.0.0",
  "fixture": true,
  "baseline": "d6fa4a303691f60eedf79b829780f443f915e245",
  "consultation": {
    "location": "office_lounge",
    "speakers": [
      {
        "id": "CLIENT_SIG_CONTACT",
        "name": "정민호",
        "detail": "38세 · 프리랜서 영상 편집자",
        "initial": "정"
      },
      {
        "id": "DEFENSE",
        "name": "변호인",
        "detail": "당신",
        "initial": "변"
      }
    ],
    "lines": [
      {
        "speaker": "CLIENT_SIG_CONTACT",
        "text": "저는 프리랜서 영상 편집자입니다. 오태윤 씨와 작업실을 같이 운영하는데, 정산 문제로 말다툼을 했어요."
      },
      {
        "speaker": "DEFENSE",
        "text": "우선 앉으세요. 서두르지 않으셔도 됩니다. 그날 어떤 일이 있었는지 말씀해 주세요."
      },
      {
        "speaker": "CLIENT_SIG_CONTACT",
        "text": "말이 좀 심하게 오가긴 했습니다. 그래도 몸은 건드리지 않았어요."
      },
      {
        "speaker": "CLIENT_SIG_CONTACT",
        "text": "태윤 씨가 넘어져 손목을 다쳤다고 하더라고요. 검찰에서는 제가 밀어서 그렇게 됐다며 상해로 기소했습니다."
      },
      {
        "speaker": "DEFENSE",
        "text": "같은 작업실을 쓰는 한지수 씨의 진술과 진단서가 나와 있네요. 민호 씨 말씀도 듣고, 자료가 어디까지 확인해 주는지 살펴보겠습니다."
      },
      {
        "speaker": "CLIENT_SIG_CONTACT",
        "text": "다음 달에 방송 외주 계약을 갱신해야 해요. 계약서에 “형사처벌 이력 시 해지”라고 적혀 있어서, 일을 계속할 수 있을지 걱정입니다."
      },
      {
        "speaker": "CLIENT_SIG_CONTACT",
        "text": "합의 이야기도 들었습니다. 돈을 드리면 재판까지 끝나는 건가요?"
      },
      {
        "speaker": "DEFENSE",
        "text": "합의해도 재판은 계속될 수 있어요. 합의 조건과 걱정하시는 계약 조항을 함께 살펴보겠습니다. 설명을 들으신 뒤 결정하시죠."
      }
    ],
    "tasks": [
      "반나절 4번을 나누어 자료를 조사하고, 검사 측 증인에게 물을 내용을 준비하세요.",
      "피해자 측 합의 제안을 검토해 정민호 씨에게 조언하세요. 수락 여부는 정민호 씨가 결정합니다."
    ]
  },
  "speakers": {
    "CLIENT_SIG_CONTACT": "정민호",
    "DEFENSE": "변호인",
    "W_SIG_OBSERVER": "한지수",
    "W_SIG_INVESTIGATOR": "서동국",
    "PROSECUTOR": "검찰 · 윤가람",
    "JUDGE": "재판장",
    "CLIENT": "정민호"
  },
  "cards": [
    {
      "id": "CARD_SIG_SEQUENCE",
      "title": "연속 영상",
      "text": "피해자가 한 걸음 뒤로 밀렸다가 자세를 회복하고 가림막 뒤로 걸어간다. 접촉 순간은 기둥에 가려 보이지 않는다. 가림막 뒤 낙상은 화면 밖이다. 두 장면 사이 약 40초."
    },
    {
      "id": "CARD_SIG_MEDICAL",
      "title": "진료기록",
      "text": "오른쪽 손목 타박상. 넘어지며 손을 짚을 때 흔한 손상이라는 기재. 누가 어떤 동작으로 다치게 했는지 판단한 감정은 없다."
    },
    {
      "id": "CARD_SIG_LAYOUT",
      "title": "가림막 뒤 현장 동선",
      "text": "낙상 지점 바로 앞에 바퀴 달린 운반대와 밀린 바퀴 자국이 있다. 검찰 사진에는 이 구역이 없다. 이것만으로 원인을 확정하지는 않는다."
    },
    {
      "id": "CARD_SIG_CONTACT",
      "title": "의뢰인 재면담",
      "text": "의뢰인이 어깨를 한 번 민 사실을 인정했다. 상해의 원인까지 인정하지는 않는다."
    }
  ],
  "reports": {
    "included": {
      "plan": {
        "stance": "S_SIG_CONTACT",
        "focus": "F_SIG_CAUSE",
        "aim": "밀침은 인정하되 손목 상해와의 인과관계는 다툰다.",
        "useLayout": true
      },
      "records": [
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r1",
          "seq": 1,
          "kind": "investigation",
          "source": "defense",
          "refId": "INV_SIG_CLIENT",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r2",
          "seq": 2,
          "kind": "investigation",
          "source": "defense",
          "refId": "INV_SIG_SEQUENCE",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r3",
          "seq": 3,
          "kind": "evidence_filing",
          "source": "court",
          "memo": "연속 영상: 보류",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r4",
          "seq": 4,
          "kind": "investigation",
          "source": "defense",
          "refId": "INV_SIG_MEDICAL",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r5",
          "seq": 5,
          "kind": "evidence_filing",
          "source": "court",
          "memo": "진료기록: 보류",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r6",
          "seq": 6,
          "kind": "investigation",
          "source": "defense",
          "refId": "INV_SIG_LAYOUT",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r7",
          "seq": 7,
          "kind": "evidence_filing",
          "source": "court",
          "memo": "가림막 뒤 현장 동선: 보류",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r8",
          "seq": 8,
          "kind": "evidence_filing",
          "source": "defense",
          "memo": "연속 영상: 신청",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r9",
          "seq": 9,
          "kind": "evidence_filing",
          "source": "defense",
          "memo": "진료기록: 신청",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r10",
          "seq": 10,
          "kind": "prep_closed",
          "source": "defense",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r11",
          "seq": 11,
          "kind": "trial_open",
          "source": "court",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "사건번호 2026고단917, 피고인에 대한 상해 사건 공판을 시작합니다."
            },
            {
              "speaker": "PROSECUTOR",
              "text": "검찰은 목격 진술과 진단서로, 피고인이 피해자를 밀어 손목을 다치게 한 사실을 입증하겠습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r12",
          "seq": 12,
          "kind": "opening",
          "source": "defense",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "이 사건의 핵심은 두 장면 사이에 무슨 일이 있었는가입니다. 피고인은 어깨를 한 번 민 사실을 인정합니다. 그러나 그 밀침이 손목 상해로 이어졌는지는 다툽니다. 검찰의 주장은 합리적 의심을 넘지 못할 것입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r13",
          "seq": 13,
          "kind": "evidence_opinions",
          "source": "court",
          "memo": "증거 의견 확정 — 변경 불가",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r14",
          "seq": 14,
          "kind": "evidence_opinion",
          "source": "defense",
          "refId": "PX_SIG_STATEMENT",
          "memo": "목격자 진술조서(한지수): 부동의",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "목격자 진술조서(한지수)에 부동의합니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r15",
          "seq": 15,
          "kind": "evidence_opinion",
          "source": "defense",
          "refId": "PX_SIG_VIDEO",
          "memo": "현장 사진(정지 사진 2매): 동의",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "현장 사진(정지 사진 2매)에 동의합니다. 검찰은 피해자가 뒤로 밀리는 장면과 가림막 쪽으로 가는 장면을 정지 사진으로 냈다. 연속본에는 그 사이 약 40초가 있다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r16",
          "seq": 16,
          "kind": "evidence_opinion",
          "source": "defense",
          "refId": "PX_SIG_REPORT",
          "memo": "수사보고서(서동국): 부동의",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "수사보고서(서동국)에 부동의합니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r17",
          "seq": 17,
          "kind": "evidence_opinion",
          "source": "defense",
          "refId": "PX_SIG_MEDICAL",
          "memo": "상해진단서: 동의",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "상해진단서에 동의합니다. 오른쪽 손목 타박상, 2주 치료 소견. 원인 감정 기재 없음."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r18",
          "seq": 18,
          "kind": "evidence_filing",
          "source": "defense",
          "memo": "가림막 뒤 현장 동선: 신청 — 왜 이제야 제출합니까",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "왜 이제야 제출합니까"
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r19",
          "seq": 19,
          "kind": "witness_call",
          "source": "court",
          "witnessId": "W_SIG_OBSERVER",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "검찰 측 증인 목격자, 증인석으로 나오십시오."
            },
            {
              "speaker": "PROSECUTOR",
              "text": "주신문하겠습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r20",
          "seq": 20,
          "kind": "direct",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "D_SIG_OBS_1",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "증인은 사건 당시 어디에 있었습니까?"
            },
            {
              "speaker": "W_SIG_OBSERVER",
              "text": "같은 작업장에서 피고인 자리와 대여섯 걸음 떨어진 책상에 있었습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r21",
          "seq": 21,
          "kind": "direct",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "D_SIG_OBS_2",
          "memo": "목격자: 피고인이 피해자를 밀었다",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "무엇을 보았습니까?"
            },
            {
              "speaker": "W_SIG_OBSERVER",
              "text": "두 사람이 정산 문제로 언성을 높였고, 피고인이 피해자를 밀었습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r22",
          "seq": 22,
          "kind": "direct",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "D_SIG_OBS_ADMIT",
          "memo": "변호인 측이 밀침 인정 — 접촉 사실은 양측 인정",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "변호인도 피고인이 어깨를 민 사실은 인정했습니다. 증인이 본 것도 그 장면이지요?"
            },
            {
              "speaker": "W_SIG_OBSERVER",
              "text": "네, 그 장면입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r23",
          "seq": 23,
          "kind": "question",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "OBJ_SIG_OBSERVER_VALID",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "그 팔 움직임이 피해자를 넘어뜨린 동작이었지요?"
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r24",
          "seq": 24,
          "kind": "objection",
          "source": "defense",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "OBJ_SIG_OBSERVER_VALID",
          "memo": "유도신문 이의 인용 — 목격자는 본 동작만 진술",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "이의 있습니다. 증인이 보지 않은 결론을 넣은 유도신문입니다."
            },
            {
              "speaker": "JUDGE",
              "text": "인용합니다. 본 것을 물으십시오."
            },
            {
              "speaker": "PROSECUTOR",
              "text": "…무슨 움직임을 보았습니까?"
            },
            {
              "speaker": "W_SIG_OBSERVER",
              "text": "피고인이 팔을 뻗는 걸 봤습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r25",
          "seq": 25,
          "kind": "question",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "OBJ_SIG_OBSERVER_INVALID",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "현장에서 무엇을 보았는지 순서대로 말씀해 주십시오."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r26",
          "seq": 26,
          "kind": "objection",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "OBJ_SIG_OBSERVER_INVALID",
          "memo": "목격자: 밀림 → 가림막 뒤 → 넘어지는 소리",
          "lines": [
            {
              "speaker": "W_SIG_OBSERVER",
              "text": "피고인이 팔을 뻗었고, 피해자가 뒤로 밀렸다가 가림막 뒤로 갔습니다. 곧 넘어지는 소리가 났습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r27",
          "seq": 27,
          "kind": "cross_start",
          "source": "court",
          "witnessId": "W_SIG_OBSERVER",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "변호인, 반대신문 하십시오."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r28",
          "seq": 28,
          "kind": "cross_end",
          "source": "court",
          "witnessId": "W_SIG_OBSERVER",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "이상입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r29",
          "seq": 29,
          "kind": "redirect_none",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "재주신문 없습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r30",
          "seq": 30,
          "kind": "witness_done",
          "source": "court",
          "witnessId": "W_SIG_OBSERVER",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "증인은 돌아가도 좋습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r31",
          "seq": 31,
          "kind": "witness_call",
          "source": "court",
          "witnessId": "W_SIG_INVESTIGATOR",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "검찰 측 증인 담당 수사관, 증인석으로 나오십시오."
            },
            {
              "speaker": "PROSECUTOR",
              "text": "주신문하겠습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r32",
          "seq": 32,
          "kind": "direct",
          "source": "prosecution",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "D_SIG_INV_1",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "증인은 이 사건에서 무엇을 했습니까?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "현장 사진을 찍고, 피해자의 진단서와 목격 진술을 취합했습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r33",
          "seq": 33,
          "kind": "direct",
          "source": "prosecution",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "D_SIG_INV_2",
          "memo": "사건 당일 손목 타박상 진단",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "피해자의 상처는 무엇이었습니까?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "오른쪽 손목 타박상입니다. 사건 당일 진단서가 발급됐습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r34",
          "seq": 34,
          "kind": "question",
          "source": "prosecution",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "OBJ_SIG_INVESTIGATOR_VALID",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "타박상이 있으니 그 밀침 때문에 다친 것이지요?"
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r35",
          "seq": 35,
          "kind": "objection",
          "source": "defense",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "OBJ_SIG_INVESTIGATOR_VALID",
          "memo": "이의 인용 — 수사관은 자료 내용만 진술",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "이의 있습니다. 자료 취합 담당자에게 결론을 유도하고 있습니다."
            },
            {
              "speaker": "JUDGE",
              "text": "인용합니다. 확인한 자료를 물으십시오."
            },
            {
              "speaker": "PROSECUTOR",
              "text": "…진단서에 어떤 손상이 기재돼 있습니까?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "손목 타박상입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r36",
          "seq": 36,
          "kind": "question",
          "source": "prosecution",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "OBJ_SIG_INVESTIGATOR_INVALID",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "취합한 자료가 무엇인지 말씀해 주십시오."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r37",
          "seq": 37,
          "kind": "objection",
          "source": "prosecution",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "OBJ_SIG_INVESTIGATOR_INVALID",
          "memo": "수사관: 진단서·사진·목격 진술 취합",
          "lines": [
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "진단서, 현장 사진, 목격 진술입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r38",
          "seq": 38,
          "kind": "cross_start",
          "source": "court",
          "witnessId": "W_SIG_INVESTIGATOR",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "변호인, 반대신문 하십시오."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r39",
          "seq": 39,
          "kind": "approach",
          "source": "defense",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "A_SIG_CAUSE_MEDICAL",
          "memo": "진료기록: 상처는 확인 — 원인 감정은 아님",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "진료기록은 상처를 기록한 것이지, 누가 어떤 동작으로 다치게 했는지 판단한 감정은 아니지요?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "네. 상처의 진료기록입니다. 원인을 감정한 자료는 아닙니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r40",
          "seq": 40,
          "kind": "approach",
          "source": "defense",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "A_SIG_CAUSE_SEQUENCE",
          "memo": "영상: 피해자 자세 회복 — 낙상은 화면 밖",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "연속 영상에서 피해자는 밀린 뒤 다시 서서 가림막 뒤로 걸어갑니다. 넘어지는 장면은 화면 밖이지요?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "네. 다시 선 뒤의 경위는 영상으로 확인할 수 없습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r41",
          "seq": 41,
          "kind": "cross_end",
          "source": "court",
          "witnessId": "W_SIG_INVESTIGATOR",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "이상입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r42",
          "seq": 42,
          "kind": "redirect",
          "source": "prosecution",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "RH_SIG_CAUSE",
          "memo": "검사 재주신문 — 상처가 있었다는 진술 반복",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "그래도 사건 당일 손목을 다친 건 사실이지요?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "네, 손목 타박상입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r43",
          "seq": 43,
          "kind": "rebuttal",
          "source": "defense",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "RH_SIG_CAUSE",
          "memo": "현장 동선: 검토되지 않은 다른 낙상 경로(운반대)",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "재반대신문입니다. 가림막 뒤 낙상 지점 바로 앞에 바퀴 달린 운반대와 밀린 바퀴 자국이 있었습니다. 이 경로를 검토했습니까?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "…당시 취합한 진단서와 사진만으로는 그 경로까지 검토하지 못했습니다. 다른 낙상 경로도 살펴야 합니다."
            },
            {
              "speaker": "PROSECUTOR",
              "text": "운반대가 있었다는 것만으로 원인이 확정되지는 않습니다."
            },
            {
              "speaker": "DEFENSE",
              "text": "그렇습니다. 원인을 단정하려는 것이 아니라, 앞의 밀침만으로 설명할 수 있는지 묻는 것입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r44",
          "seq": 44,
          "kind": "witness_done",
          "source": "court",
          "witnessId": "W_SIG_INVESTIGATOR",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "증인은 돌아가도 좋습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r45",
          "seq": 45,
          "kind": "argument_closed",
          "source": "court",
          "memo": "증거 신청 변경 마감",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r46",
          "seq": 46,
          "kind": "sentencing_request",
          "source": "court",
          "memo": "검사는 상해 공소사실에 대하여 피고인에게 징역 1년을 선고해 주시기를 구합니다. (실험용 고정 구형 · 실제 구형 기준 아님)",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "검사는 상해 공소사실에 대하여 피고인에게 징역 1년을 선고해 주시기를 구합니다. (실험용 고정 구형 · 실제 구형 기준 아님)"
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r47",
          "seq": 47,
          "kind": "closing_argument",
          "source": "court",
          "refId": "FINAL_SIG_CAUSE",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "밀침과 상해의 연결은 입증되지 않았습니다. 예비적으로 피고인의 사정을 살펴 선처해 주십시오."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r48",
          "seq": 48,
          "kind": "last_statement",
          "source": "court",
          "lines": [
            {
              "speaker": "CLIENT",
              "text": "어깨를 민 것은 잘못했습니다. 아직 피해 회복에 이르지 못한 점이 마음에 걸립니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r49",
          "seq": 49,
          "kind": "sentencing_date",
          "source": "court",
          "memo": "2주 뒤 · 제2회 공판기일 · 선고",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "2주 뒤 · 제2회 공판기일 · 선고"
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r50",
          "seq": 50,
          "kind": "verdict",
          "source": "court",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "지금부터 판결을 선고하겠습니다."
            },
            {
              "speaker": "JUDGE",
              "text": "재판부는 공소사실과 그 안에 포함된 사실을 차례로 판단하였다."
            }
          ]
        }
      ],
      "results": {
        "video": {
          "performed": true,
          "recordId": "SIG_SEPARATED_MOMENTS:s1:r40"
        },
        "medical": {
          "performed": true,
          "recordId": "SIG_SEPARATED_MOMENTS:s1:r39"
        },
        "layout": {
          "performed": true,
          "recordId": "SIG_SEPARATED_MOMENTS:s1:r43"
        }
      },
      "outcome": {
        "key": "assault",
        "headline": "유죄 · 폭행 — 벌금 100만 원",
        "text": "손목 상해와의 연결은 입증되지 않아 상해는 인정되지 않았습니다. 그 안에 포함된 밀침(폭행)만 유죄입니다.",
        "pronouncement": "주문. 피고인을 벌금 100만 원에 처한다.",
        "judgment": {
          "label": "유죄",
          "article": null
        },
        "offense": {
          "id": "assault",
          "label": "폭행",
          "article": "형법 제260조 제1항"
        },
        "sentence": {
          "kind": "fine",
          "label": "벌금",
          "pronouncement": "주문. 피고인을 벌금 100만 원에 처한다.",
          "text": "벌금 100만 원",
          "reason": "초범이고 상해와의 연결은 인정되지 않았다.",
          "disclaimer": "실험용 단순화 — 실제 양형기준 아님",
          "premise": "초범 전제"
        },
        "issues": [
          {
            "id": "ISSUE_SIG_ACT",
            "title": "밀침",
            "bandLabel": "입증됨",
            "memo": "목격 진술 — 피고인이 피해자를 밀었다"
          },
          {
            "id": "ISSUE_SIG_CAUSE",
            "title": "상해와의 연결",
            "bandLabel": "의심",
            "memo": "밀침과 손목 상해의 연결 불확실 — 합리적 의심 남음"
          }
        ]
      }
    },
    "excluded": {
      "plan": {
        "stance": "S_SIG_CONTACT",
        "focus": "F_SIG_CAUSE",
        "aim": "밀침은 인정하되 손목 상해와의 인과관계는 다툰다.",
        "useLayout": false
      },
      "records": [
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r1",
          "seq": 1,
          "kind": "investigation",
          "source": "defense",
          "refId": "INV_SIG_CLIENT",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r2",
          "seq": 2,
          "kind": "investigation",
          "source": "defense",
          "refId": "INV_SIG_SEQUENCE",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r3",
          "seq": 3,
          "kind": "evidence_filing",
          "source": "court",
          "memo": "연속 영상: 보류",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r4",
          "seq": 4,
          "kind": "investigation",
          "source": "defense",
          "refId": "INV_SIG_MEDICAL",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r5",
          "seq": 5,
          "kind": "evidence_filing",
          "source": "court",
          "memo": "진료기록: 보류",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r6",
          "seq": 6,
          "kind": "investigation",
          "source": "defense",
          "refId": "INV_SIG_LAYOUT",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r7",
          "seq": 7,
          "kind": "evidence_filing",
          "source": "court",
          "memo": "가림막 뒤 현장 동선: 보류",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r8",
          "seq": 8,
          "kind": "evidence_filing",
          "source": "defense",
          "memo": "연속 영상: 신청",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r9",
          "seq": 9,
          "kind": "evidence_filing",
          "source": "defense",
          "memo": "진료기록: 신청",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r10",
          "seq": 10,
          "kind": "prep_closed",
          "source": "defense",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r11",
          "seq": 11,
          "kind": "trial_open",
          "source": "court",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "사건번호 2026고단917, 피고인에 대한 상해 사건 공판을 시작합니다."
            },
            {
              "speaker": "PROSECUTOR",
              "text": "검찰은 목격 진술과 진단서로, 피고인이 피해자를 밀어 손목을 다치게 한 사실을 입증하겠습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r12",
          "seq": 12,
          "kind": "opening",
          "source": "defense",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "이 사건의 핵심은 두 장면 사이에 무슨 일이 있었는가입니다. 피고인은 어깨를 한 번 민 사실을 인정합니다. 그러나 그 밀침이 손목 상해로 이어졌는지는 다툽니다. 검찰의 주장은 합리적 의심을 넘지 못할 것입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r13",
          "seq": 13,
          "kind": "evidence_opinions",
          "source": "court",
          "memo": "증거 의견 확정 — 변경 불가",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r14",
          "seq": 14,
          "kind": "evidence_opinion",
          "source": "defense",
          "refId": "PX_SIG_STATEMENT",
          "memo": "목격자 진술조서(한지수): 부동의",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "목격자 진술조서(한지수)에 부동의합니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r15",
          "seq": 15,
          "kind": "evidence_opinion",
          "source": "defense",
          "refId": "PX_SIG_VIDEO",
          "memo": "현장 사진(정지 사진 2매): 동의",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "현장 사진(정지 사진 2매)에 동의합니다. 검찰은 피해자가 뒤로 밀리는 장면과 가림막 쪽으로 가는 장면을 정지 사진으로 냈다. 연속본에는 그 사이 약 40초가 있다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r16",
          "seq": 16,
          "kind": "evidence_opinion",
          "source": "defense",
          "refId": "PX_SIG_REPORT",
          "memo": "수사보고서(서동국): 부동의",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "수사보고서(서동국)에 부동의합니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r17",
          "seq": 17,
          "kind": "evidence_opinion",
          "source": "defense",
          "refId": "PX_SIG_MEDICAL",
          "memo": "상해진단서: 동의",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "상해진단서에 동의합니다. 오른쪽 손목 타박상, 2주 치료 소견. 원인 감정 기재 없음."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r18",
          "seq": 18,
          "kind": "witness_call",
          "source": "court",
          "witnessId": "W_SIG_OBSERVER",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "검찰 측 증인 목격자, 증인석으로 나오십시오."
            },
            {
              "speaker": "PROSECUTOR",
              "text": "주신문하겠습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r19",
          "seq": 19,
          "kind": "direct",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "D_SIG_OBS_1",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "증인은 사건 당시 어디에 있었습니까?"
            },
            {
              "speaker": "W_SIG_OBSERVER",
              "text": "같은 작업장에서 피고인 자리와 대여섯 걸음 떨어진 책상에 있었습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r20",
          "seq": 20,
          "kind": "direct",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "D_SIG_OBS_2",
          "memo": "목격자: 피고인이 피해자를 밀었다",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "무엇을 보았습니까?"
            },
            {
              "speaker": "W_SIG_OBSERVER",
              "text": "두 사람이 정산 문제로 언성을 높였고, 피고인이 피해자를 밀었습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r21",
          "seq": 21,
          "kind": "direct",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "D_SIG_OBS_ADMIT",
          "memo": "변호인 측이 밀침 인정 — 접촉 사실은 양측 인정",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "변호인도 피고인이 어깨를 민 사실은 인정했습니다. 증인이 본 것도 그 장면이지요?"
            },
            {
              "speaker": "W_SIG_OBSERVER",
              "text": "네, 그 장면입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r22",
          "seq": 22,
          "kind": "question",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "OBJ_SIG_OBSERVER_VALID",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "그 팔 움직임이 피해자를 넘어뜨린 동작이었지요?"
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r23",
          "seq": 23,
          "kind": "objection",
          "source": "defense",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "OBJ_SIG_OBSERVER_VALID",
          "memo": "유도신문 이의 인용 — 목격자는 본 동작만 진술",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "이의 있습니다. 증인이 보지 않은 결론을 넣은 유도신문입니다."
            },
            {
              "speaker": "JUDGE",
              "text": "인용합니다. 본 것을 물으십시오."
            },
            {
              "speaker": "PROSECUTOR",
              "text": "…무슨 움직임을 보았습니까?"
            },
            {
              "speaker": "W_SIG_OBSERVER",
              "text": "피고인이 팔을 뻗는 걸 봤습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r24",
          "seq": 24,
          "kind": "question",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "OBJ_SIG_OBSERVER_INVALID",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "현장에서 무엇을 보았는지 순서대로 말씀해 주십시오."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r25",
          "seq": 25,
          "kind": "objection",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "refId": "OBJ_SIG_OBSERVER_INVALID",
          "memo": "목격자: 밀림 → 가림막 뒤 → 넘어지는 소리",
          "lines": [
            {
              "speaker": "W_SIG_OBSERVER",
              "text": "피고인이 팔을 뻗었고, 피해자가 뒤로 밀렸다가 가림막 뒤로 갔습니다. 곧 넘어지는 소리가 났습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r26",
          "seq": 26,
          "kind": "cross_start",
          "source": "court",
          "witnessId": "W_SIG_OBSERVER",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "변호인, 반대신문 하십시오."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r27",
          "seq": 27,
          "kind": "cross_end",
          "source": "court",
          "witnessId": "W_SIG_OBSERVER",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "이상입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r28",
          "seq": 28,
          "kind": "redirect_none",
          "source": "prosecution",
          "witnessId": "W_SIG_OBSERVER",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "재주신문 없습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r29",
          "seq": 29,
          "kind": "witness_done",
          "source": "court",
          "witnessId": "W_SIG_OBSERVER",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "증인은 돌아가도 좋습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r30",
          "seq": 30,
          "kind": "witness_call",
          "source": "court",
          "witnessId": "W_SIG_INVESTIGATOR",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "검찰 측 증인 담당 수사관, 증인석으로 나오십시오."
            },
            {
              "speaker": "PROSECUTOR",
              "text": "주신문하겠습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r31",
          "seq": 31,
          "kind": "direct",
          "source": "prosecution",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "D_SIG_INV_1",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "증인은 이 사건에서 무엇을 했습니까?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "현장 사진을 찍고, 피해자의 진단서와 목격 진술을 취합했습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r32",
          "seq": 32,
          "kind": "direct",
          "source": "prosecution",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "D_SIG_INV_2",
          "memo": "사건 당일 손목 타박상 진단",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "피해자의 상처는 무엇이었습니까?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "오른쪽 손목 타박상입니다. 사건 당일 진단서가 발급됐습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r33",
          "seq": 33,
          "kind": "question",
          "source": "prosecution",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "OBJ_SIG_INVESTIGATOR_VALID",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "타박상이 있으니 그 밀침 때문에 다친 것이지요?"
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r34",
          "seq": 34,
          "kind": "objection",
          "source": "defense",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "OBJ_SIG_INVESTIGATOR_VALID",
          "memo": "이의 인용 — 수사관은 자료 내용만 진술",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "이의 있습니다. 자료 취합 담당자에게 결론을 유도하고 있습니다."
            },
            {
              "speaker": "JUDGE",
              "text": "인용합니다. 확인한 자료를 물으십시오."
            },
            {
              "speaker": "PROSECUTOR",
              "text": "…진단서에 어떤 손상이 기재돼 있습니까?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "손목 타박상입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r35",
          "seq": 35,
          "kind": "question",
          "source": "prosecution",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "OBJ_SIG_INVESTIGATOR_INVALID",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "취합한 자료가 무엇인지 말씀해 주십시오."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r36",
          "seq": 36,
          "kind": "objection",
          "source": "prosecution",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "OBJ_SIG_INVESTIGATOR_INVALID",
          "memo": "수사관: 진단서·사진·목격 진술 취합",
          "lines": [
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "진단서, 현장 사진, 목격 진술입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r37",
          "seq": 37,
          "kind": "cross_start",
          "source": "court",
          "witnessId": "W_SIG_INVESTIGATOR",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "변호인, 반대신문 하십시오."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r38",
          "seq": 38,
          "kind": "approach",
          "source": "defense",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "A_SIG_CAUSE_MEDICAL",
          "memo": "진료기록: 상처는 확인 — 원인 감정은 아님",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "진료기록은 상처를 기록한 것이지, 누가 어떤 동작으로 다치게 했는지 판단한 감정은 아니지요?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "네. 상처의 진료기록입니다. 원인을 감정한 자료는 아닙니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r39",
          "seq": 39,
          "kind": "approach",
          "source": "defense",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "A_SIG_CAUSE_SEQUENCE",
          "memo": "영상: 피해자 자세 회복 — 낙상은 화면 밖",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "연속 영상에서 피해자는 밀린 뒤 다시 서서 가림막 뒤로 걸어갑니다. 넘어지는 장면은 화면 밖이지요?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "네. 다시 선 뒤의 경위는 영상으로 확인할 수 없습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r40",
          "seq": 40,
          "kind": "cross_end",
          "source": "court",
          "witnessId": "W_SIG_INVESTIGATOR",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "이상입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r41",
          "seq": 41,
          "kind": "redirect",
          "source": "prosecution",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "RH_SIG_CAUSE",
          "memo": "검사 재주신문 — 상처가 있었다는 진술 반복",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "그래도 사건 당일 손목을 다친 건 사실이지요?"
            },
            {
              "speaker": "W_SIG_INVESTIGATOR",
              "text": "네, 손목 타박상입니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r42",
          "seq": 42,
          "kind": "rebuttal_pass",
          "source": "defense",
          "witnessId": "W_SIG_INVESTIGATOR",
          "refId": "RH_SIG_CAUSE",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "재반대신문 없습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r43",
          "seq": 43,
          "kind": "witness_done",
          "source": "court",
          "witnessId": "W_SIG_INVESTIGATOR",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "증인은 돌아가도 좋습니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r44",
          "seq": 44,
          "kind": "evidence_filing",
          "source": "court",
          "memo": "가림막 뒤 현장 동선: 보류를 미신청으로 확정",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r45",
          "seq": 45,
          "kind": "argument_closed",
          "source": "court",
          "memo": "증거 신청 변경 마감",
          "lines": []
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r46",
          "seq": 46,
          "kind": "sentencing_request",
          "source": "court",
          "memo": "검사는 상해 공소사실에 대하여 피고인에게 징역 1년을 선고해 주시기를 구합니다. (실험용 고정 구형 · 실제 구형 기준 아님)",
          "lines": [
            {
              "speaker": "PROSECUTOR",
              "text": "검사는 상해 공소사실에 대하여 피고인에게 징역 1년을 선고해 주시기를 구합니다. (실험용 고정 구형 · 실제 구형 기준 아님)"
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r47",
          "seq": 47,
          "kind": "closing_argument",
          "source": "court",
          "refId": "FINAL_SIG_CAUSE",
          "lines": [
            {
              "speaker": "DEFENSE",
              "text": "밀침과 상해의 연결은 입증되지 않았습니다. 예비적으로 피고인의 사정을 살펴 선처해 주십시오."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r48",
          "seq": 48,
          "kind": "last_statement",
          "source": "court",
          "lines": [
            {
              "speaker": "CLIENT",
              "text": "어깨를 민 것은 잘못했습니다. 아직 피해 회복에 이르지 못한 점이 마음에 걸립니다."
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r49",
          "seq": 49,
          "kind": "sentencing_date",
          "source": "court",
          "memo": "2주 뒤 · 제2회 공판기일 · 선고",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "2주 뒤 · 제2회 공판기일 · 선고"
            }
          ]
        },
        {
          "id": "SIG_SEPARATED_MOMENTS:s1:r50",
          "seq": 50,
          "kind": "verdict",
          "source": "court",
          "lines": [
            {
              "speaker": "JUDGE",
              "text": "지금부터 판결을 선고하겠습니다."
            },
            {
              "speaker": "JUDGE",
              "text": "재판부는 공소사실과 그 안에 포함된 사실을 차례로 판단하였다."
            }
          ]
        }
      ],
      "results": {
        "video": {
          "performed": true,
          "recordId": "SIG_SEPARATED_MOMENTS:s1:r39"
        },
        "medical": {
          "performed": true,
          "recordId": "SIG_SEPARATED_MOMENTS:s1:r38"
        },
        "layout": {
          "performed": false,
          "recordId": null
        }
      },
      "outcome": {
        "key": "injury",
        "headline": "유죄 · 상해 — 징역 6월에 집행유예 1년",
        "text": "밀침과 그로 인한 손목 상해가 모두 인정되었습니다.",
        "pronouncement": "주문. 피고인을 징역 6월에 처한다. 다만, 이 판결 확정일부터 1년간 위 형의 집행을 유예한다.",
        "judgment": {
          "label": "유죄",
          "article": null
        },
        "offense": {
          "id": "injury",
          "label": "상해",
          "article": "형법 제257조 제1항"
        },
        "sentence": {
          "kind": "suspended",
          "label": "징역 집행유예",
          "pronouncement": "주문. 피고인을 징역 6월에 처한다. 다만, 이 판결 확정일부터 1년간 위 형의 집행을 유예한다.",
          "text": "징역 6월에 집행유예 1년",
          "reason": "초범이지만 피해 회복이 확인되지 않았다.",
          "disclaimer": "실험용 단순화 — 실제 양형기준 아님",
          "premise": "초범 전제"
        },
        "issues": [
          {
            "id": "ISSUE_SIG_ACT",
            "title": "밀침",
            "bandLabel": "입증됨",
            "memo": "목격 진술 — 피고인이 피해자를 밀었다"
          },
          {
            "id": "ISSUE_SIG_CAUSE",
            "title": "상해와의 연결",
            "bandLabel": "다툼 있음",
            "memo": "낙상 경위에 의문 — 연결 확인 필요"
          }
        ]
      }
    }
  }
};

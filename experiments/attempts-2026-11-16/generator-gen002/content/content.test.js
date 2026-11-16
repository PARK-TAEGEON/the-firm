'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('./index');
const copies = require('./copy');
const core = require('../core/contested');
const { validateArchetype, validateTwist } = require('../core/validate');
const T = require('../../engine/trial');
const { createTrialService } = require('../../services/trial');

test('폭행 4개·DUI 3개 반전이 기존 형식에 맞고 다른 원형 참조는 거부된다', () => {
  for (const a of Object.values(C.archetypes)) assert.deepEqual(validateArchetype(a), []);
  assert.equal(C.twists.length, 31);
  assert.equal(new Set(C.twists.map(t => t.id)).size, 31);
  assert.equal(C.archetypes.ARCH_CRIMINAL_ASSAULT.twists_allowed.length, 4);
  assert.equal(C.archetypes.ARCH_DUI.twists_allowed.length, 3);
  for (const a of Object.values(C.archetypes)) {
    assert.deepEqual(a.twists_allowed, C.twists.filter(t => t.appliesTo.includes(a.id)).map(t => t.id));
  }
  for (const t of C.twists) {
    const a = C.archetypes[t.appliesTo[0]];
    assert.deepEqual(validateTwist(a, t), []);
    assert.ok(t.opponentRecovery.effect.delta > 0);
    assert.ok(t.playerCounter.effect.delta < 0);
    assert.ok(validateTwist(a, { ...t, targetIssue: 'ISSUE_MISSING' }).length > 0);
    const other = Object.values(C.archetypes).find(other => other.id !== a.id);
    assert.ok(validateTwist(other, t).length > 0);
  }
});

test('일곱 반전은 0.60에서 활성화·0.59에서 비활성화하고 다른 원형에는 붙지 않는다', () => {
  for (const twist of C.twists) {
    const a = C.archetypes[twist.appliesTo[0]];
    const other = Object.values(C.archetypes).find(other => other.id !== a.id);
    assert.deepEqual(core.selectActivatedTwists(a, { [twist.activation.param]: 0.59 }, [twist]), []);
    assert.deepEqual(core.selectActivatedTwists(a, { [twist.activation.param]: 0.60 }, [twist]), [twist]);
    assert.deepEqual(core.selectActivatedTwists(other, { [twist.activation.param]: 1 }, [twist]), []);
  }
});

for (const id of Object.keys(C.archetypes)) {
  test(`${id}: 500시드 결정성·엔진 검증·문구 완결·활성/비활성 카드 참조`, () => {
    const before = structuredClone(C.archetypes);
    const twistsBefore = structuredClone(C.twists);
    const seen = new Set();
    for (let seed = 1; seed <= 500; seed++) {
      const d = C.buildContestedCase(id, seed);
      assert.deepEqual(d, C.buildContestedCase(id, seed));
      assert.equal(T.validate(d), true);
      assert.doesNotMatch(JSON.stringify(d), /placeholder|authored|교체 예정/i);
      const expected = core.selectActivatedTwists(C.archetypes[id], d.truth, C.twists);
      assert.deepEqual(d.twistsApplied, expected.map(t => t.id));
      seen.add(d.twistsApplied.join(','));
      for (const t of C.twists) {
        const active = d.twistsApplied.includes(t.id);
        const offered = active || (Boolean(C.archetypes[id].catalogId) && t.appliesTo.includes(id));
        assert.equal(d.cards.some(c => c.id === t.investigationCard.cardId), offered);
        assert.equal(d.investigations.some(i => i.id === t.investigationCard.investigationId), offered);
        assert.equal(d.witnesses.some(w => w.redirect.some(r => r.id === `RH_${t.id}`)), active);
      }
      const speakers = new Set([...Object.values(d.roles).map(r => r.id), ...d.witnesses.map(w => w.id)]);
      for (const w of d.witnesses) {
        const lines = [w.direct[0].lines, ...w.approaches.map(a => a.lines)];
        for (const step of w.direct.filter(s => s.type === 'objection')) {
          lines.push([step.question], step.pass.lines);
          assert.ok(step.proper ? step.sustained : step.overruled);
          lines.push((step.proper ? step.sustained : step.overruled).lines);
        }
        assert.deepEqual(w.presses.map(p => p.kind), ['limited', 'overreach']);
        for (const p of w.presses) {
          lines.push(p.fail.lines);
          if (p.kind === 'limited') { assert.ok(p.success); lines.push(p.success.lines); }
          else assert.equal(p.success, undefined, '과욕은 성공 분기가 없다');
        }
        for (const a of w.approaches.filter(a => a.stanceConflict)) lines.push(a.stanceConflict.lines);
        for (const r of w.redirect) lines.push(r.lines, r.rebuttal.lines);
        for (const group of lines) for (const [speaker, text] of group) {
          assert.ok(speakers.has(speaker));
          assert.ok(text.trim());
        }
      }
    }
    assert.equal(seen.size, 2 ** C.archetypes[id].twists_allowed.length, '반전 조합 전체 포함');
    assert.deepEqual(C.archetypes, before);
    assert.deepEqual(C.twists, twistsBefore);
  });

  test(`${id}: 콘텐츠 구성은 기존 준비 접근법과 truth·시드·수치를 보존한다`, () => {
    for (let seed = 1; seed <= 30; seed++) {
      const raw = core.buildContestedCase(C.archetypes[id], seed, C.twists);
      const d = C.buildContestedCase(id, seed);
      const mechanics = x => ({
        truth: x.truth, seed: x.seed, fee: x.fee, claimAmount: x.claimAmount,
        prep: [x.prep.budget, x.investigations.map(i => [i.id, i.cost, i.grants])],
        issues: x.issues.map(i => [i.id, i.baseline]), bands: x.bands, credibility: x.credibility,
        focus: x.opening.focus.map(f => [f.id, f.time]), stance: x.opening.stance.map(s => s.id),
        rule: [x.adjudication.rule, x.adjudication.required],
        witnesses: x.witnesses.map(w => [w.id, w.issue,
          w.approaches.filter(a => !a.id.endsWith('_UNSUPPORTED')).map(a => [a.id, a.requiresAny, a.delta, a.byStance, a.points, a.stanceConflict?.stance, a.stanceConflict?.credibility]),
          w.presses.map(p => [p.id, p.kind, p.minPoints, p.success?.delta, p.fail.delta, p.fail.credibility]),
          w.direct.filter(s => s.type === 'objection').map(s => [s.id, s.proper,
            ...['sustained', 'overruled', 'pass'].map(k => [s[k]?.effects, s[k]?.credibility])]),
          w.redirect.map(r => [r.id, r.when, r.delta, r.rebuttal.card, r.rebuttal.delta])])
      });
      assert.deepEqual(mechanics(d), mechanics(raw));
    }
  });

  test(`${id}: 일상 사건 문구에 민사 보증금이 섞이지 않고 입력이 결정적이다`, () => {
    const d = C.generateDailyCase(id, 42);
    assert.deepEqual(d, C.generateDailyCase(id, 42));
    assert.doesNotMatch(d.outcomeSummary, /보증금|placeholder|교체 예정/i);
    if (id === 'ARCH_DUI') assert.equal(d.claimAmount, 0);
  });

  test(`${id}: 준비 유무 양쪽에서 실제 서비스 완주·실패 원자성·기록 재생`, () => {
    for (const prepared of [false, true]) for (let seed = 1; seed <= 20; seed++) {
      const d = C.buildContestedCase(id, seed);
      const original = structuredClone(d);
      const s = createTrialService(d);
      const before = s.projection();
      assert.equal(s.command('investigate', { id: 'INV_MISSING' }).ok, false);
      assert.deepEqual(s.projection(), before);
      const ok = (action, payload) => {
        const result = s.command(action, payload);
        assert.equal(result.ok, true, `${action}: ${result.error}`);
        return result.view;
      };
      if (prepared) for (const i of d.investigations) {
        if (s.projection().investigations.find(inv => inv.id === i.id).affordable) ok('investigate', { id: i.id });
        else {
          const snapshot = s.projection();
          assert.equal(s.command('investigate', { id: i.id }).ok, false);
          assert.deepEqual(s.projection(), snapshot, '예산 초과 실패도 상태 불변');
        }
      }
      ok('finishPrep');
      let v = ok('open', { focusId: d.opening.focus[0].id, stanceId: d.opening.stance[0].id });
      const acted = new Set();
      for (let guard = 0; v.state.phase === 'trial' && guard < 150; guard++) {
        if (v.state.pending?.type === 'objection') v = ok('objection', { object: true });
        else if (v.state.pending?.type === 'rebuttal') v = ok('rebut', { use: true });
        else if (v.actions.verdict) v = ok('verdict');
        else if (v.state.cursor.part === 'cross') {
          if (acted.has(v.witness.id)) v = ok('endCross');
          else {
            acted.add(v.witness.id);
            const w = d.witnesses.find(w => w.id === v.witness.id);
            const available = v.actions.approaches.find(a => a.available && a.cards.length);
            const approach = prepared && available ? available : w.approaches.find(a => a.id.endsWith('_UNSUPPORTED'));
            ok('approach', { id: approach.id });
            v = ok('press', { id: w.presses[0].id });
          }
        } else v = ok('continue');
      }
      assert.equal(v.state.phase, 'verdict');
      if (!prepared) {
        assert.equal(v.verdict.outcome, 'guilty');
        assert.ok(v.records.filter(r => r.kind === 'press').every(r => r.succeeded === false));
        assert.ok(v.projection.witnesses.every(w => w.points.length === 0));
      }
      assert.deepEqual(T.replay(d, v.records).projection, v.projection);
      assert.ok(T.review(d, v.records));
      assert.deepEqual(d, original);
    }
  });
}

test('진실에 대응하는 문구가 분기 경계 양쪽을 반영한다', () => {
  const low = copies.ARCH_CRIMINAL_ASSAULT({ eyewitness_reliability: 0.59, self_defense_evidence: 0.59 });
  const high = copies.ARCH_CRIMINAL_ASSAULT({ eyewitness_reliability: 0.6, self_defense_evidence: 0.6 });
  assert.match(low.issues.ISSUE_IDENTITY.directAnswer, /옆모습/);
  assert.match(high.issues.ISSUE_IDENTITY.directAnswer, /얼굴과 팔/);
  assert.match(low.issues.ISSUE_CAUSATION.evidence[1].text, /연속 장면은 없다/);
  assert.match(high.issues.ISSUE_CAUSATION.evidence[1].text, /긁힌 자국/);
  const duiLow = copies.ARCH_DUI({ driver_observation: 0.59, measurement_connection: 0.59 });
  const duiHigh = copies.ARCH_DUI({ driver_observation: 0.6, measurement_connection: 0.6 });
  assert.match(duiLow.issues.ISSUE_DRIVER.evidence[0].text, /정차 뒤 처음/);
  assert.match(duiHigh.issues.ISSUE_DRIVER.directAnswer, /정차하기 직전/);
  assert.match(duiLow.issues.ISSUE_INTOXICATION.evidence[1].text, /확인한 기록이 없다/);
  assert.match(duiHigh.issues.ISSUE_INTOXICATION.directAnswer, /대조 기록도 확보/);
});

test('주신문은 입증할 내용을 말하고 한계·방어 정황은 카드 제시 때 드러난다', () => {
  for (const id of Object.keys(C.archetypes)) for (const value of [0.59, 0.6]) {
    const truth = Object.fromEntries(Object.keys(C.archetypes[id].truth_params).map(key => [key, value]));
    for (const c of Object.values(copies[id](truth).issues)) {
      assert.doesNotMatch(c.directAnswer + c.directMemo, /못했|못 함|한계|가려|미관찰|처음|방어|긁힌|후퇴|미확보/);
      assert.equal(c.resistance.length, c.evidence.length);
    }
  }
});

test('모든 접근법은 카드 없음·다른 카드·해당 카드의 기록과 근거 점수를 구분한다', () => {
  for (const id of Object.keys(C.archetypes)) {
    const d = C.buildContestedCase(id, 42);
    for (const w of d.witnesses) for (const a of w.approaches.filter(a => !a.id.endsWith('_UNSUPPORTED'))) {
      const fallback = w.approaches.find(f => f.id === `${a.id}_UNSUPPORTED`);
      const p = T.project(d, []);
      const before = structuredClone(p);
      assert.equal(T.resolveApproach(d, p, w.id, a.id).error, 'missing card');
      assert.deepEqual(p, before);
      p.cards = [d.cards.find(c => !a.requiresAny.includes(c.id)).id];
      assert.equal(T.resolveApproach(d, p, w.id, a.id).error, 'missing card');
      p.cards = [...a.requiresAny];
      const limited = w.presses.find(pr => pr.kind === 'limited');
      const overreach = w.presses.find(pr => pr.kind === 'overreach');
      assert.equal(limited.minPoints, 2);
      if (a.stanceConflict) {
        assert.equal(fallback, undefined);
        for (const stance of d.opening.stance) {
          p.stanceId = stance.id;
          const result = T.resolveApproach(d, p, w.id, a.id);
          assert.equal(result.delta, 0);
          assert.deepEqual(result.points, []);
          assert.deepEqual(result.cardsUsed, a.requiresAny);
          assert.equal(result.followups.length, stance.id === 'S_DENY' ? 1 : 0);
          if (result.followups.length) assert.equal(result.followups[0].credibility, -1);
        }
      } else {
        assert.ok(fallback);
        const resistance = T.resolveApproach(d, before, w.id, fallback.id);
        assert.equal(resistance.delta, 0);
        assert.deepEqual(resistance.points, []);
        assert.deepEqual(resistance.cardsUsed, []);
        assert.equal(T.pressSucceeds(limited, resistance.points), false);
        const concession = T.resolveApproach(d, p, w.id, a.id);
        assert.equal(concession.delta, -1);
        assert.equal(concession.points.length, 1);
        assert.deepEqual(concession.cardsUsed, a.requiresAny);
        assert.notDeepEqual(concession.lines, resistance.lines);
        assert.equal(T.pressSucceeds(limited, concession.points), false, '카드 하나로는 limited 실패');
        const allPoints = w.approaches.flatMap(a => a.points || []);
        assert.equal(allPoints.length, 2);
        assert.equal(T.pressSucceeds(limited, allPoints), true);
        assert.equal(T.pressSucceeds(overreach, allPoints), false);
        assert.equal(overreach.fail.delta, 2);
        assert.equal(overreach.fail.credibility, -1);
      }
    }
  }
});

test('알 수 없는 콘텐츠 요청은 원형 데이터를 오염시키지 않는다', () => {
  const before = structuredClone(C.archetypes);
  assert.throws(() => C.buildContestedCase('ARCH_MISSING', 1), /콘텐츠가 없는 원형/);
  assert.throws(() => C.generateDailyCase('toString', 1), /콘텐츠가 없는 원형/);
  assert.deepEqual(C.archetypes, before);
});


const P = require('../core/playthrough');
const { createRng, seedFor } = require('../core/rng');
const { otherIssueFirst } = require('../balance');

test('정책 c: 예산·카드·limited 조건, 재반대 사용, 결정성과 기록 재생', () => {
  const observed = new Set(), focuses = new Set(), stances = new Set();
  for (const id of Object.keys(C.archetypes)) for (let seed = 1; seed <= 100; seed++) {
    const d = C.buildContestedCase(id, seed), before = structuredClone(d);
    const play = () => P.playThroughSensible(d, createRng(seedFor(seed, id + ':random-policy')));
    const result = play();
    assert.deepEqual(result, play());
    assert.deepEqual(d, before);
    const records = result.view.records;
    assert.deepEqual(T.replay(d, records).projection, result.view.projection);
    const spending = records.filter(r => r.kind === 'investigation').reduce((s,r) => s + r.cost, 0);
    assert.ok(spending <= d.prep.budget);
    assert.ok(d.investigations.filter(i => !records.some(r => r.kind === 'investigation' && r.refId === i.id))
      .every(i => i.cost > d.prep.budget - spending), '구입 가능한 조사를 남기지 않음');
    for (let index = 0; index < records.length; index++) {
      const r = records[index];
      if (r.kind === 'opening') { focuses.add(r.focusId); stances.add(r.stanceId); }
      if (r.kind === 'approach') {
        assert.ok(r.cardsUsed.length > 0);
        const held = T.project(d, records.slice(0,index)).cards;
        assert.ok(r.cardsUsed.every(card => held.includes(card)));
      }
      if (r.kind === 'press') {
        observed.add('limited');
        assert.equal(r.pressKind, 'limited');
        assert.equal(r.succeeded, true);
        const w = d.witnesses.find(w => w.id === r.witnessId);
        const points = T.project(d, records.slice(0,index)).witnesses.find(w => w.id === r.witnessId).points;
        assert.equal(T.pressSucceeds(w.presses.find(p => p.id === r.refId), points), true);
      }
      if (r.kind === 'objection') observed.add(r.ruling);
      if (r.kind === 'redirect') {
        const w = d.witnesses.find(w => w.id === r.witnessId), redirect = w.redirect.find(h => h.id === r.refId);
        if (T.project(d,records.slice(0,index)).cards.includes(redirect.rebuttal.card)) {
          assert.ok(records.some(x => x.kind === 'rebuttal' && x.refId === r.refId));
          observed.add('rebuttal');
        }
      }
      assert.notEqual(r.kind, 'rebuttal_pass');
    }
  }
  assert.deepEqual([...observed].sort(), ['limited','overruled','pass','rebuttal','sustained']);
  assert.equal(focuses.size, 1 + Object.keys(C.archetypes).length * 2); // 균형 + 두 원형의 쟁점별 2개
  assert.equal(stances.size, 3);
});

test('정책 e: 기존 무작위의 과욕·무근거 추궁·재반대 포기를 참고 경로로 보존', () => {
  const seen = new Set();
  for (let seed = 1; seed <= 60; seed++) {
    const id = 'ARCH_CRIMINAL_ASSAULT', d = C.buildContestedCase(id, seed);
    const result = P.playThroughRandom(d, createRng(seedFor(seed, id + ':random-policy')));
    for (const r of result.view.records) {
      if (r.kind === 'press' && r.pressKind === 'overreach') seen.add('overreach');
      if (r.kind === 'approach' && !r.cardsUsed.length) seen.add('unsupported');
      if (r.kind === 'rebuttal_pass') seen.add('rebuttal_pass');
    }
    assert.deepEqual(T.replay(d,result.view.records).projection,result.view.projection);
  }
  assert.equal(seen.size,3);
});

test('정책 b/d: 준비된 접근법 뒤 limited, 조사 우선순위만 바꾼 대조군', () => {
  let presses = 0, changed = 0;
  for (const id of Object.keys(C.archetypes)) for (let seed = 1; seed <= 20; seed++) {
    const d = C.buildContestedCase(id, seed);
    for (const issue of d.issues) {
      const best = P.playBestPathForIssue(d, issue.id);
      const alternate = P.playBestPathForIssue(d, issue.id, { investigationOrder: otherIssueFirst(d, issue.id) });
      const opening = v => v.view.records.find(r => r.kind === 'opening');
      assert.deepEqual(opening(best),opening(alternate));
      for (const r of best.view.records.filter(r => r.kind === 'press')) {
        assert.equal(r.pressKind,'limited'); assert.equal(r.succeeded,true); presses++;
      }
      assert.ok(best.view.records.filter(r => r.kind === 'approach').every(r => r.cardsUsed.length));
      for (const v of [best,alternate]) {
        assert.ok(v.view.records.filter(r => r.kind === 'investigation').reduce((s,r)=>s+r.cost,0) <= d.prep.budget);
        assert.deepEqual(T.replay(d,v.view.records).projection,v.view.projection);
      }
      if (best.outcome !== alternate.outcome) changed++;
    }
  }
  assert.ok(presses > 0); assert.ok(changed > 0);
});

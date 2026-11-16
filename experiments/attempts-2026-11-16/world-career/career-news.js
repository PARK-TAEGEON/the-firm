'use strict';
const { when, link } = require('./career-pages');
const pack = require('./packs/ko-career');
const { korean } = require('./generator-source');
function careerArticles(s) {
  return s.records.filter(r => r.visibility === 'public' && r.grade === 'major').map((r, index) => {
    const lawyer = s.people.find(p => p.id === r.parties.lawyer);
    const firm = s.firms.find(f => f.id === r.parties.firm);
    const fields = { lawyer: lawyer.name, firm: firm.name, result: r.official.verdict, case: r.title };
    const templateId = index % pack.headlines.length;
    const headline = korean().render(pack.headlines[templateId], fields);
    return { id: `WN-${r.id}`, week: r.week - s.startWeek, templateId, category: '대형사건', importance: 5,
      visibility: 'inferred', sourceVisibility: 'public', sourceCaseId: r.id,
      personIds: [r.parties.lawyer, r.parties.prosecutor, r.parties.judge], firmIds: [r.parties.firm],
      attention: r.attention, headline,
      body: `${lawyer.name} 담당 사건에서 ${korean().withParticle(r.official.verdict, '이/가')} 선고됐다. ${r.scene.text || '기여 기록은 공식 사건 페이지에서 확인할 수 있다.'}`,
      interpretation: '제목의 평가는 기자의 해석이며 실력이나 향후 판결을 보장하지 않는다.' };
  });
}
function careerNews(s) {
  const articles = careerArticles(s);
  const front = [...articles].sort((a, b) => b.week - a.week || b.attention - a.attention || a.id.localeCompare(b.id)).slice(0, 7);
  const format = a => [`### ${a.headline}`, '', `${when(a.week)} · ${a.category} · 기자의 해석`, '', a.body, '',
    `${a.interpretation} [공식 기록](${`cases/${a.sourceCaseId}.md`})`, ''].join('\n');
  return ['# 업계 소식', '', '## 최근 1면', '', ...front.map(format), '## 전체 대형 사건 기사', '',
    ...articles.map(a => `- ${when(a.week)} · ${a.headline} · ${link({ id: a.sourceCaseId })}`), ''].join('\n');
}
module.exports = { careerArticles, careerNews };

'use strict';
const { calendar } = require('./data');
// Replays lifecycle events. Never reads annual/weekly aggregate values or final people.
function audit(events) {
  const people = new Map(), firms = new Set(), rows = [];
  const row = year => rows[year - 1] ||= { year, openings: 0, closures: 0, transfers: 0, leaves: 0, burnout: 0,
    entrants: new Set(), hired: new Set(), exited: new Set(), exits: 0, populationWeeks: 0, lawyerWeeks: 0, employedWeeks: 0, weeks: 0 };
  for (const e of events) {
    const id = e.personIds?.[0], p = people.get(id), y = e.week ? row(calendar(e.week).year) : null;
    switch (e.type) {
      case 'person_entered': people.set(id, { role: e.role, firmId: e.firmId, status: 'working' });
        if (y && e.role === 'lawyer') y.entrants.add(id); break;
      case 'firm_opened': firms.add(e.firmId); if (y) y.openings++; break;
      case 'firm_closed': firms.delete(e.firmId); y.closures++;
        for (const member of people.values()) if (member.firmId === e.firmId) member.firmId = null; break;
      case 'person_hired': case 'person_moved':
        p.firmId = e.to;
        if (e.from && e.reason !== 'founding') y.transfers++;
        if (y.entrants.has(id) && e.reason !== 'founding') y.hired.add(id); break;
      case 'office_departure': p.role = 'lawyer'; p.status = 'working'; p.leaveType = null; break;
      case 'office_appointment': p.role = e.role; p.firmId = null; break;
      case 'person_retired': p.status = 'retired'; p.leaveType = null; break;
      case 'market_exit': p.status = 'statistical'; p.firmId = null; p.leaveType = null; y.exits++;
        if (y.entrants.has(id)) y.exited.add(id); break;
      case 'leave_started': p.status = 'leave'; p.leaveType = e.leaveType; y.leaves++; y.burnout += Number(e.leaveType === 'burnout'); break;
      case 'leave_returned': p.status = 'working'; p.leaveType = null; break;
      case 'weekly_census': {
        const active = [...people.values()].filter(p => ['working', 'leave'].includes(p.status));
        const lawyers = active.filter(p => p.role === 'lawyer'), sizes = new Map();
        for (const p of lawyers) if (p.firmId) sizes.set(p.firmId, (sizes.get(p.firmId) || 0) + 1);
        const employed = lawyers.filter(p => p.firmId && sizes.get(p.firmId) > 1).length;
        y.weeks++; y.populationWeeks += active.length; y.lawyerWeeks += lawyers.length; y.employedWeeks += employed;
        Object.assign(y, { population: active.length, lawyers: lawyers.length, unemployed: lawyers.filter(p => !p.firmId).length,
          firmCount: firms.size, judges: active.filter(p => p.role === 'judge').length, prosecutors: active.filter(p => p.role === 'prosecutor').length });
        break;
      }
    }
  }
  return rows.map(y => ({ ...y, entrants: y.entrants.size, hired: y.hired.size, exited: y.exited.size,
    unemployedRate: y.unemployed / y.lawyers, openingRate: y.openings / (y.lawyerWeeks / y.weeks),
    transferRate: y.transfers / (y.employedWeeks / y.weeks), leaveRate: y.leaves / (y.populationWeeks / y.weeks),
    burnoutRate: y.burnout / (y.populationWeeks / y.weeks) }));
}
module.exports = { audit };

'use strict';
const assert = require('node:assert/strict');
// Compatibility harness: existing examination tests now explicitly complete any
// procedural gate. New procedure.test.js exercises all choices without this helper.
module.exports = function settle(service, result) {
  for (let n = 0; result.ok && result.view.state.pendingQuestion && n < 4; n++) {
    const o = result.view.procedure;
    if (o.stage === 'answer') result = service.command('answer',{ pendingId: o.pendingId });
    else result = service.command(o.stage === 'address' ? 'address' : 'respond', {
      pendingId: o.pendingId, response: o.stage === 'address' ? 'justify' : o.actions.includes('basis') ? 'basis' : 'maintain',
      basis: o.basis.map(({kind,refId}) => ({kind,refId})), issue: o.issue, inferenceId: o.inferenceId
    });
    assert.ok(result.ok,result.error);
  }
  return result;
};

const d = JSON.parse(JSON.stringify(require('../data/case')));
delete d.opening;
module.exports = d;

'use strict';
const D=require('../data/case');
module.exports=function profile(kind='full'){const d=JSON.parse(JSON.stringify(D));if(kind==='none'||kind==='actionOnly'){delete d.profile.phases.closing;delete d.profile.phases.closed;}if(kind==='none'||kind==='phaseOnly')d.profile.actions=d.profile.actions.filter(a=>!['beginClosing','submitClosing'].includes(a));return d;};

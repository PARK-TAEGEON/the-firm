(function (root, factory) {
  'use strict';
  var format = factory();
  if (typeof module === 'object' && module.exports) module.exports = format;
  else root.FirmFormat = format;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var integer = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });
  var manUnits = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 4 });
  var MAN = 10000;
  var EOK = MAN * MAN;

  return function format(value, kind) {
    var amount = Math.abs(value);
    var sign = value < 0 ? '−' : '';
    if (kind === 'money') {
      // Engine amounts are whole won. Four decimal places in 만 preserve every won.
      var eok = Math.floor(amount / EOK);
      var man = (amount % EOK) / MAN;
      var tail = manUnits.format(man) + '만';
      if (!eok) return sign + tail;
      return sign + integer.format(eok) + '억' + (man ? ' ' + tail : '');
    }

    if (kind === 'delta' && value > 0) sign = '+';
    var number = sign + integer.format(amount);
    if (kind === 'week') return number + '주차';
    if (kind === 'duration') return number + '주';
    if (kind === 'percent') return number + '%';
    return number;
  };
});

/* =========================================================
   pincode.js: delivery estimate for a PIN code (product page "Check" box).
   window.MMPincode.estimate(pin) -> { ok, kind, place, days, text }              (instant, by zone)
   window.MMPincode.check(pin)    -> Promise of the same shape                      (courier answer when available, else estimate)

   Orders ship from Mulund, Mumbai (the address on magicmeals.shop). The PIN code's first digits give the postal circle (state), and
   a few 3-digit prefixes are metro cities, so the estimate is by ZONE, not by a courier lookup:
       local        Mumbai and the Mumbai Metropolitan Region        1 to 2 working days
       metro        Pune, Delhi NCR, Bengaluru, Hyderabad, ...       2 to 4
       regional     the rest of Maharashtra, Goa, Gujarat, MP, ...   3 to 5
       standard     the rest of India                                4 to 6
       remote       North-East, J&K, Himachal, islands, Sikkim       6 to 9
       army (9x)    Army Post Office PIN codes: no courier delivery
   These are ESTIMATES (the old store's Delivery Policy only says "metro cities within a few working days, other locations slightly
   longer"). check(pin) first asks the courier through /api/pincode (api/pincode.js, Shiprocket: Delhivery, Blue Dart, ...), which gives
   the real serviceability and days; when that is not set up or does not answer, it falls back to this estimate.
   ========================================================= */
(function () {
  'use strict';

  // first two digits -> [state / region, zone]
  var CIRCLE = {
    11: ['Delhi', 'metro'], 12: ['Haryana', 'standard'], 13: ['Haryana', 'standard'], 14: ['Punjab', 'standard'], 15: ['Punjab', 'standard'],
    16: ['Punjab', 'standard'], 17: ['Himachal Pradesh', 'remote'], 18: ['Jammu & Kashmir', 'remote'], 19: ['Jammu & Kashmir', 'remote'],
    20: ['Uttar Pradesh', 'standard'], 21: ['Uttar Pradesh', 'standard'], 22: ['Uttar Pradesh', 'standard'], 23: ['Uttar Pradesh', 'standard'],
    24: ['Uttar Pradesh / Uttarakhand', 'standard'], 25: ['Uttar Pradesh', 'standard'], 26: ['Uttar Pradesh / Uttarakhand', 'standard'],
    27: ['Uttar Pradesh', 'standard'], 28: ['Uttar Pradesh', 'standard'],
    30: ['Rajasthan', 'standard'], 31: ['Rajasthan', 'standard'], 32: ['Rajasthan', 'standard'], 33: ['Rajasthan', 'standard'], 34: ['Rajasthan', 'standard'],
    36: ['Gujarat', 'regional'], 37: ['Gujarat', 'regional'], 38: ['Gujarat', 'regional'], 39: ['Gujarat', 'regional'],
    40: ['Maharashtra', 'regional'], 41: ['Maharashtra', 'regional'], 42: ['Maharashtra', 'regional'], 43: ['Maharashtra', 'regional'], 44: ['Maharashtra', 'regional'],
    45: ['Madhya Pradesh', 'regional'], 46: ['Madhya Pradesh', 'regional'], 47: ['Madhya Pradesh', 'regional'], 48: ['Madhya Pradesh', 'regional'],
    49: ['Chhattisgarh', 'standard'],
    50: ['Telangana', 'regional'], 51: ['Andhra Pradesh', 'standard'], 52: ['Andhra Pradesh', 'standard'], 53: ['Andhra Pradesh', 'standard'],
    56: ['Karnataka', 'regional'], 57: ['Karnataka', 'regional'], 58: ['Karnataka', 'regional'], 59: ['Karnataka', 'regional'],
    60: ['Tamil Nadu', 'standard'], 61: ['Tamil Nadu', 'standard'], 62: ['Tamil Nadu', 'standard'], 63: ['Tamil Nadu', 'standard'], 64: ['Tamil Nadu', 'standard'],
    67: ['Kerala', 'standard'], 68: ['Kerala', 'standard'], 69: ['Kerala', 'standard'],
    70: ['West Bengal', 'standard'], 71: ['West Bengal', 'standard'], 72: ['West Bengal', 'standard'], 73: ['West Bengal', 'standard'], 74: ['West Bengal', 'standard'],
    75: ['Odisha', 'standard'], 76: ['Odisha', 'standard'], 77: ['Odisha', 'standard'],
    78: ['Assam', 'remote'], 79: ['the North-East', 'remote'],
    80: ['Bihar', 'standard'], 81: ['Bihar / Jharkhand', 'standard'], 82: ['Bihar / Jharkhand', 'standard'], 83: ['Jharkhand', 'standard'],
    84: ['Bihar', 'standard'], 85: ['Bihar / Jharkhand', 'standard']
  };
  // first three digits that override the circle
  var PLACE = {
    '400': ['Mumbai', 'local'], '401': ['Mumbai region', 'local'], '410': ['Navi Mumbai / Raigad', 'local'], '421': ['Thane / Kalyan', 'local'],
    '411': ['Pune', 'metro'], '110': ['Delhi', 'metro'], '122': ['Gurugram', 'metro'], '201': ['Noida / Ghaziabad', 'metro'], '121': ['Faridabad', 'metro'],
    '560': ['Bengaluru', 'metro'], '500': ['Hyderabad', 'metro'], '600': ['Chennai', 'metro'], '700': ['Kolkata', 'metro'],
    '380': ['Ahmedabad', 'metro'], '395': ['Surat', 'metro'],
    '403': ['Goa', 'regional'], '605': ['Puducherry', 'standard'], '160': ['Chandigarh', 'standard'], '737': ['Sikkim', 'remote'],
    '744': ['Andaman & Nicobar', 'remote'], '682': ['Kerala', 'standard'], '194': ['Ladakh', 'remote']
  };
  var DAYS = { local: '1 to 2', metro: '2 to 4', regional: '3 to 5', standard: '4 to 6', remote: '6 to 9' };

  function estimate(raw) {
    var pin = String(raw == null ? '' : raw).replace(/\s+/g, '');
    if (!/^\d{6}$/.test(pin)) return { ok: false, kind: 'invalid', text: 'Please enter a valid 6-digit PIN code.' };
    var c = CIRCLE[+pin.slice(0, 2)];
    var p = PLACE[pin.slice(0, 3)];
    if (+pin.slice(0, 2) >= 90) return { ok: false, kind: 'army', text: 'This is an Army Post Office PIN code, so we cannot deliver there. Please use a regular address, or contact us.' };
    if (pin.slice(0, 5) === '68255') { c = null; p = ['Lakshadweep', 'remote']; }                  // 682551 to 682559 are islands; the rest of 682 is Kochi
    if (!c && !p) return { ok: false, kind: 'unknown', text: 'We could not find this PIN code. Please check it and try again.' };
    var zone = p ? p[1] : c[1];
    var place = p ? p[0] : c[0];
    var days = DAYS[zone];
    var text = 'Estimated delivery to ' + place + ': ' + days + ' working days.';
    if (zone === 'remote') text += ' Remote areas can take longer.';
    return { ok: true, kind: zone, place: place, days: days, text: text };
  }

  function askCourier(pin, ms) {
    return new Promise(function (resolve) {
      var done = false;
      function finish(v) { if (!done) { done = true; resolve(v); } }
      var timer = setTimeout(function () { finish(null); }, ms);
      try {
        fetch('/api/pincode?pin=' + encodeURIComponent(pin), { headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json(); })
          .then(function (j) { clearTimeout(timer); finish(j); })
          .catch(function () { clearTimeout(timer); finish(null); });
      } catch (e) { clearTimeout(timer); finish(null); }
    });
  }

  function check(raw) {
    var local = estimate(raw);
    if (!local.ok) return Promise.resolve(local);                      // invalid / army / unknown: no need to ask the courier
    var pin = String(raw).replace(/\s+/g, '');
    return askCourier(pin, 5000).then(function (j) {
      if (j && j.ok && j.serviceable === false) {
        return { ok: false, kind: 'unserviceable', text: 'Sorry, our delivery partners do not deliver to this PIN code yet. Please contact us and we will try to help.' };
      }
      if (j && j.ok && j.serviceable) {
        var days = j.minDays === j.maxDays ? String(j.minDays) : j.minDays + ' to ' + j.maxDays;
        return { ok: true, kind: 'courier', place: local.place, days: days, text: 'Estimated delivery to ' + local.place + ': ' + days + ' days after dispatch.' };
      }
      return local;                                                      // courier lookup not set up / not reachable: the zone estimate
    });
  }

  window.MMPincode = { estimate: estimate, check: check };

  // the box on the product page: digits only, Enter checks, editing clears the old answer
  document.addEventListener('input', function (e) {
    if (!e.target || e.target.id !== 'pincodeInput') return;
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    var box = document.getElementById('pincodeResult');
    if (box) box.hidden = true;
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || !e.target || e.target.id !== 'pincodeInput') return;
    e.preventDefault();
    var b = document.getElementById('checkPincodeBtn');
    if (b) b.click();
  });
})();

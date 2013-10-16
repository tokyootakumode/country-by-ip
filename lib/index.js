var ip = require('ip');
var ips = require('../config/ips');
var countries = require('../config/countries');
var ipsLength = ips.length;

module.exports = {
  getCountryCode: function(addr) {
    var longAddr = ip.toLong(addr);
    var min = -1;
    var max = ipsLength;
    while (true) {
      var center = Math.floor((min + max) / 2);
      if (center === min) {
        return null;
      }

      var range = ips[center];

      if (longAddr < range.network) {
        max = center;
      } else if (range.network <= longAddr && longAddr <= range.broadcast) {
        return range.cc;
      } else {
        min = center;
      }
    }
  },

  getCountry: function(addr) {

    var cc = this.getCountryCode(addr);
    if (!cc || !countries[cc]) {
      return null;
    }

    return countries[cc];
  }

}


var ip = require('ip');
var ips = require('../config/ips');
var countries = require('../config/countries');
var ipsLength = ips.length;

module.exports = {
  /**
   * IP Address to counry code
   *
   * @param {String} IP address
   * @returns {String} Country code
   */
  getCountryCode: function(addr) {
    addr = addr || '';
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

  /**
   * IP address to counry object
   *
   * - Country
   *   - { name: { en: 'United States', ja: 'アメリカ' } }
   *
   * @param {String} IP Address
   * @returns {Object} Country
   */
  getCountry: function(addr) {

    var cc = this.getCountryCode(addr);
    if (!cc || !countries[cc]) {
      return null;
    }

    return countries[cc];
  },

  /**
   * Country code to country name
   *
   * @param {String} country ode
   * @param {String} language
   * @returns {String} country name
   */
  getCountryNameByCode: function(code, lang) {
    if (!code) return null;
    lang = lang || 'en';

    var country = countries[code] || {name: {}};

    return country.name[lang] || null;
  }
}


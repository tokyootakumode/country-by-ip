'use strict';

const ip = require('ip');
const definition = require('./definition');
const ipb = require('fs').readFileSync(definition.IP_DATA_FILE);
const countries = require('../data/countries');
const ipsLength = ipb.length / definition.RECORD_LENGTH;

module.exports = {
  /**
   * IP Address to counry code
   *
   * @param {String} IP address
   * @returns {String} Country code
   */
  getCountryCode(addr) {
    addr = addr || '';
    const longAddr = ip.toLong(addr);
    let min = 0;
    let max = ipsLength;

    while (max >= min && ipsLength > min) {
      const center = Math.floor(min + (max - min) / 2);
      const offset = center * definition.RECORD_LENGTH;
      const network = ipb.readUInt32BE(offset);
      const broadcast = ipb.readUInt32BE(offset + 4);

      if (longAddr < network) {
        max = center - 1;
      } else if (network <= longAddr && longAddr <= broadcast) {
        const countryCode = ipb.toString('ascii', offset + 8, offset + 10);
        return countryCode;
      } else {
        min = center + 1;
      }
    }

    return null;
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
  getCountry(addr) {
    const cc = this.getCountryCode(addr);
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
  getCountryNameByCode(code, lang) {
    if (!code) {
      return null;
    }

    lang = lang || 'en';

    const country = countries[code] || { name: {} };

    return country.name[lang] || null;
  }
};

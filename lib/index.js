'use strict';

const ip = require('ip');
const definition = require('./definition');
const ipb = require('fs').readFileSync(definition.IP_DATA_FILE);
const countries = require('../data/countries');
const ipsLength = ipb.length / definition.RECORD_LENGTH;
let firstCenterCache = null;

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
    let min = -1;
    let max = ipsLength;

    while (true) {
      const center = Math.floor((min + max) / 2);
      if (center === min) {
        return null;
      }

      const offset = center * definition.RECORD_LENGTH;
      let network, broadcast, countryCode;

      if (firstCenterCache && firstCenterCache.center === center) {
        network = firstCenterCache.network;
        broadcast = firstCenterCache.broadcast;
        countryCode = firstCenterCache.countryCode;
      } else {
        network = ipb.readUInt32BE(offset);
        broadcast = ipb.readUInt32BE(offset + 4);
        countryCode = ipb.toString('ascii', offset + 8, offset + 10);
      }

      if (!firstCenterCache) {
        firstCenterCache = {
          center,
          network,
          broadcast,
          countryCode
        };
      }

      if (longAddr < network) {
        max = center;
      } else if (network <= longAddr && longAddr <= broadcast) {
        return countryCode;
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

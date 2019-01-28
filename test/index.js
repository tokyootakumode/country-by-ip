'use strict';

const assert = require('assert');
const countryByIP = require('../lib/');

describe('Convert IP to country', () => {
  context('IPs of JP', () => {
    const ips = ['59.156.223.124', '183.77.253.88'];
    for (let ip of ips) {
      context(`${ip}`, () => {
        it('Should return JP and Japan', () => {
          const cc = countryByIP.getCountryCode(ip);
          const country = countryByIP.getCountry(ip);
          assert.equal(cc, 'JP');
          assert.equal(country.name.en, 'Japan');
        });
      });
    }
  });

  context('IPs of US', () => {
    const ips = ['184.169.144.234', '104.53.16.215'];
    for (let ip of ips) {
      context(`${ip}`, () => {
        it('Should return US and United States', () => {
          const cc = countryByIP.getCountryCode(ip);
          const country = countryByIP.getCountry(ip);
          assert.equal(cc, 'US');
          assert.equal(country.name.en, 'United States');
        });
      });
    }
  });

  context('IPs of CN', () => {
    const ips = ['220.181.111.85', '123.125.114.144'];
    for (let ip of ips) {
      context(`${ip}`, () => {
        it('Should return CN and China', () => {
          const cc = countryByIP.getCountryCode(ip);
          const country = countryByIP.getCountry(ip);
          assert.equal(cc, 'CN');
          assert.equal(country.name.en, 'China');
        });
      });
    }
  });
});

describe('Convert country code to country name', function() {
  context('Country name in English', function() {
    const codes = [
      {
        key: 'JP',
        value: 'Japan'
      },
      { key: 'US', value: 'United States' },
      { key: 'CA', value: 'Canada' },
      { key: '', value: null },
      { key: '11', value: null }
    ];

    for (let code of codes) {
      const name = countryByIP.getCountryNameByCode(code.key);
      context(`${JSON.stringify(code.key)}`, () => {
        it(`Should return ${code.value}`, () => {
          assert.equal(name, code.value);
        });
      });
    }
  });

  context('Country name in Japanese', function() {
    const codes = [
      {
        key: 'JP',
        value: '日本'
      },
      { key: 'US', value: 'アメリカ' },
      { key: 'CA', value: 'カナダ' },
      { key: '', value: null },
      { key: '11', value: null }
    ];

    for (let code of codes) {
      const name = countryByIP.getCountryNameByCode(code.key, 'ja');
      context(`${JSON.stringify(code.key)}`, () => {
        it(`Should return ${code.value}`, () => {
          assert.equal(name, code.value);
        });
      });
    }
  });
});

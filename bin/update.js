'use strict';

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const co = require('co');
const temp = require('temp');
const ip = require('ip');
const https = require('https');
const promisify = require('util.promisify');
const logger = require('log4js').getLogger('default');
logger.level = 'debug';
const unzip = require('node-unzip-2');
const csv = require('csv-parser');
const definition = require('../lib/definition');

const getRemoteCheckSum = () => {
  return new Promise((resolve, reject) => {
    https.get(definition.CSV_CHECK_SUM_URL, res => {
      let rawData = '';
      res
        .on('data', chunk => {
          rawData += chunk;
        })
        .on('error', err => reject(err))
        .on('end', () => resolve(rawData));
    });
  });
};

const getLocalCheckSum = function*() {
  return yield promisify(fs.readFile)(definition.CHECKSUM_FILE, {
    encoding: 'utf8'
  });
};

const saveLocalCheckSum = function*(checkSum) {
  yield promisify(fs.writeFile)(definition.CHECKSUM_FILE, checkSum, {
    encoding: 'utf8'
  });
};

const downloadZipFile = dist => {
  return new Promise((resolve, reject) => {
    https.get(definition.CSV_URL, res => {
      const rawData = [];
      res
        .on('data', chunk => {
          rawData.push(chunk);
        })
        .on('error', err => reject(err))
        .on('end', () => {
          const buffer = Buffer.concat(rawData);
          const md5 = crypto
            .createHash('md5')
            .update(buffer, 'binary')
            .digest('hex');

          fs.writeFile(dist, buffer, err => {
            if (err) {
              return reject(err);
            }
            resolve(md5);
          });
        });
    });
  });
};

const extract = ({ zipPath, ipCsvPath, locationsCsvPath }) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzip.Parse())
      .on('err', err => reject(err))
      .on('entry', entry => {
        const matches = entry.path.match(/^(.+)\/(.+\.\w+$)/);
        const fileName = matches[2];

        switch (fileName) {
          case 'GeoLite2-Country-Blocks-IPv4.csv':
            entry.pipe(fs.createWriteStream(ipCsvPath));
            break;
          case 'GeoLite2-Country-Locations-en.csv':
            entry.pipe(fs.createWriteStream(locationsCsvPath));
            break;
          default:
            entry.autodrain();
            break;
        }
      })
      .on('finish', () => resolve());
  });
};

const buildCountryDic = ({ locationsCsvPath }) => {
  return new Promise((resolve, reject) => {
    const countryDic = {};

    fs.createReadStream(locationsCsvPath)
      .pipe(csv({ trim: true, columns: true }))
      .on('data', data => {
        if (data['country_iso_code']) {
          countryDic[data['geoname_id']] = data['country_iso_code'];
        } else if (data['continent_code']) {
          countryDic[data['geoname_id']] = data['continent_code'];
        }
      })
      .on('err', err => reject(err))
      .on('finish', () => {
        resolve(countryDic);
      });
  });
};
const buildIpDic = ({ countryDic, ipCsvPath }) => {
  return new Promise((resolve, reject) => {
    const ranges = [];

    fs.createReadStream(ipCsvPath)
      .pipe(csv({ trim: true, columns: true }))
      .on('data', data => {
        const cidr = data['network'];
        const geoNameId = data['geoname_id'];
        const registeredCountryGeonameId =
          data['registered_country_geoname_id'];

        const cc =
          countryDic[geoNameId] || countryDic[registeredCountryGeonameId];
        const result = ip.cidrSubnet(cidr);

        if (!cc) {
          return;
        }

        ranges.push({
          cc: cc,
          network: ip.toLong(result.networkAddress),
          broadcast: ip.toLong(result.broadcastAddress)
        });
      })
      .on('err', err => reject(err))
      .on('finish', () => {
        ranges.sort((a, b) => {
          if (a.network === b.network) {
            return 0;
          } else if (a.network < b.network) {
            return -1;
          } else {
            return 1;
          }
        });

        resolve(ranges);
      });
  });
};

const saveDataAsBinary = ranges => {
  return new Promise((resolve, reject) => {
    const output = fs
      .createWriteStream(definition.IP_DATA_FILE)
      .on('err', err => reject(err))
      .on('finish', () => {
        resolve();
      });

    ranges.forEach(range => {
      const b = Buffer.alloc(10);
      b.writeUInt32BE(range.network, 0);
      b.writeUInt32BE(range.broadcast, 4);
      b.write(range.cc, 8, 'ascii');
      output.write(b);
    });
    output.end();
  });
};

co(function*() {
  temp.track();

  const dirPath = yield promisify(temp.mkdir).bind(temp)('geoip');
  const zipPath = path.join(dirPath, 'ip.zip');
  const ipCsvPath = path.join(dirPath, 'ip.csv');
  const locationsCsvPath = path.join(dirPath, 'locations.csv');

  const remoteCheckSum = yield getRemoteCheckSum();
  const localCheckSum = yield getLocalCheckSum();
  if (remoteCheckSum === localCheckSum) {
    logger.info('Data is up to date.');
    return;
  }

  logger.info(`Download the zip file from ${definition.CSV_URL}`);
  const md5CheckSum = yield downloadZipFile(zipPath);
  logger.info('  End');

  if (md5CheckSum !== remoteCheckSum) {
    throw Error('Check sum is not match.');
  }

  logger.info('Extract the zip file');
  yield extract({ zipPath, ipCsvPath, locationsCsvPath });
  logger.info('  End');

  logger.info('Build the country dictionary');
  const countryDic = yield buildCountryDic({ locationsCsvPath });
  logger.info('  End');

  logger.info('Build the IP dictionary');
  const ranges = yield buildIpDic({ countryDic, ipCsvPath });
  logger.info('  End');

  logger.info('Save the IP dictionary');
  yield saveDataAsBinary(ranges);
  logger.info('  End');

  logger.info('Save the new checksum');
  yield saveLocalCheckSum(remoteCheckSum);
  logger.info('  End');
}).catch(err => {
  logger.error(err);
});

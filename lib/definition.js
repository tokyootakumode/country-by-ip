'use strict';

const RECORD_LENGTH = 10;
const CSV_URL =
  'https://geolite.maxmind.com/download/geoip/database/GeoLite2-Country-CSV.zip';
const CSV_CHECK_SUM_URL =
  'https://geolite.maxmind.com/download/geoip/database/GeoLite2-Country-CSV.zip.md5';
const IP_DATA_FILE = `${__dirname}/../data/ip.bin`;
const CHECKSUM_FILE = `${__dirname}/../data/checksum.txt`;
module.exports = {
  RECORD_LENGTH,
  CSV_URL,
  CSV_CHECK_SUM_URL,
  IP_DATA_FILE,
  CHECKSUM_FILE
};

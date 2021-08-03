'use strict';

const RECORD_LENGTH = 10;
const CSV_FILE = `${__dirname}/../GeoLite2-Country-CSV.zip`;
const CSV_CHECK_SUM_FILE = `${__dirname}/../GeoLite2-Country-CSV.zip.sha256`;
const IP_DATA_FILE = `${__dirname}/../data/ip.bin`;
const CHECKSUM_FILE = `${__dirname}/../data/checksum.txt`;
module.exports = {
  RECORD_LENGTH,
  CSV_FILE,
  CSV_CHECK_SUM_FILE,
  IP_DATA_FILE,
  CHECKSUM_FILE
};

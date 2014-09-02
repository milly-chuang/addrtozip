/*jslint node: true, nomen: true, plusplus: true, stupid: true, vars: true, indent: 2 */
'use strict';
var address = require('./address');
var rule = require('./rule');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');

var _DB_PATH = __dirname + '/../db/zipcode.db';
var _NO    = 1;
var _SUBNO = 2;
var _NAME  = 3;
var _UNIT  = 4;

var db = new sqlite3.Database(_DB_PATH);

(function () {
  var zipcode = {};

  //precise mode, query 5 numbers zipcode
  var getRsPair = function (addr, callback) {
    db.serialize(function () {
      db.run('BEGIN TRANSACTION');
      db.all('SELECT rule_str, zipcode FROM precise WHERE addr_str =?', addr, function (err, rows) {
        callback(err, rows);
      });
      db.run('COMMIT TRANSACTION');
    });
  };

  //gradual mode, query 0~5 numbers zipcode
  var getGradual = function (addr, callback) {
    db.serialize(function () {
      db.run('BEGIN TRANSACTION');
      db.get('SELECT zipcode FROM gradual WHERE addr_str = ?', addr, function (err, rows) {
        callback(err, rows);
      });
      db.run('COMMIT TRANSACTION');
    });
  };

  //find addr zipcode
  zipcode.find = function (addr, callback) {
    // Check callback exist
    if (typeof callback !== 'function') {
      return;
    }

    // Check addr exist
    if (!addr || (typeof addr !== 'string')) {
      return callback({});
    }

    var addrOri = addr;
    addr = address.normalize(addr);
    var addrTokens = address.tokenize(addr);
    var lenAddrTokens = addrTokens.length;
    var lenNum = lenAddrTokens;

    var result = {};
    result.zipcode = '';
    result.addr = addrOri;

    //get toekns length of querying db condition
    //such as '[臺北市],[中正區],[重慶南路],[1段],[122號]', we exclude lane alley no , addr will be '[臺北市],[中正區],[重慶南路],[1段]', and it's the tokens we need.
    var addrToken;
    while (lenNum > 0) {
      addrToken = addrTokens[lenNum - 1];
      if (!addrToken[_NO] && !addrToken[_SUBNO]) {
        break;
      }
      lenNum--;
    }
    // sometimes lane(alley) name will not only number, such as 草埔七巷 
    // so when last unit is lane or alley, lenNum++
    if (lenNum !== lenAddrTokens && (addrTokens[lenNum][_UNIT] === '巷' || addrTokens[lenNum][_UNIT] === '弄')) {
      lenNum++;
    }
    var i = lenNum;
    var rsPair;
    //decrease tokens until find db data
    async.forever(
      function (next) {
        if (lenAddrTokens < 3) {
          return next('Done');
        }

        getRsPair(address.flat(addrTokens, i), function (err, rows) {
          if (err) {
            console.log('getRsPair DB error');
            console.log(JSON.stringify(err, null, 2));
            return callback(result);
          }
          rsPair = rows;
          //if addrTokens is [臺北市],[中正區],[XX里],[X鄰],[重慶南路],[1段],[122號] and no db data
          //we have to remove addrTokens[3]([X鄰])
          //after [XX里] is [X號], we only chage [XX里] to [XX], such as 東清村 change to 東清
          //if after [XX里] isn't [X號], we remove [XX里] 
          if (i === lenNum && lenAddrTokens >= 4 &&
              '村里'.indexOf(addrTokens[2][_UNIT]) !== -1 &&
              !rsPair.length) {
            if (addrTokens[3][_UNIT] === '鄰') {
              addrTokens.splice(3, 1);
              lenAddrTokens--;
              i--;
            }

            if (lenAddrTokens >= 4 && addrTokens[2][_NAME].length === 2 && (addrTokens[3][_UNIT] === '號')) {
              addrTokens[2] = [addrTokens[2][_NAME], '', '', addrTokens[2][_NAME], ''];
            } else if (addrTokens[2][_NAME].length === 2) {
              addrTokens.splice(2, 1);
              lenAddrTokens--;
            }

            getRsPair(address.flat(addrTokens, i), function (err, rows) {
              if (err) {
                console.log('getRsPair DB error');
                console.log(JSON.stringify(err, null, 2));
                return callback(result);
              }

              rsPair = rows;
              if (rsPair) {
                var j = 0, lenJ = rsPair.length;
                for (j = 0; j < lenJ; j++) {
                  if (rule.match(rsPair[j].rule_str, address.flat(addrTokens))) {
                    result.zipcode = rsPair[j].zipcode;
                    return callback(result);
                  }
                }
              }
              if (i > 1) {
                i--;
                return next();
              }
              return next('Done');
            });
          } else {
            if (rsPair) {
              var k, lenK = rsPair.length;
              for (k = 0; k < lenK; k++) {
                if (rule.match(rsPair[k].rule_str, address.flat(addrTokens))) {
                  result.zipcode = rsPair[k].zipcode;
                  return callback(result);
                }
              }
            }
            if (i > 2) {
              i--;
              return next();
            }
            return next('Done');
          }
        });
      },
      function () {
        i = lenAddrTokens;
        async.forever(
          function (next) {
            getGradual(address.flat(addrTokens, i), function (err, row) {
              if (err) {
                console.log('getGradual DB error');
                console.log(JSON.stringify(err, null, 2));
                return callback(result);
              }

              if (row) {
                result.zipcode = row.zipcode;
                return callback(result);
              }
              if (i > 1) {
                i--;
                return next();
              }
              return next('Done');
            });
          },
          function () {
            return callback(result);
          }
        );
      }
    );
  };

  // Get list of cities
  zipcode.getCities = function(callback) {
    // Check callback exist
    if (typeof callback !== 'function') {
      return;
    }

    db.all('SELECT * FROM cities', function (err, rows) {
      callback(err, rows);
    });
  }

  // Get list of areas by provided city
  zipcode.getAreas = function(city, callback) {
    // Check callback exist
    if (typeof callback !== 'function') {
      return;
    }

    // Check city exist
    if (!city || (typeof city !== 'string')) {
      return callback({});
    }

    db.all('SELECT T2.* FROM cities T1 JOIN areas T2 ON T2.belongCity = T1.cityName WHERE T1.cityName = ? OR T1.zh_tw = ?', city, city, function (err, rows) {
      callback(err, rows);
    });
  }

  module.exports = zipcode;
}());
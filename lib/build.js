/*jslint node: true, nomen: true, plusplus: true, stupid: true, vars: true, indent: 2 */
'use strict';

var _DB_PATH = __dirname + '/../db/zipcode.db';
var _ZIPCODE_CSV_PATH = __dirname + '/../src/201407.csv';
var _CITY_LIST_PATH = __dirname + '/../src/cityList.csv';
var _AREA_LIST_PATH = __dirname + '/../src/areaList.csv';

var async = require('async');
var fs = require('fs');
var address = require('./address');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(_DB_PATH);

function getMinPart(zipcodeA, zipcodeB) {
  if (zipcodeA === undefined) {
    return zipcodeB;
  }

  if (zipcodeB === undefined) {
    return zipcodeA;
  }

  var i, len;
  var minLen = 0;
  for (i = 0, len = Math.min(zipcodeA.length, zipcodeB.length); i < len; i++) {
    if (zipcodeA[i] !== zipcodeB[i]) {
      break;
    }

    minLen = i + 1;
  }

  return zipcodeA.slice(0, minLen);
}

function replaceGradual(addrUnit, zipcode, callback) {
  db.get('SELECT zipcode FROM gradual WHERE addr_str = ?', addrUnit, function (err, row) {
    if (err) {
      return callback(err);
    }

    var dbzipcode = row ? row.zipcode : row;
    var dbNewZipcode = getMinPart(zipcode, dbzipcode);

    dbNewZipcode = dbNewZipcode || '';
    db.run('REPLACE INTO gradual VALUES (?, ?)', addrUnit, dbNewZipcode, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  });
}

db.serialize(function () {
  db.run('BEGIN TRANSACTION');
  db.run('DROP TABLE IF EXISTS precise;');
  db.run('DROP TABLE IF EXISTS gradual;');
  db.run('DROP TABLE IF EXISTS cities;');
  db.run('DROP TABLE IF EXISTS areas;');
  db.run('CREATE TABLE precise(addr_str TEXT, rule_str TEXT, zipcode TEXT, PRIMARY KEY (addr_str, rule_str))');
  db.run('CREATE TABLE gradual(addr_str TEXT PRIMARY KEY, zipcode TEXT)');
  db.run('CREATE TABLE cities(cityName TEXT PRIMARY KEY, zh_tw TEXT)');
  db.run('CREATE TABLE areas(areaName TEXT, zh_tw TEXT, belongCity TEXT, PRIMARY KEY (areaName, belongCity))');
});

// Build cities list
var cities = fs.readFileSync(_CITY_LIST_PATH, 'utf8');
var lines = cities.trim().split('\n');
for(var i = 0, len = lines.length; i < len; i++) {
  var line = lines[i].trim().split(',');
  db.run('INSERT INTO cities VALUES (?, ?)', line[1], line[0]);
}

// Build areas list
var areas = fs.readFileSync(_AREA_LIST_PATH, 'utf8');
var lines = areas.trim().split('\n');
for(var i = 0, len = lines.length; i < len; i++) {
  var line = lines[i].trim().split(',');
  db.run('INSERT INTO areas VALUES (?, ?, ?)', line[1], line[0], line[2]);
}

var lines = fs.readFileSync(_ZIPCODE_CSV_PATH, 'utf-8').trim().split('\n');
var i = 0;
var fileLen = lines.length - 1;
var tstart = Date.now();

console.log('Beginning Update Database (may take a moment) ...');

async.forever(
  function (next) {
    // Show processing percentage
    if (Date.now() - tstart > 5000) {
      tstart = Date.now();
      console.log('Still working (' + Math.round((i / fileLen) * 10000) / 100 + '%) ...');
    }

    var addrRuleUnit = lines[i].split(',');
    var headAddrStr = address.normalize(addrRuleUnit.slice(1, -1).join(''));
    var tailRuleStr = addrRuleUnit.slice(-1);
    var zipcode = addrRuleUnit[0];

    if (/^\d{5}$/.test(zipcode)) {
      db.run('insert or ignore into precise values (?, ?, ?)', headAddrStr, headAddrStr + tailRuleStr, zipcode);

      var headAddrUnitArr = address.tokenizeSimpleArr(headAddrStr);
      var unitLen = headAddrUnitArr.length - 1;
      var j = 0;

      async.forever(
        function (next) {
          var k = j;
          async.forever(
            function (next) {
              var addrUnit = headAddrUnitArr.slice(j, k + 1).join('');
              replaceGradual(addrUnit, zipcode, function (err) {
                if (err) {
                  return next(err);
                }

                if (k < unitLen) {
                  k++;
                  next();
                } else {
                  next('Done');
                }
              });
            },
            function (err) {
              if (err && err !== 'Done') {
                return next(err);
              }

              if (j < unitLen) {
                j++;
                next();
              } else {
                next('Done');
              }
            }
          );
        },
        function (err) {
          if (err && err !== 'Done') {
            return next(err);
          }

          //pick unit 0 and 2 to build database
          //such as 台北市信義區光復南路 build data 台北市光復南路
          if (headAddrUnitArr[2]) {
            replaceGradual(headAddrUnitArr[0] + headAddrUnitArr[2], zipcode, function (err) {
              if (err) {
                return next(err);
              }
            });
          }

          if (i < fileLen) {
            i++;
            next();
          } else {
            next('Done');
          }
        }
      );
    } else {
      if (i < fileLen) {
        i++;
        next();
      } else {
        next('Done');
      }
    }
  },
  function (err) {
    if (err && err !== 'Done') {
      console.log('Failed to Update Database');
    } else {
      db.run('COMMIT TRANSACTION');
      console.log('Successfully Updated Database');
    }
  }
);

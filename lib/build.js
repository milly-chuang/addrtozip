var _DB_PATH = 'db/test.db';
var _CSV_PATH = 'db/201311_100.csv';

var async = require('async');
var fs = require('fs');
var Address = require('./address');
var address = new Address();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(_DB_PATH);

(function(){
  var Build = function(){
    var init = function(){
      db.serialize(function() {
        db.run('create table precise(addr_str text, rule_str text, zipcode  text, primary key (addr_str, rule_str))')
        db.run('create table gradual(addr_str text primary key, zipcode  text)')
      });
      var lines = fs.readFileSync(_CSV_PATH).toString().split('\n');
      var i = 0;
      var _fileLen = lines.length - 1;
      async.forever(
        function(next) {
          console.log('async i = ' + i + '/' + _fileLen);
          var addrRuleUnit = lines[i].split(',');
          var headAddrStr = address.normalize(addrRuleUnit.slice(1, -1).join(''));
          var tailRuleStr = addrRuleUnit.slice(-1).toString();
          var zipcode = addrRuleUnit[0];
          if(/^\d{5}$/.test(zipcode)){
            db.run('insert or ignore into precise values (?, ?, ?)', headAddrStr, headAddrStr+tailRuleStr, zipcode)

            var headAddrUnitArr = address.tokenizeSimpleArr(headAddrStr);
            var _len=headAddrUnitArr.length -1;
            var j = 0;
            async.forever(
              function(next) {
                var k = j;
                console.log('async j = ' + j + '/' + _len);
                async.forever(
                  function(next) {
                    console.log('async k = ' + k + '/' + _len);
                    var addrUnit = headAddrUnitArr.slice(j, k+1).join('');
                    replaceGradual(addrUnit, zipcode, function(addrUnit, zipcode){
                      console.log('replaceGradual callback = ' + addrUnit + '/' + zipcode);
                      if (k < _len) { 
                        k++;
                        return next();
                      } else {
                        return next('Done');
                      }
                    })
                  },
                  function(err) {
                    if (j < _len-1) {
                      j++;
                      return next();
                    } else {
                      return next('Done');
                    }
                  }
                );
              },
              function(err) {
                //pick unit 0 and 2 to build database
                //such as 台北市信義區光復南路  build data 台北市光復南路
                replaceGradual(headAddrUnitArr[0] + headAddrUnitArr[2], zipcode, function(addrUnit, zipcode){
                })

                if (i < _fileLen) {
                  i++;
                  return next();
                } else {
                  return next('Done');
                }
              }
            );
          }else{
            if (i < _fileLen) {
              i++;
              return next();
            } else {
              return next('Done');
            }
          }
        },
        function(err) {
        }
      );
    }

    var replaceGradual = function (addrUnit, zipcode, callback){
      console.log('replaceGradual ' + addrUnit + '/' + zipcode);
      db.get('select zipcode from gradual where  addr_str=?', addrUnit, function(err, row){
        row = row ? row.zipcode : '';
        var dbNewZipcode = getMinPart(zipcode, row);
        db.run('replace into gradual values (?, ?)', addrUnit, dbNewZipcode, function(err){
          callback(addrUnit, dbNewZipcode);
        });
      });
    }

    var getMinPart = function (zipcodeA, zipcodeB){
      console.log('getMinPart ' + zipcodeA + '/' + zipcodeB);
      if (!zipcodeA)  return zipcodeB;
      if (!zipcodeB)  return zipcodeA;
      var minLen;
      for(var i=0; i<Math.min(zipcodeA.length, zipcodeB.length); i++){
        if(zipcodeA[i] != zipcodeB[i]){
          break;
        }
        minLen = i+1;
      }
      return zipcodeA.slice(0, minLen);
    }

    return {
      VERSION: _CSV_PATH,
      init: init
    };
  }
  module.exports = Build;
})();



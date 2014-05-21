var _DB_PATH = 'db/zipcode.db';
// var _DB_PATH = ':memory:';
var _CSV_PATH = 'db/Zip32_10303.csv';
// var _CSV_PATH = 'db/tmp.csv';

var async = require('async');
var fs = require('fs');
var Address = require('./address');
var address = new Address();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(_DB_PATH);

var flag = false;
(function(){
  var Build = function(){
    var init = function(){
      db.serialize(function() {
        db.run('create table precise(addr_str text, rule_str text, zipcode  text, primary key (addr_str, rule_str))')
        db.run('create table gradual(addr_str text primary key, zipcode  text)')
        db.run('BEGIN TRANSACTION');
      });
      var lines = fs.readFileSync(_CSV_PATH).toString().split('\n');
      // if(flag)  console.log(lines)
      // lines = ['52043,彰化縣,田中鎮,十全街,全', '40147,臺中市,東區,十全街,全']
      var i = 0;
      var _fileLen = lines.length - 1;
      async.forever(
        function(next) {
          if(flag)  console.log('async i = ' + i + '/' + _fileLen);
          if(flag)  console.log(lines[i])
          var addrRuleUnit = lines[i].split(',');
          if(flag)  console.log(addrRuleUnit)
          var headAddrStr = address.normalize(addrRuleUnit.slice(1, -1).join(''));
          // if(flag)  console.log(addrRuleUnit.slice(1, -1))
          var tailRuleStr = addrRuleUnit.slice(-1).toString();
          // if(flag)  console.log(addrRuleUnit.slice(-1).toString())
          var zipcode = addrRuleUnit[0];
          if(/^\d{5}$/.test(zipcode)){
            db.run('insert or ignore into precise values (?, ?, ?)', headAddrStr, headAddrStr+tailRuleStr, zipcode)

            var headAddrUnitArr = address.tokenizeSimpleArr(headAddrStr);
            // if(flag)  console.log(headAddrUnitArr)
            var _len=headAddrUnitArr.length -1;
            var j = 0;
            async.forever(
              function(next) {
                var k = j;
                if(flag)  console.log('async j = ' + j + '/' + _len);
                async.forever(
                  function(next) {
                    if(flag)  console.log('async k = ' + k + '/' + _len);
                    var addrUnit = headAddrUnitArr.slice(j, k+1).join('');
                    replaceGradual(addrUnit, zipcode, function(addrUnit, zipcode){
                      // if(flag)  console.log('replaceGradual callback = ' + addrUnit + '/' + zipcode);
                      if(flag)  console.log('asyncEnd k = ' + k + '/' + _len);
                      if (k < _len) { 
                        k++;
                        return next();
                      } else {
                        return next('Done');
                      }
                    })
                  },
                  function(err) {
                    if(flag)  console.log('asyncEnd j = ' + j + '/' + _len);
                    if (j < _len) {
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
                if (headAddrUnitArr[2]){
                  replaceGradual(headAddrUnitArr[0] + headAddrUnitArr[2], zipcode, function(addrUnit, zipcode){
                  })
                } 
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
          db.run("COMMIT TRANSACTION");
        }
      );
    }

    var replaceGradual = function (addrUnit, zipcode, callback){
      if(flag)  console.log('replaceGradual ' + addrUnit + '/' + zipcode);
      db.get('select zipcode from gradual where  addr_str=?', addrUnit, function(err, row){
        if(flag)  console.log('row = ' + row)
        var dbzipcode = row ? row.zipcode : row;
        var dbNewZipcode = getMinPart(zipcode, dbzipcode);
        dbNewZipcode = dbNewZipcode ? dbNewZipcode : '';
        if(flag)  console.log('dbNewZipcode' + dbNewZipcode)
        db.run('replace into gradual values (?, ?)', addrUnit, dbNewZipcode, function(err){
          if(flag)  console.log('replaceGradualEnd' + addrUnit)
          callback(addrUnit, dbNewZipcode);
        });
      });
    }

    var getMinPart = function (zipcodeA, zipcodeB){
      if(flag)  console.log('getMinPart ' + zipcodeA + '/' + zipcodeB);
      // if (!zipcodeA && zipcodeA != '')  return zipcodeB;
      // if (!zipcodeB && zipcodeB != '')  return zipcodeA;
      if (zipcodeA == undefined)  return zipcodeB;
      if (zipcodeB == undefined)  return zipcodeA;
      var minLen = 0;
      for(var i=0; i<Math.min(zipcodeA.length, zipcodeB.length); i++){
        // if(flag)  console.log(zipcodeA[i] + '/' + zipcodeB[i])
        if(zipcodeA[i] != zipcodeB[i]){
          // if(flag)  console.log('i = ' + i)
          break;
        }
        minLen = i+1;
      }
      // if(flag)  console.log('minLen = ' + minLen)
      // if(flag)  console.log('return' + zipcodeA.slice(0, minLen))
      return zipcodeA.slice(0, minLen);
    }

    return {
      VERSION: _CSV_PATH,
      init: init
    };
  }
  module.exports = Build;
})();



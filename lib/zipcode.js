var Address = require('./address');
var address = new Address();
var Rule = require('./rule');
var rule = new Rule();
var _DB_PATH = 'db/zipcode.db';
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(_DB_PATH);
var async = require('async');

var flag = false;
var _NO    = 1;
var _SUBNO = 2;
var _NAME  = 3;
var _UNIT  = 4;

(function(){
  var Zipcode = function(){
    var find = function(addr, callback){
      var oriAddr = addr;
      var addr = address.normalize(addr);
      if(flag)  console.log('addr = ' + addr);
      var addrTokens = address.tokenize(addr);
      if(flag)  console.log(addrTokens)
      var lenAddrTokens = addrTokens.length;
      var lenNum = lenAddrTokens;
      // if(flag)  console.log(addr)
      while(lenNum > 0 ){
        var addrToken = addrTokens[lenNum -1]
        if(flag)  console.log('while i = ' + lenNum)
        if(flag)  console.log(addrToken)
        if (!addrToken[_NO] && !addrToken[_SUBNO]){
          break;
        }else{
          lenNum--;
        }
      }
      // sometime lane(alley) name will not only number, such as 草埔七巷 or 新北市,瑞芳區,中央路四十八巷吉祥園.
      // so when unit is not No, lenNum++
      if (lenNum != lenAddrTokens && (addrTokens[lenNum][_UNIT] == '巷' || addrTokens[lenNum][_UNIT] == '巷')){
        lenNum++
      }
      // if(flag)  console.log(lenNum)
      var i = lenNum;
      var rsPair; 
      async.forever(
        function(next) {
          // console.log('start i = ' + i)
          if (lenAddrTokens < 3)  return next('Done');
          if(flag)  console.log('i = ' + i);
          if(flag)  console.log(address.flat(addrTokens, i))
          getRsPair(address.flat(addrTokens, i), function(err, rows){
            rsPair = rows;
            // console.log(i == lenNum)
            // console.log(lenAddrTokens >= 4)
            // console.log(addrTokens[2])
            // console.log('村里'.indexOf(addrTokens[2][_UNIT]) != -1)
            // console.log(!rsPair.length)
            if (i == lenNum && lenAddrTokens >= 4 &&
              '村里'.indexOf(addrTokens[2][_UNIT]) != -1 &&
              !rsPair.length){
              if(flag)  console.log('first match')
              if (addrTokens[3][_UNIT] == '鄰'){
                addrTokens.splice(3, 1);
                lenAddrTokens --;
                i--;
              }
              // if(flag)  console.log((addrTokens[3][_UNIT] == '號' || (addrTokens[3][_UNIT] == undefined && addrTokens[3][_NO] > 0)))
              // if(flag)  console.log(addrTokens[3][_UNIT] == undefined && addrTokens[3][_NO] > 0)
              if(flag)  console.log(addrTokens[2])
              if (lenAddrTokens >= 4 && addrTokens[2][_NAME].length == 2 && (addrTokens[3][_UNIT] == '號')){
              // if (lenAddrTokens >= 4 && addrTokens[2][_NAME].length == 2 && (addrTokens[3][_UNIT] == '號' || (addrTokens[3][_UNIT] == undefined && addrTokens[3][_NO] > 0))){
                addrTokens[2] = [addrTokens[2][_NAME], '', '', addrTokens[2][_NAME], ''];
              }else if(addrTokens[2][_NAME].length == 2 ){
                addrTokens.splice(2, 1);
                lenAddrTokens --;
              }
              if(flag)  console.log('aaaaaaa')
              // console.log(address.flat(addrTokens, lenAddrTokens))
              // console.log(address.flat(addrTokens, i))
              getRsPair(address.flat(addrTokens, i), function(err, rows){
                rsPair = rows
                if (rsPair){
                  for(var j=0, lenJ=rsPair.length; j<lenJ; j++){
                    if (rule.match(rsPair[j].rule_str, address.flat(addrTokens))){
                      var result = {
                        zipcode: rsPair[j].zipcode,
                        addr: oriAddr
                        // addr: oriAddr,
                        // rule: rsPair[j].rule_str
                      }
                      return callback(result);
                    }
                  }
                }
                // if(flag)  console.log(addrTokens)
                // console.log('i=' + i)
                if (i > 1) { 
                  i--;
                  return next();
                } else {
                  return next('Done');
                }
              })
            }else{
              if(flag)  console.log('else')
              if (rsPair){
                if(flag)  console.log(rsPair)
                for(var k=0, lenK=rsPair.length; k<lenK; k++){
                  if (rule.match(rsPair[k].rule_str, address.flat(addrTokens))){
                    var result = {
                      zipcode: rsPair[k].zipcode,
                      addr: oriAddr
                      // addr: oriAddr,
                      // rule: rsPair[k].rule_str
                    }
                    return callback(result);
                  }
                }
              }

              if (i > 2) { 
                // if(flag)  console.log('dddddddd')
                i--;
                return next();
              } else {
                return next('Done');
              }
            }
          });
        },
        function(){
          i = lenAddrTokens;
          var result = {};
          result.zipcode = '';
          async.forever(
            function(next) {
              // if(flag)  console.log(address.flat(addrTokens))
              getGradual(address.flat(addrTokens, i), function (err, row){
                if(row){
                  result.zipcode = '';
                  // result.zipcode = row.zipcode;
                  result.addr = oriAddr;
                  return callback(result);
                }else{
                  result.addr = oriAddr;
                  if (i > 1) { 
                    i--;
                    return next();
                  } else {
                    return next('Done');
                  }
                }
              })
            },
            function(err) {
              return result;
            }
          );
        }
      );
    }

    var getRsPair = function(addr, callback){
      db.serialize(function() {
        db.run('BEGIN TRANSACTION');
        db.all('select rule_str, zipcode from precise where addr_str =?', addr, function (err, rows){
          // if(flag)  console.log(addr + rows)
          callback(err, rows);
        })
        db.run('COMMIT TRANSACTION');
      });
    }

    var getGradual = function (addr, callback){
      db.serialize(function() {
        db.run('BEGIN TRANSACTION');
        db.get('select zipcode from gradual where addr_str = ?', addr, function (err, rows){
          callback(err, rows);
        })
        db.run('COMMIT TRANSACTION');
      });
    }

    return {
      find: find
    };
  }
  module.exports = Zipcode;
})();
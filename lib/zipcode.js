var Address = require('./address');
var address = new Address();
var Rule = require('./rule');
var rule = new Rule();
var _DB_PATH = 'db/201311.db';
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(_DB_PATH);
var async = require('async');

var _NO    = 1;
var _SUBNO = 2;
var _NAME  = 3;
var _UNIT  = 4;

(function(){
  var Zipcode = function(){
    var find = function(addr, callback){
      var addr = address.normalize(addr);
      var addrTokens = address.tokenize(addr);
      var lenAddrTokens = addrTokens.length;
      var lenNum = lenAddrTokens;

      while(lenNum > 0 ){
        var addrToken = addrTokens[lenNum -1]
        if (!addrToken[_NO] && !addrToken[_SUBNO]){
          break;
        }else{
          lenNum--;
        }
      }
      // sometime lane(alley) name will not only number, such as 草埔七巷.
      // so len + 1 to solve this issue
      lenNum == lenAddrTokens ? lenNum : lenNum++;

      var i = lenNum;
      var rsPair;
      async.forever(
        function(next) {
          if (lenAddrTokens < 3)  return next('Done');
          getRsPair(address.flat(addrTokens, i), function(err, rows){
            console.log(address.flat(addrTokens, i))
            rsPair = rows;
            if (i == lenNum && lenAddrTokens >=4 &&
              '村里'.indexOf(addrTokens[2][_UNIT]) != -1 &&
              !rsPair.length){
              if (addrTokens[3][_UNIT] == '鄰'){
                addrTokens.splice(3, 1);
                lenAddrTokens -= 1;
                i--;
              }
              if (lenAddrTokens >= 4 && addrTokens[3][_UNIT] == '號'){
                addrTokens[2] = [addrTokens[2][_NAME], '', '', addrTokens[2][_NAME], ''];
              }else{
                addrTokens.splice(2, 1);
                i--;
              }
              getRsPair(address.flat(addrTokens, 3), function(err, rows){
                rsPair = rows
                if (rsPair){
                  for(var j=0, lenJ=rsPair.length; j<lenJ; j++){
                    if (rule.match(rsPair[j].rule_str, address.flat(addrTokens))){
                      var result = {
                        zipcode: rsPair[j].zipcode,
                        addr: address.flat(addrTokens),
                      }
                      return callback(rsPair[j].zipcode);
                    }
                  }
                }

                if (i > 2) { 
                  // i--;
                  return next();
                } else {
                  return next('Done');
                }
              })
            }else{
              if (rsPair){
                for(var k=0, lenK=rsPair.length; k<lenK; k++){
                  if (rule.match(rsPair[k].rule_str, address.flat(addrTokens))){
                    var result = {
                      zipcode: rsPair[k].zipcode,
                      addr: address.flat(addrTokens),
                    }
                    return callback(rsPair[k].zipcode);
                  }
                }
              }

              if (i > 2) { 
                i--;
                return next();
              } else {
                return next('Done');
              }
            }
          });
        },

        }
      );
    }

    var getRsPair = function(addr, callback){
      db.all('select rule_str, zipcode from precise where  addr_str=?', addr, function (err, rows){
        callback(err, rows);
      })
    }

    var getGradual = function (addr, callback){
      db.get('select zipcode from gradual where addr_str = ?', addr, function (err, rows){
        callback(err, rows);
      })
    }

    return {
      find: find
    };
  }
  module.exports = Zipcode;
})();
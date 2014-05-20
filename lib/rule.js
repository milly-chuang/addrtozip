var Address = require('./address');
var address = new Address();
var _ = require('underscore');
var util = require('./util');

var flag = false;
var _ALL = 0;
var _NO    = 1;
var _SUBNO = 2;
var _NAME  = 3;
var _UNIT  = 4;

(function(){
  var Rule = function(){
    var _RULE_TOKEN_RE = new RegExp(
      '及以上附號|含附號以下|含附號全|含附號' +
      '|' +
      '以下|以上' +
      '|' +
      '附號全' +
      '|' +
      '[連至單雙全](?=[\\d全]|$)',
      'g'
    )

    var _RULE_REPLACE_TOKEN_RE_ = new RegExp(
      '及以上附號|含附號以下|含附號全|含附號' +
      '|' +
      '以下|以上' +
      '|' +
      '附號全' +
      '|' +
      '[連至單雙全](?=[\\d全]|$)'
    )

    var match = function(rule, addr){
      console.log('match')
      if(flag)  console.log(rule)
      // if(flag)  console.log(addr)
      rule = address.normalize(rule);
      var rulePart = part(rule);
      rule = rulePart.rule;
      var streetTokens = rulePart.streetTokens;
      var ruleTokens = address.tokenize(rule);
      var ruleTokensLen = ruleTokens.length;
      var addrTokens = address.tokenize(addr);

      lastPos = ruleTokens.length - 1;
      lastPos -= (streetTokens.length && streetTokens.indexOf('全') == -1);
      lastPos -= streetTokens.indexOf('至') != -1;
      lastPos -= streetTokens.length == 0;

      if (lastPos >= addrTokens.length){
        if(flag)  console.log(1)
        return false;
      }
      for(var i=lastPos; i>=0; i--){
        if(flag)  console.log(ruleTokens[i][_ALL])
        if(flag)  console.log(addrTokens[i][_ALL])

        if (ruleTokens[i][_ALL] != addrTokens[i][_ALL]){
          if(flag)  console.log(2)
          return false
        };

        // if (i == 2){
        //   if (ruleTokens[i][_NAME] != addrTokens[i][_NAME]){
        //     if(flag)  console.log(2)
        //     return false
        //   };
        // }else{
          // if (ruleTokens[i][_ALL] != addrTokens[i][_ALL]){
          //   if(flag)  console.log(2)
          //   return false
          // };
        // }
      }
      var addrNoPair = parseNo(addrTokens, lastPos+1)
      if (streetTokens.length &&  _.isEqual(addrNoPair, [0,0])){
        if(flag)  console.log(3)
        return false;
      }

      var ruleNoPairA = parseNo(ruleTokens, ruleTokensLen-1);
      var ruleNoPairB = parseNo(ruleTokens, ruleTokensLen-2);
      if(streetTokens.length == 0){
        if (ruleNoPairA[0] != addrNoPair[0]){
          return false;
        }else{
          return true;
        }
      }

      for(var i=0, _len=streetTokens.length; i<_len; i++){
        var rt = streetTokens[i];
        if(flag)  console.log(rt)
        if(flag)  console.log(ruleNoPairA)
        if(flag)  console.log(ruleNoPairB)
        if(flag)  console.log(addrNoPair)
        // if(flag)  console.log('aaaaaaaaaaa')
        // if(flag)  console.log(util.arrLT(addrNoPair, ruleNoPairA) || util.arrGT(addrNoPair,ruleNoPairB))
        // if(flag)  console.log(util.arrLT(addrNoPair, ruleNoPairA))
        // if(flag)  console.log(util.arrGT(addrNoPair, ruleNoPairB))
        if(
          (rt == '單' && (addrNoPair[0] & 1) == 0) ||
          (rt == '雙' && (addrNoPair[0] & 1) == 1) ||
          //util.arrXX  rule should be set second param
          (rt == '以上' && util.arrLT(addrNoPair, ruleNoPairA)) ||
          (rt == '以下' && util.arrGT(addrNoPair, ruleNoPairA)) ||
          (rt == '至' && (
            (util.arrLT(addrNoPair, ruleNoPairB) || util.arrGT(addrNoPair,ruleNoPairA)) || 
            (streetTokens.indexOf('含附號全') != -1 && ruleNoPairA[0] != addrNoPair[0])
          )) ||
          (rt == '含附號' && ruleNoPairA[0] != addrNoPair[0]) ||
          (rt == '附號全' && ruleNoPairA[0] != addrNoPair[0]) ||
          (rt == '及以上附號' && (ruleNoPairA[0] != addrNoPair[0] || ruleNoPairA > addrNoPair)) ||
          (rt == '含附號以下' && ruleNoPairA < addrNoPair && ruleNoPairA[0] == addrNoPair[0])
        ){
          if(flag)  console.log(4)
          return false;
        }
      }
      if(flag)  console.log(5)
      return true;
    }

    var part = function(rule){
      streetTokens = [];

      var token;
      while(token = _RULE_TOKEN_RE.exec(rule)){
        token = token[0].toString();
        replace = '';
        if (token == '連'){
          token = '';
        }else if (token == '附號全'){
          replace = '號';
        }

        if (token)  streetTokens.push(token);
        rule = rule.replace(_RULE_REPLACE_TOKEN_RE_, replace);
      }

      return {rule: rule, streetTokens: streetTokens}
    }

    var parseNo = function(addrArr, idx){
      if (addrArr[idx]){
        var parseNo = addrArr[idx][_NO] ? addrArr[idx][_NO] : 0;
        var parseSubNo = addrArr[idx][_SUBNO] ? addrArr[idx][_SUBNO].slice(1) : 0;
        if (parseSubNo){
          return [parseNo, parseSubNo]
        }else{
          return [parseNo]
        }
      }else{
        return [0, 0];
      }
    }

    return {
      match: match,
      part: part
    };
  }

  module.exports = Rule;
})();
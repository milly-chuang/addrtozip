var Address = require('./address');
var address = new Address();
var _ = require('underscore');

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
      rule = address.normalize(rule);
      var rulePart = part(rule);
      rule = rulePart.rule;
      var streetTokens = rulePart.streetTokens;
      var ruleTokens = address.tokenize(rule);
      var ruleTokensLen = ruleTokens.length;
      var addrTokens = address.tokenize(addr);

      lastPos = ruleTokens.length - 1;
      lastPos -= (streetTokens && streetTokens.indexOf('全') == -1);
      lastPos -= streetTokens.indexOf('至') != -1;
      if (lastPos >= addrTokens.length){
        return false;
      }
      for(var i=lastPos; i>=0; i--){
        if (ruleTokens[i][_ALL] != addrTokens[i][_ALL]){
          return false
        };
      }
      var addrNoPair = parseNo(addrTokens, lastPos+1)
      if (streetTokens &&  _.isEqual(addrNoPair, [0,0])){
        return false;
      }

      var ruleNoPairA = parseNo(ruleTokens, ruleTokensLen-1);
      var ruleNoPairB = parseNo(ruleTokens, ruleTokensLen-2);
      for(var i=0, _len=streetTokens.length; i<_len; i++){
        var rt = streetTokens[i];
        if(
          (rt == '單' && addrNoPair[0] & 1 == 0) ||
          (rt == '雙' && addrNoPair[0] & 1 == 1) ||
          (rt == '以上' && ruleNoPairA > addrNoPair) ||
          (rt == '以下' && ruleNoPairA < addrNoPair) ||
          (rt == '至' && (
            !((ruleNoPairB <= addrNoPair) && (addrNoPair <= ruleNoPairA )) || 
            (streetTokens.indexOf('含附號全') != -1 && ruleNoPairA[0] != addrNoPair[0])
          )) ||
          (rt == '含附號' && ruleNoPairA[0] != addrNoPair[0]) ||
          (rt == '附號全' && ruleNoPairA[0] != addrNoPair[0]) ||
          (rt == '及以上附號' && (ruleNoPairA[0] != addrNoPair[0] || ruleNoPairA > addrNoPair)) ||
          (rt == '含附號以下' && ruleNoPairA < addrNoPair && ruleNoPairA[0] == addrNoPair[0])
        ){
          return false;
        }
      }
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
        var parseSubNo = addrArr[idx][_SUBNO] ? addrArr[idx][_SUBNO] : 0;
        return [parseNo, parseSubNo]
      }else{
        return [0, 0];
      }
    }

    return {
      match: match
    };
  }

  module.exports = Rule;
})();
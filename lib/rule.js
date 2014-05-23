/*jslint node: true, nomen: true, plusplus: true, stupid: true, vars: true, indent: 2 */
'use strict';
var address = require('./address');
var util = require('./util');
var _ = require('underscore');

var _ALL = 0;
var _NO    = 1;
var _SUBNO = 2;
var _NAME  = 3;
var _UNIT  = 4;

(function () {
  var _RULE_TOKEN_RE = new RegExp(
    '及以上附號|含附號以下|含附號全|含附號' +
      '|' +
      '以下|以上' +
      '|' +
      '附號全' +
      '|' +
      '[連至單雙全](?=[\\d全]|$)',
    'g'
  );

  var _RULE_REPLACE_TOKEN_RE_ = new RegExp(
    '及以上附號|含附號以下|含附號全|含附號' +
      '|' +
      '以下|以上' +
      '|' +
      '附號全' +
      '|' +
      '[連至單雙全](?=[\\d全]|$)'
  );

  var _RULE_DASH_TO_DASH_RE = /(\d+)(之\d+)(至)(之\d+號)/;

  var part = function (rule) {
    var streetTokens = [];
    if (_RULE_DASH_TO_DASH_RE.test(rule)) {
      var dashReExec = _RULE_DASH_TO_DASH_RE.exec(rule);
      var dashReplace = dashReExec[1] + dashReExec[2] + '號' + dashReExec[3] + dashReExec[1] + dashReExec[4];
      rule = rule.replace(_RULE_DASH_TO_DASH_RE, dashReplace);
    }

    var replacedRule = rule;
    var token = _RULE_TOKEN_RE.exec(rule);
    var replace = '';
    while (token) {
      token = token[0].toString();
      if (token === '連') {
        token = '';
      } else if (token === '附號全') {
        replace = '號';
      }
      if (token) {
        streetTokens.push(token);
      }
      replacedRule = replacedRule.replace(_RULE_REPLACE_TOKEN_RE_, replace);
      token = _RULE_TOKEN_RE.exec(rule);
    }
    return {rule: replacedRule, streetTokens: streetTokens};
  };

  var parseNoAndSubno = function (addrArr, idx) {
    if (addrArr[idx]) {
      //var parseNo = addrArr[idx][_NO] ? addrArr[idx][_NO] : 0;
      var parseNo = addrArr[idx][_NO] || 0;
      var parseSubNo = addrArr[idx][_SUBNO] ? addrArr[idx][_SUBNO].slice(1) : 0;
      if (parseSubNo) {
        return [parseNo, parseSubNo];
      }
      return [parseNo];
    }
    return [0, 0];
  };

  var rule = {};
  rule.match = function (rule, addr) {
    rule = address.normalize(rule);
    var rulePart = part(rule);
    rule = rulePart.rule;
    var streetTokens = rulePart.streetTokens;
    var ruleTokens = address.tokenize(rule);
    var ruleTokensLen = ruleTokens.length;
    var addrTokens = address.tokenize(addr);
    var lastPos = ruleTokens.length - 1;
    lastPos -= (streetTokens.length && streetTokens.indexOf('全') === -1);
    lastPos -= streetTokens.indexOf('至') !== -1;
    lastPos -= streetTokens.length === 0;

    if (lastPos >= addrTokens.length) {
      return false;
    }
    var i;
    for (i = lastPos; i >= 0; i--) {
      if (ruleTokens[i][_ALL] !== addrTokens[i][_ALL]) {
        return false;
      }
    }
    var addrNoPair = parseNoAndSubno(addrTokens, lastPos + 1);
    if (streetTokens.length &&  _.isEqual(addrNoPair, [0, 0])) {
      return false;
    }

    var ruleNoPairA = parseNoAndSubno(ruleTokens, ruleTokensLen - 1);
    var ruleNoPairB = parseNoAndSubno(ruleTokens, ruleTokensLen - 2);
    if (streetTokens.length === 0) {
      if (ruleNoPairA[0] !== addrNoPair[0]) {
        return false;
      }
      if (ruleNoPairA[1] && ruleNoPairA[1] !== addrNoPair[1]) {
        return false;
      }
      return true;
    }
    var len = streetTokens.length;
    var rt;
    for (i = 0; i < len; i++) {
      rt = streetTokens[i];
      if (
        (rt === '單' && (addrNoPair[0] % 2) === 0) ||
          (rt === '雙' && (addrNoPair[0] % 2) === 1) ||
          //util.arrXX  rule should be set second param
          (rt === '以上' && util.arrLT(addrNoPair, ruleNoPairA)) ||
          (rt === '以下' && util.arrGT(addrNoPair, ruleNoPairA)) ||
          (rt === '至' && (
            (util.arrLT(addrNoPair, ruleNoPairB) || util.arrGT(addrNoPair, ruleNoPairA)) ||
            (streetTokens.indexOf('含附號全') !== -1 && ruleNoPairA[0] !== addrNoPair[0])
          )) ||
          (rt === '含附號' && ruleNoPairA[0] !== addrNoPair[0]) ||
          (rt === '附號全' && ruleNoPairA[0] !== addrNoPair[0]) ||
          (rt === '及以上附號' && (ruleNoPairA[0] !== addrNoPair[0] || ruleNoPairA > addrNoPair)) ||
          (rt === '含附號以下' && ruleNoPairA < addrNoPair && ruleNoPairA[0] === addrNoPair[0])
      ) {
        return false;
      }
    }
    return true;
  };

  module.exports = rule;
}());
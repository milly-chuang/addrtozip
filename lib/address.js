/*jslint node: true, nomen: true, plusplus: true, stupid: true, vars: true, white: true, indent: 2 */
'use strict';
(function () {
  var _TOKEN_RE = new RegExp(
    '(?:' +
      '(\\d+)' +
      '(之\\d+)?' +
      '(?=[巷弄號樓]|$)' +
      '|' +
      '(.+?)' +
    ')' +
    '(?:' +
      '(里(?!鎮|區|里|村)|鎮(?!市|區)|市(?!區|里)|路(?!鄉|里)|村(?!路|鄉)|[縣鄉區鄰街段巷弄號樓])' +
      '|' +
      '(?=\\d+(?:之\\d+)?[巷弄號樓]|$)' +
    ')',
    'g'
  );

  var _REPLACE_RE = new RegExp(
    '[Ff 　,，台~-]' +
    '|' +
    '[０-９]' +
    '|' +
    '[ㄧ一二三四五六七八九]?' +
    '十?' +
    '[ㄧ一二三四五六七八九]' +
    '(?=[^ㄧ一二三四五六七八九十1-9１-９])' +
    '|' +
    '[ㄧ一二三四五六七八九]?' +
    '十' +
    '(?=[^ㄧ一二三四五六七八九十1-9１-９])' +
    '|' +
    '[ㄧ一二三四五六七八九]+' +
    '(?=[^ㄧ一二三四五六七八九十1-9１-９])'
  );

  var _REPLACE_MAP = {
    '-': '之', '~': '之', '台': '臺', ' ': '', '　': '', 'f': '樓', 'F': '樓',
    '１': '1', '２': '2', '３': '3', '４': '4', '５': '5',
    '６': '6', '７': '7', '８': '8', '９': '9', '０': '0',
    'ㄧ': '1', '一': '1', '二': '2', '三': '3', '四': '4', '五': '5',
    '六': '6', '七': '7', '八': '8', '九': '9', '十': '10'
  };

  var address = {};

  address.normalize = function (str) {
    var beReplace;
    var replaceWord;
    var i;
    while (_REPLACE_RE.test(str)) {
      beReplace = str.match(_REPLACE_RE).toString();
      replaceWord = '';
      if (beReplace.length === 1) {
        replaceWord = _REPLACE_MAP[beReplace];
      } else if (beReplace.length === 2) {
        if (beReplace.search('十') === 0) {
          replaceWord = '1' + _REPLACE_MAP[beReplace[1]];
        } else if (beReplace.search('十') === 1) {
          replaceWord = _REPLACE_MAP[beReplace[0]] + '0';
        } else {
          replaceWord = _REPLACE_MAP[beReplace[0]] + _REPLACE_MAP[beReplace[1]];
        }
      } else if (beReplace.search('十') === 1) {
        replaceWord = _REPLACE_MAP[beReplace[0]] + _REPLACE_MAP[beReplace[2]];
      } else {
        for (i = 0; i < beReplace.length; i++) {
          replaceWord += _REPLACE_MAP[beReplace[i]];
        }
      }
      str = str.replace(beReplace, replaceWord);
    }

    // change addr from X[樓號]之Y  to X之Y[樓號]
    var regEndCheck = /([樓號])(之)(\d+)/;
    while (regEndCheck.test(str)) {
      beReplace = str.match(regEndCheck);
      replaceWord = beReplace[2] + beReplace[3] + beReplace[1];
      str = str.replace(beReplace[0].toString(), replaceWord);
    }

    return str;
  };

  address.normalizeArr = function (arr) {
    var i = 0;
    var len = arr.length;
    for (i = 0; i < len; i++) {
      arr[i] = address.normalize(arr[i]);
    }
    return arr;
  };

  address.tokenize = function (addr) {
    var tokens = [];
    var addrUnit;
    addrUnit = _TOKEN_RE.exec(addr);
    while (addrUnit) {
      tokens.push(addrUnit);
      addrUnit = _TOKEN_RE.exec(addr);
    }
    return tokens;
  };

  address.tokenizeSimpleArr = function (addr) {
    return addr.match(_TOKEN_RE);
  };

  //join addrArr idx element to addr
  address.flat = function (addrArr, idx) {
    var addr = '';
    var i;
    var addrLen = addrArr.length;
    if (idx > addrLen || !idx) {
      idx = addrLen;
    }
    if (addrLen !== 0) {
      for (i = 0; i < idx; i++) {
        addr = addr + addrArr[i][0];
      }
    }
    return addr;
  };

  module.exports = address;
}());
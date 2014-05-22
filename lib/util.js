/*jslint node: true, nomen: true, plusplus: true, stupid: true, vars: true, indent: 2 */
'use strict';
(function () {
  var util = {};
  //rule should be set arr2
  util.arrGE = function (arr1, arr2) {
    var arr2Len = arr2 ? arr2.length : 0;
    var _len = arr2Len;
    var i;
    for (i = 0; i < _len; i++) {
      if (!(/^\d+$/.test(arr1[i]) && /^\d+$/.test(arr2[i]))) {
        return false;
      }
      if (parseInt(arr1[i], 10) > parseInt(arr2[i], 10)) {
        return true;
      }
      if (parseInt(arr1[i], 10) < parseInt(arr2[i], 10)) {
        return false;
      }
    }
    return true;
  };

  util.arrGT = function (arr1, arr2) {
    var arr2Len = arr2 ? arr2.length : 0;
    var _len = arr2Len;
    var i;
    for (i = 0; i < _len; i++) {
      if (!(/^\d+$/.test(arr1[i]) && /^\d+$/.test(arr2[i]))) {
        return false;
      }
      if (parseInt(arr1[i], 10) > parseInt(arr2[i], 10)) {
        return true;
      }
      if (parseInt(arr1[i], 10) < parseInt(arr2[i], 10)) {
        return false;
      }
    }
    return false;
  };

  util.arrLE = function (arr1, arr2) {
    var arr2Len = arr2 ? arr2.length : 0;
    var _len = arr2Len;
    var i;
    for (i = 0; i < _len; i++) {
      if (!(/^\d+$/.test(arr1[i]) && /^\d+$/.test(arr2[i]))) {
        return false;
      }
      if (parseInt(arr1[i], 10) < parseInt(arr2[i], 10)) {
        return true;
      }
      if (parseInt(arr1[i], 10) > parseInt(arr2[i], 10)) {
        return false;
      }
    }
    return true;
  };

  util.arrLT = function (arr1, arr2) {
    var arr2Len = arr2 ? arr2.length : 0;
    var _len = arr2Len;
    var i;
    for (i = 0; i < _len; i++) {
      if (!(/^\d+$/.test(arr1[i]) && /^\d+$/.test(arr2[i]))) {
        return false;
      }
      if (parseInt(arr1[i], 10) < parseInt(arr2[i], 10)) {
        return true;
      }
      if (parseInt(arr1[i], 10) > parseInt(arr2[i], 10)) {
        return false;
      }
    }
    return false;
  };

  module.exports = util;
}());
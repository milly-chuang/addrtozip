/*jslint node: true, nomen: true, plusplus: true, stupid: true, vars: true, indent: 2 */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var zipcode =  require('../lib/zipcode.js');
var assert = require('assert');
var async = require('async');
var datas = require('./datas.json');

describe('Lookup zipcode', function () {
  async.each(datas, function (addrItem, callback) {
    it('Lookup ' + addrItem.address + ' should return ' + addrItem.zipcode, function (done) {
      zipcode.find(addrItem.address, function (zipcode) {
        assert.equal(addrItem.zipcode, zipcode.zipcode);
        done();
      });
    });
    callback();
  });
});
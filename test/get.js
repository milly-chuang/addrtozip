/*jslint node: true, nomen: true, plusplus: true, stupid: true, vars: true, indent: 2 */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var zipcode =  require('../');
var assert = require('assert');
// var fs = require('fs');

describe('Get', function () {
  it('List of cities', function (done) {
    var cityResult = require('./cityResult.json');
    zipcode.getCities(function (err, cities) {
      assert.equal(JSON.stringify(cityResult), JSON.stringify(cities));
      done();
    });
  });

  it('List of areas in Taipei City', function (done) {
    var areaResult = require('./areaResult.json');
    zipcode.getAreas('Taipei City', function (err, areas) {
      assert.equal(JSON.stringify(areaResult), JSON.stringify(areas));
      done();
    });
  });

  it('List of areas in 臺北市', function (done) {
    var areaResult = require('./areaResult.json');
    zipcode.getAreas('臺北市', function (err, areas) {
      assert.equal(JSON.stringify(areaResult), JSON.stringify(areas));
      done();
    });
  });
});
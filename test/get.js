/*jslint node: true, nomen: true, plusplus: true, stupid: true, vars: true, indent: 2 */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';
 
var zipcode =  require('../');
var assert = require('assert');
 
describe('Get', function () {
  it('List of cities', function (done) {
    var cityResult = require('./cityResult.json');
    zipcode.getCities(function (err, cities) {
      cities.sort(compareCity);
      assert.equal(JSON.stringify(cities), JSON.stringify(cityResult));
      done();
    });
  });
 
  it('List of areas in Taipei City', function (done) {
    var areaResult = require('./areaResult.json');
    zipcode.getAreas('Taipei City', function (err, areas) {
      areas.sort(compareArea);
      assert.equal(JSON.stringify(areas), JSON.stringify(areaResult));
      done();
    });
  });
 
  it('List of areas in 臺北市', function (done) {
    var areaResult = require('./areaResult.json');
    zipcode.getAreas('臺北市', function (err, areas) {
      areas.sort(compareArea);
      assert.equal(JSON.stringify(areas), JSON.stringify(areaResult));
      done();
    });
  });
 
  it('List of areas in 台北市', function (done) {
    var areaResult = require('./areaResult.json');
    zipcode.getAreas('台北市', function (err, areas) {
      areas.sort(compareArea);
      assert.equal(JSON.stringify(areas), JSON.stringify(areaResult));
      done();
    });
  });
});
 
function compareCity(obj1, obj2) {
  if (obj1.cityName < obj2.cityName)
     return -1;
  if (obj1.cityName > obj2.cityName)
    return 1;
  return 0;
}
 
function compareArea(obj1, obj2) {
  if (obj1.areaName < obj2.areaName)
     return -1;
  if (obj1.areaName > obj2.areaName)
    return 1;
  return 0;
}
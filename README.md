## API for finding zipcode in Taiwan [![NPM version](https://badge.fury.io/js/addrtozip.svg)](http://badge.fury.io/js/addrtozip) [![Build Status](https://drone.io/github.com/milly-chuang/addrtozip/status.png)](https://drone.io/github.com/milly-chuang/addrtozip/latest)
[![NPM](https://nodei.co/npm/addrtozip.png?downloads=true)](https://nodei.co/npm/addrtozip/)

This package is reference from [mosky](https://github.com/moskytw/zipcodetw) .

## Installation

```bash
$ npm install addrtozip
```

## Usage
####First you have to require the package.

```javascript
var addrtozip = require('addrtozip');
```

#### Send an address to query zipcode. 
 `addr`: **Required.** An address for finding zipcode
 
 `callback`: **Required.** Callback will return a json contain zipcode and address.
 
```javascript
addrtozip.find(addr, callback);
```

## Example

```javascript
var addrtozip = require('addrtozip');
addrtozip.find('台北市信義區市府路45號', function (zipcode){
  console.log(zipcode);
}
```

And you will get a json data, like this.

```json
{ zipcode: '11001', addr: '台北市信義區市府路45號' }
```

## Gradual
A legal address contain city(縣市), area(鄉鎮市區), street(路街巷弄號),
and exclude village(村里) and neighborhood(鄰).
We also can find informal zipcode gradually, but that will reduce the precision.

```javascript
var addrtozip = require('addrtozip');
addrtozip.find('台北市', function (zipcode){
  // { zipcode: '1', addr: '台北市' }
}
addrtozip.find('台北市信義區', function (zipcode){
  // { zipcode: '110', addr: '台北市信義區' }
}
addrtozip.find('台北市信義區市府路', function (zipcode){
  // { zipcode: '110', addr: '台北市信義區市府路' }
}
addrtozip.find('台北市信義區市府路45號', function (zipcode){
  // { zipcode: '11001', addr: '台北市信義區市府路45號' }
}
```

If any adress is legal, but return wrong zipcode.
Please let me know. Thanks.

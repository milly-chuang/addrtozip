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
{ "zipcode": '11001', "addr": '台北市信義區市府路45號' }
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

## Get city list
Just get city list
```javascript
var addrtozip = require('addrtozip');
addrtozip.getCities(function (err, cities) {
  /*
    [ { cityName: 'Taipei City', zh_tw: '臺北市' },
    { cityName: 'Lienchiang County', zh_tw: '連江縣' },
    { cityName: 'Hsinchu City', zh_tw: '新竹市' },
    { cityName: 'New Taipei City', zh_tw: '新北市' },
    { cityName: 'Taoyuan County', zh_tw: '桃園縣' },
    { cityName: 'Miaoli County', zh_tw: '苗栗縣' },
    { cityName: 'Taichung City', zh_tw: '臺中市' },
    { cityName: 'Changhua County', zh_tw: '彰化縣' },
    { cityName: 'Nantou County', zh_tw: '南投縣' },
    { cityName: 'Chiayi City', zh_tw: '嘉義市' },
    { cityName: 'Chiayi County', zh_tw: '嘉義縣' },
    { cityName: 'Yunlin County', zh_tw: '雲林縣' },
    { cityName: 'Tainan City', zh_tw: '臺南市' },
    { cityName: 'Kaohsiung City', zh_tw: '高雄市' },
    { cityName: 'Penghu County', zh_tw: '澎湖縣' },
    { cityName: 'Kinmen County', zh_tw: '金門縣' },
    { cityName: 'Pingtung County', zh_tw: '屏東縣' },
    { cityName: 'Taitung County', zh_tw: '臺東縣' },
    { cityName: 'Hualien County', zh_tw: '花蓮縣' },
    { cityName: 'Keelung City', zh_tw: '基隆市' },
    { cityName: 'Hsinchu County', zh_tw: '新竹縣' },
    { cityName: 'Yilan County', zh_tw: '宜蘭縣' } ]
  */
})
```

## Get cityareas list
Just get cityareas list
```javascript
var addrtozip = require('addrtozip');
addrtozip.getAreas('台北市', function (err, areas) {
  /*
    [ { areaName: 'Zhongzheng Dist.',
        zh_tw: '中正區',
        belongCity: 'Taipei City' },
      { areaName: 'Datong Dist.',
        zh_tw: '大同區',
        belongCity: 'Taipei City' },
      { areaName: 'Zhongshan Dist.',
        zh_tw: '中山區',
        belongCity: 'Taipei City' },
      { areaName: 'Songshan Dist.',
        zh_tw: '松山區',
        belongCity: 'Taipei City' },
      { areaName: 'Da’an Dist.',
        zh_tw: '大安區',
        belongCity: 'Taipei City' },
      { areaName: 'Wanhua Dist.',
        zh_tw: '萬華區',
        belongCity: 'Taipei City' },
      { areaName: 'Xinyi Dist.',
        zh_tw: '信義區',
        belongCity: 'Taipei City' },
      { areaName: 'Shilin Dist.',
        zh_tw: '士林區',
        belongCity: 'Taipei City' },
      { areaName: 'Beitou Dist.',
        zh_tw: '北投區',
        belongCity: 'Taipei City' },
      { areaName: 'Neihu Dist.',
        zh_tw: '內湖區',
        belongCity: 'Taipei City' },
      { areaName: 'Nangang Dist.',
        zh_tw: '南港區',
        belongCity: 'Taipei City' },
      { areaName: 'Wenshan Dist.',
        zh_tw: '文山區',
        belongCity: 'Taipei City' } ]
  */
})
```

If any adress is legal, but return wrong zipcode.
Please let me know. Thanks.

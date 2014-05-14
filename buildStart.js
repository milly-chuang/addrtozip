var Build =  require('./lib/build.js');

var build = new Build();
build.init();




// var _CSV_PATH = 'db/201311_B.csv';
// var fs = require('fs');

// fs.readFileSync('db/201311_B.csv').toString().split('\n').forEach(function (line) { 
//   addrRuleUnit = line.split(',');
//   headAddrStr = addrRuleUnit.slice(1, -1).join('');
//   tailRuleStr = addrRuleUnit[-1];
//   zipcode = addrRuleUnit[0];
  
//   return (null, headAddrStr, tailRuleStr, zipcode)
// });









// var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database('test.db');
// var _CSV_PATH = 'db/201311.csv';

// // db.serialize(function(){
// // 		db.run('create table test2 (info ATEXT)');
// // })

// db.serialize(function() {
//   db.run('create table precise(addr_str text, rule_str text, zipcode  text, primary key (addr_str, rule_str))');
//   console.log('a');
//   db.run('create table gradual(addr_str text primary key, zipcode  text)', function(err, data){
//   	console.log('d');
//   });
//   console.log('c');
//   db.run('create table AA(addr_str text primary key, zipcode  text)', function(err, data){
//   	console.log(err);
//   	console.log(data);
//   	console.log('e');
//   });
//   console.log('g');
// });
// console.log('i');







// var addr = '台北市中正區中華路１段23之九號2樓(研究大樓)';

// var _UNIT_RE = new RegExp(
//   '(?:' +
//     '(\\d+)' +
//     '(之\\d+)?' +
//     '(?=[巷弄號樓]|$)' +
//     '|' +
//     '(.+?)' +
//   ')' +
//   '(?:' +
//     '([(市區)(鎮區)(鎮市)縣市鄉鎮市區村里鄰路街段巷弄號樓])' +
//     '|' +
//     '(?=\\d+(?:之\\d+)?[巷弄號樓]|$)' +
//   ')',
// 	'g'
// )
// var test = [];
// var units;
// while(units = _UNIT_RE.exec(addr)){
// 	test.push(units);
// }
// console.log(test)







// var str = '台北市中正區中華路１段23之九號2樓之2(研究大樓),';
// var reg = new RegExp(
// 	'[ 　,，台~-]' +
// 	'|' +
// 	'[０-９]' +
// 	'|' +
// 	'[一二三四五六七八九]?' +
// 	'十?' +
// 	'[一二三四五六七八九]' +
// 	'[段路街巷弄號樓]' +
// 	'|' +
// 	'[一二三四五六七八九]?' +
// 	'十' +
// 	'[段路街巷弄號樓]'
// );

// var replaceMap = {
//   '-': '之', '~': '之', '台': '臺', ' ': '', '　': '', ',': '',
//   '１': '1', '２': '2', '３': '3', '４': '4', '５': '5',
//   '６': '6', '７': '7', '８': '8', '９': '9', '０': '0',
//   '一': '1', '二': '2', '三': '3', '四': '4', '五': '5',
//   '六': '6', '七': '7', '八': '8', '九': '9', '十': '10'
// };

// while(reg.test(str)){
// 	var beReplace = str.match(reg).toString();
// 	var replaceWord;
// 	if (beReplace.length == 1){
// 		replaceWord = replaceMap[beReplace];
// 	}else if (beReplace.length == 2){
// 		replaceWord = beReplace.replace(beReplace.charAt(0), replaceMap[beReplace.charAt(0)]);
// 	}else if (beReplace.length == 3){
// 		if (beReplace.search('十') == 0){
// 			replaceWord = beReplace.replace(beReplace.slice(0, 2), '1'+replaceMap[beReplace.charAt(1)]);
// 		}else if (beReplace.search('十') == 1){
// 			replaceWord = beReplace.replace(beReplace.slice(0, 2), replaceMap[beReplace.charAt(0)] + '0');
// 		}else{
// 			replaceWord = beReplace.replace(beReplace.slice(0, 2), replaceMap[beReplace.charAt(0)] + replaceMap[beReplace.charAt(1)]);
// 		}
// 	}else{
// 		if (beReplace.search('十') == 1 && beReplace.indexOf('十') == beReplace.lastIndexOf('十')){
// 			replaceWord = beReplace.replace(beReplace.slice(0, 3), replaceMap[beReplace.charAt(0)] + replaceMap[beReplace.charAt(2)]);
// 		}else if (beReplace.indexOf('十') != beReplace.lastIndexOf('十')){
// 			break;
// 		}else{
// 			replaceWord = beReplace.replace(beReplace.slice(0, 3), replaceMap[beReplace.charAt(0)] + replaceMap[beReplace.charAt(1)] + replaceMap[beReplace.charAt(2)]);
// 		}
// 	}
// 	str = str.replace(beReplace, replaceWord);
// }

// var regEndCheck = /([樓號])(之)(\d+)/;
// while(regEndCheck.test(str)){
// 	beReplace = str.match(regEndCheck);
// 	replaceWord = beReplace[2]+beReplace[3]+beReplace[1];
// 	str = str.replace(beReplace[0].toString(), replaceWord);
// }

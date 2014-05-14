var Zipcode =  require('./lib/zipcode.js');
var zipcode = new Zipcode();

var fs = require('fs');
var addrFile = fs.readFileSync('address.ori','utf8');
var addrs= addrFile.split('\n');

// for(var i=0; i<addrs.length; i++){
// 	zipcode.find(addrs[i], function(addrZipcode){
// 		console.log(addrZipcode);
// 	})
// }

zipcode.find('嘉義縣番路鄉下坑村八鄰39-24', function(addrZipcode){
	console.log(addrZipcode);
})
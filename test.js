var Zipcode =  require('./lib/zipcode.js');
var zipcode = new Zipcode();

// var fs = require('fs');
// var addrFile = fs.readFileSync('./test/address.ori','utf8');
// var addrs= addrFile.split('\r\n');


// for(var i=0; i<addrs.length; i++){
// 	zipcode.find(addrs[i], function(addrZipcode){
// 		console.log(addrZipcode);
// 	})
// }


zipcode.find('宜蘭縣五結鄉五結村五結中路二段323巷98號', function(addrZipcode){
	console.log(addrZipcode);
})

(function(){
  var Address = function(){
		var _TOKEN_RE = new RegExp(
		  '(?:' +
		    '(\\d+)' +
		    '(之\\d+)?' +
		    '(?=[巷弄號樓]|$)' +
		    '|' +
		    '(.+?)' +
		  ')' +
		  '(?:' +
		    '([(市區)(鎮區)(鎮市)縣市鄉鎮市區村里鄰路街段巷弄號樓])' +
		    '|' +
		    '(?=\\d+(?:之\\d+)?[巷弄號樓]|$)' +
		  ')',
			'g'
		)

    var _REPLACE_RE = new RegExp(
      '[Ff 　,，台~-]' +
      '|' +
      '[０-９]' +
      '|' +
      '[一二三四五六七八九]?' +
      '十?' +
      '[一二三四五六七八九]' +
      '[段路街巷弄號樓]' +
      '|' +
      '[一二三四五六七八九]?' +
      '十' +
      '[段路街巷弄號樓]'
    );

    var _REPLACE_MAP = {
      '-': '之', '~': '之', '台': '臺', ' ': '', '　': '', 'f': '樓', 'F': '樓',
      '１': '1', '２': '2', '３': '3', '４': '4', '５': '5',
      '６': '6', '７': '7', '８': '8', '９': '9', '０': '0',
      '一': '1', '二': '2', '三': '3', '四': '4', '五': '5',
      '六': '6', '七': '7', '八': '8', '九': '9', '十': '10'
    };

    var normalize = function(str){
      while(_REPLACE_RE.test(str)){
        var beReplace = str.match(_REPLACE_RE).toString();
        var replaceWord;
        if (beReplace.length == 1){
          replaceWord = _REPLACE_MAP[beReplace];
        }else if (beReplace.length == 2){
          replaceWord = beReplace.replace(beReplace.charAt(0), _REPLACE_MAP[beReplace.charAt(0)]);
        }else if (beReplace.length == 3){
          if (beReplace.search('十') == 0){
            replaceWord = beReplace.replace(beReplace.slice(0, 2), '1'+_REPLACE_MAP[beReplace.charAt(1)]);
          }else if (beReplace.search('十') == 1){
            replaceWord = beReplace.replace(beReplace.slice(0, 2), _REPLACE_MAP[beReplace.charAt(0)] + '0');
          }else{
            replaceWord = beReplace.replace(beReplace.slice(0, 2), _REPLACE_MAP[beReplace.charAt(0)] + _REPLACE_MAP[beReplace.charAt(1)]);
          }
        }else{
          if (beReplace.search('十') == 1 && beReplace.indexOf('十') == beReplace.lastIndexOf('十')){
            replaceWord = beReplace.replace(beReplace.slice(0, 3), _REPLACE_MAP[beReplace.charAt(0)] + _REPLACE_MAP[beReplace.charAt(2)]);
          }else if (beReplace.indexOf('十') != beReplace.lastIndexOf('十')){
            break;
          }else{
            replaceWord = beReplace.replace(beReplace.slice(0, 3), _REPLACE_MAP[beReplace.charAt(0)] + _REPLACE_MAP[beReplace.charAt(1)] + replaceMap[beReplace.charAt(2)]);
          }
        }
        str = str.replace(beReplace, replaceWord);
      }

      var regEndCheck = /([樓號])(之)(\d+)/;
      while(regEndCheck.test(str)){
        beReplace = str.match(regEndCheck);
        replaceWord = beReplace[2]+beReplace[3]+beReplace[1];
        str = str.replace(beReplace[0].toString(), replaceWord);
      }

      return str
    }

    var normalizeArr = function(arr){
      for(var i in arr){
        arr[i] = normalize(arr[i]);
      }
      return arr;
    }

    var tokenize = function(addr){
    	var addrUnitArr = [];
    	var addrUnit;
    	while(addrUnit = _TOKEN_RE.exec(addr)){
    		addrUnitArr.push(addrUnit);
    	}
    	var tokens = addrUnitArr;
    	return tokens;
    }

    var flat = function(addrArr, idx){
      var addr = '';
      idx = idx ? idx : addrArr.length;
      // console.log(addrArr);
      // console.log(idx)
      if (addrArr.length != 0){
        for(var i=0; i<idx; i++){
          addr = addr + addrArr[i][0]
        }
      }
      return addr;
    }

    return {
      normalize: normalize,
      normalizeArr: normalizeArr,
      tokenize: tokenize,
      flat: flat
    };
  }

  module.exports = Address;
})();
(function(){
  var util = {};
  //rule should be set arr2
  util.arrGE = function(arr1, arr2){
    // console.log('arrGE')
    var arr1Len = arr1 ? arr1.length : 0;
    var arr2Len = arr2 ? arr2.length : 0;
    var _len = arr2Len;
    for(var i=0; i<_len; i++){
      if(!(/^\d+$/.test(arr1[i]) && /^\d+$/.test(arr2[i]))){
        return false;
      }
      if(parseInt(arr1[i]) > parseInt(arr2[i])){
        // console.log(arr1 + '>' + arr2)
        return true;
      }else if (parseInt(arr1[i]) < parseInt(arr2[i])){
        // console.log(arr1 + '<' + arr2)
        return false;
      }
    }
        // console.log(arr1 + '<' + arr2)
    // console.log('end')
    return true;
  }

  util.arrGT = function(arr1, arr2){
    // console.log('arrGT')
    var arr1Len = arr1 ? arr1.length : 0;
    var arr2Len = arr2 ? arr2.length : 0;
    var _len = arr2Len;
    for(var i=0; i<_len; i++){
      if(!(/^\d+$/.test(arr1[i]) && /^\d+$/.test(arr2[i]))){
        // console.log('not d')
        return false;
      }
      if(parseInt(arr1[i]) > parseInt(arr2[i])){
        // console.log(arr1 + '>' + arr2)
        return true;
      }else if (parseInt(arr1[i]) < parseInt(arr2[i])){
        // console.log(arr1 + '<' + arr2)
        return false;
      }
    }
        // console.log(arr1 + '<' + arr2)
    // console.log('end')
    return false;
  }

  util.arrLE = function(arr1, arr2){
    var arr1Len = arr1 ? arr1.length : 0;
    var arr2Len = arr2 ? arr2.length : 0;
    var _len = arr2Len;
    for(var i=0; i<_len; i++){
      if(!(/^\d+$/.test(arr1[i]) && /^\d+$/.test(arr2[i]))){
        return false;
      }
      if(parseInt(arr1[i]) < parseInt(arr2[i])){
        return true;
      }else if (parseInt(arr1[i]) > parseInt(arr2[i])){
        // console.log(arr1 + '<' + arr2)
        return false;
      }
    }
        // console.log(arr1 + '<' + arr2)
    return true;
  }

  util.arrLT = function(arr1, arr2){
    var arr1Len = arr1 ? arr1.length : 0;
    var arr2Len = arr2 ? arr2.length : 0;
    var _len = arr2Len;
    for(var i=0; i<_len; i++){
      if(!(/^\d+$/.test(arr1[i]) && /^\d+$/.test(arr2[i]))){
        return false;
      }
      if(parseInt(arr1[i]) < parseInt(arr2[i])){
        return true;
      }else if (parseInt(arr1[i]) > parseInt(arr2[i])){
        // console.log(arr1 + '<' + arr2)
        return false;
      }
    }
        // console.log(arr1 + '<' + arr2)
    return false;
  }
  module.exports = util;
})();
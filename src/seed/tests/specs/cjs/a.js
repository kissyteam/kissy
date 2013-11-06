KISSY.add(function(){
    var b=KISSY.require('./b');
    var c=KISSY.require(1>2?'./c':'');
    return b+1;
});
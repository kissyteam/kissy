KISSY.add(function(){
    var module=this;
    var b=module.require('./b');
    var c=module.require(1>2?'./c':'');
    module.exports=b+1;
});
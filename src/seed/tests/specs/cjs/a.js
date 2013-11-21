KISSY.add(function(S,require,exports,module){
    cjs_test.push(2);
    var b=require('./b');
    cjs_test.push(4);
    var c=require(1>2?'./c':'');
    cjs_test.push(6);
    module.exports=b+1;
});
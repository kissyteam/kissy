KISSY.add(function(S,require,exports,module){
    cjsTest.push(2);
    var b=require('./b');
    cjsTest.push(4);
    cjsTest.push(6);
    module.exports=b+1;
});
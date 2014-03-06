KISSY.add(function(S,b,v){
    cjsTest.push(2);
    cjsTest.push(4);
    cjsTest.push(6);
    return b+1;
},{
    requires:['./b',1>2?'./c':'']
});
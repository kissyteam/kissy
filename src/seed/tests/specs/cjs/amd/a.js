KISSY.add(function(S,b,v){
    cjs_test.push(2);
    cjs_test.push(4);
    cjs_test.push(6);
    return b+1;
},{
    requires:['./b',1>2?'./c':'']
});
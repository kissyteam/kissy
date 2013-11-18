KISSY.add(function(S,b,v){
    var module=this;
    cjs_test.push(2);
    cjs_test.push(4);
    cjs_test.push(6);
    module.exports=b+1;
},{
    requires:['./b',1>2?'./c':'']
});
KISSY.add("timestamp/x",function(){
    window.TIMESTAMP_X=window.TIMESTAMP_X||0;
    window.TIMESTAMP_X++;
    return window.TIMESTAMP_X;
},{
    requires:['./z']
});
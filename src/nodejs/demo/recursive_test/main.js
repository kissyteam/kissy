var KISSY=require("KISSY");

console.log(KISSY.config);

KISSY.config({
    packages:[{
        mods:__dirname.replace(/\\/g,"/")+"/" 
    }]
});

KISSY.use("mods/start",function(S,r){
    console.log(r);
});
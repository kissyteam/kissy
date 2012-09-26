var KISSY = require('../../../../../../build/kissy-nodejs').KISSY;

KISSY.config({
    packages:
        {
            mods: {
                base:'file:'+ __dirname.replace(/\\/g, "/")
            }
        }

});

KISSY.use("mods/start", function (S, r) {
    console.log(r);
});
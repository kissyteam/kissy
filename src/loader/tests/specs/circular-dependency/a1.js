KISSY.add('circular-dependency/a1',function (S, require, exports) {
    var b = require('./b1');
    exports.b = function () {
        return b.b() + 1;
    };
    exports.a = function () {
        return 1;
    };
});
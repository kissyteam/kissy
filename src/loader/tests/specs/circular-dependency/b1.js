KISSY.add('circular-dependency/b1', function (S, require, exports) {
    var a = require('./a1');
    exports.b = function () {
        return a.a() + 1;
    };
    exports.a = function () {
        return 1;
    };
});
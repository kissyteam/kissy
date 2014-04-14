KISSY.add("circular-dependency/b", function (S, require, exports) {
    var c = require('./c');
    exports.b = 'b';
    exports.get = function () {
        return c.get() + 'b';
    }
});
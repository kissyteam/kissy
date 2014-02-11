KISSY.add("cyclic/c", function (S, require, exports) {
    var a = require('./a');
    exports.c = 'c';
    exports.get = function () {
        return this.c+a.a;
    }
});
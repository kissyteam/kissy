KISSY.add("cyclic/a", function (S, require, exports) {
    var b = require('./b');
    exports.a = 'a';
    exports.get = function () {
        return b.get()+this.a;
    }
});
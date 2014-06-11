// --no-module-wrap--
KISSY.add('p-c/a', ['./b'], function (S, require) {
    var b = require('./b');
    return b + 1;
});
KISSY.add('p-c/b', ['./c'], function () {
    return 3;
});
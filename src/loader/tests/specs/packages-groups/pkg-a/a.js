KISSY.add("pkg-a/a", function (S, b, c) {
    return b + c;
}, {
    requires: ['pkg-b/b', 'pkg-c/c']
});
expect(window.TEST_A || 0).toBe(0);
KISSY.add("tests2/a", function (S, b) {
    window.TEST_A = 1;
    return b + 4;
}, {
    requires:['./b']
});
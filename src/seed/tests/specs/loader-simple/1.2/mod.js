KISSY.add("1.2/mod", function (S, D) {
    expect(this.resolve('./dep.png').toString())
        .toBe('http://' + location.host + '/kissy/src/seed/tests/specs/loader-simple/1.2/dep.png');
    return D + 1;
}, {
    requires: ["./dep", "./mod.css"]
});
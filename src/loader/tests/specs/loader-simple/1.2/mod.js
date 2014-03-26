KISSY.add('1.2/mod', function (S, D) {
    expect(this.getUrl().replace(/\?.+$/, ''))
        .toBe('http://' + location.host + '/kissy/src/loader/tests/specs/loader-simple/1.2/mod.js');
    return D + 1;
}, {
    requires: ['./dep', './mod.css']
});
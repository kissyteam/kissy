KISSY.add('alias-a/b', function (S, d) {
    expect(d).toBe('alias-a/d/e');
    return 'alias-a/b';
}, {
    requires: ['alias-a/d']
});
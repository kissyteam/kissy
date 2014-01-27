describe('core package', function () {
    var S = KISSY;

    it('can set individually', function () {
        S.config({
            base: '/kissy/src/seed/tests/specs/core-package',
            debug: false,
            packages: {
                'core-package-test': {
                    base: '/kissy/src/seed/tests/specs/core-package'
                }
            },
            'core': {
                debug: true
            }
        });
        var ok = 0;
        KISSY.use('t,core-package-test/t', function (S, coreT, t) {
            expect(coreT).toBe(1);
            expect(t).toBe(2);
            ok = 1;
        });
        waitsFor(function () {
            return ok;
        });
    });
});
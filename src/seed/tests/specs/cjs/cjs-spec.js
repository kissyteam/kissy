describe('it support module.require', function () {
    window.cjs_test = [];
    it('support cjs module and lazy initialization', function () {
        var S = KISSY;
        S.config('packages', {
            cjs: {
                base: '/kissy/src/seed/tests/specs'
            }
        });
        var ret;
        S.use(function () {
            cjs_test.push(1);
            ret = KISSY.require('cjs/a');
            cjs_test.push(7);
        });
        waitsFor(function () {
            return ret == 3
        });
        runs(function () {
            expect(cjs_test).toEqual([1, 2, 3, 4, 6, 7]);
            window.cjs_test = [];
        });
    });

    it('amd is not lazy', function () {
        var S = KISSY;
        S.config('packages', {
            amd: {
                base: '/kissy/src/seed/tests/specs/cjs'
            }
        });
        var ret;
        S.use(function () {
            cjs_test.push(1);
            ret = KISSY.require('amd/a');
            cjs_test.push(7);
        });
        waitsFor(function () {
            return ret == 3
        });
        runs(function () {
            expect(cjs_test).toEqual([1, 3, 2, 4, 6, 7]);
            window.cjs_test = [];
        });
    });
});
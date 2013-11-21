describe('it support commonjs require', function () {
    window.cjs_test = [];
    it('support cjs module and lazy initialization', function () {
        var S = KISSY;
        S.config('packages', {
            cjs: {
                base: '/kissy/src/seed/tests/specs'
            }
        });
        var ret;
        S.use('cjs/a',function (S,a) {
            ret = a
        });
        waitsFor(function () {
            return ret == 3
        });
        runs(function () {
            expect(cjs_test).toEqual([ 2, 3, 4, 6]);
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
        S.use('amd/a',function (S,a) {
            ret = a;
        });
        waitsFor(function () {
            return ret == 3
        });
        runs(function () {
            expect(cjs_test).toEqual([3, 2, 4, 6]);
            window.cjs_test = [];
        });
    });
});
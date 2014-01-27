describe('it support commonjs require', function () {
    beforeEach(function () {
        window.cjs_test = [];
        KISSY.config('combine', false);
    });

    afterEach(function () {
        KISSY.clearLoader();
        try {
            delete window.cjs_test;
        } catch (e) {
            window.cjs_test = undefined;
        }
    });

    it('support cjs module and lazy initialization', function () {
        var S = KISSY;
        S.config('packages', {
            cjs: {
                base: '/kissy/src/seed/tests/specs'
            }
        });
        var ret;
        S.use('cjs/a', function (S, a) {
            ret = a;
        });
        waitsFor(function () {
            return ret === 3;
        });
        runs(function () {
            expect(window.cjs_test).toEqual([ 2, 3, 4, 6]);
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
        S.use('amd/a', function (S, a) {
            ret = a;
        });
        waitsFor(function () {
            return ret == 3
        });
        runs(function () {
            expect(window.cjs_test).toEqual([3, 2, 4, 6]);
        });
    });
});
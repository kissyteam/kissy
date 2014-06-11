/**
 * commonjs module format tc
 * @author yiminghe@gmail.com
 */
// --no-module-wrap--
describe('it support commonjs require', function () {
    /*jshint quotmark:false*/
    beforeEach(function () {
        window.cjsTest = [];
        KISSY.config('combine', false);
    });

    afterEach(function () {
        KISSY.clearLoader();
        try {
            delete window.cjsTest;
        } catch (e) {
            window.cjsTest = undefined;
        }
    });

    it('amd is not lazy', function () {
        var S = KISSY;
        S.config('packages', {
            amd: {
                base: '/kissy/src/loader/tests/specs/cjs/amd'
            }
        });
        var ret;
        S.use('amd/a', function (S, a) {
            ret = a;
        });
        waitsFor(function () {
            return ret === 3;
        });
        runs(function () {
            expect(window.cjsTest).toEqual([3, 2, 4, 6]);
        });
    });

    it('support cjs module and lazy initialization', function () {
        var S = KISSY;
        S.config('packages', {
            cjs: {
                base: '/kissy/src/loader/tests/specs/cjs'
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
            expect(window.cjsTest).toEqual([ 2, 3, 4, 6]);
        });
    });
});
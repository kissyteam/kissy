// --no-module-wrap--
describe('support require api in KISSY.add', function () {
    afterEach(function () {
        KISSY.clearLoader();
    });

    it('async and toUrl works', function () {
        KISSY.config('packages', {
            't': {
                tag: 2,
                base: '/kissy/src/loader/tests/specs/require-api'
            }
        });
        var ret1, ret2;
        KISSY.use(['t/t1', 't/t2'], function (S, t1, t2) {
            t1.init(function (tt1) {
                ret1 = tt1;
            });

            t2.init(function (tt2) {
                ret2 = tt2;
            });
        });

        waitsFor(function () {
            return ret1 && ret2;
        });

        runs(function () {
            expect(ret1).toBe('http://' + location.host + '/kissy/src/loader/tests/specs/require-api/x.css');
            expect(ret2).toBe(2);
        });
    });
});
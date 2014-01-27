/**
 * tc for system.ondemand similar functionality
 * @author yiminghe@gmail.com
 */
describe('support system.ondemand', function () {
    beforeEach(function () {
        KISSY.config('combine', false);
    });

    afterEach(function () {
        KISSY.clearLoader();
    });
    // https://gist.github.com/wycats/51c96e3adcdb3a68cbc3
    it('provide similar functionality', function () {
        KISSY.config('packages', {
            'p-c': {
                base: '/kissy/src/seed/tests/specs/system-ondemand/',
                //combine: true,
                ignorePackageNameInUri: true
            }
        });

        KISSY.config('modules', {
            'p-c/b': {
                requires: ['./c'],
                path: '/kissy/src/seed/tests/specs/system-ondemand/a.js'
            }
        });


        var ret = 0;

        KISSY.use('p-c/a', function (S, a) {
            expect(a).toBe(4);
            ret++;
        });

        //setTimeout(function(){

        // known issue, if combine:true second request will be ??a.js,c.js
        KISSY.use('p-c/b', function (S, b) {
            expect(b).toBe(3);
            ret++;
        });

        waitsFor(function () {
            return ret === 2;
        });

        //},1000);
    });
});
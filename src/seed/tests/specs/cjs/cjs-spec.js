describe('it support module.require', function () {
    it('can load module from dependencies', function () {
        var S = KISSY;
        S.config('packages', {
            cjs: {
                base: '/kissy/src/seed/tests/specs'
            }
        });
        var ret;
        S.use(function () {
            ret = KISSY.require('cjs/a');
        });
        waitsFor(function () {
            return ret == 3
        });
    });
});
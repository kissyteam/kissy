describe('it support KISSY.require', function () {
    it('can load module from dependencies', function () {
        var S = KISSY;
        S.config('packages', {
            cjs: {
                base: './',
                ignorePackageNameInUri: 1
            }
        });
        var ret;
        S.use('cjs/a', function (S, a) {
            ret = a;
        });
        waitsFor(function () {
            return ret == 3
        });
    });
});
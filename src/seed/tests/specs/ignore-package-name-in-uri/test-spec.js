describe('ignore-package-name-in-uri', function () {
    var S = KISSY;
    it('works', function () {

        var combine = S.config('combine');

        S.config({

            'packages': {
                'ignore-package-name-in-uri': {
                    base: window['specsPath'] ||
                        '../specs/ignore-package-name-in-uri/'+(combine?'combo/':'simple/'),
                    ignorePackageNameInUri: 1
                }
            },
            modules: {
                'ignore-package-name-in-uri/a': {
                    requires: ['./b']
                }
            }

        });

        var ret = 0;

        S.use('ignore-package-name-in-uri/a', function (S, A) {
            expect(A).toBe(5);
            ret = 1;
        });

        waitsFor(function () {
            return ret;
        });

    });

});
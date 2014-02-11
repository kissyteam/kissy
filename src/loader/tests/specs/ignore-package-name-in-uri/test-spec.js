var run = function (combine) {
    describe('ignore-package-name-in-uri ' + (combine ? 'at combo mode' : ''), function () {
        var S = KISSY;
        beforeEach(function () {
            KISSY.config('combine', !!combine);
        });

        afterEach(function () {
            KISSY.clearLoader();
        });
        it('works', function () {
            S.config({

                'packages': {
                    'ignore-package-name-in-uri': {
                        base: window['specsPath'] ||
                            '../specs/ignore-package-name-in-uri/' + (combine ? 'combo/' : 'simple/'),
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
};
run();
run(1);
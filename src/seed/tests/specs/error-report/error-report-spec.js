describe('loader should report error', function () {
    var S = KISSY;
    it('should works', function () {

        KISSY.clearLoader();

        var combine = KISSY.config('combine');

        KISSY.config({
            'packages': {
                'report': {
                    base: '/kissy/src/seed/tests/specs/error-report/' +
                        (combine ? 'combo' : 'simple'),
                    ignorePackageNameInUri: 1
                }
            }
        });

        if (combine) {
            KISSY.config('modules', {
                'report/s1': {
                    requires: ['./s2']
                },
                'report/s3': {
                    requires: ['./s4', './s2']
                }
            });
        }

        var success1;
        var error1;

        KISSY.use('report/s1', {
            success: function () {
                success1 = arguments;
            },
            error: function () {
                error1 = arguments;
            }
        });

        var success2;
        var error2;


        KISSY.use('report/s3', {
            success: function () {
                success2 = arguments;
            },
            error: function () {
                error2 = arguments;
            }
        });

        waitsFor(function () {
            return (success1 || error1) && (success2 || error2);
        });

        runs(function () {
            expect(success1[1]).toBe('!!');
            expect(success1.length).toBe(2);
            expect(error1).toBeUndefined();
            expect(success2).toBeUndefined();
            expect(error2.length).toBe(1);
            expect(error2[0].name).toBe(combine ? 'report/s3' : 'report/s4');
            expect(error2[0].status).toBe(S.Loader.Status.ERROR);
        });

    });
});
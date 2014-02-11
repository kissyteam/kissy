describe('timeout', function () {
    var S = KISSY;

    var timeout;

    beforeEach(function () {
        timeout = S.config('timeout') || 0;
        S.config({
            combine: false,
            timeout: 1
        });
    });

    afterEach(function () {
        S.config({
            timeout: timeout
        });
        S.clearLoader();
    });

    it('works for use', function () {
        S.config({
            modules: {
                'timeout/use': {
                    path: 'http://' + location.host +
                        '/kissy/src/loader/tests/specs/timeout/use.jss?' + S.now()
                }
            }
        });

        var ok = 0, error = 0;

        S.use('timeout/use', {
            success: function (S, d) {
                expect(d).toBe(1);
                ok = 1;
            },
            error: function () {
                //var args = S.makeArray(arguments);
                ok = 1;
                error = 1;
            }
        });

        waitsFor(function () {
            return ok;
        });

        runs(function () {
            //expect(error).toBe(1);
        });

    });

    it('works for use2', function () {
        S.config({
            packages: {
                timeout: {
                    base: 'http://' + location.host +
                        '/kissy/src/loader/tests/specs/'
                }
            },
            modules: {
                'timeout/r2': {
                    path: 'http://' + location.host +
                        '/kissy/src/loader/tests/specs/timeout/r2.jss?' + S.now()
                }
            }
        });

        var ok = 0, error = 0;

        S.use('timeout/r', {
            success: function () {
                ok = 1;
            },
            error: function () {
                // var args = S.makeArray(arguments);
                ok = 1;
                error = 1;
            }
        });

        waitsFor(function () {
            return ok;
        });

        runs(function () {
            expect(error).toBe(1);
        });
    });
});
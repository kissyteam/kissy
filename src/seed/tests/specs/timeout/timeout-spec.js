describe('timeout', function () {
    var S = KISSY;

    beforeEach(function () {
        S.config({
            timeout: 1
        });
    });

    afterEach(function () {
        S.config({
            timeout: 0
        });
        S.clearLoader();
    });

    it('works for use', function () {
        S.config({
            modules: {
                'timeout/use': {
                    fullpath: 'http://' + location.host +
                        '/kissy/src/seed/tests/specs/timeout/use.jss?' + S.now()
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
                        '/kissy/src/seed/tests/specs/'
                }
            },
            modules: {
                'timeout/r2': {
                    fullpath: 'http://' + location.host +
                        '/kissy/src/seed/tests/specs/timeout/r2.jss?' + S.now()
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
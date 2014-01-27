var run = function (combine) {
    var S = KISSY;

    describe("simple config for package works " + (combine ? 'at combo mode' : ''), function () {
        beforeEach(function () {
            KISSY.config('combine', !!combine);
        });

        afterEach(function () {
            KISSY.clearLoader();
        });

        it("works", function () {
            var mods = KISSY.Env.mods;
            KISSY.config({
                debug: false,
                packages: [
                    {
                        debug: true,
                        name: 't',
                        path: '/kissy/src/seed/tests/specs/package/'
                    }
                ]
            });
            var ok1;

            KISSY.use("t/t", function (S, t) {
                expect(t).toBe(1);
                ok1 = 1;
            });

            waitsFor(function () {
                return ok1 == 1;
            });

            runs(function () {
                expect(mods["t/t"].exports).toBe(1);
            });

            runs(function () {
                KISSY.config({
                    debug: true
                });
            });
        });

        it('allows use package directly', function () {
            S.config({
                packages: [
                    {
                        name: 't',
                        path: '/kissy/src/seed/tests/specs/package/'
                    }
                ]
            });

            var ok = 0;

            KISSY.use('t', function (S, T) {
                expect(T).toBe(2);
                ok = 1;
            });

            waitsFor(function () {
                return ok;
            });
        });
    });
};
run();
run(1);
describe("loader", function () {
    var S = KISSY;
    describe("simple config for package works", function () {
        it("works", function () {
            S.clearLoader();
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
            S.clearLoader();
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
});
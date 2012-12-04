describe("combo loader", function () {
    describe("raw config for package works", function () {

        it("works and avoid repeated loading", function () {
            var mods = KISSY.Env.mods;
            KISSY.config({
                debug: false,
                packages: [
                    {
                        debug: true,
                        name: 't',
                        path: '/kissy/src/seed/tests/specs/package-raw/'
                    }
                ]
            });

            var ok1;

            runs(function () {
                console.log(new Array(20).join('-'));
                console.log('start load t/t2');
                console.log(new Array(20).join('-'));

                KISSY.use("t/t2", function () {
                    ok1 = 2;
                    console.log(new Array(20).join('-'));
                    console.log('end load t/t2');
                    console.log(new Array(20).join('-'));
                });
            });

            waitsFor(function () {
                return ok1 == 2;
            });

            runs(function () {
                expect(mods["t/t2"].getValue()).toBe(2);
            });

            runs(function () {
                KISSY.config({
                    debug: true
                });
            });
        });
    });
});
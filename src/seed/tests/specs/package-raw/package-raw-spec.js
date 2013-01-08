describe("simple loader", function () {
    describe("raw config for package works", function () {

        it("works and avoid repeated loading", function () {
            var mods = KISSY.Env.mods;
            KISSY.config({
                debug:false,
                packages:[
                    {
                        debug:true,
                        name:'t',
                        path:'/kissy/src/seed/tests/specs/package-raw/'
                    }
                ]
            });
            var ok1;

            KISSY.use("t/t", function () {
                ok1 = 1;
            });

            waitsFor(function () {
                return ok1 == 1;
            });

            runs(function () {
                expect(mods["t/t"].getValue()).toBe(1);
            });

            runs(function () {
                KISSY.config({
                    debug:true
                });
            });
        });
    });
});
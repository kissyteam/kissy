describe("loader", function () {
    describe("raw config for package works", function () {

        it("works and avoid repeated loading", function () {
            var mods = KISSY.Env.mods;
            KISSY.config({
                debug:false,
                packages:[
                    {
                        debug:true,
                        name:'t',
                        path:'/kissy_git/kissy1.3/src/seed/tests/specs/package-raw/'
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
                    combine:true,
                    map:[
                        [/\?t=.+/, ""]
                    ]
                });
                KISSY.use("t/t2", function () {
                    ok1 = 2;
                });
            });

            waitsFor(function () {
                return ok1 == 2;
            });

            runs(function () {
                expect(mods["t/t2"].getValue()).toBe(2);
            });

            runs(function () {
                KISSY.Config.mappedRules = [];
                KISSY.config({
                    debug:true,
                    combine:false
                });
            });
        });
    });
});
describe("loader", function () {
    describe("timestamp for individual module works", function () {


        it("works and avoid repeated loading", function () {
            var mods = KISSY.Env.mods;
            KISSY.config({
                debug:true,
                packages:[
                    {
                        name:'timestamp',
                        tag:'a',
                        path:'/kissy_git/kissy/src/seed/tests/loader/'
                    }
                ]
            });
            var ok1;

            KISSY.use("timestamp/x.js?t=b", function () {
                ok1 = 1;
            });

            waitsFor(function () {
                return ok1 == 1;
            });

            runs(function () {
                expect(mods["timestamp/x"].getUrlTag()).toBe("b");
                expect(window.TIMESTAMP_X).toBe(1);
            });

            runs(function () {
                KISSY.use("timestamp/y", function () {
                    ok1 = 2;
                });
            });

            waitsFor(function () {
                return ok1 == 2;
            });

            runs(function () {
                expect(mods["timestamp/x"].getUrlTag()).toBe("b");
                expect(mods["timestamp/y"].getUrlTag()).toBe("a");
                expect(window.TIMESTAMP_X).toBe(1);
            });
        });
    });
});
describe("loader", function () {
    describe("timestamp for individual module works", function () {
        var S = KISSY;

        it("works and avoid repeated loading", function () {
            var mods = KISSY.Env.mods;

            KISSY.config({
                debug:true,
                packages:{
                    'timestamp':{
                        tag:'a',
                        path:'/kissy/src/seed/tests/specs/'
                    }
                },
                modules:{
                    'timestamp/x':{
                        tag:'b',
                        requires:['./z']
                    },
                    'timestamp/z':{
                        tag:'z'
                    }
                }
            });

            var ok1;

            KISSY.use("timestamp/x", function () {
                ok1 = 1;
            });

            waitsFor(function () {
                return ok1 == 1;
            });

            runs(function () {
                expect(S.endsWith(mods["timestamp/x"].fullpath, "b.js")).toBe(true);
                expect(S.endsWith(mods["timestamp/z"].fullpath, "z.js")).toBe(true);
                expect(mods["timestamp/x"].getTag()).toBe("b");
                expect(mods["timestamp/z"].getTag()).toBe("z");
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
                expect(mods["timestamp/x"].getTag()).toBe("b");
                expect(mods["timestamp/y"].getTag()).toBe("a");
                expect(window.TIMESTAMP_X).toBe(1);
            });
        });


        it("can be set later", function () {
            window.TIMESTAMP_X = 0;
            KISSY.clearLoader();

            var mods = KISSY.Env.mods;

            KISSY.config({
                debug:true,
                packages:{
                    'timestamp':{
                        tag:'a',
                        path:'/kissy/src/seed/tests/specs/'
                    }
                },
                modules:{
                    'timestamp/x':{
                        tag:'b',
                        requires:['./z']
                    },
                    'timestamp/z':{
                        tag:'z'
                    }
                }
            });

            KISSY.config("modules", {
                'timestamp/x':{
                    tag:'q'
                }
            });



            var ok1;

            KISSY.use("timestamp/x", function () {
                ok1 = 1;
            });

            waitsFor(function () {
                return ok1 == 1;
            });

            runs(function () {
                expect(S.endsWith(mods["timestamp/x"].fullpath, "q.js")).toBe(true);
                expect(S.endsWith(mods["timestamp/z"].fullpath, "z.js")).toBe(true);
                expect(mods["timestamp/x"].getTag()).toBe("q");
                expect(mods["timestamp/z"].getTag()).toBe("z");
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
                expect(mods["timestamp/x"].getTag()).toBe("q");
                expect(mods["timestamp/y"].getTag()).toBe("a");
                expect(window.TIMESTAMP_X).toBe(1);
            });
        });
    });
});
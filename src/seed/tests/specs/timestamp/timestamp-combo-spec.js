describe("loader", function () {
    describe("timestamp for individual module works in combine mode", function () {
        var S = KISSY;
        var host = location.host;

        it("works theoretically", function () {

            S.clearLoader();
            window.TIMESTAMP_X = 0;
            var combine = KISSY.config("combine");

            KISSY.config({
                base: '',
                tag: '',
                combine: true,
                debug: true,
                packages: {
                    'timestamp': {
                        tag: 'a',
                        base: '/kissy/src/seed/tests/specs/'
                    }
                },
                modules: {
                    'timestamp/x': {
                        tag: 'b',
                        requires: ['./z']
                    },
                    'timestamp/y': {
                        requires: ['./x']
                    },
                    'timestamp/z': {
                        tag: 'z'
                    }
                }
            });

            var waitingModules = new S.Loader.WaitingModules(function () {
            });
            var loader = new S.Loader.ComboLoader(S, waitingModules);
            var Loader = S.Loader,
                utils = Loader.Utils;

            var allModNames = S.keys(loader.calculate(["timestamp/y"]));

            utils.createModulesInfo(S, allModNames);

            var comboUrls = loader.getComboUrls(allModNames);

            expect(comboUrls.js['timestamp'][0].fullpath)
                .toBe("http://" + host +
                    "/kissy/src/seed/tests/specs/timestamp/??y.js,x.js,z.js?t=a.js");

        });


        it("works practically", function () {
            S.clearLoader();
            window.TIMESTAMP_X = 0;
            KISSY.config({
                base: '',
                tag: '',
                combine: true,
                debug: true,
                packages: {
                    'timestamp': {
                        tag: 'a',
                        base: '/kissy/src/seed/tests/specs/'
                    }
                },
                modules: {
                    'timestamp/x': {
                        tag: 'b',
                        requires: ['./z']
                    },
                    'timestamp/y': {
                        requires: ['./x']
                    },
                    'timestamp/z': {
                        tag: 'z'
                    }
                }
            });

            var ok = 0;

            S.use('timestamp/y', function (S, Y) {
                expect(Y).toBe(1);
                ok = 1;
            });

            waitsFor(function () {
                return ok;
            });

        });


        it("works theoretically when package has no combo", function () {

            S.clearLoader();
            window.TIMESTAMP_X = 0;
            var combine = KISSY.config("combine");

            KISSY.config({
                base: '',
                tag: '',
                combine: true,
                debug: true,
                packages: {
                    'timestamp': {
                        combine: false,
                        tag: 'a',
                        base: '/kissy/src/seed/tests/specs/'
                    }
                },
                modules: {
                    'timestamp/x': {
                        tag: 'b',
                        requires: ['./z']
                    },
                    'timestamp/y': {
                        requires: ['./x']
                    },
                    'timestamp/z': {
                        tag: 'z'
                    }
                }
            });

            var waitingModules = new S.Loader.WaitingModules(function () {
            });
            var loader = new S.Loader.ComboLoader(S, waitingModules);
            var Loader = S.Loader,
                utils = Loader.Utils;

            var allModNames = S.keys(loader.calculate(["timestamp/y"]));

            utils.createModulesInfo(S, allModNames);
            var comboUrls = loader.getComboUrls(allModNames);

            var key = "timestamp";

            var jss = comboUrls.js[key];

            expect(jss[0].fullpath).toBe("http://" + host + "/kissy/src/seed/tests/specs/timestamp/y.js?t=a.js");
            expect(jss[1].fullpath).toBe("http://" + host + "/kissy/src/seed/tests/specs/timestamp/x.js?t=b.js");
            expect(jss[2].fullpath).toBe("http://" + host + "/kissy/src/seed/tests/specs/timestamp/z.js?t=z.js");


        });

        it("works practically when package has no combo", function () {
            S.clearLoader();
            window.TIMESTAMP_X = 0;
            KISSY.config({
                base: '',
                tag: '',
                combine: true,
                debug: true,
                packages: {
                    'timestamp': {
                        combine: false,
                        tag: 'a',
                        base: '/kissy/src/seed/tests/specs/'
                    }
                },
                modules: {
                    'timestamp/x': {
                        tag: 'b',
                        requires: ['./z']
                    },
                    'timestamp/y': {
                        requires: ['./x']
                    },
                    'timestamp/z': {
                        tag: 'z'
                    }
                }
            });

            var ok = 0;

            S.use('timestamp/y', function (S, Y) {
                expect(Y).toBe(1);
                ok = 1;
            });

            waitsFor(function () {
                return ok;
            });

        });
    });
});
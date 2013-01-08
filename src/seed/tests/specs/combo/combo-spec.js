describe("KISSY ComboLoader", function () {
    var S = KISSY,
        host = location.host,
        ComboLoader = S.Loader.Combo;


    it("should works simply", function () {

        KISSY.clearLoader();

        var ret = 0;
        var ret2 = 0;

        KISSY.config({
            packages: [
                {
                    name: 'tests3',
                    path: '/kissy/src/seed/tests/specs/combo/'
                }
            ]
        });

        S.config('modules', {
            "tests3/a": {
                requires: ["./b"]
            },
            "tests3/b": {
                requires: ["./c", "dom"]
            }
        });

        S.use("tests3/b", function (S, c) {
            var a = 2444;
            expect(c).toBe(3);
            // do not queue for loaded module
            S.use('tests3/b', function () {
                a = 1
            });
            setTimeout(function () {
                ret = a;
            }, 0);
            ret2 = a;
        });

        waitsFor(function () {
            return ret;
        }, 2000);

        runs(function () {
            expect(ret).toBe(1);
            // always async
            expect(ret2).toBe(2444);
        });

    });

    it("should calculate rightly", function () {
        waits(10);
        runs(function () {
            expect(S.Env._comboLoader.loading).toBe(0);

            S.clearLoader();

            var l = new ComboLoader(S);

            S.config('modules', {
                a: {
                    requires: ["b", "c"]
                },
                b: {
                    requires: ["d", "e"]
                },
                d: {
                    requires: ["f", "g"]
                },
                "h": {
                    requires: ["a", "m"]
                }
            });

            var r;
            r = l.calculate(["a", "h"]);
            S.Loader.Utils.createModulesInfo(S, r);
            var c = l.getComboUrls(r);
            expect(c.js[''][0]).toBe(S.Config.base +
                "??a.js,b.js,d.js,f.js,g.js,e.js,c.js,h.js,m.js?t=" + S.Config.tag);

        });

    });

    it("should trunk url by comboMaxFileNum config rightly", function () {
        waits(10);
        runs(function () {
            expect(S.Env._comboLoader.loading).toBe(0);

            S.clearLoader();

            var comboMaxFileNum = S.config('comboMaxFileNum');

            S.config('comboMaxFileNum', 2);

            var l = new ComboLoader(S);

            S.config('modules', {
                a: {
                    requires: ["b", "c"]
                },
                b: {
                    requires: ["d", "e"]
                }
            });

            var r;
            r = l.calculate(["a", "b"]);
            S.Loader.Utils.createModulesInfo(S, r);
            var c = l.getComboUrls(r);
            var js = c.js[''];
            expect(js.length).toBe(3);
            expect(js[0]).toBe(S.Config.base + "??a.js,b.js?t=" + S.Config.tag);
            expect(js[1]).toBe(S.Config.base + "??d.js,e.js?t=" + S.Config.tag);
            expect(js[2]).toBe(S.Config.base + "??c.js?t=" + S.Config.tag);

            S.config('comboMaxFileNum', comboMaxFileNum);
        });
    });

    it("should trunk url by comboMaxUrlLength automatically", function () {
        waits(10);
        runs(function () {
            S.config('comboMaxFileNum', 9999);

            expect(S.Env._comboLoader.loading).toBe(0);

            S.clearLoader();

            var x = {}, k = 3000;

            for (var i = 0; i < 100; i++) {
                var r2 = [];
                for (var j = 0; j < 5; j++) {
                    r2.push("y" + (k++))
                }
                x["y" + i] = {
                    requires: r2
                }
            }

            var l = new ComboLoader(S);

            S.config('modules', x);

            var ret = [];
            for (i = 0; i < 100; i++) {
                ret.push("y" + i);
            }
            var r;
            r = l.calculate(ret);
            S.Loader.Utils.createModulesInfo(S, r);
            var c = l.getComboUrls(r);
            var cjs = c.js[''];
            expect(cjs.length).toBe(3);

            S.each(cjs, function (j) {
                expect(j.length).not.toBeGreaterThan(S.Config.comboMaxUrlLength)
            });
        });
    });

    it("should works for native mod", function () {
        waits(10);
        runs(function () {
            expect(S.Env._comboLoader.loading).toBe(0);

            S.clearLoader();

            S.DOM = null;
            S.use("dom", function () {
                expect(S.DOM).not.toBe(undefined);
            });
            waitsFor(function () {
                return S.DOM;
            });
        });
    });

    it("should works for packages", function () {
        waits(10);
        runs(function () {
            KISSY.clearLoader();

            expect(S.Env._comboLoader.loading).toBe(0);

            S.clearLoader();

            KISSY.config({
                packages: [
                    {
                        name: 'tests',
                        path: '/kissy/src/seed/tests/specs/combo/'
                    }
                ]
            });
            S.config('modules', {
                "tests/a": {
                    requires: ['./b']
                },
                "tests/b": {
                    requires: ['./c', 'dom']
                }
            });

            var mods = S.getLoader().calculate(["tests/a"]);
            S.Loader.Utils.createModulesInfo(S, mods);
            var urls = S.getLoader().getComboUrls(mods);
            var host = location.host;

            expect(urls['js']['tests'][0])
                .toBe("http://" + host + "/kissy/src/seed/tests/specs/combo/" +
                    "tests/??a.js,b.js,c.js?t=" + S.Config.tag);

            S.DOM = null;

            S.use('tests/a', function (S, a) {
                expect(a).toBe(6);
            });

            waitsFor(function () {
                return S.DOM;
            });
        });
    });

    it("should works for multiple use at the same time", function () {

        waits(10);
        runs(function () {
            S.clearLoader();

            expect(S.Env._comboLoader.loading).toBe(0);

            KISSY.config({
                packages: [
                    {
                        name: 'tests2',
                        path: '/kissy/src/seed/tests/specs/combo/'
                    }
                ]
            });
            S.config('modules', {
                "tests2/a": {
                    requires: ['./b']
                },
                "tests2/b": {
                    requires: ['./c', 'dom']
                },
                x: {}
            });

            S.DOM = null;

            window.TEST_A = 0;

            var ret = 0, order = [];

            S.use('tests2/a', function (S, a) {
                order.push(1);
                expect(a).toBe(7);
                ret = 1;
            });

            S.use('tests2/a', function (S, a) {
                order.push(2);
                expect(a).toBe(7);
                ret = 2;
            });

            waitsFor(function () {
                return ret == 2;
            });

            runs(function () {
                expect(order).toEqual([1, 2]);
            });
        });
    });

    it("works for not combo for specified packages", function () {
        window.TIMESTAMP_X = 0;

        KISSY.config({
            base: '',
            tag: '',
            debug: true,
            packages: {
                'timestamp': {
                    combine: false,
                    base: '/kissy/src/seed/tests/specs/'
                }
            },
            modules: {
                'timestamp/x': {
                    requires: ['./z']
                },
                'timestamp/y': {
                    requires: ['./x']
                }
            }
        });

        runs(function () {
            var loader = S.getLoader(), Loader = S.Loader, utils = Loader.Utils;

            var allModNames = loader.calculate(["timestamp/y"]);

            utils.createModulesInfo(S, allModNames);
            var comboUrls = loader.getComboUrls(allModNames);

            var key = "timestamp";

            var jss = comboUrls.js[key];

            expect(jss[0]).toBe("http://" + host + "/kissy/src/seed/tests/specs/timestamp/y.js");
            expect(jss[1]).toBe("http://" + host + "/kissy/src/seed/tests/specs/timestamp/x.js");
            expect(jss[2]).toBe("http://" + host + "/kissy/src/seed/tests/specs/timestamp/z.js");

        });
    });


    it("should load mod not config", function () {
        S.clearLoader();

        KISSY.config({
            packages: [
                {
                    name: 'tests4',
                    path: '/kissy/src/seed/tests/specs/combo/'
                }
            ]
        });

        S.DOM = null;

        var ret = 0;

        S.use('tests4/a', function () {
            ret = 9;
        });

        waitsFor(function () {
            return S.DOM && (ret === 9);
        });
    });

    it("can use after another use", function () {

        KISSY.config({
            packages: [
                {
                    name: 'test5',
                    path: '/kissy/src/seed/tests/specs/combo/'
                }
            ]
        });

        S.config('modules', {
            "test5/a": {
                requires: ["test5/b"]
            }
        });

        var ok = 0;
        S.use("test5/a", function (S, A) {
            expect(A).toBe("test5/a");
            S.use("test5/b", function (S, B) {
                expect(B).toBe("test5/b");
                ok = 1;
            });
        });

        waitsFor(function () {
            return ok;
        }, "too long!");
    });

    it("clean", function () {
        S.clearLoader();
    });
});
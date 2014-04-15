/*jshint quotmark:false*/
describe("ComboLoader", function () {
    var S = KISSY,
        kBase = S.config('base'),
        host = location.host;

    beforeEach(function () {
        S.config('combine', true);
    });

    afterEach(function () {
        S.clearLoader();
    });

    it("can combo test and not combo kissy", function () {
        var ret = 0;

        S.config({
            combine: false,
            packages: {
                tests3: {
                    combine: true,
                    base: '/kissy/src/loader/tests/specs/combo/tests3'
                }
            }
        });

        S.config('modules', {
            "tests3/a": {
                requires: ["./b"]
            },
            "tests3/b": {
                requires: ["./c"]
            }
        });

        S.use("tests3/b", function (S, c) {
            ret = c;
        });

        waitsFor(function () {
            return ret === 3;
        }, 2000);

        runs(function () {
            S.config('combine', true);
        });
    });

    it('can combine combo and non combo', function () {
        S.config({
            packages: {
                'no-combo': {
                    combine: false,
                    base: '/kissy/src/loader/tests/specs/combo/no-combo'
                }
            }
        });
        var r;
        S.use('no-combo/a', function (S, a) {
            r = a;
        });

        waitsFor(function () {
            return r === 2;
        });
    });

    it("should works simply", function () {
        var ret = 0;

        S.config({
            packages: {
                tests3: {
                    base: '/kissy/src/loader/tests/specs/combo/tests3'
                }

            }
        });

        S.config('modules', {
            "tests3/a": {
                requires: ["./b"]
            },
            "tests3/b": {
                requires: ["./c"]
            }
        });

        S.use("tests3/b", function (S, c) {
            var a = 2444;
            expect(c).toBe(3);
            // do not queue for loaded module
            S.use('tests3/b', function () {
                a = 1;
            });
            ret = a;
        });

        waitsFor(function () {
            return ret;
        }, 2000);

        runs(function () {
            expect(ret).toBe(1);
        });
    });

    it("should calculate rightly", function () {
        waits(10);
        runs(function () {
            var l = new S.Loader.ComboLoader();

            S.config('packages', {
                test: {
                    base: 'http://a/'
                }
            });

            S.config('modules', {
                'test/a': {
                    requires: ["./b", "./c"]
                },
                'test/b': {
                    requires: ["./d", "./e"]
                },
                'test/d': {
                    requires: ["./f", "./g"]
                },
                'test/h': {
                    requires: ["./a", "./m"]
                }
            });

            var r;
            r = l.calculate((["test/a", "test/h"]));
            var c = l.getComboUrls(r);
            expect(c.js[0].url).toBe("http://a/??a.js,b.js,d.js,f.js,g.js,e.js,c.js,h.js,m.js");
        });
    });

    it("should trunk url by comboMaxFileNum config rightly", function () {
        waits(10);
        runs(function () {

            var comboMaxFileNum = S.config('comboMaxFileNum');

            S.config('comboMaxFileNum', 2);

            S.config('packages', {
                a: {
                    base: 'http://a/'
                }
            });

            var l = new S.Loader.ComboLoader();

            S.config('modules', {
                'a/a': {
                    requires: ["a/b", "a/c"]
                },
                'a/b': {
                    requires: ["a/d", "a/e"]
                }
            });

            var r;
            r = l.calculate((["a/a", "a/b"]));
            var c = l.getComboUrls(r);
            var js = c.js;
            expect(js.length).toBe(3);
            expect(js[0].url).toBe("http://a/??a.js,b.js");
            expect(js[1].url).toBe("http://a/??d.js,e.js");
            expect(js[2].url).toBe("http://a/??c.js");

            S.config('comboMaxFileNum', comboMaxFileNum);
        });
    });

    it("should trunk url by comboMaxUrlLength automatically", function () {
        waits(10);
        runs(function () {
            S.config('comboMaxFileNum', 9999);

            var x = {}, k = 3000;

            for (var i = 0; i < 100; i++) {
                var r2 = [];
                for (var j = 0; j < 5; j++) {
                    r2.push('y' + (k++));
                }
                x['y' + i] = {
                    requires: r2
                };
            }

            var l = new S.Loader.ComboLoader();

            S.config('modules', x);

            var ret = [];
            for (i = 0; i < 100; i++) {
                ret.push('y' + i);
            }
            var r;
            r = l.calculate((ret));
            var c = l.getComboUrls(r);
            var cjs = c.js;
            expect(cjs.length).toBe(5);

            S.Loader.Utils.each(cjs, function (j) {
                expect(j.url.length).not.toBeGreaterThan(S.Config.comboMaxUrlLength);
            });
        });
    });

    it("should works for packages", function () {
        waits(10);
        runs(function () {
            S.config({
                packages: {
                    tests: {
                        base: '/kissy/src/loader/tests/specs/combo/tests'
                    }

                }
            });
            S.config('modules', {
                "tests/a": {
                    requires: ['./b']
                },
                "tests/b": {
                    requires: ['./c']
                }
            });

            var loader = new S.Loader.ComboLoader();
            var mods = loader.calculate((["tests/a"]));
            var urls = loader.getComboUrls(mods);
            var host = location.host;

            expect(urls.js[0].url)
                .toBe("http://" + host + "/kissy/src/loader/tests/specs/combo/" +
                    "tests/??a.js,b.js,c.js");

            // remote fetch
            S.clearLoader();
            S.config({
                packages: {
                    tests: {
                        base: '/kissy/src/loader/tests/specs/combo/tests'
                    }

                }
            });
            S.config('modules', {
                "tests/a": {
                    requires: ['./b']
                },
                "tests/b": {
                    requires: ['./c']
                }
            });

            var ok = 0;

            S.use('tests/a', function (S, a) {
                expect(a).toBe(6);
                ok = 1;
            });

            waitsFor(function () {
                return ok;
            });
        });
    });

    it("should works for multiple use at the same time", function () {
        waits(10);
        runs(function () {
            S.config({
                packages: {
                    tests2: {
                        base: '/kissy/src/loader/tests/specs/combo/tests2'
                    }

                }
            });
            S.config('modules', {
                "tests2/a": {
                    requires: ['./b']
                },
                "tests2/b": {
                    requires: ['./c']
                },
                x: {}
            });

            window.TEST_A = 0;

            var ret = 0;

            S.use('tests2/a', function (S, a) {
                expect(a).toBe(7);
                ret++;
            });

            S.use('tests2/a', function (S, a) {
                expect(a + 1).toBe(8);
                ret++;
            });

            waitsFor(function () {
                return ret === 2;
            });
        });
    });

    it("works for not combo for specified packages", function () {
        window.TIMESTAMP_X = 0;

        S.config({
            base: '',
            tag: '',
            debug: true,
            packages: {
                'timestamp': {
                    combine: false,
                    base: '/kissy/src/loader/tests/specs/timestamp'
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
            var loader = new S.Loader.ComboLoader();

            var allMods = loader.calculate((["timestamp/y"]));

            var comboUrls = loader.getComboUrls(allMods);

            var jss = comboUrls.js;

            expect(jss[0].url).toBe("http://" + host + "/kissy/src/loader/tests/specs/timestamp/y.js");
            expect(jss[1].url).toBe("http://" + host + "/kissy/src/loader/tests/specs/timestamp/x.js");
            expect(jss[2].url).toBe("http://" + host + "/kissy/src/loader/tests/specs/timestamp/z.js");
        });
    });


    it("should load mod not config", function () {
        S.config({
            packages: {
                tests4: {
                    base: '/kissy/src/loader/tests/specs/combo/tests4'
                }
            }
        });

        var ret = 0;

        S.use('tests4/a', function () {
            ret = 9;
        });

        waitsFor(function () {
            return ret === 9;
        });
    });

    it("can use after another use", function () {

        S.config({
            packages: {
                test5: {
                    base: '/kissy/src/loader/tests/specs/combo/test5'
                }
            }
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
});
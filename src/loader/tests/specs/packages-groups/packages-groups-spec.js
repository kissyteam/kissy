/**
 * tc for support group combo for package
 * @author 阿古
 */
/*jshint quotmark:false*/
describe("modules and groups", function () {
    var S = KISSY,
        Utils= S.Loader.Utils,
        ComboLoader = S.Loader.ComboLoader;

    beforeEach(function () {
        KISSY.config('combine', true);
    });

    afterEach(function () {
        KISSY.clearLoader();
    });

    it("combo packages", function () {
        KISSY.config({
            packages: {
                "pkg-a": {
                    group: "my",
                    base: "../specs/packages-groups/pkg-a"
                },
                "pkg-b": {
                    group: "my",
                    base: "../specs/packages-groups/pkg-b"
                },
                "pkg-c": {
                    base: "../specs/packages-groups/pkg-c"
                }
            },
            modules: {
                "pkg-a/a": {
                    requires: ["pkg-b/b", 'pkg-c/c']
                }
            }
        });
        var l = new ComboLoader();
        var r = l.calculate(Utils.createModules(["pkg-a/a", "pkg-c/c"]));
        var c = l.getComboUrls(r);
        var js = c.js;
        expect(js.length).toBe(2);
        expect(js[0].url.substring(js[0].url.indexOf('??')))
            .toBe("??c.js");
        expect(js[1].url.substring(js[1].url.indexOf('??')))
            .toBe("??pkg-a/a.js,pkg-b/b.js");
    });

    it('works', function () {
        KISSY.config({
            packages: {
                "pkg-a": {
                    group: "my",
                    base: "../specs/packages-groups/pkg-a"
                },
                "pkg-b": {
                    group: "my",
                    base: "../specs/packages-groups/pkg-b"
                },
                "pkg-c": {
                    base: "../specs/packages-groups/pkg-c"
                }
            },
            modules: {
                "pkg-a/a": {
                    requires: ["pkg-b/b", 'pkg-c/c']
                }
            }
        });

        var ok = 0;
        KISSY.use('pkg-a/a', function (S, r) {
            expect(r).toBe(5);
            ok = 1;
        });

        waitsFor(function () {
            return ok;
        });
    });

    it("combo packages which have no combo prefix", function () {
        var l = new ComboLoader();

        KISSY.config({
            packages: {
                "pkg-a": {
                    group: "my",
                    base: "../specs/packages-groups/pkg-a"
                },
                "test": {
                    group: "my",
                    base: "http://g.tbcdn.cn/test"
                }
            },
            modules: {
                "pkg-a/a": {},
                "test/x": {}
            }
        });

        var r = l.calculate(Utils.createModules(["pkg-a/a", "test/x"]));
        var c = l.getComboUrls(r);
        var js = c.js;
        expect(js.length).toBe(2);
        expect(js[0].url.substring(js[0].url.indexOf('??')))
            .toBe("??a.js");
        expect(js[1].url).toBe("http://g.tbcdn.cn/test/??x.js");
    });

    it("combo packages with different charset", function () {
        var l = new ComboLoader();

        KISSY.config({
            packages: {
                "pkg-a": {
                    group: "my",
                    charset: "utf-8",
                    base: "../specs/packages-groups/pkg-a"
                },
                "pkg-b": {
                    group: "my",
                    charset: "gbk",
                    base: "../specs/packages-groups/pkg-b"
                }
            },
            modules: {
                "pkg-a/a": {
                    requires: ["pkg-b/b"]
                }
            }
        });

        var r = l.calculate(Utils.createModules(["pkg-a/a"]));
        var c = l.getComboUrls(r);
        var js = c.js;
        expect(js.length).toBe(2);
        expect(js[0].url.substring(js[0].url.indexOf('??')))
            .toBe("??a.js");
        expect(js[1].url.substring(js[1].url.indexOf('??')))
            .toBe("??b.js");
    });

    it('can perform 3 package combo', function () {
        KISSY.config({
            group: 'my',
            packages: {
                "pkg-a": {
                    base: "../specs/packages-groups/pkg-a"
                },
                "pkg-b": {
                    base: "../specs/packages-groups/pkg-b"
                },
                "pkg-c": {
                    base: "../specs/packages-groups/pkg-c"
                }
            },
            modules: {
                "pkg-a/a": {
                    requires: ["pkg-b/b", 'pkg-c/c']
                }
            }
        });

        var l = new ComboLoader();
        var r = l.calculate(Utils.createModules(["pkg-a/a", "pkg-c/c"]));
        var c = l.getComboUrls(r);
        var size = 0;
        for (var i in c) {
            size++;
            i = 0;
        }
        expect(size).toBe(1);
        var js = c.js;
        expect(js.length).toBe(1);
        expect(js[0].url.substring(js[0].url.indexOf('??')))
            .toBe('??pkg-a/a.js,pkg-b/b.js,pkg-c/c.js');

    });


    it('can skip cross origin package combo', function () {
        if (location.hostname !== 'localhost') {
            return;
        }

        var url = 'http://localhost:9999/src/loader/tests/specs/packages-groups';
        KISSY.config({
            group: 'my',
            packages: {
                "pkg-a": {
                    base: "../specs/packages-groups/pkg-a"
                },
                "pkg-b": {
                    base: url+'/pkg-b'
                },
                "pkg-c": {
                    base: "../specs/packages-groups/pkg-c"
                }
            },
            modules: {
                "pkg-a/a": {
                    requires: ["pkg-b/b", 'pkg-c/c']
                }
            }
        });
        var l = new ComboLoader();
        var r = l.calculate(Utils.createModules(["pkg-a/a"]));
        var c = l.getComboUrls(r);
        expect(c.js.length).toBe(2);
        var js = c.js;
        expect(js[0].url).toBe('http://localhost:9999/src/loader/tests/specs/packages-groups/pkg-b/??b.js');
        expect(js[1].url).toBe('http://localhost:8888/kissy/src/loader/tests/specs/packages-groups/??pkg-a/a.js,pkg-c/c.js');
    });
});
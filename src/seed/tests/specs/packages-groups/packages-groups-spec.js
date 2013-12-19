/**
 * tc for support group combo for package
 * @author 阿古
 */
describe("modules and groups", function () {
    var S = KISSY,
        ComboLoader = S.Loader.ComboLoader,
        groupTag = ComboLoader.groupTag;

    it('works', function () {
        S.clearLoader();
        KISSY.config({
            packages: {
                "pkg-a": {
                    group: "my",
                    base: "../specs/packages-groups"
                },
                "pkg-b": {
                    group: "my",
                    base: "../specs/packages-groups"
                },
                "pkg-c": {
                    base: "../specs/packages-groups"
                }
            },
            modules: {
                "pkg-a/a": {
                    requires: ["pkg-b/b", 'pkg-c/c']
                },
                "pkg-b/b": {
                    requires: ["dom/base"]
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

    it("combo packages", function () {
        S.clearLoader();
        KISSY.config({
            packages: {
                "pkg-a": {
                    group: "my",
                    base: "../specs/packages-groups"
                },
                "pkg-b": {
                    group: "my",
                    base: "../specs/packages-groups"
                },
                "pkg-c": {
                    base: "../specs/packages-groups"
                }
            },
            modules: {
                "pkg-a/a": {
                    requires: ["pkg-b/b", 'pkg-c/c']
                },
                "pkg-b/b": {
                    requires: ["dom/base"]
                }
            }
        });

        var waitingModules = new S.Loader.WaitingModules(function () {
        });
        var l = new ComboLoader(S, waitingModules);
        var r = S.keys(l.calculate(["pkg-a/a", "pkg-c/c"]));
        S.Loader.Utils.createModulesInfo(S, r);
        var c = l.getComboUrls(r);
        var comboName = 'my_utf-8_' + groupTag;
        var js = c.js[comboName];
        expect(js.length).toBe(1);
        expect(js[0].fullpath.substring(js[0].fullpath.indexOf('??')))
            .toBe("??pkg-a/a.js,pkg-b/b.js");
        js = c.js['pkg-c'];
        expect(js.length).toBe(1);
        expect(js[0].fullpath.substring(js[0].fullpath.indexOf('??')))
            .toBe("??c.js");
    });

    it("combo packages which have no combo prefix", function () {
        S.clearLoader();
        var waitingModules = new S.Loader.WaitingModules(function () {
        });
        var l = new ComboLoader(S, waitingModules);

        KISSY.config({
            packages: {
                "pkg-a": {
                    group: "my",
                    base: "../specs/packages-groups"
                },
                "test": {
                    group: "my",
                    base: "http://g.tbcdn.cn"
                }
            },
            modules: {
                "pkg-a/a": {},
                "test/x": {}
            }
        });

        var r = S.keys(l.calculate(["pkg-a/a", "test/x"]));
        S.Loader.Utils.createModulesInfo(S, r);
        var comboName = 'my_utf-8_' + groupTag;
        var c = l.getComboUrls(r);
        var js = c.js[comboName];
        expect(js.length).toBe(1);
        expect(js[0].fullpath.substring(js[0].fullpath.indexOf('??')))
            .toBe("??a.js");
        js = c.js['test'];
        expect(js.length).toBe(1);
        expect(js[0].fullpath).toBe("http://g.tbcdn.cn/test/??x.js");
    });

    it("combo packages with different charset", function () {
        S.clearLoader();
        var waitingModules = new S.Loader.WaitingModules(function () {
        });
        var l = new ComboLoader(S, waitingModules);

        KISSY.config({
            packages: {
                "pkg-a": {
                    group: "my",
                    charset: "utf-8",
                    base: "../specs/packages-groups"
                },
                "pkg-b": {
                    group: "my",
                    charset: "gbk",
                    base: "../specs/packages-groups"
                }
            },
            modules: {
                "pkg-a/a": {
                    requires: ["pkg-b/b"]
                }
            }
        });

        var r = S.keys(l.calculate(["pkg-a/a"]));
        S.Loader.Utils.createModulesInfo(S, r);
        var c = l.getComboUrls(r);
        var comboName = 'my_utf-8_' + groupTag;
        var js = c.js[comboName];
        expect(js.length).toBe(1);
        expect(js[0].fullpath.substring(js[0].fullpath.indexOf('??')))
            .toBe("??a.js");
        comboName = 'my_gbk_' + groupTag;
        js = c.js[comboName];
        expect(js.length).toBe(1);
        expect(js[0].fullpath.substring(js[0].fullpath.indexOf('??')))
            .toBe("??b.js");
    });

    it('can perform global combo',function(){

        S.clearLoader();
        KISSY.config({
            group:'my',
            packages: {
                "pkg-a": {
                    base: "../specs/packages-groups"
                },
                "pkg-b": {
                    base: "../specs/packages-groups"
                },
                "pkg-c": {
                    base: "../specs/packages-groups"
                }
            },
            modules: {
                "pkg-a/a": {
                    requires: ["pkg-b/b", 'pkg-c/c']
                },
                "pkg-b/b": {
                    requires: ["dom/base"]
                }
            }
        });

        var waitingModules = new S.Loader.WaitingModules(function () {
        });
        var l = new ComboLoader(S, waitingModules);
        var r = S.keys(l.calculate(["pkg-a/a", "pkg-c/c"]));
        S.Loader.Utils.createModulesInfo(S, r);
        var c = l.getComboUrls(r);
        var size=0;
        for(var i in c){
            size++;
        }
        expect(size).toBe(1);
        var comboName = 'my_utf-8_' + groupTag;
        var js = c.js[comboName];
        expect(js.length).toBe(1);
        expect(js[0].fullpath.substring(js[0].fullpath.indexOf('??')))
            .toBe("??src/seed/tests/specs/packages-groups/pkg-a/a.js," +
                "src/seed/tests/specs/packages-groups/pkg-b/b.js," +
                "build/dom/base.js," +
                "src/seed/tests/specs/packages-groups/pkg-c/c.js");

    });
});
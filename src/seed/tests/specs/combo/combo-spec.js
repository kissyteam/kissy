describe("KISSY ComboLoader", function () {
    var S = KISSY,
        host=location.hostname,
        ComboLoader = S.Loader.Combo;


    it("should works simply", function () {

        var p = S.config("packages");
        for (var i in p) {
            delete p[i];
        }

        S.config({
            combine:true,
            map:[
                [/\?t=.*/, ""]
            ]
        });

        var ret = 0;

        S.config({
            packages:[
                {
                    name:'tests3',
                    path:'/kissy_git/kissy1.3/src/seed/tests/specs/combo/'
                }
            ]
        });

        S.add({
            "tests3/a":{
                requires:["./b"]
            },
            "tests3/b":{
                requires:["./c", "dom"]
            },
            dom:{
                requires:['ua']
            }
        });

        S.use("tests3/b", function (S, c) {
            expect(c).toBe(3);
            ret = 1;
        });

        waitsFor(function () {
            return ret;
        }, 2000);

    });

    it("should calculate rightly", function () {

        expect(S.Env._comboLoader.loading).toBe(0);

        S.Env.mods = {};
        var l = new ComboLoader(S);
        l.add({
            a:{
                requires:["b", "c"]
            },
            b:{
                requires:["d", "e"]
            },
            d:{
                requires:["f", "g"]
            },
            "h":{
                requires:["a", "m"]
            }
        });
        var r;
        r = l.calculate(["a", "h"]);
        S.Loader.Utils.createModulesInfo(S, r);
        var c = l.getComboUrls(r);
        expect(c.js[S.Config.base][0] == (S.Config.base +
            "??a.js,b.js,d.js,f.js,g.js,e.js,c.js,h.js,m.js")).
            toBe(true);
    });

    it("should trunk url automatically", function () {

        expect(S.Env._comboLoader.loading).toBe(0);

        S.Env.mods = {};
        var x = {}, k = 3000;
        for (var i = 0; i < 100; i++) {
            var r2 = [];
            for (var j = 0; j < 5; j++) {
                r2.push("y" + (k++))
            }
            x["y" + i] = {
                requires:r2
            }
        }
        var l = new ComboLoader(S);
        l.add(x);
        var ret = [];
        for (i = 0; i < 100; i++) {
            ret.push("y" + i);
        }
        var r;
        r = l.calculate(ret);
        S.Loader.Utils.createModulesInfo(S, r);
        var c = l.getComboUrls(r);
        var cjs = c.js[S.Config.base];
        expect(cjs.length).toBe(3);
        S.each(cjs, function (j) {
            expect(j.length < S.Config.comboMaxUrlLength).toBe(true);
        });
    });

    it("should works for native mod", function () {

        expect(S.Env._comboLoader.loading).toBe(0);

        S.Env.mods = {};
        S.DOM = null;
        S.add({
            dom:{requires:['ua']}
        });
        S.use("dom", function () {
            expect(S.DOM).not.toBe(undefined);
        });
        waitsFor(function () {
            return S.DOM;
        });

    });

    it("should works for packages", function () {

        var p = S.config("packages");
        for (var i in p) {
            delete p[i];
        }

        expect(S.Env._comboLoader.loading).toBe(0);

        S.Env.mods = {};

        S.config({
            packages:[
                {
                    name:'tests',
                    path:'/kissy_git/kissy1.3/src/seed/tests/specs/combo/'
                }
            ]
        });
        S.add({
            "tests/a":{
                requires:['./b']
            },
            "tests/b":{
                requires:['./c', 'dom']
            },
            dom:{
                requires:['ua']
            }
        });

        var mods = S.getLoader().calculate(["tests/a"]);
        S.Loader.Utils.createModulesInfo(S, mods);
        var urls = S.getLoader().getComboUrls(mods);
        var host = location.hostname;

        expect(urls['js']['http://' + host + '/kissy_git/kissy1.3/src/seed/tests/specs/combo/'][0])
            .toBe("http://" + host + "/kissy_git/kissy1.3/src/seed/tests/specs/combo/" +
            "tests/??a.js,b.js,c.js");

        S.DOM = null;

        S.use('tests/a', function (S, a) {
            expect(a).toBe(6);
        });

        waitsFor(function () {
            return S.DOM;
        });
    });

    it("should works for multiple use at the same time", function () {

        var p = S.config("packages");
        for (var i in p) {
            delete p[i];
        }

        expect(S.Env._comboLoader.loading).toBe(0);

        S.Env.mods = {};

        S.config({
            packages:[
                {
                    name:'tests2',
                    path:'/kissy_git/kissy1.3/src/seed/tests/specs/combo/'
                }
            ]
        });
        S.add({
            "tests2/a":{
                requires:['./b']
            },
            "tests2/b":{
                requires:['./c', 'dom']
            },
            dom:{
                requires:['ua']
            },
            x:{}
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

    it("works for not combo for specified packages", function () {
        window.TIMESTAMP_X = 0;
        var combine = S.config("combine");

        S.config({
            base:'',
            tag:'',
            combine:true,
            debug:true,
            packages:{
                'timestamp':{
                    combine:false,
                    base:'/kissy_git/kissy1.3/src/seed/tests/specs/'
                }
            },
            modules:{
                'timestamp/x':{
                    requires:['./z']
                },
                'timestamp/y':{
                    requires:['./x']
                }
            }
        });

        runs(function () {
            var loader = S.getLoader(), Loader = S.Loader, utils = Loader.Utils;

            var allModNames = loader.calculate(["timestamp/y"]);

            utils.createModulesInfo(S, allModNames);
            var comboUrls = loader.getComboUrls(allModNames);

            var key = "http://"+host+"/kissy_git/kissy1.3/src/seed/tests/specs/";

            var jss = comboUrls.js[key];

            expect(jss[0]).toBe("http://"+host+"/kissy_git/kissy1.3/src/seed/tests/specs/timestamp/y.js");
            expect(jss[1]).toBe("http://"+host+"/kissy_git/kissy1.3/src/seed/tests/specs/timestamp/x.js");
            expect(jss[2]).toBe("http://"+host+"/kissy_git/kissy1.3/src/seed/tests/specs/timestamp/z.js");

        });
    });


    it("should load mod not config", function () {
        var p = S.config("packages");
        for (var i in p) {
            delete p[i];
        }

        S.Env.mods = {};

        S.config({
            packages:[
                {
                    name:'tests4',
                    path:'/kissy_git/kissy1.3/src/seed/tests/specs/combo/'
                }
            ]
        });

        S.DOM = null;

        var ret = 0;

        S.use('tests4/a', function (S, a) {
            ret = 9;
        });

        waitsFor(function () {
            return S.DOM && (ret === 9);
        });
    });

    it("can use after another use", function () {

        S.config({
            packages:[
                {
                    name:'test5',
                    path:'/kissy_git/kissy1.3/src/seed/tests/specs/combo/'
                }
            ]
        });

        S.add({
            "test5/a":{
                requires:["test5/b"]
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
        S.config({
            combine:false
        });
        S.config("map").length = 0;
        var p = S.config("packages");
        for (var i in p) {
            delete p[i];
        }
    });
});
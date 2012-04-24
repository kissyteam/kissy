describe("KISSY ComboLoader", function () {
    var S = KISSY,
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
                    path:'/kissy_git/kissy/src/seed/tests/loader/combo/'
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
        var c = l.getComboUrls(r);
        var cjs = c.js[S.Config.base];
        expect(cjs.length).toBe(6);
        S.each(cjs, function (j) {
            expect(j.length < 1054).toBe(true);
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
                    path:'/kissy_git/kissy/src/seed/tests/loader/combo/'
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
                    path:'/kissy_git/kissy/src/seed/tests/loader/combo/'
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
                    path:'/kissy_git/kissy/src/seed/tests/loader/combo/'
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
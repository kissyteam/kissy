describe("KISSY ComboLoader", function () {
    var S = KISSY, ComboLoader = S.Loader.Combo;
    S.config({
        withTag:false,
        combine:true
    });

    it("should calculate rightly", function () {
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
        S.Env.mods = {};
        var l = new ComboLoader(S);
        l.add({
            dom:{requires:['ua']}
        });
        l.use("dom", function () {
            expect(S.DOM).not.toBe(undefined);
        });
        waitsFor(function () {
            return S.DOM;
        });
    });

});
/**
 * test loader for 1.1x and 1.2 both
 * @author:yiminghe@gmail.com
 */
(function() {
    var d = window.location.href.replace(/[^/]*$/, "");
    KISSY.Config.base = "../../";


    describe("loader", function() {
        it("should load internal mods correctly", function() {
            var ok = false;
            KISSY.use("node", function(S, Node) {

                ok = true;
                new Node(document.body).append("<div id='k11x'>");
                new Node(document.body).append("<div id='k12'>");
            });

            waitsFor(function() {
                return ok;
            }, "node never loaded");
        });
    });

    describe("loader < 1.2", function() {
        it("should load and attach custom mods correctly", function() {

            KISSY.add({
                "1.1x-dep":{
                    fullpath:d + "1.1x/dep.js"
                },
                "1.1x-mod":{
                    fullpath:d + "1.1x/mod.js",
                    cssfullpath:d + "1.1x/mod.css",
                    requires:["1.1x-dep"]
                }
            });

            var ok = false;
            KISSY.use("1.1x-mod", function(S) {
                ok = true;
                runs(function() {
                    expect(S.Mod).toBe(2);
                    KISSY.use("node", function(S, N) {
                        expect(N.one("#k11x").css("width")).toBe('111px');
                    });
                });
            });

            waitsFor(function() {
                return ok;
            }, "1.1x-mod never loaded");

        });
    });

    describe("loader >= 1.2", function() {
        it("should load and attach custom mods correctly", function() {

            KISSY.config({
                packages:[
                    {
                        name:"1.2", //包名
                        tag:"20110323",
                        path:d //包对应路径，相对路径指相对于当前页面路径

                    }
                ]
            });

            var ok = false;
            KISSY.use("1.2/mod", function(S, Mod) {
                ok = true;
                runs(function() {
                    expect(Mod).toBe(2);
                    KISSY.use("node", function(S, N) {
                        expect(N.one("#k12").css("width")).toBe('111px');
                    });
                });
            });

            waitsFor(function() {
                return ok;
            }, "1.2/mod never loaded");

        });
    });
})();


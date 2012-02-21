/**
 * test loader for 1.1x and 1.2 both
 * @author yiminghe@gmail.com
 */
(function (S) {
    var d = window.location.href.replace(/[^/]*$/, "");
    S.config({
        base:"../../"
    });

    function getStyle(elem, name) {
        if (document.defaultView) {
            return  document.defaultView.getComputedStyle(elem, null)[name];
        } else {
            return elem.currentStyle[name];
        }
    }

    function $(n) {
        return document.getElementById(n);
    }

    describe("getStyle", function () {

        it("should callback after css onload", function () {

            expect(getStyle($("special"), "fontSize")).not.toBe("33px");

            S.getScript(d + "getStyle/fp2011.css", function () {
                expect(getStyle($("special"), "fontSize")).toBe("33px");
            });


            //expect(getStyle($("special2"), "fontSize")).not.toBe("44px");
            var d2 = d.replace("localhost", "chengyu.taobao.ali.com");
            S.getScript(d2 + "getStyle/fp2011b.css", function () {
                expect(getStyle($("special2"), "fontSize")).toBe("44px");
            });


        });
    });


    describe("loader", function () {
        it("should load internal mods correctly", function () {
            var ok = false;

            S.use("node", function (S, Node) {

                ok = true;
                new Node(document.body).append("<div id='k11x'/>");
                new Node(document.body).append("<div id='k12'/>");
            });

            waitsFor(function () {
                return ok;
            }, "node never loaded");
        });
    });

    describe("loader < 1.2", function () {
        it("should load and attach custom mods correctly", function () {

            S.add({
                "1.1x-dep":{
                    fullpath:d + "1.1x/dep.js"
                },
                //监控 css onload
                "1.1x-mod-css":{
                    fullpath:d + "1.1x/mod.css"
                },

                "1.1x-mod":{
                    fullpath:d + "1.1x/mod.js",
                    //不监控 css onload
                    //cssfullpath:d + "1.1x/mod.css",
                    requires:["1.1x-dep"
                        , "1.1x-mod-css"
                    ]
                }
            });

            var ok = false;
            S.use("1.1x-mod", function (S) {
                ok = true;
                runs(function () {
                    expect(S.Mod).toBe(2);
                    S.use("node", function (S, N) {
                        expect(N.one("#k11x").css("width")).toBe('111px');
                    });
                });
            });

            waitsFor(function () {
                return ok;
            }, "1.1x-mod never loaded");

        });
    });

    describe("loader >= 1.2", function () {
        it("should load and attach custom mods correctly", function () {

            S.config({
                packages:[
                    {
                        name:"1.2", //包名
                        tag:"20110323",
                        path:d //包对应路径，相对路径指相对于当前页面路径

                    }
                ]
            });

            var ok = false;
            S.use("1.2/mod", function (S, Mod) {
                ok = true;
                runs(function () {
                    expect(Mod).toBe(2);
                    var mod12;
                    var scripts = document.getElementsByTagName("script");
                    for (var i = 0; i < scripts.length; i++) {
                        var script = scripts[i];
                        if (script.src.indexOf("1.2/mod.js") > -1) {
                            mod12 = script;
                            break;
                        }
                    }

                    expect(mod12.async).toBe(true);
                    expect(mod12.charset).toBe("utf-8");
                    S.use("node", function (S, N) {
                        expect(N.one("#k12").css("width")).toBe('111px');
                    });
                });
            });

            waitsFor(function () {
                return ok;
            }, "1.2/mod never loaded");


        });

        it("detect cyclic dependency", function () {
            var old = KISSY.Config.base;
            KISSY.config({base : "./loader/"});
            var oldError = S.error, err = '';
            S.error = function (args) {
                err = args;
                oldError(args);
            };
            KISSY.use("a");

            waitsFor(function () {
                return err == 'find cyclic dependency by mod b between mods : c,a,b';
            }, 10000);
            runs(function () {
                S.error = oldError;
                KISSY.Config.base = old;
            });
        });

        it("map config works", function () {

            S.Config.packages = {};
            S.Config.mappedRules = [];
            S.Config.combines = {};
            S.Env._loadQueue = {};
            S.Env.mods = {};

            S.config({
                packages:[
                    {
                        name:"1.2", //包名
                        tag:"20110323",
                        path:d //包对应路径，相对路径指相对于当前页面路径

                    }
                ],
                map:[
                    [/(.+)mod.js(.+)$/, "$1mod-min.js$2"]
                ]
            });

            var ok = 0;

            S.use("1.2/mod", function (S, Mod) {
                ok = 1;
                expect(Mod).toBe(999);
            });

            waitsFor(function () {
                return ok;
            }, "1.2/mod never loaded");

        });

        it("load core when use dom", function () {
            S.Config.packages = {};
            S.Config.mappedRules = [];
            S.Config.combines = {};
            S.Env._loadQueue = {};
            S.Env.mods = {};

            S.config({
                'combines':{
                    'core':['dom', 'ua', 'event', 'node', 'json', 'ajax', 'anim', 'base', 'cookie']
                },
                debug:0,
                base:"../../../build/"
            });

            var ok = 0;
            S.use("dom", function () {
                ok = 1;
                expect(S.Event).not.toBeUndefined();
            });

            waitsFor(function () {
                return ok;
            }, "dom never loaded");

        });

    });


})(KISSY);


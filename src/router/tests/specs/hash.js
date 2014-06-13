/**
 * Router spec for mvc
 * @author yiminghe@gmail.com
 */

/*jshint quotmark:false*/
var Router = require('router');
var getHash = function () {
    return Router.Utils.getHash(location.href);
};
var util = require('util');
var UA = require('ua');

describe("router using hash", function () {
    beforeEach(function () {
        Router.config({
            useHash: true
        });
        location.hash = '';
        waits(900);
    });

    afterEach(function () {
        Router.stop();
        Router.clearRoutes();
    });

    it("works", function () {
        var ok = 0,
            ok3 = 0,
            ok4 = 0,
            ok2 = 0;

        Router.get("/detail/:id", function (req) {
            var paths = req.params;
            var query = req.query;
            expect(paths.id).toBe("9999");
            expect(query.item1).toBe("1");
            expect(query.item2).toBe("2");
            ok2++;
        });

        Router.get("/list/*", function (req) {
            var paths = req.params;
            var query = req.query;
            expect(paths[0]).toBe("what/item");
            expect(query.item1).toBe("1");
            expect(query.item2).toBe("2");
            expect(req.path).toBe('/list/what/item');
            expect(req.url).toBe('/list/what/item?item1=1&item2=2');
            ok++;
        });

        Router.get(/^\/list-(\w)$/, function (req) {
            expect(req.params[0]).toBe('t');
            ok4++;
        });

        Router.get("/:path*", function (req) {
            expect(req.params.path).toBe("haha");
            expect(req.params[0]).toBe("/hah2/hah3");
            expect(req.params[1]).toBe("hah2/hah3");
            ok3++;
        });

        expect(Router.matchRoute('/list/what/item')).toBeTruthy();

        expect(Router.matchRoute('/list2/what/item')).toBeTruthy();

        Router.start();

        waits(200);

        runs(function () {
            Router.navigate("/list/what/item?item1=1&item2=2");
        });

        waits(200);

        runs(function () {
            Router.navigate("/detail/9999?item1=1&item2=2");
        });

        waits(200);

        runs(function () {
            Router.navigate("/haha/hah2/hah3");
        });

        waits(200);

        runs(function () {
            Router.navigate("/list-t");
        });

        waits(200);

        runs(function () {
            expect(ok).toBe(1);
            expect(ok2).toBe(1);
            expect(ok3).toBe(1);
            expect(ok4).toBe(1);
        });
    });

    var ie = UA.ieMode;

    if (ie && ie < 8) {
        // return;
    }

    // ie8 iframe 内 重复刷新！
    // firefox
    if (ie && window.frameElement || UA.firefox) {
        return;
    }

    // ie<8 can only used on event handler
    // see ../others/test-replace-history.html
    it("can replace history", function () {
        var go = 0,
            list = 0,
            detail = 0,
            ok = 0;

        waits(200);

        runs(function () {
            util.each({
                "/go/": function () {
                    go++;
                },
                "/list/": function () {
                    list++;
                },
                "/detail/": function () {
                    detail++;
                }
            }, function (func, route) {
                Router.get(route, func);
            });

            Router.start(function () {
                setTimeout(function () {
                    Router.navigate("/list/");
                    ok = 1;
                }, 190);
            });
        });

        waitsFor(function () {
            return ok;
        });

        waits(500);

        runs(function () {
            Router.navigate("/detail/", {
                replace: 1
            });
        });

        waits(200);

        runs(function () {
            Router.navigate("/go/");
        });

        // phantomjs can not back?
        if (UA.phantomjs) {
            return;
        }

        waits(200);

        runs(function () {
            history.back();
        });

        waits(200);

        runs(function () {
            expect(getHash()).toBe('/detail/');
        });

        waits(200);

        runs(function () {
            history.back();
        });

        waits(200);

        runs(function () {
            expect(getHash()).toBe('/');
        });

        runs(function () {
            expect(go).toBe(1);
            expect(detail).toBe(2);
            expect(list).toBe(1);
        });
    });

});
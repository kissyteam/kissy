/**
 * Router spec for mvc html5 history
 * @author yiminghe@gmail.com
 */
KISSY.use('mvc,event', function (S, MVC, Event) {

    if (!window.history.pushState) {
        return;
    }

    var original = location.href;

    var Router = MVC.Router;

    var urlRoot = new S.Uri(location.href).resolve('./').getPath().replace(/\/$/, '');

    function getPath() {
        return new S.Uri(location.href).getPath().substring(urlRoot.length);
    }

    describe("router", function () {

        it("works", function () {

            var ok = 0,
                ok3 = 0,
                ok4 = 0,
                ok2 = 0;

            var r = new Router({
                routes: {
                    "/*path": function (paths) {
                        expect(paths.path).toBe("haha/hah2/hah3");
                        ok3++;
                    },
                    "/list/*path": function (paths, query, more) {
                        expect(paths.path).toBe("what/item");
                        expect(query.item1).toBe("1");
                        expect(query.item2).toBe("2");
                        expect(more.path).toBe('/list/what/item');
                        expect(more.url).toBe(location.href);
                        ok++;
                    },
                    "/detail/:id": function (paths, query) {
                        expect(paths.id).toBe("9999");
                        expect(query.item1).toBe("1");
                        expect(query.item2).toBe("2");
                        ok2++;
                    },
                    "reg_test": {
                        reg: '^/list-(\\w)$',
                        callback: function (paths) {
                            expect(arguments.length).toBe(3);
                            expect(paths[0]).toBe('t');
                            ok4++;
                        }
                    }

                }
            });


            expect(Router.hasRoute('/list/what/item')).toBe(true);

            expect(Router.hasRoute('/list2/what/item')).toBe(true);

            Router.start({
                urlRoot: new S.Uri(location.href).resolve('./').getPath(),
                nativeHistory: 1,
                success: function () {
                }
            });

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

        // ie<8 can only used on event handler
        // see ../others/test-replace-history.html
        it("can replace history", function () {
            var go = 0, list = 0, detail = 0, ok = 0;

            runs(function () {
                Router.navigate('');
            });

            waits(200);

            var r;

            runs(function () {
                r = new Router({
                    routes: {
                        "/go/": function () {
                            go++;
                        },
                        "/list/": function () {
                            list++;
                        },
                        "/detail/": function () {
                            detail++;
                        }
                    }
                });

                Router.start({
                    nativeHistory: 1,
                    success: function () {
                        Router.navigate("/list/");
                        ok = 1;
                    }
                });
            });

            waitsFor(function () {
                return ok;
            });

            waits(200);

            runs(function () {
                Router.navigate("/detail/", {
                    replaceHistory: 1
                });
            });

            waits(200);

            runs(function () {
                Router.navigate("/go/");
            });

            waits(200);

            runs(function () {
                history.back();
            });

            waits(200);

            runs(function () {
                expect(getPath()).toBe('/detail/')
            });

            waits(200);

            runs(function () {
                history.back();
            });

            waits(200);

            runs(function () {
                expect(getPath()).toBe('')
            });

            runs(function () {
                expect(go).toBe(1);
                expect(detail).toBe(2);
                expect(list).toBe(1);
                window.history.pushState({}, '', original);
            });
        });

    });

});
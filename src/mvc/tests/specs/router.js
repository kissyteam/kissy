/**
 * Router spec for mvc
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, MVC) {

    var Router = MVC.Router;

    function getHash() {
        // 不能 location.hash
        // http://xx.com/#yy?z=1
        // ie6 => location.hash = #yy
        // 其他浏览器 => location.hash = #yy?z=1
        return new S.Uri(location.href).getFragment().replace(/^!/, "");
    }

    describe("router", function () {

        beforeEach(function(){
            location.hash = '';
            waits(900);
        });

        afterEach(function(){
            Router.stop();
        });

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

            // restore hash to its original value
            location.hash='';


            Router.start({
                urlRoot: '/my',
                success: function () {
                }
            });

            runs(function () {
                expect(Router.removeRoot('/my/list/what/item?item1=1&item2=2'))
                    .toBe('/list/what/item');
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

        var ie = S.UA.ieMode;

        if (ie && ie < 8) {
            // return;
        }

        // ie8 iframe 内 重复刷新！
        // firefox
        if ((ie == 8 || ie == 9) && window.frameElement || S.UA.firefox) {
            return;
        }

        // ie<8 can only used on event handler
        // see ../others/test-replace-history.html
        it("can replace history", function () {
            var go = 0, list = 0, detail = 0, ok = 0;

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
                    success: function () {

                        setTimeout(function(){
                            Router.navigate("/list/");
                            ok = 1;
                        },190);

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

            // phantomjs can not back?
            if (S.UA.phantomjs) {
                return;
            }

            waits(200);

            runs(function () {
                history.back();
            });

            waits(200);

            runs(function () {
                expect(getHash()).toBe('/detail/')
            });

            waits(200);

            runs(function () {
                history.back();
            });

            waits(200);

            runs(function () {
                expect(getHash()).toBe('')
            });

            runs(function () {
                expect(go).toBe(1);
                expect(detail).toBe(2);
                expect(list).toBe(1);
            });
        });

    });

},{
    requires:['mvc']
});
/**
 * Domain spec for mvc
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom, MVC) {

    return {
        run: function () {
            var Router = MVC.Router;

            describe("domain in router", function () {

                beforeEach(function () {
                    location.hash = '';
                    waits(900);
                });

                afterEach(function () {
                    Router.stop();
                });

                it("change domain works for router", function () {

                    if (S.UA.ie == 6) {
                        return;
                    }

                    var ok = 0;


                    var r = new Router({
                        routes: {
                            "/*path": function (paths) {
                                expect(paths.path).toBe("haha/hah2/hah3");
                                ok = 1;
                            }
                        }
                    });

                    document.domain = location.hostname;
                    Dom.isCustomDomain = function () {
                        return true;
                    };

                    Router.start();

                    waits(500);

                    runs(function () {
                        Router.navigate("/haha/hah2/hah3");
                    });

                    waits(500);

                    runs(function () {
                        expect(ok).toBe(1);
                    });

                });

            });

        }
    };


}, {
    requires: ['dom', 'mvc']
});
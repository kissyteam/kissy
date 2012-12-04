/**
 * Domain error spec for mvc
 * @author yiminghe@gmail.com
 */
KISSY.use('mvc,event,ua', function (S, MVC, Event, UA) {

    var Model = MVC.Model,
        ie = document.documentMode || UA.ie,
        Collection = MVC.Collection,
        View = MVC.View,
        Router = MVC.Router;

    describe("domain in router", function () {

        it("change domain in middle of code does not work for ie<8", function () {

            if (ie == 6) {
                return;
            }

            var ok = 0;

            location.hash = '';

            var r = new Router({
                routes: {
                    "/*path": function (paths) {
                        expect(paths.path).toBe("haha/hah2/hah3");
                        ok = 1;
                    }
                }
            });

            Router.start();

            waits(500);

            runs(function () {
                document.domain = location.hostname;
                Router.navigate("/haha/hah2/hah3");
            });

            waits(500);

            runs(function () {
                if (ie && ie < 8) {
                    expect(ok).toBe(0);
                }
                else {
                    expect(ok).toBe(1);
                }
            });

        });

    });

});
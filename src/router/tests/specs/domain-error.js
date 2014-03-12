/**
 * Domain error spec for mvc
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Router, Event, UA) {
    /*jshint quotmark:false*/
    var ie = UA.ieMode;

    describe("router: set domain error", function () {
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

        it("change domain in middle of code does not work for ie<8", function () {
            if (ie === 6) {
                return;
            }

            var ok = 0;

            Router.get("/:path*", function (req) {
                expect(req.params.path).toBe("haha");
                expect(req.params[0]).toBe("/hah2/hah3");
                expect(req.params[1]).toBe("hah2/hah3");
                ok = 1;
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
}, {
    requires: ['router', 'event', 'ua']
});
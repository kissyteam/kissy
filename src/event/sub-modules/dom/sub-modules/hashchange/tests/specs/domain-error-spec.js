/**
 * domain error spec for event
 * @author yiminghe@gmail.com
 */
KISSY.use("event/dom,ua,dom", function (S, Event, UA, DOM) {
    var ie = document.documentMode || UA.ie;
    describe("domain in event", function () {
        it("hashchange does not work for ie<8 " +
            "if change domain after bind hashchange event", function () {
            window.location.hash = '';

            // ie6 没法测
            if (ie === 6) {
                return;
            }

            var hash = "#ok",
                current = -1;

            Event.on(window, "hashchange", function () {
                current = window.location.hash;
            });

            waits(500);

            runs(function () {
                document.domain = location.hostname;
                window.location.hash = hash;
                DOM.isCustomDomain = function () {
                    return true;
                };
            });

            waits(500);

            runs(function () {
                if (ie && ie < 8) {
                    expect(current).toBe(-1);
                } else {
                    expect(current).toBe("#ok");
                }
            });
        });
    });

});
/**
 * domain error spec for event
 * @author yiminghe@gmail.com
 */
KISSY.use("event/dom/base,ua", function (S, Event, UA) {
    var ie = document.documentMode || UA.ie;
    describe("domain in event", function () {
        it("hashchange does not work for ie<8 if change domain after bind hashchange event", function () {
            window.location.hash = '';

            var hash = "#ok",
                current = -1;

            Event.on(window, "hashchange", function () {
                current = window.location.hash;
            });

            waits(500);

            runs(function () {
                document.domain = "ali.com";
                window.location.hash = hash;
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
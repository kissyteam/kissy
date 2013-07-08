/**
 * domain spec for event
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Event, Dom) {

    describe("domain in event", function () {
        it("hashchange should consider domain", function () {

            if (S.UA.ie == 6) {
                return;
            }

            window.location.hash = '';
            document.domain = location.hostname;

            // document.domain does not contain port
            Dom.isCustomDomain = function () {
                return true;
            };

            var hash = "#ok",
                current = -1;

            Event.on(window, "hashchange", function () {
                current = window.location.hash;
            });

            waits(500);

            runs(function () {
                window.location.hash = hash;
            });

            waits(500);

            runs(function () {
                expect(current).toBe(hash);
            });
        });
    });

},{
        requires:['event/dom','dom']
    });
/**
 * change spec for supporting bubbling in ie<9
 * ie<9 change event can not be simulated !!!
 * move to change/test.html manually
 * @author yiminghe@gmail.com
 */
KISSY.use("event", function (S, Event) {

    describe("domain in event", function () {
        it("hashchange should consider domain", function () {
            window.location.hash = '';
            document.domain = "ali.com";

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

});
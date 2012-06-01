/**
 * change spec for supporting bubbling in ie<9
 * ie<9 change event can not be simulated !!!
 * move to change/test.html manually
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,event,ua", function(S, DOM, Event) {
    describe("change event", function() {
        var div = DOM.create("<div>" +
            "<form action='http://www.g.cn'>" +
            "<input class='s'/>" +
            "<input class='c' type='checkbox'/>" +
            "</form>" +
            "</div>");
        DOM.append(div, document.body);
        var form = DOM.get("form", div);
        var inp = DOM.get(".s", div);
        var checkbox = DOM.get(".c", div);
        it("should bubble well", function() {
            var t = 0;
            Event.on(div, "change", function(e) {
                t = (e.target);
                e.preventDefault();
            });
            inp.value = S.now();

            // ie<9 触发不了 change ....
            jasmine.simulate(inp, "change");

            waits(100);
            runs(function() {
                expect(t).toBe(inp);
                t = 0;
                checkbox.click();
            });
            waits(100);
            runs(function() {
                expect(t).toBe(checkbox);
                t = 0;
                Event.remove(div);
                inp.value = S.now();
                jasmine.simulate(inp, "change");
            });
            waits(100);
            runs(function() {
                expect(t).toBe(0);
                checkbox.click();
            });
            waits(100);
            runs(function() {
                expect(t).toBe(0);
            });
        });

        runs(function() {
            DOM.remove(div);
        });

    });
});
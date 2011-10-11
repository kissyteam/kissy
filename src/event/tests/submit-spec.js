/**
 * submit spec for supporting bubbling in ie<9
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,event", function(S, DOM, Event) {
    describe("submit event", function() {
        var div = DOM.create("<div><form action='http://www.g.cn'><input type='submit' id='s'></form></div>");
        DOM.append(div, document.body);
        var form = DOM.get("form", div);
        var inp = DOM.get("input", div);
        it("should works and target is right", function() {
            var t = 0;
            Event.on(div, "submit", function(e) {
                t = (e.target);
                e.preventDefault();
            });
            inp.click();
            waits(100);
            runs(function() {
                expect(t).toBe(form);
                t = 0;
                Event.remove(div);
                Event.on(div, "submit", function(e) {
                    e.preventDefault();
                });
                inp.click();
            });
            waits(100);
            runs(function() {
                expect(t).toBe(0);
            });
        });


        it("should delegate well", function() {
            Event.remove(div);
            Event.delegate(div, "submit", "form", function(e) {
                expect(e.target).toBe(form);
                expect(e.currentTarget).toBe(form);
                e.preventDefault();
            });
            inp.click();
            waits(100);
            runs(function() {
                DOM.remove(div);
            });
        });
    });
});
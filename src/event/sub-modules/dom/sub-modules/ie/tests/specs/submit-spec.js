/**
 * submit spec for supporting bubbling in ie<9
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,event/dom/base", function (S, DOM, Event) {
    describe("submit event", function () {

        var div,
            form,
            inp = DOM.get("input", div);

        beforeEach(function(){
             div = DOM.create("<div>" +
                "<form action='http://www.g.cn' onsubmit='return false'>" +
                "<input type='submit' id='s'>" +
                "</form>" +
                "</div>");

            DOM.append(div, document.body);

             form = DOM.get("form", div);
             inp = DOM.get("input", div);
        });

        afterEach(function () {
            DOM.remove(div);
            DOM.remove(form);
        });

        it("should works and target is right", function () {
            var t = 0;
            Event.on(div, "submit", function (e) {
                t = e.target;
                e.preventDefault();
            });
            inp.click();
            waits(100);
            runs(function () {
                expect(t).toBe(form);
                t = 0;
                Event.remove(div);
                Event.on(div, "submit", function (e) {
                    e.preventDefault();
                });
                inp.click();
            });
            waits(100);
            runs(function () {
                expect(t).toBe(0);
            });
        });

        it("should stop propagation well", function () {
            var ret = [];
            Event.on(div, "submit", function (e) {
                e.preventDefault();
            });
            inp.click();
            waits(100);
            runs(function () {
                Event.on(form, "submit", function (e) {
                    e.halt();
                });
                Event.on(div, "submit", function (e) {
                    ret.push(1);
                });
            });
            runs(function () {
                inp.click();
            });
            waits(100);
            runs(function () {
                expect(ret).toEqual([]);
            });
        });


        it("should fire correctly", function () {
            var ret = [];
            Event.on(div, "submit", function (e) {
                ret.push(1);
                e.preventDefault();
            });
            // trigger kissy internal form bind
            inp.click();
            waits(100);
            runs(function () {
                ret = [];
                Event.fire(form, "submit");
                expect(ret).toEqual([1]);
            });
        });


        it("should delegate well", function () {
            Event.delegate(div, "submit", "form", function (e) {
                expect(e.target).toBe(form);
                expect(e.currentTarget).toBe(form);
                e.preventDefault();
            });
            inp.click();
            waits(100);
        });
    });
});
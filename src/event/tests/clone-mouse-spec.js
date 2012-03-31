/**
 * @module  clone-mouse-spec
 * @author  yiminghe@gmail.com
 */
KISSY.use("dom,event,ua", function (S, DOM, Event) {
    describe("mouseenter clone works", function () {

        it("can clone mouseenter", function () {
            var html = '<div class="t89561" id="t89561" style="width: 200px;height: 200px;border: 1px solid red;margin: 50px;">' +
                '<div class="t895612" style="width: 100px;height: 100px;border: 1px solid green;margin: 50px;">' +
                ' </div>' +
                ' </div>';

            DOM.append(DOM.create(html), document.body);

            var ret = [];

            Event.on("#t89561", "mouseenter", function () {
                ret.push(1);
            });

            var n;

            DOM.append(n = DOM.clone("#t89561", 1, 1, 1), document.body);

            n.id = "";

            DOM.remove(DOM.get("#t89561"))

            n.id = "t89561";

            var v = DOM.children("#t89561")[0];

            // 2012-03-31 bug : clone does not clone originalType
            // lose check
            jasmine.simulate(n, "mouseover", {
                relatedTarget:v
            });

            waits(100);

            runs(function () {
                expect(ret.length).toBe(0);
            });
        });

    });
});
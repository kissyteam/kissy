/**
 * valuechange spec
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,event/dom/base", function(S, DOM, Event) {
    describe("valuechange event", function() {

        it("should works", function() {
            var prev,newv;

            var input = DOM.create("<input/>");

            DOM.append(input, document.body);

            function handler(ev) {
                prev = ev.prevVal;
                newv = ev.newVal;
            }

            Event.on(input, "valuechange", handler);

            input.focus();

            waits(100);

            runs(function() {
                DOM.val(input, 1);
            });

            waits(100);

            runs(function() {
                expect(DOM.val(input)).toBe('1');
                expect(prev).toBe("");
                expect(newv).toBe('1');
            });

            runs(function() {
                Event.detach(input, "valuechange", handler);
            });

            waits(100);

            runs(function() {
                DOM.val(input, 10);
            });

            waits(100);

            runs(function() {
                expect(DOM.val(input)).toBe('10');
                expect(prev).toBe("");
                expect(newv).toBe('1');
            });

            runs(function() {
                DOM.remove(input);
            });
        });
    });
});
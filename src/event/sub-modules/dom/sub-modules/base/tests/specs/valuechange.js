/**
 * valuechange spec
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Dom, Event) {
    describe("valuechange event", function() {

        it("should works", function() {
            var prev,newv;

            var input = Dom.create("<input/>");

            Dom.append(input, document.body);

            function handler(ev) {
                prev = ev.prevVal;
                newv = ev.newVal;
            }

            Event.on(input, "valuechange", handler);

            input.focus();

            waits(100);

            runs(function() {
                Dom.val(input, 1);
            });

            waits(100);

            runs(function() {
                expect(Dom.val(input)).toBe('1');
                expect(prev).toBe("");
                expect(newv).toBe('1');
            });

            runs(function() {
                Event.detach(input, "valuechange", handler);
            });

            waits(100);

            runs(function() {
                Dom.val(input, 10);
            });

            waits(100);

            runs(function() {
                expect(Dom.val(input)).toBe('10');
                expect(prev).toBe("");
                expect(newv).toBe('1');
            });

            runs(function() {
                Dom.remove(input);
            });
        });
    });
},{
    requires:['dom','event/dom/base']
});
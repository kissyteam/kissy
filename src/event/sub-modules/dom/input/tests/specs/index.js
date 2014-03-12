/**
 * input event spec
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom, Event) {
    var UA = S.UA;
    /*jshint quotmark:false*/
    describe("input event", function () {
        it("should works", function () {
            var newv;

            var input = Dom.create("<input/>");

            Dom.append(input, document.body);

            function handler() {
                newv = this.value;
            }

            Event.on(input, "input", handler);

            input.focus();

            waits(100);

            runs(function () {
                Dom.val(input, '1');
                jasmine.simulate(input, 'input');
            });

            waits(100);

            runs(function () {
                expect(Dom.val(input)).toBe('1');
                expect(newv).toBe('1');
            });

            runs(function () {
                Event.detach(input, "input", handler);
            });

            waits(100);

            runs(function () {
                Dom.val(input, 10);
                jasmine.simulate(input, 'input');
            });

            waits(100);

            runs(function () {
                expect(Dom.val(input)).toBe('10');
                expect(newv).toBe('1');
            });

            runs(function () {
                Dom.remove(input);
            });
        });

        it('support bubble', function () {
            if(UA.ie && UA.ieMode<9){
                return;
            }

            var newv;

            var div = Dom.create("<div><input/></div>");

            Dom.append(div, document.body);

            var input = div.firstChild;

            function handler(e) {
                newv = e.target.value;
            }

            Event.on(div, "input", handler);

            input.focus();
            waits(100);

            runs(function () {
                Dom.val(input, 1);
                jasmine.simulate(input, 'input');
            });

            waits(100);

            runs(function () {
                expect(Dom.val(input)).toBe('1');
                expect(newv).toBe('1');
            });

            runs(function () {
                Event.detach(div, "input", handler);
            });

            waits(100);

            runs(function () {
                Dom.val(input, 10);
                jasmine.simulate(input, 'input');
            });

            waits(100);

            runs(function () {
                expect(Dom.val(input)).toBe('10');
                expect(newv).toBe('1');
            });

            runs(function () {
                Dom.remove(div);
            });
        });
    });
}, {
    requires: ['dom', 'event/dom']
});
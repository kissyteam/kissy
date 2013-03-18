/**
 * fire focus in correct order
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,event/dom/base", function (S, DOM, Event) {
    describe("focus", function () {

        it('fired in correct order', function () {

            var outer = DOM.create("<div class='outer'>" +
                "<div class='inner'>" +
                "<input type='input'/>" +
                "</div>" +
                "</div>");

            DOM.append(outer, 'body');

            var inner = DOM.get('.inner', outer);
            var input = DOM.get('input', inner);

            var ret = [];

            Event.on(outer, 'focusin', function () {
                ret.push('outer');
            });

            Event.on(inner, 'focusin', function () {
                ret.push('inner');
            });

            Event.on(input, 'focusin', function () {
                ret.push('input focusin');
            });

            Event.on(input, 'focus', function () {
                ret.push('input focus');
            });

            input.focus();

            waits(100);

            runs(function () {
                expect(document.activeElement).toBe(input);
                expect(ret).toEqual(['input focusin', 'inner', 'outer', 'input focus']);
                ret = [];
            });
            waits(100);
            runs(function () {
                Event.fire(input, 'focus');
            });

            runs(function () {
                expect(document.activeElement).toBe(input);
                expect(ret).toEqual(['input focusin', 'inner', 'outer', 'input focus']);
                ret = [];
                DOM.remove(outer);
            });

        });


        it('fired handlers in correct order', function () {

            var outer = DOM.create("<div class='outer'>" +
                "<div class='inner'>" +
                "<input type='input'/>" +
                "</div>" +
                "</div>");

            DOM.append(outer, 'body');

            var inner = DOM.get('.inner', outer);
            var input = DOM.get('input', inner);

            var ret = [];

            Event.on(outer, 'focusin', function () {
                ret.push('outer');
            });

            Event.on(inner, 'focusin', function () {
                ret.push('inner');
            });

            Event.on(input, 'focusin', function () {
                ret.push('input focusin');
            });

            Event.on(input, 'focus', function () {
                ret.push('input focus');
            });

            document.body.focus();

            Event.fireHandler(input, 'focus');

            waits(100);

            runs(function () {
                expect(document.activeElement).not.toBe(input);
                expect(ret).toEqual(['input focus']);
                ret = [];
            });
            waits(100);
            runs(function () {
                Event.fireHandler(input, 'focus');
            });

            runs(function () {
                expect(document.activeElement).not.toBe(input);
                expect(ret).toEqual(['input focus']);
                ret = [];
                DOM.remove(outer);
            });

        });

    });

});
/**
 * fire focus in correct order
 * @author yiminghe@gmail.com
 */
KISSY.add( function (S, Dom, Event) {
    describe("focus", function () {

        it('fired in correct order', function () {

            var outer = Dom.create("<div class='outer'>" +
                "<div class='inner'>" +
                "<input type='input'/>" +
                "</div>" +
                "</div>");

            Dom.append(outer, 'body');

            var inner = Dom.get('.inner', outer);
            var input = Dom.get('input', inner);

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
                Dom.remove(outer);
            });

        });


        it('fired handlers in correct order', function () {

            var outer = Dom.create("<div class='outer'>" +
                "<div class='inner'>" +
                "<input type='input'/>" +
                "</div>" +
                "</div>");

            Dom.append(outer, 'body');

            var inner = Dom.get('.inner', outer);
            var input = Dom.get('input', inner);

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
                Dom.remove(outer);
            });

        });

    });

},{
    requires:['dom','event/dom/base']
});
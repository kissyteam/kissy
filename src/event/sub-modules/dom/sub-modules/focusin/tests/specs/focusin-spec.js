/**
 * tc for focusin event
 * @author yiminghe@gmail.com
 */
KISSY.use('event/dom,dom', function (S, Event, DOM) {
    var tpl = ' <div id="test-focusin">\
        test focusin: <input type="text" value="点击我"/>\
        </div>\
        <input id="test-focusin-input" type="text" value="另一个输入框"/>',
        HAPPENED = 'happened',
        FIRST = '1',
        SECOND = '2',
        SEP = '-';

    describe('focusin and focusout', function () {

        beforeEach(function () {
            DOM.prepend(DOM.create(tpl), 'body');
        });

        afterEach(function () {
            DOM.remove('#test-focusin');
        });

        it('should trigger the focusin/focusout event on the proper element, ' +
            'and support bubbling with correct order.', function () {

            var container = DOM.get('#test-focusin'),
                input = DOM.get('input', container),
                result = [];

            // In non-IE, the simulation of focusin/focusout behavior do not correspond with IE exactly,
            // so we should ignore the orders of the event
            Event.on(container, 'focusin focusout', function () {
                result.push(HAPPENED);
            });
            Event.on(input, 'focusin focusout', function () {
                result.push(HAPPENED + "_inner");
            });

            // focus the input element
            runs(function () {
                result = [];
                input.focus();
            });
            waits(10);
            runs(function () {
                // guarantee bubble
                expect(result.join(SEP)).toEqual([HAPPENED + "_inner", HAPPENED].join(SEP));
            });

            // blur the input element
            runs(function () {
                result = [];
                input.blur();
            });
            waits(10);
            runs(function () {
                expect(result.join(SEP)).toEqual([HAPPENED + "_inner", HAPPENED].join(SEP));
            });

            runs(function () {
                Event.remove(container);
                result = [];
                input.focus();
            });
            waits(10);

            runs(function () {
                expect(result.join(SEP)).toEqual([HAPPENED + "_inner"].join(SEP));
            });

            runs(function () {
                Event.remove(input);
            });
        });

        it('should trigger the focusin/focusout event and focus event in order.', function () {
            var input = DOM.get('#test-focusin-input');
            var result = [];

            Event.on(input, 'focusin focusout', function () {
                result.push(FIRST);
            });

            Event.on(input, 'focus blur', function () {
                result.push(SECOND);
            });

            // focus the input element
            runs(function () {
                result = [];
                input.focus();
            });
            waits(0);
            runs(function () {
                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
            });

            // blur the input element
            runs(function () {
                result = [];
                input.blur();
            });
            waits(0);
            runs(function () {

                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));

            });
        });


        it("should delegate focus/blur properly", function () {
            var container = DOM.get('#test-focusin'),
                input = DOM.get('input', container),
                result = [];

            // In non-IE, the simulation of focusin/focusout behavior do not correspond with IE exactly,
            // so we should ignore the orders of the event
            Event.delegate(container, 'focusin', 'input', function (e) {
                expect(e.type).toBe("focusin");
                result.push(1);
            });

            Event.delegate(container, 'focusout', 'input', function (e) {
                expect(e.type).toBe("focusout");
                result.push(2);
            });

            // focus the input element
            runs(function () {
                result = [];
                input.focus();
            });
            waits(10);
            runs(function () {
                // guarantee bubble
                expect(result).toEqual([1]);
            });

            // blur the input element
            runs(function () {
                result = [];
                input.blur();
            });
            waits(10);
            runs(function () {
                expect(result).toEqual([2]);
            });

            runs(function () {
                Event.remove(container);
                result = [];
                input.focus();
            });
            waits(10);

            runs(function () {
                expect(result).toEqual([]);
            });
        });

    });
});
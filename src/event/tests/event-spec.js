/**
 * @module  event-test
 * @author  gonghao<gonghao@ghsky.com>
 * @date    2010-12-2
 */
describe('event', function() {
    var win = window, doc = document,
            S = KISSY, DOM = S.DOM, Event = S.Event,
            foo = S.get('#foo'),
            foo2 = S.get('#foo2'),
            bar = S.get('#bar'),
            bar2 = S.get('#bar2'),
            outer = S.get('#outer'),
            inner = S.get('#inner'),
            a = S.get('#link-a'),
            cb1 = S.get('#checkbox-1'),
            cb2 = S.get('#checkbox-2'),
            c1 = S.get('#link-c1'),
            c2 = S.get('#link-c2'),
            li_c = S.get('#li-c'),
            li_d = S.get('#li-d'),
            li_e = S.get('#li-e'),
            d1 = S.get('#link-d1'),
            d2 = S.get('#link-d2'),
            e1 = S.get('#link-e1'),
            e2 = S.get('#link-e2'),
            f = S.get('#link-f'),
            g = S.get('#link-g'),
            h = S.get('#link-h'),
            lis = S.query('#bar li'),

            HAPPENED = 'happened',
            FIRST = '1',
            SECOND = '2',
            SEP = '-',
            EMPTY = '',

            result,

            // simulate mouse click on any element
            simulateClick = function(ele) {
                var clickEvent;
                if (doc.createEvent) {
                    clickEvent = doc.createEvent('MouseEvent');
                    clickEvent.initMouseEvent('click', true, true, win, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    ele.dispatchEvent(clickEvent);
                } else {
                    ele.fireEvent('onclick');
                }
            };

    describe('addEvent', function() {
        it('should support batch adding.', function() {
            var total = lis.length, count = 0;

            Event.on(lis, 'click', function() {
                count++;
            });

            // click all lis
            S.each(lis, function(li) {
                simulateClick(li);
            });

            expect(count).toEqual(total);
        });

        it('should execute in order.', function() {
            Event.on(a, 'click', function() {
                result.push(FIRST);
            });

            Event.on(a, 'click', function() {
                result.push(SECOND);
            });

            // click a
            result = [];
            simulateClick(a);

            expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
        });

        it('should prevent default behavior (do nothing if using "return false;").', function() {
            // init
            cb1.checked = false;
            cb2.checked = false;

            Event.on(cb1, 'click', function(evt) {
                evt.preventDefault();
            });

            Event.on(cb2, 'click', function() {
                return false;
            });

            // click the checkbox
            cb1.click();
            cb2.click();

            expect(cb1.checked).toBeFalsy();
            expect(cb2.checked).toBeTruthy();
        });

        it('should stop event\'s propagation.', function() {
            Event.on(c2, 'click', function(evt) {
                evt.stopPropagation();
            });

            Event.on(li_c, 'click', function() {
                result = HAPPENED;
            });

            // click c1
            result = null;
            simulateClick(c1);
            expect(result).toEqual(HAPPENED);

            // click c2
            result = null;
            simulateClick(c2);
            expect(result).toBeNull();
        });

        it('should stop event\'s propagation immediately.', function() {
            Event.on(d1, 'click', function() {
                result.push(FIRST);
            });
            Event.on(d1, 'click', function() {
                result.push(SECOND);
            });

            Event.on(d2, 'click', function(evt) {
                result.push(FIRST);
                evt.stopImmediatePropagation();
            });
            Event.on(d2, 'click', function() {
                result.push(SECOND);
            });

            Event.on(li_d, 'click', function() {
                result.push(HAPPENED);
            });

            // click d1
            result = [];
            simulateClick(d1);
            expect(result.join(SEP)).toEqual([FIRST, SECOND, HAPPENED].join(SEP));

            // click d2
            result = [];
            simulateClick(d2);
            expect(result.join(SEP)).toEqual([FIRST].join(SEP));
        });

        it('should do nothing else to event\'s propagation if using "return false;".', function() {
            Event.on(e1, 'click', function() {
                result.push(FIRST);
            });
            Event.on(e1, 'click', function() {
                result.push(SECOND);
            });

            Event.on(e2, 'click', function() {
                result.push(FIRST);
                return false;
            });
            Event.on(e2, 'click', function() {
                result.push(SECOND);
            });

            Event.on(li_e, 'click', function() {
                result.push(HAPPENED);
            });

            // click e1
            result = [];
            simulateClick(e1);
            expect(result.join(SEP)).toEqual([FIRST, SECOND, HAPPENED].join(SEP));

            // click e2
            result = [];
            simulateClick(e2);
            expect(result.join(SEP)).toEqual([FIRST, SECOND, HAPPENED].join(SEP));
        });
    });

    describe('removeEvent', function() {
        it('should remove the specified event handler function.', function() {
            function foo() {
                result = HAPPENED;
            }

            Event.on(f, 'click', foo);
            Event.on(f, 'click', foo);
            Event.remove(f, 'click', foo);

            // click f
            result = null;
            simulateClick(f);
            expect(result).toBeNull();
        });

        it('should remove all the event handlers of the specified event type.', function() {
            Event.on(g, 'click', function() {
                result.push(FIRST);
            });
            Event.on(g, 'click', function() {
                result.push(SECOND);
            });
            Event.remove(g, 'click');

            // click g
            result = [];
            simulateClick(g);
            expect(result.join(EMPTY)).toEqual([].join(EMPTY));
        });

        it('should reomve all the event handler of the specified element', function() {
            Event.on(h, 'click', function() {
                result.push(FIRST);
            });
            Event.on(h, 'click', function() {
                result.push(SECOND);
            });
            Event.remove(h);

            // click h
            result = [];
            simulateClick(h);
            expect(result.join(EMPTY)).toEqual([].join(EMPTY));
        });
    });
});
/**
 * @module  event-spec
 * @author yiminghe@gmail.com, gonghao@ghsky.com
 */

var Dom = require('dom');
var io = require('io');
var DomEvent = require('event/dom');
var util = require('util');
var tpl = '';
/*jshint quotmark:false*/

function isFunction(v) {
    return typeof v === 'function';
}

io({
    url: './specs/event.html',
    async: false,
    success: function (d) {
        tpl = d;
    }
});

var DomEventUtils = DomEvent.Utils;

describe('event', function () {
    var doc = document,
        HAPPENED = 'happened',
        FIRST = '1',
        SECOND = '2',
        SEP = '-',
    // simulate mouse event on any element
        simulate = function (target, type, relatedTarget) {
            if (typeof target === 'string') {
                target = Dom.get(target);
            }
            jasmine.simulate(target, type, { relatedTarget: relatedTarget });
        };

    beforeEach(function () {
        Dom.prepend(Dom.create(tpl), 'body');
    });

    afterEach(function () {
        Dom.remove('#event-test-data');
    });

    describe('add event', function () {
        it('should support batch adding.', function () {
            var lis = Dom.query('#bar li'),
                total = lis.length,
                count = 0;

            function click() {
                count++;
            }

            DomEvent.on(lis, 'click', click);

            var observable = DomEvent.getEventListeners(lis[0], 'click');
            expect(observable).not.toBeFalsy();
            expect(observable.observers[0].config.fn).toBe(click);

            // click all lis
            util.each(lis, function (li) {
                simulate(li, 'click');
            });
            waits(0);
            runs(function () {
                expect(count).toEqual(total);
            });
        });

        it('should execute in order.', function () {
            var a = Dom.get('#link-a');
            var result = [];
            DomEvent.on(a, 'click', function () {
                result.push(FIRST);
            });

            DomEvent.on(a, 'click', function () {
                result.push(SECOND);
            });

            // click a
            result = [];
            simulate(a, 'click');
            waits(0);
            runs(function () {
                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
                DomEvent.remove(a);
            });
        });

        it("should support data bind when on and unbind when remove", function () {
            var a = Dom.get('#link-a'), data;
            DomEvent.on(a, 'click', {
                fn: function (e, d) {
                    data = d;
                },
                data: {
                    y: 1
                }
            });
            simulate(a, 'click');
            waits(0);
            runs(function () {
                expect(data.y).toBe(1);
                DomEvent.remove(a);
            });
            runs(function () {
                data = null;
                simulate(a, 'click');
            });
            waits(0);
            runs(function () {
                expect(data).toBe(null);
            });
        });

        it('should prevent default behavior (do nothing if using "return false;").', function () {
            var cb1 = Dom.get('#checkbox-1'), cb2 = Dom.get('#checkbox-2');

            // init
            cb1.checked = false;
            cb2.checked = false;

            DomEvent.on(cb1, 'click', function (evt) {
                evt.preventDefault();
            });
            DomEvent.on(cb2, 'click', function () {
                return false;
            });

            // click the checkbox
            cb1.click();
            cb2.click();
            waits(0);
            runs(function () {
                expect(cb1.checked).toBeFalsy();
                expect(cb2.checked).toBeFalsy();
            });
        });

        it('should stop event\'s propagation.', function () {
            var liTemp = Dom.get('#li-c'), c1 = Dom.get('#link-c1'), c2 = Dom.get('#link-c2');
            var result;
            DomEvent.on(c2, 'click', function (evt) {
                evt.stopPropagation();
            });
            DomEvent.on(liTemp, 'click', function () {
                result = HAPPENED;
            });

            // click c1
            runs(function () {
                result = null;
                simulate(c1, 'click');
            });
            waits(0);
            runs(function () {
                expect(result).toEqual(HAPPENED);
            });

            // click c2
            runs(function () {
                result = null;
                simulate(c2, 'click');
            });
            waits(0);
            runs(function () {
                expect(result).toBeNull();
            });
        });

        it("should stop event's propagation immediately.", function () {
            var liD = Dom.get('#li-d'), d1 = Dom.get('#link-d1'), d2 = Dom.get('#link-d2');
            var result = [];
            DomEvent.on(d1, 'click', function () {
                result.push(FIRST);
            });
            DomEvent.on(d1, 'click', function () {
                result.push(SECOND);
            });

            DomEvent.on(d2, 'click', function (evt) {
                result.push(FIRST);
                evt.stopImmediatePropagation();
            });
            DomEvent.on(d2, 'click', function () {
                result.push(SECOND);
            });

            DomEvent.on(liD, 'click', function () {
                result.push(HAPPENED);
            });

            // click d1
            runs(function () {
                result = [];
                simulate(d1, 'click');
            });
            waits(0);
            runs(function () {
                expect(result.join(SEP)).toEqual([FIRST, SECOND, HAPPENED].join(SEP));
            });

            // click d2
            runs(function () {
                result = [];
                simulate(d2, 'click');
            });
            waits(0);
            runs(function () {
                expect(result.join(SEP)).toEqual([FIRST].join(SEP));
            });
        });

        it('should do nothing else to event\'s propagation if using "return false;".', function () {
            var liE = Dom.get('#li-e'), e1 = Dom.get('#link-e1'), e2 = Dom.get('#link-e2');
            var result = [];
            DomEvent.on(e1, 'click', function () {
                result.push(FIRST);
            });
            DomEvent.on(e1, 'click', function () {
                result.push(SECOND);
            });

            DomEvent.on(e2, 'click', function () {
                result.push(FIRST);
                return false;
            });
            DomEvent.on(e2, 'click', function () {
                result.push(SECOND);
            });

            DomEvent.on(liE, 'click', function () {
                result.push(HAPPENED);
            });

            // click e1
            runs(function () {
                result = [];
                simulate(e1, 'click');
            });
            waits(0);
            runs(function () {
                expect(result.join(SEP)).toEqual([FIRST, SECOND, HAPPENED].join(SEP));
            });

            // click e2
            runs(function () {
                result = [];
                simulate(e2, 'click');
            });
            waits(0);
            runs(function () {
                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
            });
        });

        it('isDefaultPrevented is set correctly', function () {
            var ok = 0;
            DomEvent.on('#event-test-data', 'click', function (e) {
                expect(e.isDefaultPrevented()).toBe(true);
                ok = 1;
            });
            DomEvent.on('#link-f', 'click', function (e) {
                e.preventDefault();
            });
            jasmine.simulate(Dom.get('#link-f'), 'click');
            waitsFor(function () {
                return ok;
            });
            runs(function () {
                DomEvent.detach('#event-test-data');
                ok = 0;
                DomEvent.on('#event-test-data', 'click', function (e) {
                    expect(e.isDefaultPrevented()).toBe(false);
                    ok = 1;
                });
                jasmine.simulate(Dom.get('#link-g'), 'click');
            });
            waitsFor(function () {
                return ok;
            });
        });
    });

    describe('remove event', function () {

        it('should remove the specified event handler function.', function () {
            var f = Dom.get('#link-f');
            var result = [];

            function foo() {
                result = HAPPENED;
            }

            DomEvent.on(f, 'click', foo);

            DomEvent.on(f, 'click', foo);

            DomEvent.remove(f, 'click', foo);

            // click f
            result = null;
            simulate(f, 'click');
            waits(0);
            runs(function () {
                expect(result).toBeNull();
            });
        });


        it('should remove the specified event handler function and context.', function () {
            var f = Dom.get('#link-f');

            DomEvent.detach(f);

            var result = [], context = {};

            function foo() {
                result = HAPPENED;
            }

            DomEvent.on(f, 'click', foo, context);

            DomEvent.remove(f, 'click', foo, context);

            // click f
            result = null;
            simulate(f, 'click');
            waits(0);
            runs(function () {
                expect(result).toBeNull();
            });
        });

        it('should remove all the event handlers of the specified event type.', function () {
            var g = Dom.get('#link-g');
            var result = [];
            DomEvent.on(g, 'click', function () {
                result.push(FIRST);
            });
            DomEvent.on(g, 'click', function () {
                result.push(SECOND);
            });

            DomEvent.remove(g, 'click');

            // click g
            result = [];
            simulate(g, 'click');
            waits(0);
            runs(function () {
                expect(result.join(SEP)).toEqual([].join(SEP));
            });
        });

        it('should remove all the event handler of the specified element', function () {
            var h = Dom.get('#link-h');

            var result = [];

            DomEvent.on(h, 'click', function () {
                result.push(FIRST);
            });

            DomEvent.on(h, 'click', function () {
                result.push(SECOND);
            });

            DomEvent.remove(h);

            // click h
            result = [];
            simulate(h, 'click');
            waits(0);
            runs(function () {
                expect(result.join(SEP)).toEqual([].join(SEP));
            });
        });


        it('call remove event from descendants', function () {

            var bar = Dom.get('#bar'),
                foo = Dom.get('#foo'),
                bard = 0,
                bard1 = 0,
                food = 0,
                food1 = 0;

            DomEvent.on(bar, {
                'o': {
                    fn: function () {
                        bard = 1;
                    }
                },
                'o1': {
                    fn: function () {
                        bard1 = 1;
                    }
                }
            });

            DomEvent.on(foo, {
                'w': {
                    fn: function () {
                        food = 1;
                    }
                },
                'w1': {
                    fn: function () {
                        food1 = 1;
                    }
                }
            });

            DomEvent.fire(bar, 'o');
            DomEvent.fire(foo, 'w');
            DomEvent.fire(bar, 'o1');
            DomEvent.fire(foo, 'w1');

            expect(bard).toBe(1);
            expect(food).toBe(1);
            expect(bard1).toBe(1);
            expect(food1).toBe(1);

            bard = 0;
            food = 0;
            bard1 = 0;
            food1 = 0;

            DomEvent.detach(foo, {
                'o': {
                    deep: true
                },
                'w': {
                    deep: true
                }
            });

            DomEvent.fire(bar, 'o');
            DomEvent.fire(foo, 'w');
            DomEvent.fire(bar, 'o1');
            DomEvent.fire(foo, 'w1');

            expect(bard).toBe(0);
            expect(food).toBe(0);
            expect(bard1).toBe(1);
            expect(food1).toBe(1);

            bard = 0;
            food = 0;
            bard1 = 0;
            food1 = 0;

            DomEvent.detach(foo, {
                '': {
                    deep: true
                }
            });

            DomEvent.fire(bar, 'o');
            DomEvent.fire(foo, 'w');
            DomEvent.fire(bar, 'o1');
            DomEvent.fire(foo, 'w1');

            expect(bard).toBe(0);
            expect(food).toBe(0);
            expect(bard1).toBe(0);
            expect(food1).toBe(0);

        });
    });

    describe('event handler context', function () {

        it('should treat the element itself as the context.', function () {

            var foo = Dom.get('#foo');

            DomEvent.on(foo, 'click', function () {
                expect(this).toBe(foo);
            });

            // click foo
            simulate(foo, 'click');
        });

        it('should support using custom object as the context.', function () {

            var bar = Dom.get('#bar'),
                TEST = {
                    foo: 'only for tesing'
                };

            DomEvent.on(bar, 'click', function () {
                expect(this).toBe(TEST);
            }, TEST);
        });

        it('should guarantee separate event adding function keeps separate context.', function () {
            DomEvent.on(doc, 'click', handler, {id: FIRST});
            DomEvent.on(doc, 'click', handler, {id: SECOND});
            var result = [];

            function handler() {
                result.push(this.id);
            }

            // click the document twice
            simulate(doc, 'click');
            simulate(doc, 'click');
            waits(10);
            runs(function () {
                expect(result[1]).not.toEqual(result[2]);
            });
        });

        it('should guarantee separate event adding function keeps separate context with multiple event.', function () {
            DomEvent.detach(doc);
            var re = [];

            DomEvent.on(doc, 'click keydown', handler, {id: FIRST});
            DomEvent.on(doc, 'click keydown', handler, {id: SECOND});
            function handler() {
                re.push(this.id);
            }

            // click the document twice
            runs(function () {
                simulate(doc, 'click');
            });
            waits(10);
            runs(function () {
                simulate(doc, 'keydown');
            });
            waits(10);
            runs(function () {
                expect(re).toEqual([FIRST, SECOND, FIRST, SECOND]);
            });
        });
    });

    it('should no memory leak for dom node', function () {

        var domNode = Dom.create("<div></div>"), noop = function () {
        }, noop2 = function () {
        }, noop3 = function () {
        };

        DomEvent.on(domNode, 'click', noop);
        DomEvent.on(domNode, 'click', noop2);
        DomEvent.on(domNode, 'click', noop3);
        DomEvent.on(domNode, 'keydown', noop);

        (function () {
            var eventDesc = DomEventUtils.data(domNode);
            var num = 0;
            for (var i in eventDesc) {
                expect(util.inArray(i, ["handle", "observables"]))
                    .toBe(true);
                num++;

            }
            expect(num).toBe(2);
            expect(isFunction(eventDesc.handle)).toBe(true);
            var domEventObservables = eventDesc.observables;
            num = 0;
            for (i in domEventObservables) {

                expect(util.inArray(i, ['click', 'keydown']))
                    .toBe(true);
                num++;

            }
            expect(num).toBe(2);
            var clickEventObserver = domEventObservables.click;
            expect(clickEventObserver.observers.length).toBe(3);
        })();

        DomEvent.remove(domNode, 'click', noop);

        (function () {
            var domEventObservablesHolder = DomEventUtils.data(domNode);
            var num = 0;
            for (var i in domEventObservablesHolder) {

                expect(util.inArray(i, ["handle", "observables"]))
                    .toBe(true);
                num++;

            }
            expect(num).toBe(2);
            expect(isFunction(domEventObservablesHolder.handle)).toBe(true);
            var domEventObservables = domEventObservablesHolder.observables;
            num = 0;
            for (i in domEventObservables) {

                expect(util.inArray(i, ['click', 'keydown']))
                    .toBe(true);
                num++;

            }
            expect(num).toBe(2);
            var clickEventObserver = domEventObservables.click;
            expect(clickEventObserver.observers.length).toBe(2);
        })();

        DomEvent.remove(domNode, 'click');

        (function () {
            var domEventObservablesHolder = DomEventUtils.data(domNode);
            var num = 0;
            for (var i in domEventObservablesHolder) {

                expect(util.inArray(i, ["handle", "observables"]))
                    .toBe(true);
                num++;

            }
            expect(num).toBe(2);
            expect(isFunction(domEventObservablesHolder.handle)).toBe(true);
            var domEventObservables = domEventObservablesHolder.observables;
            num = 0;
            for (i in domEventObservables) {

                expect(util.inArray(i, ['keydown']))
                    .toBe(true);
                num++;

            }
            expect(num).toBe(1);
            var clickEventObserver = domEventObservables.click;
            expect(clickEventObserver).toBeUndefined();
        })();

        DomEvent.remove(domNode);

        (function () {
            var eventDesc = DomEventUtils.data(domNode);
            expect(eventDesc).toBe(undefined);
        })();

    });
});

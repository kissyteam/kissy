/**
 * @module  event-spec
 * @author  gonghao<gonghao@ghsky.com>
 */
describe('event', function() {

    var doc = document,
        S = KISSY, Event = S.Event,

        HAPPENED = 'happened',
        FIRST = '1',
        SECOND = '2',
        SEP = '-',

        result,

        // simulate mouse event on any element
        simulate = function(target, type, relatedTarget) {
            if(typeof target === 'string') {
                target = S.get(target);
            }
            jasmine.simulate(target, type, { relatedTarget: relatedTarget });
        };

    describe('add event', function() {

        it('should support batch adding.', function() {
            var lis = S.query('#bar li'), total = lis.length, count = 0;

            Event.on(lis, 'click', function() {
                count++;
            });

            // click all lis
            S.each(lis, function(li) {
                simulate(li, 'click');
            });
            waits(0);
            runs(function() {
                expect(count).toEqual(total);
            });
        });

        it('should execute in order.', function() {
            var a = S.get('#link-a');

            Event.on(a, 'click', function() {
                result.push(FIRST);
            });
            Event.on(a, 'click', function() {
                result.push(SECOND);
            });

            // click a
            result = [];
            simulate(a, 'click');
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
            });
        });

        it('should prevent default behavior (do nothing if using "return false;").', function() {
            var cb1 = S.get('#checkbox-1'), cb2 = S.get('#checkbox-2');

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
            waits(0);
            runs(function() {
                expect(cb1.checked).toBeFalsy();
                expect(cb2.checked).toBeFalsy();
            });
        });

        it('should stop event\'s propagation.', function() {
            var li_c = S.get('#li-c'), c1 = S.get('#link-c1'), c2 = S.get('#link-c2');

            Event.on(c2, 'click', function(evt) {
                evt.stopPropagation();
            });
            Event.on(li_c, 'click', function() {
                result = HAPPENED;
            });

            // click c1
            runs(function() {
                result = null;
                simulate(c1, 'click');
            });
            waits(0);
            runs(function() {
                expect(result).toEqual(HAPPENED);
            });

            // click c2
            runs(function() {
                result = null;
                simulate(c2, 'click');
            });
            waits(0);
            runs(function() {
                expect(result).toBeNull();
            });
        });

        it('should stop event\'s propagation immediately.', function() {
            var li_d = S.get('#li-d'),  d1 = S.get('#link-d1'), d2 = S.get('#link-d2');

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
            runs(function() {
                result = [];
                simulate(d1, 'click');
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST, SECOND, HAPPENED].join(SEP));
            });

            // click d2
            runs(function() {
                result = [];
                simulate(d2, 'click');
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST].join(SEP));
            });
        });

        it('should do nothing else to event\'s propagation if using "return false;".', function() {
            var li_e = S.get('#li-e'), e1 = S.get('#link-e1'), e2 = S.get('#link-e2');

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
            runs(function() {
                result = [];
                simulate(e1, 'click');
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST, SECOND, HAPPENED].join(SEP));
            });

            // click e2
            runs(function() {
                result = [];
                simulate(e2, 'click');
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
            });
        });

        it('should set this properly', function() {
            var ret;

            // Node
            runs(function() {

                S.one('#link-test-this').on('click', function() {
                    ret = this;
                });
                simulate('#link-test-this', 'click');
            });
            waits(0);
            runs(function() {
                expect(ret.nodeType).toBe(S.Node.TYPE);
            });

            // NodeList
            runs(function() {
                S.all('#link-test-this-all span').on('click', function() {
                    ret = this;
                });
                simulate('#link-test-this-all-span', 'click');
            });
            waits(0);
            runs(function() {
                expect(ret.text()).toBe('link for test this');
            });

            // DOM Element
            runs(function() {
                S.Event.on('#link-test-this-dom', 'click', function() {
                    ret = this;
                });
                simulate('#link-test-this-dom', 'click');
            });
            waits(0);
            runs(function() {
                expect(ret.nodeType).toBe(1);
            });
        });
    });

    describe('remove event', function() {

        it('should remove the specified event handler function.', function() {
            var f = S.get('#link-f');

            function foo() {
                result = HAPPENED;
            }

            Event.on(f, 'click', foo);
            Event.on(f, 'click', foo);
            Event.remove(f, 'click', foo);

            // click f
            result = null;
            simulate(f, 'click');
            waits(0);
            runs(function() {
                expect(result).toBeNull();
            });
        });

        it('should remove all the event handlers of the specified event type.', function() {
            var g = S.get('#link-g');

            Event.on(g, 'click', function() {
                result.push(FIRST);
            });
            Event.on(g, 'click', function() {
                result.push(SECOND);
            });
            Event.remove(g, 'click');

            // click g
            result = [];
            simulate(g, 'click');
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([].join(SEP));
            });
        });

        it('should reomve all the event handler of the specified element', function() {
            var h = S.get('#link-h');
            
            Event.on(h, 'click', function() {
                result.push(FIRST);
            });
            Event.on(h, 'click', function() {
                result.push(SECOND);
            });
            Event.remove(h);

            // click h
            result = [];
            simulate(h, 'click');
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([].join(SEP));
            });
        });
    });

    describe('mouseenter and mouseleave', function() {
        var ie = S.UA.ie, outer = S.get('#outer'), inner = S.get('#inner'),
                container = outer.parentNode;

        it('should trigger the mouseenter event on the proper element.', function() {
            var outerCount = 0, innerCount = 0, type = ie ? 'mouseenter' : 'mouseover';

            Event.on(outer, 'mouseenter', function() {
                outerCount++;
            });

            Event.on(inner, 'mouseenter', function() {
                innerCount++;
            });

            // move mouse from the container element to the outer element once
            simulate(outer, type, container);

            // move mouse from the outer element to the inner element twice
            simulate(inner, type, outer);
            simulate(inner, type, outer);

            waits(100);

            runs(function() {
                if (!ie) {
                    expect(outerCount).toEqual(1);
                    expect(innerCount).toEqual(2);
                }
            });
        });

        it('should trigger the mouseleave event on the proper element.', function() {
            var outerCount = 0, innerCount = 0, type = ie ? 'mouseleave' : 'mouseout';

            Event.on(outer, 'mouseleave', function() {
                outerCount++;
            });
            Event.on(inner, 'mouseleave', function() {
                innerCount++;
            });

            // move mouse from the inner element to the outer element once
            simulate(inner, type, outer);

            // move mouse from the outer element to the container element
            simulate(outer, type, container);
            simulate(outer, type, outer.parentNode);

            waits(0);

            runs(function() {
                if (!ie) {
                    expect(outerCount).toEqual(2);
                    expect(innerCount).toEqual(1);
                }
            });
        });
    });

    describe('focusin and focusout', function() {

        it('should trigger the focusin/focusout event on the proper element, and support bubbling.', function() {
            var container = S.get('#test-focusin'), input = S.get('input', container);

            // In non-IE, the simulation of focusin/focusout behavior do not correspond with IE exactly,
            // so we should ignore the orders of the event
            Event.on(container, 'focusin focusout', function() {
                result.push(HAPPENED);
            });
            Event.on(input, 'focusin focusout', function() {
                result.push(HAPPENED);
            });

            // focus the input element
            runs(function() {
                result = [];
                input.focus();
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([HAPPENED, HAPPENED].join(SEP));
            });

            // blur the input element
            runs(function() {
                result = [];
                input.blur();
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([HAPPENED, HAPPENED].join(SEP));
            });
        });

        it('should trigger the focusin/focusout event and focus event in order.', function() {
            var input = S.get('#test-focusin-input');

            Event.on(input, 'focusin focusout', function() {
                result.push(FIRST);
            });
            Event.on(input, 'focus blur', function() {
                result.push(SECOND);
            });

            // focus the input element
            runs(function() {
                result = [];
                input.focus();
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
            });

            // blur the input element
            runs(function() {
                result = [];
                input.blur();
            });
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
            });
        });
    });

    describe('event handler scope', function() {

        it('should treat the element itself as the scope.', function() {
            var foo = S.get('#foo');

            Event.on(foo, 'click', function() {
                expect(this).toBe(foo);
            });

            // click foo
            simulate(foo, 'click');
        });

        it('should support using custom object as the scope.', function() {
            var bar = S.get('#bar'),
                    TEST = {
                        foo: 'only for tesing'
                    };

            Event.on(bar, 'click', function() {
                expect(this).toBe(TEST);
            }, TEST);
        });

        it('should guarantee separate event adding function keeps separate scope.', function() {
            Event.on(doc, 'click', handler, {id: FIRST});
            Event.on(doc, 'click', handler, {id: SECOND});

            function handler() {
                result.push(this.id);
            }

            // click the document twice
            simulate(doc, 'click');
            simulate(doc, 'click');
            waits(0);
            runs(function() {
                expect(result[1]).not.toEqual(result[2]);
            });
        });
    });

    describe('custom event target', function() {

        it('should support custom event target.', function() {

            var SPEED = '70 km/h', NAME = 'Lady Gogo', dog;

            function Dog(name) {
                this.name = name;
            }

            S.augment(Dog, S.EventTarget, {
                run: function() {
                    this.fire('running', {speed: SPEED});
                }
            });

            dog = new Dog(NAME);
            dog.on('running', function(ev) {
                result.push(this.name);
                result.push(ev.speed);
            });
            dog.on('running', function() {
                result.push(FIRST);
                return false;
            });
            function f() {
                result.push(SECOND);
            }
            dog.on('running', f);

            // let dog run
            result = [];
            dog.run();
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([NAME, SPEED, FIRST, SECOND].join(SEP));
            });

            // test detach
            result = [];
            dog.detach('running', f);
            dog.run();
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([NAME, SPEED, FIRST].join(SEP));
            });
        });
    });
});

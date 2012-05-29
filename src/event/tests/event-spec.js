/**
 * @module  event-spec
 * @author  yiminghe@gmail.com gonghao@ghsky.com
 */
KISSY.use("dom,event,ua", function (S, DOM, Event, UA) {
    var EventTarget = Event.Target;

    describe('event', function () {

        var doc = document,

            HAPPENED = 'happened',
            FIRST = '1',
            SECOND = '2',
            SEP = '-',
            // simulate mouse event on any element
            simulate = function (target, type, relatedTarget) {
                if (typeof target === 'string') {
                    target = DOM.get(target);
                }
                jasmine.simulate(target, type, { relatedTarget:relatedTarget });
            };

        describe('add event', function () {

            it('should support batch adding.', function () {
                var lis = DOM.query('#bar li'), total = lis.length, count = 0;

                Event.on(lis, 'click', function () {
                    count++;
                });

                // click all lis
                S.each(lis, function (li) {
                    simulate(li, 'click');
                });
                waits(0);
                runs(function () {
                    expect(count).toEqual(total);
                });
            });

            it('should execute in order.', function () {
                var a = DOM.get('#link-a');
                var result = [];
                Event.on(a, 'click', function () {
                    result.push(FIRST);
                });

                Event.on(a, 'click', function () {
                    result.push(SECOND);
                });

                // click a
                result = [];
                simulate(a, 'click');
                waits(0);
                runs(function () {
                    expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
                    Event.remove(a);
                });
            });

            it("should support data bind when on and unbind when remove", function () {
                var a = DOM.get('#link-a'), data;
                Event.on(a, "click", {
                    fn:function (e, d) {
                        data = d;
                    },
                    data:{
                        y:1
                    }
                });
                simulate(a, 'click');
                waits(0);
                runs(function () {
                    expect(data.y).toBe(1);
                    Event.remove(a);
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
                var cb1 = DOM.get('#checkbox-1'), cb2 = DOM.get('#checkbox-2');

                // init
                cb1.checked = false;
                cb2.checked = false;

                Event.on(cb1, 'click', function (evt) {
                    evt.preventDefault();
                });
                Event.on(cb2, 'click', function () {
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
                var li_c = DOM.get('#li-c'), c1 = DOM.get('#link-c1'), c2 = DOM.get('#link-c2');
                var result;
                Event.on(c2, 'click', function (evt) {
                    evt.stopPropagation();
                });
                Event.on(li_c, 'click', function () {
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
                var li_d = DOM.get('#li-d'), d1 = DOM.get('#link-d1'), d2 = DOM.get('#link-d2');
                var result = [];
                Event.on(d1, 'click', function () {
                    result.push(FIRST);
                });
                Event.on(d1, 'click', function () {
                    result.push(SECOND);
                });

                Event.on(d2, 'click', function (evt) {
                    result.push(FIRST);
                    evt.stopImmediatePropagation();
                });
                Event.on(d2, 'click', function () {
                    result.push(SECOND);
                });

                Event.on(li_d, 'click', function () {
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
                var li_e = DOM.get('#li-e'), e1 = DOM.get('#link-e1'), e2 = DOM.get('#link-e2');
                var result = [];
                Event.on(e1, 'click', function () {
                    result.push(FIRST);
                });
                Event.on(e1, 'click', function () {
                    result.push(SECOND);
                });

                Event.on(e2, 'click', function () {
                    result.push(FIRST);
                    return false;
                });
                Event.on(e2, 'click', function () {
                    result.push(SECOND);
                });

                Event.on(li_e, 'click', function () {
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


        });

        describe('remove event', function () {

            it('should remove the specified event handler function.', function () {
                var f = DOM.get('#link-f');
                var result = [];

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
                runs(function () {
                    expect(result).toBeNull();
                });
            });


            it('should remove the specified event handler function and scope.', function () {
                var f = DOM.get('#link-f');
                var result = [], scope = {};

                function foo() {
                    result = HAPPENED;
                }

                Event.on(f, 'click', foo, scope);

                Event.remove(f, 'click', foo, scope);

                // click f
                result = null;
                simulate(f, 'click');
                waits(0);
                runs(function () {
                    expect(result).toBeNull();
                });
            });

            it('should remove all the event handlers of the specified event type.', function () {
                var g = DOM.get('#link-g');
                var result = [];
                Event.on(g, 'click', function () {
                    result.push(FIRST);
                });
                Event.on(g, 'click', function () {
                    result.push(SECOND);
                });

                Event.remove(g, 'click');

                // click g
                result = [];
                simulate(g, 'click');
                waits(0);
                runs(function () {
                    expect(result.join(SEP)).toEqual([].join(SEP));
                });
            });

            it('should reomve all the event handler of the specified element', function () {
                var h = DOM.get('#link-h');

                var result = [];

                Event.on(h, 'click', function () {
                    result.push(FIRST);
                });

                Event.on(h, 'click', function () {
                    result.push(SECOND);
                });

                Event.remove(h);

                // click h
                result = [];
                simulate(h, 'click');
                waits(0);
                runs(function () {
                    expect(result.join(SEP)).toEqual([].join(SEP));
                });
            });
        });

        describe('mouseenter and mouseleave', function () {
            var ie = UA.ie, outer = DOM.get('#outer'), inner = DOM.get('#inner'),
                container = outer.parentNode;

            it('should trigger the mouseenter event on the proper element.', function () {
                var outerCount = 0, innerCount = 0, type = ie ? 'mouseenter' : 'mouseover';


                Event.on(outer, 'mouseenter', function () {
                    outerCount++;
                });

                Event.on(inner, 'mouseenter', function () {
                    innerCount++;
                });

                // move mouse from the container element to the outer element once
                simulate(outer, type, container);

                // move mouse from the outer element to the inner element twice
                simulate(inner, type, outer);
                simulate(inner, type, outer);

                waits(100);

                runs(function () {
                    if (!ie) {
                        expect(outerCount).toEqual(1);
                        expect(innerCount).toEqual(2);
                    }
                });
            });

            it('should trigger the mouseleave event on the proper element.', function () {
                var outerCount = 0, innerCount = 0, type = ie ? 'mouseleave' : 'mouseout';

                Event.on(outer, 'mouseleave', function () {
                    outerCount++;
                });
                Event.on(inner, 'mouseleave', function () {
                    innerCount++;
                });

                // move mouse from the inner element to the outer element once
                simulate(inner, type, outer);

                // move mouse from the outer element to the container element
                simulate(outer, type, container);
                simulate(outer, type, outer.parentNode);

                waits(0);

                runs(function () {
                    if (!ie) {
                        expect(outerCount).toEqual(2);
                        expect(innerCount).toEqual(1);
                    }
                });
            });
        });

        describe('focusin and focusout', function () {

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
                var ie = UA.ie, input = DOM.get('#test-focusin-input');
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
                    if (!ie) {
                        expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
                    }
                });

                // blur the input element
                runs(function () {
                    result = [];
                    input.blur();
                });
                waits(0);
                runs(function () {
                    if (!ie) {
                        expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
                    }
                });
            });
        });

        describe('event handler scope', function () {

            it('should treat the element itself as the scope.', function () {
                var foo = DOM.get('#foo');

                Event.on(foo, 'click', function () {
                    expect(this).toBe(foo);
                });

                // click foo
                simulate(foo, 'click');
            });

            it('should support using custom object as the scope.', function () {
                var bar = DOM.get('#bar'),
                    TEST = {
                        foo:'only for tesing'
                    };

                Event.on(bar, 'click', function () {
                    expect(this).toBe(TEST);
                }, TEST);
            });

            it('should guarantee separate event adding function keeps separate scope.', function () {
                Event.on(doc, 'click', handler, {id:FIRST});
                Event.on(doc, 'click', handler, {id:SECOND});
                var result = [];

                function handler() {
                    result.push(this.id);
                }

                // click the document twice
                simulate(doc, 'click');
                simulate(doc, 'click');
                waits(0);
                runs(function () {
                    expect(result[1]).not.toEqual(result[2]);
                });
            });


            it('should guarantee separate event adding function keeps separate scope with multiple event.', function () {
                Event.detach(doc);
                var re = [];

                Event.on(doc, 'click keydown', handler, {id:FIRST});
                Event.on(doc, 'click keydown', handler, {id:SECOND});
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

            var domNode = DOM.create("<div></div>"), i, noop = function () {
            }, noop2 = function () {
            }, noop3 = function () {
            };
            Event.on(domNode, "click", noop);
            Event.on(domNode, "click", noop2);
            Event.on(domNode, "click", noop3);
            Event.on(domNode, "keydown", noop);
            (function () {
                var eventDesc = Event._data(domNode);
                var num = 0;
                for (i in eventDesc) {
                    if (eventDesc.hasOwnProperty(i)) {
                        expect(S.inArray(i, ["handler", "events"]))
                            .toBe(true);
                        num++;
                    }
                }
                expect(num).toBe(2);
                expect(S.isFunction(eventDesc.handler)).toBe(true);
                var events = eventDesc.events;
                num = 0;
                for (i in events) {
                    if (events.hasOwnProperty(i)) {
                        expect(S.inArray(i, ["click", "keydown"]))
                            .toBe(true);
                        num++;
                    }
                }
                expect(num).toBe(2);
                var clickHandlers = events["click"];
                expect(clickHandlers.length).toBe(3);
            })();

            Event.remove(domNode, "click", noop);

            (function () {
                var eventDesc = Event._data(domNode);
                var num = 0;
                for (i in eventDesc) {
                    if (eventDesc.hasOwnProperty(i)) {
                        expect(S.inArray(i, ["handler", "events"]))
                            .toBe(true);
                        num++;
                    }
                }
                expect(num).toBe(2);
                expect(S.isFunction(eventDesc.handler)).toBe(true);
                var events = eventDesc.events;
                num = 0;
                for (i in events) {
                    if (events.hasOwnProperty(i)) {
                        expect(S.inArray(i, ["click", "keydown"]))
                            .toBe(true);
                        num++;
                    }
                }
                expect(num).toBe(2);
                var clickHandlers = events["click"];
                expect(clickHandlers.length).toBe(2);
            })();

            Event.remove(domNode, "click");

            (function () {
                var eventDesc = Event._data(domNode);
                var num = 0;
                for (i in eventDesc) {
                    if (eventDesc.hasOwnProperty(i)) {
                        expect(S.inArray(i, ["handler", "events"]))
                            .toBe(true);
                        num++;
                    }
                }
                expect(num).toBe(2);
                expect(S.isFunction(eventDesc.handler)).toBe(true);
                var events = eventDesc.events;
                num = 0;
                for (i in events) {
                    if (events.hasOwnProperty(i)) {
                        expect(S.inArray(i, ["keydown"]))
                            .toBe(true);
                        num++;
                    }
                }
                expect(num).toBe(1);
                var clickHandlers = events["click"];
                expect(clickHandlers).toBeUndefined();
            })();

            Event.remove(domNode);

            (function () {
                var eventDesc = Event._data(domNode);
                expect(eventDesc).toBe(undefined);
            })();

        });


        it('should no memory leak for custom event', function () {

            var domNode = S.mix({}, Event.Target),
                i,
                noop = function () {
                },
                noop2 = function () {
                },
                noop3 = function () {
                };
            Event.on(domNode, "click", noop);
            Event.on(domNode, "click", noop2);
            Event.on(domNode, "click", noop3);
            Event.on(domNode, "keydown", noop);
            (function () {
                var eventDesc = Event._data(domNode);
                var num = 0;
                for (i in eventDesc) {
                    if (eventDesc.hasOwnProperty(i)) {
                        expect(S.inArray(i, ["handler", "events"]))
                            .toBe(true);
                        num++;
                    }
                }
                expect(num).toBe(2);
                expect(S.isFunction(eventDesc.handler)).toBe(true);
                var events = eventDesc.events;
                num = 0;
                for (i in events) {
                    if (events.hasOwnProperty(i)) {
                        expect(S.inArray(i, ["click", "keydown"]))
                            .toBe(true);
                        num++;
                    }
                }
                expect(num).toBe(2);
                var clickHandlers = events["click"];
                expect(clickHandlers.length).toBe(3);
            })();

            Event.remove(domNode, "click", noop);

            (function () {
                var eventDesc = Event._data(domNode);
                var num = 0;
                for (i in eventDesc) {
                    if (eventDesc.hasOwnProperty(i)) {
                        expect(S.inArray(i, ["handler", "events"]))
                            .toBe(true);
                        num++;
                    }
                }
                expect(num).toBe(2);
                expect(S.isFunction(eventDesc.handler)).toBe(true);
                var events = eventDesc.events;
                num = 0;
                for (i in events) {
                    if (events.hasOwnProperty(i)) {
                        expect(S.inArray(i, ["click", "keydown"]))
                            .toBe(true);
                        num++;
                    }
                }
                expect(num).toBe(2);
                var clickHandlers = events["click"];
                expect(clickHandlers.length).toBe(2);
            })();

            Event.remove(domNode, "click");

            (function () {
                var eventDesc = Event._data(domNode);
                var num = 0;
                for (i in eventDesc) {
                    if (eventDesc.hasOwnProperty(i)) {
                        expect(S.inArray(i, ["handler", "events"]))
                            .toBe(true);
                        num++;
                    }
                }
                expect(num).toBe(2);
                expect(S.isFunction(eventDesc.handler)).toBe(true);
                var events = eventDesc.events;
                num = 0;
                for (i in events) {
                    if (events.hasOwnProperty(i)) {
                        expect(S.inArray(i, ["keydown"]))
                            .toBe(true);
                        num++;
                    }
                }
                expect(num).toBe(1);
                var clickHandlers = events["click"];
                expect(clickHandlers).toBeUndefined();
            })();

            Event.remove(domNode);

            (function () {
                var eventDesc = Event._data(domNode);
                expect(eventDesc).toBe(undefined);
            })();
        });
    });
});
/**
 * @module  event-spec
 * @author yiminghe@gmail.com, gonghao@ghsky.com
 */
KISSY.use("dom,event/dom/base,ua", function (S, DOM, Event, UA) {

    var tpl = '<div id="event-test-data" \
    style="border: 1px solid #ccc; height: 50px; overflow-y: \
    auto; padding: 5px; margin-bottom: 20px">\
        <div id="foo">\
            <ul id="bar">\
                <li><a id="link-a" href="#">link a</a></li>\
                <li><input type="checkbox" id="checkbox-1"/><input type="checkbox" id="checkbox-2"/></li>\
                <li id="li-c"><a id="link-c1" href="#">link c1</a> | <a id="link-c2" href="#">link c2</a></li>\
                <li id="li-d"><a id="link-d1" href="#">link d1</a> | <a id="link-d2" href="#">link d2</a></li>\
                <li id="li-e"><a id="link-e1" href="#">link e1</a> | <a id="link-e2" href="#">link e2</a></li>\
                <li><a id="link-f" href="#">link f</a></li>\
                <li><a id="link-g" href="#">link g</a></li>\
                <li><a id="link-h" href="#">link h</a></li>\
                <li><a id="link-s" href="#">link s</a></li>\
                <li><a id="link-test-this" href="#">link for test this</a></li>\
                <li><a id="link-test-this-dom" href="#">link for test this</a></li>\
                <li id="link-test-this-all"><span id="link-test-this-all-span">link for test this</span><span></span></li>\
            </ul>\
        </div>\
    </div>';

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
                jasmine.simulate(target, type, { relatedTarget: relatedTarget });
            };

        beforeEach(function () {
            DOM.prepend(DOM.create(tpl), 'body');
        });

        afterEach(function () {
            DOM.remove('#event-test-data');
        });

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

                Event.detach(f);

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
                        foo: 'only for tesing'
                    };

                Event.on(bar, 'click', function () {
                    expect(this).toBe(TEST);
                }, TEST);
            });

            it('should guarantee separate event adding function keeps separate scope.', function () {
                Event.on(doc, 'click', handler, {id: FIRST});
                Event.on(doc, 'click', handler, {id: SECOND});
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

                Event.on(doc, 'click keydown', handler, {id: FIRST});
                Event.on(doc, 'click keydown', handler, {id: SECOND});
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
                var eventDesc = Event._DOMUtils.data(domNode);
                var num = 0;
                for (i in eventDesc) {
                    expect(S.inArray(i, ["handle", "events"]))
                        .toBe(true);
                    num++;

                }
                expect(num).toBe(2);
                expect(S.isFunction(eventDesc.handle)).toBe(true);
                var events = eventDesc.events;
                num = 0;
                for (i in events) {

                    expect(S.inArray(i, ["click", "keydown"]))
                        .toBe(true);
                    num++;

                }
                expect(num).toBe(2);
                var clickEventObserver = events["click"];
                expect(clickEventObserver.observers.length).toBe(3);
            })();

            Event.remove(domNode, "click", noop);

            (function () {
                var eventDesc = Event._DOMUtils.data(domNode);
                var num = 0;
                for (i in eventDesc) {

                    expect(S.inArray(i, ["handle", "events"]))
                        .toBe(true);
                    num++;

                }
                expect(num).toBe(2);
                expect(S.isFunction(eventDesc.handle)).toBe(true);
                var events = eventDesc.events;
                num = 0;
                for (i in events) {

                    expect(S.inArray(i, ["click", "keydown"]))
                        .toBe(true);
                    num++;

                }
                expect(num).toBe(2);
                var clickEventObserver = events["click"];
                expect(clickEventObserver.observers.length).toBe(2);
            })();

            Event.remove(domNode, "click");

            (function () {
                var eventDesc = Event._DOMUtils.data(domNode);
                var num = 0;
                for (i in eventDesc) {

                    expect(S.inArray(i, ["handle", "events"]))
                        .toBe(true);
                    num++;

                }
                expect(num).toBe(2);
                expect(S.isFunction(eventDesc.handle)).toBe(true);
                var events = eventDesc.events;
                num = 0;
                for (i in events) {

                    expect(S.inArray(i, ["keydown"]))
                        .toBe(true);
                    num++;

                }
                expect(num).toBe(1);
                var clickEventObserver = events["click"];
                expect(clickEventObserver).toBeUndefined();
            })();

            Event.remove(domNode);

            (function () {
                var eventDesc = Event._DOMUtils.data(domNode);
                expect(eventDesc).toBe(undefined);
            })();

        });
    });
});
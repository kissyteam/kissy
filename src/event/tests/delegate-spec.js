/**
 * @module  delegation-spec
 * @author  yiminghe@gmail.com
 */
KISSY.use("dom,event", function (S, DOM, Event) {

    S.get = DOM.get;
    S.query = DOM.query;
    var simulate = function (target, type, relatedTarget) {
        if (typeof target === 'string') {
            target = DOM.get(target);
        }
        jasmine.simulate(target, type, { relatedTarget:relatedTarget });
    };
    describe('delegate', function () {

        it("should invoke correctly", function () {
            var ret = [];

            function test(e) {
                ret.push(e.target.id);
                ret.push(e.currentTarget.id);
                ret.push(this.id);
            }

            Event.delegate(S.get('#test-delegate'), "click", ".xx", test);
            var a = S.get('#test-delegate-a');
            var b = S.get('#test-delegate-b');
            // support native dom event
            jasmine.simulate(a, "click");
            waits(100);
            runs(function () {
                expect(ret + "").toBe([a.id,
                    'test-delegate-inner',
                    'test-delegate',
                    a.id,
                    'test-delegate-outer',
                    'test-delegate'
                ] + "");
            });
            runs(function () {
                ret = [];
                // support simulated event
                Event.fire(b, "click");
            });
            waits(100);
            runs(function () {
                expect(ret + "").toBe([b.id,
                    'test-delegate-inner',
                    'test-delegate',
                    b.id,
                    'test-delegate-outer',
                    'test-delegate'
                ] + "");
            });

            runs(function () {
                Event.undelegate(S.get('#test-delegate'), "click", ".xx", test);
                ret = [];
                // support simulated event
                Event.fire(b, "click");
            });
            waits(100);
            runs(function () {
                expect(ret + "").toBe([] + "");
                var eventDesc = Event._data(S.get('#test-delegate'));
                expect(eventDesc).toBe(undefined);
            });
        });

        it("should stop propagation correctly", function () {

            var ret = [];

            function test(e) {
                ret.push(e.target.id);
                ret.push(e.currentTarget.id);
                ret.push(this.id);
                e.stopPropagation();
            }

            Event.delegate(S.get('#test-delegate'), "click", ".xx", test);
            var a = S.get('#test-delegate-b');
            // support native dom event
            jasmine.simulate(a, "click");
            waits(100);
            runs(function () {
                expect(ret + "").toBe([a.id,
                    'test-delegate-inner',
                    'test-delegate'
                ] + "");
            });
            runs(function () {
                ret = [];
                // support simulated event
                Event.fire(a, "click");
            });
            waits(100);
            runs(function () {
                expect(ret + "").toBe([a.id,
                    'test-delegate-inner',
                    'test-delegate'
                ] + "");
            });

            runs(function () {
                Event.undelegate(S.get('#test-delegate'), "click", ".xx", test);
                ret = [];
                // support simulated event
                Event.fire(a, "click");
            });
            waits(100);
            runs(function () {
                expect(ret + "").toBe([] + "");
                var eventDesc = Event._data(S.get('#test-delegate'));
                expect(eventDesc).toBe(undefined);
            });
        });

        it("should prevent default correctly", function () {

            var ret = [];

            function test(e) {
                ret.push(e.target.id);
                ret.push(e.currentTarget.id);
                ret.push(this.id);
            }

            Event.delegate(S.get('#test-delegate'), "focus", ".xx", test);
            var a = S.get('#test-delegate-b');
            // support native dom event

            Event.fire(a, "focus");
            waits(100);


            runs(function () {
                //console.log(document.activeElement.nodeName);
                expect(document.activeElement).toBe(a);
                expect(ret + "").toBe([a.id,
                    'test-delegate-inner',
                    'test-delegate',
                    a.id,
                    'test-delegate-outer',
                    'test-delegate'
                ] + "");
            });
        });

        it("should undelegate properly", function () {
            var d = DOM.create("<div><button>xxxx</button></div>");
            document.body.appendChild(d);
            var s = DOM.get('button', d);
            var ret = [];
            Event.on(d, 'click', function () {
                ret.push(9);
            });
            function t() {
                ret.push(1);
            }

            Event.delegate(d, "click", "button", t);

            jasmine.simulate(s, "click");

            waits(100);

            runs(function () {
                expect(ret + "").toBe([1, 9] + "");
                ret = [];
            });

            runs(function () {
                Event.undelegate(d, "click", "button", t);
                jasmine.simulate(s, 'click');
            });


            waits(100);

            runs(function () {
                expect(ret + "").toBe([9] + "");
            });

            runs(function () {
                ret = [];
                Event.delegate(d, "click", "button", t);

                Event.undelegate(d, "click", "button");
                jasmine.simulate(s, 'click');
            });
            runs(function () {
                expect(ret + "").toBe([9] + "");
            });

            runs(function () {
                ret = [];
                Event.delegate(d, "click", "button", t);
                Event.undelegate(d, "click");
                jasmine.simulate(s, 'click');
            });
            waits(100);
            runs(function () {
                expect(ret + "").toBe([9] + "");
                DOM.remove(d);
            });

        });
        it("should delegate focus/blur properly", function () {

            var container = DOM.get('#test-focusin'),
                input = DOM.get('input', container),
                result = [];

            // In non-IE, the simulation of focusin/focusout behavior do not correspond with IE exactly,
            // so we should ignore the orders of the event
            Event.delegate(container, 'focus', 'input', function (e) {
                expect(e.type).toBe("focus");
                result.push(1);
            });

            Event.delegate(container, 'blur', 'input', function (e) {
                expect(e.type).toBe("blur");
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
                expect(result.join("")).toBe("1");
            });

            // blur the input element
            runs(function () {
                result = [];
                input.blur();
            });
            waits(10);
            runs(function () {
                expect(result.join("")).toBe("2");
            });

            runs(function () {
                Event.remove(container);
                result = [];
                input.focus();
            });
            waits(10);

            runs(function () {
                expect(result.join("")).toBe("");
            });

        });
        it("should delegate mouseenter/leave properly", function () {
            var t = S.now();
            var code = "<div id='d1" + t + "' style='width:500px;height:500px;border:1px solid red;'>" +
                "<div id='d2" + t + "' class='t' style='width:300px;height:300px;margin:150px;border:1px solid green;'>" +
                "<div id='d3" + t + "' style='width:100px;height:100px;margin:150px;border:1px solid black;'>" +
                "</div>" +
                "</div>" +
                "</div>";
            DOM.append(DOM.create(code), document.body);
            var d1 = DOM.get("#d1" + t),
                d2 = DOM.get("#d2" + t),
                d3 = DOM.get("#d3" + t);

            t = "";
            var type = "";
            Event.delegate(d1, 'mouseenter', '.t', function (e) {
                type = e.type;
                t = e.target.id;
            });

            simulate(d1, "mouseover", document);

            waits(100);

            runs(function () {
                expect(t).toBe("");
                expect(type).toBe("");
                t = "";
                type = "";
                simulate(d2, "mouseover", d1);
            });


            waits(100);

            runs(function () {
                expect(t).toBe(d2.id);
                expect(type).toBe("mouseenter");
                t = "";
                type = "";
                simulate(d3, "mouseover", d2);
            });

            waits(100);

            runs(function () {
                expect(t).toBe("");
                expect(type).toBe("");
                DOM.remove(d1);
            });

        });

    });
});
/**
 * @module  delegation-spec
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,event/dom/base", function (S, DOM, Event) {

    S.get = DOM.get;
    S.query = DOM.query;

    var tpl = '<div \
    id="event-test-data" \
    style="border: 1px solid #ccc;\
     height: 50px;\
     overflow-y: auto; \
     padding: 5px; \
     margin-bottom: 20px">\
        <div style="margin-top: 10px; padding: 30px; background-color: #e3e4e5">\
            <div id="outer" style="padding: 20px; background-color: #D6EDFC">\
                <div id="inner" style="padding: 20px; background-color: #FFCC00"></div>\
            </div>\
        </div>\
        <div id="test-delegate">\
            <div id="test-delegate-outer" class="xx">\
                <div style="padding:50px;border:1px solid red;width:100px;height:100px;"\
                class="xx" id="test-delegate-inner">\
                    <a href="javascript:void(\"#xx\")" id="test-delegate-a">click</a>\
                    <button id="test-delegate-b">click</button>\
                </div>\
            </div>\
        </div>\
    </div>';

    beforeEach(function () {
        DOM.prepend(DOM.create(tpl), 'body');
    });

    afterEach(function () {
        DOM.remove('#event-test-data');
    });

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
            waits(10);
            runs(function () {
                expect(ret).toEqual([a.id,
                    'test-delegate-inner',
                    'test-delegate',
                    a.id,
                    'test-delegate-outer',
                    'test-delegate'
                ]);
            });
            runs(function () {
                ret = [];
                // support simulated event
                Event.fire(b, "click");
            });
            waits(10);
            runs(function () {
                expect(ret).toEqual([b.id,
                    'test-delegate-inner',
                    'test-delegate',
                    b.id,
                    'test-delegate-outer',
                    'test-delegate'
                ]);
            });

            runs(function () {
                Event.undelegate(S.get('#test-delegate'), "click", ".xx", test);
                ret = [];
                // support simulated event
                Event.fire(b, "click");
            });
            waits(10);
            runs(function () {
                expect(ret).toEqual([]);
                var eventDesc = Event._DOMUtils.data(S.get('#test-delegate'), undefined, false);
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
            waits(10);
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
            waits(10);
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
            waits(10);
            runs(function () {
                expect(ret + "").toBe([] + "");
                var eventDesc = Event._DOMUtils.data(S.get('#test-delegate'), undefined, false);
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
            waits(10);


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

            waits(10);

            runs(function () {
                expect(ret).toEqual([1, 9]);
                ret = [];
            });

            runs(function () {
                Event.undelegate(d, "click", "button", t);
                jasmine.simulate(s, 'click');
            });


            waits(10);

            runs(function () {
                expect(ret).toEqual([9]);
            });

            runs(function () {
                ret = [];
                Event.delegate(d, "click", "button", t);
                Event.undelegate(d, "click", "button");
                jasmine.simulate(s, 'click');
            });
            waits(10);
            runs(function () {
                expect(ret).toEqual([9]);
            });

            runs(function () {
                ret = [];
                Event.delegate(d, "click", "button", t);
                Event.undelegate(d, "click");
                jasmine.simulate(s, 'click');
            });
            waits(10);
            runs(function () {
                expect(ret).toEqual([9]);
                DOM.remove(d);
            });
        });
    });
});
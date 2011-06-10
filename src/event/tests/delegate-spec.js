/**
 * @module  event-spec
 * @author  gonghao@ghsky.com,yiminghe@gmail.com
 */
KISSY.use("dom,event", function(S, DOM, Event) {

    S.get = DOM.get;
    S.query = DOM.query;
    describe('delegate', function() {

        it("should invoke correctly", function() {
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
            runs(function() {
                expect(ret + "").toBe([a.id,
                    'test-delegate-inner',
                    'test-delegate',
                    a.id,
                    'test-delegate-outer',
                    'test-delegate'
                ] + "");
            });
            runs(function() {
                ret = [];
                // support simulated event
                Event.fire(b, "click");
            });
            waits(100);
            runs(function() {
                expect(ret + "").toBe([b.id,
                    'test-delegate-inner',
                    'test-delegate',
                    b.id,
                    'test-delegate-outer',
                    'test-delegate'
                ] + "");
            });

            runs(function() {
                Event.undelegate(S.get('#test-delegate'), "click", ".xx", test);
                ret = [];
                // support simulated event
                Event.fire(b, "click");
            });
            waits(100);
            runs(function() {
                expect(ret + "").toBe([] + "");
                var eventDesc = Event._data(S.get('#test-delegate'));
                expect(eventDesc).toBe(null);
            });

        });


        it("should stop propagation correctly", function() {

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
            runs(function() {
                expect(ret + "").toBe([a.id,
                    'test-delegate-inner',
                    'test-delegate'
                ] + "");
            });
            runs(function() {
                ret = [];
                // support simulated event
                Event.fire(a, "click");
            });
            waits(100);
            runs(function() {
                expect(ret + "").toBe([a.id,
                    'test-delegate-inner',
                    'test-delegate'
                ] + "");
            });

            runs(function() {
                Event.undelegate(S.get('#test-delegate'), "click", ".xx", test);
                ret = [];
                // support simulated event
                Event.fire(a, "click");
            });
            waits(100);
            runs(function() {
                expect(ret + "").toBe([] + "");
                var eventDesc = Event._data(S.get('#test-delegate'));
                expect(eventDesc).toBe(null);
            });

        });


        it("should prevent default correctly", function() {

            var ret = [];

            function test(e) {
                ret.push(e.target.id);
                ret.push(e.currentTarget.id);
                ret.push(this.id);
            }

            Event.delegate(S.get('#test-delegate'), "focus", ".xx", test);
            var a = S.get('#test-delegate-b');
            // support native dom event
            //debugger
            Event.fire(a, "focus");
            waits(100);


            runs(function() {
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

    });
});
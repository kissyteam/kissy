/**
 * @module  delegation-spec
 * @author yiminghe@gmail.com
 */

    var Dom = require('dom');
    var io = require('io');
    var Event = require('event/dom');
    var DomEventUtils = module.require('event/dom/base/utils');

    var tpl = '';

    io({
        url: './specs/delegate.html',
        async: false,
        success: function (d) {
            tpl = d;
        }
    });

    beforeEach(function () {
        Dom.prepend(Dom.create(tpl), 'body');
    });

    afterEach(function () {
        Dom.remove('#event-test-data');
    });

    describe('delegate', function () {
        it('should invoke correctly', function () {
            var ret = [];

            function test(e) {
                ret.push(e.target.id);
                ret.push(e.currentTarget.id);
                ret.push(this.id);
            }

            Event.delegate(Dom.get('#test-delegate'), 'click', '.xx', test);
            var a = Dom.get('#test-delegate-a');
            var b = Dom.get('#test-delegate-b');
            // support native dom event
            jasmine.simulate(a, 'click', {
                which: 1
            });
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
                Event.fire(b, 'click', {
                    which: 1
                });
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
                Event.undelegate(Dom.get('#test-delegate'), 'click', '.xx', test);
                ret = [];
                // support simulated event
                Event.fire(b, 'click', {
                    which: 1
                });
            });
            waits(10);
            runs(function () {
                expect(ret).toEqual([]);
                var eventDesc = DomEventUtils.data(Dom.get('#test-delegate'), undefined, false);
                expect(eventDesc).toBe(undefined);
            });
        });

        it('should stop propagation correctly', function () {
            var ret = [];

            function test(e) {
                ret.push(e.target.id);
                ret.push(e.currentTarget.id);
                ret.push(this.id);
                e.stopPropagation();
            }

            Event.delegate(Dom.get('#test-delegate'), 'click', '.xx', test);
            var a = Dom.get('#test-delegate-b');
            // support native dom event
            jasmine.simulate(a, 'click');
            waits(10);
            runs(function () {
                expect(ret + '').toBe([a.id,
                    'test-delegate-inner',
                    'test-delegate'
                ] + '');
            });
            runs(function () {
                ret = [];
                // support simulated event
                Event.fire(a, 'click');
            });
            waits(10);
            runs(function () {
                expect(ret + '').toBe([a.id,
                    'test-delegate-inner',
                    'test-delegate'
                ] + '');
            });

            runs(function () {
                Event.undelegate(Dom.get('#test-delegate'), 'click', '.xx', test);
                ret = [];
                // support simulated event
                Event.fire(a, 'click');
            });
            waits(10);
            runs(function () {
                expect(ret + '').toBe([] + '');
                var eventDesc = DomEventUtils.data(Dom.get('#test-delegate'), undefined, false);
                expect(eventDesc).toBe(undefined);
            });
        });

        it('should prevent default correctly', function () {
            var ret = [];

            function test(e) {
                ret.push(e.target.id);
                ret.push(e.currentTarget.id);
                ret.push(this.id);
            }

            Event.delegate(Dom.get('#test-delegate'), 'click', '.xx', test);
            var a = Dom.get('#test-delegate-b');
            // support native dom event

            Event.fire(a, 'click');
            waits(10);

            runs(function () {
                expect(ret + '').toBe([a.id,
                    'test-delegate-inner',
                    'test-delegate',
                    a.id,
                    'test-delegate-outer',
                    'test-delegate'
                ] + '');
            });
        });

        it('should undelegate properly', function () {
            var d = Dom.create('<div><button>xxxx</button></div>');
            document.body.appendChild(d);
            var s = Dom.get('button', d);
            var ret = [];
            Event.on(d, 'click', function () {
                ret.push(9);
            });
            function t() {
                ret.push(1);
            }

            Event.delegate(d, 'click', 'button', t);

            jasmine.simulate(s, 'click');

            waits(10);

            runs(function () {
                expect(ret).toEqual([1, 9]);
                ret = [];
            });

            runs(function () {
                Event.undelegate(d, 'click', 'button', t);
                jasmine.simulate(s, 'click');
            });


            waits(10);

            runs(function () {
                expect(ret).toEqual([9]);
            });

            runs(function () {
                ret = [];
                Event.delegate(d, 'click', 'button', t);
                Event.undelegate(d, 'click', 'button');
                jasmine.simulate(s, 'click');
            });
            waits(10);
            runs(function () {
                expect(ret).toEqual([9]);
            });

            runs(function () {
                ret = [];
                Event.delegate(d, 'click', 'button', t);
                Event.undelegate(d, 'click');
                jasmine.simulate(s, 'click');
            });
            waits(10);
            runs(function () {
                expect(ret).toEqual([9]);
                Dom.remove(d);
            });
        });
    });
/**
 * test doubleTap/singleTap gesture by simulating touch event for ios/android
 * @author yiminghe@gmail.com
 */

    var $ = require('node');
    var TapType = require('event/gesture/tap');
    var DOUBLE_TAP = TapType.DOUBLE_TAP;
    var SINGLE_TAP = TapType.SINGLE_TAP;
    var step = 10;

    describe('doubleTap/singleTap', function () {

        var t, delay = 500;

        beforeEach(function () {

            t = $('<div style="border:1px solid red;' +
                'width:100px;' +
                'height:100px;"></div>').prependTo('body');

        });

        afterEach(function () {
            t.remove();
        });

        it('doubleTap fires,singleTap not fired', function () {

            var doubleCalled = 0, singleCalled = 0;

            t.on(DOUBLE_TAP, function (e) {
                expect(e.pageX).toBe(20);
                expect(e.pageY).toBe(20);
                doubleCalled = 1;
            });

            t.on(SINGLE_TAP, function () {
                singleCalled = 1;
            });

            var touches = [
                {
                    pageX: 10,
                    pageY: 10
                }
            ];

            runs(function () {
                jasmine.simulate(t[0], 'touchstart', {
                    touches: touches,
                    changedTouches: touches,
                    targetTouches: touches
                });
            });

            waits(30);

            runs(function () {

                jasmine.simulate(t[0], 'touchend', {
                    touches: [],
                    changedTouches: touches,
                    targetTouches: []
                });

            });

            waits(30);

            runs(function () {
                touches[0].pageX = touches[0].pageY = 20;
                jasmine.simulate(t[0], 'touchstart', {
                    touches: touches,
                    changedTouches: touches,
                    targetTouches: touches
                });
            });

            waits(30);

            runs(function () {

                jasmine.simulate(t[0], 'touchend', {
                    touches: [],
                    changedTouches: touches,
                    targetTouches: []
                });

            });

            waits(delay);

            runs(function () {
                expect(doubleCalled).toBe(1);
                expect(singleCalled).toBe(0);
            });
        });


        it('doubleTap not fires,singleTap fired twice', function () {

            var doubleCalled = 0, singleCalled = 0;

            t.on(DOUBLE_TAP, function () {
                doubleCalled++;
            });

            t.on(SINGLE_TAP, function (e) {
                if (singleCalled) {
                    expect(e.pageX).toBe(20);
                    expect(e.pageY).toBe(20);
                } else {
                    expect(e.pageX).toBe(10);
                    expect(e.pageY).toBe(10);
                }
                singleCalled++;
            });

            var touches = [
                {
                    pageX: 10,
                    pageY: 10
                }
            ];

            runs(function () {
                jasmine.simulate(t[0], 'touchstart', {
                    touches: touches,
                    changedTouches: touches,
                    targetTouches: touches
                });
            });

            waits(30);

            runs(function () {
                jasmine.simulate(t[0], 'touchend', {
                    touches: [],
                    changedTouches: touches,
                    targetTouches: []
                });
            });

            waits(delay);

            runs(function () {
                touches[0].pageX = touches[0].pageY = 20;
                jasmine.simulate(t[0], 'touchstart', {
                    touches: touches,
                    changedTouches: touches,
                    targetTouches: touches
                });
            });

            waits(30);

            runs(function () {

                jasmine.simulate(t[0], 'touchend', {
                    touches: [],
                    changedTouches: touches,
                    targetTouches: []
                });

            });

            waits(delay);

            runs(function () {
                expect(doubleCalled).toBe(0);
                expect(singleCalled).toBe(2);
            });
        });


        it('does not fire when touches number > 1', function () {

            var called = 0;

            t.on([SINGLE_TAP, DOUBLE_TAP], function () {
                called++;
            });

            var touches = [
                {
                    pageX: 10,
                    pageY: 10
                },
                {
                    pageX: 15,
                    pageY: 15
                }
            ];

            jasmine.simulate(t[0], 'touchstart', {
                touches: touches,
                changedTouches: touches,
                targetTouches: touches
            });

            waits(30);

            runs(function () {

                jasmine.simulate(t[0], 'touchend', {
                    touches: [],
                    changedTouches: touches,
                    targetTouches: []
                });

            });

            waits(delay);

            runs(function () {
                expect(called).toBe(0);
            });

        });

        it('does not fire when touchmove occurs', function () {


            var called = 0;

            t.on([SINGLE_TAP, DOUBLE_TAP], function () {
                called++;
            });

            var touches = [
                {
                    pageX: 10,
                    pageY: 10
                }
            ];

            jasmine.simulate(t[0], 'touchstart', {
                touches: touches,
                changedTouches: touches,
                targetTouches: touches
            });

            for (var i = 0; i < step; i++) {
                waits(30);
                /*jshint loopfunc:true*/
                runs(function () {
                    touches[0].pageX = touches[0].pageY = 10 + (Math.random() * 20);
                    jasmine.simulate(t[0], 'touchmove', {
                        touches: touches,
                        changedTouches: touches,
                        targetTouches: touches
                    });
                });
            }

            waits(30);

            runs(function () {

                jasmine.simulate(t[0], 'touchend', {
                    touches: [],
                    changedTouches: touches,
                    targetTouches: []
                });

            });

            waits(delay);

            runs(function () {
                expect(called).toBe(0);
            });

        });

    });

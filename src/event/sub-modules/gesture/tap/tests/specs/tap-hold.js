/**
 * test tap hold by simulating touch event for ios/android
 * @author yiminghe@gmail.com
 */

    var $ = require('node');
    var TapGesture = require('event/gesture/tap');
    var TAP = TapGesture.TAP;
    var TAP_HOLD = TapGesture.TAP_HOLD;
    var SINGLE_TAP=TapGesture.SINGLE_TAP;
    var DOUBLE_TAP=TapGesture.DOUBLE_TAP;
    var step = 10;

    describe('tapHold', function () {
        var t, delay = 1500;

        beforeEach(function () {
            t = $('<div style="border:1px solid red;' +
                'width:100px;' +
                'height:100px;"></div>').prependTo('body');
        });

        afterEach(function () {
            t.remove();
        });

        it('fires and tap does not fire', function () {
            var called = 0;
            var tapCalled = 0;

            t.on('tapHold', function (e) {
                expect(e.pageX).toBe(10);
                expect(e.pageY).toBe(10);
                called = 1;
            });

            t.on([TAP,SINGLE_TAP,DOUBLE_TAP], function (e) {
                tapCalled = e.type;
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

            waits(delay);

            runs(function () {

                jasmine.simulate(t[0], 'touchend', {
                    touches: [],
                    changedTouches: touches,
                    targetTouches: []
                });

            });

            waits(30);

            runs(function () {
                expect(called).toBe(1);
                expect(tapCalled).toBe(0);
            });
        });

        it('does not fire when touches number > 1', function () {
            var called = 0;

            t.on(TAP_HOLD, function () {
                called = 1;
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

            waits(30);

            runs(function () {
                expect(called).toBe(0);
            });
        });

        it('does not fire when touchmove occurs', function () {
            var called = 0;

            t.on(TAP_HOLD, function () {
                called = 1;
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

            function move() {
                touches[0].pageX = touches[0].pageY = 10 + (Math.random() * 20);
                jasmine.simulate(t[0], 'touchmove', {
                    touches: touches,
                    changedTouches: touches,
                    targetTouches: touches
                });
            }

            for (var i = 0; i < step; i++) {

                waits(30);

                runs(move);

            }


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
                expect(called).toBe(0);
            });
        });

        it('does not fire when duration < 1000', function () {
            var called = 0;

            t.on(TAP_HOLD, function () {
                called = 1;
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
                expect(called).toBe(0);
            });
        });
    });


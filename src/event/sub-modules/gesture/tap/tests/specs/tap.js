/**
 * test tap gesture by simulating touch event for ios/android
 * @author yiminghe@gmail.com
 */

    var $ = require('node');
    var TapGesture = require('event/gesture/tap');
    var TAP = TapGesture.TAP;
    var TAP_HOLD=TapGesture.TAP_HOLD;
    var step = 10;

    describe('tap', function () {

        function fireTap(t, touches) {
            var offset = t.offset();

            touches = touches || [
                {
                    pageX: offset.left,
                    pageY: offset.top
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
        }

        var t;

        beforeEach(function () {

            t = $('<div style="border:1px solid red;' +
                'width:100px;' +
                'height:100px;"></div>').prependTo('body');

        });

        afterEach(function () {
            t.remove();
        });

        it('fires and tapHold does not fire', function () {
            var called = 0;
            var tapHoldCalled = 0;

            var offset = t.offset();

            t.on(TAP, function (e) {
                expect(e.pageX).toBe(offset.left);
                expect(e.pageY).toBe(offset.top);
                called = 1;
            });

            t.on(TAP_HOLD, function () {
                tapHoldCalled = 1;
            });

            fireTap(t);

            runs(function () {
                expect(called).toBe(1);
                expect(tapHoldCalled).toBe(0);
            });
        });


        it('does not fire when touches number > 1', function () {
            var called = 0;

            t.on(TAP, function () {
                called = 1;
            });

            fireTap(t, [
                {
                    pageX: 10,
                    pageY: 10
                },
                {
                    pageX: 15,
                    pageY: 15
                }
            ]);

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

        it('can preventDefault', function () {
            var a = $('<a href="#tap_forward">tap_forward</a>')
                .appendTo('body');

            a.on(TAP, function (e) {
                e.preventDefault();
            });

            fireTap(a);

            runs(function () {
                expect(location.hash.indexOf('tap_forward')).toBe(-1);
            });
        });

    });


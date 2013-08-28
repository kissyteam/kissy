/**
 * test tap gesture by simulating touch event for ios/android
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,Node) {
    if (!window.canTestTouch) {
        return;
    }

    var $ = Node.all, step = 10;

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

        it('fires', function () {
            var called = 0;

            var offset = t.offset();

            t.on('tap', function (e) {
                var touch = e.touch;
                expect(touch.pageX).toBe(offset.left);
                expect(touch.pageY).toBe(offset.top);
                called = 1;
            });

            fireTap(t);

            runs(function () {
                expect(called).toBe(1);
            });
        });


        it('does not fire when touches number > 1', function () {
            var called = 0;

            t.on('tap', function () {
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

            t.on('tap', function (e) {
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

            for (var i = 0; i < step; i++) {

                waits(30);

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

            waits(30);

            runs(function () {
                expect(called).toBe(0);
            });
        });

        it('can preventDefault', function () {
            var a = $('<a href="#tap_forward">tap_forward</a>')
                .appendTo('body');

            a.on('tap', function (e) {
              e.preventDefault();
            });

            fireTap(a);

            runs(function(){
               expect(location.hash.indexOf('tap_forward')).toBe(-1);
            });
        });

    });
}, {
    requires: ['node']
});


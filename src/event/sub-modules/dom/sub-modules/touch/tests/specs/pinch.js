/**
 * test pinch gesture by simulating touch event for ios/android
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,Node) {
    if (!window.canTestTouch) {
        return;
    }

    var $ = Node.all, step = 10;


    describe('pinch', function () {

        var t, t1, t2;

        beforeEach(function () {

            t = $('<div>' +
                '<div id="t1" style="border:1px solid red;' +
                'width:200px;' +
                'height:100px;"></div>' +
                '<div id="t2" style="border:1px solid red;' +
                'width:200px;' +
                'height:100px;"></div>' +
                '</div>').prependTo('body');

            t1 = $('#t1');
            t2 = $('#t2');

        });

        afterEach(function () {
            t.remove();
        });

        it('fires', function () {

            var pinchCalled = 0,
                scale,
                distance,
                endY = 100,
                startY = 50,
                pinchStartCalled = 0,
                pinchEndCalled = 0;

            t.on('pinchStart', function (e) {
                var touches = e.touches;

//                    console.log('pinchStart ........');
//                    console.log(touches[0].pageX);
//                    console.log(touches[0].pageY);
//                    console.log(touches[0].target.id);
//                    console.log(touches[1].pageX);
//                    console.log(touches[1].pageY);
//                    console.log(touches[1].target.id);
//                    console.log(e.distance);

                expect(touches[0].pageX).toBe(100);
                expect(touches[0].pageY).toBe(150);
                expect(touches[1].pageX).toBe(100);
                expect(touches[1].pageY).toBe(startY);
                expect(e.distance).toBe(100);
                pinchStartCalled = 1;
            });

            t.on('pinch', function (e) {
                pinchCalled = 1;
                scale = e.scale;
                distance = e.distance;
//                    console.log('pinch ........');
//                    console.log(scale);
//                    console.log(distance);
            });

            t.on('pinchEnd', function (e) {
                var touches = e.touches;
                expect(touches[0].pageX).toBe(100);
                expect(touches[0].pageY).toBe(150);
                expect(touches[1].pageX).toBe(100);
                expect(touches[1].pageY).toBe(endY);
                pinchEndCalled = 1;
            });

            var touches1 = [
                {
                    pageX: 100,
                    pageY: startY,
                    target: t1[0]
                }
            ];

            var touches2 = [
                {
                    pageX: 100,
                    pageY: 150,
                    target: t2[0]
                }
            ];

            var touches = touches2.concat(touches1);

            runs(function () {
                // one touch
                jasmine.simulate(t2[0], 'touchstart', {
                    touches: touches2,
                    changedTouches: touches2,
                    targetTouches: touches2
                });
            });

            waits(30);

            runs(function () {
                // one touch does not start
                expect(pinchStartCalled).toBe(0);
            });

            runs(function () {
                // two touch
                jasmine.simulate(t1[0], 'touchstart', {
                    touches: touches,
                    changedTouches: touches1,
                    targetTouches: touches1
                });
            });

            waits(30);

            runs(function () {
                jasmine.simulate(t1[0], 'touchmove', {
                    touches: touches,
                    changedTouches: touches1,
                    targetTouches: touches1
                });
            });

            waits(30);

            runs(function () {
                // two touch start
                expect(pinchStartCalled).toBe(1);
            });

            for (var i = 0; i < step; i++) {

                waits(30);
                (function (i) {
                    runs(function () {

                        touches[1].pageY = startY + (endY - startY) / step * i;

//                            console.log(touches[1].pageX);
//                            console.log(touches[1].pageY);
//                            console.log(touches[1].target.id);

                        jasmine.simulate(t1[0], 'touchmove', {
                            touches: touches,
                            changedTouches: touches1,
                            targetTouches: touches1
                        });

                    });
                })(i);
            }

            waits(30);

            runs(function () {
                touches[1].pageY = endY;

                jasmine.simulate(t1[0], 'touchmove', {
                    touches: touches,
                    changedTouches: touches1,
                    targetTouches: touches1
                });
            });

            waits(30);

            runs(function () {
                jasmine.simulate(t1[0], 'touchend', {
                    touches: touches2,
                    changedTouches: touches1,
                    targetTouches: []
                });
                jasmine.simulate(t2[0], 'touchend', {
                    touches: [],
                    changedTouches: touches2,
                    targetTouches: []
                });
            });
            waits(30);
            runs(function () {
                expect(pinchCalled).toBe(1);
                expect(pinchStartCalled).toBe(1);
                expect(pinchEndCalled).toBe(1);
                expect(scale).toBe(0.5);
                expect(distance).toBe(50);
            });
        });

        it('only fire at common ancestor node', function () {

            var pinchCalled = 0,
                endY = 100,
                startY = 50,
                nodes = t1.slice(),
                pinchStartCalled = 0,
                pinchEndCalled = 0;

            nodes = nodes.add(t2);

            nodes.on('pinchStart', function (e) {
                pinchStartCalled = 1;
            });

            nodes.on('pinch', function (e) {
                pinchCalled = 1;
            });

            nodes.on('pinchEnd', function (e) {
                pinchEndCalled = 1;
            });

            var touches1 = [
                {
                    pageX: 100,
                    pageY: startY,
                    target: t1[0]
                }
            ];

            var touches2 = [
                {
                    pageX: 100,
                    pageY: 150,
                    target: t2[0]
                }
            ];

            var touches = touches2.concat(touches1);

            runs(function () {
                // one touch
                jasmine.simulate(t2[0], 'touchstart', {
                    touches: touches2,
                    changedTouches: touches2,
                    targetTouches: touches2
                });
            });

            waits(30);

            runs(function () {
                // two touch
                jasmine.simulate(t1[0], 'touchstart', {
                    touches: touches,
                    changedTouches: touches1,
                    targetTouches: touches1
                });
            });

            waits(30);

            runs(function () {
                jasmine.simulate(t1[0], 'touchmove', {
                    touches: touches,
                    changedTouches: touches1,
                    targetTouches: touches1
                });
            });

            for (var i = 0; i < step; i++) {

                waits(30);
                (function (i) {
                    runs(function () {

                        touches[1].pageY = startY + (endY - startY) / step * i;

//                            console.log(touches[1].pageX);
//                            console.log(touches[1].pageY);
//                            console.log(touches[1].target.id);

                        jasmine.simulate(t1[0], 'touchmove', {
                            touches: touches,
                            changedTouches: touches1,
                            targetTouches: touches1
                        });

                    });
                })(i);
            }

            waits(30);

            runs(function () {
                touches[1].pageY = endY;

                jasmine.simulate(t1[0], 'touchmove', {
                    touches: touches,
                    changedTouches: touches1,
                    targetTouches: touches1
                });
            });

            waits(30);

            runs(function () {
                jasmine.simulate(t1[0], 'touchend', {
                    touches: touches2,
                    changedTouches: touches1,
                    targetTouches: []
                });
                jasmine.simulate(t2[0], 'touchend', {
                    touches: [],
                    changedTouches: touches2,
                    targetTouches: []
                });
            });
            waits(30);
            runs(function () {
                expect(pinchCalled).toBe(0);
                expect(pinchStartCalled).toBe(0);
                expect(pinchEndCalled).toBe(0);
            });
        });


        it('fires pinchEnd when one touch leaves', function () {

            var pinchCalled = 0,
                scale,
                distance,
                endY = 100,
                startY = 50,
                pinchStartCalled = 0,
                pinchEndCalled = 0;

            t.on('pinchStart', function (e) {
                var touches = e.touches;

//                    console.log('pinchStart ........');
//                    console.log(touches[0].pageX);
//                    console.log(touches[0].pageY);
//                    console.log(touches[0].target.id);
//                    console.log(touches[1].pageX);
//                    console.log(touches[1].pageY);
//                    console.log(touches[1].target.id);
//                    console.log(e.distance);

                expect(touches[0].pageX).toBe(100);
                expect(touches[0].pageY).toBe(150);
                expect(touches[1].pageX).toBe(100);
                expect(touches[1].pageY).toBe(startY);
                expect(e.distance).toBe(100);
                pinchStartCalled = 1;
            });

            t.on('pinch', function (e) {
                pinchCalled = 1;
                scale = e.scale;
                distance = e.distance;
//                    console.log('pinch ........');
//                    console.log(scale);
//                    console.log(distance);
            });

            t.on('pinchEnd', function (e) {
                var touches = e.touches;
                expect(touches[0].pageX).toBe(100);
                expect(touches[0].pageY).toBe(150);
                expect(touches[1].pageX).toBe(100);
                expect(touches[1].pageY).toBe(endY);
                pinchEndCalled = 1;
            });

            var touches1 = [
                {
                    pageX: 100,
                    pageY: startY,
                    target: t1[0]
                }
            ];

            var touches2 = [
                {
                    pageX: 100,
                    pageY: 150,
                    target: t2[0]
                }
            ];

            var touches = touches2.concat(touches1);

            runs(function () {
                // one touch
                jasmine.simulate(t2[0], 'touchstart', {
                    touches: touches2,
                    changedTouches: touches2,
                    targetTouches: touches2
                });
            });

            waits(30);

            runs(function () {
                // one touch does not start
                expect(pinchStartCalled).toBe(0);
            });

            runs(function () {
                // two touch
                jasmine.simulate(t1[0], 'touchstart', {
                    touches: touches,
                    changedTouches: touches1,
                    targetTouches: touches1
                });
            });

            waits(30);

            runs(function () {
                jasmine.simulate(t1[0], 'touchmove', {
                    touches: touches,
                    changedTouches: touches1,
                    targetTouches: touches1
                });
            });

            waits(30);

            runs(function () {
                // two touch start
                expect(pinchStartCalled).toBe(1);
            });

            for (var i = 0; i < step; i++) {

                waits(30);
                (function (i) {
                    runs(function () {

                        touches[1].pageY = startY + (endY - startY) / step * i;

//                            console.log(touches[1].pageX);
//                            console.log(touches[1].pageY);
//                            console.log(touches[1].target.id);

                        jasmine.simulate(t1[0], 'touchmove', {
                            touches: touches,
                            changedTouches: touches1,
                            targetTouches: touches1
                        });

                    });
                })(i);
            }

            waits(30);

            runs(function () {
                touches[1].pageY = endY;

                jasmine.simulate(t1[0], 'touchmove', {
                    touches: touches,
                    changedTouches: touches1,
                    targetTouches: touches1
                });
            });

            waits(30);

            runs(function () {
                jasmine.simulate(t1[0], 'touchend', {
                    touches: touches2,
                    changedTouches: touches1,
                    targetTouches: []
                });
            });
            waits(30);
            runs(function () {
                expect(pinchCalled).toBe(1);
                expect(pinchStartCalled).toBe(1);
                expect(pinchEndCalled).toBe(1);
                expect(scale).toBe(0.5);
                expect(distance).toBe(50);
            });
        });

    });

}, {
    requires: ['node']
});


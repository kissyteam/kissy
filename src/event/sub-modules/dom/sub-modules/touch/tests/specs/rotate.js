/**
 * test rotate gesture by simulating touch event for ios/android
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Node) {
    if (!window.canTestTouch) {
        return;
    }

    var $ = Node.all, step = 10;

    describe('rotate', function () {

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

            var rotateCalled = 0,
                angle,
                rotation,
                endX = 150,
                endY = 100,
                startX = 100,
                startY = 50,
                rotateStartCalled = 0,
                rotateEndCalled = 0;

            t.on('rotateStart', function (e) {
                var touches = e.touches;

//                    console.log('rotateStart ........');
//                    console.log(touches[0].pageX);
//                    console.log(touches[0].pageY);
//                    console.log(touches[0].target.id);
//                    console.log(touches[1].pageX);
//                    console.log(touches[1].pageY);
//                    console.log(touches[1].target.id);
//                    console.log(e.angle);
//                    console.log(e.rotate);

                expect(touches[0].pageX).toBe(100);
                expect(touches[0].pageY).toBe(150);
                expect(touches[1].pageX).toBe(startX);
                expect(touches[1].pageY).toBe(startY);
                expect(e.angle).toBe(-90);
                expect(e.rotation).toBe(0);
                rotateStartCalled = 1;
            });

            t.on('rotate', function (e) {
                rotateCalled = 1;
                angle = e.angle;
                rotation = e.rotation;
//                    console.log('rotate ........');
//                    console.log(angle);
//                    console.log(rotation);
            });

            t.on('rotateEnd', function (e) {
                var touches = e.touches;
                expect(touches[0].pageX).toBe(100);
                expect(touches[0].pageY).toBe(150);
                expect(touches[1].pageX).toBe(endX);
                expect(touches[1].pageY).toBe(endY);
                rotateEndCalled = 1;
            });

            var touches1 = [
                {
                    pageX: startX,
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
                expect(rotateStartCalled).toBe(0);
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
                expect(rotateStartCalled).toBe(1);
            });

            for (var i = 0; i < step; i++) {

                waits(30);
                (function (i) {
                    runs(function () {

                        touches[1].pageX = startX + (endX - startX) / step * i;

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
                touches[1].pageX = endX;
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
                expect(rotateCalled).toBe(1);
                expect(rotateStartCalled).toBe(1);
                expect(rotateEndCalled).toBe(1);
                expect(angle).toBe(-45);
                expect(rotation).toBe(45);
            });
        });


        it('fire resizeEnd when one touch leaves', function () {

            var rotateCalled,
                angle,
                rotation,
                endX = 150,
                endY = 100,
                startX = 100,
                startY = 50,
                rotateStartCalled,
                rotateEndCalled;

            t.on('rotateStart', function (e) {
                var touches = e.touches;

//                    console.log('rotateStart ........');
//                    console.log(touches[0].pageX);
//                    console.log(touches[0].pageY);
//                    console.log(touches[0].target.id);
//                    console.log(touches[1].pageX);
//                    console.log(touches[1].pageY);
//                    console.log(touches[1].target.id);
//                    console.log(e.angle);
//                    console.log(e.rotate);

                expect(touches[0].pageX).toBe(100);
                expect(touches[0].pageY).toBe(150);
                expect(touches[1].pageX).toBe(startX);
                expect(touches[1].pageY).toBe(startY);
                expect(e.angle).toBe(-90);
                expect(e.rotation).toBe(0);
                rotateStartCalled = 1;
            });

            t.on('rotate', function (e) {
                rotateCalled = 1;
                angle = e.angle;
                rotation = e.rotation;
//                    console.log('rotate ........');
//                    console.log(angle);
//                    console.log(rotation);
            });

            t.on('rotateEnd', function (e) {
                var touches = e.touches;
                expect(touches[0].pageX).toBe(100);
                expect(touches[0].pageY).toBe(150);
                expect(touches[1].pageX).toBe(endX);
                expect(touches[1].pageY).toBe(endY);
                rotateEndCalled = 1;
            });

            var touches1 = [
                {
                    pageX: startX,
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
                jasmine.simulate(t2[0], 'touchstart', {
                    touches: touches2,
                    changedTouches: touches2,
                    targetTouches: touches2
                });
            });

            waits(30);

            runs(function () {
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

                        touches[1].pageX = startX + (endX - startX) / step * i;

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
                touches[1].pageX = endX;
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
                expect(rotateCalled).toBe(1);
                expect(rotateStartCalled).toBe(1);
                expect(rotateEndCalled).toBe(1);
                expect(angle).toBe(-45);
                expect(rotation).toBe(45);
            });
        });


        it('only fire at common ancestor node', function () {

            var rotateCalled = 0,
                endX = 150,
                endY = 100,
                startX = 100,
                startY = 50,
                nodes = t1.slice(),
                rotateStartCalled = 0,
                rotateEndCalled = 0;

            nodes = nodes.add(t2);

            nodes.on('rotateStart', function () {
                rotateStartCalled++;
            });

            nodes.on('rotate', function () {
                rotateCalled++;
            });

            nodes.on('rotateEnd', function () {
                rotateEndCalled++;
            });

            var touches1 = [
                {
                    pageX: startX,
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

                        touches[1].pageX = startX + (endX - startX) / step * i;

                        touches[1].pageY = startY + (endY - startY) / step * i;

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
                touches[1].pageX = endX;
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
                expect(rotateCalled).toBe(0);
                expect(rotateStartCalled).toBe(0);
                expect(rotateEndCalled).toBe(0);
            });
        });

    });

}, {
    requires: ['node']
});


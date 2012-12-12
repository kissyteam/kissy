/**
 * test swipe gesture by simulating touch event for ios/android
 * @author yiminghe@gmail.com
 */
if (!phantomjs && document.createTouch) {

    KISSY.use('core', function (S) {

        var $ = S.all, step = 10;

        describe('swipe', function () {

            var t;

            beforeEach(function () {
                t = $('<div style="border:1px solid red;' +
                    'width:100px;' +
                    'height:100px;"></div>').prependTo('body');
            });

            afterEach(function () {
                t.remove();
            });

            it('fires vertical', function () {

                var called = 0, start = 90, end = 10;

                t.on('swipe', function (e) {
                    var touch = e.touch;
                    expect(touch.pageX).toBe(start);
                    expect(touch.pageY).toBe(end);
                    expect(e.direction).toBe('up');
                    expect(e.distance).toBe(start - end);
                    expect(Math.abs(e.duration * 1000 - 30 * (step + 2))).toBeLessThan(200);
                    called = 1;
                });

                var touches = [
                    {
                        pageX: start,
                        pageY: start
                    }
                ];

                jasmine.simulate(t[0], 'touchstart', {
                    touches: touches,
                    changedTouches: touches,
                    targetTouches: touches
                });

                for (var i = 0; i < step; i++) {
                    waits(30);
                    (function (i) {
                        runs(function () {
                            touches[0].pageY = start - (start - end) / step * i;
                            jasmine.simulate(t[0], 'touchmove', {
                                touches: touches,
                                changedTouches: touches,
                                targetTouches: touches
                            });

                        });
                    })(i);
                }

                waits(30);
                (function (i) {
                    runs(function () {
                        touches[0].pageY = end;
                        jasmine.simulate(t[0], 'touchmove', {
                            touches: touches,
                            changedTouches: touches,
                            targetTouches: touches
                        });

                    });
                })(i);

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
                    expect(called).toBe(1);
                });
            });


            it('fires Horizontal', function () {

                var called = 0, start = 90, end = 10;

                t.on('swipe', function (e) {
                    var touch = e.touch;
                    expect(touch.pageX).toBe(end);
                    expect(touch.pageY).toBe(start);
                    expect(e.direction).toBe('left');
                    expect(e.distance).toBe(start - end);
                    called = 1;
                });

                var touches = [
                    {
                        pageX: start,
                        pageY: start
                    }
                ];

                jasmine.simulate(t[0], 'touchstart', {
                    touches: touches,
                    changedTouches: touches,
                    targetTouches: touches
                });

                for (var i = 0; i < step; i++) {
                    waits(30);
                    (function (i) {
                        runs(function () {
                            touches[0].pageX = start - (start - end) / step * i;
                            jasmine.simulate(t[0], 'touchmove', {
                                touches: touches,
                                changedTouches: touches,
                                targetTouches: touches
                            });

                        });
                    })(i);
                }

                waits(30);
                (function (i) {
                    runs(function () {
                        touches[0].pageX = end;
                        jasmine.simulate(t[0], 'touchmove', {
                            touches: touches,
                            changedTouches: touches,
                            targetTouches: touches
                        });

                    });
                })(i);

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
                    expect(called).toBe(1);
                });
            });


            it('will not fire if max offset > 35', function () {

                var called = 0, start = 90, end = 10;

                t.on('swipe', function (e) {
                    called = 1;
                });

                var touches = [
                    {
                        pageX: start,
                        pageY: start
                    }
                ];

                jasmine.simulate(t[0], 'touchstart', {
                    touches: touches,
                    changedTouches: touches,
                    targetTouches: touches
                });

                for (var i = 0; i < step; i++) {
                    waits(30);
                    (function (i) {
                        runs(function () {
                            touches[0].pageX = touches[0].pageY = start - (start - end) / step * i;
                            jasmine.simulate(t[0], 'touchmove', {
                                touches: touches,
                                changedTouches: touches,
                                targetTouches: touches
                            });

                        });
                    })(i);
                }

                waits(30);
                (function (i) {
                    runs(function () {
                        touches[0].pageX = end;
                        jasmine.simulate(t[0], 'touchmove', {
                            touches: touches,
                            changedTouches: touches,
                            targetTouches: touches
                        });

                    });
                })(i);

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


            it('will not fire if min distance < 50', function () {

                var called = 0, start = 90, end = 80;

                t.on('swipe', function (e) {
                    called = 1;
                });

                var touches = [
                    {
                        pageX: start,
                        pageY: start
                    }
                ];

                jasmine.simulate(t[0], 'touchstart', {
                    touches: touches,
                    changedTouches: touches,
                    targetTouches: touches
                });

                for (var i = 0; i < step; i++) {
                    waits(30);
                    (function (i) {
                        runs(function () {
                            touches[0].pageX = touches[0].pageY = start - (start - end) / step * i;
                            jasmine.simulate(t[0], 'touchmove', {
                                touches: touches,
                                changedTouches: touches,
                                targetTouches: touches
                            });

                        });
                    })(i);
                }

                waits(30);
                (function (i) {
                    runs(function () {
                        touches[0].pageX = end;
                        jasmine.simulate(t[0], 'touchmove', {
                            touches: touches,
                            changedTouches: touches,
                            targetTouches: touches
                        });

                    });
                })(i);

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


            it('does not fire if max duration > 1000', function () {

                var called = 0, start = 90, end = 10;

                t.on('swipe', function (e) {
                    called = 1;
                });

                var touches = [
                    {
                        pageX: start,
                        pageY: start
                    }
                ];

                jasmine.simulate(t[0], 'touchstart', {
                    touches: touches,
                    changedTouches: touches,
                    targetTouches: touches
                });

                for (var i = 0; i < step; i++) {
                    waits(30);
                    (function (i) {
                        runs(function () {
                            touches[0].pageY = start - (start - end) / step * i;
                            jasmine.simulate(t[0], 'touchmove', {
                                touches: touches,
                                changedTouches: touches,
                                targetTouches: touches
                            });

                        });
                    })(i);
                }

                waits(30);
                (function (i) {
                    runs(function () {
                        touches[0].pageY = end;
                        jasmine.simulate(t[0], 'touchmove', {
                            touches: touches,
                            changedTouches: touches,
                            targetTouches: touches
                        });

                    });
                })(i);

                waits(1000);

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


            it('does not fire if touches.length > 1', function () {

                var called = 0, start = 90, end = 10;

                t.on('swipe', function (e) {
                    called = 1;
                });

                var touches = [
                    {
                        pageX: start,
                        pageY: start
                    },
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
                    (function (i) {
                        runs(function () {
                            touches[0].pageY = start - (start - end) / step * i;
                            jasmine.simulate(t[0], 'touchmove', {
                                touches: touches,
                                changedTouches: touches,
                                targetTouches: touches
                            });

                        });
                    })(i);
                }

                waits(30);
                (function (i) {
                    runs(function () {
                        touches[0].pageY = end;
                        jasmine.simulate(t[0], 'touchmove', {
                            touches: touches,
                            changedTouches: touches,
                            targetTouches: touches
                        });

                    });
                })(i);

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

    });

}
/**
 * test swipe gesture by simulating touch event for ios/android
 * @author yiminghe@gmail.com
 */
(function() {
    var UA = require('ua');
    var Feature = require('feature');
    if (UA.phantomjs || !Feature.isTouchEventSupported()) {
        return;
    }
    var $ = require('node');
    var SwipeType = require('event/gesture/swipe');
    var SWIPE = SwipeType.SWIPE;
    /*jshint loopfunc:true*/
    var step = 10;
    describe('swipe', function () {
        var t;

        beforeEach(function () {
            t = $('<div style="' +
                '-webkit-user-drag:none;' +
                '-webkit-user-select:none;' +
                '-webkit-tap-highlight-color:rgba(0,0,0,0);' +
                '-webkit-touch-callout:none;' +
                '-webkit-touch-action:none;' +

                'border:1px solid red;' +
                'width:100px;' +
                'height:100px;"></div>').prependTo('body');
        });

        afterEach(function () {
            t.remove();
        });

        function swipe(p) {
            var d = p === 'pageX' ? 'left' : 'up';
            var unchangedP = p === 'pageX' ? 'pageY' : 'pageX';
            var called = 0, start = 90, end = 10;

            t.on(SWIPE, function (e) {
                expect(e[p]).toBe(end);
                expect(e[unchangedP]).toBe(start);
                expect(e.direction).toBe(d);
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
                        touches[0][p] = start - (start - end) / step * i;
                        jasmine.simulate(t[0], 'touchmove', {
                            touches: touches,
                            changedTouches: touches,
                            targetTouches: touches
                        });

                    });
                })(i);
            }

            waits(30);

            runs(function () {
                touches[0][p] = end;
                jasmine.simulate(t[0], 'touchmove', {
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
                expect(called).toBe(1);
            });
        }

        // chrome emulate bug
        if (!S.UA.chrome) {
            it('fires vertical', function () {
                swipe('pageY');
            });
        }

        it('fires horizontal', function () {
            swipe('pageX');
        });


        it('will not fire if max offset > 35', function () {
            var called = 0, start = 90, end = 10;

            t.on('swipe', function () {
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
            (function () {
                runs(function () {
                    touches[0].pageX = end;
                    jasmine.simulate(t[0], 'touchmove', {
                        touches: touches,
                        changedTouches: touches,
                        targetTouches: touches
                    });

                });
            })();

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

            t.on('swipe', function () {
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
            (function () {
                runs(function () {
                    touches[0].pageX = end;
                    jasmine.simulate(t[0], 'touchmove', {
                        touches: touches,
                        changedTouches: touches,
                        targetTouches: touches
                    });

                });
            })();

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

            t.on(SWIPE, function () {
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
            (function () {
                runs(function () {
                    touches[0].pageY = end;
                    jasmine.simulate(t[0], 'touchmove', {
                        touches: touches,
                        changedTouches: touches,
                        targetTouches: touches
                    });

                });
            })();

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

            t.on(SWIPE, function () {
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
            (function () {
                runs(function () {
                    touches[0].pageY = end;
                    jasmine.simulate(t[0], 'touchmove', {
                        touches: touches,
                        changedTouches: touches,
                        targetTouches: touches
                    });

                });
            })();

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
})();
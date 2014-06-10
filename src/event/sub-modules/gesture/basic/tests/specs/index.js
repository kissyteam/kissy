/**
 * tc for cross platform move gesture
 * @author yiminghe@gmail.com
 */


    var UA = require('ua');
    var $ = require('node');
    var BasicGesture = require('event/gesture/basic');
    var Feature = require('feature');
    describe('base gesture', function () {
        if (!UA.ios) {
            it('works for mouse', function () {
                var d = $('<div style="position:absolute;left:0;top:0;width: 100px;height: 100px"></div>');
                d.appendTo(document.body);
                var doc = $(document);
                var start = 0;
                var move = 0;
                var end = 0;

                doc.on(BasicGesture.START, function (e) {
                    expect(e.gestureType).toBe('mouse');
                    start = 1;
                    expect(e.touches.length).toBe(1);
                    expect(e.touches[0].pageX).toBe(10);
                    expect(e.touches[0].pageY).toBe(10);
                    expect(e.pageX).toBe(10);
                    expect(e.pageY).toBe(10);
                });

                doc.on(BasicGesture.MOVE, function (e) {
                    expect(e.touches.length).toBe(1);
                    expect(e.gestureType).toBe('mouse');
                    move = 1;
                    expect(e.touches[0].pageX).toBe(16);
                    expect(e.touches[0].pageY).toBe(16);
                    expect(e.pageX).toBe(16);
                    expect(e.pageY).toBe(16);
                });

                doc.on(BasicGesture.END, function (e) {
                    expect(e.touches.length).toBe(0);
                    expect(e.changedTouches.length).toBe(1);
                    expect(e.gestureType).toBe('mouse');
                    end = 1;
                    expect(e.changedTouches[0].pageX).toBe(16);
                    expect(e.changedTouches[0].pageY).toBe(16);
                    expect(e.pageX).toBe(16);
                    expect(e.pageY).toBe(16);
                });

                runs(function () {
                    jasmine.simulate(d[0], 'mousedown', {
                        clientX: 10,
                        clientY: 10
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'mousemove', {
                        clientX: 16,
                        clientY: 16
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'mousemove', {
                        clientX: 16,
                        clientY: 16
                    });
                });

                waits(300);
                runs(function () {
                    jasmine.simulate(document, 'mouseup', {
                        clientX: 16,
                        clientY: 16
                    });
                });

                waits(300);
                runs(function () {
                    expect(start).toBe(1);
                    expect(move).toBe(1);
                    expect(end).toBe(1);
                    d.remove();
                    doc.detach();
                });
            });
        }

        if (Feature.isTouchEventSupported()) {
            it('works for touch events', function () {
                var d = $('<div style="position:absolute;left:0;top:0;width: 100px;height: 100px"></div>');
                d.appendTo(document.body);
                var start = 0;
                var move = 0;
                var end = 0;

                d.on(BasicGesture.START, function (e) {
                    expect(e.gestureType).toBe('touch');
                    start = 1;
                    expect(e.touches.length).toBe(2);
                    expect(e.touches[0].pageX).toBe(10);
                    expect(e.touches[0].pageY).toBe(10);
                    expect(e.touches[1].pageX).toBe(11);
                    expect(e.touches[1].pageX).toBe(11);

                });
                d.on(BasicGesture.MOVE, function (e) {
                    expect(e.gestureType).toBe('touch');
                    move = 1;
                    expect(e.touches.length).toBe(2);
                    expect(e.touches[0].pageX).toBe(16);
                    expect(e.touches[0].pageY).toBe(16);
                    expect(e.touches[1].pageX).toBe(26);
                    expect(e.touches[1].pageX).toBe(26);
                });

                d.on(BasicGesture.END, function (e) {
                    expect(e.gestureType).toBe('touch');
                    end = 1;
                    expect(e.touches.length).toBe(1);
                    expect(e.changedTouches.length).toBe(1);
                    expect(e.changedTouches[0].pageX).toBe(16);
                    expect(e.changedTouches[0].pageY).toBe(16);
                    expect(e.touches[0].pageX).toBe(26);
                    expect(e.touches[0].pageX).toBe(26);
                });
                runs(function () {
                    jasmine.simulate(d[0], 'touchstart', {
                        touches: [
                            {
                                pageX: 10,
                                pageY: 10
                            },
                            {
                                pageX: 11,
                                pageY: 11
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 10,
                                pageY: 10
                            },
                            {
                                pageX: 11,
                                pageY: 11
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 10,
                                pageY: 10
                            },
                            {
                                pageX: 11,
                                pageY: 11
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(d[0], 'touchmove', {
                        touches: [
                            {
                                pageX: 16,
                                pageY: 16
                            },
                            {
                                pageX: 26,
                                pageY: 26
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 16,
                                pageY: 16
                            },
                            {
                                pageX: 26,
                                pageY: 26
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 16,
                                pageY: 16
                            },
                            {
                                pageX: 26,
                                pageY: 26
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    jasmine.simulate(d[0], 'touchend', {
                        touches: [
                            {
                                pageX: 26,
                                pageY: 26
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 16,
                                pageY: 16
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 26,
                                pageY: 26
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    expect(start).toBe(1);
                    expect(move).toBe(1);
                    expect(end).toBe(1);
                    d.remove();
                });
            });
        }
    });
/**
 * tc for edge-drag gesture
 */
KISSY.add(function (S, require) {
    if (S.UA.phantomjs || !S.Feature.isTouchEventSupported()) {
        return;
    }

    var Node = require('node');
    var $ = Node.all;
    var EdgeDragGesture = require('event/gesture/edge-drag');
    var ie = S.UA.ieMode;
    if (ie === 9 || ie === 11) {
        return;
    }
    var win = $(window);

    var right = win.width();
    var bottom = win.height();

    describe('edge-drag gesture', function () {
        afterEach(function () {
            win.detach();
        });

        describe('right direction', function () {
            it('works for right direction in boundary', function () {
                var start = 0;
                var move = 0;
                var end = 0;

                win.on(EdgeDragGesture.EDGE_DRAG_START, function (e) {
                    expect(e.direction).toBe('right');
                    start = 1;
                    expect(e.pageX).toBe(11);
                    expect(e.pageY).toBe(1);
                });

                win.on(EdgeDragGesture.EDGE_DRAG, function (e) {
                    expect(e.direction).toBe('right');
                    move = 1;
                    expect(e.pageX).toBe(81);
                    expect(e.pageY).toBe(1);
                });

                win.on(EdgeDragGesture.EDGE_DRAG_END, function (e) {
                    expect(e.direction).toBe('right');
                    end = 1;
                    expect(e.pageX).toBe(81);
                    expect(e.pageY).toBe(1);
                });

                runs(function () {
                    jasmine.simulate(document, 'touchstart', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: 11,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 11,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 11,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: 81,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 81,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 81,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    jasmine.simulate(document, 'touchend', {
                        touches: [
                            {
                                pageX: 81,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 81,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 81,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    expect(start).toBe(1);
                    expect(move).toBe(1);
                    expect(end).toBe(1);
                });
            });

            it('works for right direction out of boundary', function () {
                var start = 0;
                var move = 0;
                var end = 0;

                win.on(EdgeDragGesture.EDGE_DRAG_START, function (e) {
                    start = 1;
                    expect(e.pageX).toBe(11);
                    expect(e.pageY).toBe(11);
                });

                win.on(EdgeDragGesture.EDGE_DRAG, function (e) {
                    move = 1;
                    expect(e.pageX).toBe(81);
                    expect(e.pageY).toBe(81);
                });

                win.on(EdgeDragGesture.EDGE_DRAG_END, function (e) {
                    end = 1;
                    expect(e.pageX).toBe(81);
                    expect(e.pageY).toBe(81);
                });

                runs(function () {
                    jasmine.simulate(document, 'touchstart', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: 61,
                                pageY: 61
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 61,
                                pageY: 61
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 61,
                                pageY: 61
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: 81,
                                pageY: 81
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 81,
                                pageY: 81
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 81,
                                pageY: 81
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    jasmine.simulate(document, 'touchend', {
                        touches: [
                            {
                                pageX: 81,
                                pageY: 81
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 81,
                                pageY: 81
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 81,
                                pageY: 81
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    expect(start).toBe(0);
                    expect(move).toBe(0);
                    expect(end).toBe(0);
                });
            });
        });

        describe('left direction', function () {
            it('works for left direction in boundary', function () {
                var start = 0;
                var move = 0;
                var end = 0;

                win.on(EdgeDragGesture.EDGE_DRAG_START, function (e) {
                    expect(e.direction).toBe('left');
                    start = 1;
                    expect(e.pageX).toBe(right - 11);
                    expect(e.pageY).toBe(1);
                });

                win.on(EdgeDragGesture.EDGE_DRAG, function (e) {
                    expect(e.direction).toBe('left');
                    move = 1;
                    expect(e.pageX).toBe(right - 81);
                    expect(e.pageY).toBe(1);
                });

                win.on(EdgeDragGesture.EDGE_DRAG_END, function (e) {
                    expect(e.direction).toBe('left');
                    end = 1;
                    expect(e.pageX).toBe(right - 81);
                    expect(e.pageY).toBe(1);
                });

                runs(function () {
                    jasmine.simulate(document, 'touchstart', {
                        touches: [
                            {
                                pageX: right - 1,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: right - 1,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: right - 1,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: right - 11,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: right - 11,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: right - 11,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: right - 81,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: right - 81,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: right - 81,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    jasmine.simulate(document, 'touchend', {
                        touches: [
                            {
                                pageX: right - 81,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: right - 81,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: right - 81,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    expect(start).toBe(1);
                    expect(move).toBe(1);
                    expect(end).toBe(1);
                });
            });

            it('works for left direction out of boundary', function () {
                var start = 0;
                var move = 0;
                var end = 0;

                win.on(EdgeDragGesture.EDGE_DRAG_START, function (e) {
                    expect(e.direction).toBe('left');
                    start = 1;
                    expect(e.pageX).toBe(right - 11);
                    expect(e.pageY).toBe(1);
                });

                win.on(EdgeDragGesture.EDGE_DRAG, function (e) {
                    expect(e.direction).toBe('left');
                    move = 1;
                    expect(e.pageX).toBe(right - 81);
                    expect(e.pageY).toBe(1);
                });

                win.on(EdgeDragGesture.EDGE_DRAG_END, function (e) {
                    expect(e.direction).toBe('left');
                    end = 1;
                    expect(e.pageX).toBe(right - 81);
                    expect(e.pageY).toBe(1);
                });

                runs(function () {
                    jasmine.simulate(document, 'touchstart', {
                        touches: [
                            {
                                pageX: right - 1,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: right - 1,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: right - 1,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: right - 61,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: right - 61,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: right - 61,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: right - 81,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: right - 81,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: right - 81,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    jasmine.simulate(document, 'touchend', {
                        touches: [
                            {
                                pageX: right - 81,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: right - 81,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: right - 81,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    expect(start).toBe(0);
                    expect(move).toBe(0);
                    expect(end).toBe(0);
                });
            });
        });

        describe('down direction', function () {
            it('works for down direction in boundary', function () {
                var start = 0;
                var move = 0;
                var end = 0;

                win.on(EdgeDragGesture.EDGE_DRAG_START, function (e) {
                    expect(e.direction).toBe('down');
                    start = 1;
                    expect(e.pageX).toBe(1);
                    expect(e.pageY).toBe(11);
                });

                win.on(EdgeDragGesture.EDGE_DRAG, function (e) {
                    expect(e.direction).toBe('down');
                    move = 1;
                    expect(e.pageX).toBe(1);
                    expect(e.pageY).toBe(81);
                });

                win.on(EdgeDragGesture.EDGE_DRAG_END, function (e) {
                    expect(e.direction).toBe('down');
                    end = 1;
                    expect(e.pageX).toBe(1);
                    expect(e.pageY).toBe(81);
                });

                runs(function () {
                    jasmine.simulate(document, 'touchstart', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: 11
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: 11
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: 11
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: 81
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: 81
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: 81
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    jasmine.simulate(document, 'touchend', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: 81
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: 81
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: 81
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    expect(start).toBe(1);
                    expect(move).toBe(1);
                    expect(end).toBe(1);
                });
            });

            it('works for down direction out of boundary', function () {
                var start = 0;
                var move = 0;
                var end = 0;

                win.on(EdgeDragGesture.EDGE_DRAG_START, function (e) {
                    expect(e.direction).toBe('down');
                    start = 1;
                    expect(e.pageX).toBe(1);
                    expect(e.pageY).toBe(bottom - 11);
                });

                win.on(EdgeDragGesture.EDGE_DRAG, function (e) {
                    expect(e.direction).toBe('down');
                    move = 1;
                    expect(e.pageX).toBe(1);
                    expect(e.pageY).toBe(bottom - 81);
                });

                win.on(EdgeDragGesture.EDGE_DRAG_END, function (e) {
                    expect(e.direction).toBe('down');
                    end = 1;
                    expect(e.pageX).toBe(1);
                    expect(e.pageY).toBe(bottom - 81);
                });

                runs(function () {
                    jasmine.simulate(document, 'touchstart', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: 1
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: 61
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: 61
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: 61
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: 81
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: 81
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: 81
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    jasmine.simulate(document, 'touchend', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: 81
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: 81
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: 81
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    expect(start).toBe(0);
                    expect(move).toBe(0);
                    expect(end).toBe(0);
                });
            });
        });

        describe('up direction', function () {
            it('works for up direction in boundary', function () {
                var start = 0;
                var move = 0;
                var end = 0;

                win.on(EdgeDragGesture.EDGE_DRAG_START, function (e) {
                    expect(e.direction).toBe('up');
                    start = 1;
                    expect(e.pageX).toBe(1);
                    expect(e.pageY).toBe(bottom - 11);
                });

                win.on(EdgeDragGesture.EDGE_DRAG, function (e) {
                    expect(e.direction).toBe('up');
                    move = 1;
                    expect(e.pageX).toBe(1);
                    expect(e.pageY).toBe(bottom - 81);
                });

                win.on(EdgeDragGesture.EDGE_DRAG_END, function (e) {
                    expect(e.direction).toBe('up');
                    end = 1;
                    expect(e.pageX).toBe(1);
                    expect(e.pageY).toBe(bottom - 81);
                });

                runs(function () {
                    jasmine.simulate(document, 'touchstart', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: bottom - 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 1
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: bottom - 11
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 11
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 11
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: bottom - 81
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 81
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 81
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    jasmine.simulate(document, 'touchend', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: bottom - 81
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 81
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 81
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    expect(start).toBe(1);
                    expect(move).toBe(1);
                    expect(end).toBe(1);
                });
            });

            it('works for up direction out of boundary', function () {
                var start = 0;
                var move = 0;
                var end = 0;

                win.on(EdgeDragGesture.EDGE_DRAG_START, function (e) {
                    expect(e.direction).toBe('down');
                    start = 1;
                    expect(e.pageX).toBe(1);
                    expect(e.pageY).toBe(bottom - 11);
                });

                win.on(EdgeDragGesture.EDGE_DRAG, function (e) {
                    expect(e.direction).toBe('down');
                    move = 1;
                    expect(e.pageX).toBe(1);
                    expect(e.pageY).toBe(bottom - 81);
                });

                win.on(EdgeDragGesture.EDGE_DRAG_END, function (e) {
                    expect(e.direction).toBe('down');
                    end = 1;
                    expect(e.pageX).toBe(1);
                    expect(e.pageY).toBe(bottom - 81);
                });

                runs(function () {
                    jasmine.simulate(document, 'touchstart', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: bottom - 1
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 1
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 1
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: bottom - 61
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 61
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 61
                            }
                        ]
                    });
                });

                waits(100);
                runs(function () {
                    jasmine.simulate(document, 'touchmove', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: bottom - 81
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 81
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 81
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    jasmine.simulate(document, 'touchend', {
                        touches: [
                            {
                                pageX: 1,
                                pageY: bottom - 81
                            }
                        ],
                        changedTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 81
                            }
                        ],
                        targetTouches: [
                            {
                                pageX: 1,
                                pageY: bottom - 81
                            }
                        ]
                    });
                });

                waits(300);
                runs(function () {
                    expect(start).toBe(0);
                    expect(move).toBe(0);
                    expect(end).toBe(0);
                });
            });
        });
    });
});
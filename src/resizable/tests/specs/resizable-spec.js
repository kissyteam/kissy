/**
 * Resizable tc.
 * @author yiminghe@gmail.com
 */
KISSY.use('resizable', function (S, Resizable) {
    // ie9 mousemove does not fire
    if (document.documentMode == 9) {
        return;
    }
    
    var Gesture= S.Event.Gesture;

    var $ = S.all;

    describe('resizable works', function () {

        beforeEach(function () {
            this.addMatchers({
                toBeAlmostEqual: function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 20;
                },

                toBeEqualRect: function (expect) {
                    var actual = this.actual;
                    for (var i in actual) {
                        if (actual[i] - expect[i] < 5) {
                            continue;
                        } else {
                            return false;
                        }
                    }
                    return true;
                },


                toBeEqual: function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                }
            });
        });


        var cssText = 'position: absolute;' +
            'width: 100px;height: 100px;' +
            'left: 100px;top:100px;';

        var dom = $('<div></div>').appendTo('body');


        beforeEach(function () {
            dom.attr('style', cssText);
        });

        var resizable = new Resizable({
            node: dom,
            handlers: ["b", "t", "r", "l", "tr", "tl", "br", "bl"]
        });

        var lNode = dom.one('.ks-resizable-handler-l');

        var rNode = dom.one('.ks-resizable-handler-r');

        var bNode = dom.one('.ks-resizable-handler-b');

        var tNode = dom.one('.ks-resizable-handler-t');

        var blNode = dom.one('.ks-resizable-handler-bl');

        var brNode = dom.one('.ks-resizable-handler-br');

        var tlNode = dom.one('.ks-resizable-handler-tl');

        var trNode = dom.one('.ks-resizable-handler-tr');

        var start, end;

        resizable.on('resizeStart', function (e) {
            start = e.handler;
        });
        resizable.on('resizeEnd', function (e) {
            end = e.handler;
        });

        it('l resize works', function () {

            jasmine.simulateForDrag(lNode[0], Gesture.start, {
                clientX: 102,
                clientY: 110
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 92,
                    clientY: 110
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 82,
                    clientY: 110
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });
            waits(200);
            runs(function () {
                expect(dom.width()).toBeEqual(120);
                expect(dom.offset().left).toBeEqual(80);
            });
            runs(function () {
                expect(start).toBe('l');
                expect(end).toBe('l');
            });
        });

        it('r resize works', function () {
            jasmine.simulateForDrag(rNode[0], Gesture.start, {
                clientX: 198,
                clientY: 110
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 208,
                    clientY: 110
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 218,
                    clientY: 110
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });
            waits(200);
            runs(function () {
                expect(dom.width()).toBeEqual(120);
                expect(dom.offset().left).toBeEqual(100);
            });
            runs(function () {
                expect(start).toBe('r');
                expect(end).toBe('r');
            });
        });


        it('t resize works', function () {
            jasmine.simulateForDrag(tNode[0], Gesture.start, {
                clientX: 102,
                clientY: 102
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 102,
                    clientY: 92
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 102,
                    clientY: 82
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });
            waits(200);
            runs(function () {
                expect(dom.height()).toBeEqual(120);
                expect(dom.offset().top).toBeEqual(80);
            });
        });


        it('b resize works', function () {
            jasmine.simulateForDrag(bNode[0], Gesture.start, {
                clientX: 102,
                clientY: 202
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 102,
                    clientY: 212
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 102,
                    clientY: 222
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });
            waits(200);
            runs(function () {
                expect(dom.height()).toBeEqual(120);
                expect(dom.offset().top).toBeEqual(100);
            });
        });


        it('bl resize works', function () {
            jasmine.simulateForDrag(blNode[0], Gesture.start, {
                clientX: 102,
                clientY: 198
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 92,
                    clientY: 208
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 82,
                    clientY: 218
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });
            waits(200);
            runs(function () {
                expect(dom.height()).toBeEqual(120);
                expect(dom.width()).toBeEqual(120);
                expect(dom.offset().top).toBeEqual(100);
                expect(dom.offset().left).toBeEqual(80);
            });
            runs(function () {
                expect(start).toBe('bl');
                expect(end).toBe('bl');
            });
        });


        it('tl resize works', function () {
            jasmine.simulateForDrag(tlNode[0], Gesture.start, {
                clientX: 102,
                clientY: 102
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 112,
                    clientY: 112
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 122,
                    clientY: 122
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });
            waits(200);
            runs(function () {
                expect(dom.height()).toBeEqual(80);
                expect(dom.width()).toBeEqual(80);
                expect(dom.offset().top).toBeEqual(120);
                expect(dom.offset().left).toBeEqual(120);
            });
        });


        it('tr resize works', function () {
            jasmine.simulateForDrag(trNode[0], Gesture.start, {
                clientX: 198,
                clientY: 102
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 208,
                    clientY: 92
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 218,
                    clientY: 82
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });
            waits(200);
            runs(function () {
                expect(dom.height()).toBeEqual(120);
                expect(dom.width()).toBeEqual(120);
                expect(dom.offset().top).toBeEqual(80);
                expect(dom.offset().left).toBeEqual(100);
            });
        });


        it('br resize works', function () {
            jasmine.simulateForDrag(brNode[0], Gesture.start, {
                clientX: 198,
                clientY: 198
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 208,
                    clientY: 208
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 218,
                    clientY: 218
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });
            waits(200);
            runs(function () {
                expect(dom.height()).toBeEqual(120);
                expect(dom.width()).toBeEqual(120);
                expect(dom.offset().top).toBeEqual(100);
                expect(dom.offset().left).toBeEqual(100);
            });
        });


        it('disabled works for true', function () {
            resizable.set('disabled', true);
            jasmine.simulateForDrag(lNode[0], Gesture.start, {
                clientX: 102,
                clientY: 110
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 92,
                    clientY: 110
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 82,
                    clientY: 110
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });
            waits(200);
            runs(function () {
                expect(dom.width()).toBeEqual(100);
                expect(dom.offset().left).toBeEqual(100);
            });

        });


        it('disabled works for false', function () {
            resizable.set('disabled', false);
            jasmine.simulateForDrag(lNode[0], Gesture.start, {
                clientX: 102,
                clientY: 110
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 92,
                    clientY: 110
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: 82,
                    clientY: 110
                });
            });
            waits(200);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });
            waits(200);
            runs(function () {
                expect(dom.width()).toBeEqual(120);
                expect(dom.offset().left).toBeEqual(80);
            });

        });


        it('destroy works', function () {
            resizable.destroy();
            S.each(['t', 'l', 'b', 'r', 'tl', 'tr', 'bl', 'br'], function (s) {
                expect(dom.one('.ks-resizable-handler-' + s)).toBe(null);
            });
        });
    });

});
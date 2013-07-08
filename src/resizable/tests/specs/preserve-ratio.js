/**
 * Resizable tc.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Resizable) {
    // ie9 mousemove does not fire
    if (document.documentMode == 9) {
        return;
    }

    var Gesture = S.Event.Gesture;

    var $ = S.all;

    describe('preserveRatio works', function () {

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
        dom.attr('style', cssText);

        beforeEach(function () {
            dom.attr('style', cssText);
        });

        var resizable = new Resizable({
            node: dom,
            preserveRatio: true,
            handlers: ["b", "t", "r", "l", "tr", "tl", "br", "bl"]
        });

        var lNode = dom.one('.ks-resizable-handler-l');

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
                jasmine.simulateForDrag(document, Gesture.end, {
                    clientX: 82,
                    clientY: 110
                });
            });
            waits(200);
            runs(function () {
                expect(dom.width()).toBeEqual(120);
                expect(dom.height()).toBeEqual(120);
                expect(dom.offset().left).toBeEqual(80);
                expect(dom.offset().top).toBeEqual(100);
            });
        });

        it('destroy works', function () {
            resizable.destroy();
            S.each(['t', 'l', 'b', 'r', 'tl', 'tr', 'bl', 'br'], function (s) {
                expect(dom.one('.ks-resizable-handler-' + s)).toBe(null);
            });
        });
    });

},{
    requires:['resizable']
});
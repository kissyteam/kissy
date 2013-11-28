/**
 * test case for anim frame config
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Dom = require('dom');
    var Anim = require('anim');
    var Node = require('node');
    var $ = Node.all;
    describe('anim-frame config', function () {
        it("accept custom animation property", function () {
            //非标准的css属性渐变
            var anyPlainObject = {
                r: 1
            };
            //最终半径
            var finalRadius;

            var anim = new Anim(anyPlainObject, {
                r: 80
            }, {
                easing: "swing",
                duration: .5,
                frame: function (anim, fx) {
                    finalRadius = fx.val;
                }
            });
            anim.run();
            waits(600);
            runs(function () {
                expect(anim.isRunning()).toBeFalsy();
                expect(finalRadius).toBe(80);
            });
        });

        it('support fx extension', function () {
            if (!S.UA.webkit) {
                return;
            }

            var div = $('<div></div>')
                .prependTo('body');

            div.animate({
                '-webkit-transform': {
                    easing: 'linear',
                    frame: function (anim, fx) {
                        div.css(fx.prop, 'translate(' +
                            (100 * fx.pos) + 'px,' +
                            (100 * fx.pos) + 'px' + ')');
                    }
                }
            }, {
                duration: 2
            });

            waits(1000);

            runs(function () {
                var m = div.style('-webkit-transform')
                    .match(/translate\(([\d.]+)px\s*,\s*([\d.]+)px\)/);
                expect(Math.abs(50 - parseFloat(m[1]))).toBeLessThan(2);
                expect(Math.abs(50 - parseFloat(m[2]))).toBeLessThan(2);
            });

            waits(1500);

            runs(function () {
                div.remove();
            });
        });

        it("should call frame", function () {
            var stoppedCalled = 0,
                t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo('body');

            var anim = new Anim(t, {
                width: 10
            }, {
                duration: 1,
                frame: function (_, fx) {
                    if (fx.pos == 1) {
                        stoppedCalled = 1;
                    }
                    t.css('height', fx.val);
                    t.css(fx.prop, fx.val);
                }
            });
            anim.run();
            waits(100);
            runs(function () {
                expect(t.css('width')).not.toBe("100px");
                expect(t.css('height')).not.toBe("100px");
                anim.stop(1);
            });
            waits(100);
            runs(function () {
                expect(stoppedCalled).toBe(1);
                expect(t.css('width')).toBe("10px");
                expect(t.css('height')).toBe("10px");
                t.remove();
            });
        });

        it("frame can call stop", function () {
            var t = $("<div style='height:100px;" +
                "width:100px;overflow: hidden;'>" +
                "</div>").appendTo('body');
            var start = S.now();
            var called = 0;
            var anim = new Anim(t, {
                width: 10,
                height: 10
            }, {
                duration: 0.5,
                frame: function (_, fx) {
                    if (fx.pos > 0.5 && fx.pos != 1) {
                        anim.stop(1);
                    } else {
                        t.css(fx.prop, fx.val);
                    }
                },
                complete: function () {
                    called++;
                    expect(S.now() - start).toBeLessThan(1000);
                }
            });
            anim.run();
            waits(300);
            runs(function () {
                expect(t.css('width')).toBe("10px");
                t.remove();
            });
            waits(100);
            runs(function () {
                expect(called).toBe(1);
                expect(t.css('width')).toBe("10px");
                t.remove();
            });
        });

        it("frame can call stop", function () {
            var t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo('body');
            var called = 0;
            var calledComplete = 0;
            var anim = new Anim(t, {
                width: 10,
                height: 10
            }, {
                duration: 1,
                frame: function (_, fx) {
                    if (fx.pos > 0.5) {
                        called++;
                        anim.stop();
                    } else {
                        t.css(fx.prop, fx.val);
                    }
                },
                complete: function () {
                    calledComplete++;
                }
            });
            anim.run();
            waits(600);
            runs(function () {
                expect(called).toBe(1);
                expect(t.css('width')).not.toBe("10px");
            });
            waits(100);
            runs(function () {
                expect(calledComplete).toBe(0);
                expect(t.css('width')).not.toBe("10px");
            });
            waits(500);
            runs(function () {
                expect(anim.isRunning()).toBeFalsy();
                t.remove();
            });
        });

// to be removed, do not use this feature
        it("frame can ignore native update", function () {
            var t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo('body');
            var anim = new Anim(t, {
                width: 10
            }, {
                duration: 1,
                frame: function () {
                }
            });

            anim.run();
            waits(100);
            runs(function () {
                expect(t.css('width')).toBe("100px");
                anim.stop(1);
            });
            waits(100);
            runs(function () {
                expect(t.css('width')).toBe("100px");
                t.remove();
            });
        });

// to be removed, do not use this feature
        it("frame can stop early and ignore native update", function () {
            var t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo('body');
            var start = S.now();
            var called = 0;
            var anim = new Anim(t, {
                width: 10
            }, {
                duration: 1,
                frame: function (anim, fx) {
                    fx.pos = 1;
                },
                complete: function () {
                    called = 1;
                    expect(S.now() - start).toBeLessThan(100);
                }
            });

            anim.run();
            waits(500);
            runs(function () {
                expect(called).toBe(1);
                expect(t.css('width')).toBe("100px");
                anim.stop(1);
            });
            waits(500);
            runs(function () {
                expect(t.css('width')).toBe("100px");
                t.remove();
            });
        });

// to be removed, do not use this feature
        it("frame can stop early and perform native update", function () {
            var t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo('body');
            var start = S.now();
            var called = 0;
            var anim = new Anim(t, {
                width: 10
            }, {
                duration: 1,
                frame: function (anim, fx) {
                    fx.pos = 1;
                    t.css(fx.prop, 10);
                },
                complete: function () {
                    called = 1;
                    expect(S.now() - start).toBeLessThan(100);
                }
            });

            anim.run();
            waits(500);
            runs(function () {
                expect(called).toBe(1);
                expect(t.css('width')).toBe("10px");
                anim.stop(1);
            });
            waits(500);
            runs(function () {
                expect(t.css('width')).toBe("10px");
                t.remove();
            });
        });
    });
});

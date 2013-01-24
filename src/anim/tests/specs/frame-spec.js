/**
 * test case for anim frame config
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,anim,node", function (S, DOM, Anim, Node) {
    var $ = Node.all;
    describe('anim-frame config', function () {
        it("should call frame", function () {
            var stoppedCalled = 0,
                t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo("body");

            var anim = new Anim(t, {
                width: 10
            }, {
                duration: 1,
                frame: function (_, fx) {
                    if (fx.pos == 1) {
                        stoppedCalled = 1;
                    }
                    t.css("height", fx.from + fx.pos * (fx.to - fx.from));
                }
            });
            var start = S.now();

            anim.run();
            waits(100);
            runs(function () {
                expect(t.css("width")).not.toBe("100px");
                expect(t.css("height")).not.toBe("100px");
                anim.stop(1);
            });
            waits(100);
            runs(function () {
                expect(stoppedCalled).toBe(1);
                expect(t.css("width")).toBe("10px");
                expect(t.css("height")).toBe("10px");
                t.remove();
            });
        });

        it("frame can call stop", function () {
            var t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo("body");
            var start = S.now();
            var called = 0;
            var anim = new Anim(t, {
                width: 10,
                height: 10
            }, {
                duration: 0.5,
                frame: function (_, fx) {
                    if (fx.pos > 0.5) {
                        anim.stop(1);
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
                expect(t.css("width")).toBe("10px");
                t.remove();
            });
            waits(100);
            runs(function () {
                expect(called).toBe(1);
                expect(t.css("width")).toBe("10px");
                t.remove();
            });
        });

        it("frame can call stop", function () {
            var t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo("body");
            var called = 0;
            var calledComplete = 0;
            var anim = new Anim(t, {
                width: 10,
                height: 10
            }, {
                duration: 0.5,
                frame: function (_, fx) {
                    if (fx.pos > 0.5) {
                        called++;
                        anim.stop();
                    }
                },
                complete: function () {
                    calledComplete++;
                }
            });
            anim.run();
            waits(300);
            runs(function () {
                expect(called).toBe(1);
                expect(t.css("width")).not.toBe("10px");
            });
            waits(100);
            runs(function () {
                expect(calledComplete).toBe(0);
                expect(t.css("width")).not.toBe("10px");
                t.remove();
            });
        });


// to be removed, do not use this feature
        it("frame can ignore native update", function () {
            var t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo("body");
            var anim = new Anim(t, {
                width: 10
            }, {
                duration: 1,
                frame: function () {
                    return false;
                }
            });

            anim.run();
            waits(100);
            runs(function () {
                expect(t.css("width")).toBe("100px");
                anim.stop(1);
            });
            waits(100);
            runs(function () {
                expect(t.css("width")).toBe("100px");
                t.remove();
            });
        });

// to be removed, do not use this feature
        it("frame can stop early and ignore native update", function () {
            var t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo("body");
            var start = S.now();
            var called = 0;
            var anim = new Anim(t, {
                width: 10
            }, {
                duration: 1,
                frame: function (anim, fx) {
                    fx.finished = 1;
                    return false;
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
                expect(t.css("width")).toBe("100px");
                anim.stop(1);
            });
            waits(500);
            runs(function () {
                expect(t.css("width")).toBe("100px");
                t.remove();
            });
        });

// to be removed, do not use this feature
        it("frame can stop early and perform native update", function () {
            var t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo("body");
            var start = S.now();
            var called = 0;
            var anim = new Anim(t, {
                width: 10
            }, {
                duration: 1,
                frame: function (anim, fx) {
                    fx.finished = 1;
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
                expect(t.css("width")).toBe("10px");
                anim.stop(1);
            });
            waits(500);
            runs(function () {
                expect(t.css("width")).toBe("10px");
                t.remove();
            });
        });
    });
});

/**
 * test case for anim queue
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom, Anim, Node) {
    return {
        run: function () {
            var $ = Node.all;
            var ANIM_KEY = Anim.Q.queueCollectionKey;
            describe("anim-queue", function () {
                beforeEach(function () {
                    this.addMatchers({
                        toBeAlmostEqual: function (expected) {
                            return Math.abs(parseInt(this.actual) - parseInt(expected)) < 20;
                        },


                        toBeEqual: function (expected) {
                            return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                        }
                    });
                });

                function padding(s) {
                    if (s.length == 1)
                        return "0" + s;
                    return s;
                }

                function normalizeColor(c) {
                    if (c.toLowerCase().lastIndexOf("rgb(") == 0) {
                        var x = [];
                        c.replace(/\d+/g, function (m) {
                            x.push(padding(Number(m).toString(16)));
                        });
                        c = "#" + x.join("");
                    } else if (c.length == 4) {
                        c = c.replace(/[^#]/g, function (c) {
                            return c + c;
                        });
                    }
                    return c;
                }

                var test;
                beforeEach(function () {
                    test = $("<div style='width: 100px;" +
                        "height: 100px;" +
                        "border: 1px solid red;'></div>").appendTo('body');
                });

                afterEach(function () {
                    test.remove();
                });

                /**
                 *  default : all anims are in the default queue (one for each element)
                 */
                it("should support queue", function () {
                    var width = test.width(),
                        height = test.height();

                    test.animate({
                        width: "200px"
                    }, {
                        duration: 0.3
                    }).animate({
                            height: "200px"
                        }, {
                            duration: 0.3
                        });

                    waits(100);

                    runs(function () {
                        expect(test.width()).not.toBe(width);
                        expect(test.height()).toBe(height);
                    });

                    waits(800);

                    runs(function () {
                        expect(test.isRunning()).toBeFalsy();
                        var anims = test.data(ANIM_KEY);
                        expect(test.hasData(ANIM_KEY)).toBe(false);
                        expect(anims).toBe(undefined);
                    });
                });

                it('support wait queue', function () {
                    var t = $('<div></div>');
                    var time = 0;
                    var start = S.now();
                    t.animate({}, {
                        duration: 0.2
                    })
                        .animate({}, {
                            duration: 0.2,
                            complete: function () {
                                time = S.now() - start;
                            }
                        });
                    waitsFor(function () {
                        return time;
                    });
                    runs(function () {
                        expect(time).toBeGreaterThan(200);
                    });
                });

                it("should support single anim stoppage", function () {
                    var width = test.width(),
                        width2,
                        height = test.height();

                    var anim1 = Anim(test[0], {
                        width: "200px"
                    }, {
                        duration: 0.3
                    }).run();

                    test.animate({
                        height: "200px"
                    }, {
                        duration: 0.3
                    });

                    waits(100);

                    runs(function () {
                        expect(width2 = test.width()).not.toBe(width);
                        expect(test.height()).toBe(height);
                        anim1.stop();
                    });

                    waits(800);

                    runs(function () {
                        expect(test.isRunning()).toBeFalsy();
                        var anims = test.data(ANIM_KEY);
                        expect(test.hasData(ANIM_KEY)).toBe(false);
                        expect(anims).toBe(undefined);

                        expect(test.width()).not.toBe(200);
                        expect(test.width()).toBe(width2);
                        expect(test.height()).toBe(200);
                    });
                });

                it("can ignore queue", function () {
                    var width = test.width(),
                        height = test.height();
                    test.animate({
                        width: "200px"
                    }, {
                        duration: 0.1,
                        queue: false
                    }).animate({
                            height: "200px"
                        }, {
                            duration: 0.1,
                            queue: false
                        });

                    waits(100);

                    runs(function () {
                        expect(test.width()).not.toBe(width);
                        expect(test.height()).not.toBe(height);
                    });

                    waits(200);

                    runs(function () {
                        expect(test.isRunning()).toBeFalsy();
                        var anims = test.data(ANIM_KEY);
                        expect(test.hasData(ANIM_KEY)).toBe(false);
                        expect(anims).toBe(undefined);
                    });
                });

                it("should support multiple queue", function () {
                    var
                        width = test.width(),
                        height = test.height();
                    test.animate({
                        width: "200px"
                    }, {
                        duration: 0.1,
                        queue: "now"
                    }).animate({
                            height: "200px"
                        }, {
                            duration: 0.1,
                            queue: "before"
                        });

                    waits(100);

                    runs(function () {
                        expect(test.width()).not.toBe(width);
                        expect(test.height()).not.toBe(height);
                    });

                    waits(200);

                    runs(function () {
                        expect(test.isRunning()).toBeFalsy();
                        var anims = test.data(ANIM_KEY);
                        expect(test.hasData(ANIM_KEY)).toBe(false);
                        expect(anims).toBe(undefined);
                    });
                });

                it("should support specified queue stoppage", function () {
                    var width = test.width(),
                        height = test.height();

                    test.animate({
                        width: "200px"
                    }, {
                        duration: 0.2,
                        queue: "now"
                    }).animate({
                            height: "200px"
                        }, {
                            duration: 0.2,
                            queue: "before"
                        });

                    test.animate({
                        width: "300px"
                    }, {
                        duration: 0.2,
                        queue: "now"
                    }).animate({
                            height: "300px"
                        }, {
                            duration: 0.2,
                            queue: "before"
                        });

                    waits(100);

                    runs(function () {
                        test.stop(0, 1, "now");
                        expect(test.width()).not.toBe(width);
                        expect(test.height()).not.toBe(height);
                    });

                    waits(600);

                    runs(function () {
                        expect(test.isRunning()).toBeFalsy();
                        var anims = test.data(ANIM_KEY);
                        expect(test.hasData(ANIM_KEY)).toBe(false);
                        expect(anims).toBe(undefined);
                        expect(test.width()).not.toBe(300);
                        expect(test.height()).toBe(300);
                    });
                });


                it("should support stopping current anim in specified queue ", function () {
                    var width2,
                        width = test.width(),
                        height = test.height();
                    test.animate({
                        width: "200px"
                    }, {
                        duration: 0.3,
                        queue: "now"
                    }).animate({
                            height: "200px"
                        }, {
                            duration: 0.3,
                            queue: "before"
                        });

                    test.animate({
                        width: "300px"
                    }, {
                        callback: function () {
                        },
                        duration: 0.1,
                        queue: "now"
                    });

                    test.animate({
                        height: "300px"
                    }, {
                        duration: 0.1,
                        queue: "before"
                    });

                    waits(100);

                    runs(function () {
                        test.stop(0, 0, "now");
                        expect(width2 = test.width()).not.toBe(width);
                        expect(test.height()).not.toBe(height);
                    });

                    waits(600);

                    runs(function () {
                        expect(test.isRunning()).toBeFalsy();
                        var anims = test.data(ANIM_KEY);
                        expect(test.hasData(ANIM_KEY)).toBe(false);
                        expect(anims).toBe(undefined);
                        expect(test.width()).toBe(300);
                        expect(test.height()).toBe(300);
                    });
                });

                it("should support stopping any queue in the middle", function () {
                    var width = test.width(),
                        height = test.height();
                    test.animate({
                        width: "200px"
                    }, {
                        duration: 0.3,
                        queue: "now"
                    }).animate({
                            height: "200px"
                        }, {
                            duration: 0.3,
                            queue: "before"
                        }).animate({
                            width: "300px"
                        }, {
                            duration: 0.1,
                            queue: "now"
                        }).animate({
                            height: "300px"
                        }, {
                            duration: 0.1,
                            queue: "before"
                        });

                    waits(150);

                    runs(function () {
                        test.stop(0, 1);
                        expect(test.width()).not.toBe(width);
                        expect(test.height()).not.toBe(height);
                    });

                    waits(600);
                    runs(function () {
                        expect(test.isRunning()).toBeFalsy();
                        expect(test.width()).not.toBe(width);
                        expect(test.height()).not.toBe(height);
                        expect(test.width()).not.toBe(200);
                        expect(test.height()).not.toBe(200);
                        expect(test.width()).not.toBe(300);
                        expect(test.height()).not.toBe(300);
                        var anims = test.data(ANIM_KEY);
                        expect(test.hasData(ANIM_KEY)).toBe(false);
                        expect(anims).toBe(undefined);
                    });
                });

                it("should support stopping any queue and set value to end right away", function () {
                    test.css({
                        width: 10,
                        height: 10
                    });

                    test.animate({
                        width: "200px"
                    }, {
                        duration: 0.2,
                        queue: "now"
                    }).animate({
                            height: "200px"
                        }, {
                            duration: 0.2,
                            queue: "before"
                        }).animate({
                            width: "300px"
                        }, {
                            duration: 0.2,
                            queue: "now"
                        }).animate({
                            height: "300px"
                        }, {
                            duration: 0.2,
                            queue: "before"
                        });

                    waits(120);

                    runs(function () {
                        test.stop(1, 1);
                        expect(test.width()).toBe(200);
                        expect(test.height()).toBe(200);
                    });
                    waits(300);
                    runs(function () {
                        expect(test.isRunning()).toBeFalsy();
                        expect(test.width()).toBe(200);
                        expect(test.height()).toBe(200);
                        var anims = test.data(ANIM_KEY);
                        expect(test.hasData(ANIM_KEY)).toBe(false);
                        expect(anims).toBe(undefined);
                    });
                });

                it("should keeping inline style clean", function () {
                    test.hide(0.2);
                    waits(800);
                    runs(function () {
                        expect(test.isRunning()).toBeFalsy();
                        expect(test.style('height')).toBe("100px");
                        var anims = test.data(ANIM_KEY);
                        expect(test.hasData(ANIM_KEY)).toBe(false);
                        expect(anims).toBe(undefined);
                    });
                });

                if (1) {
                    return;
                }

                it("should not exist memory leak", function () {
                    test.show();
                    test.hide(1);
                    waits(100);
                    runs(function () {
                        expect(test.isRunning()).toBeTruthy();
                        test.stop();
                        var anims = test.data(ANIM_KEY);
                        // stop 后清空
                        expect(test.hasData(ANIM_KEY)).toBe(false);
                        expect(anims).toBe(undefined);
                    });
                    runs(function () {
                        test.hide(0.1);
                    });

                    waits(200);

                    runs(function () {
                        expect(test.isRunning()).toBeFalsy();
                        var anims = test.data(ANIM_KEY);
                        // stop 后清空
                        expect(test.hasData(ANIM_KEY)).toBe(false);
                        expect(anims).toBe(undefined);
                    });
                });

                it("sync running with queue", function () {
                    test.slideDown();
                    test.slideUp(0.2);
                    waits(300);
                    runs(function () {
                        expect(test.css("display")).toBe("none");
                    });
                });
            });
        }};
}, {
    requires: ['dom', 'anim', 'node']
});
/**
 * anim advanced usage tc
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,anim,node", function (S, DOM, Anim, Node) {
    var $ = Node.all;
    var ANIM_KEY = Anim.Q.queueCollectionKey;
    describe("advanced usage", function () {

        var test = $('#test2');
        afterEach(function () {
            test = $('#test2');
            test.remove();
            test = $("<div id='test2'></div>").appendTo("body");
        });

        it('support different easing for different property', function () {
            var div = $('<div style="position:absolute;left:0;top:0;"></div>').prependTo('body');
            div.animate({
                left: {
                    value: 100,
                    easing: function () {
                        return 0.5;
                    }
                },
                top: {
                    value: 100,
                    easing: function () {
                        return 0.2;
                    }
                }
            }, {
                duration: 2
            });

            waits(1000);

            runs(function () {
                expect(parseInt(div.css('top'))).toBe(20);
                expect(parseInt(div.css('left'))).toBe(50);
            });

            waits(1500);

            runs(function () {
                expect(parseInt(div.css('top'))).toBe(100);
                expect(parseInt(div.css('left'))).toBe(100);
                div.remove();
            });
        });

        /**
         *  default : all anims are in the default queue (one for each element)
         */
        it("should support queue", function () {

            var width = test.width(),
                height = test.height();

            test.animate({
                width: 200
            }, {
                duration: 0.1
            }).animate({
                    height: 200
                }, {
                    duration: 0.1
                });

            waits(100);

            runs(function () {
                expect(test.width()).not.toBe(width);
                expect(test.height()).toBe(height);
            });

            waits(300);

            runs(function () {
                expect(test.isRunning()).toBeFalsy();
                var anims = test.data(ANIM_KEY);
                expect(test.hasData(ANIM_KEY)).toBe(false);
                expect(anims).toBe(undefined);
            });
        });

        it("should support single anim stoppage", function () {

            var width = test.width(),
                width2,
                dtest = test[0],
                height = test.height();

            var anim1 = Anim(dtest, {
                width: 200
            }, {
                duration: 0.3
            }).run();

            test.animate({
                height: 200
            }, {
                duration: 0.3
            });

            waits(100);

            runs(function () {
                expect(width2 = test.width()).not.toBe(width);
                expect(test.height()).toBe(height);
                anim1.stop();
            });

            waits(600);

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
                width: 200
            }, {
                duration: 0.1,
                queue: false
            }).animate({
                    height: 200
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
                width: 200
            }, {
                duration: 0.1,
                queue: "now"
            }).animate({
                    height: 200
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
            var
                width = test.width(),
                height = test.height();
            test.animate({
                width: 200
            }, {
                duration: 0.1,
                queue: "now"
            }).animate({
                    height: 200
                }, {
                    duration: 0.1,
                    queue: "before"
                }).animate({
                    width: 300
                }, {
                    duration: 0.1,
                    queue: "now"
                }).animate({
                    height: 300
                }, {
                    duration: 0.1,
                    queue: "before"
                });

            waits(100);

            runs(function () {
                test.stop(0, 1, "now");
                expect(test.width()).not.toBe(width);
                expect(test.height()).not.toBe(height);
            });

            waits(400);

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
                width: 200
            }, {
                duration: 0.3,
                queue: "now"
            }).animate({
                    height: 200
                }, {
                    duration: 0.3,
                    queue: "before"
                });

            test.animate({
                width: 300
            }, {
                callback: function () {
                },
                duration: 0.1,
                queue: "now"
            });

            test.animate({
                height: 300
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

            var
                width = test.width(),
                height = test.height();
            test.animate({
                width: 200
            }, {
                duration: 0.3,
                queue: "now"
            }).animate({
                    height: 200
                }, {
                    duration: 0.3,
                    queue: "before"
                }).animate({
                    width: 300
                }, {
                    duration: 0.1,
                    queue: "now"
                }).animate({
                    height: 300
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
                width: 200
            }, {
                duration: 0.2,
                queue: "now"
            }).animate({
                    height: 200
                }, {
                    duration: 0.2,
                    queue: "before"
                }).animate({
                    width: 300
                }, {
                    duration: 0.2,
                    queue: "now"
                }).animate({
                    height: 300
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
            waits(300);
            runs(function () {
                expect(test.isRunning()).toBeFalsy();
                expect(test.style("height")).toBe("");
                var anims = test.data(ANIM_KEY);
                expect(test.hasData(ANIM_KEY)).toBe(false);
                expect(anims).toBe(undefined);
            });
        });

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

        describe('frame config', function () {
            it("should call frame", function () {
                var stoppedCalled = 0,
                    t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo("body");
                var anim = new Anim(t, {
                    width: 10
                }, {
                    duration: 1,
                    frame: function (_,fx) {
                        if (fx.pos == 1) {
                            stoppedCalled = 1;
                        }
                        t.css("height", fx.from + fx.pos * (fx.to - fx.from));
                    }
                });

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
                    frame: function (_,fx) {
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
                waits(325);
                runs(function () {
                    expect(t.css("width")).toBe("10px");
                    t.remove();
                });
                waits(300);
                runs(function () {
                    expect(called).toBe(1);
                    expect(t.css("width")).toBe("10px");
                    t.remove();
                });
            });

            it("frame can call stop", function () {
                var t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo("body");
                var called = 0;
                var calledComplete=0;
                var anim = new Anim(t, {
                    width: 10,
                    height: 10
                }, {
                    duration: 0.5,
                    frame: function (_,fx) {
                        if (fx.pos > 0.5) {
                            called++;
                            anim.stop();
                        }
                    },
                    complete:function(){
                        calledComplete++;
                    }
                });
                anim.run();
                waits(325);
                runs(function () {
                    expect(called).toBe(1);
                    expect(t.css("width")).not.toBe("10px");
                });
                waits(300);
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
                        return Anim.PreventDefaultUpdate;
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
                    frame: function () {
                        return Anim.StopToEnd | Anim.PreventDefaultUpdate;
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
                    frame: function () {
                        return Anim.StopToEnd;
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


        it('support fx extension', function () {

            if (!S.UA.webkit) {
                return;
            }

            var div = $('<div></div>')
                .prependTo('body');

            div.animate({
                '-webkit-transform': {
                    easing: 'linear',
                    fx: {
                        frame: function (anim, fx) {
                            div.css(fx.prop, 'translate(' +
                                (100 * fx.pos) + 'px,' +
                                (100 * fx.pos) + 'px' + ')');
                        }
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
    });
});
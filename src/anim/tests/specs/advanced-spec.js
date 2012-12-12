/**
 * anim advanced usage tc ( queue management)
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

        /**
         *  default : all anims are in the default queue (one for each element)
         */
        it("should support queue", function () {


            var width = test.width(),
                height = test.height();
            test.animate({
                width:200
            }, {
                duration:0.1
            }).animate({
                    height:200
                }, {
                    duration:0.1
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
                width:200
            }, {
                duration:0.3
            }).run();

            test.animate({
                height:200
            }, {
                duration:0.3
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
                width:200
            }, {
                duration:0.1,
                queue:false
            }).animate({
                    height:200
                }, {
                    duration:0.1,
                    queue:false
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
                width:200
            }, {
                duration:0.1,
                queue:"now"
            }).animate({
                    height:200
                }, {
                    duration:0.1,
                    queue:"before"
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
                width:200
            }, {
                duration:0.1,
                queue:"now"
            }).animate({
                    height:200
                }, {
                    duration:0.1,
                    queue:"before"
                }).animate({
                    width:300
                }, {
                    duration:0.1,
                    queue:"now"
                }).animate({
                    height:300
                }, {
                    duration:0.1,
                    queue:"before"
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
                width:200
            }, {
                duration:0.3,
                queue:"now"
            }).animate({
                    height:200
                }, {
                    duration:0.3,
                    queue:"before"
                });

            test.animate({
                width:300
            }, {
                callback:function () {
                },
                duration:0.1,
                queue:"now"
            });

            test.animate({
                height:300
            }, {
                duration:0.1,
                queue:"before"
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
                width:200
            }, {
                duration:0.3,
                queue:"now"
            }).animate({
                    height:200
                }, {
                    duration:0.3,
                    queue:"before"
                }).animate({
                    width:300
                }, {
                    duration:0.1,
                    queue:"now"
                }).animate({
                    height:300
                }, {
                    duration:0.1,
                    queue:"before"
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
                width:10,
                height:10
            });

            test.animate({
                width:200
            }, {
                duration:0.2,
                queue:"now"
            }).animate({
                    height:200
                }, {
                    duration:0.2,
                    queue:"before"
                }).animate({
                    width:300
                }, {
                    duration:0.2,
                    queue:"now"
                }).animate({
                    height:300
                }, {
                    duration:0.2,
                    queue:"before"
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

        it("should call frame", function () {
            var stoppedCalled = 0,
                t = $("<div style='height:100px;width:100px;overflow: hidden;'></div>").appendTo("body");
            var anim = new Anim(t, {
                width:10
            }, {
                duration:1,
                frame:function (fx, stop) {
                    var end = fx.frame(stop);
                    if (stop) {
                        stoppedCalled = 1;
                    }
                    t.css("height", fx.cur());
                    return end;
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
    });
});
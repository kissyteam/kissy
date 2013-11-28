/**
 * test case for anim pause/resume
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, _, Anim) {
    var $ = S.all;
    describe("anim pause/resume", function () {

        it("anim-pause/resume works", function () {

            var div = $("<div style='width:100px;height: 100px;" +
                "overflow:hidden;'></div>")
                .appendTo('body');

            var anim = Anim(div[0], {
                width:"10px",
                height:"10px"
            }, {
                duration:0.4
            }).run();

            var width, height;

            waits(100);

            runs(function () {
                anim.pause();
                expect(anim.isPaused()).toBeTruthy();
                expect(anim.isRunning()).toBeFalsy();
                expect(div.isRunning()).toBeFalsy();
                expect(div.isPaused()).toBeTruthy();
                width = div.width();
                height = div.height();
                expect(width).not.toBe(100);
                expect(width).not.toBe(100);
                expect(width).not.toBe(10);
                expect(width).not.toBe(10);
            });
            waits(100);
            runs(function () {
                expect(div.width()).toBe(width);
                expect(div.height()).toBe(height);
                anim.resume();
                expect(anim.isPaused()).toBeFalsy();
                expect(anim.isRunning()).toBeTruthy();
                expect(div.isRunning()).toBeTruthy();
                expect(div.isPaused()).toBeFalsy();
            });
            waits(600);
            runs(function () {
                expect(div.width()).toBe(10);
                expect(div.height()).toBe(10);
                expect(anim.isPaused()).toBeFalsy();
                expect(anim.isRunning()).toBeFalsy();
                expect(div.isRunning()).toBeFalsy();
                expect(div.isPaused()).toBeFalsy();
            });

        });


        it("works on node", function () {

            var div = $("<div style='width:100px;" +
                // ie6 撑破
                "overflow:hidden;" +
                "height: 100px;'></div>").appendTo('body');

            div.animate({
                width:"10px",
                height:"10px"
            }, {
                duration:0.4
            });

            var width, height;

            waits(100);

            runs(function () {
                div.pause();
                expect(div.isRunning()).toBeFalsy();
                expect(div.isPaused()).toBeTruthy();
                width = div.width();
                height = div.height();
                expect(width).not.toBe(100);
                expect(width).not.toBe(100);
                expect(width).not.toBe(10);
                expect(width).not.toBe(10);
            });
            waits(100);
            runs(function () {
                expect(div.width()).toBe(width);
                expect(div.height()).toBe(height);
                div.resume();

                expect(div.isRunning()).toBeTruthy();
                expect(div.isPaused()).toBeFalsy();
            });
            waits(600);
            runs(function () {
                expect(div.width()).toBe(10);
                expect(div.height()).toBe(10);
                expect(div.isRunning()).toBeFalsy();
                expect(div.isPaused()).toBeFalsy();
            });

        });

    });

},{
    requires:['node','anim']
});
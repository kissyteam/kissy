/**
 * width/height tc
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,anim,node", function (S, DOM, Anim, Node) {
    var $ = Node.all;
    describe("anim width", function () {

        it("works", function () {

            var div = $("<div style='border:1px solid red;'>" +
                "<div style='width:100px;height: 100px;'>" +
                "</div>" +
                "</div>").appendTo("body");

            // width height 特殊，
            // ie6 需要设置 overflow:hidden
            // 否则动画不对
            div.css({
                height: 0,
                width: 0
            }).animate({
                    height: 100,
                    width: 100
                }, {
                    duration: 0.2,
                    complete: function () {
                        div.remove();
                    }
                });

            expect(div.height()).toBe(0);
            expect(div.width()).toBe(0);
            waits(100);
            runs(function () {
                // overflow hidden ie6 没设好
                // https://github.com/kissyteam/kissy/issues/146
                expect(div.height()).not.toBe(100);
                expect(div.width()).not.toBe(100);
                expect(div.height()).not.toBe(0);
                expect(div.width()).not.toBe(0);
            });
            waits(200);
            runs(function () {
                expect(div.height()).toBe(100);
                expect(div.width()).toBe(100);
            });

        });


        it("works for string props", function () {

            var div = $("<div style='border:1px solid red;'>" +
                "<div style='width:100px;height: 100px;'>" +
                "</div>" +
                "</div>").appendTo("body");

            // width height 特殊，
            // ie6 需要设置 overflow:hidden
            // 否则动画不对
            div.css({
                opacity: 0
            }).animate(" width: 0; opacity: 1;", {
                    duration: 0.2,
                    complete: function () {
                        div.remove();
                    }
                });

            waits(100);
            runs(function () {
                expect(parseInt(div.css('opacity'))).not.toBe(1);
            });

            waits(200);
            runs(function () {
                expect(parseInt(div.css('opacity'))).toBe(1);
            });

        });

    });
});
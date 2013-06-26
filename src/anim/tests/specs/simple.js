/**
 * test case for simple anim
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom, Anim, Node) {

    return {run: function () {
        var $ = Node.all;

        describe("anim-simple", function () {

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

            it("should start and end anim properly", function () {
                var test1 = Dom.create('<div style="position: absolute;' +
                    ' text-align: center;' +
                    'overflow: hidden">^o^</div>');
                Dom.append(test1, 'body');
                Dom.css(test1, {
                    //'border-color':"#000",
                    width: "10px",
                    height: "20px",
                    left: "120px",
                    top: "20px",
                    color: "#000"
                });
                var initColor = normalizeColor(Dom.css(test1, "border-color"));

                var anim = new Anim(test1, {
                        'background-color': '#fcc',
                        //'border': '5px dashed #999',
                        'border-width': '5px',
                        'border-color': "#999999",
                        'border-style': "dashed",
                        'width': '100px',
                        'height': '50px',
                        'left': '900px',
                        'top': '285px',
                        'opacity': '.5',
                        'font-size': '48px',
                        'padding': '30px 0',
                        'color': '#FF3333'
                    },
                    0.5
                );

                anim.run();

                waits(100);

                runs(function () {


                    expect(normalizeColor(Dom.css(test1, "borderTopColor")))
                        .not.toBe(initColor);
                    expect(Dom.css(test1, "width")).not.toBe("10px");
                    expect(Dom.css(test1, "height")).not.toBe("20px");
                    expect(Dom.css(test1, "left")).not.toBe("120px");
                    expect(Dom.css(test1, "top")).not.toBe("20px");


                });

                waits(800);
                runs(function () {
                    expect(normalizeColor(Dom.style(test1, "border-color")))
                        .toBe("#999999");
                    expect(parseInt(Dom.css(test1, "width"))).toBeEqual(100);
                    expect(parseInt(Dom.css(test1, "height"))).toBeEqual(50);
                    expect(Dom.css(test1, "left")).toBe("900px");
                    expect(Dom.css(test1, "top")).toBe("285px");
                    Dom.remove(test1);
                });

            });

            it('support different easing for different property', function () {
                if (S.config('anim/useTransition')) {
                    // native does not support easing as function
                    return;
                }
                var div = $('<div style="position:absolute;left:0;top:0;"></div>')
                    .prependTo('body');
                div.animate({
                    left: {
                        value: "100px",
                        easing: function () {
                            return 0.5;
                        }
                    },
                    top: {
                        value: "100px",
                        easing: function () {
                            return 0.2;
                        }
                    }
                }, {
                    duration: 0.3
                });

                waits(100);

                runs(function () {
                    expect(parseInt(div.css('top'))).toBe(20);
                    expect(parseInt(div.css('left'))).toBe(50);
                });

                waits(600);

                runs(function () {
                    expect(parseInt(div.css('top'))).toBe(100);
                    expect(parseInt(div.css('left'))).toBe(100);
                    div.remove();
                });
            });


            it("works for width/height", function () {

                var div = $("<div style='border:1px solid red;'>" +
                    "<div style='width:100px;height: 100px;'>" +
                    "</div>" +
                    "</div>").appendTo("body");

                // width height 特殊，
                // ie6 需要设置 overflow:hidden
                // 否则动画不对
                div.css({
                    height: 0,
                    width: 0,
                    overflow: 'hidden'
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
                });
                div.animate(" width: 0; opacity: 1;", {
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
    }};
}, {
    requires: ['dom', 'anim', 'node']
});
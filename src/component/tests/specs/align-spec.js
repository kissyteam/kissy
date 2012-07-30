KISSY.use("component", function (S, Component) {
    var Align = Component.UIBase.Align;
    var DOM = S.DOM;
    var $ = S.all;
    describe("uibase-align", function () {

        it("unified getOffsetParent method", function () {
            var getOffsetParent = Align.__getOffsetParent;
            var test = [];
            test[0] = "<div><div></div></div>";

            test[1] = "<div><div style='position: relative;'></div></div>";

            test[2] = "<div>" +
                "<div>" +
                "<div style='position: absolute;'></div>" +
                "</div>" +
                "</div>";

            test[3] = "<div style='position: relative;'>" +
                "<div>" +
                "<div style='position: absolute;'></div>" +
                "</div>" +
                "</div>";

            var dom = [];

            for (var i = 0; i < 4; i++) {
                dom[i] = DOM.create(test[i]);
                DOM.append(dom[i], "body");
            }

            expect(getOffsetParent(dom[0].firstChild)).toBe(dom[0]);
            expect(getOffsetParent(dom[1].firstChild)).toBe(dom[1]);
            expect(getOffsetParent(dom[2].firstChild.firstChild)).toBe(null);
            expect(getOffsetParent(dom[3].firstChild.firstChild)).toBe(dom[3]);

            for (i = 0; i < 4; i++) {
                DOM.remove(dom[i]);
            }
        });

        it("getVisibleRectForElement works", function () {


            var gap = DOM.create("<div style='height: 1500px;width: 100000px;'></div>");
            DOM.append(gap, "body");

            var getVisibleRectForElement = Align.__getVisibleRectForElement,
                test = [];

            test[0] = "<div><div></div></div>";

            test[1] = "<div style='width: 100px;height: 100px;overflow: hidden;'>" +
                "<div style='position: relative;'></div></div>";

            test[2] = "<div style='width: 100px;height: 100px;overflow: hidden;'>" +
                "<div>" +
                "<div style='position: absolute;'></div>" +
                "</div>" +
                "</div>";

            test[3] = "<div style='position: relative;width: 100px;" +
                "height: 100px;overflow: hidden;'>" +
                "<div>" +
                "<div style='position: absolute;'></div>" +
                "</div>" +
                "</div>";

            var dom = [];

            for (var i = 3; i >= 0; i--) {
                dom[i] = DOM.create(test[i]);
                DOM.prepend(dom[i], "body");
            }



            // 1
            window.scrollTo(10, 10);


            var right = 10 + DOM.viewportWidth(),
                rect,
                bottom = 10 + DOM.viewportHeight();

            rect = getVisibleRectForElement(dom[0].firstChild);
            expect(rect).toEqual({
                left:10,
                top:10,
                right:right,
                bottom:bottom
            });

            window.scrollTo(200, 200);
            rect = getVisibleRectForElement(dom[0].firstChild);
            expect(rect).toEqual({
                left:200,
                top:200,
                right:200 + DOM.viewportWidth(),
                bottom:200 + DOM.viewportHeight()
            });
            DOM.remove(dom[0]);


            // 2
            window.scrollTo(10, 10);
            rect = getVisibleRectForElement(dom[1].firstChild);
            expect(rect).toEqual({
                left:10,
                top:10,
                right:100,
                bottom:100
            });

            window.scrollTo(200, 200);
            rect = getVisibleRectForElement(dom[1].firstChild);
            expect(rect).toBe(null);
            DOM.remove(dom[1]);


            // 3
            window.scrollTo(10, 10);
            rect = getVisibleRectForElement(dom[2].firstChild);
            expect(rect).toEqual({
                left:10,
                top:10,
                right:100,
                bottom:100
            });

            window.scrollTo(200, 200);
            rect = getVisibleRectForElement(dom[2].firstChild);
            expect(rect).toBe(null);
            DOM.remove(dom[2]);


            // 4
            window.scrollTo(10, 10);
            rect = getVisibleRectForElement(dom[3].firstChild);
            expect(rect).toEqual({
                left:10,
                top:10,
                right:100,
                bottom:100
            });

            window.scrollTo(200, 200);
            rect = getVisibleRectForElement(dom[3].firstChild);
            expect(rect).toBe(null);
            DOM.remove(dom[3]);


            DOM.remove(gap);


            waits(200);
            runs(function () {
                window.scrollTo(0, 0);
            });

        });

        describe("auto align", function () {
            it("should not auto adjust if current position is right", function () {
                var node,
                    alignPrototype = Align.prototype;

                (function () {


                    node = $("<div style='position: absolute;left:0;top:0;" +
                        "width: 100px;height: 100px;" +
                        "overflow: hidden'>" +
                        "<div style='position: absolute;" +
                        "width: 50px;" +
                        "height: 50px;'>" +
                        "</div>" +
                        "<div style='position: absolute;left:0;top:20px;'></div>" +
                        "<div style='position: absolute;left:0;top:80px;'></div>" +
                        "</div>").appendTo("body");

                    var target = node.first(),
                        upper = node.children().item(1),
                        lower = node.children().item(2);

                    var obj = {
                        get:function (arg) {
                            if (arg == "el") {
                                return target;
                            }
                            else  if (arg == "view") {
                               return {
                                   __set:function(){}
                               };
                            }
                            else {
                                alert('error')
                            }
                        },
                        __set:function(){},
                        set:function (arg, v) {
                            if (arg == "x") {
                                target.offset({
                                    left:v
                                });
                            } else if (arg == "y") {
                                target.offset({
                                    top:v
                                });
                            }
                        }
                    };

                    var containerOffset = node.offset();

                    alignPrototype.align.call(obj,
                        lower, ["tl", "bl"], undefined, {

                    });

                    //    _____________
                    //   |             |
                    //   |______       |
                    //   |      |      |
                    //   |______|______|
                    //   |_____________|

                    expect(target.offset()).toEqual({
                        left:containerOffset.left,
                        top:containerOffset.top + 30
                    });

                    alignPrototype.align.call(obj, lower, ["bl", "tl"], undefined, {
                        adjustX:1,
                        adjustY:1
                    });

                    //    _____________
                    //   |             |
                    //   |______       |
                    //   |      |      |
                    //   |______|______|
                    //   |_____________|
                    // flip 然后 ok
                    expect(target.offset()).toEqual({
                        left:containerOffset.left,
                        top:containerOffset.top + 30
                    });

                })();


                (function () {


                    node = $("<div style='position: absolute;left:0;top:0;" +
                        "width: 100px;height: 100px;" +
                        "overflow: hidden'>" +
                        "<div style='position: absolute;" +
                        "width: 50px;" +
                        "height: 90px;'>" +
                        "</div>" +
                        "<div style='position: absolute;left:0;top:20px;'></div>" +
                        "<div style='position: absolute;left:0;top:80px;'></div>" +
                        "</div>").appendTo("body");

                    var target = node.first(),
                        upper = node.children().item(1),
                        lower = node.children().item(2);

                    var obj = {
                        get:function (arg) {
                            if (arg == "el") {
                                return target;
                            }
                            else  if (arg == "view") {
                                return {
                                    __set:function(){}
                                };
                            }
                            else {
                                alert('error')
                            }
                        },
                        __set:function(){},
                        set:function (arg, v) {
                            if (arg == "x") {
                                target.offset({
                                    left:v
                                });
                            } else if (arg == "y") {
                                target.offset({
                                    top:v
                                });
                            }
                        }
                    };

                    var containerOffset = node.offset();

                    alignPrototype.align.call(obj, lower, ["tl", "bl"], undefined, {

                    });
                    //   |------|
                    //   | _____|________
                    //   |      |      |
                    //   |      |      |
                    //   |      |      |
                    //   |______|______|
                    //   |_____________|

                    expect(target.offset()).toEqual({
                        left:containerOffset.left,
                        top:containerOffset.top - 10
                    });

                    alignPrototype.align.call(obj, lower, ["tl", "bl"], undefined, {
                        adjustX:1,
                        adjustY:1
                    });

                    //    _____________
                    //   |      |      |
                    //   |--- --|      |
                    //   |      |      |
                    //   |______|______|
                    //   |      |      |
                    //   |______|______|
                    // flip 不 ok，对 flip 后的 adjustY 到视窗边界
                    expect(target.offset()).toEqual({
                        left:containerOffset.left,
                        top:containerOffset.top + 10
                    });

                })();

            });
        });

    });
});

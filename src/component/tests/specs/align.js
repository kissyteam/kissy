KISSY.add(
    function (S, AlignExtension, Control) {
        var Dom = S.DOM;
        var $ = S.all;

        var AlignControl = Control.extend([AlignExtension]);

        describe("extension-align", function () {

            beforeEach(function () {
                this.addMatchers({
                    toBeAlmostEqual: function (expected) {
                        return Math.abs(parseInt(this.actual) - parseInt(expected)) < 20;
                    },

                    toBeEqualRect: function (expect) {
                        var actual = this.actual;
                        for (var i in actual) {
                            if (actual[i] - expect[i] < 5) {

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

            it("unified getOffsetParent method", function () {
                var getOffsetParent = AlignExtension.__getOffsetParent;
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
                    dom[i] = Dom.create(test[i]);
                    Dom.append(dom[i], 'body');
                }

                expect(getOffsetParent(dom[0].firstChild)).toBe(dom[0]);
                expect(getOffsetParent(dom[1].firstChild)).toBe(dom[1]);
                expect(getOffsetParent(dom[2].firstChild.firstChild)).toBe(null);
                expect(getOffsetParent(dom[3].firstChild.firstChild)).toBe(dom[3]);

                for (i = 0; i < 4; i++) {
                    Dom.remove(dom[i]);
                }
            });

            if (S.UA.ios && window.frameElement) {

            } else {
                it("getVisibleRectForElement works", function () {


                    var gap = Dom.create("<div style='height: 1500px;width: 100000px;'></div>");
                    Dom.append(gap, 'body');

                    var getVisibleRectForElement = AlignExtension.__getVisibleRectForElement,
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
                        dom[i] = Dom.create(test[i]);
                        Dom.prepend(dom[i], 'body');
                    }

                    // 1
                    window.scrollTo(10, 10);


                    var right = 10 + Dom.viewportWidth(),
                        rect,
                        bottom = 10 + Dom.viewportHeight();

                    rect = getVisibleRectForElement(dom[0].firstChild);

                    expect(rect.left).toBeEqual(10);
                    expect(rect.top).toBeEqual(10);
                    expect(rect.right).toBeEqual(right);
                    expect(rect.bottom).toBeEqual(bottom);

                    window.scrollTo(200, 200);
                    rect = getVisibleRectForElement(dom[0].firstChild);

                    expect(rect.left).toEqual(200);
                    expect(rect.bottom).toEqual(200 + Dom.viewportHeight());
                    expect(rect.top).toEqual(200);
                    expect(rect.right).toEqual(200 + Dom.viewportWidth());

                    Dom.remove(dom[0]);


                    // 2
                    window.scrollTo(10, 10);
                    rect = getVisibleRectForElement(dom[1].firstChild);
                    expect(rect).toBeEqualRect({
                        left: 10,
                        top: 10,
                        right: 100,
                        bottom: 100
                    });

                    window.scrollTo(200, 200);
                    rect = getVisibleRectForElement(dom[1].firstChild);
                    expect(rect).toBe(null);
                    Dom.remove(dom[1]);


                    // 3
                    window.scrollTo(10, 10);
                    rect = getVisibleRectForElement(dom[2].firstChild);
                    expect(rect).toBeEqualRect({
                        left: 10,
                        top: 10,
                        right: 100,
                        bottom: 100
                    });

                    window.scrollTo(200, 200);
                    rect = getVisibleRectForElement(dom[2].firstChild);
                    expect(rect).toBe(null);
                    Dom.remove(dom[2]);


                    // 4
                    window.scrollTo(10, 10);
                    rect = getVisibleRectForElement(dom[3].firstChild);
                    expect(rect).toBeEqualRect({
                        left: 10,
                        top: 10,
                        right: 100,
                        bottom: 100
                    });

                    window.scrollTo(200, 200);
                    rect = getVisibleRectForElement(dom[3].firstChild);
                    expect(rect).toBe(null);
                    Dom.remove(dom[3]);


                    Dom.remove(gap);


                    waits(200);
                    runs(function () {
                        window.scrollTo(0, 0);
                    });

                });
            }

            describe("auto align", function () {
                it("should not auto adjust if current position is right", function () {
                    var node;

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
                            "</div>").appendTo('body');

                        var target = node.first(),
                        //upper = node.children().item(1),
                            lower = node.children().item(2);

                        var obj=new AlignControl({
                            srcNode:target
                        });

                        obj.render();

                        var containerOffset = node.offset();

                        obj.align(lower, ['tl', 'bl'], undefined, {});

                        //    _____________
                        //   |             |
                        //   |______       |
                        //   |      |      |
                        //   |______|______|
                        //   |_____________|

                        expect(target.offset().left).toBeEqual(
                            containerOffset.left
                        );

                        expect(target.offset().top).toBeEqual(
                            containerOffset.top + 30
                        );

                        obj.align(lower, ['bl', 'tl'], undefined, {
                            adjustX: 1,
                            adjustY: 1
                        });

                        //    _____________
                        //   |             |
                        //   |______       |
                        //   |      |      |
                        //   |______|______|
                        //   |_____________|
                        // flip 然后 ok
                        expect(target.offset().left).toBeEqual(
                            containerOffset.left
                        );

                        expect(target.offset().top).toBeEqual(
                            containerOffset.top + 30
                        );
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
                            "</div>").appendTo('body');

                        var target = node.first(),
                        //upper = node.children().item(1),
                            lower = node.children().item(2);

                        var obj=new AlignControl({
                            srcNode:target
                        });

                        obj.render();

                        var containerOffset = node.offset();
                        obj.align(lower, ['tl', 'bl'], undefined, {

                        });
                        //   |------|
                        //   | _____|________
                        //   |      |      |
                        //   |      |      |
                        //   |      |      |
                        //   |______|______|
                        //   |_____________|

                        expect(target.offset().left).toBeEqual(
                            containerOffset.left
                        );

                        expect(target.offset().top).toBeEqual(
                            containerOffset.top - 10
                        );

                        obj.align(lower, ['tl', 'bl'], undefined, {
                            adjustX: 1,
                            adjustY: 1
                        });

                        //    _____________
                        //   |      |      |
                        //   |--- --|      |
                        //   |      |      |
                        //   |______|______|
                        //   |      |      |
                        //   |______|______|
                        // flip 不 ok，对 flip 后的 adjustY 到视窗边界
                        expect(target.offset().left).toBeEqual(
                            containerOffset.left
                        );

                        expect(target.offset().top).toBeEqual(
                            containerOffset.top + 10
                        );
                    })();

                });
            });

        });
    },{
        requires:['component/extension/align',
        'component/control']
    });

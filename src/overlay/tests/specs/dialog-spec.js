/**
 * testcases for dialog
 * @author yiminghe@gmail.com
 */
KISSY.use("ua,node,overlay,dd/plugin/constrain,component/plugin/drag",
    function (S, UA, Node, Overlay, ConstrainPlugin, DragPlugin) {
        var DOM = S.DOM, $ = Node.all;
        var Gesture = S.Event.Gesture;
        var Dialog = Overlay.Dialog;

        describe("dialog", function () {

            beforeEach(function () {
                this.addMatchers({
                    toBeEqual: function (expected) {
                        return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                    }
                });
            });

            it("头体尾已经渲染完毕", function () {

                var d = new Dialog({
                    srcNode: "#drender",
                    width: 200
                });

                d.plug(new DragPlugin({
                    handlers: ['.ks-stdmod-header']
                }).plug(new ConstrainPlugin({
                        constrain: window
                    })));

                d.render();
                d.center();
                d.show();

                expect(d.get("header").html()).toBe("prerender header");
                expect(d.get("body").html()).toBe("prerender body");
                expect(d.get("footer").html()).toBe("prerender footer");
                d.destroy();
            });

            it("create works", function () {
                var d = new Dialog({
                    width: 200,
                    closable: true,
                    bodyContent: "1",
                    headerContent: "2"
                });
                d.create();
                expect(d.get("header")).not.toBe(undefined);
                if (d.get("header")) {
                    expect(d.get("header").nodeName()).toBe("div");
                }
                expect(d.get("el").one(".ks-ext-close")).not.toBe(undefined);
                d.destroy();
            });

            describe("完全由 javascript 创建", function () {

                var d;

                it("头体尾已经渲染完毕", function () {
                    d = new Dialog({
                        headerContent: "头",
                        bodyContent: "体",
                        footerContent: "尾",
                        width: 200,
                        plugins: [
                            new DragPlugin({
                                handlers: ['.ks-stdmod-header'],
                                plugins: [new ConstrainPlugin({
                                    constrain: true
                                })]
                            })
                        ]
                    });

                    d.render();
                    d.center();
                    d.show();
                    expect(d.get("header").html()).toBe("头");
                    expect(d.get("body").html()).toBe("体");
                    expect(d.get("footer").html()).toBe("尾");
                });

                if (UA.ie !== 9) {
                    it("应该可以拖动", function () {
                        var xy = d.get("xy");

                        waits(100);

                        runs(function () {
                            jasmine.simulateForDrag(d.get("header")[0], Gesture.start, {

                                clientX: xy[0] + 10,
                                clientY: xy[1] + 10
                            });
                        });

                        waits(100);
                        runs(function () {
                            jasmine.simulateForDrag(document, Gesture.move, {

                                clientX: xy[0] + 150,
                                clientY: xy[1] + 150
                            });
                        });
                        waits(100);
                        runs(function () {

                            jasmine.simulateForDrag(document, Gesture.move, {

                                clientX: xy[0] + 100,
                                clientY: xy[1] + 100
                            });

                        });

                        waits(100);

                        runs(function () {
                            jasmine.simulateForDrag(document, Gesture.end);
                        });

                        runs(function () {
                            var dxy = d.get("xy");

                            expect(dxy[0] - xy[0]).toBeEqual(90);
                            expect(dxy[1] - xy[1]).toBeEqual(90);
                        });

                    });
                }


                if ((UA.ie == 7 || UA.ie == 8) &&
                    window.frameElement ||
                    UA.ie == 9) {
                    return;
                }

                it("只能在当前视窗范围拖动", function () {

                    var xy = d.get("xy");

                    jasmine.simulateForDrag(d.get("header")[0], Gesture.start, {
                        clientX: xy[0] + 10,
                        clientY: xy[1] + 10
                    });

                    waits(100);
                    runs(function () {

                        jasmine.simulateForDrag(document, Gesture.move, {
                            clientX: xy[0] + 15,
                            clientY: xy[1] + 15
                        });

                    });
                    waits(100);
                    runs(function () {

                        jasmine.simulateForDrag(document, Gesture.move, {

                            clientX: xy[0] + DOM.viewportWidth(),
                            clientY: xy[1] + DOM.viewportHeight()
                        });

                    });

                    waits(100);

                    runs(function () {
                        jasmine.simulateForDrag(document, Gesture.end);
                    });
                    waits(100);

                    runs(function () {
                        var dxy = d.get("xy"),
                            width = d.get("el").outerWidth(),
                            height = d.get("el").outerHeight();

                        expect(DOM.viewportWidth() - width).toBeEqual(dxy[0]);
                        expect(DOM.viewportHeight() - height).toBeEqual(dxy[1]);
                    });

                    runs(function () {
                        d.destroy();
                    });
                });

            });

        });
    });
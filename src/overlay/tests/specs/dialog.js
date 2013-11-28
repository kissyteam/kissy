/**
 * test cases for dialog
 * @author yiminghe@gmail.com
 */
KISSY.add(
    function (S, Event, UA, Node, Overlay, ConstrainPlugin, DragPlugin) {
        var Dom = S.DOM, $ = Node.all;
        var Gesture = Event.Gesture;
        var Dialog = Overlay.Dialog;
        var ie = S.UA.ieMode;

        describe("dialog", function () {

            beforeEach(function () {
                this.addMatchers({
                    toBeEqual: function (expected) {
                        return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                    }
                });
            });

            describe('srcNode', function () {

            });

            it("头体尾已经渲染完毕", function () {

                var srcNode = $('<div class="ks-overlay ks-dialog"' +
                    ' style="width:200px">' +
                    '<div class="ks-dialog-content">' +
                    '<div class="ks-dialog-header">header</div>' +
                    '<div class="ks-dialog-body">body</div>' +
                    '<div class="ks-dialog-footer">footer</div>' +
                    '</div>' +
                    '</div>').prependTo('body');

                var d = new Dialog({
                    srcNode: srcNode
                });

                d.plug(new DragPlugin({
                    handlers: ['.ks-dialog-header']
                }).plug(new ConstrainPlugin({
                        constrain: window
                    })));

                d.render();
                d.center();
                d.show();

                expect(d.get("header").html()).toBe("header");
                expect(d.get('body').html()).toBe('body');
                expect(d.get("footer").html()).toBe("footer");
                expect(d.get("headerContent")).toBe("header");
                expect(d.get("bodyContent")).toBe('body');
                expect(d.get("footerContent")).toBe("footer");
                d.destroy();
            });


            describe("完全由 javascript 创建", function () {
                var d;

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
                        expect(d.get("header").nodeName()).toBe('div');
                    }
                    expect(d.get('el').one(".ks-overlay-close")).not.toBe(undefined);
                    d.destroy();
                });

                it("头体尾已经渲染完毕", function () {
                    d = new Dialog({
                        headerContent: "头",
                        bodyContent: "体",
                        footerContent: "尾",
                        width: 200,
                        plugins: [
                            new DragPlugin({
                                handlers: ['.ks-dialog-header'],
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
                    expect(d.get('body').html()).toBe("体");
                    expect(d.get("footer").html()).toBe("尾");
                });

                it("应该可以拖动", function () {
                    if (ie == 9 || ie == 11) {
                        return;
                    }
                    var xy = [d.get('x'), d.get('y')];

                    waits(100);

                    runs(function () {
                        jasmine.simulate(d.get("header")[0], 'mousedown', {

                            clientX: xy[0] + 10,
                            clientY: xy[1] + 10
                        });
                    });

                    waits(100);
                    runs(function () {
                        jasmine.simulate(document, 'mousemove', {

                            clientX: xy[0] + 150,
                            clientY: xy[1] + 150
                        });
                    });
                    waits(100);
                    runs(function () {

                        jasmine.simulate(document, 'mousemove', {

                            clientX: xy[0] + 100,
                            clientY: xy[1] + 100
                        });

                    });

                    waits(100);

                    runs(function () {
                        jasmine.simulate(document, 'mouseup', {
                            clientX: xy[0] + 100,
                            clientY: xy[1] + 100
                        });
                    });

                    runs(function () {
                        var dxy = [d.get('x'), d.get('y')];
                        expect(dxy[0] - xy[0]).toBeEqual(90);
                        expect(dxy[1] - xy[1]).toBeEqual(90);
                    });

                });

                if ((UA.ieMode == 7 || UA.ieMode == 8) && window.frameElement) {
                    return;
                }

                if (ie == 9 || ie == 11) {
                    return;
                }

                it("只能在当前视窗范围拖动", function () {

                    var xy = d.get("xy");

                    jasmine.simulate(d.get("header")[0], 'mousedown', {
                        clientX: xy[0] + 10,
                        clientY: xy[1] + 10
                    });

                    waits(100);
                    runs(function () {

                        jasmine.simulate(document, 'mousemove', {
                            clientX: xy[0] + 15,
                            clientY: xy[1] + 15
                        });

                    });
                    waits(100);
                    runs(function () {

                        jasmine.simulate(document, 'mousemove', {

                            clientX: xy[0] + Dom.viewportWidth(),
                            clientY: xy[1] + Dom.viewportHeight()
                        });

                    });

                    waits(100);

                    runs(function () {
                        jasmine.simulate(document, 'mouseup', {

                            clientX: xy[0] + Dom.viewportWidth(),
                            clientY: xy[1] + Dom.viewportHeight()
                        });
                    });
                    waits(100);

                    runs(function () {
                        var dxy = [d.get('x'), d.get('y')],
                            width = d.get('el').outerWidth(),
                            height = d.get('el').outerHeight();

                        expect(Dom.viewportWidth() - width).toBeEqual(dxy[0]);
                        expect(Dom.viewportHeight() - height).toBeEqual(dxy[1]);
                    });

                    runs(function () {
                        d.destroy();
                    });
                });
            });
        });
    }, {
        requires: "event,ua,node,overlay,dd/plugin/constrain,component/plugin/drag".split(',')
    });
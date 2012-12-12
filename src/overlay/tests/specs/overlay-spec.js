/**
 * testcases for overlay
 * @author yiminghe@gmail.com
 */
KISSY.use("ua,node,overlay,component/plugin/resize", function (S, UA, Node, Overlay, ResizePlugin) {
    var DOM = S.DOM, $ = Node.all,Gesture= S.Event.Gesture;

    beforeEach(function () {
        this.addMatchers({
            toBeEqual: function (expected) {
                return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
            }
        });
    });

    describe("overlay", function () {


        describe("从页面中取得已渲染元素", function () {


            var o = new Overlay({
                srcNode: "#render",
                width: 400
            });

//           srcNode 情况下可以了，恰好只能 el
//            it("渲染前取不到 el 元素", function() {
//                expect(o.get("el")).toBeUndefined();
//            });


            o.render();

            it("渲染后可以取到元素", function () {
                expect(o.get("el")[0].nodeType).toBe(1);
            });

            it("渲染后元素会正确配置", function () {
                expect(o.get("el").css("left")).toBe("-9999px");
                expect(o.get("el").css("top")).toBe("-9999px");
                expect(o.get("el").css("width")).toBe("400px");
            });

            it("对齐居中有效", function () {
                o.set("align", {
                    points: ['cc', 'cc']
                });

                o.show();

                expect(parseInt(o.get("el").css("left")))
                    .toBeEqual(Math.ceil((DOM.viewportWidth()
                    - o.get("el").outerWidth()) / 2));

                expect(parseInt(o.get("el").css("top")))
                    .toBeEqual(Math.ceil((DOM.viewportHeight()
                    - o.get("el").outerHeight()) / 2));

            });

            it("show/hide 事件顺利触发", function () {

                var hideCall = jasmine.createSpy(),
                    showCall = jasmine.createSpy();

                o.show();

                o.on("hide", function () {
                    hideCall();
                });
                o.on("show", function () {
                    showCall();
                });

                o.hide();
                o.show();
                expect(hideCall).toHaveBeenCalled();
                expect(showCall).toHaveBeenCalled();
                o.detach("show hide");

            });


            it("应该能够设置坐标", function () {

                // or o.move(100,150);

                o.set("xy", [100, 150]);

                //o.move(100, 150);

                expect(o.get("el").css("left")).toBeEqual("100px");
                expect(Math.ceil(parseFloat(o.get("el").css("top")))).toBeEqual(150);

            });

            runs(function () {
                o.destroy();
            });

        });


        describe("完全由 javascript 渲染弹层", function () {

            var o = new Overlay({
                width: 400,
                elCls: "popup",
                plugins: [
                    new ResizePlugin({
                        handlers: ["t"]
                    })
                ],
                content: "render by javascript"
            });

            it("渲染前取不到 el 元素", function () {
                expect(o.get("el")).toBeUndefined();
            });

            runs(function () {
                o.render();
            });

            it("渲染后可以取到元素", function () {
                expect(o.get("contentEl").html()).toBe("render by javascript");
            });

            it("渲染后元素会正确配置", function () {
                expect(o.get("el").css("left")).toBe("-9999px");
                expect(o.get("el").css("top")).toBe("-9999px");
                expect(o.get("el").css("width")).toBe("400px");
            });

            it("show/hide 事件顺利触发", function () {

                var hideCall = jasmine.createSpy(),
                    showCall = jasmine.createSpy();

                o.show();

                o.on("hide", function () {
                    hideCall();
                });
                o.on("show", function () {
                    showCall();
                });

                o.hide();
                o.show();
                expect(hideCall).toHaveBeenCalled();
                expect(showCall).toHaveBeenCalled();
                o.detach("show hide");

            });


            it("应该能够设置坐标", function () {

                // or o.move(100,150);

                o.set("xy", [300, 350]);

                //o.move(100, 150);

                expect(o.get("el").css("left")).toBeEqual("300px");
                expect(Math.ceil(parseFloat(o.get("el").css("top")))).toBeEqual(350);

            });


            it("应该能够调节大小", function () {
                // ie9 测试不了
                if (UA.ie == 9) {
                    return;
                }
                var h = o.get("el").one(".ks-resizable-handler-t"),
                    height = o.get("el").outerHeight(),
                    hxy = h.offset();

                jasmine.simulateForDrag(h[0],Gesture.start, {
                    clientX: hxy.left - 2,
                    clientY: hxy.top - 2
                });

                waits(100);
                runs(function () {

                    jasmine.simulateForDrag(document, Gesture.move, {
                        clientX: hxy.left - 5,
                        clientY: hxy.top - 5
                    });

                });
                waits(100);
                runs(function () {

                    jasmine.simulateForDrag(document, Gesture.move, {
                        clientX: hxy.left - 100,
                        clientY: hxy.top - 100
                    });

                });

                waits(100);

                runs(function () {
                    jasmine.simulateForDrag(document, Gesture.end);
                });

                waits(100);

                runs(function () {
                    var elHeight = o.get("el").outerHeight();

                    // phantomjs emulation not accurate！
                    if (!S.UA.phantomjs) {
                        expect(elHeight - height).toBeEqual(98);
                    }

                });

            });

            runs(function () {
                o.destroy();
            });

        });

        describe("方位能够自由指定", function () {

            it("render works", function () {
                var div = $("<div/>").appendTo("body");
                var o = new Overlay({
                    width: 400,
                    render: div,
                    elCls: "popup",
                    resize: {
                        handlers: ["t"]
                    },
                    content: "render by javascript"
                });
                o.render();
                expect(div.first().equals(o.get("el"))).toBe(true);
                o.destroy();
                expect(div.children().length).toBe(0);
                div.remove();
            });


            it("no render works", function () {
                var div = $("<div/>").appendTo("body");
                var o = new Overlay({
                    width: 400,
                    elCls: "popup",
                    resize: {
                        handlers: ["t"]
                    },
                    content: "render by javascript"
                });
                o.render();
                expect(o.get("el").parent().equals($("body"))).toBe(true);
                o.destroy();
                div.remove();
            });


            it("elBefore works", function () {
                var div = $("<div/>").appendTo("body");
                var o = new Overlay({
                    width: 400,
                    // 同时指定优先 elBefore
                    elBefore: div,
                    render: div,
                    elCls: "popup",
                    resize: {
                        handlers: ["t"]
                    },
                    content: "render by javascript"
                });
                o.render();
                expect(o.get("el").next().equals(div)).toBe(true);
                o.destroy();
                expect(div.prev().equals(o.get("el").next())).toBe(false);
                div.remove();
            });
        });

        describe("align works", function () {

            it("对齐居中有效", function () {

                var o = new Overlay({
                    width: 400,
                    elCls: "popup",
                    resize: {
                        handlers: ["t"]
                    },
                    content: "render by javascript"
                });

                o.set("align", {
                    points: ['cc', 'cc']
                });
                o.show();

                expect(parseInt(o.get("el").css("left")))
                    .toBeEqual(Math.ceil((DOM.viewportWidth()
                    - o.get("el").outerWidth()) / 2));


                expect(parseInt(o.get("el").css("top")))
                    .toBeEqual(Math.ceil((DOM.viewportHeight()
                    - o.get("el").outerHeight()) / 2));

                o.destroy();

            });

            // https://github.com/kissyteam/kissy/issues/190
            it("align node works", function () {

                var node = $("<div style='position: absolute;left:0;top:0;width:600px;" +
                    "height: 200px;overflow: hidden;'>" +
                    "<div style='height: 1000px'></div>" +
                    "</div>").appendTo('body');

                var o = new Overlay.Dialog({
                    headerContent: "哈哈",
                    bodyContent: "嘿嘿",
                    elStyle: {
                        // ie6...
                        overflow: 'hidden'
                    },
                    render: node,
                    width: 300,
                    height: 18
                });

                o.center(node);
                o.show();

                var oel = o.get("el");

                expect(o.get("y")).toBeEqual(90);

                expect(parseInt(oel.css("top"))).toBeEqual(90);

                node[0].scrollTop = 20;

                o.center(node);

                expect(o.get("y")).toBe(90);

                expect(parseInt(oel.css("top"))).toBeEqual(110);

                node.remove();

                o.destroy();

            });

            it('attribute has order', function () {
                var DOM = S.DOM;
                DOM.addStyleSheet('.overlay1522 {position:absolute;}');
                var o = new Overlay({
                    prefixCls: 'kk-',
                    elCls: 'overlay1522'
                });
                o.render();
                expect(o.get("el").css('position')).toBe('absolute');
            });

        });


    });

});
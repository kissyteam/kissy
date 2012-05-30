/**
 * testcases for overlay
 * @author yiminghe@gmail.com
 */
KISSY.use("ua,node,overlay,dd,resizable", function(S, UA, Node, Overlay) {
    var DOM = S.DOM,$ = Node.all;

    beforeEach(function() {
        this.addMatchers({
            toBeEqual: function(expected) {
                return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
            }
        });
    });

    describe("overlay", function() {


        describe("从页面中取得已渲染元素", function() {


            var o = new Overlay({
                srcNode:"#render",
                width:400
            });

//           srcNode 情况下可以了，恰好只能 el
//            it("渲染前取不到 el 元素", function() {
//                expect(o.get("el")).toBeUndefined();
//            });


            o.render();

            it("渲染后可以取到元素", function() {
                expect(o.get("el")[0].nodeType).toBe(1);
            });

            it("渲染后元素会正确配置", function() {
                expect(o.get("el").css("left")).toBe("-9999px");
                expect(o.get("el").css("top")).toBe("-9999px");
                expect(o.get("el").css("width")).toBe("400px");
            });

            it("对齐居中有效", function() {
                o.set("align", {
                    points:['cc','cc']
                });

                o.show();

                expect(parseInt(o.get("el").css("left")))
                    .toBeEqual(Math.ceil((DOM.viewportWidth()
                    - o.get("el").outerWidth()) / 2));

                expect(parseInt(o.get("el").css("top")))
                    .toBeEqual(Math.ceil((DOM.viewportHeight()
                    - o.get("el").outerHeight()) / 2));

            });

            it("show/hide 事件顺利触发", function() {

                var hideCall = jasmine.createSpy(),
                    showCall = jasmine.createSpy();
                o.on("hide", function() {
                    hideCall();
                });
                o.on("show", function() {
                    showCall();
                });

                o.hide();
                o.show();
                expect(hideCall).toHaveBeenCalled();
                expect(showCall).toHaveBeenCalled();
                o.detach("show hide");

            });


            it("应该能够设置坐标", function() {

                // or o.move(100,150);

                o.set("xy", [100,150]);

                //o.move(100, 150);

                expect(o.get("el").css("left")).toBeEqual("100px");
                expect(Math.ceil(parseFloat(o.get("el").css("top")))).toBeEqual(150);

            });

        });


        describe("完全由 javascript 渲染弹层", function() {


            var o = new Overlay({
                width:400,
                elCls:"popup",
                resize:{
                    handlers:["t"]
                },
                content:"render by javascript"
            });


            it("渲染前取不到 el 元素", function() {
                expect(o.get("el")).toBeUndefined();
            });

            runs(function() {
                o.render();
            });

            it("渲染后可以取到元素", function() {
                expect(o.get("contentEl").html()).toBe("render by javascript");
            });

            it("渲染后元素会正确配置", function() {
                expect(o.get("el").css("left")).toBe("-9999px");
                expect(o.get("el").css("top")).toBe("-9999px");
                expect(o.get("el").css("width")).toBe("400px");
            });

            it("对齐居中有效", function() {

                o.set("align", {
                    points:['cc','cc']
                });
                o.show();

                expect(parseInt(o.get("el").css("left")))
                    .toBeEqual(Math.ceil((DOM.viewportWidth()
                    - o.get("el").outerWidth()) / 2));


                expect(parseInt(o.get("el").css("top")))
                    .toBeEqual(Math.ceil((DOM.viewportHeight()
                    - o.get("el").outerHeight()) / 2));

            });

            it("show/hide 事件顺利触发", function() {

                var hideCall = jasmine.createSpy(),
                    showCall = jasmine.createSpy();
                o.on("hide", function() {
                    hideCall();
                });
                o.on("show", function() {
                    showCall();
                });

                o.hide();
                o.show();
                expect(hideCall).toHaveBeenCalled();
                expect(showCall).toHaveBeenCalled();
                o.detach("show hide");

            });


            it("应该能够设置坐标", function() {

                // or o.move(100,150);

                o.set("xy", [300,350]);

                //o.move(100, 150);

                expect(o.get("el").css("left")).toBeEqual("300px");
                expect(Math.ceil(parseFloat(o.get("el").css("top")))).toBeEqual(350);

            });


            it("应该能够调节大小", function() {
                // ie9 测试不了
                if (UA.ie == 9 || UA.chrome) {
                    return;
                }
                var h = o.get("el").one(".ks-resizable-handler-t"),
                    height = o.get("el").outerHeight(),
                    hxy = h.offset();

                jasmine.simulate(h[0], "mousedown", {
                    clientX:hxy.left - 2 ,
                    clientY:hxy.top - 2
                });

                waits(100);
                runs(function() {

                    jasmine.simulate(document, "mousemove", {
                        clientX: hxy.left - 5,
                        clientY:hxy.top - 5
                    });

                });
                waits(100);
                runs(function() {

                    jasmine.simulate(document, "mousemove", {
                        clientX: hxy.left - 100,
                        clientY:hxy.top - 100
                    });

                });

                waits(100);

                runs(function() {
                    jasmine.simulate(document, "mouseup");
                });
                waits(100);
                runs(function() {
                    var dheight = o.get("el").outerHeight();

                    expect(dheight - height).toBeEqual(98);
                });

            });

        });

        describe("方位能够自由指定", function() {

            it("render works", function() {
                var div = $("<div/>").appendTo("body");
                var o = new Overlay({
                    width:400,
                    render:div,
                    elCls:"popup",
                    resize:{
                        handlers:["t"]
                    },
                    content:"render by javascript"
                });
                o.render();
                expect(div.first().equals(o.get("el"))).toBe(true);
                o.destroy();
                expect(div.children().length).toBe(0);
                div.remove();
            });


            it("no render works", function() {
                var div = $("<div/>").appendTo("body");
                var o = new Overlay({
                    width:400,
                    elCls:"popup",
                    resize:{
                        handlers:["t"]
                    },
                    content:"render by javascript"
                });
                o.render();
                expect(o.get("el").parent().equals($("body"))).toBe(true);
                o.destroy();
                div.remove();
            });


            it("elBefore works", function() {
                var div = $("<div/>").appendTo("body");
                var o = new Overlay({
                    width:400,
                    // 同时指定优先 elBefore
                    elBefore:div,
                    render:div,
                    elCls:"popup",
                    resize:{
                        handlers:["t"]
                    },
                    content:"render by javascript"
                });
                o.render();
                expect(o.get("el").next().equals(div)).toBe(true);
                o.destroy();
                expect(div.prev().equals(o.get("el").next())).toBe(false);
                div.remove();
            });
        });


    });

});
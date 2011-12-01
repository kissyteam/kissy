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

    var Dialog = Overlay.Dialog;

    describe("dialog", function() {

        describe("从页面中取得已渲染元素", function() {

            var d = new Dialog({
                srcNode:"#drender",
                width:200,
                drag:true,
                constrain:true
            });

            d.render();
            d.center();
            d.show();

            window.dialog = d;


            it("头体尾已经渲染完毕", function() {
                expect(d.get("header").html()).toBe("prerender header");
                expect(d.get("body").html()).toBe("prerender body");
                expect(d.get("footer").html()).toBe("prerender footer");
            });

        });


        describe("完全由 javascript 创建", function() {

            var d = new Dialog({
                headerContent:"头",
                bodyContent:"体",
                footerContent:"尾",
                width:200,
                drag:true,
                constrain:true
            });

            d.render();
            d.center();
            d.show();

            window.dialog = d;


            it("头体尾已经渲染完毕", function() {
                expect(d.get("header").html()).toBe("头");
                expect(d.get("body").html()).toBe("体");
                expect(d.get("footer").html()).toBe("尾");
            });

            it("应该可以拖动", function() {
                if (UA.ie == 9) return;

                var xy = d.get("xy");


                jasmine.simulate(d.get("header")[0], "mousedown", {
                    clientX: xy[0] + 10,
                    clientY:xy[1] + 10
                });

                waits(100);
                runs(function() {

                    jasmine.simulate(document, "mousemove", {
                        clientX: xy[0] + 15,
                        clientY:xy[1] + 15
                    });

                });
                waits(100);
                runs(function() {

                    jasmine.simulate(document, "mousemove", {
                        clientX: xy[0] + 100,
                        clientY:xy[1] + 100
                    });

                });

                waits(100);

                runs(function() {
                    jasmine.simulate(document, "mouseup");
                });

                runs(function() {
                    var dxy = d.get("xy");

                    expect(dxy[0] - xy[0]).toBeEqual(90);
                    expect(dxy[1] - xy[1]).toBeEqual(90);
                });

            });


            it("只能在当前视窗范围拖动", function() {
                if (UA.ie == 9) return;

                var xy = d.get("xy");


                jasmine.simulate(d.get("header")[0], "mousedown", {
                    clientX: xy[0] + 10,
                    clientY:xy[1] + 10
                });

                waits(100);
                runs(function() {

                    jasmine.simulate(document, "mousemove", {
                        clientX: xy[0] + 15,
                        clientY:xy[1] + 15
                    });

                });
                waits(100);
                runs(function() {

                    jasmine.simulate(document, "mousemove", {
                        clientX: xy[0] + DOM.viewportWidth(),
                        clientY:xy[1] + DOM.viewportHeight()
                    });

                });

                waits(100);

                runs(function() {
                    jasmine.simulate(document, "mouseup");
                });
                waits(100);

                runs(function() {
                    var dxy = d.get("xy"),
                        width = 200,
                        height = d.get("el").outerHeight();

                    expect(DOM.viewportWidth() - width).toBeEqual(dxy[0]);
                    expect(DOM.viewportHeight() - height).toBeEqual(dxy[1]);
                });
            });


        });

    });

});
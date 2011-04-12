/**
 * testcases for overlay
 * @author:yiminghe@gmail.com
 */
KISSY.use("overlay,dd,resizable", function(S, Overlay) {
    var DOM = S.DOM;

    beforeEach(function() {
        this.addMatchers({
            toBeAlmostEqual: function(expected) {
                return Math.abs(parseInt(this.actual) - parseInt(expected)) < 20;
            },


            toBeEqual: function(expected) {
                return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
            },

            toBeArrayEq:function(expected) {
                var actual = this.actual;
            }
        });
    });

    describe("overlay", function() {


        describe("从页面中取得已渲染元素", function() {


            var o = new Overlay({
                srcNode:"#render",
                width:400
            });


            it("渲染前取不到 el 元素", function() {
                expect(o.get("el")).toBeUndefined();
            });

            runs(function() {
                o.render();
            });

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
                    .toBeAlmostEqual(Math.ceil((DOM.viewportHeight() - o.get("el")[0].offsetHeight) / 2));

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

                expect(o.get("el").css("left")).toBeAlmostEqual("100px");
                expect(Math.ceil(parseFloat(o.get("el").css("top")))).toBeAlmostEqual(150);

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
                    .toBeAlmostEqual(Math.ceil((DOM.viewportHeight() - o.get("el")[0].offsetHeight) / 2));

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

                expect(o.get("el").css("left")).toBeAlmostEqual("300px");
                expect(Math.ceil(parseFloat(o.get("el").css("top")))).toBeAlmostEqual(350);

            });


            it("应该能够调节大小", function() {
                var h = o.get("el").one(".ke-resizehandler-t"),
                    height = o.get("el")[0].offsetHeight;
                var hxy = h.offset();
                S.log(hxy);
                
                jasmine.simulate(h[0], "mousedown", {
                    clientX:hxy.left + 2 ,
                    clientY:hxy.top + 2
                });

                waits(300);


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

                runs(function() {
                    var dheight = o.get("el")[0].offsetHeight;

                    expect(dheight - height).toBeEqual(98);
                    expect(dheight - height).toBeEqual(98);
                });

            });

        });


    });
    
    var Dialog = Overlay.Dialog;

    describe("dialog", function() {

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

                var xy = d.get("xy");


                jasmine.simulate(d.get("header")[0], "mousedown", {
                    clientX: xy[0] + 10,
                    clientY:xy[1] + 10
                });

                waits(300);


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
                var xy = d.get("xy");


                jasmine.simulate(d.get("header")[0], "mousedown", {
                    clientX: xy[0] + 10,
                    clientY:xy[1] + 10
                });

                waits(300);


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
                        height = d.get("el")[0].offsetHeight;

                    expect(DOM.viewportWidth() - width).toBeEqual(dxy[0]);
                    expect(DOM.viewportHeight() - height).toBeEqual(dxy[1]);
                });
            });


        });

    });

});
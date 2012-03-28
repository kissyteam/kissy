/**
 * testcases for dialog
 * @author yiminghe@gmail.com
 */
KISSY.use("ua,node,overlay,dd,resizable", function (S, UA, Node, Overlay) {
    var DOM = S.DOM, $ = Node.all;

    beforeEach(function () {
        this.addMatchers({
            toBeEqual:function (expected) {
                return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
            }
        });
    });

    var Dialog = Overlay.Dialog;

    describe("dialog", function () {

        describe("从页面中取得已渲染元素", function () {
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


            it("头体尾已经渲染完毕", function () {
                expect(d.get("header").html()).toBe("prerender header");
                expect(d.get("body").html()).toBe("prerender body");
                expect(d.get("footer").html()).toBe("prerender footer");
            });

        });

        it("create works", function () {
            var d = new Dialog({
                width:200,
                closable:true,
                bodyContent:"1",
                headerContent:"2"
            });
            d.create();
            expect(d.get("header")).not.toBe(undefined);
            if (d.get("header")) {
                expect(d.get("header").html()).toBe("2");
            }
            expect(d.get("el").one(".ks-ext-close")).not.toBe(undefined);
            d.destroy();
        });


        describe("完全由 javascript 创建", function () {

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


            it("头体尾已经渲染完毕", function () {
                expect(d.get("header").html()).toBe("头");
                expect(d.get("body").html()).toBe("体");
                expect(d.get("footer").html()).toBe("尾");
            });

            it("应该可以拖动", function () {
                if (UA.ie == 9) return;

                var xy = d.get("xy");


                jasmine.simulate(d.get("header")[0], "mousedown", {
                    clientX:xy[0] + 10,
                    clientY:xy[1] + 10
                });

                waits(100);
                runs(function () {

                    jasmine.simulate(document, "mousemove", {
                        clientX:xy[0] + 15,
                        clientY:xy[1] + 15
                    });

                });
                waits(100);
                runs(function () {

                    jasmine.simulate(document, "mousemove", {
                        clientX:xy[0] + 100,
                        clientY:xy[1] + 100
                    });

                });

                waits(100);

                runs(function () {
                    jasmine.simulate(document, "mouseup");
                });

                runs(function () {
                    var dxy = d.get("xy");

                    expect(dxy[0] - xy[0]).toBeEqual(90);
                    expect(dxy[1] - xy[1]).toBeEqual(90);
                });

            });


            it("只能在当前视窗范围拖动", function () {
                if (UA.ie == 9) return;

                var xy = d.get("xy");


                jasmine.simulate(d.get("header")[0], "mousedown", {
                    clientX:xy[0] + 10,
                    clientY:xy[1] + 10
                });

                waits(100);
                runs(function () {

                    jasmine.simulate(document, "mousemove", {
                        clientX:xy[0] + 15,
                        clientY:xy[1] + 15
                    });

                });
                waits(100);
                runs(function () {

                    jasmine.simulate(document, "mousemove", {
                        clientX:xy[0] + DOM.viewportWidth(),
                        clientY:xy[1] + DOM.viewportHeight()
                    });

                });

                waits(100);

                runs(function () {
                    jasmine.simulate(document, "mouseup");
                });
                waits(100);

                runs(function () {
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
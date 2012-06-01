/**
 * @module  draggable-spec
 * @author  yiminghe@gmail.com
 * @description ie9 模式下 mousemove 触发事件有问题，无法测试
 */
KISSY.use("ua,node,dd", function (S, UA, Node, DD) {
    var Draggable = DD.Draggable, DOM = S.DOM;
    var ie = document['documentMode'] || UA['ie'];


    describe('draggable', function () {
        beforeEach(function () {
            this.addMatchers({
                toBeAlmostEqual:function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 20;
                },


                toBeEqual:function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                }
            });
        });
        it('should not drag before mousedown while mousemove', function () {

            var drag = Node.one("#drag_before"),
                dragHeader = Node.one("#dragHeader_before");
            var action = new Draggable({
                node:drag,
                handlers:[dragHeader]
            });

            action.on("drag", function (off) {
                drag.offset(off);
            });

            waits(300);
            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX:-100 - DOM.scrollLeft(),
                    clientY:-100 - DOM.scrollTop()
                });
            });
            waits(50);
            runs(function () {
                var expected = 500;
                //if (ie == 7) expected += 2;
                expect(drag.offset().top).toBeEqual(expected);
                expect(drag.offset().left).toBeEqual(expected);
                jasmine.simulate(document, "mouseup");
                action.destroy();
            });
        });


        it('should drag after mousedown while mousemove after exceeding clickPixelThresh', function () {

            var drag = Node.one("#drag"),
                dragHeader = Node.one("#dragHeader");
            var action = new Draggable({
                node:drag,
                handlers:[dragHeader]
            });

            var xy = dragHeader.offset();

            action.on("drag", function (off) {
                drag.offset(off);
            });

            runs(function () {
                jasmine.simulate(dragHeader[0], "mousedown", {
                    clientX:xy.left - DOM.scrollLeft(),
                    clientY:xy.top - DOM.scrollTop()
                });
            });
            waits(100);

            // 10px move to start
            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX:xy.left - 10 - DOM.scrollLeft(),
                    clientY:xy.top - 10 - DOM.scrollTop()
                });
            });

            waits(100);
            runs(function () {

                jasmine.simulate(document, "mousemove", {
                    clientX:xy.left - 100 - DOM.scrollLeft(),
                    clientY:xy.top - 100 - DOM.scrollTop()
                });
            });

            waits(300);

            runs(function () {
                jasmine.simulate(document, "mouseup");
            });

            waits(300);
            runs(function () {
                var expected = 450;
                //if (ie == 7) expected += 2;
                expect(drag.offset().top).toBeEqual(expected);
                expect(drag.offset().left).toBeEqual(expected);
                action.destroy();
            });
        });


        it('should drag after mousedown while mousemove after bufferTime', function () {


            var drag = Node.one("#drag"),
                dragHeader = Node.one("#dragHeader");

            var action = new Draggable({
                node:drag,
                handlers:[dragHeader]
            });

            var xy = dragHeader.offset();

            action.on("drag", function (off) {
                drag.offset(off);
            });

            runs(function () {
                jasmine.simulate(dragHeader[0], "mousedown", {
                    clientX:xy.left - DOM.scrollLeft(),
                    clientY:xy.top - DOM.scrollTop()
                });
            });

            // exceed bufferTime
            waits(1100);

            runs(function () {

                jasmine.simulate(document, "mousemove", {
                    clientX:xy.left + 100 - DOM.scrollLeft(),
                    clientY:xy.top + 100 - DOM.scrollTop()
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mouseup");
            });

            waits(100);
            runs(function () {
                var expected = 100;
                //if (ie == 7) expected += 2;
                expect(drag.offset().top - xy.top).toBeEqual(expected);
                expect(drag.offset().left - xy.left).toBeEqual(expected);
                action.destroy();
            });
        });

        it('should not drag after mouseup while mousemove', function () {
            var drag = Node.one("#drag_after"),
                dragHeader = Node.one("#dragHeader_after");

            var action = new Draggable({
                node:drag,
                handlers:[dragHeader]
            });

            var xy = dragHeader.offset();

            action.on("drag", function (off) {
                drag.offset(off);
            });

            runs(function () {
                jasmine.simulate(dragHeader[0], "mousedown", {
                    clientX:xy.left - DOM.scrollLeft(),
                    clientY:xy.top - DOM.scrollTop()
                });
            });
            waits(100);

            // 10px move to start
            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX:xy.left - 10 - DOM.scrollLeft(),
                    clientY:xy.top - 10 - DOM.scrollTop()
                });
            });

            waits(100);
            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX:xy.left + 100 - DOM.scrollLeft(),
                    clientY:xy.top + 100 - DOM.scrollTop()
                });
            });
            waits(300);

            runs(function () {
                jasmine.simulate(document, "mouseup");
            });
            waits(300);
            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX:xy.left - 300 - DOM.scrollLeft(),
                    clientY:xy.top - 300 - DOM.scrollTop()
                });
            });
            runs(function () {
                var expected = 100;
                //if (ie == 7) expected += 2;
                expect(drag.offset().top - xy.top).toBeEqual(expected);
                expect(drag.offset().left - xy.left).toBeEqual(expected);
                action.destroy();
            });
        });


        it('disabled works', function () {


            var drag = Node.one("#drag"),
                dragHeader = Node.one("#dragHeader");

            var action = new Draggable({
                node:drag,
                disabled:true,
                handlers:[dragHeader]
            });

            var xy = dragHeader.offset();

            action.on("drag", function (off) {
                drag.offset(off);
            });

            runs(function () {
                jasmine.simulate(dragHeader[0], "mousedown", {
                    clientX:xy.left - DOM.scrollLeft(),
                    clientY:xy.top - DOM.scrollTop()
                });
            });

            // exceed bufferTime
            waits(1100);

            runs(function () {

                jasmine.simulate(document, "mousemove", {
                    clientX:xy.left + 100 - DOM.scrollLeft(),
                    clientY:xy.top + 100 - DOM.scrollTop()
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mouseup");
            });

            waits(100);
            runs(function () {
                expect(drag.offset().top - xy.top).toBeEqual(0);
                expect(drag.offset().left - xy.left).toBeEqual(0);
                action.destroy();
            });
        });

        runs(function () {
            Node.one("#drag_before").remove();
            Node.one("#drag").remove();
            Node.one("#drag_after").remove();
        });
    });
});
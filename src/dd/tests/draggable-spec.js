/**
 * @module  draggable-spec
 * @author  yiminghe@gmail.com
 */
KISSY.use("ua,node,dd", function(S, UA, Node, DD) {
    var Draggable = DD.Draggable;
    var ie = document['documentMode'] || UA['ie'];


    describe('draggable', function() {

        it('should not drag before mousedown while mousemove', function() {
            var drag = Node.one("#drag_before"),
                dragHeader = Node.one("#dragHeader_before");
            var action = new Draggable({
                node:drag,
                handlers:[dragHeader]
            });

            action.on("drag", function(off) {
                drag.offset(off);
            });

            waits(300);
            runs(function() {
                jasmine.simulate(document, "mousemove", {
                    clientX: -100,
                    clientY:-100
                });
            });
            waits(50);
            runs(function() {
                var expected = 500;
                if (ie == 7) expected += 2;
                expect(drag.offset().top).toEqual(expected);
                expect(drag.offset().left).toEqual(expected);
                jasmine.simulate(document, "mouseup");
            });
        });


        it('should drag after mousedown while mousemove', function() {
            var drag = Node.one("#drag"),
                dragHeader = Node.one("#dragHeader");
            var action = new Draggable({
                node:drag,
                handlers:[dragHeader]
            });

            var xy = dragHeader.offset();

            action.on("drag", function(off) {
                drag.offset(off);
            });

            runs(function() {
                jasmine.simulate(dragHeader[0], "mousedown", {
                    clientX:xy.left,
                    clientY:xy.top
                });
            });
            waits(300);
            runs(function() {
                jasmine.simulate(document, "mousemove", {
                    clientX: xy.left - 100,
                    clientY:xy.top - 100
                });
            });
            waits(50);

            runs(function() {
                jasmine.simulate(document, "mouseup");
            });
            waits(50);
            runs(function() {
                var expected = 400;
                if (ie == 7) expected += 2;
                expect(drag.offset().top).toEqual(expected);
                expect(drag.offset().left).toEqual(expected);
            });
        });


        it('should not drag after mouseup while mousemove', function() {
            var drag = Node.one("#drag_after"),
                dragHeader = Node.one("#dragHeader_after");
            var action = new Draggable({
                node:drag,
                handlers:[dragHeader]
            });


            var xy = dragHeader.offset();

            action.on("drag", function(off) {
                drag.offset(off);
            });

            runs(function() {
                jasmine.simulate(dragHeader[0], "mousedown", {
                    clientX: xy.left,
                    clientY:xy.top
                });
            });
            waits(300);
            runs(function() {
                jasmine.simulate(document, "mousemove", {
                    clientX: xy.left - 100,
                    clientY:xy.top - 100
                });
            });
            waits(50);

            runs(function() {
                jasmine.simulate(document, "mouseup");
            });
            waits(50);
            runs(function() {
                jasmine.simulate(document, "mousemove", {
                    clientX: xy.left - 300,
                    clientY:xy.top - 300
                });
            });
            runs(function() {
                var expected = 400;
                if (ie == 7) expected += 2;
                expect(drag.offset().top).toEqual(expected);
                expect(drag.offset().left).toEqual(expected);
            });
        });

        runs(function() {
            Node.one("#drag_before").remove();
            Node.one("#drag").remove();
            Node.one("#drag_after").remove();
        });
    });
});
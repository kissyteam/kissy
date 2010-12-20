/**
 * @module  dd-spec
 * @author  yiminghe@gmail.com
 */
describe('dd', function() {
    var S = KISSY;
    describe('drag', function() {

        var ie = document.documentMode || S.UA.ie;
        it('should not drag before mousedown while mousemove', function() {
            var drag = S.one("#drag_before"),
                dragHeader = S.one("#dragHeader_before");
            var action = new S.Draggable({
                node:drag,
                handlers:[dragHeader]
            });

            action.on("drag", function(off) {
                drag.offset(off);
            });

            waits(300);
            runs(function() {
                jasmine.simulate(document, "mousemove",
                { clientX: -100,clientY:-100 });
            });
            waits(50);
            runs(function() {
                var expected = -1000;
                if (ie ==7) expected += 2;
                expect(drag.offset().top).toEqual(expected);
                expect(drag.offset().left).toEqual(expected);
                jasmine.simulate(document, "mouseup");
            });
        });


        it('should drag after mousedown while mousemove', function() {
            var drag = S.one("#drag"),
                dragHeader = S.one("#dragHeader");
            var action = new S.Draggable({
                node:drag,
                handlers:[dragHeader]
            });

            action.on("drag", function(off) {
                drag.offset(off);
            });

            runs(function() {
                jasmine.simulate(dragHeader[0], "mousedown");
            });
            waits(300);
            runs(function() {
                jasmine.simulate(document, "mousemove",
                { clientX: -100,clientY:-100 });
            });
            waits(50);

            runs(function() {
                jasmine.simulate(document, "mouseup");
            });
            waits(50);
            runs(function() {
                var expected = -1100;
               if (ie ==7) expected += 2;
                expect(drag.offset().top).toEqual(expected);
                expect(drag.offset().left).toEqual(expected);
            });
        });


        it('should not drag after mouseup while mousemove', function() {
            var drag = S.one("#drag_after"),
                dragHeader = S.one("#dragHeader_after");
            var action = new S.Draggable({
                node:drag,
                handlers:[dragHeader]
            });

            action.on("drag", function(off) {
                drag.offset(off);
            });

            runs(function() {
                jasmine.simulate(dragHeader[0], "mousedown");
            });
            waits(300);
            runs(function() {
                jasmine.simulate(document, "mousemove",
                { clientX: -100,clientY:-100 });
            });
            waits(50);

            runs(function() {
                jasmine.simulate(document, "mouseup");
            });
            waits(50);
            runs(function() {
                jasmine.simulate(document, "mousemove");
            });
            runs(function() {
                var expected = -1100;
                if (ie ==7) expected += 2;
                expect(drag.offset().top).toEqual(expected);
                expect(drag.offset().left).toEqual(expected);
            });
        });
    });
});
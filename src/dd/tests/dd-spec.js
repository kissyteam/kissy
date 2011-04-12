/**
 * @module  dd-spec
 * @author  yiminghe@gmail.com
 */
KISSY.use("ua,node,dd", function(S, UA) {
    var Node = S.require("node/node"),
        Draggable = S.require("dd/draggable");

    describe('dd', function() {
        describe('drag', function() {

            var ie = document['documentMode'] || UA['ie'];
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
                    jasmine.simulate(document, "mousemove",
                    { clientX: -100,clientY:-100 });
                });
                waits(50);
                runs(function() {
                    var expected = -1000;
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
                    if (ie == 7) expected += 2;
                    expect(drag.offset().top).toEqual(expected);
                    expect(drag.offset().left).toEqual(expected);
                });
            });
        });
    });
});
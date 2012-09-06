/**
 * @module  scroll-spec
 * @author yiminghe@gmail.com
 */
KISSY.use("dd", function (S, DD) {
    var Draggable = DD.Draggable,
        $ = S.all,
        Constrain = DD.Constrain;

    window.scrollTo(0, 0);

    var ie = document['documentMode'] || S.UA['ie'];

    describe("constrain", function () {

        var node = $("<div style='width:100px;height:200px;" +
            "position: absolute;left:0;top:0;'>" +
            "</div>")
            .appendTo("body");

        var container = $("<div style='width:300px;height:500px;" +
            "position: absolute;left:0;top:0;'>" +
            "</div>")
            .prependTo("body");

        var draggable = new Draggable({
            node: node,
            move: 1
        });

        var constrain = new Constrain({
            constrain: container
        });

        it("works for node", function () {

            node.css({
                left: 0,
                top: 0
            });

            constrain.set("constrain", container);

            constrain.attachDrag(draggable);

            jasmine.simulate(node[0], "mousedown", {
                clientX: 10,
                clientY: 10
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX: 30,
                    clientY: 30
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX: 500,
                    clientY: 500
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mouseup");
            });

            waits(100);

            runs(function () {
                expect(node.css("left")).toBe("200px");
                expect(node.css("top")).toBe("300px");
            });


        });


        it("works for window", function () {

            node.css({
                left: 0,
                top: 0
            });

            constrain.set("constrain", window);

            var win = $(window);

            constrain.attachDrag(draggable);

            jasmine.simulate(node[0], "mousedown", {
                clientX: 10,
                clientY: 10
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX: 30,
                    clientY: 30
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX: 5500,
                    clientY: 5500
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mouseup");
            });

            waits(100);

            runs(function () {
                expect(parseInt(node.css("left"))).toBe(win.width() - 100);
                expect(parseInt(node.css("top"))).toBe(win.height() - 200);
            });


        });


        it("works for window (true constrain)", function () {

            node.css({
                left: 0,
                top: 0
            });

            constrain.set("constrain", true);

            var win = $(window);

            constrain.attachDrag(draggable);

            jasmine.simulate(node[0], "mousedown", {
                clientX: 10,
                clientY: 10
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX: 30,
                    clientY: 30
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX: 5500,
                    clientY: 5500
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mouseup");
            });

            waits(100);

            runs(function () {
                expect(parseInt(node.css("left"))).toBe(win.width() - 100);
                expect(parseInt(node.css("top"))).toBe(win.height() - 200);
            });


        });


        it("can be freed (false constrain)", function () {

            node.css({
                left: 0,
                top: 0
            });

            constrain.set("constrain", false);

            constrain.attachDrag(draggable);

            jasmine.simulate(node[0], "mousedown", {
                clientX: 10,
                clientY: 10
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX: 30,
                    clientY: 30
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX: 5500,
                    clientY: 5500
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mouseup");
            });

            waits(100);

            runs(function () {
                expect(parseInt(node.css("left"))).toBe(5490);
                expect(parseInt(node.css("top"))).toBe(5490);
            });


        });


        it("can be freed (detach)", function () {

            node.css({
                left: 0,
                top: 0
            });

            constrain.set("constrain", true);

            constrain.detachDrag(draggable);

            jasmine.simulate(node[0], "mousedown", {
                clientX: 10,
                clientY: 10
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX: 30,
                    clientY: 30
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX: 5500,
                    clientY: 5500
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, "mouseup");
            });

            waits(100);

            runs(function () {
                expect(parseInt(node.css("left"))).toBe(5490);
                expect(parseInt(node.css("top"))).toBe(5490);
            });


        });

    });

});
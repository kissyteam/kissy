/**
 * @module  delegate-spec
 * @author yiminghe@gmail.com
 */
KISSY.use("ua,node,dd/base,dom,dd/plugin/proxy,dd/droppable", function (S, UA, Node, DD, DOM, Proxy) {
    var $ = Node.all,
        Gesture = S.Event.Gesture,
        DraggableDelegate = DD.DraggableDelegate,
        DroppableDelegate = DD.DroppableDelegate;

    var ie = document['documentMode'] || UA['ie'];

    describe("delegate", function () {
        var c1 = $("#c1"),
            c2 = $("#c2"),
            c3 = $("#c3");

        it("should delegate properly", function () {

            var proxy = new Proxy({
                /**
                 * 如何产生替代节点
                 * @param drag 当前拖对象
                 */
                node: function (drag) {
                    var n = $(drag.get("dragNode").clone(true));
                    n.attr("id", S.guid("ks-dd-proxy"));
                    n.css("opacity", 0.2);
                    return n;
                },
                destroyOnEnd: true,
                moveOnEnd: false
            });

            var dragDelegate = new DraggableDelegate({
                container: "#container2",
                handlers: ['.cheader'],
                selector: '.component',
                move: true
            });

            dragDelegate.plug(proxy);

            var dropDelegate = new DroppableDelegate({
                container: "#container2",
                selector: '.component'
            });


            dragDelegate.on("dragover", function (ev) {
                var drag = ev.drag;
                var drop = ev.drop;
                var dragNode = drag.get("dragNode"),
                    dropNode = drop.get("node");
                var middleDropX = (dropNode.offset().left * 2 +
                    dropNode.width()) / 2;
                if (ev.pageX > middleDropX) {
                    var next = dropNode.next();
                    if (next && next[0] == dragNode) {
                    } else {
                        dragNode.insertAfter(dropNode);
                    }
                } else {
                    var prev = dropNode.prev();
                    if (prev && prev[0] == dragNode) {

                    } else {
                        dragNode.insertBefore(dropNode);
                    }
                }
            });

            runs(function () {
                jasmine.simulateForDrag(c2.one(".cheader")[0], Gesture.start, {
                    clientX: c2.offset().left + 5 - DOM.scrollLeft(),
                    clientY: c2.offset().top + 5 - DOM.scrollTop()
                });
            });

            waits(100);

            // 10px move to start
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: c2.offset().left + 15 - DOM.scrollLeft(),
                    clientY: c2.offset().top + 15 - DOM.scrollTop()
                });
            });

            waits(100);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: c1.offset().left + 5 - DOM.scrollLeft(),
                    clientY: c1.offset().top + 5 - DOM.scrollTop()
                });
            });


            waits(100);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: c1.offset().left + 6 - DOM.scrollLeft(),
                    clientY: c1.offset().top + 6 - DOM.scrollTop()
                });
            });


            waits(100);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });

            waits(100);
            runs(function () {
                expect($("#container2").children()[0]).toBe(c2[0]);
                // restore
                $("#container2").append(c1);
                $("#container2").append(c2);
                $("#container2").append(c3);
                dragDelegate.destroy();
                dropDelegate.destroy();
            });

        });


        it("disable should works", function () {

            var proxy = new Proxy({
                /**
                 * 如何产生替代节点
                 * @param drag 当前拖对象
                 */
                node: function (drag) {
                    var n = $(drag.get("dragNode").clone(true));
                    n.attr("id", S.guid("ks-dd-proxy"));
                    n.css("opacity", 0.2);
                    return n;
                },
                destroyOnEnd: true,
                moveOnEnd: false
            });

            var dragDelegate = new DraggableDelegate({
                container: "#container2",
                handlers: ['.cheader'],
                selector: '.component',
                move: true,
                disabled: true
            });

            dragDelegate.plug(proxy);

            var dropDelegate = new DroppableDelegate({
                container: "#container2",
                selector: '.component'
            });


            dragDelegate.on("dragover", function (ev) {
                var drag = ev.drag;
                var drop = ev.drop;
                var dragNode = drag.get("dragNode"),
                    dropNode = drop.get("node");
                var middleDropX = (dropNode.offset().left * 2 + dropNode.width()) / 2;
                if (ev.pageX > middleDropX) {
                    var next = dropNode.next();
                    if (next && next[0] == dragNode) {
                    } else {
                        dragNode.insertAfter(dropNode);
                    }
                } else {
                    var prev = dropNode.prev();
                    if (prev && prev[0] == dragNode) {

                    } else {
                        dragNode.insertBefore(dropNode);
                    }
                }
            });

            runs(function () {
                jasmine.simulateForDrag(c2.one(".cheader")[0], Gesture.start, {
                    clientX: c2.offset().left + 5 - DOM.scrollLeft(),
                    clientY: c2.offset().top + 5 - DOM.scrollTop()
                });
            });

            waits(100);

            // 10px move to start
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: c2.offset().left + 15 - DOM.scrollLeft(),
                    clientY: c2.offset().top + 15 - DOM.scrollTop()
                });
            });

            waits(100);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: c1.offset().left + 5 - DOM.scrollLeft(),
                    clientY: c1.offset().top + 5 - DOM.scrollTop()
                });
            });


            waits(100);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: c1.offset().left + 6 - DOM.scrollLeft(),
                    clientY: c1.offset().top + 6 - DOM.scrollTop()
                });
            });


            waits(100);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });

            waits(100);
            runs(function () {
                expect($("#container2").children()[0]).toBe(c1[0]);
                // restore
                $("#container2").append(c1);
                $("#container2").append(c2);
                $("#container2").append(c3);
                dragDelegate.destroy();
                dropDelegate.destroy();
            });


        });


    });

});
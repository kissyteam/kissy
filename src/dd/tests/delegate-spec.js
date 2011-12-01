/**
 * @module  delegate-spec
 * @author  yiminghe@gmail.com
 */
KISSY.use("ua,node,dd", function(S, UA, Node, DD) {
    var DOM = S.DOM,
        DraggableDelegate = DD.DraggableDelegate,
        DroppableDelegate = DD.DroppableDelegate,
        Proxy = DD.Proxy;

    var ie = document['documentMode'] || UA['ie'];


    describe("delegate", function() {
        var c1 = S.one("#c1"),
            c2 = S.one("#c2"),
            c3 = S.one("#c3");

        runs(function() {
            // S.one("#container2").unselectable();
            var proxy = new Proxy({
                /**
                 * 如何产生替代节点
                 * @param drag 当前拖对象
                 */
                node:function(drag) {
                    var n = S.one(drag.get("dragNode").clone(true));
                    n.attr("id", S.guid("ks-dd-proxy"));
                    n.css("opacity", 0.2);
                    return n;
                },
                destroyOnEnd:true
            });

            var dragDelegate = new DraggableDelegate({
                container:"#container2",
                handlers:['.cheader'],
                selector:'.component'
            });

            proxy.attach(dragDelegate);


            var dropDelegate = new DroppableDelegate({
                container:"#container2",
                selector:'.component'
            });


            var p;
            /**
             * 集中监听所有
             */
            dragDelegate.on("dragstart", function(ev) {
                var c = this;
                p = c.get("dragNode").css("position");
            });
            dragDelegate.on("drag", function(ev) {

                var c = this;
                /**
                 * node 和 dragNode 区别：
                 * node : 可能是 proxy node，指实际拖放节点
                 */
                c.get("node").offset(ev);
            });
            dragDelegate.on("dragend", function(ev) {
                var c = this;
                c.get("dragNode").css("position", p);
            });

            dragDelegate.on("dragover", function(ev) {
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
        });


        it("should delegate properly", function() {

            runs(function() {
                jasmine.simulate(c2.one(".cheader")[0], "mousedown", {
                    clientX:c2.offset().left + 5 - DOM.scrollLeft(),
                    clientY:c2.offset().top + 5 - DOM.scrollTop()
                });
            });

            waits(100);

            // 10px move to start
            runs(function() {
                jasmine.simulate(document, "mousemove", {
                    clientX:c2.offset().left + 15 - DOM.scrollLeft(),
                    clientY:c2.offset().top + 15 - DOM.scrollTop()
                });
            });

            waits(100);
            runs(function() {
                jasmine.simulate(document, "mousemove", {
                    clientX:c1.offset().left + 5 - DOM.scrollLeft(),
                    clientY:c1.offset().top + 5 - DOM.scrollTop()
                });
            });


            waits(100);
            runs(function() {
                jasmine.simulate(document, "mousemove", {
                    clientX:c1.offset().left + 6 - DOM.scrollLeft(),
                    clientY:c1.offset().top + 6 - DOM.scrollTop()
                });
            });


            waits(100);
            runs(function() {
                jasmine.simulate(document, "mouseup");
            });

            waits(100);
            runs(function() {
                expect(S.one("#container2").children()[0]).toBe(c2[0]);
            });


        });


    });

});
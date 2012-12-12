/**
 * @module  proxy-spec
 * @author yiminghe@gmail.com
 */
KISSY.use("ua,node,dd/base,dd/plugin/proxy", function (S, UA, Node, DD,Proxy) {
    var Draggable = DD.Draggable,
        Gesture= S.Event.Gesture,
        DOM = S.DOM;
    var ie = document['documentMode'] || UA['ie'];


    describe("proxy", function () {
        var drag, dragXy, dragNode;

        drag = new Draggable({
            node: "#drag_proxy"
        });

        dragNode = drag.get("dragNode");

        drag.plug(new Proxy({
            node: function (drag) {
                var n = new Node(drag.get("dragNode").clone(false));
                n.css("opacity", 0.2);
                return n;
            }
        }));

        it("should create proxy properly", function () {


            expect(drag.get("node")[0]).toBe(drag.get("dragNode")[0]);

            dragXy = dragNode.offset();
            jasmine.simulateForDrag(dragNode[0], Gesture.start, {
                clientX: dragXy.left + 10 - DOM.scrollLeft(),
                clientY: dragXy.top + 10 - DOM.scrollTop()
            });


            waits(100);

            // 10px move to start
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: dragXy.left + 15 - DOM.scrollLeft(),
                    clientY: dragXy.top + 15 - DOM.scrollTop()
                });
            });

            waits(100);

            runs(function () {
                expect(drag.get("node")[0]).not.toBe(drag.get("dragNode")[0]);
            });

            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end);
            });


        });

        runs(function () {
            drag.destroy();
            dragNode.remove();
        });

    });
});
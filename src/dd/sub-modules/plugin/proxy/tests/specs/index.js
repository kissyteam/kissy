/**
 * @module  proxy-spec
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Node, DD, Proxy) {
    var UA = S.UA;
    var Draggable = DD.Draggable,
        Gesture = S.Event.Gesture,
        Dom = S.DOM;
    var ie = document['documentMode'] || UA['ie'];

    describe("proxy", function () {
        var drag, dragXy, dragNode;

        Node.all(' <div id="drag_proxy" style="position:absolute;' +
            'left:400px;top:400px;' +
            'width:100px;height:100px;' +
            'border:1px solid red;">' +
            'drag' +
            '</div>').appendTo('body');

        drag = new Draggable({
            node: "#drag_proxy",
            move: 1,
            groups: false
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
                clientX: dragXy.left + 10 - Dom.scrollLeft(),
                clientY: dragXy.top + 10 - Dom.scrollTop()
            });


            waits(100);

            // 10px move to start
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: dragXy.left + 15 - Dom.scrollLeft(),
                    clientY: dragXy.top + 15 - Dom.scrollTop()
                });
            });

            waits(100);

            runs(function () {
                expect(drag.get("node")[0]).not.toBe(drag.get("dragNode")[0]);
            });

            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end, {
                    clientX: dragXy.left + 15 - Dom.scrollLeft(),
                    clientY: dragXy.top + 15 - Dom.scrollTop()
                });
            });


        });

        runs(function () {
            drag.destroy();
            dragNode.remove();
        });

    });
}, {
    requires: ['node', 'dd', 'dd/plugin/proxy']
});
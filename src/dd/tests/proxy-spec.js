/**
 * @module  proxy-spec
 * @author  yiminghe@gmail.com
 */
KISSY.use("ua,node,dd", function(S, UA, Node, DD) {
    var Draggable = DD.Draggable,
        DOM = S.DOM,
        Proxy = DD.Proxy;
    var ie = document['documentMode'] || UA['ie'];


    describe("proxy", function() {
        var drag,dragXy,dragNode;
        runs(function() {
            drag = new Draggable({
                node:"#drag_proxy"
            });
            dragNode = drag.get("dragNode");
            new Proxy({
                node:function(drag) {
                    var n = new Node(drag.get("dragNode").clone(false));
                    n.css("opacity", 0.2);
                    return n;
                }
            }).attach(drag);
        });

        it("should create proxy properly", function() {

            runs(function() {

                expect(drag.get("node")[0]).toBe(drag.get("dragNode")[0]);

                dragXy = dragNode.offset();
                jasmine.simulate(dragNode[0], "mousedown", {
                    clientX:dragXy.left + 10 - DOM.scrollLeft(),
                    clientY:dragXy.top + 10 - DOM.scrollTop()
                });
            });

            waits(100);

            // 10px move to start
            runs(function() {
                jasmine.simulate(document, "mousemove", {
                    clientX:dragXy.left + 15 - DOM.scrollLeft(),
                    clientY:dragXy.top + 15 - DOM.scrollTop()
                });
            });

            waits(100);

            runs(function() {
                expect(drag.get("node")[0]).not.toBe(drag.get("dragNode")[0]);
            });

            runs(function() {
                jasmine.simulate(document, "mouseup");
            });


        });

        runs(function() {
            drag.destroy();
            dragNode.remove();
        });

    });
});
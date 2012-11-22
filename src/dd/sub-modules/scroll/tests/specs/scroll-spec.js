/**
 * @module  scroll-spec
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,ua,node,dd/base,dd/scroll", function (S, DOM, UA, Node, DD, Scroll) {
    var Draggable = DD.Draggable,
        $ = Node.all;
    var ie = document['documentMode'] || UA['ie'];

    describe("scroll", function () {

        var drag, dragNode, dragContainer, dragOffset, containerOffset, scrollTop = 0;


        dragNode = $("#drag-scroll");
        dragContainer = $("#drag_scroll_container");
        drag = new Draggable({
            node: dragNode
        });

        drag.plug(new Scroll({
            node: dragContainer,
            diff: [10, 10]
        }));

        drag.on("drag", function (ev) {
            dragNode.offset(ev);
        });
        dragOffset = dragNode.offset();
        containerOffset = dragContainer.offset();

        scrollTop = dragContainer[0].scrollTop;

        it("should make container auto scroll properly", function () {
            runs(function () {
                jasmine.simulate(dragNode[0], "mousedown", {
                    clientX: dragOffset.left + 20 - DOM.scrollLeft(),
                    clientY: dragOffset.top + 20 - DOM.scrollTop()
                });
            });

            waits(100);

            // 10px move to start
            runs(function () {
                jasmine.simulate(document, "mousemove", {
                    clientX: dragOffset.left + 25 - DOM.scrollLeft(),
                    clientY: dragOffset.top + 25 - DOM.scrollTop()
                });
            });

            waits(100);

            runs(function () {

                jasmine.simulate(document, "mousemove", {
                    clientX: containerOffset.left + 50 - DOM.scrollLeft(),
                    clientY: containerOffset.top + dragContainer[0].offsetHeight - 10
                        + 2 - DOM.scrollTop()
                });


            });


            waits(300);
            runs(function () {
                jasmine.simulate(document, "mouseup");
            });

            waits(300);

            runs(function () {
                if (!UA.webkit) {
                    expect(dragContainer[0].scrollTop).not.toBe(scrollTop);
                }
            });

        });

    });

});
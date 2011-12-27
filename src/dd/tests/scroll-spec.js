/**
 * @module  scroll-spec
 * @author  yiminghe@gmail.com
 */
KISSY.use("dom,ua,node,dd", function(S, DOM,UA, Node, DD) {
    var Draggable = DD.Draggable,
        $=Node.all,
        Scroll = DD.Scroll;
    var ie = document['documentMode'] || UA['ie'];

    describe("scroll", function() {

        var drag,dragNode,dragContainer,dragOffset,containerOffset,scrollTop = 0;

        runs(function() {
            dragNode = $("#drag-scroll");
            dragContainer = $("#drag_scroll_container");
            drag = new Draggable({
                node:dragNode
            });

            new Scroll({
                node:dragContainer,
                diff:[10,10]
            }).attach(drag);

            drag.on("drag", function(ev) {
                dragNode.offset(ev);
            });
            dragOffset = dragNode.offset();
            containerOffset = dragContainer.offset();

            scrollTop = dragContainer[0].scrollTop;

        });

        it("should make container autoscroll properly", function() {
            runs(function() {
                jasmine.simulate(dragNode[0], "mousedown", {
                    clientX:dragOffset.left + 20 - DOM.scrollLeft(),
                    clientY:dragOffset.top + 20 - DOM.scrollTop()
                });
            });

            waits(100);

            // 10px move to start
            runs(function() {
                jasmine.simulate(document, "mousemove", {
                    clientX:dragOffset.left + 25 - DOM.scrollLeft(),
                    clientY:dragOffset.top + 25 - DOM.scrollTop()
                });
            });

            waits(100);

            runs(function() {

                jasmine.simulate(document, "mousemove", {
                    clientX:containerOffset.left + 50 - DOM.scrollLeft(),
                    clientY:containerOffset.top + dragContainer[0].offsetHeight - 10
                        + 2 - DOM.scrollTop()
                });


            });


            waits(300);
            runs(function() {
                jasmine.simulate(document, "mouseup");
            });

            waits(300);

            runs(function() {
                if (!UA.webkit) {
                    expect(dragContainer[0].scrollTop).not.toBe(scrollTop);
                }
            });

        });

    });

});
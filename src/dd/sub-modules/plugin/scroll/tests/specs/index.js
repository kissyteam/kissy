/**
 * @module  scroll-spec
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom,  Node, DD, Scroll,IO) {
    var Draggable = DD.Draggable,
        Gesture= S.Event.Gesture,
        UA= S.UA,
        $ = Node.all;
    var ie = document['documentMode'] || UA['ie'];

    describe("scroll", function () {

        var drag, dragNode, dragContainer, dragOffset, containerOffset, scrollTop = 0;

        var html = '';

        IO({
            url: '../specs/scroll.fragment.html',
            async: false,
            success: function (data) {
                html = data;
            }
        });

        $('body').append(html);

        dragNode = $("#drag-scroll");
        dragContainer = $("#drag_scroll_container");
        drag = new Draggable({
            node: dragNode,
            move:1,
            groups:false
        });

        drag.plug(new Scroll({
            node: dragContainer,
            diff: [10, 10]
        }));


        dragOffset = dragNode.offset();
        containerOffset = dragContainer.offset();

        scrollTop = dragContainer[0].scrollTop;

        it("should make container auto scroll properly", function () {

            runs(function () {
                jasmine.simulateForDrag(dragNode[0], Gesture.start, {
                    clientX: dragOffset.left + 20 - Dom.scrollLeft(),
                    clientY: dragOffset.top + 20 - Dom.scrollTop()
                });
            });

            waits(100);

            // 10px move to start
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: dragOffset.left + 25 - Dom.scrollLeft(),
                    clientY: dragOffset.top + 25 - Dom.scrollTop()
                });
            });

            waits(100);

            runs(function () {

                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: containerOffset.left + 50 - Dom.scrollLeft(),
                    clientY: containerOffset.top + dragContainer[0].offsetHeight - 10
                        + 2 - Dom.scrollTop()
                });


            });


            waits(300);
            runs(function () {
                jasmine.simulateForDrag(document, Gesture.end, {
                    clientX: containerOffset.left + 50 - Dom.scrollLeft(),
                    clientY: containerOffset.top + dragContainer[0].offsetHeight - 10
                        + 2 - Dom.scrollTop()
                });
            });

            waits(300);

            runs(function () {
                if (!UA.webkit) {
                    expect(dragContainer[0].scrollTop).not.toBe(scrollTop);
                }
            });

        });

    });

},{
        requires:['dom','node','dd','dd/plugin/scroll','io']
    });
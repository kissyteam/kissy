/**
 * @module  scroll-spec
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom, Event, Node, DD, Scroll, IO) {
    var Draggable = DD.Draggable,
        UA = S.UA,
        $ = Node.all;


    var ie = S.UA.ieMode;
    if (ie == 9 || ie == 11) {
        return;
    }

    describe('scroll', function () {
        var drag, dragNode, dragContainer, dragOffset, containerOffset, scrollTop = 0;

        var html;

        IO({
            url: '../specs/scroll.fragment.html',
            success: function (data) {
                html = data;
                $('body').append(html);
            }
        });

        it("should make container auto scroll properly", function () {
            waitsFor(function () {
                return html;
            });

            runs(function () {
                dragNode = $("#drag-scroll");
                dragContainer = $("#drag_scroll_container");
                drag = new Draggable({
                    node: dragNode,
                    move: 1,
                    groups: false
                });

                drag.plug(new Scroll({
                    node: dragContainer,
                    diff: [10, 10]
                }));

                dragOffset = dragNode.offset();
                containerOffset = dragContainer.offset();

                scrollTop = dragContainer[0].scrollTop;
            });

            runs(function () {
                jasmine.simulate(dragNode[0], 'mousedown', {
                    clientX: dragOffset.left + 20 - Dom.scrollLeft(),
                    clientY: dragOffset.top + 20 - Dom.scrollTop()
                });
            });

            waits(100);

            // 10px move to start
            runs(function () {
                jasmine.simulate(document, 'mousemove', {
                    clientX: dragOffset.left + 25 - Dom.scrollLeft(),
                    clientY: dragOffset.top + 25 - Dom.scrollTop()
                });
            });

            waits(100);

            runs(function () {
                jasmine.simulate(document, 'mousemove', {
                    clientX: containerOffset.left + 50 - Dom.scrollLeft(),
                    clientY: containerOffset.top + dragContainer[0].offsetHeight - 10
                        + 2 - Dom.scrollTop()
                });
            });

            waits(300);
            runs(function () {
                jasmine.simulate(document, 'mouseup', {
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
}, {
    requires: ['dom', 'event', 'node', 'dd', 'dd/plugin/scroll', 'io']
});
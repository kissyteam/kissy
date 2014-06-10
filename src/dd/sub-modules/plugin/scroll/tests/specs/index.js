/**
 * @module  scroll-spec
 * @author yiminghe@gmail.com
 */

var DD = require('dd'),
    Draggable = DD.Draggable,
    UA = require('ua'),
    $ = require('node'),
    IO = require('io'),
    Scroll = require('dd/plugin/scroll'),
    win = $(window);


var ie = UA.ieMode;
if (ie === 9 || ie === 11) {
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

    it('should make container auto scroll properly', function () {
        waitsFor(function () {
            return html;
        });

        runs(function () {
            dragNode = $('#drag-scroll');
            dragContainer = $('#drag_scroll_container');
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
                clientX: dragOffset.left + 20 - win.scrollLeft(),
                clientY: dragOffset.top + 20 - win.scrollTop()
            });
        });

        waits(100);

        // 10px move to start
        runs(function () {
            jasmine.simulate(document, 'mousemove', {
                clientX: dragOffset.left + 25 - win.scrollLeft(),
                clientY: dragOffset.top + 25 - win.scrollTop()
            });
        });

        waits(100);

        runs(function () {
            jasmine.simulate(document, 'mousemove', {
                clientX: containerOffset.left + 50 - win.scrollLeft(),
                clientY: containerOffset.top + dragContainer[0].offsetHeight - 10 + 2 - win.scrollTop()
            });
        });

        waits(300);
        runs(function () {
            jasmine.simulate(document, 'mouseup', {
                clientX: containerOffset.left + 50 - win.scrollLeft(),
                clientY: containerOffset.top + dragContainer[0].offsetHeight - 10 + 2 - win.scrollTop()
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
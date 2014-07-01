/**
 * @module  proxy-spec
 * @author yiminghe@gmail.com
 */
(function(){
var DD = require('dd'),
    Proxy = require('dd/plugin/proxy'),
    Draggable = DD.Draggable,
    $ = require('node'),
    win = $(window);

var ie = require('ua').ieMode;

// ie9 ie11 buggy in simulating mousemove
if (ie === 9 || ie === 11) {
    return;
}

describe('proxy', function () {
    var drag, dragXy, dragNode;

    $(' <div id="drag_proxy" style="position:absolute;' +
        'left:400px;top:400px;' +
        'width:100px;height:100px;' +
        'border:1px solid red;">' +
        'drag' +
        '</div>').appendTo('body');

    drag = new Draggable({
        node: '#drag_proxy',
        move: 1,
        groups: false
    });

    dragNode = drag.get('dragNode');

    drag.plug(new Proxy({
        node: function (drag) {
            var n = $(drag.get('dragNode').clone(false));
            n.css('opacity', 0.2);
            return n;
        }
    }));

    it('should create proxy properly', function () {
        expect(drag.get('node')[0]).toBe(drag.get('dragNode')[0]);

        dragXy = dragNode.offset();
        jasmine.simulate(dragNode[0], 'mousedown', {
            clientX: dragXy.left + 10 - win.scrollLeft(),
            clientY: dragXy.top + 10 - win.scrollTop()
        });

        waits(100);

        // 10px move to start
        runs(function () {
            jasmine.simulate(document, 'mousemove', {
                clientX: dragXy.left + 15 - win.scrollLeft(),
                clientY: dragXy.top + 15 - win.scrollTop()
            });
        });

        waits(400);

        runs(function () {
            expect(drag.get('node')[0]).not.toBe(drag.get('dragNode')[0]);
        });

        runs(function () {
            jasmine.simulate(document, 'mouseup', {
                clientX: dragXy.left + 15 - win.scrollLeft(),
                clientY: dragXy.top + 15 - win.scrollTop()
            });
        });
    });

    runs(function () {
        drag.destroy();
        dragNode.remove();
    });

});
})();
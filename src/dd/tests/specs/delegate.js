/**
 * @module  delegate-spec
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var $ = require('node'),
        win = $(window),
        DD = require('dd'),
        Proxy = require('dd/plugin/proxy'),
        IO = require('io'),
        DraggableDelegate = DD.DraggableDelegate,
        DroppableDelegate = DD.DroppableDelegate;
    var util = require('util');
    var ie = S.UA.ieMode;

    if (ie === 9 || ie === 11) {
        return;
    }

    describe('delegate', function () {
        var html = '';

        IO({
            url: '../specs/delegate.fragment.html',
            async: false,
            success: function (data) {
                html = data;
            }
        });

        var c1, c2, c3;

        $('body').append(html);
        c1 = $('#c1');
        c2 = $('#c2');
        c3 = $('#c3');

        it('should delegate properly', function () {
            var proxy = new Proxy({
                /**
                 * 如何产生替代节点
                 * @param drag 当前拖对象
                 */
                node: function (drag) {
                    var n = $(drag.get('dragNode').clone(true));
                    n.attr('id', util.guid('ks-dd-proxy'));
                    n.css('opacity', 0.2);
                    return n;
                },
                destroyOnEnd: true,
                moveOnEnd: false
            });

            var dragDelegate = new DraggableDelegate({
                container: '#container2',
                handlers: ['.cheader'],
                selector: '.component',
                move: true
            });

            dragDelegate.plug(proxy);

            var dropDelegate = new DroppableDelegate({
                container: '#container2',
                selector: '.component'
            });

            dragDelegate.on('dragover', function (ev) {
                var drag = ev.drag;
                var drop = ev.drop;
                var dragNode = drag.get('dragNode'),
                    dropNode = drop.get('node');
                var middleDropX = (dropNode.offset().left * 2 +
                    dropNode.width()) / 2;
                if (ev.pageX > middleDropX) {
                    var next = dropNode.next();
                    if (next && next[0] === dragNode) {
                    } else {
                        dragNode.insertAfter(dropNode);
                    }
                } else {
                    var prev = dropNode.prev();
                    if (prev && prev[0] === dragNode) {

                    } else {
                        dragNode.insertBefore(dropNode);
                    }
                }
            });

            runs(function () {
                jasmine.simulate(c2.one('.cheader')[0], 'mousedown', {
                    clientX: c2.offset().left + 5 - win.scrollLeft(),
                    clientY: c2.offset().top + 5 - win.scrollTop()
                });
            });

            waits(400);

            // 10px move to start
            runs(function () {
                jasmine.simulate(document, 'mousemove', {
                    clientX: c2.offset().left + 15 - win.scrollLeft(),
                    clientY: c2.offset().top + 15 - win.scrollTop()
                });
            });

            waits(400);
            runs(function () {
                jasmine.simulate(document, 'mousemove', {
                    clientX: c1.offset().left + 5 - win.scrollLeft(),
                    clientY: c1.offset().top + 5 - win.scrollTop()
                });
            });


            waits(400);
            runs(function () {
                jasmine.simulate(document, 'mousemove', {
                    clientX: c1.offset().left + 6 - win.scrollLeft(),
                    clientY: c1.offset().top + 6 - win.scrollTop()
                });
            });


            waits(400);
            runs(function () {
                jasmine.simulate(document, 'mouseup', {
                    clientX: c1.offset().left + 6 - win.scrollLeft(),
                    clientY: c1.offset().top + 6 - win.scrollTop()
                });
            });

            waits(400);
            runs(function () {
                expect($('#container2').children()[0]).toBe(c2[0]);
                // restore
                $('#container2').append(c1);
                $('#container2').append(c2);
                $('#container2').append(c3);
                dragDelegate.destroy();
                dropDelegate.destroy();
            });

        });


        it('disable should works', function () {
            var proxy = new Proxy({
                /**
                 * 如何产生替代节点
                 * @param drag 当前拖对象
                 */
                node: function (drag) {
                    var n = $(drag.get('dragNode').clone(true));
                    n.attr('id', util.guid('ks-dd-proxy'));
                    n.css('opacity', 0.2);
                    return n;
                },
                destroyOnEnd: true,
                moveOnEnd: false
            });

            var dragDelegate = new DraggableDelegate({
                container: '#container2',
                handlers: ['.cheader'],
                selector: '.component',
                move: true,
                disabled: true
            });

            dragDelegate.plug(proxy);

            var dropDelegate = new DroppableDelegate({
                container: '#container2',
                selector: '.component'
            });


            dragDelegate.on('dragover', function (ev) {
                var drag = ev.drag;
                var drop = ev.drop;
                var dragNode = drag.get('dragNode'),
                    dropNode = drop.get('node');
                var middleDropX = (dropNode.offset().left * 2 + dropNode.width()) / 2;
                if (ev.pageX > middleDropX) {
                    var next = dropNode.next();
                    if (next && next[0] === dragNode) {
                    } else {
                        dragNode.insertAfter(dropNode);
                    }
                } else {
                    var prev = dropNode.prev();
                    if (prev && prev[0] === dragNode) {

                    } else {
                        dragNode.insertBefore(dropNode);
                    }
                }
            });

            runs(function () {
                jasmine.simulate(c2.one('.cheader')[0], 'mousedown', {
                    clientX: c2.offset().left + 5 - win.scrollLeft(),
                    clientY: c2.offset().top + 5 - win.scrollTop()
                });
            });

            waits(400);

            // 10px move to start
            runs(function () {
                jasmine.simulate(document, 'mousemove', {
                    clientX: c2.offset().left + 15 - win.scrollLeft(),
                    clientY: c2.offset().top + 15 - win.scrollTop()
                });
            });

            waits(400);
            runs(function () {
                jasmine.simulate(document, 'mousemove', {
                    clientX: c1.offset().left + 5 - win.scrollLeft(),
                    clientY: c1.offset().top + 5 - win.scrollTop()
                });
            });


            waits(400);
            runs(function () {
                jasmine.simulate(document, 'mousemove', {
                    clientX: c1.offset().left + 6 - win.scrollLeft(),
                    clientY: c1.offset().top + 6 - win.scrollTop()
                });
            });


            waits(400);
            runs(function () {
                jasmine.simulate(document, 'mouseup', {
                    clientX: c1.offset().left + 6 - win.scrollLeft(),
                    clientY: c1.offset().top + 6 - win.scrollTop()
                });
            });

            waits(400);
            runs(function () {
                var actual = $('#container2').children()[0];
                expect(actual).toBe(c1[0]);
                // restore
                $('#container2').append(c1);
                $('#container2').append(c2);
                $('#container2').append(c3);
                dragDelegate.destroy();
                dropDelegate.destroy();
            });


        });


    });

});
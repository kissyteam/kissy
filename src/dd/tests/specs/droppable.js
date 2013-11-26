/**
 * @module  droppable-spec
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Event, Node, DD, Droppable, IO) {
    var Dom = S.DOM,
        UA = S.UA,
        DDM = DD.DDM,
        Gesture = Event.Gesture,
        Draggable = DD.Draggable,
        $ = Node.all;



    var ie = S.UA.ieMode;
    if (ie == 9 || ie == 11) {
        return;
    }

    describe("droppable", function () {

        describe(" mode == point", function () {

            var html;

            IO({
                url: '../specs/droppable.fragment.html',
                async: false,
                success: function (data) {
                    html = data;
                }
            });

            var container;

            //beforeEach(function () {
            container = $(html);
            $('body').append(container);
            //});


            //afterEach(function () {
            //    container.remove();
            //});

            var drag, drop, dragNode, dragXy, dropNode, dropXy;
            drag = new Draggable({
                mode: 'point',
                move: 1,
                node: '#drag_mode'
            });

            drop = new Droppable({
                node: "#drop_mode"
            });
            dragNode = drag.get("dragNode");
            dragXy = dragNode.offset();
            dropNode = drop.get("node");
            dropXy = dropNode.offset();

            it("should fire dragenter properly", function () {

                jasmine.simulate(dragNode[0], 'mousedown', {
                    clientX: dragXy.left + 10 - Dom.scrollLeft(),
                    clientY: dragXy.top + 10 - Dom.scrollTop()
                });

                waits(100);

                // 10px move to start
                runs(function () {
                    jasmine.simulate(document, 'mousemove', {
                        clientX: dragXy.left + 15 - Dom.scrollLeft(),
                        clientY: dragXy.top + 15 - Dom.scrollTop()
                    });
                });

                waits(100);

                var callCount = 0, callCountFn;

                runs(function () {
                    drag.on("dragenter", callCountFn = function () {
                        callCount++;
                    });
                });

                runs(function () {
                    jasmine.simulate(document, 'mousemove', {
                        clientX: dropXy.left + 10 - Dom.scrollLeft(),
                        clientY: dropXy.top + 10 - Dom.scrollTop()
                    });
                });

                waits(100);

                var d1, d2;

                //中间不加间隔

                runs(function () {
                    d1 = DDM.get('activeDrop');
                    expect(callCount).toBe(1);
                });

                runs(function () {
                    jasmine.simulate(document, 'mousemove', {
                        clientX: dropXy.left + 20 - Dom.scrollLeft(),
                        clientY: dropXy.top + 20 - Dom.scrollTop()
                    });
                });
                waits(100);
                runs(function () {
                    d2 = DDM.get('activeDrop');
                    expect(callCount).toBe(1);
                    drag.detach("dragenter", callCountFn);
                });

            });

            it("should fire dragover properly", function () {
                if (S.UA.ie == 6) {
                    return;
                }

                var callCount = 0;

                var dragoverSpy = function () {
                    callCount++;
                };


                drag.on("dragover", dragoverSpy);

                jasmine.simulate(document, 'mousemove', {
                    clientX: dropXy.left + 25 - Dom.scrollLeft(),
                    clientY: dropXy.top + 25 - Dom.scrollTop()
                });

                waits(100);

                runs(function () {
                    expect(callCount).toBe(1);
                });
                runs(function () {
                    jasmine.simulate(document, 'mousemove', {
                        clientX: dropXy.left + 20 - Dom.scrollLeft(),
                        clientY: dropXy.top + 20 - Dom.scrollTop()
                    });
                });
                waits(100);

                runs(function () {
                    drag.detach("dragover", dragoverSpy);
                    expect(callCount).toBe(2);
                });
            });


            it("should fire dragexit properly", function () {
                var dragExit = jasmine.createSpy();
                drag.on("dragexit", dragExit);
                jasmine.simulate(document, 'mousemove', {
                    clientX: dropXy.left + 150 - Dom.scrollLeft(),
                    clientY: dropXy.top + 150 - Dom.scrollTop()
                });
                waits(100);
                runs(function () {
                    expect(dragExit.callCount).toBe(1);
                });
            });


            it("should fire dragdrophit properly", function () {
                var dragdropHit = jasmine.createSpy();
                drag.on("dragdrophit", dragdropHit);
                runs(function () {
                    jasmine.simulate(document, 'mousemove', {
                        clientX: dropXy.left + 10 - Dom.scrollLeft(),
                        clientY: dropXy.top + 10 - Dom.scrollTop()
                    });
                });

                waits(100);

                runs(function () {
                    jasmine.simulate(document, 'mouseup', {
                        clientX: dropXy.left + 10 - Dom.scrollLeft(),
                        clientY: dropXy.top + 10 - Dom.scrollTop()
                    });
                });
                waits(100);

                runs(function () {
                    expect(dragdropHit.callCount).toBe(1);
                });
            });


            it("should fire dragdropmiss properly", function () {
                var dragdropMiss = jasmine.createSpy();

                dragXy = dragNode.offset();
                jasmine.simulate(dragNode[0], 'mousedown', {
                    clientX: dragXy.left + 10 - Dom.scrollLeft(),
                    clientY: dragXy.top + 10 - Dom.scrollTop()
                });

                waits(100);

                // 10px move to start
                runs(function () {
                    jasmine.simulate(document, 'mousemove', {
                        clientX: dragXy.left + 15 - Dom.scrollLeft(),
                        clientY: dragXy.top + 15 - Dom.scrollTop()
                    });
                });

                waits(100);

                runs(function () {
                    drag.on("dragdropmiss", dragdropMiss);
                    jasmine.simulate(document, 'mousemove', {
                        clientX: dropXy.left + 150 - Dom.scrollLeft(),
                        clientY: dropXy.top + 150 - Dom.scrollTop()
                    });
                });

                waits(100);

                runs(function () {
                    jasmine.simulate(document, 'mouseup', {
                        clientX: dropXy.left + 150 - Dom.scrollLeft(),
                        clientY: dropXy.top + 150 - Dom.scrollTop()
                    });
                });

                waits(100);

                runs(function () {
                    expect(dragdropMiss.callCount).toBe(1);
                });

                runs(function () {
                    Node.one("#drag_mode").remove();
                    Node.one("#drop_mode").remove();
                });
            });

        });
    });
}, {
    requires: ['event', 'node', 'dd', 'dd/droppable', 'io']
});

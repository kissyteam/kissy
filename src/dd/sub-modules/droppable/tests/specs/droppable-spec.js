/**
 * @module  droppable-spec
 * @author yiminghe@gmail.com
 */
KISSY.use("ua,node,dd/base,dd/droppable", function (S, UA, Node, DD, Droppable) {
    var DOM = S.DOM,
        DDM = DD.DDM,
        Gesture = S.Event.Gesture,
        Draggable = DD.Draggable;

    var ie = document['documentMode'] || UA['ie'];


    describe("droppable", function () {

        describe(" mode == point", function () {
            var drag, drop, dragNode, dragXy, dropNode, dropXy;
            drag = new Draggable({
                mode: 'point',
                node: '#drag_mode'
            });

            drag.on("drag", function (ev) {
                drag.get("dragNode").offset(ev);
            });

            drop = new Droppable({
                node: "#drop_mode"
            });
            dragNode = drag.get("dragNode");
            dragXy = dragNode.offset();
            dropNode = drop.get("node");
            dropXy = dropNode.offset();

            it("should fire dragenter properly", function () {

                jasmine.simulateForDrag(dragNode[0], Gesture.start, {
                    clientX: dragXy.left + 10 - DOM.scrollLeft(),
                    clientY: dragXy.top + 10 - DOM.scrollTop()
                });

                waits(100);

                // 10px move to start
                runs(function () {
                    jasmine.simulateForDrag(document, Gesture.move, {
                        clientX: dragXy.left + 15 - DOM.scrollLeft(),
                        clientY: dragXy.top + 15 - DOM.scrollTop()
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
                    jasmine.simulateForDrag(document, Gesture.move, {
                        clientX: dropXy.left + 10 - DOM.scrollLeft(),
                        clientY: dropXy.top + 10 - DOM.scrollTop()
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
                    jasmine.simulateForDrag(document, Gesture.move, {
                        clientX: dropXy.left + 20 - DOM.scrollLeft(),
                        clientY: dropXy.top + 20 - DOM.scrollTop()
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

                var dragoverSpy = jasmine.createSpy();


                drag.on("dragover", dragoverSpy);

                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: dropXy.left + 25 - DOM.scrollLeft(),
                    clientY: dropXy.top + 25 - DOM.scrollTop()
                });

                waits(100);

                runs(function () {
                    expect(dragoverSpy.callCount).toBe(1);
                });
                runs(function () {
                    jasmine.simulateForDrag(document, Gesture.move, {
                        clientX: dropXy.left + 20 - DOM.scrollLeft(),
                        clientY: dropXy.top + 20 - DOM.scrollTop()
                    });
                });
                waits(100);

                runs(function () {
                    drag.detach("dragover", dragoverSpy);
                    expect(dragoverSpy.callCount).toBe(2);
                });
            });


            it("should fire dragexit properly", function () {
                var dragExit = jasmine.createSpy();
                drag.on("dragexit", dragExit);
                jasmine.simulateForDrag(document, Gesture.move, {
                    clientX: dropXy.left + 150 - DOM.scrollLeft(),
                    clientY: dropXy.top + 150 - DOM.scrollTop()
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
                    jasmine.simulateForDrag(document, Gesture.move, {
                        clientX: dropXy.left + 10 - DOM.scrollLeft(),
                        clientY: dropXy.top + 10 - DOM.scrollTop()
                    });
                });

                waits(100);

                runs(function () {
                    jasmine.simulateForDrag(document, Gesture.end);
                });
                waits(100);

                runs(function () {
                    expect(dragdropHit.callCount).toBe(1);
                });
            });


            it("should fire dragdropmiss properly", function () {
                var dragdropMiss = jasmine.createSpy();

                dragXy = dragNode.offset();
                jasmine.simulateForDrag(dragNode[0], Gesture.start, {
                    clientX: dragXy.left + 10 - DOM.scrollLeft(),
                    clientY: dragXy.top + 10 - DOM.scrollTop()
                });

                waits(100);

                // 10px move to start
                runs(function () {
                    jasmine.simulateForDrag(document, Gesture.move, {
                        clientX: dragXy.left + 15 - DOM.scrollLeft(),
                        clientY: dragXy.top + 15 - DOM.scrollTop()
                    });
                });

                waits(100);

                runs(function () {
                    drag.on("dragdropmiss", dragdropMiss);
                    jasmine.simulateForDrag(document, Gesture.move, {
                        clientX: dropXy.left + 150 - DOM.scrollLeft(),
                        clientY: dropXy.top + 150 - DOM.scrollTop()
                    });
                });

                waits(100);

                runs(function () {
                    jasmine.simulateForDrag(document, Gesture.end);
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

});

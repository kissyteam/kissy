/**
 * mouseenter tc
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,event/dom/base", function (S, DOM, Event) {

    var simulate = function (target, type, relatedTarget) {
        if (typeof target === 'string') {
            target = DOM.get(target);
        }
        jasmine.simulate(target, type, { relatedTarget: relatedTarget });
    };

    var tpl = '<div id="event-test-data">\
    <div style="margin-top: 10px; padding: 30px; background-color: #e3e4e5">\
            <div id="outer" style="padding: 20px; background-color: #D6EDFC">\
                <div id="inner" style="padding: 20px; background-color: #FFCC00"></div>\
            </div>\
        </div>\
        <style>\
        .mouse-test {\
            width: 100px;\
            height: 100px;\
            margin: 10px;\
            background-color: yellow;\
            border: 1px solid red;\
        }\
        </style>\
        <div class="mouse-test" id="mouse-test1">\
        </div>\
        <div class="mouse-test" id="mouse-test2">\
        </div>\
        </div>';

    describe('mouseenter', function () {

        beforeEach(function () {
            DOM.prepend(DOM.create(tpl), 'body');
        });

        afterEach(function () {
            DOM.remove('#event-test-data');
        });

        describe('on simply works', function () {

            it('should trigger the mouseenter event on the proper element.', function () {
                var outer = DOM.get('#outer'),
                    inner = DOM.get('#inner'),
                    container = outer.parentNode;

                var outerCount = 0, innerCount = 0, type = 'mouseover';


                Event.on(outer, 'mouseenter', function () {
                    outerCount++;
                });

                Event.on(inner, 'mouseenter', function () {
                    innerCount++;
                });

                // move mouse from the container element to the outer element once
                simulate(outer, type, container);

                // move mouse from the outer element to the inner element twice
                simulate(inner, type, outer);
                simulate(inner, type, outer);

                waits(100);

                runs(function () {
                        expect(outerCount).toEqual(1);
                        expect(innerCount).toEqual(2);
                });
            });

            it('should trigger the mouseleave event on the proper element.', function () {
                var outer = DOM.get('#outer'),
                    inner = DOM.get('#inner'),
                    container = outer.parentNode;

                var outerCount = 0, innerCount = 0, type = 'mouseout';

                Event.on(outer, 'mouseleave', function () {
                    outerCount++;
                });
                Event.on(inner, 'mouseleave', function () {
                    innerCount++;
                });

                // move mouse from the inner element to the outer element once
                simulate(inner, type, outer);

                // move mouse from the outer element to the container element
                simulate(outer, type, container);
                simulate(outer, type, outer.parentNode);

                waits(0);

                runs(function () {
                        expect(outerCount).toEqual(2);
                        expect(innerCount).toEqual(1);
                });
            });

            it('support multiple on for mouseenter', function () {

                var enter=[],
                    leave=[],
                    mouseTests=DOM.query('.mouse-test');

                Event.on('.mouse-test','mouseenter',function(e){
                    expect(e.type).toBe('mouseenter');
                    enter.push(e.target.id);
                });

                Event.on('.mouse-test','mouseleave',function(e){
                    expect(e.type).toBe('mouseleave');
                    leave.push(e.target.id);
                });

                runs(function(){
                    simulate(mouseTests[0], 'mouseover', document);
                });

                waits(10);

                runs(function(){
                    simulate(mouseTests[1], 'mouseover', document);
                });

                waits(10);

                runs(function(){
                    simulate(mouseTests[0], 'mouseout', document);
                });

                waits(10);

                runs(function(){
                    simulate(mouseTests[1], 'mouseout', document);
                });

                waits(10);

                runs(function(){
                    expect(enter).toEqual(['mouse-test1','mouse-test2']);
                    expect(leave).toEqual(['mouse-test1','mouse-test2']);
                });

            });

        });


        describe('clone works', function () {
            it("can clone mouseenter", function () {
                var html = '<div class="t89561" id="t89561" style="width: 200px;height: 200px;border: 1px solid red;margin: 50px;">' +
                    '<div class="t895612" style="width: 100px;height: 100px;border: 1px solid green;margin: 50px;">' +
                    ' </div>' +
                    ' </div>';

                DOM.append(DOM.create(html), document.body);

                var ret = [];

                Event.on("#t89561", "mouseenter", function (e) {
                    expect(e.type).toBe('mouseenter');
                    ret.push(1);
                });

                var n;

                DOM.append(n = DOM.clone("#t89561", 1, 1, 1), document.body);

                n.id = "";

                DOM.remove(DOM.get("#t89561"));

                n.id = "t89561";

                var v = DOM.children("#t89561")[0];

                // 2012-03-31 bug : clone does not clone originalType
                // lose check
                simulate(n, "mouseover",v);

                waits(100);

                runs(function () {
                    expect(ret.length).toBe(0);

                    DOM.remove('#t89561');
                });
            });
        });

        describe('delegate works', function () {

            it("should delegate mouseenter/leave properly", function () {
                var t = S.now();
                var code = "<div id='d1" + t + "' style='width:500px;height:500px;border:1px solid red;'>" +
                    "<div id='d2" + t + "' class='t' style='width:300px;height:300px;margin:150px;border:1px solid green;'>" +
                    "<div id='d3" + t + "' style='width:100px;height:100px;margin:150px;border:1px solid black;'>" +
                    "</div>" +
                    "</div>" +
                    "</div>";
                DOM.append(DOM.create(code), document.body);
                var d1 = DOM.get("#d1" + t),
                    d2 = DOM.get("#d2" + t),
                    d3 = DOM.get("#d3" + t);

                t = "";
                var type = "";
                Event.delegate(d1, 'mouseenter', '.t', function (e) {
                    type = e.type;
                    t = e.target.id;
                });

                simulate(d1, "mouseover", document);

                waits(100);

                runs(function () {
                    expect(t).toBe("");
                    expect(type).toBe("");
                    t = "";
                    type = "";
                    simulate(d2, "mouseover", d1);
                });


                waits(100);

                runs(function () {
                    expect(t).toBe(d2.id);
                    expect(type).toBe("mouseenter");
                    t = "";
                    type = "";
                    simulate(d3, "mouseover", d2);
                });

                waits(100);

                runs(function () {
                    expect(t).toBe("");
                    expect(type).toBe("");
                    DOM.remove(d1);
                });
            });
        });

        describe('fire', function () {
            it("works for mouseenter/leave", function () {

                var n = DOM.create("<div/>"), ret=0;
                Event.on(n, "mouseenter", function (e) {
                    expect(e.type).toBe('mouseenter');
                    ret = 1
                });
                Event.fire(n, "mouseenter", {
                    relatedTarget: document
                });

                expect(ret).toBe(1);

                Event.detach(n);

            });
        });

    });
});
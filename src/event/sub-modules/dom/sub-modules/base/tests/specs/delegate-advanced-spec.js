/**
 * @module  delegation-spec
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,event/dom/base", function (S, DOM, Event) {

    S.get = DOM.get;
    S.query = DOM.query;

    describe('delegate-advanced', function () {

        beforeEach(function () {
            DOM.append(DOM.create("<div id='delegateAdvanced' class='a'>" +
                "<div id='delegateAdvanced0' class='b'>" +
                "<div id='delegateAdvanced1' class='c'>" +
                "<input id='delegateAdvanced2' class='d' type='button'/>" +
                "</div>" +
                "</div>" +
                "</div>"), document.body);
        });

        afterEach(function () {
            DOM.remove("#delegateAdvanced");
        });

        it("should call delegate before on", function () {
            var ret = [];
            Event.on("#delegateAdvanced", "click", function () {
                ret.push(2);
            });
            Event.delegate("#delegateAdvanced", "click", "input", function () {
                ret.push(1);
            });
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([1, 2]);
            });
        });

        it("should stop delegation", function () {
            var ret = [];
            Event.on("#delegateAdvanced", "click", function () {
                ret.push(3);
            });
            Event.on("#delegateAdvanced2", "click", function (e) {
                ret.push(1);
                e.stopPropagation();
            });
            Event.delegate("#delegateAdvanced", "click", "input", function () {
                ret.push(2);
            });
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([1]);
            });
        });

        it("should stop between delegation", function () {
            var ret = [];
            Event.on("#delegateAdvanced", "click", function () {
                ret.push(4);
            });
            Event.delegate("#delegateAdvanced", "click", "input", function (e) {
                ret.push(1);
                e.stopPropagation();
            });
            Event.delegate("#delegateAdvanced", "click", "input", function () {
                ret.push(2);
            });
            Event.delegate("#delegateAdvanced", "click", ".c", function () {
                ret.push(3);
            });
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([1, 2]);
            });
        });

        it("should stopImmediatePropagation between delegation", function () {
            var ret = [];
            Event.on("#delegateAdvanced", "click", function () {
                ret.push(4);
            });
            Event.delegate("#delegateAdvanced", "click", "input", function (e) {
                ret.push(1);
                e.stopImmediatePropagation();
            });
            Event.delegate("#delegateAdvanced", "click", "input", function () {
                ret.push(2);
            });
            Event.delegate("#delegateAdvanced", "click", ".c", function () {
                ret.push(3);
            });
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([1]);
            });
        });

        it("should undelegate only delegates", function () {
            var ret = [];
            Event.delegate("#delegateAdvanced", "click", "input", function () {
                ret.push(1);
            });
            Event.delegate("#delegateAdvanced", "click", ".c", function () {
                ret.push(2);
            });
            Event.delegate("#delegateAdvanced", "focus", ".c", function () {
                ret.push(4);
            });
            Event.on("#delegateAdvanced", "click", function () {
                ret.push(3);
            });
            Event.undelegate("#delegateAdvanced");
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([3]);
            });
            runs(function () {
                ret = [];
                DOM.get("#delegateAdvanced2").focus();
            });
            waits(100);
            runs(function () {
                expect(ret).toEqual([]);
            });
        });

        it("should undelegate specified selector with eventType only delegates", function () {
            var ret = [];
            Event.delegate("#delegateAdvanced", "click", "input", function () {
                ret.push(1);
            });
            Event.delegate("#delegateAdvanced", "click", "input", function () {
                ret.push(4);
            });
            Event.delegate("#delegateAdvanced", "click", ".c", function () {
                ret.push(2);
            });
            Event.on("#delegateAdvanced", "click", function () {
                ret.push(3);
            });
            Event.undelegate("#delegateAdvanced", "click", "input");
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([2, 3]);
            });
        });

        it("should undelegate specified selector only delegates", function () {
            var ret = [];
            Event.delegate("#delegateAdvanced", "click", "input", function () {
                ret.push(1);
            });
            Event.delegate("#delegateAdvanced", "click", "input", function () {
                ret.push(4);
            });
            Event.delegate("#delegateAdvanced", "click", ".c", function () {
                ret.push(2);
            });
            Event.on("#delegateAdvanced", "click", function () {
                ret.push(3);
            });
            Event.delegate("#delegateAdvanced", "focus", "input", function () {
                ret.push(5);
            });
            Event.undelegate("#delegateAdvanced", null, "input");
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([2, 3]);
            });
            runs(function () {
                ret = [];
                DOM.get("#delegateAdvanced2").focus();
            });
            waits(100);
            runs(function () {
                expect(ret).toEqual([]);
            });
        });


        it("should undelegate specified fn only delegates", function () {
            var ret = [], t;
            Event.delegate("#delegateAdvanced", "click", "input", t = function () {
                ret.push(1);
            });
            Event.delegate("#delegateAdvanced", "click", ".c", function () {
                ret.push(2);
            });
            Event.on("#delegateAdvanced", "click", function () {
                ret.push(3);
            });
            Event.undelegate("#delegateAdvanced", "click", "input", t);
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([2, 3]);
            });
        });


        it("should undelegate specified eventType only delegates", function () {
            var ret = [];
            Event.delegate("#delegateAdvanced", "click", "input", function () {
                ret.push(1);
            });
            Event.delegate("#delegateAdvanced", "click", ".c", function () {
                ret.push(2);
            });
            Event.delegate("#delegateAdvanced", "focusin", ".c", function () {
                ret.push(4);
            });
            Event.on("#delegateAdvanced", "click", function () {
                ret.push(3);
            });
            Event.undelegate("#delegateAdvanced", "click");
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([3]);
            });
            runs(function () {
                ret = [];
                DOM.get("#delegateAdvanced2").focus();
            });
            waits(100);
            runs(function () {
                expect(ret).toEqual([4]);
            });
        });

        it("remove remove delegate", function () {
            var ret = [];
            Event.delegate("#delegateAdvanced", "click", "input", function () {
                ret.push(1);
            });
            Event.remove("#delegateAdvanced");
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([]);
            });
        });

        it("remove remove delegate with event", function () {
            var ret = [];
            Event.delegate("#delegateAdvanced", "click", "input", function () {
                ret.push(1);
            });
            Event.remove("#delegateAdvanced","click");
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([]);
            });
        });

        it("remove remove delegate with fn", function () {
            var ret = [],t;
            Event.delegate("#delegateAdvanced", "click", "input", t=function () {
                ret.push(1);
            });
            Event.remove("#delegateAdvanced",undefined,t);
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([]);
            });
        });

        it("remove remove delegate with event and fn", function () {
            var ret = [],t;
            Event.delegate("#delegateAdvanced", "click", "input", t=function () {
                ret.push(1);
            });
            Event.remove("#delegateAdvanced","click",t);
            DOM.get("#delegateAdvanced2").click();
            waits(100);
            runs(function () {
                expect(ret).toEqual([]);
            });
        });


    });
});
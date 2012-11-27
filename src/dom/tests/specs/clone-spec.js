KISSY.use("dom,event,core", function (S, DOM, Event) {
    var $ = S.all, UA = S.UA;
    describe("clone", function () {

        it("works for checkbox", function () {
            var checkbox = DOM.create("<input type='checkbox' checked='checked' />");
            DOM.append(checkbox, "#test_cases");
            DOM.data(checkbox, "custom", 1);
            var cloned = DOM.clone(checkbox);
            expect(DOM.data(checkbox, "custom")).toBe(1);
            expect(cloned.checked).toBe(true);
            expect(DOM.data(cloned, "custom")).toBe(undefined);
            expect(DOM.val(cloned)).toBe("on");
        });

        //http://msdn.microsoft.com/en-us/library/ms533718%28v=vs.85%29.aspx
        it("works for defaultValue", function () {
            var input = DOM.create("<input type='text' value='x' />");
            input.defaultValue = "y";
            input.value = "x";
            DOM.append(input, "#test_cases");
            var cloned = DOM.clone(input);
            expect(cloned.defaultValue).toBe('y');
            expect(cloned.value).toBe('x');
        });

        // ie
        if (window.ActiveXObject && UA.ie < 9) {
            it("works for classid", function () {
                var flash = '<object ' +
                    'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ' +
                    'width="550" ' +
                    'height="400" ' +
                    'id="movie_name" align="middle">' +
                    '<param name="movie" value="movie_name.swf"/>' +
                    '<' + '/object>';
                var el = DOM.create(flash);
                DOM.append(el, "body");
                expect(DOM.attr(el.firstChild, "value")).toBe("movie_name.swf");
                var cloned = DOM.clone(el);
                expect(DOM.attr(cloned.firstChild, "value")).toBe("movie_name.swf");
                DOM.remove(el);
            });
        } else {
            it("works for flash", function () {
                var flash = '<object class="holiday-logo"' +
                    ' data="http://img01.taobaocdn.com/tps/i1/T12MVIXfVNXXXXXXXX.swf" ' +
                    'height="68" name="holiday-logo" type="application/x-shockwave-flash" ' +
                    'width="300"><param name="wmode" value="transparent" />' +
                    '<a href="http://www.taobao.com/" style="height: 43px; margin-left: 56px;"' +
                    ' target="_top"> 淘宝网 <img alt="淘宝网" height="110" ' +
                    'src="http://www.taobao.com/" ' +
                    'title="Taobao.com - 阿里巴巴旗下网站" width="167" /> </a>' +
                    '</object>';
                var el = DOM.create(flash);
                DOM.append(el, "body");
                expect(DOM.attr(el.firstChild, "value")).toBe("transparent");
                expect(DOM.attr(el, "data"))
                    .toBe("http://img01.taobaocdn.com/tps/i1/T12MVIXfVNXXXXXXXX.swf");
                var cloned = DOM.clone(el, true);
                expect(DOM.attr(cloned.firstChild, "value")).toBe("transparent");
                expect(DOM.attr(cloned, "data"))
                    .toBe("http://img01.taobaocdn.com/tps/i1/T12MVIXfVNXXXXXXXX.swf");
                DOM.remove(el);
            });
        }

        it("works with data and event", function () {
            var div = DOM.create("<div><" + "/div>");
            DOM.append(div, "body");
            var x = {x: 1};
            DOM.data(div, "web", x);
            DOM.data(div, "web2", 2);

            var d = 1;

            Event.on(div, "click", function () {
                d++;
            });

            Event.fire(div, "click", undefined, true);

            expect(d).toBe(2);

            var cloned = DOM.clone(div, {
                deep: false,
                withDataAndEvent: true
            });
            expect(DOM.data(cloned, "web").x).toBe(1);
            expect(DOM.data(cloned, "web2")).toBe(2);

            x.x = 3;
            DOM.data(div, "web2", 4);

            expect(DOM.data(div, "web").x).toBe(3);
            expect(DOM.data(div, "web2")).toBe(4);

            // 可见克隆的 data 为引用
            expect(DOM.data(cloned, "web").x).toBe(3);
            expect(DOM.data(cloned, "web2")).toBe(2);

            Event.fire(cloned, "click", undefined, true);
            expect(d).toBe(3);

            DOM.append(cloned, "body");

            jasmine.simulate(cloned, "click");

            waits(500);

            runs(function () {
                expect(d).toBe(4);

                DOM.remove(cloned);
                DOM.remove(div);
            });

        });


        it("works with data and event when deep", function () {
            var div = DOM.create("<div><span><" + "/span><" + "/div>");
            var span = DOM.get("span", div);
            DOM.append(div, "body");
            var x = {x: 1};
            DOM.data(span, "web", x);
            DOM.data(span, "web2", 2);

            var d = 1;

            Event.on(span, "click", function () {
                d++;
            });

            Event.fire(span, "click", undefined, true);

            expect(d).toBe(2);

            var cloned = DOM.clone(div, {
                    withDataAndEvent: true,
                    deep: true,
                    deepWithDataAndEvent: true
                }),
                clonedSpan = DOM.get("span", cloned);

            expect(DOM.data(clonedSpan, "web").x).toBe(1);
            expect(DOM.data(clonedSpan, "web2")).toBe(2);

            x.x = 3;
            DOM.data(span, "web2", 4);

            expect(DOM.data(span, "web").x).toBe(3);
            expect(DOM.data(span, "web2")).toBe(4);

            // 可见克隆的 data 为引用
            expect(DOM.data(clonedSpan, "web").x).toBe(3);
            expect(DOM.data(clonedSpan, "web2")).toBe(2);

            Event.fire(clonedSpan, "click", undefined, true);
            expect(d).toBe(3);

            DOM.append(cloned, "body");

            jasmine.simulate(clonedSpan, "click");

            waits(500);

            runs(function () {
                expect(d).toBe(4);
                DOM.remove(cloned);
                DOM.remove(div);
            });

        });

        it('does not mess event with cloned src element', function () {
            var div = DOM.create("<div><span id='t1'><" + "/span><" + "/div>");

            var span = DOM.get("span", div);

            DOM.append(div, "body");

            var d = {
                t1: 1,
                t2: 1
            };

            Event.on(span, "click", function () {
                d[this.id]++;
            });


            var span2 = DOM.clone(span, {
                withDataAndEvent: true,
                deep: true,
                deepWithDataAndEvent: true
            });

            Event.on(span2, 'click', function () {
            });

            span2.id = 't2';

            DOM.append(span2, "body");

            jasmine.simulate(span2, 'click');

            waits(100);

            runs(function () {

                expect(d.t1).toBe(1);
                expect(d.t2).toBe(2);

            });

            runs(function () {

                jasmine.simulate(span, 'click');

            });

            waits(100);

            runs(function () {

                expect(d.t1).toBe(2);
                expect(d.t2).toBe(2);

            });
        });


        it('does not mess event with cloned src element by firing', function () {
            var div = DOM.create("<div><span id='t1'><" + "/span><" + "/div>");

            var span = DOM.get("span", div);

            DOM.append(div, "body");

            var d = {
                t1: 1,
                t2: 1
            };

            Event.on(span, "click", function () {
                d[this.id]++;
            });

            var span2 = DOM.clone(span, {
                withDataAndEvent: true,
                deep: true,
                deepWithDataAndEvent: true
            });

            span2.id = 't2';

            DOM.append(span2, "body");

            Event.fire(span2, 'click');

            waits(100);

            runs(function () {

                expect(d.t1).toBe(1);
                expect(d.t2).toBe(2);

            });
        });

    });
});
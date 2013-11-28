KISSY.add(function (S, Dom, Event) {
    var UA = S.UA;

    describe("clone", function () {
        it("works for checkbox", function () {
            var checkbox = Dom.create("<input type='checkbox' checked='checked' />");
            Dom.append(checkbox, "#test_cases");
            Dom.data(checkbox, "custom", 1);
            var cloned = Dom.clone(checkbox);
            expect(Dom.data(checkbox, "custom")).toBe(1);
            expect(cloned.checked).toBe(true);
            expect(Dom.data(cloned, "custom")).toBe(undefined);
            expect(Dom.val(cloned)).toBe("on");
            Dom.remove(checkbox);
        });

        it('works for single textarea', function () {
            var input = Dom.create("<textarea></textarea>");
            Dom.append(input, "#test_cases");
            input.defaultValue = 'y';
            input.value = 'x';
            var cloned = Dom.clone(input);
            expect(cloned.defaultValue).toBe('y');
            expect(cloned.value).toBe('x');
            Dom.append(cloned, "#test_cases");
            Dom.remove(input);
            Dom.remove(cloned);
        });

        it('works for nested textarea', function () {
            var input = Dom.create("<div><textarea></textarea></div>");
            Dom.append(input, "#test_cases");
            input=Dom.get('textarea',input);
            input.defaultValue = 'y';
            input.value = 'x';
            var cloned = Dom.clone(input,true);
            expect(cloned.defaultValue).toBe('y');
            expect(cloned.value).toBe('x');
            Dom.append(cloned, "#test_cases");
            Dom.remove(input);
            Dom.remove(cloned);
        });

        //http://msdn.microsoft.com/en-us/library/ms533718%28v=vs.85%29.aspx
        it("works for defaultValue", function () {
            var input = Dom.create("<input type='text' value='x' />");
            input.defaultValue = 'y';
            input.value = 'x';
            Dom.append(input, "#test_cases");
            var cloned = Dom.clone(input);
            expect(cloned.defaultValue).toBe('y');
            expect(cloned.value).toBe('x');
            Dom.remove(input);
        });

        // ie
        if (window.ActiveXObject && UA.ieMode < 9) {
            it("works for classid", function () {
                var flash = '<object ' +
                    'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ' +
                    'width="550" ' +
                    'height="400" ' +
                    'id="movie_name" align="middle">' +
                    '<param name="movie" value="movie_name.swf"/>' +
                    '<' + '/object>';
                var el = Dom.create(flash);
                Dom.append(el, 'body');
                expect(Dom.attr(el.firstChild, 'value')).toBe("movie_name.swf");
                var cloned = Dom.clone(el);
                expect(Dom.attr(cloned.firstChild, 'value')).toBe("movie_name.swf");
                Dom.remove(el);
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
                var el = Dom.create(flash);
                Dom.append(el, 'body');
                expect(Dom.attr(el.firstChild, 'value')).toBe("transparent");
                expect(Dom.attr(el, 'data'))
                    .toBe("http://img01.taobaocdn.com/tps/i1/T12MVIXfVNXXXXXXXX.swf");
                var cloned = Dom.clone(el, true);
                expect(Dom.attr(cloned.firstChild, 'value')).toBe("transparent");
                expect(Dom.attr(cloned, 'data'))
                    .toBe("http://img01.taobaocdn.com/tps/i1/T12MVIXfVNXXXXXXXX.swf");
                Dom.remove(el);
            });
        }

        it("works with data and event", function () {
            var div = Dom.create("<div><" + "/div>");
            Dom.append(div, 'body');
            var x = {x: 1};
            Dom.data(div, "web", x);
            Dom.data(div, "web2", 2);
            var d = 1;
            Event.on(div, 'click', function () {
                d++;
            });
            Event.fire(div, 'click', undefined, true);
            expect(d).toBe(2);
            var cloned = Dom.clone(div, {
                deep: false,
                withDataAndEvent: true
            });
            expect(Dom.data(cloned, "web").x).toBe(1);
            expect(Dom.data(cloned, "web2")).toBe(2);
            x.x = 3;
            Dom.data(div, "web2", 4);

            expect(Dom.data(div, "web").x).toBe(3);
            expect(Dom.data(div, "web2")).toBe(4);

            // 可见克隆的 data 为引用
            expect(Dom.data(cloned, "web").x).toBe(3);
            expect(Dom.data(cloned, "web2")).toBe(2);

            Event.fire(cloned, 'click', undefined, true);
            expect(d).toBe(3);

            Dom.append(cloned, 'body');

            jasmine.simulate(cloned, 'click');

            waits(500);

            runs(function () {
                expect(d).toBe(4);
                Dom.remove(cloned);
                Dom.remove(div);
            });
        });

        it("works with data and event when deep", function () {
            var div = Dom.create("<div><span><" + "/span><" + "/div>");
            var span = Dom.get("span", div);
            Dom.append(div, 'body');
            var x = {x: 1};
            Dom.data(span, "web", x);
            Dom.data(span, "web2", 2);

            var d = 1;

            Event.on(span, 'click', function () {
                d++;
            });

            Event.fire(span, 'click', undefined, true);

            expect(d).toBe(2);

            var cloned = Dom.clone(div, {
                    withDataAndEvent: true,
                    deep: true,
                    deepWithDataAndEvent: true
                }),
                clonedSpan = Dom.get("span", cloned);

            expect(Dom.data(clonedSpan, "web").x).toBe(1);
            expect(Dom.data(clonedSpan, "web2")).toBe(2);

            x.x = 3;
            Dom.data(span, "web2", 4);

            expect(Dom.data(span, "web").x).toBe(3);
            expect(Dom.data(span, "web2")).toBe(4);

            // 可见克隆的 data 为引用
            expect(Dom.data(clonedSpan, "web").x).toBe(3);
            expect(Dom.data(clonedSpan, "web2")).toBe(2);

            Event.fire(clonedSpan, 'click', undefined, true);
            expect(d).toBe(3);

            Dom.append(cloned, 'body');

            jasmine.simulate(clonedSpan, 'click');

            waits(500);

            runs(function () {
                expect(d).toBe(4);
                Dom.remove(cloned);
                Dom.remove(div);
            });
        });

        it('does not mess event with cloned src element', function () {
            var div = Dom.create("<div><span id='t1'><" + "/span><" + "/div>");

            var span = Dom.get("span", div);

            Dom.append(div, 'body');

            var d = {
                t1: 1,
                t2: 1
            };

            Event.on(span, 'click', function () {
                d[this.id]++;
            });

            var span2 = Dom.clone(span, {
                withDataAndEvent: true,
                deep: true,
                deepWithDataAndEvent: true
            });

            Event.on(span2, 'click', function () {
            });

            span2.id = 't2';

            Dom.append(span2, 'body');

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
            var div = Dom.create("<div><span id='t1'><" + "/span><" + "/div>");

            var span = Dom.get("span", div);

            Dom.append(div, 'body');

            var d = {
                t1: 1,
                t2: 1
            };

            Event.on(span, 'click', function () {
                d[this.id]++;
            });

            var span2 = Dom.clone(span, {
                withDataAndEvent: true,
                deep: true,
                deepWithDataAndEvent: true
            });

            span2.id = 't2';

            Dom.append(span2, 'body');

            Event.fire(span2, 'click');

            waits(100);

            runs(function () {
                expect(d.t1).toBe(1);
                expect(d.t2).toBe(2);
            });
        });
    });
},{
    requires:['dom','event']
});
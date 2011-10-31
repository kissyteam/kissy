KISSY.use("dom,event", function(S, DOM, Event) {
    describe("clone", function() {

        it("works for checkbox", function() {
            var checkbox = DOM.create("<input type='checkbox' checked='checked' />");
            DOM.append(checkbox, "#test_cases");
            DOM.data(checkbox, "custom", 1);
            var cloned = DOM.clone(checkbox);
            expect(DOM.data(checkbox, "custom")).toBe(1);
            expect(cloned.checked).toBe(true);
            expect(DOM.data(cloned, "custom")).toBe(undefined);
            expect(cloned.value).toBe("on");
        });

        //http://msdn.microsoft.com/en-us/library/ms533718%28v=vs.85%29.aspx
        it("works for defaultValue", function() {
            var input = DOM.create("<input type='text' value='x' />");
            input.defaultValue = "y";
            input.value = "x";
            DOM.append(input, "#test_cases");
            var cloned = DOM.clone(input);
            expect(cloned.defaultValue).toBe('y');
            expect(cloned.value).toBe('x');
        });

        // ie
        if (window.ActiveXObject) {
            it("works for classid", function() {
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
            });
        }

        it("works with data and event", function() {
            var div = DOM.create("<div><" + "/div>");
            DOM.append(div, "body");
            var x = {x:1};
            DOM.data(div, "web", x);
            DOM.data(div, "web2", 2);

            var d = 1;

            Event.on(div, "click", function() {
                d++;
            });

            Event.fire(div, "click", undefined, true);

            expect(d).toBe(2);

            var cloned = DOM.clone(div, false, true);
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

            runs(function() {
                expect(d).toBe(4);
            });

        });


        it("works with data and event when deep", function() {
            var div = DOM.create("<div><span><" + "/span><" + "/div>");
            var span = DOM.get("span", div);
            DOM.append(div, "body");
            var x = {x:1};
            DOM.data(span, "web", x);
            DOM.data(span, "web2", 2);

            var d = 1;

            Event.on(span, "click", function() {
                d++;
            });

            Event.fire(span, "click", undefined, true);

            expect(d).toBe(2);

            var cloned = DOM.clone(div, true, true, true),
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

            runs(function() {
                expect(d).toBe(4);
            });

        });


    });
});
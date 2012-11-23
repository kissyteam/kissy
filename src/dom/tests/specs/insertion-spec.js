/**
 * test cases for insertion sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,core", function (S, DOM) {
    var $= S.all;
    describe("insertion", function () {
        var body = document.body;
        it("insertBefore should works", function () {
            var foo = body.appendChild(DOM.create("div"));
            var t = DOM.create('<p>insertBefore node</p>');
            DOM.insertBefore(t, foo);
            expect(foo.previousSibling).toBe(t);
            DOM.remove([foo, t]);
        });

        it("insertAfter should works", function () {
            var foo = body.appendChild(DOM.create("<div></div>"));
            var t = DOM.create('<p>insertAfter node</p>');
            DOM.insertAfter(t, foo);
            expect(foo.nextSibling).toBe(t);
            DOM.remove([foo, t]);
        });


        it("append should works", function () {
            var foo = body.appendChild(DOM.create("<div><div></div></div>"));
            var t = DOM.create('<p>append node</p>');
            DOM.append(t, foo);
            expect(foo.lastChild).toBe(t);
            DOM.remove([foo, t]);
        });

        it("prepend should works", function () {
            var foo = body.appendChild(DOM.create("<div><div></div></div>"));
            var t = DOM.create('<p>prepend node</p>');
            DOM.prepend(t, foo);
            expect(foo.firstChild).toBe(t);
            DOM.remove([foo, t]);
        });

        it("consider checkbox/radio in ie6/7", function () {
            var radio = DOM.create("<input />");
            DOM.attr(radio, "type", "radio");
            DOM.attr(radio, "checked", true);
            DOM.append(radio, document.body);
            expect(DOM.attr(radio, "checked")).toBe("checked");
            DOM.remove(radio);
        });

        it("wrapAll should works", function () {
            var time = S.now();
            var wrappedCls = "f" + time;
            var wrapperCls = "x" + time;
            var foo = body.appendChild(DOM.create("<div class='" + wrappedCls + "'></div>"));
            var foo2 = body.appendChild(DOM.create("<div class='" + wrappedCls + "'></div>"));
            DOM.wrapAll("." + wrappedCls,
                DOM.create("<div class='" + wrapperCls + "'>" +
                    "<div class='x" + wrapperCls + "'></div>" +
                    "</div>"));
            expect(foo.nextSibling).toBe(foo2);
            expect(foo.parentNode.childNodes.length).toBe(2);
            expect(foo.parentNode.className).toBe("x" + wrapperCls);
            expect(foo.parentNode.parentNode.className).toBe(wrapperCls);
            DOM.remove([foo, foo2]);
            DOM.remove("." + wrapperCls);
        });


        it("wrap should works", function () {
            var time = S.now();
            var wrappedCls = "f" + time;
            var wrapperCls = "x" + time;
            var foo = body.appendChild(DOM.create("<div class='" + wrappedCls + "'></div>"));
            var foo2 = body.appendChild(DOM.create("<div class='" + wrappedCls + "'></div>"));
            DOM.wrap("." + wrappedCls,
                DOM.create("<div class='" + wrapperCls + "'>" +
                    "<div class='x" + wrapperCls + "'></div>" +
                    "</div>"));
            expect(foo.nextSibling).toBe(null);
            expect(foo.parentNode.childNodes.length).toBe(1);
            expect(foo.parentNode.className).toBe("x" + wrapperCls);
            expect(foo.parentNode.parentNode.className).toBe(wrapperCls);

            expect(foo2.nextSibling).toBe(null);
            expect(foo2.parentNode.childNodes.length).toBe(1);
            expect(foo2.parentNode.className).toBe("x" + wrapperCls);
            expect(foo.parentNode.parentNode.className).toBe(wrapperCls);

            expect(foo.parentNode.parentNode.nextSibling).toBe(foo2.parentNode.parentNode);
            DOM.remove([foo, foo2]);
            DOM.remove("." + wrapperCls);
        });


        it("wrapInner should works", function () {
            var time = S.now();
            var wrappedCls = "f" + time;
            var wrapperCls = "x" + time;
            var childCls = "c" + time;
            var foo = body.appendChild(DOM.create("<div class='" + wrappedCls + "'>" +
                "<div class='" + childCls + "'></div>" +
                "<div class='c" + childCls + "'></div>" +
                "</div>"));
            DOM.wrapInner("." + wrappedCls,
                DOM.create("<div class='" + wrapperCls + "'>" +
                    "<div class='x" + wrapperCls + "'></div>" +
                    "</div>"));
            expect(foo.childNodes.length).toBe(1);
            expect(foo.firstChild.className).toBe(wrapperCls);
            expect(foo.firstChild.firstChild.childNodes.length).toBe(2);
            expect(foo.firstChild.firstChild.firstChild.className).toBe(childCls);
            expect(foo.firstChild.firstChild.lastChild.className).toBe("c" + childCls);
            DOM.remove(foo);
            DOM.remove("." + wrapperCls);
        });

        it("unwrap works", function () {
            var time = S.now();
            var wrappedCls = "f" + time;
            var foo = body.appendChild(DOM.create("<div class='" + wrappedCls + "'>" +
                "<div class='x" + wrappedCls + "'></div>" +
                "</div>"));
            var fc = foo.firstChild;
            DOM.unwrap(fc);
            expect(fc.parentNode).toBe(document.body);
            //!!! ie<9 : foo.parentNode == fragment && DOM.contains(document,foo)==true
            expect(foo.parentNode).not.toBe(document.body);
            DOM.remove(fc);
            DOM.remove(foo);
        });

    });
});
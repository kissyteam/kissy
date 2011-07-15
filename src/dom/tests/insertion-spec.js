/**
 * test cases for insertion sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.use("dom", function(S, DOM) {
    describe("insertion", function() {
        var body = document.body;
        it("insertBefore should works", function() {
            var foo = body.appendChild(DOM.create("div"));
            var t = DOM.create('<p>insertBefore node</p>');
            DOM.insertBefore(t, foo);
            expect(foo.previousSibling).toBe(t);
            DOM.remove([foo,t]);
        });

        it("insertAfter should works", function() {
            var foo = body.appendChild(DOM.create("<div></div>"));
            var t = DOM.create('<p>insertAfter node</p>');
            DOM.insertAfter(t, foo);
            expect(foo.nextSibling).toBe(t);
            DOM.remove([foo,t]);
        });


        it("append should works", function() {
            var foo = body.appendChild(DOM.create("<div><div></div></div>"));
            var t = DOM.create('<p>append node</p>');
            DOM.append(t, foo);
            expect(foo.lastChild).toBe(t);
            DOM.remove([foo,t]);
        });

        it("prepend should works", function() {
            var foo = body.appendChild(DOM.create("<div><div></div></div>"));
            var t = DOM.create('<p>prepend node</p>');
            DOM.prepend(t, foo);
            expect(foo.firstChild).toBe(t);
            DOM.remove([foo,t]);
        });

    });
});
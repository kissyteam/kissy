/**
 * test cases for insertion sub module of dom module
 * @author:yiminghe@gmail.com
 */
KISSY.use("dom", function(S, DOM) {
    describe("insertion", function() {
        var body = document.body;
        it("insertBefore should works", function() {
            var foo = body.appendChild(DOM.create("div"));
            var t = DOM.insertBefore(DOM.create('<p>insertBefore node</p>'), foo);
            expect(foo.previousSibling).toBe(t);
            DOM.remove([foo,t]);
        });

        it("insertAfter should works", function() {
            var foo = body.appendChild(DOM.create("<div></div>"));
            var t = DOM.insertAfter(DOM.create('<p>insertAfter node</p>'), foo);
            expect(foo.nextSibling).toBe(t);
            DOM.remove([foo,t]);
        });


        it("append should works", function() {
            var foo = body.appendChild(DOM.create("<div><div></div></div>"));
            var t = DOM.append(DOM.create('<p>append node</p>'), foo);
            expect(foo.lastChild).toBe(t);
            DOM.remove([foo,t]);
        });

        it("prepend should works", function() {
            var foo = body.appendChild(DOM.create("<div><div></div></div>"));
            var t = DOM.prepend(DOM.create('<p>prepend node</p>'), foo);
            expect(foo.firstChild).toBe(t);
            DOM.remove([foo,t]);
        });

    });
});
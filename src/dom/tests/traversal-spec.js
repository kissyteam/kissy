/**
 * test cases for traversal sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.use("dom", function(S, DOM) {
    describe("traversal", function() {

        it("parent works", function() {
            var t = DOM.get('#test-parent4');
            expect(DOM.parent(t).tagName.toLowerCase()).toBe('span');
            expect(DOM.parent(t, 4).className).toBe('test-parent');
            expect(DOM.parent(t, 'em').className).toBe('test-em');
            expect(DOM.parent(t, '.test-p').tagName.toLowerCase()).toBe('p');
            // Unsupported selector: p.test-p em
            if (!S.require("sizzle")) {
                expect(
                    function() {
                        DOM.parent(t, 'p.test-p em')
                    }).toThrow();
            }
            expect(DOM.parent(t,
                function(elem) {
                    return elem.tagName.toLowerCase() === 'p';
                }).className).toBe('test-p');

            expect(DOM.parent(document.body)).toBe(document.documentElement);

            expect(DOM.parent('#test_cases')).toBe(document.body);

            expect(DOM.parent(t, 0)).toBe(t);

            expect(DOM.parent()).toBe(null);

            expect(DOM.parent('#test-data', 'p')).toBe(null);
            expect(DOM.parent('#test-data', ['p']) + "").toBe([] + "");
            expect(DOM.parent('#test-selector-tag', ['div']).length).toBe(4);
            expect(DOM.parent('#test-parent4', '.text-next')).toBe(null);
        });


        it("closest works", function() {
            var t = DOM.get('#test-parent4');

            // return itself
            expect(DOM.closest(t, "a")).toBe(t);

            expect(DOM.closest('#test-selector-1', ['div']).length).toBe(3);
            // parent works
            expect(DOM.closest(t, ".test-p")).toBe(DOM.get("#test-prev"));

            // context works
            expect(DOM.closest(t, ".test-parent", "#test-prev")).toBe(null);

            expect(DOM.closest(t, ".test-parent")).toBe(DOM.get("#test-children"));

            expect(DOM.closest(t, ".test-parent", "#test-children")).toBe(null);
        });


        it("next works", function() {
            var t = DOM.get('#test-next');

            expect(DOM.next(t).className).toBe('test-next-p');

            expect(DOM.next(t, 0)).toBe(t);

            expect(DOM.next(t, 1).className).toBe('test-next-p');
            expect(DOM.next(t, 2).className).toBe('test-next');

            expect(DOM.next(t, '.test-next').tagName.toLowerCase()).toBe('p');
            expect(DOM.next(t, '.test-none')).toBe(null);

            expect(DOM.next(t,
                function(elem) {
                    return elem.className === 'test-p';
                }).tagName.toLowerCase()).toBe("p");
        });

        it("prev works", function() {
            var t = DOM.get('#test-prev');

            expect(DOM.prev(t).className).toBe('test-next');

            expect(DOM.prev(t, 0)).toBe(t);
            expect(DOM.prev(t, 1).className).toBe('test-next');
            expect(DOM.prev(t, 2).className).toBe('test-next-p');

            expect(DOM.prev(t, '.test-none')).toBe(null);

            expect(DOM.prev(t,
                function(elem) {
                    return elem.className === 'test-next-p';
                }).tagName.toLowerCase()).toBe("p");
        });


        it("siblings works", function() {
            var t = DOM.get('#test-prev');

            expect(DOM.siblings(t).length).toBe(4);

            expect(DOM.siblings(t, '.test-none').length).toBe(0);

            expect(DOM.siblings(t,
                function(elem) {
                    return elem.className === 'test-next-p';
                }).length).toBe(1);
        });

        it("children works", function() {
            var t = DOM.get('#test-children');

            expect(DOM.children(t).length).toBe(4);
            //expect(DOM.children(t, '.test-next,.test-next-p').length).toBe(2);
            //expect(DOM.children(t, 'p:first')[0].id).toBe('test-next');
            expect(DOM.children('#test-div').length).toBe(0);
        });


        it("contains works", function() {
            expect(DOM.contains(document, '#test-prev')).toBe(true);
            expect(DOM.contains(document.documentElement, document.body)).toBe(true);
            expect(DOM.contains(document, document.body)).toBe(true);
            expect(DOM.contains(document.body, document.documentElement)).toBe(false);

            // test text node
            var tn = DOM.get('#test-contains').firstChild;

            expect(tn.nodeType).toBe(3);

            expect(DOM.contains('#test-contains', tn)).toBe(true);

            expect(DOM.contains(document.body, document.body)).toBe(false);

            expect(DOM.contains(document, document)).toBe(false);

            expect(DOM.contains(document.body, document)).toBe(false);
        });

    });
});
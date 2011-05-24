/**
 * test cases for data sub module of dom module
 * @author:yiminghe@gmail.com
 */
KISSY.use("dom", function(S, DOM) {

    describe("DOM.data", function() {
        it("data should works", function() {
            var foo = document.body.appendChild(DOM.create("<div>"))
            DOM.data(foo, 'data-1', 'val-1');
            expect(DOM.data(foo, 'data-1')).toBe('val-1');

            DOM.data(foo, 'data-1', 'val-2');
            expect(DOM.data(foo, 'data-1')).toBe('val-2');

            DOM.data(document, 'data', 'val');
            expect(DOM.data(document, 'data')).toBe('val');

            DOM.data(window, 'data', 'val');
            expect(DOM.data(window, 'data')).toBe('val');

            expect(window.data).toBeUndefined(); // 不污染全局

            DOM.data(top, 'data', 'val');
            expect(DOM.data(top, 'data')).toBe('val');

            var o = {};
            DOM.data(o, 'data', 'val');
            expect(DOM.data(o, 'data')).toBe('val');
            expect(DOM.data(o).data).toBe('val');

            DOM.remove(foo);
        });


        it("removeData should works", function() {
            var foo = document.body.appendChild(DOM.create("<div>"))
            DOM.data(foo, 'data', 'val');
            DOM.removeData(foo, 'data');
            expect(DOM.data(foo, 'data')).toBe(null);
            expect(DOM.data('#foo2')).toBe(null);

            DOM.data(window, 'data', 'val');
            DOM.removeData(window, 'data');
            expect(DOM.data(window, 'data')).toBe(null);
            expect(DOM.data(window)).toBe(null);
            DOM.remove(foo);
        });
    });


});
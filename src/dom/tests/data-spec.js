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
            var foo = document.body.appendChild(DOM.create("<div>"));
            DOM.data(foo, 'data', 'val');
            DOM.removeData(foo, 'data');
            expect(DOM.data(foo, 'data')).toBe(null);
            //expect(DOM.data('#foo2')).toBe(null);

            DOM.data(window, 'data', 'val');

            DOM.removeData(window, 'data');

            expect(DOM.data(window, 'data')).toBe(null);
            expect(DOM.hasData(window)).toBe(false);

            // 返回空对象
            expect(S.isEmptyObject(DOM.data(window))).toBe(true);
            DOM.remove(foo);
        });


        it("hasData should works", function() {

            var p = DOM.create("<p>");
            // 给所有的段落节点设置扩展属性 ``x`` ，值为 ``y``
            DOM.data(p, "x", "y");

            expect(DOM.hasData(p)).toBe(true); // => true , 设置过扩展属性

            expect(DOM.hasData(p, "x")).toBe(true); // => true , 设置过扩展属性 ``x`` 的值

            expect(DOM.hasData(p, "z")).toBe(false); // => false , 没有设置过扩展属性 ``z`` 的值

            DOM.removeData(p, "x"); // => 删除扩展属性 ``x`` 的值

            expect(DOM.hasData(p, "x")).toBe(false); //=> false

            expect(DOM.hasData(p)).toBe(false); //=> false

            //空对象
            expect(S.isEmptyObject(DOM.data(p))).toBe(true);

        });
    });


});
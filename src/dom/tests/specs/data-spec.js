/**
 * test cases for data sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.use("ua,dom,core", function (S, UA, DOM) {
    var $= S.all;
    var __EXPANDO = DOM.__EXPANDO;
    describe("DOM.data", function () {
        it("data should works", function () {
            var foo = document.body.appendChild(DOM.create("<div>"));
            DOM.data(foo, 'data-1', 'val-1');
            expect(DOM.data(foo, 'data-1')).toBe('val-1');

            DOM.data(foo, 'data-1', 'val-2');
            expect(DOM.data(foo, 'data-1')).toBe('val-2');

            DOM.data(document, 'data', 'val');
            expect(DOM.data(document, 'data')).toBe('val');

            DOM.data(window, 'data', 'val');
            expect(DOM.data(window, 'data')).toBe('val');

            expect(window.data).toBeUndefined(); // 不污染全局
            var topOK = true;
            try {
                DOM.data(top, 'data', 'val');
            } catch (e) {
                //不同域
                topOK = false;
            }
            // cloudy run 不同域跑不抛异常
            if (topOK && !UA.webkit) {
                DOM.data(top, 'data', 'val');
                expect(DOM.data(top, 'data')).toBe('val');
            }
            var o = {};
            DOM.data(o, 'data', 'val');
            expect(DOM.data(o, 'data')).toBe('val');
            expect(DOM.data(o).data).toBe('val');

            DOM.remove(foo);
        });

        it("native data should not add unnecessary EXPANDO", function () {
            var foo = document.body.appendChild(DOM.create("<div>"));
            expect(DOM.data(foo, "d")).toBeUndefined();
            expect(foo[__EXPANDO]).toBeUndefined();
            DOM.removeData(foo);
            expect(foo[__EXPANDO]).toBeUndefined();
            DOM.remove(foo);
        });

        it("custom data should not add unnecessary EXPANDO", function () {
            var foo = {};
            expect(DOM.data(foo, "d")).toBeUndefined();
            expect(foo[__EXPANDO]).toBeUndefined();
            DOM.removeData(foo);
            expect(foo[__EXPANDO]).toBeUndefined();
        });

        it("removeData should works", function () {
            var foo = document.body.appendChild(DOM.create("<div><span></span><div>"));
            var bar = DOM.get("span", foo);

            DOM.data(foo, 'data', 'val');
            DOM.removeData(foo, 'data');
            //  if data is removed ,then its value is undefined
            expect(DOM.data(foo, 'data')).toBe(undefined);
            expect(DOM.hasData(foo, 'data')).toBe(false);

            DOM.data(window, 'data', 'val');

            DOM.removeData(window, 'data');

            expect(DOM.data(window, 'data')).toBe(undefined);
            expect(DOM.hasData(window)).toBe(false);

            // 返回空对象
            expect(S.isEmptyObject(DOM.data(window))).toBe(true);


            DOM.data(foo, "custom", "custom");
            DOM.data(bar, "custom2", "custom2");

            expect(DOM.data(foo, "custom")).toBe("custom");
            expect(DOM.data(bar, "custom2")).toBe("custom2");

            DOM.remove(foo);

            /**
             * 2011-08-09
             * 删除元素时，会把其下面的元素以及自身都 removeData
             */
            expect(DOM.data(foo, "custom")).toBe(undefined);
            expect(DOM.data(bar, "custom2")).toBe(undefined);
        });

        it("hasData should works", function () {

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
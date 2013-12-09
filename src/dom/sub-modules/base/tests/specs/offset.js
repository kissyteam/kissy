/**
 * test cases for offset sub module of dom module
 * @author yiminghe@gmail.com
 * need to be completed
 */
KISSY.add(function (S, Dom) {
    describe("offset", function () {
        var iframeTpl = '<iframe src="../others/offset/test-dom-offset-iframe.html"\
        id="test-iframe"\
        style="border:1px solid black; "\
        width="200"\
        height="200"\
        frameborder="0"\
        scrolling="no"\
        ></iframe>',

            tpl = '<div id="test-offset" style="width:100px;height:100px;border: 1px solid red;">\
        offset\
        </div>';

        beforeEach(function () {
            $('body').append(tpl);
        });

        afterEach(function () {
            $('#test-offset').remove();
        });

        it("should works", function () {
            var test_offset = Dom.get("#test-offset");
            var o = Dom.offset(test_offset);
            Dom.offset(test_offset, o);
            var o2 = Dom.offset(test_offset);
            expect(o2.top).toBe(o.top);
            expect(o2.left).toBe(o.left);
            expect(test_offset.style.position).toBe('relative');
        });

        it("should consider html border", function () {
            // ie 下应该减去窗口的边框吧，毕竟默认 absolute 都是相对窗口定位的
            // 窗口边框标准是设 documentElement ,quirks 时设置 body
            // 最好禁止在 body 和 html 上边框 ，但 ie < 9 html 默认有 2px ，减去
            // 但是非 ie 不可能设置窗口边框，body html 也不是窗口 ,ie 可以通过 html,body 设置
            // 标准 ie 下 docElem.clientTop 就是 border-top
            // ie7 html 即窗口边框改变不了。永远为 2

            //只考虑 ie 标准模式了,ie<9 下设置边框，否则默认 2px
            document.documentElement.style.borderTop = "3px";

            var a;

            Dom.append(a = Dom.create("<div style='position: absolute;top:0;'/>"), 'body');

            // ie < 9 相对于 document.documentElement 即窗口
            expect(Dom.offset(a).top).toBe(0);
            Dom.offset(a, {
                top: 0
            });

            expect(parseInt(Dom.css(a, "top"))).toBe(0);

            document.documentElement.style.borderTop = "";

            Dom.remove(a);
        });

        it("should works for framed element", function () {
            var div = $('<div>').appendTo('body');
            div[0].innerHTML = iframeTpl;

            var iframe = Dom.get("#test-iframe");

            var ok = 0;

            $(iframe).on('load', function () {
                var win = iframe.contentWindow;
                var inner = Dom.get("#test-inner", win.document);
                var innerOffsetTop = Dom.offset(inner).top - Dom.scrollTop(win);
                var iframeTop = Dom.offset(iframe).top;
                var totalTop = Dom.offset(inner, undefined, window).top;
                expect(innerOffsetTop + iframeTop).toBe(totalTop);

                setTimeout(function () {
                    div.remove();
                    ok = 1;
                }, 100);
            });

            waitsFor(function () {
                return ok;
            }, "iframe can not loaded!");
        });

        it("should not change after get and set", function () {
            var scrollTop = Dom.scrollTop();
            window.scrollTo(0, 100);
            var div = Dom.create("<div style='position: absolute;top:200px;'></div>");
            Dom.append(div, document.body);
            var originalOffset = Dom.offset(div);
            expect(Math.abs(originalOffset.top - 200) < 5).toBe(true);
            window.scrollTo(0, scrollTop);
        });
    });
}, {
    requires: ['dom']
});
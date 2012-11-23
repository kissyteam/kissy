/**
 * test cases for create sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,core", function (S, DOM) {

    var $= S.all;

    describe("create", function () {

        it("create should works", function () {

            var div = DOM.create('<div>'),
                html = '',
                tag = '';

            S.each([
                'option', 'optgroup', 'td', 'th', 'tr',
                'tbody', 'thead', 'tfoot',
                'caption', 'col', 'colgroup', 'legend'], function (tag) {
                html = '<' + tag + '></' + tag + '>';

                //div.innerHTML = html;
                div.appendChild(DOM.create(html));

                html = div.innerHTML.toLowerCase();
                expect((html.indexOf('<' + tag + '>') === 0 ||
                    html.indexOf('<' + tag + ' ') === 0)).toBe(true);
                div.innerHTML = '';
            });

            // script
            html = tag = 'script';
            div.appendChild(DOM.create('<script><\/script>'));
            html = S.trim(div.innerHTML.toLowerCase());
            expect((html.indexOf('<' + tag + '>') === 0
                || html.indexOf('<' + tag + ' ') === 0)).toBe(true);
            div.innerHTML = '';

            // null
            expect(DOM.create()).toBe(null);

            // textNode
            expect(DOM.create('text node').nodeType).toBe(3);

            // 稍微复杂点
            expect(DOM.attr(DOM.create('<img id="test-img" />'), 'id')).toBe('test-img');

            // 多个元素 , fragment
            expect(DOM.create('<p></p><div></div>').nodeType).toBe(11);

            expect(DOM.create('<p></p><div></div>').childNodes[0].tagName.toLowerCase()).toBe('p');

            // 属性支持
            expect(DOM.create('<p>', { rel:'-1', 'class':'test-p', data:'test'}).className).toBe('test-p');

            expect(DOM.create("<a hideFocus=\'true\'  " +
                "tabIndex=\'0\'  " +
                "class=\'ke-triplebutton ke-triplebutton-off\' />")
                .className).toBe("ke-triplebutton ke-triplebutton-off");
        });

        it("create should works for style with content in ie<8", function () {
            var style, d;
            expect((style = DOM.create("<style>.styleie67 {width:99px;}</style>"))
                .nodeName.toLowerCase()).toBe("style");
            DOM.append(d = DOM.create("<div class='styleie67'></div>"), document.body);
            DOM.append(style, document.getElementsByTagName("head")[0]);

            expect(DOM.css(d, "width")).toBe("99px");
        });


        it("html should works", function () {
            var t = DOM.create("<div></div>");
            document.body.appendChild(t);
            DOM.html(t, '<div>');
            expect(t.firstChild.nodeName.toLowerCase()).toBe("div");

            DOM.html(t, '<p class="test-html">test p</p>');
            expect(DOM.hasClass(t.firstChild, 'test-html')).toBe(true);

            expect(DOM.text(t)).toBe('test p');

            var test_table = DOM.create("<table></table>");

            DOM.html(t, '');

            expect(
                function () {
                    DOM.html(test_table, '2')
                }).not.toThrow();


            // loadScripts
            DOM.html(t, '<script>window.g_sethtml = 1;<\/script>we', true);

            DOM.html(t, '<script>window.g_sethtml2 = 1;<\/script>we');

            waitsFor(function () {
                return window.g_sethtml == 1;
            }, "inline script in dom.html should run", 1000);

            waits(500);

            runs(function () {
                expect(window.g_sethtml2).toBeUndefined();

                // src js
                DOM.html(t, '<script src="../others/test-dom-create.js"><\/script>we', true);
            });

            waitsFor(function () {
                return window.g_testLoadScriptViaInnerHTML;
            }, "external script in dom.html should run", 5000);

            runs(function () {
                DOM.remove(t);
            });

        });

        it("html works for multiple elements", function () {
            document.body.appendChild(DOM.create("<div class='multiple-html'></div>" +
                "<div class='multiple-html'></div>"));

            var multiple = DOM.query(".multiple-html");

            DOM.html(multiple, "<span>1</span>");


            for (var i = 0; i < multiple.length; i++) {
                expect(multiple[i].innerHTML.toLowerCase()).toBe("<span>1</span>");
            }


            DOM.html(multiple, "<span>2</span><script></script>");


            for (i = 0; i < multiple.length; i++) {
                expect(multiple[i].innerHTML.toLowerCase()).toBe("<span>2</span>");
            }

            DOM.remove(multiple);

        });


        it("remove should works", function () {
            var n;
            document.body.appendChild(n = DOM.create("<div class='test-remove'>"));
            expect(S.query(".test-remove").length).toBe(1);
            DOM.remove(n);
            expect(S.query(".test-remove").length).toBe(0);
        });

        it("empty should works", function () {
            var n;
            document.body.appendChild(n = DOM.create("<div class='test-empty'><div></div>x</div>"));
            expect(n.childNodes.length).toBe(2);
            var c = n.firstChild;
            DOM.data(c, "x", "y");
            expect(DOM.data(c, "x")).toBe("y");
            DOM.empty(n);
            expect(n.childNodes.length).toBe(0);
            expect(DOM.data(c, "x")).toBe(undefined);
        });

        it("fix leadingWhiteSpaces in ie<9", function () {
            var n = DOM.create(" <div></div>");
            expect(n.nodeName.toLowerCase()).toBe("div");
            DOM.html(n, " <span></span>");
            expect(n.firstChild.nodeType).toBe(DOM.NodeType.TEXT_NODE);
            DOM.remove(n);
        });

        it("remove spurious tbody", function () {
            var str = '<table><thead><tr><th>1</th></tr></thead></table>';
            expect(DOM.create(str).innerHTML.toLowerCase().replace(/\s/g, "")).toBe('<thead><tr><th>1</th></tr></thead>');
            var str2 = "<thead><tr><th>1</th></tr></thead>";
            expect(DOM.create(str2).innerHTML.toLowerCase().replace(/\s/g, "")).toBe('<tr><th>1</th></tr>');
        });


        it("outerHTML works", function () {
            var div = DOM.create("<div></div>");
            var div2 = DOM.create("<div></div>");
            var span = DOM.create("<span></span>");
            var span2 = DOM.create("<span></span>");
            DOM.append(span, div);
            DOM.append(span2, div2);
            DOM.append(div, "body");
            DOM.append(div2, "body");


            DOM.outerHTML(span, "5<span>3</span>");
            expect(DOM.html(div).toLowerCase()).toBe("5<span>3</span>");

            DOM.html(div, "<span></span>");

            span = DOM.get("span", div);
            DOM.outerHTML([span, span2], "5<span>4</span><script>window.outerHTML_test=1;</script>");
            expect(DOM.html(div).toLowerCase()).toBe("5<span>4</span>");
            expect(DOM.html(div2).toLowerCase()).toBe("5<span>4</span>");
            expect(window.outerHTML_test).toBeUndefined();

            DOM.html(div, "<span></span>");

            span = DOM.get("span", div);
            DOM.outerHTML(span, "6<span>5</span><script>window.outerHTML_test=1;</script>", true);
            expect(DOM.html(div).toLowerCase()).toBe("6<span>5</span>");
            expect(window.outerHTML_test).toBe(1);

            DOM.remove(div);
            DOM.remove(div2);
        });

    });
});
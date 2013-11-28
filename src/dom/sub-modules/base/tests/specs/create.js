/**
 * test cases for create sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom) {
    describe("create", function () {
        it("create should works", function () {
            var div = Dom.create('<div>'),
                html = '',
                tag;

            S.each([
                'option', 'optgroup', 'td', 'th', 'tr',
                'tbody', 'thead', 'tfoot',
                'caption', 'col', 'colgroup', 'legend'], function (tag) {
                html = '<' + tag + '></' + tag + '>';

                //div.innerHTML = html;
                div.appendChild(Dom.create(html));

                html = div.innerHTML.toLowerCase();
                expect((html.indexOf('<' + tag + '>') === 0 ||
                    html.indexOf('<' + tag + ' ') === 0)).toBe(true);
                div.innerHTML = '';
            });

            // script
            html = tag = 'script';
            div.appendChild(Dom.create('<script><\/script>'));
            html = S.trim(div.innerHTML.toLowerCase());
            expect((html.indexOf('<' + tag + '>') === 0
                || html.indexOf('<' + tag + ' ') === 0)).toBe(true);
            div.innerHTML = '';

            // null
            expect(Dom.create()).toBe(null);

            // textNode
            expect(Dom.create('text node').nodeType).toBe(3);

            // 稍微复杂点
            expect(Dom.attr(Dom.create('<img id="test-img" />'), 'id')).toBe('test-img');

            // 多个元素 , fragment
            expect(Dom.create('<p></p><div></div>').nodeType).toBe(11);

            expect(Dom.create('<p></p><div></div>').childNodes[0].tagName.toLowerCase()).toBe('p');

            // 属性支持
            expect(Dom.create('<p>', { rel:'-1', 'class':'test-p', data:'test'}).className).toBe('test-p');

            expect(Dom.create("<a hideFocus=\'true\'  " +
                "tabIndex=\'0\'  " +
                "class=\'ke-triplebutton ke-triplebutton-off\' />")
                .className).toBe("ke-triplebutton ke-triplebutton-off");
        });

        it("create should works for style with content in ie<8", function () {
            var style, d;
            expect((style = Dom.create("<style>.styleie67 {width:99px;}</style>"))
                .nodeName.toLowerCase()).toBe('style');
            Dom.append(d = Dom.create("<div class='styleie67'></div>"), document.body);
            Dom.append(style, document.getElementsByTagName("head")[0]);

            expect(Dom.css(d, 'width')).toBe("99px");
        });

        it("html should works", function () {
            var t = Dom.create("<div></div>");
            document.body.appendChild(t);
            Dom.html(t, '<div>');
            expect(t.firstChild.nodeName.toLowerCase()).toBe('div');

            Dom.html(t, '<p class="test-html">test p</p>');
            expect(Dom.hasClass(t.firstChild, 'test-html')).toBe(true);

            expect(Dom.text(t)).toBe('test p');

            var test_table = Dom.create("<table></table>");

            Dom.html(t, '');

            expect(
                function () {
                    Dom.html(test_table, '2')
                }).not.toThrow();


            // loadScripts
            Dom.html(t, '<script>window.g_sethtml = 1;<\/script>we', true);

            Dom.html(t, '<script>window.g_sethtml2 = 1;<\/script>we');

            waitsFor(function () {
                return window.g_sethtml == 1;
            }, "inline script in dom.html should run", 1000);

            waits(500);

            runs(function () {
                expect(window.g_sethtml2).toBeUndefined();
                // src js
                Dom.html(t, '<script src="../others/create/test-dom-create.js"><\/script>we', true);
            });

            waitsFor(function () {
                return window.g_testLoadScriptViaInnerHTML;
            }, "external script in dom.html should run", 5000);

            runs(function () {
                Dom.remove(t);
            });
        });

        it("html works for multiple elements", function () {
            document.body.appendChild(Dom.create("<div class='multiple-html'></div>" +
                "<div class='multiple-html'></div>"));

            var multiple = Dom.query(".multiple-html");

            Dom.html(multiple, "<span>1</span>");


            for (var i = 0; i < multiple.length; i++) {
                expect(multiple[i].innerHTML.toLowerCase()).toBe("<span>1</span>");
            }

            Dom.html(multiple, "<span>2</span><script></script>");

            for (i = 0; i < multiple.length; i++) {
                expect(multiple[i].innerHTML.toLowerCase()).toBe("<span>2</span>");
            }

            Dom.remove(multiple);
        });

        it('html works for fragment',function(){
            var html='<div></div><span></span>';
            var n= Dom.create(html);
            expect(Dom.html(n).toLowerCase()).toBe(html);
        });

        it("remove should works", function () {
            var n;
            document.body.appendChild(n = Dom.create("<div class='test-remove'>" +
                "<div class='test-remove-inner'>test-remove-inner</div>" +
                "</div>"));
            expect(S.query(".test-remove").length).toBe(1);
            Dom.remove(n);
            expect(S.query(".test-remove").length).toBe(0);
            expect(S.query(".test-remove-inner").length).toBe(0);
        });

        it("empty should works", function () {
            var n;
            document.body.appendChild(n = Dom.create("<div class='test-empty'><div></div>x</div>"));
            expect(n.childNodes.length).toBe(2);
            var c = n.firstChild;
            Dom.data(c, 'x', 'y');
            expect(Dom.data(c, 'x')).toBe('y');
            Dom.empty(n);
            expect(n.childNodes.length).toBe(0);
            expect(Dom.data(c, 'x')).toBe(undefined);
        });

        it("fix leadingWhiteSpaces in ie<9", function () {
            var n = Dom.create(" <div></div>");
            expect(n.nodeName.toLowerCase()).toBe('div');
            Dom.html(n, " <span></span>");
            expect(n.firstChild.nodeType).toBe(Dom.NodeType.TEXT_NODE);
            Dom.remove(n);
        });

        it("remove spurious tbody", function () {
            var str = '<table><thead><tr><th>1</th></tr></thead></table>';
            expect(Dom.create(str).innerHTML.toLowerCase().replace(/\s/g, "")).toBe('<thead><tr><th>1</th></tr></thead>');
            var str2 = "<thead><tr><th>1</th></tr></thead>";
            expect(Dom.create(str2).innerHTML.toLowerCase().replace(/\s/g, "")).toBe('<tr><th>1</th></tr>');
        });

        it("outerHtml works", function () {
            var div = Dom.create("<div></div>");
            var div2 = Dom.create("<div></div>");
            var span = Dom.create("<span></span>");
            var span2 = Dom.create("<span></span>");
            Dom.append(span, div);
            Dom.append(span2, div2);
            Dom.append(div, 'body');
            Dom.append(div2, 'body');

            Dom.outerHtml(span, "5<span>3</span>");
            expect(Dom.html(div).toLowerCase()).toBe("5<span>3</span>");

            Dom.html(div, "<span></span>");

            span = Dom.get("span", div);
            Dom.outerHtml([span, span2], "5<span>4</span><script>window.outerHTML_test=1;</script>");
            expect(Dom.html(div).toLowerCase()).toBe("5<span>4</span>");
            expect(Dom.html(div2).toLowerCase()).toBe("5<span>4</span>");
            expect(window.outerHTML_test).toBeUndefined();

            Dom.html(div, "<span></span>");

            span = Dom.get("span", div);
            Dom.outerHtml(span, "6<span>5</span><script>window.outerHTML_test=1;</script>", true);
            expect(Dom.html(div).toLowerCase()).toBe("6<span>5</span>");
            expect(window.outerHTML_test).toBe(1);

            Dom.remove(div);
            Dom.remove(div2);
        });

        it('outerHtml works for fragment',function(){
            var html='<div></div><span></span>';
            var n= Dom.create(html);
            expect(Dom.outerHtml(n).toLowerCase()).toBe(html);
        });
    });
},{
    requires:['dom']
});
/**
 * Test DOM for editor
 * @author yiminghe@gmail.com
 */
KISSY.use("editor", function (S, Editor) {
    var DOM = S.DOM,
        $ = S.all;

    describe("dom", function () {
        it("_4e_isBlockBoundary works", function () {
            var div = DOM.create("<div>");
            var span = DOM.create("<span>");
            DOM.append(div, "body");
            DOM.append(span, "body");
            expect(DOM._4e_isBlockBoundary(div)).toBe(true);
            expect(DOM._4e_isBlockBoundary(span)).toBe(false);
            expect(DOM._4e_isBlockBoundary(span, {
                span:1
            })).toBe(true);
            DOM.remove(div);
            DOM.remove(span);
        });


        it("_4e_index works", function () {
            var div = DOM.create("<div><span>1</span><span>2</span></div>");
            DOM.append(div, "body");
            expect(DOM._4e_index(div.childNodes[1])).toBe(1);
            DOM.remove(div);
        });

        it("_4e_move works", function () {
            var div = DOM.create("<div>1</div>");
            var span = DOM.create("<span>");
            DOM.append(div, "body");
            DOM.append(span, "body");

            DOM._4e_move(span, div, undefined);
            expect(div.lastChild).toBe(span);
            DOM._4e_move(span, div, true);
            expect(div.firstChild).toBe(span);


            DOM.remove(div);
            DOM.remove(span);
        });


        it("nodeName works", function () {
            expect(DOM.nodeName(DOM.create("<div>"))).toBe("div");
        });

        it("_4e_isIdentical works", function () {
            var div = DOM.create("<div data-x='y'>1</div>");
            var div3 = DOM.create("<div data-x='y'>1</div>");
            expect(DOM._4e_isIdentical(div, div3)).toBe(true);
            DOM.attr(div, "data-x", "z");
            expect(DOM._4e_isIdentical(div, div3)).toBe(false);
        });

        it("_4e_moveChildren works", function () {
            var div = DOM.create("<div>1<b>2</b></div>");
            var span = DOM.create("<span>3<i>4</i></span>");
            DOM._4e_moveChildren(span, div);
            expect(div.innerHTML.toLowerCase()).toBe("1<b>2</b>3<i>4</i>");
            div = DOM.create("<div>1<b>2</b></div>");
            span = DOM.create("<span>3<i>4</i></span>");
            DOM._4e_moveChildren(span, div, true);
            expect(div.innerHTML.toLowerCase()).toBe("3<i>4</i>1<b>2</b>");
        });

        it("_4e_isEmptyInlineRemovable works", function () {
            var div = DOM.create("<div>1</div>");
            expect(DOM._4e_isEmptyInlineRemovable(div)).toBe(false);
            var span = DOM.create("<span><b></b><s><span></span></s>" +
                "<span _ke_bookmark='1'>1</span></span>");
            expect(DOM._4e_isEmptyInlineRemovable(span)).toBe(true);
        });

        it("_4e_mergeSiblings works", function () {
            var div = DOM.create("<div >" +
                "<span class='target'>" +
                //"1<b>2</b>" +
                "<span class='innerlast'>innerlast1</span>" +
                "</span>" +
                "<span id='s1' _ke_bookmark='1'></span>" +
                "<b id='b1'></b>" +
                "<span class='target'>" +
                "<span class='innerlast'>innerfirst2</span>" +
                "3<b>4</b>" +
                "<span class='innerlast'>innerlast2</span>" +
                "</span>" +
                "<span id='s2' _ke_bookmark='1'></span>" +
                "<b id='b2'></b>" +
                "<span class='target'>" +
                "<span class='innerlast'>innerfirst3</span>" +
                //"5<b>6</b>" +
                "</span>" +
                "</div>");

            DOM.append(div, "body");

            var target = DOM.query('.target', div)[1];

            DOM._4e_mergeSiblings(target);

            expect(div.innerHTML.toLowerCase().replace(/=(\w+)/g, "=\"$1\""))
                .toBe([
                "<span class='target'>" ,
                // "1<b>2</b>" ,
                "<span class='innerlast'>" ,
                "innerlast1" ,
                "<span id='s1' _ke_bookmark='1'></span>" ,
                "<b id='b1'></b>" ,
                "innerfirst2" ,
                "</span>" ,
                "3<b>4</b>" ,
                "<span class='innerlast'>" ,
                "innerlast2" ,
                "<span id='s2' _ke_bookmark='1'></span>" ,
                "<b id='b2'></b>" ,
                "innerfirst3" ,
                "</span>" ,
                // "5<b>6</b>" ,
                "</span>"
            ].join("").replace(/'/g, '"'));

            DOM.remove(div);
        });


        it("_4e_address works", function () {
            var div = $("<div><span>1<span></span></span></div>");
            div.prependTo("body");
            var span = div.first().last();
            var bodyIndex = S.one("body")._4e_index();
            expect(span._4e_address()).toEqual([bodyIndex, 0, 0, 1]);
            div.remove();
        });

    });

});
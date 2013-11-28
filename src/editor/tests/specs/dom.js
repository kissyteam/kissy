/**
 * Test Dom for editor
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Editor) {
    var Dom = S.DOM,
        $ = S.all;

    describe("dom", function () {
        it("_4eIsBlockBoundary works", function () {
            var div = Dom.create("<div>");
            var span = Dom.create("<span>");
            Dom.append(div, 'body');
            Dom.append(span, 'body');
            expect(Dom._4eIsBlockBoundary(div)).toBe(true);
            expect(Dom._4eIsBlockBoundary(span)).toBe(false);
            expect(Dom._4eIsBlockBoundary(span, {
                span:1
            })).toBe(true);
            Dom.remove(div);
            Dom.remove(span);
        });


        it("_4eIndex works", function () {
            var div = Dom.create("<div><span>1</span><span>2</span></div>");
            Dom.append(div, 'body');
            expect(Dom._4eIndex(div.childNodes[1])).toBe(1);
            Dom.remove(div);
        });

        it("_4eMove works", function () {
            var div = Dom.create("<div>1</div>");
            var span = Dom.create("<span>");
            Dom.append(div, 'body');
            Dom.append(span, 'body');

            Dom._4eMove(span, div, undefined);
            expect(div.lastChild).toBe(span);
            Dom._4eMove(span, div, true);
            expect(div.firstChild).toBe(span);


            Dom.remove(div);
            Dom.remove(span);
        });


        it("nodeName works", function () {
            expect(Dom.nodeName(Dom.create("<div>"))).toBe('div');
        });

        it("_4eIsIdentical works", function () {
            var div = Dom.create("<div data-x='y'>1</div>");
            var div3 = Dom.create("<div data-x='y'>1</div>");
            expect(Dom._4eIsIdentical(div, div3)).toBe(true);
            Dom.attr(div, "data-x", "z");
            expect(Dom._4eIsIdentical(div, div3)).toBe(false);
        });

        it("_4eMoveChildren works", function () {
            var div = Dom.create("<div>1<b>2</b></div>");
            var span = Dom.create("<span>3<i>4</i></span>");
            Dom._4eMoveChildren(span, div);
            expect(div.innerHTML.toLowerCase()).toBe("1<b>2</b>3<i>4</i>");
            div = Dom.create("<div>1<b>2</b></div>");
            span = Dom.create("<span>3<i>4</i></span>");
            Dom._4eMoveChildren(span, div, true);
            expect(div.innerHTML.toLowerCase()).toBe("3<i>4</i>1<b>2</b>");
        });

        it("_4eIsEmptyInlineRemovable works", function () {
            var div = Dom.create("<div>1</div>");
            expect(Dom._4eIsEmptyInlineRemovable(div)).toBe(false);
            var span = Dom.create("<span><b></b><s><span></span></s>" +
                "<span _ke_bookmark='1'>1</span></span>");
            expect(Dom._4eIsEmptyInlineRemovable(span)).toBe(true);
        });

        it("_4eMergeSiblings works", function () {
            var div = Dom.create("<div >" +
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

            Dom.append(div, 'body');

            var target = Dom.query('.target', div)[1];

            Dom._4eMergeSiblings(target);

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

            Dom.remove(div);
        });


        it("_4eAddress works", function () {
            var div = $("<div><span>1<span></span></span></div>");
            div.prependTo('body');
            var span = div.first().last();
            var bodyIndex = S.one('body')._4eIndex();
            expect(span._4eAddress()).toEqual([bodyIndex, 0, 0, 1]);
            div.remove();
        });

    });

},{
    requires:['editor']
});
/**
 * Test cross browser Range implementation for Editor
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Editor) {
    var $ = S.all,
        UA = S.UA,
        Dom = S.DOM,
        RangeType = Editor.RangeType,
        Node = S.Node;
    var Range = Editor.Range;

    function trimNode(t) {
        if (t.nodeType == Dom.NodeType.TEXT_NODE) {
            t.nodeValue = S.trim(t.nodeValue);
        } else {
            var cs = t.childNodes || [];
            for (var i = 0; i < cs.length; i++) {
                trimNode(cs[i]);
            }
        }
    }

    function myHTML(el) {
        trimNode(el[0]);
        return el.html().toLowerCase()
            .replace(/\s+</g, "<")
            .replace(/([\w-]+=)([\w-]+)/g, function (m, m1, m2) {
                return m1 + '"' + m2 + '"';
            });
    }

    describe("range", function () {

        describe("cloneContents", function () {

            it("works for simple text node", function () {
                var div = $("<div>123456789</div>").appendTo('body');
                var range = new Range(document);
                var text = new Node(div[0].firstChild);

                range.setStart(text, 2);
                range.setEnd(text, 5);

                var f = range.cloneContents();

                var newDiv = $("<div>").appendTo('body');

                newDiv.append(f);

                expect(myHTML(newDiv)).toBe("345");

                expect(div[0].childNodes.length).toBe(1);

                expect(div[0].firstChild).toBe(text[0]);

                expect(text[0].nodeValue).toBe("123456789");

                div.remove();
                newDiv.remove();

            });


            it("works for complex text node", function () {

                // d
                //    a
                //    span
                //           b
                //           span-start
                //                 123456789
                //           c
                //    d
                //    span
                //           e
                //           span-end
                //                 123456789
                //           f
                //    g


                var div = $("<div>" +
                    "a" +
                    "<span>" +
                    "b" +
                    "<span id=\"start\">" +
                    "123456789" +
                    "</span>" +
                    "c" +
                    "</span>" +
                    "d" +
                    "<span>" +
                    "e" +
                    "<span id=\"end\">" +
                    "123456789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g</div>").appendTo('body', undefined);

                var range = new Range(document);
                var textStart = new Node($("#start")[0].firstChild);
                var textEnd = new Node($("#end")[0].firstChild);
                range.setStart(textStart, 2);
                range.setEnd(textEnd, 5);

                var f = range.cloneContents();

                var newDiv = $("<div>").appendTo('body');

                newDiv.append(f);

                expect(myHTML(newDiv)).toBe("<span>" +
                    "<span id=\"start\">" +
                    "3456789" +
                    "</span>" +
                    "c" +
                    "</span>" +
                    "d" +
                    "<span>" +
                    "e" +
                    "<span id=\"end\">" +
                    "12345" +
                    "</span>" +
                    "</span>");

                expect(textStart.parent()[0].childNodes.length).toBe(1);

                expect(textStart.parent()[0].firstChild).toBe(textStart[0]);

                expect(textStart[0].nodeValue).toBe("123456789");


                expect(textEnd.parent()[0].childNodes.length).toBe(1);

                expect(textEnd.parent()[0].firstChild).toBe(textEnd[0]);

                expect(textEnd[0].nodeValue).toBe("123456789");

                div.remove();
                newDiv.remove();

            });


            it("works for complex node", function () {

                // d
                //    a
                //    span
                //           b
                //           span-start
                //                 123456789
                //           c
                //    d
                //    span
                //           e
                //           span-end
                //                 123456789
                //           f
                //    g


                var div = $("<div>" +
                    "a" +
                    "<span>" +
                    "b" +
                    "<span id=\"start\">" +
                    "123456789" +
                    "</span>" +
                    "c" +
                    "</span>" +
                    "d" +
                    "<span>" +
                    "e" +
                    "<span id=\"end\">" +
                    "123456789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g</div>").appendTo('body', undefined);


                var range = new Range(document);
                var textStart = $("#start");
                var textEnd = $("#end");


                range.setStartBefore(textStart);
                range.setEndAfter(textEnd);

                var f = range.cloneContents();

                var newDiv = $("<div>").appendTo('body');

                newDiv.append(f);

                expect(myHTML(newDiv)).toBe("<span>" +
                    "<span id=\"start\">" +
                    "123456789" +
                    "</span>" +
                    "c" +
                    "</span>" +
                    "d" +
                    "<span>" +
                    "e" +
                    "<span id=\"end\">" +
                    "123456789" +
                    "</span>" +
                    "</span>");

                div.remove();
                newDiv.remove();

            });

        });


        describe("extractContents", function () {

            it("works for simple text node", function () {
                var div = $("<div>123456789</div>").appendTo('body');
                var range = new Range(document);
                var text = new Node(div[0].firstChild);

                range.setStart(text, 2);
                range.setEnd(text, 5);

                var f = range.extractContents();

                var newDiv = $("<div>").appendTo('body');

                newDiv.append(f);
                expect(myHTML(newDiv)).toBe("345");

                // 节点不会合并的
                // expect(div[0].childNodes.length).toBe(1);

                expect(myHTML(div)).toBe("126789");

                // collapse to start
                expect(range.startContainer[0]).toBe(div[0].firstChild);
                expect(range.endContainer[0]).toBe(div[0].firstChild);
                expect(range.startOffset).toBe(2);
                expect(range.endOffset).toBe(2);
                expect(range.collapsed).toBe(true);

                div.remove();
                newDiv.remove();

            });


            it("works for complex text node", function () {

                // d
                //    a
                //    span
                //           b
                //           span-start
                //                 123456789
                //           c
                //    d
                //    span
                //           e
                //           span-end
                //                 123456789
                //           f
                //    g

                var div = $("<div>" +
                    "a" +
                    "<span>" +
                    "b" +
                    "<span id=\"start\">" +
                    "123456789" +
                    "</span>" +
                    "c" +
                    "</span>" +
                    "d" +
                    "<span id=\"endwrapper\">" +
                    "e" +
                    "<span id=\"end\">" +
                    "123456789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g</div>").appendTo('body', undefined);

                var endwrapper = $("#endwrapper");
                var range = new Range(document);
                var textStart = new Node($("#start")[0].firstChild);
                var textEnd = new Node($("#end")[0].firstChild);
                range.setStart(textStart, 2);
                range.setEnd(textEnd, 5);

                var f = range.extractContents();

                var newDiv = $("<div>").appendTo('body');

                newDiv.append(f);

                expect(myHTML(newDiv)).toBe("<span>" +
                    "<span id=\"start\">" +
                    "3456789" +
                    "</span>" +
                    "c" +
                    "</span>" +
                    "d" +
                    "<span id=\"endwrapper\">" +
                    "e" +
                    "<span id=\"end\">" +
                    "12345" +
                    "</span>" +
                    "</span>");

                var ret = "a" +
                    "<span>" +
                    "b" +
                    "<span id=\"start\">" +
                    "12" +
                    "</span>" +
                    "</span>" +
                    "<span id=\"endwrapper\">" +
                    "<span id=\"end\">" +
                    "6789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g", ret2 = myHTML(div);

                expect(myHTML(div)).toBe(ret);


                expect(range.startContainer[0]).toBe(div[0]);
                expect(range.collapsed).toBe(true);
                expect(range.startOffset).toBe(2);
                newDiv.remove();


                range.setStart(div, 0);


                f = range.extractContents();

                newDiv = $("<div>").appendTo('body');

                newDiv.append(f);

                expect(myHTML(newDiv)).toBe("a<span>b<span id=\"start\">12" +
                    "</span></span>");

                expect(myHTML(div)).toBe("<span id=\"endwrapper\">" +
                    "<span id=\"end\">" +
                    "6789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g");


                div.remove();
                newDiv.remove();

            });


            it("works for complex node", function () {

                // d
                //    a
                //    span
                //           b
                //           span-start
                //                 123456789
                //           c
                //    d
                //    span
                //           e
                //           span-end
                //                 123456789
                //           f
                //    g


                var div = $("<div>" +
                    "a" +
                    "<span>" +
                    "b" +
                    "<span id=\"start\">" +
                    "123456789" +
                    "</span>" +
                    "c" +
                    "</span>" +
                    "d" +
                    "<span>" +
                    "e" +
                    "<span id=\"end\">" +
                    "123456789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g</div>").appendTo('body', undefined);


                var range = new Range(document);
                var textStart = $("#start");
                var textEnd = $("#end");


                range.setStartBefore(textStart);
                range.setEndAfter(textEnd);

                var f = range.extractContents();

                var newDiv = $("<div>").appendTo('body');

                newDiv.append(f);

                expect(myHTML(newDiv)).toBe("<span>" +
                    "<span id=\"start\">" +
                    "123456789" +
                    "</span>" +
                    "c" +
                    "</span>" +
                    "d" +
                    "<span>" +
                    "e" +
                    "<span id=\"end\">" +
                    "123456789" +
                    "</span>" +
                    "</span>");


                expect(myHTML(div)).toBe("a<span>b</span><span>f</span>g");

                expect(range.collapsed).toBe(true);
                expect(range.startContainer[0]).toBe(div[0]);
                expect(range.startOffset).toBe(2);

                div.remove();

                newDiv.remove();

            });

        });


        describe("deleteContents", function () {

            it("works for simple text node", function () {
                var div = $("<div>123456789</div>").appendTo('body');
                var range = new Range(document);
                var text = new Node(div[0].firstChild);

                range.setStart(text, 2);
                range.setEnd(text, 5);

                var f = range.deleteContents();

                expect(f).toBeUndefined();

                // 节点不会合并的
                // expect(div[0].childNodes.length).toBe(1);

                expect(myHTML(div)).toBe("126789");

                // collapse to start
                expect(range.startContainer[0]).toBe(div[0].firstChild);
                expect(range.endContainer[0]).toBe(div[0].firstChild);
                expect(range.startOffset).toBe(2);
                expect(range.endOffset).toBe(2);
                expect(range.collapsed).toBe(true);

                div.remove();

            });


            it("works for complex text node", function () {

                // d
                //    a
                //    span
                //           b
                //           span-start
                //                 123456789
                //           c
                //    d
                //    span
                //           e
                //           span-end
                //                 123456789
                //           f
                //    g

                var div = $("<div>" +
                    "a" +
                    "<span>" +
                    "b" +
                    "<span id=\"start\">" +
                    "123456789" +
                    "</span>" +
                    "c" +
                    "</span>" +
                    "d" +
                    "<span id=\"endwrapper\">" +
                    "e" +
                    "<span id=\"end\">" +
                    "123456789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g</div>").appendTo('body', undefined);

                var endwrapper = $("#endwrapper");
                var range = new Range(document);
                var textStart = new Node($("#start")[0].firstChild);
                var textEnd = new Node($("#end")[0].firstChild);
                range.setStart(textStart, 2);
                range.setEnd(textEnd, 5);

                var f = range.deleteContents();

                expect(f).toBeUndefined();

                var ret = "a" +
                    "<span>" +
                    "b" +
                    "<span id=\"start\">" +
                    "12" +
                    "</span>" +
                    "</span>" +
                    "<span id=\"endwrapper\">" +
                    "<span id=\"end\">" +
                    "6789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g", ret2 = myHTML(div);

                expect(myHTML(div)).toBe(ret);


                expect(range.startContainer[0]).toBe(div[0]);
                expect(range.collapsed).toBe(true);
                expect(range.startOffset).toBe(2);

                div.remove();

            });


            it("works for complex node", function () {

                // d
                //    a
                //    span
                //           b
                //           span-start
                //                 123456789
                //           c
                //    d
                //    span
                //           e
                //           span-end
                //                 123456789
                //           f
                //    g


                var div = $("<div>" +
                    "a" +
                    "<span>" +
                    "b" +
                    "<span id=\"start\">" +
                    "123456789" +
                    "</span>" +
                    "c" +
                    "</span>" +
                    "d" +
                    "<span>" +
                    "e" +
                    "<span id=\"end\">" +
                    "123456789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g</div>").appendTo('body', undefined);


                var range = new Range(document);
                var textStart = $("#start");
                var textEnd = $("#end");


                range.setStartBefore(textStart);
                range.setEndAfter(textEnd);

                var f = range.deleteContents();

                expect(f).toBeUndefined();


                expect(myHTML(div)).toBe("a<span>b</span><span>f</span>g");

                expect(range.collapsed).toBe(true);
                expect(range.startContainer[0]).toBe(div[0]);
                expect(range.startOffset).toBe(2);

                div.remove();

            });

        });


        it("optimize change range from text to node", function () {
            var div = $("<div><span>123456</span></div>");
            div.appendTo('body');
            var range = new Range(document);
            var text = $(div[0].firstChild.firstChild);
            var span = div.first();
            range.setStart(text, 0);
            range.setEnd(text, text[0].nodeValue.length);

            range.optimize();

            expect(range.startContainer[0]).toBe(span[0]);
            expect(range.endContainer[0]).toBe(span[0]);
            expect(range.startOffset).toBe(0);
            expect(range.endOffset).toBe(1);

            div.remove();
        });


        it("optimizeBookmark exclude bookmark from start/endContainer", function () {
            var div = $("<div>" +
                "<span>1" +
                "<span _ke_bookmark=1 class='bookmark'>x</span>" +
                "2345" +
                "<span _ke_bookmark=1 class='bookmark'>y</span>" +
                "6</span>" +
                "</div>");
            div.appendTo('body');

            var bookmarks = div.all(".bookmark");

            var bookmarkParent = bookmarks.item(0).parent();

            var range = new Range(document);
            range.setStart(bookmarks.item(0), 0);
            range.setEnd(bookmarks.item(1), 1);

            range.optimizeBookmark();

            expect(range.startContainer[0]).toBe(bookmarkParent[0]);
            expect(range.startOffset).toBe(1);
            expect(range.endContainer[0]).toBe(bookmarkParent[0]);
            expect(range.endOffset).toBe(4);

            div.remove();
        });


        it("getEnclosedNode works", function () {
            var div = $("<div>" +
                "<span _ke_bookmark=1 class='bookmark'>x0</span>" +
                "<span>1" +
                "<span _ke_bookmark=1 class='bookmark'>x</span>" +
                "2345" +
                "<span _ke_bookmark=1 class='bookmark'>y</span>" +
                "6</span>" +
                "<span _ke_bookmark=1 class='bookmark'>y0</span>" +
                "</div>");
            div.appendTo('body');

            var range = new Range(document);
            range.setStartBefore(div);
            range.setEndAfter(div);

            var n = range.getEnclosedNode();
            expect(n[0]).toBe(div[0]);

            range.setStart(div, 0);
            range.setEnd(div, 3);

            n = range.getEnclosedNode();
            expect(n[0]).toBe(div.first().next()[0]);

            var span = div.first();

            range.setStart(span, 0);
            range.setEnd(span, span[0].childNodes.length);

            expect(range.getEnclosedNode()).toBe(null);

            div.remove();
        });

        describe("shrink works", function () {

            var SHRINK_ELEMENT = 1,
                SHRINK_TEXT = 2;

            it("works simply", function () {
                var div = $("<div>" +
                    "<div><span>123</span></div>" +
                    "</div>").appendTo('body');
                var range = new Range(document);
                var div2 = div.one('div');
                range.setStart(div, 0);
                range.setEnd(div, 1);
                range.shrink(SHRINK_ELEMENT);
                expect(range.startContainer[0]).toBe(div2[0]);
                expect(range.endContainer[0]).toBe(div2[0]);
                expect(range.startOffset).toBe(0);
                expect(range.endOffset).toBe(1);
                div.remove();
            });


            it("works simply", function () {
                var div = $("<div>" +
                    "<div>22<span>123</span>22</div>" +
                    "</div>").appendTo('body');
                var range = new Range(document);
                var div2 = div.one('div');
                range.setStart(div, 0);
                range.setEnd(div, 1);
                range.shrink(SHRINK_ELEMENT);
                expect(range.startContainer[0]).toBe(div[0]);
                expect(range.endContainer[0]).toBe(div[0]);
                expect(range.startOffset).toBe(0);
                expect(range.endOffset).toBe(div[0].childNodes.length);
                div.remove();
            });

            it("works in all cases", function () {
                var div = $("<div>" +
                    "<b></b>" +
                    "<span>1" +
                    "<span _ke_bookmark=1 class='bookmark'>x</span>" +
                    "2345" +
                    "<span _ke_bookmark=1 class='bookmark'>y</span>" +
                    "6</span>" +
                    "</div>");
                div.appendTo('body');

                var span = div.first("span");

                var b = div.first("b");


                var range = new Range(document);
                range.setStartBefore(div);
                range.setEndAfter(div);

                range.shrink(SHRINK_ELEMENT);

                expect(range.startContainer[0]).toBe(div[0]);
                expect(range.endContainer[0]).toBe(div[0]);
                expect(range.startOffset).toBe(0);
                expect(range.endOffset).toBe(2);

                range.setStartBefore(div);
                range.setEndAfter(div);

                range.shrink(SHRINK_ELEMENT, 1);

                expect(range.startContainer[0]).toBe(b[0]);
                expect(range.endContainer[0]).toBe(span[0]);
                expect(range.startOffset).toBe(0);
                expect(range.endOffset).toBe(span[0].childNodes.length);


                var textStart = $(span[0].firstChild),
                    textEnd = $(span[0].lastChild);

                range.setStartBefore(div);
                range.setEndAfter(div);

                range.shrink(SHRINK_TEXT);

                expect(range.startContainer[0]).toBe(document.body);
                expect(range.endContainer[0]).toBe(span[0]);
                expect(range.startOffset).toBe(div._4eIndex());
                expect(range.endOffset).toBe(span[0].childNodes.length);


                range.shrink(SHRINK_TEXT, 1);

                expect(range.startContainer[0]).toBe(document.body);
                expect(range.endContainer[0]).toBe(textEnd[0]);
                expect(range.startOffset).toBe(div._4eIndex());
                expect(range.endOffset).toBe(textEnd[0].nodeValue.length);


                range.setStartAfter(b);
                range.setEndAfter(div);

                range.shrink(SHRINK_TEXT);

                expect(range.startContainer[0]).toBe(span[0]);
                expect(range.endContainer[0]).toBe(span[0]);
                expect(range.startOffset).toBe(0);
                expect(range.endOffset).toBe(span[0].childNodes.length);


                range.shrink(SHRINK_TEXT, 1);

                expect(range.startContainer[0]).toBe(textStart[0]);
                expect(range.endContainer[0]).toBe(textEnd[0]);
                expect(range.startOffset).toBe(0);
                expect(range.endOffset).toBe(textEnd[0].nodeValue.length);

                div.remove();
            });

        });

        it("createBookmarks2 works", function () {
            var div = $("<div>" +
                "<span>1" +
                "<span _ke_bookmark=1 class='bookmark'>x</span>" +
                "2345" +
                "<span _ke_bookmark=1 class='bookmark'>y</span>" +
                "6</span>" +
                "</div>");
            div.prependTo('body');

            var span = div.first();

            var range = new Range(document);
            range.setStartBefore(span);
            range.setEndAfter(span);

            var bookmark2 = range.createBookmark2();

            expect(bookmark2.is2).toBe(true);
            expect(bookmark2.startOffset).toBe(0);
            expect(bookmark2.endOffset).toBe(1);
            expect(bookmark2.start).toEqual(div._4eAddress());
            expect(bookmark2.end).toEqual(div._4eAddress());

            div.remove();
        });

        it("createBookmark works", function () {

            var div = $("<div>" +
                "<span>1" +
                "<span _ke_bookmark=1 class='bookmark'>x</span>" +
                "2345" +
                "<span _ke_bookmark=1 class='bookmark'>y</span>" +
                "6</span>" +
                "</div>");
            div.prependTo('body');

            var span = div.first();

            var range = new Range(document);
            range.setStartBefore(span);
            range.setEndAfter(span);

            var bookmark = range.createBookmark();
            var bookS = div.first();
            var bookE = div.last();

            expect(bookmark.startNode[0]).toBe(bookS[0]);
            expect(bookmark.endNode[0]).toBe(bookE[0]);

            expect(div[0].childNodes.length).toBe(3);
            expect(div[0].childNodes[1]).toBe(span[0]);

            div.remove();

        });


        it("insertNode works", function () {

            var div = $("<div>" +
                "<span>1" +
                "<span _ke_bookmark=1 class='bookmark'>x</span>" +
                "2345" +
                "<span _ke_bookmark=1 class='bookmark'>y</span>" +
                "6</span>" +
                "</div>");
            div.prependTo('body');

            var books = div.all(".bookmark");
            var range = new Range();
            range.setStartBefore(books.item(0));
            range.setEndAfter(books.item(1));

            expect(range.endContainer[0].childNodes[range.endOffset].nodeValue).toBe('6');

            var n;
            range.insertNode(n = $("<div id='one'>one</div>"));
            var start = range.startContainer[0].childNodes[range.startOffset];
            expect(start).toBe(n[0]);

            expect(range.endContainer[0].childNodes[range.endOffset].nodeValue).toBe('6');

            div.remove();

        });

        describe("moveToBookmark", function () {
            it("v2 works", function () {
                var div = $("<div>" +
                    "<span>1" +
                    "<span _ke_bookmark=1 class='bookmark'>x</span>" +
                    "2345" +
                    "<span _ke_bookmark=1 class='bookmark'>y</span>" +
                    "6</span>" +
                    "</div>");
                div.prependTo('body');

                var span = div.first();

                var range = new Range(document);
                range.setStartBefore(span);
                range.setEndAfter(span);

                var bookmark2 = range.createBookmark2();

                var range2 = new Range(document);
                range2.moveToBookmark(bookmark2);

                expect(range.startContainer[0]).toBe(range2.startContainer[0]);
                expect(range.startOffset).toBe(range2.startOffset);
                expect(range.endContainer[0]).toBe(range2.endContainer[0]);
                expect(range.endOffset).toBe(range2.endOffset);

                div.remove();
            });


            it("v1 works", function () {
                var div = $("<div>" +
                    "<span>1" +
                    "<span _ke_bookmark=1 class='bookmark'>x</span>" +
                    "2345" +
                    "<span _ke_bookmark=1 class='bookmark'>y</span>" +
                    "6</span>" +
                    "</div>");
                div.prependTo('body');

                var span = div.first();

                var range = new Range(document);
                range.setStartBefore(span);
                range.setEndAfter(span);

                var originalRange = range.clone();

                var bookmark2 = range.createBookmark();

                var range2 = new Range(document);
                range2.moveToBookmark(bookmark2);

                expect(originalRange.startContainer[0]).toBe(range2.startContainer[0]);
                expect(originalRange.startOffset)
                    .toBe(range2.startOffset);
                expect(originalRange.endContainer[0]).toBe(range2.endContainer[0]);
                expect(originalRange.endOffset)
                    .toBe(range2.endOffset);

                div.remove();
            });
        });
        it("getCommonAncestor works", function () {
            var div = $("<div>" +
                "<span>1" +
                "<span _ke_bookmark=1 class='bookmark'>x</span>" +
                "2345" +
                "<span _ke_bookmark=1 class='bookmark'>y</span>" +
                "6</span>" +
                "</div>");
            div.prependTo('body');

            var span = div.first();

            var range = new Range(document);
            range.setStartBefore(span);
            range.setEndAfter(span);

            expect(range.getCommonAncestor()[0]).toBe(div[0]);

            var bookmarks = div.all(".bookmark");

            var textNode = $(bookmarks[0].nextSibling);

            range.setStart(span, 0);

            range.setEnd(textNode, 2);

            expect(range.getCommonAncestor()[0]).toBe(span[0]);

            div.remove();
        });


        describe("enlarge", function () {


            describe("enlarge element", function () {
                it("enlarge element within same element", function () {

                    var div = $("<div><strong><span>123</span>abc</strong>def</div>")
                        .prependTo('body');

                    var span = div.first().first();

                    var textNode1 = $(span[0].firstChild);

                    var textNode2 = $(span[0].nextSibling);

                    var range = new Range(document);

                    range.setStart(textNode1, 0);
                    range.setEnd(textNode2, textNode2[0].nodeValue.length);

                    range.enlarge(Editor.RangeType.ENLARGE_ELEMENT);

                    expect(range.startContainer[0]).toBe(div[0]);
                    expect(range.endContainer[0]).toBe(div[0]);
                    expect(range.startOffset).toBe(0);
                    expect(range.endOffset).toBe(1);

                    div.remove();
                });


                it("enlarge element within same element 2", function () {

                    var div = $("<div><strong>x<span>123</span>abc</strong>def</div>")
                        .prependTo('body');

                    var span = div.first("strong").first("span");

                    var textNode1 = $(span[0].firstChild);

                    var textNode2 = $(span[0].nextSibling);

                    var strong = div.first("strong");

                    var range = new Range(document);

                    range.setStart(textNode1, 0);
                    range.setEnd(textNode2, textNode2[0].nodeValue.length);

                    range.enlarge(Editor.RangeType.ENLARGE_ELEMENT);

                    expect(range.startContainer[0]).toBe(strong[0]);
                    expect(range.endContainer[0]).toBe(textNode2[0]);
                    expect(range.startOffset).toBe(1);
                    expect(range.endOffset).toBe(textNode2[0].nodeValue.length);

                    div.remove();
                });


                it("enlarge element within same element 3", function () {

                    var div = $("<div><strong>x<span>123</span><span>abc</span></strong>def</div>")
                        .prependTo('body');

                    var span = div.first("strong").first("span");

                    var span2 = span.next();

                    var textNode1 = $(span[0].firstChild);

                    var textNode2 = $(span2[0].firstChild);

                    var strong = div.first("strong");

                    var range = new Range(document);

                    range.setStart(textNode1, 0);
                    range.setEnd(textNode2, textNode2[0].nodeValue.length);

                    range.enlarge(Editor.RangeType.ENLARGE_ELEMENT);

                    expect(range.startContainer[0]).toBe(strong[0]);
                    expect(range.endContainer[0]).toBe(strong[0]);
                    expect(range.startOffset).toBe(1);
                    expect(range.endOffset).toBe(3);

                    div.remove();
                });


                it("enlarge element even bookmark", function () {
                    var div = $("<div>" +
                        "<strong>" +
                        "<span _ke_bookmark='1'></span>" +
                        "<span>123</span><span>abc</span>" +
                        "<span _ke_bookmark='1'></span>" +
                        "</strong>" +
                        "def" +
                        "</div>")
                        .prependTo('body');

                    var span = div.one("span").next();
                    var span2 = span.next();
                    var range = new Range(document);
                    range.setStart(span, 0);
                    range.setEnd(span2, 1);

                    range.enlarge(Editor.RangeType.ENLARGE_ELEMENT);

                    expect(range.startContainer[0]).toBe(div[0]);
                    expect(range.endContainer[0]).toBe(div[0]);
                    expect(range.startOffset).toBe(0);
                    expect(range.endOffset).toBe(1);


                    div.remove();


                });
            });


            describe("enlarge block", function () {

                it("enlarge block", function () {
                    var div = $("<div>12<span>3456</span>789</div>").appendTo('body');
                    var text = $(div.one("span")[0].firstChild);
                    var div2 = $("<div>ab<span>cdefg</span>hij<br/></div>").appendTo('body');
                    var text2 = $(div2.one("span")[0].firstChild);

                    var range = new Range(document);
                    range.setStart(text, 1);
                    range.setEnd(text2, 1);

                    range.enlarge(Editor.RangeType.ENLARGE_BLOCK_CONTENTS);

                    expect(range.startContainer[0]).toBe(div[0]);
                    expect(range.startOffset).toBe(0);
                    expect(range.endContainer[0]).toBe(div2[0]);
                    expect(range.endOffset).toBe(div2[0].childNodes.length);

                    div.remove();
                    div2.remove();
                });


                it("enlarge block 2", function () {
                    var div = $("<div>12<span>3456</span>789</div>").appendTo('body');
                    var text = $(div.one("span")[0].firstChild);
                    var div2 = $("<div>ab<span>cdefg</span>hij<br/></div>").appendTo('body');
                    var text2 = $(div2.one("span")[0].firstChild);

                    var range = new Range(document);
                    range.setStart(div, 0);
                    range.setEnd(text2, 1);

                    range.enlarge(Editor.RangeType.ENLARGE_BLOCK_CONTENTS);

                    expect(range.startContainer[0]).toBe(div[0]);
                    expect(range.startOffset).toBe(0);
                    expect(range.endContainer[0]).toBe(div2[0]);
                    expect(range.endOffset).toBe(div2[0].childNodes.length);

                    div.remove();
                    div2.remove();
                });
            });


            describe("enlarge list", function () {


                it("enlarge list", function () {

                    // 不能跳过 br !! ??
                    var ul = $("<ul></ul>").appendTo('body');
                    var div = $("<li><br/>12<br/><span>3456</span>789</li>").appendTo(ul);
                    var text = $(div.one("span")[0].firstChild);
                    var div2 = $("<li>ab<span>cdefg</span><br/>hij<br/></li>").appendTo(ul);
                    var text2 = $(div2.one("span")[0].firstChild);

                    var range = new Range(document);
                    range.setStart(text, 1);
                    range.setEnd(text2, 1);

                    range.enlarge(Editor.RangeType.ENLARGE_LIST_ITEM_CONTENTS);

                    expect(range.startContainer[0]).toBe(div[0]);
                    expect(range.startOffset).toBe(3);
                    expect(range.endContainer[0]).toBe(div2[0]);
                    expect(range.endOffset).toBe(3);

                    div.remove();
                    div2.remove();


                });

            });
        });

        it("checkStartOfBlock/checkEndOfBlock works", function () {
            var div = $("<div>" +
                "<span><b><i>123456789</i></b></span>" +
                "</div>").appendTo('body');

            var range = new Range(document);
            var textNode = $(div.one("i")[0].firstChild);
            var i = textNode.parent();
            range.setStart(textNode, 1);
            range.setEnd(textNode, 1);

            var ret = range.checkStartOfBlock();

            expect(ret).toBe(false);

            expect(range.checkEndOfBlock()).toBe(false);


            range.setStartAfter(i)
            range.setEndAfter(i);

            ret = range.checkStartOfBlock();

            expect(ret).toBe(false);
            expect(range.checkEndOfBlock()).toBe(true);


            range.setStart(i, 0);
            range.setEndAfter(i);

            ret = range.checkStartOfBlock();

            expect(ret).toBe(true);
            expect(range.checkEndOfBlock()).toBe(true);

            div.remove();

        });

        describe("checkBoundaryOfElement", function () {

            it("check start correctly", function () {

                var div = $("<div><span></span>" +
                    "<span>2</span></div>").appendTo('body');

                var span = div.all("span").item(1);

                var range = new Range();
                range.setStart(span, 0);
                range.setEnd(span, 0);

                expect(range.checkBoundaryOfElement(div, RangeType.START))
                    .toBe(true);

                div.remove();

                div = $("<div><img />" +
                    "<span>2</span></div>").appendTo('body');

                span = div.all("span").item(0);

                range = new Range();
                range.setStart(span, 0);
                range.setEnd(span, 0);

                expect(range.checkBoundaryOfElement(div, RangeType.START))
                    .toBe(false);

                div.remove();
            });


            it("check end correctly", function () {

                var div = $("<div>" +
                    "<span>2</span><span></span></div>").appendTo('body');

                var span = div.all("span").item(0);

                var range = new Range();
                range.setStart(span, 1);
                range.setEnd(span, 1);

                expect(range.checkBoundaryOfElement(div, RangeType.END))
                    .toBe(true);

                div.remove();

                div = $("<div><img />" +
                    "<span>2</span><img /></div>").appendTo('body');

                span = div.all("span").item(0);

                range = new Range();
                range.setStart(span, 1);
                range.setEnd(span, 1);

                expect(range.checkBoundaryOfElement(div, RangeType.END))
                    .toBe(false);

                div.remove();
            });

        });

        it("getBoundaryNodes works", function () {
            var div = $("<div>" +
                    "<span>1<span>4</span></span>" +
                    "<span>2<span>3</span>4</span><span>2</span>" +
                    "</div>").appendTo('body'),
                span = div.all("span");
            var range = new Range();
            range.setStart(span.item(0), 2);
            range.setEnd(span.item(4), 0);

            var bound = range.getBoundaryNodes();

            expect(bound.startNode[0]).toBe(span[2]);

            expect(bound.endNode[0]).toBe(span[2]);

            div.remove();
        });

        it("fixBlock works", function () {
            var div = $("<div>" +
                    "<span>1<span>4</span></span>" +
                    "<span>2<span>3</span>4</span><span>2</span>" +
                    "</div>").appendTo('body'),
                span = div.all("span");

            var range = new Range(document);
            range.setStart(span.item(0), 2);
            range.setEnd(span.item(4), 0);

            range.fixBlock(true, 'p');

            expect(myHTML(div)).toBe("<p>" +
                "<span>1<span>4</span></span>" +
                "<span>2<span>3</span>4</span><span>2</span>" +
                (UA.ie ? "" : "<br>") +
                "</p>");

            div.remove();


            div = $("<div>" +
                "<span>1<span>4</span></span>" +
                "<span>2<span>3</span>4</span><span>2</span>" +
                "</div>").appendTo('body');
            span = div.all("span");

            range = new Range(document);
            range.setStart(span.item(0), 2);
            range.setEnd(span.item(4), 0);

            range.fixBlock(false, 'p');

            expect(myHTML(div)).toBe("<p>" +
                "<span>1<span>4</span></span>" +
                "<span>2<span>3</span>4</span><span>2</span>" +
                (UA.ie ? "" : "<br>") +
                "</p>");

            div.remove();
        });


        it("splitElement works", function () {
            var div = $("<div>" +
                    "<div>" +
                    "<span>1<span>4</span></span>" +
                    "<span>2<span>3</span>4</span><span>2</span>" +
                    "</div>" +
                    "</div>").appendTo('body'),
                span = div.all("span");

            var range = new Range(document);
            range.setStart(span.item(2), 3);

            range.splitElement(div.first());

            expect(myHTML(div))
                .toBe("<div><span>1<span>4</span></span><span>2<span>3</span>4</span></div>" +
                "<div><span></span><span>2</span></div>");

            expect(range.startContainer[0]).toBe(div[0]);
            expect(range.endContainer[0]).toBe(div[0]);
            expect(range.startOffset).toBe(1);
            expect(range.endOffset).toBe(1);
            expect(range.collapsed).toBe(true);

            div.remove();
        });


        describe("splitBlock", function () {
            it("splitBlock in the same block works", function () {
                var div = $("<div><p>1</p>2345<p>6</p>" +
                    "7890<p>ok</p></div>").appendTo('body');

                var firstText = $(div[0].childNodes[1]);

                var range = new Range(document);
                range.setStart(firstText, 1);
                range.setEnd(firstText, 2);

                range.splitBlock('p');

                var fake = UA.ie ? "" : "<br>";

                expect(myHTML(div).replace(/\s/g, "")).toBe("<p>1</p><p>2" +
                    fake +
                    "</p><p>45" +
                    fake +
                    "</p><p>6</p>" +
                    "7890<p>ok</p>");

                expect(range.startContainer[0]).toBe(div[0]);
                expect(range.endContainer[0]).toBe(div[0]);
                expect(range.startOffset).toBe(2);
                expect(range.endOffset).toBe(2);

                div.remove();
            });

            it("splitBlock across block works", function () {
                var div = $("<div><p>1</p>2345<p>6</p>" +
                    "7890<p>ok</p></div>").appendTo('body');

                var firstText = $(div[0].childNodes[1]);

                var secondText = $(div[0].childNodes[3]);

                var range = new Range(document);
                range.setStart(firstText, 1);
                range.setEnd(secondText, 1);

                range.splitBlock('p');

                var fake = UA.ie ? "" : "<br>";

                expect(myHTML(div)).toBe("<p>1</p><p>2" +
                    // fake +
                    "</p>" +
                    "<p>" +
                    "890" +
                    fake +
                    "</p>" +
                    "<p>ok</p>");

                expect(range.startContainer[0]).toBe(div[0]);
                expect(range.endContainer[0]).toBe(div[0]);
                expect(range.startOffset).toBe(2);
                expect(range.endOffset).toBe(2);

                div.remove();
            });


            it("splitBlock at the start position of block works", function () {
                var div = $("<div><p>1</p>2345<p>6</p>" +
                    "7890<p>ok</p></div>").appendTo('body');

                var firstText = $(div[0].childNodes[1]);

                var range = new Range(document);
                range.setStart(firstText, 0);
                range.setEnd(firstText, 4);

                range.splitBlock('p');

                var fake = UA.ie ? "" : "<br>";

                expect(myHTML(div)).toBe("<p>1</p><p>" +
                    fake +
                    "</p><p>6" +
                    // fake +
                    "</p>" +
                    "7890" +
                    //fake +
                    "<p>ok</p>");

                expect(range.startContainer[0]).toBe(div[0]);
                expect(range.endContainer[0]).toBe(div[0]);
                expect(range.startOffset).toBe(2);
                expect(range.endOffset).toBe(2);

                div.remove();
            });

            it("moveToElementEditablePosition works", function () {
                var div = $("<div><span><i></i></span><span><i>5678</i></span></div>")
                    .appendTo('body');
                var range = new Range(document);
                var is = div.all("i");
                range.moveToElementEditablePosition(div);
                expect(range.startContainer[0]).toBe(is[0]);
                expect(range.endContainer[0]).toBe(is[0]);
                expect(range.collapsed).toBe(true);
                expect(range.startOffset).toBe(0);
                expect(range.endOffset).toBe(0);

                range.moveToElementEditablePosition(div, true);
                expect(range.startContainer[0]).toBe(is[1]);
                expect(range.endContainer[0]).toBe(is[1]);
                expect(range.collapsed).toBe(true);
                expect(range.startOffset).toBe(1);
                expect(range.endOffset).toBe(1);
                div.remove();
            });

            it("_4eBreakParent works", function () {
                var div = $("<div><div><span>12<i></i>34</span><span><i>5678</i></span></div></div>")
                        .appendTo('body'),
                    range = new Range(document),
                    is = div.all("i");

                is.item(0)._4eBreakParent(div.first());
                expect(myHTML(div)).toBe("<div><span>12" +
                    "</span>" +
                    "</div>" +
                    "<i></i>" +
                    "<div>" +
                    "<span>" +
                    "34</span><span><i>5678</i></span></div>")
                div.remove();
            });
        });


        describe("insertNodeByDtd", function () {


            it("works in common case", function () {
                var div = $("<div>" +
                    "<p>" +
                    "<span class=\"text-wrapper\">" +
                    "1234567" +
                    "</span>" +
                    "</p>" +
                    "</div>").appendTo('body');

                var text = $(div.one(".text-wrapper")[0].firstChild);

                var range = new Range(document);

                range.setStart(text, 2);

                range.setEnd(text, 3);

                range.insertNodeByDtd($("<p>3</p>"));

                expect(myHTML(div).replace("<br>", "")).toBe("<p>" +
                    "<span class=\"text-wrapper\">12</span>" +
                    "</p>" +
                    "<p>" +
                    "3" +
                    "</p>" + "<p>" +
                    "<span class=\"text-wrapper\">4567</span>" +
                    "</p>")

                div.remove();
            });

            it("can replace empty p", function () {
                var div = $("<div>" +
                    "<p>" +
                    "<br/>" +
                    "</p>" +
                    "</div>").appendTo('body');

                var p = div.first();

                var range = new Range(document);

                range.setStart(p, 0);

                range.setEnd(p, 1);

                range.insertNodeByDtd($("<p>56</p>"));

                expect(myHTML(div)).toBe("<p>56</p>");

                div.remove();
            });


        });

    });
},{
    requires:['editor']
});
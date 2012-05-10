/**
 * Test cross browser Range implementation for Editor
 * @author yiminghe@gmail.com
 */
KISSY.use("editor", function (S, Editor) {
    var DOM = S.DOM, $ = S.all, Node = S.Node;
    var Walker = Editor.Walker;
    var Range = Editor.Range;

    describe("range", function () {

        describe("cloneContents", function () {

            it("works for simple text node", function () {
                var div = $("<div>123456789</div>").appendTo("body");
                var range = new Range(document);
                var text = new Node(div[0].firstChild);

                range.setStart(text, 2);
                range.setEnd(text, 5);

                var f = range.cloneContents();

                var newDiv = $("<div>").appendTo("body");

                newDiv.append(f);

                expect(newDiv.html()).toBe("345");

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
                    "g</div>").appendTo("body", undefined);

                var range = new Range(document);
                var textStart = new Node($("#start")[0].firstChild);
                var textEnd = new Node($("#end")[0].firstChild);
                range.setStart(textStart, 2);
                range.setEnd(textEnd, 5);

                var f = range.cloneContents();

                var newDiv = $("<div>").appendTo("body");

                newDiv.append(f);

                expect(newDiv.html()).toBe("<span>" +
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
                    "g</div>").appendTo("body", undefined);


                var range = new Range(document);
                var textStart = $("#start");
                var textEnd = $("#end");


                range.setStartBefore(textStart);
                range.setEndAfter(textEnd);

                var f = range.cloneContents();

                var newDiv = $("<div>").appendTo("body");

                newDiv.append(f);

                expect(newDiv.html()).toBe("<span>" +
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
                var div = $("<div>123456789</div>").appendTo("body");
                var range = new Range(document);
                var text = new Node(div[0].firstChild);

                range.setStart(text, 2);
                range.setEnd(text, 5);

                var f = range.extractContents();

                var newDiv = $("<div>").appendTo("body");

                newDiv.append(f);
                expect(newDiv.html()).toBe("345");

                // 节点不会合并的
                // expect(div[0].childNodes.length).toBe(1);

                expect(div.html()).toBe("126789");

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
                    "<span id=\"endWrapper\">" +
                    "e" +
                    "<span id=\"end\">" +
                    "123456789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g</div>").appendTo("body", undefined);

                var endWrapper = $("#endWrapper");
                var range = new Range(document);
                var textStart = new Node($("#start")[0].firstChild);
                var textEnd = new Node($("#end")[0].firstChild);
                range.setStart(textStart, 2);
                range.setEnd(textEnd, 5);

                var f = range.extractContents();

                var newDiv = $("<div>").appendTo("body");

                newDiv.append(f);

                expect(newDiv.html()).toBe("<span>" +
                    "<span id=\"start\">" +
                    "3456789" +
                    "</span>" +
                    "c" +
                    "</span>" +
                    "d" +
                    "<span id=\"endWrapper\">" +
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
                    "<span id=\"endWrapper\">" +
                    "<span id=\"end\">" +
                    "6789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g", ret2 = div.html();

                expect(div.html()).toBe(ret);


                expect(range.startContainer[0]).toBe(div[0]);
                expect(range.collapsed).toBe(true);
                expect(range.startOffset).toBe(2);
                newDiv.remove();


                range.setStart(div, 0);



                f = range.extractContents();

                newDiv = $("<div>").appendTo("body");

                newDiv.append(f);

                expect(newDiv.html()).toBe("a<span>b<span id=\"start\">12" +
                    "</span></span>");

                expect(div.html()).toBe("<span id=\"endWrapper\">" +
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
                    "g</div>").appendTo("body", undefined);


                var range = new Range(document);
                var textStart = $("#start");
                var textEnd = $("#end");


                range.setStartBefore(textStart);
                range.setEndAfter(textEnd);

                var f = range.extractContents();

                var newDiv = $("<div>").appendTo("body");

                newDiv.append(f);

                expect(newDiv.html()).toBe("<span>" +
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


                expect(div.html()).toBe("a<span>b</span><span>f</span>g");

                expect(range.collapsed).toBe(true);
                expect(range.startContainer[0]).toBe(div[0]);
                expect(range.startOffset).toBe(2);

                div.remove();

                newDiv.remove();

            });

        });


        describe("deleteContents", function () {

            it("works for simple text node", function () {
                var div = $("<div>123456789</div>").appendTo("body");
                var range = new Range(document);
                var text = new Node(div[0].firstChild);

                range.setStart(text, 2);
                range.setEnd(text, 5);

                var f = range.deleteContents();

                expect(f).toBeUndefined();

                // 节点不会合并的
                // expect(div[0].childNodes.length).toBe(1);

                expect(div.html()).toBe("126789");

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
                    "<span id=\"endWrapper\">" +
                    "e" +
                    "<span id=\"end\">" +
                    "123456789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g</div>").appendTo("body", undefined);

                var endWrapper = $("#endWrapper");
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
                    "<span id=\"endWrapper\">" +
                    "<span id=\"end\">" +
                    "6789" +
                    "</span>" +
                    "f" +
                    "</span>" +
                    "g", ret2 = div.html();

                expect(div.html()).toBe(ret);


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
                    "g</div>").appendTo("body", undefined);


                var range = new Range(document);
                var textStart = $("#start");
                var textEnd = $("#end");


                range.setStartBefore(textStart);
                range.setEndAfter(textEnd);

                var f = range.deleteContents();

                expect(f).toBeUndefined();


                expect(div.html()).toBe("a<span>b</span><span>f</span>g");

                expect(range.collapsed).toBe(true);
                expect(range.startContainer[0]).toBe(div[0]);
                expect(range.startOffset).toBe(2);

                div.remove();

            });

        });
    });

});
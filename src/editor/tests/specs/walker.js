/**
 * Test walker for Editor
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Editor) {
    var Dom = S.DOM, $ = S.all;
    var Walker = Editor.Walker;
    var Range = Editor.Range;

    describe("walker", function () {

        it("simple works", function () {
            var div = $("<div>" +
                "<span>" +
                "1" +
                "<span>" +
                "1-1" +
                "</span>" +
                "</span>" +
                "<span>" +
                "<span>" +
                "2-1" +
                "</span>" +
                "2" +
                "</span>" +
                "<span>" +
                "3" +
                "<span>" +
                "3-1" +
                "</span>" +
                "</span>" +
                "</div>").appendTo('body');

            var range = new Range(document);
            range.setStart(div, 1)
            range.setEnd(div, 3);
            var walker = new Walker(range);
            var node = walker.next();
            expect(node[0].nodeType).toBe(1);
            expect(node.html().toLowerCase()).toBe("<span>2-1</span>2");

            node = walker.next();
            expect(node[0].nodeType).toBe(1);
            expect(node.html().toLowerCase()).toBe("2-1");

            for (var i = 0; i < 6; i++) {
                walker.next();
            }

            // 越界
            node = walker.next();
            expect(node).toBe(null);
            div.remove();
        });


        it("evaluator works", function () {
            var div = $("<div>" +
                "<span>" +
                "1" +
                "<span>" +
                "1-1" +
                "</span>" +
                "</span>" +
                "<span>" +
                "<span>" +
                "2-1" +
                "</span>" +
                "2" +
                "</span>" +
                "<span>" +
                "3" +
                "<span>" +
                "3-1" +
                "</span>" +
                "</span>" +
                "</div>").appendTo('body');

            var range = new Range(document);
            range.setStart(div, 1)
            range.setEnd(div, 3);
            var walker = new Walker(range);
            walker.evaluator = function (node) {
                // 只取文字节点
                return node.nodeType == 3;
            };
            var node = walker.next();
            expect(node[0].nodeType).toBe(3);
            expect(node.text()).toBe("2-1");

            node = walker.next();
            expect(node[0].nodeType).toBe(3);
            expect(node.text()).toBe("2");

            node = walker.next();
            expect(node[0].nodeType).toBe(3);
            expect(node.text()).toBe("3");

            node = walker.next();
            expect(node[0].nodeType).toBe(3);
            expect(node.text()).toBe("3-1");

            expect(walker.next()).toBe(null);

            div.remove();
        });

        it("breakOnFalse works", function () {
            var div = $("<div>" +
                "<span>" +
                "1" +
                "<span>" +
                "1-1" +
                "</span>" +
                "</span>" +
                "<span id='start'>" +
                "<span id='startInner'>" +
                "2-1" +
                "</span>" +
                "2" +
                "</span>" +
                "<span id='end'>" +
                "3" +
                "<span id='endInner'>" +
                "3-1" +
                "</span>" +
                "</span>" +
                "</div>").appendTo('body');

            var range = new Range(document);
            range.setStart(div, 1)
            range.setEnd(div, 3);
            var walker = new Walker(range);

            walker.evaluator = function (node) {
                // 只取文字节点
                return node.nodeType == 3;
            };


            var node = walker._iterator(false, true);

            expect(node).toBe(false);

            expect(walker.current.attr('id')).toBe("start");

            node = walker._iterator(false, true);

            expect(node).toBe(false);

            expect(walker.current.attr('id')).toBe("startInner")

            node = walker._iterator(false, true);

            expect(node).toBe(false);

            expect(walker.current.attr('id')).toBe("end")

            node = walker._iterator(false, true);

            expect(node).toBe(false);

            expect(walker.current.attr('id')).toBe("endInner");

            expect(walker._iterator(false, true)).toBe(null);

            div.remove();
        });

        it("checkForward works", function () {

            var div = $("<div>" +
                "<span>" +
                "1" +
                "<span>" +
                "1-1" +
                "</span>" +
                "</span>" +
                "</div>").appendTo('body');

            var div2 = $("<div>" +
                "<span>" +
                "1" +
                "<span>" +
                "1-1" +
                "</span>" +
                "</span>" +
                "</div>").appendTo('body');

            var range = new Range(document);
            range.setStart(div, 0)
            range.setEnd(div2, 1);
            var walker = new Walker(range);

            walker.evaluator = function (node) {
                return  node.nodeName.toLowerCase() !== 'div'
            };

            expect(walker.checkForward()).toBe(false);

            div.remove();
            div2.remove();
        });

    });

},{
    requires:['editor']
});
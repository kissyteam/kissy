/**
 * testcases for anim on node
 * @author yiminghe@gmail.com
 */
KISSY.use("anim,node", function (S, Anim, Node) {
    var $ = Node.all;

    function padding(s) {
        if (s.length == 1)
            return "0" + s;
        return s;
    }

    function normalizeColor(c) {
        if (c.toLowerCase().lastIndexOf("rgb(") == 0) {
            var x = [];
            c.replace(/\d+/g, function (m) {
                x.push(padding(Number(m).toString(16)));
            });
            c = "#" + x.join("");
        } else if (c.length == 4) {
            c = c.replace(/[^#]/g, function (c) {
                return c + c;
            });
        }
        return c;
    }

    describe("anim on node", function () {

        it("should attach node with slideUp/down well", function () {
            var test1 = Node.one("#test6");

            test1.css({
                width: '100px',
                height: '100px',
                'background-color': '#ccc'
            });

            test1.slideUp(0.4);

            waits(100);

            runs(function () {
                expect(test1.css("width")).toBe("100px");
                expect(test1.css("display")).toBe("block");
                expect(test1.css("height")).not.toBe("100px");
                expect(normalizeColor(test1.css("background-color")))
                    .toBe("#cccccc");
            });

            waits(800);

            runs(function () {
                expect(test1.css("width")).toBe("100px");
                expect(test1.css("display")).toBe("none");
                expect(test1.css("height")).toBe("100px");
                expect(normalizeColor(test1.css("background-color")))
                    .toBe("#cccccc");
            });


            runs(function () {
                test1.slideDown(0.4);
            });

            waits(100);

            runs(function () {
                expect(test1.css("width")).toBe("100px");
                expect(test1.css("display")).toBe("block");
                expect(test1.css("height")).not.toBe("100px");
                expect(normalizeColor(test1.css("background-color")))
                    .toBe("#cccccc");
            });

            waits(800);

            runs(function () {
                expect(test1.css("width")).toBe("100px");
                expect(test1.css("display")).toBe("block");
                expect(test1.css("height")).toBe("100px");
                expect(normalizeColor(test1.css("background-color")))
                    .toBe("#cccccc");
            });
        });

        it("should attach node with show/hide well", function () {
            var test2 = Node.one("#test2");

            test2.css({
                width: '100px',
                height: '100px'
            });

            test2.hide(0.2);

            waits(100);

            runs(function () {
                expect(test2.css("width")).not.toBe("100px");
                expect(test2.css("display")).toBe("block");
                expect(test2.css("height")).not.toBe("100px");
                expect(test2.css("opacity") + "").not.toBe('1');
            });

            waits(200);

            runs(function () {
                expect(test2.css("width")).toBe("100px");
                expect(test2.css("display")).toBe("none");
                expect(test2.css("height")).toBe("100px");
                expect(test2.css("opacity") + "").toBe('1');
            });

            runs(function () {
                test2.show(0.2);
            });


            waits(100);

            runs(function () {
                expect(test2.css("width")).not.toBe("100px");
                expect(test2.css("display")).toBe("block");
                expect(test2.css("height")).not.toBe("100px");
                expect(test2.css("opacity") + "").not.toBe('1');

            });


            waits(200);

            runs(function () {
                expect(test2.css("width")).toBe("100px");
                expect(test2.css("display")).toBe("block");
                expect(test2.css("height")).toBe("100px");
                expect(test2.css("opacity") + "").toBe('1');
            });

        });
    });

});
/**
 * testcases for anim on node
 * @author yiminghe@gmail.com
 */
KISSY.use("anim,node", function(S, Anim, Node) {
    var $ = Node.all;

    function padding(s) {
        if (s.length == 1)
            return "0" + s;
        return s;
    }

    function normalizeColor(c) {
        if (c.toLowerCase().lastIndexOf("rgb(") == 0) {
            var x = [];
            c.replace(/\d+/g, function(m) {
                x.push(padding(Number(m).toString(16)));
            });
            c = "#" + x.join("");
        } else if (c.length == 4) {
            c = c.replace(/[^#]/g, function(c) {
                return c + c;
            });
        }
        return c;
    }

    /**
     * test for css anim native support
     */
    var transitionName;
    if (transitionName) {
        transitionName += "Property";
    }

    // node 上的动画都是用 js 模拟，比较稳定
    transitionName="";

    describe("anim on node", function() {

        it("should attach node with slideup/down well", function() {
            var test1 = Node.one("#test6");

            test1.css({
                width: '100px',
                height: '100px',
                'background-color': '#ccc'
            });

            test1.slideUp(1);

            waits(100);

            runs(function() {
                if (transitionName) {
                    expect(test1.css(transitionName)).toBe("all");
                    expect(test1.css("width")).toBe("100px");
                    expect(test1.css("display")).toBe("block");
                    expect(parseInt(test1.css("height"))).toBe(0);
                    expect(normalizeColor(test1.css("background-color")))
                        .toBe("#cccccc");
                } else {
                    expect(test1.css("width")).toBe("100px");
                    expect(test1.css("display")).toBe("block");
                    expect(test1.css("height")).not.toBe("100px");
                    expect(normalizeColor(test1.css("background-color")))
                        .toBe("#cccccc");
                }
            });

            waits(1000);

            runs(function() {
                if (transitionName) {
                    expect(test1.css(transitionName)).toBe("none");
                }
                expect(test1.css("width")).toBe("100px");
                expect(test1.css("display")).toBe("none");
                expect(test1.css("height")).toBe("100px");
                expect(normalizeColor(test1.css("background-color")))
                    .toBe("#cccccc");
            });


            runs(function() {
                test1.slideDown(1);
            });

            waits(100);

            runs(function() {
                if (transitionName) {
                    expect(test1.css(transitionName)).toBe("all");
                    expect(test1.css("width")).toBe("100px");
                    expect(test1.css("display")).toBe("block");
                    expect(test1.css("height")).toBe("100px");
                    expect(normalizeColor(test1.css("background-color")))
                        .toBe("#cccccc");
                } else {
                    expect(test1.css("width")).toBe("100px");
                    expect(test1.css("display")).toBe("block");
                    expect(test1.css("height")).not.toBe("100px");
                    expect(normalizeColor(test1.css("background-color")))
                        .toBe("#cccccc");
                }
            });

            waits(1000);

            runs(function() {
                if (transitionName) {
                    expect(test1.css(transitionName)).toBe("none");
                }
                expect(test1.css("width")).toBe("100px");
                expect(test1.css("display")).toBe("block");
                expect(test1.css("height")).toBe("100px");
                expect(normalizeColor(test1.css("background-color")))
                    .toBe("#cccccc");
            });
        });

        it("should attach node with show/hide well", function() {
            var test2 = Node.one("#test2");

            test2.css({
                width: '100px',
                height: '100px'
            });

            test2.hide(1);

            waits(100);

            runs(function() {
                if (transitionName) {
                    expect(test2.css(transitionName)).toBe("all");
                    expect(parseInt(test2.css("width"))).toBe(0);
                    expect(test2.css("display")).toBe("block");
                    expect(parseInt(test2.css("height"))).toBe(0);
                    expect(parseInt(test2.css("opacity") + "")).toBe(0);
                } else {
                    expect(test2.css("width")).not.toBe("100px");
                    expect(test2.css("display")).toBe("block");
                    expect(test2.css("height")).not.toBe("100px");
                    expect(test2.css("opacity") + "").not.toBe('1');
                }
            });

            waits(1000);

            runs(function() {
                if (transitionName) {
                    expect(test2.css(transitionName)).toBe("none");
                }
                expect(test2.css("width")).toBe("100px");
                expect(test2.css("display")).toBe("none");
                expect(test2.css("height")).toBe("100px");
                expect(test2.css("opacity") + "").toBe('1');
            });

            runs(function() {
                test2.show(1);
            });


            waits(100);

            runs(function() {
                if (transitionName) {
                    expect(test2.css(transitionName)).toBe("all");
                    expect(test2.css("width")).toBe("100px");
                    expect(test2.css("display")).toBe("block");
                    expect(test2.css("height")).toBe("100px");
                    expect(test2.css("opacity") + "").toBe('1');
                } else {
                    expect(test2.css("width")).not.toBe("100px");
                    expect(test2.css("display")).toBe("block");
                    expect(test2.css("height")).not.toBe("100px");
                    expect(test2.css("opacity") + "").not.toBe('1');
                }
            });


            waits(1000);

            runs(function() {
                if (transitionName) {
                    expect(test2.css(transitionName)).toBe("none");
                }
                expect(test2.css("width")).toBe("100px");
                expect(test2.css("display")).toBe("block");
                expect(test2.css("height")).toBe("100px");
                expect(test2.css("opacity") + "").toBe('1');
            });

        });
    });

});
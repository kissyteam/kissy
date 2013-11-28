/**
 * test stylesheet
 * note: font-size ios bug
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, StyleSheet, Node) {
    var $ = Node.all;

    function filter(str) {
        var left = str.indexOf('{'), right = str.indexOf('}'),
            remain;

        if (left != -1) {
            remain = str.slice(left + 1, right);
        } else {
            remain = str;
        }

        remain = remain.toLowerCase().replace(/\s/g, '')
            .split(/;/).sort().join(";")
            .replace(/rgb\(255,0,0\)/, "#ff0000")
            .replace(/rgb\(51,51,51\)/, "#333333")
            .replace(/rgb\(0,0,0\)/, "#000000");

        if (left != -1) {
            remain = str.slice(0, left + 1) + remain + str.slice(right);
        }

        return remain;
    }

    describe("stylesheet", function () {
        it("works for link at same domain", function () {
            var n = S.all("<p class='test1'>test1</p>").appendTo('body');

            var n2 = S.all("<p class='test2'>test1</p>").appendTo('body');

            var ret = 0;

            var style = S.getScript("../data/test.css", function () {

                expect(n.css('height')).toBe("120px");

                var styleSheet = new StyleSheet(style);

                expect(filter(styleSheet.get())).toBe(filter(".test1 {color: #ff0000; " +
                    "height: 120px;}"));
                expect(filter(styleSheet.get(".test1"))).toBe(filter("color: #ff0000; " +
                    "height: 120px;"));

                // set
                styleSheet.set(".test1", {
                    height: "200px"
                });

                expect(filter(styleSheet.get())).toBe(filter(".test1 {color: #ff0000;" +
                    " height: 200px;}"));

                expect(n.css('height')).toBe("200px");

                // unset
                styleSheet.set(".test1", {
                    height: ""
                });

                expect(filter(styleSheet.get())).toBe(filter(".test1 {color: #ff0000;}"));

                expect(n.css('height')).not.toBe("200px");

                expect(filter(n.css("color"))).toBe("#ff0000");

                // unset all
                styleSheet.set(".test1", {
                    color: ""
                });

                expect(filter(styleSheet.get())).toBe(filter(""));

                expect(filter(n.css("color"))).toBe("#333333");

                // add
                styleSheet.set(".test2", {
                    height: "120px"
                });

                expect(filter(styleSheet.get())).toBe(filter(".test2 {height: 120px;}"));

                expect(n2.css('height')).toBe("120px");

                // disable
                styleSheet.disable();
                expect(n2.css('height')).not.toBe("120px");

                // enable
                styleSheet.enable();
                expect(n2.css('height')).toBe("120px");

                ret = 1;
            });

            waitsFor(function () {
                return ret;
            });

            runs(function () {
                n.remove();
                n2.remove();
                $(style).remove();
            });
        });


        it("works for inline style", function () {
            var n = S.all("<p class='test1'>test1</p>").appendTo('body');

            var n2 = S.all("<p class='test2'>test1</p>").appendTo('body');

            var ret = 0;

            var style = S.all("<style>.test1 {" +
                "color:#ff0000;" +
                "height: 120px;" +
                "}</style>").appendTo('body')[0];

            (function () {

                expect(n.css('height')).toBe("120px");

                var styleSheet = new StyleSheet(style);

                expect(filter(styleSheet.get()))
                    .toBe(filter(".test1 {color: #ff0000; height: 120px;}"));
                expect(filter(styleSheet.get(".test1")))
                    .toBe(filter("color: #ff0000; height: 120px;"));

                // set
                styleSheet.set(".test1", {
                    height: "200px"
                });

                expect(filter(styleSheet.get()))
                    .toBe(filter(".test1 {color: #ff0000; height: 200px;}"));

                expect(n.css('height')).toBe("200px");

                // unset
                styleSheet.set(".test1", {
                    height: ""
                });

                expect(filter(styleSheet.get())).toBe(filter(".test1 {color: #ff0000;}"));

                expect(n.css('height')).not.toBe("200px");

                expect(filter(n.css("color"))).toBe("#ff0000");

                // unset all
                styleSheet.set(".test1", {
                    color: ""
                });

                expect(filter(styleSheet.get())).toBe(filter(""));
                expect(filter(n.css("color"))).toBe("#333333");

                // add
                styleSheet.set(".test2", {
                    height: "120px"
                });

                expect(filter(styleSheet.get())).toBe(filter(".test2 {height: 120px;}"));

                expect(n2.css('height')).toBe("120px");

                // disable
                styleSheet.disable();
                expect(n2.css('height')).not.toBe("120px");

                // enable
                styleSheet.enable();
                expect(n2.css('height')).toBe("120px");

                ret = 1;
            })();

            waitsFor(function () {
                return ret;
            });

            runs(function () {
                n.remove();
                n2.remove();
                $(style).remove();
            });
        });
    });
}, {
    requires: ['stylesheet', 'node']
});
KISSY.use("stylesheet", function (S, StyleSheet) {

    var $ = S.all;

    function filter(str) {
        return (str || "").toLowerCase()
            .replace(/[\s;]/g, "")
            .replace(/rgb\(255,0,0\)/, "#ff0000")
            .replace(/rgb\(0,0,0\)/, "#000000");
    }

    describe("stylesheet", function () {

        it("works for link at same domain", function () {

            var n = S.all("<p class='test1'>test1</p>").appendTo("body");

            var n2 = S.all("<p class='test2'>test1</p>").appendTo("body");

            var ret = 0;

            var style = S.getScript("../../demo/test.css", function () {

                expect(n.css("font-size")).toBe("12px");

                var styleSheet = new StyleSheet(style);

                expect(filter(styleSheet.get())).toBe(filter(".test1 {color: #ff0000; font-size: 12px;}"));
                expect(filter(styleSheet.get(".test1"))).toBe(filter("color: #ff0000; font-size: 12px;"));

                // set
                styleSheet.set(".test1", {
                    fontSize:"20px"
                });

                expect(filter(styleSheet.get())).toBe(filter(".test1 {color: #ff0000; font-size: 20px;}"));

                expect(n.css("font-size")).toBe("20px");

                // unset
                styleSheet.set(".test1", {
                    fontSize:""
                });

                expect(filter(styleSheet.get())).toBe(filter(".test1 {color: #ff0000;}"));

                expect(n.css("font-size")).toBe("14px");

                expect(filter(n.css("color"))).toBe("#ff0000");

                // unset all
                styleSheet.set(".test1", {
                    color:""
                });

                expect(filter(styleSheet.get())).toBe(filter(""));
                expect(filter(n.css("color"))).toBe("#000000");

                // add
                styleSheet.set(".test2", {
                    fontSize:"12px"
                });

                expect(filter(styleSheet.get())).toBe(filter(".test2 {font-size: 12px;}"));

                expect(n2.css("font-size")).toBe("12px");

                // disable
                styleSheet.disable();
                expect(n2.css("font-size")).toBe("14px");

                // enable
                styleSheet.enable();
                expect(n2.css("font-size")).toBe("12px");

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

            var n = S.all("<p class='test1'>test1</p>").appendTo("body");

            var n2 = S.all("<p class='test2'>test1</p>").appendTo("body");

            var ret = 0;

            var style = S.all("<style>.test1 {" +
                "color:#ff0000;" +
                "font-size: 12px;" +
                "}</style>").appendTo("body")[0];

            (function () {

                expect(n.css("font-size")).toBe("12px");

                var styleSheet = new StyleSheet(style);

                expect(filter(styleSheet.get())).toBe(filter(".test1 {color: #ff0000; font-size: 12px;}"));
                expect(filter(styleSheet.get(".test1"))).toBe(filter("color: #ff0000; font-size: 12px;"));

                // set
                styleSheet.set(".test1", {
                    fontSize:"20px"
                });

                expect(filter(styleSheet.get())).toBe(filter(".test1 {color: #ff0000; font-size: 20px;}"));

                expect(n.css("font-size")).toBe("20px");

                // unset
                styleSheet.set(".test1", {
                    fontSize:""
                });

                expect(filter(styleSheet.get())).toBe(filter(".test1 {color: #ff0000;}"));

                expect(n.css("font-size")).toBe("14px");

                expect(filter(n.css("color"))).toBe("#ff0000");

                // unset all
                styleSheet.set(".test1", {
                    color:""
                });

                expect(filter(styleSheet.get())).toBe(filter(""));
                expect(filter(n.css("color"))).toBe("#000000");

                // add
                styleSheet.set(".test2", {
                    fontSize:"12px"
                });

                expect(filter(styleSheet.get())).toBe(filter(".test2 {font-size: 12px;}"));

                expect(n2.css("font-size")).toBe("12px");

                // disable
                styleSheet.disable();
                expect(n2.css("font-size")).toBe("14px");

                // enable
                styleSheet.enable();
                expect(n2.css("font-size")).toBe("12px");

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

});
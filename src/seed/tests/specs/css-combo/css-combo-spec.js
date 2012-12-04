describe("css-combo", function () {


    it("works for css and js", function () {

        var S = KISSY;



            $("<div>" +
                "<div class='test2'></div>" +
                "<div class='test1'></div>" +
                "</div>").appendTo("body");

            KISSY.config({

                packages: {
                    x: {
                        base: window['specsPath'] || "../specs/css-combo/"
                    }
                },
                modules: {
                    "x/x1": {
                        requires: ["x/x1.css", "x/x2"]
                    },
                    "x/x2": {
                        requires: ["x/x2.css"]
                    }
                }
            });

            var ret = 0;

            KISSY.use("x/x1", function (S, X1) {
                expect(X1).toBe(2);
                expect($(".test1").css("font-size")).toBe("20px");
                expect($(".test2").css("font-size")).toBe("30px");
                ret = 1;
            });

            waitsFor(function () {
                return ret;
            });

    });

});
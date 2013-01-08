describe("mod with suffix", function () {
    var S = KISSY;

    it("can load mod with a suffix when combo loader", function () {
        var combine = KISSY.config("combine"), ret = 0;

        KISSY.config({
            packages:{
                suffix:{
                    base:"../specs/"
                }
            },
            modules:{
                "suffix/a.tpl":{
                    requires:["./a.tpl.css"]
                }
            }
        });

        $("<div id='suffix-test'></div>").appendTo("body");

        S.use("suffix/a.tpl", function (S, A) {
            expect(A).toBe(1);
            expect($("#suffix-test").css("font-size")).toBe("77px");
            ret = 1;
        });

        waitsFor(function () {
            return ret;
        });

    });

});
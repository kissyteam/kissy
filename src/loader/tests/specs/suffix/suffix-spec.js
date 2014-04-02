describe("mod with suffix", function () {
    var S = KISSY;
    beforeEach(function () {
        KISSY.config('combine', false);
    });

    afterEach(function () {
        KISSY.clearLoader();
    });
    it("can load mod with a suffix when simple loader", function () {
        var ret = 0;

        KISSY.config({
            packages:{
                suffix:{
                    base:"../specs/suffix"
                }
            }
        });

        $("<div id='suffix-test'></div>").appendTo('body');

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
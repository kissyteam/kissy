describe("modules and packages", function () {

    it("does not depend on order", function () {

        KISSY.config({
            "modules":{
                "x/x":{
                    requires:['x/y']
                }
            }
        });

        KISSY.config("packages", {
            x:{
                base:"../specs/packages-modules"
            }
        });

        var ret;

        KISSY.use("x/x", function (S, X) {
            expect(X).toBe(8);
            ret = X;
        });

        waitsFor(function () {
            return ret == 8;
        },5000);

    });

});
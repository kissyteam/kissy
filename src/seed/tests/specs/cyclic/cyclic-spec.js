/**
 * test loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    describe("loader-cyclic", function () {
        it("detect cyclic dependency", function () {
            KISSY.config({
                packages: [
                    {
                        name: "cyclic",
                        path: "/kissy/src/seed/tests/specs/"
                    }
                ]
            });

            var ret;

            KISSY.use("cyclic/a", function (S, a) {
                ret = a.get();
            });

            waitsFor(function () {
                return ret;
            });

            runs(function () {
                expect(ret).toBe('caba');
            });
        });
    });
})(KISSY);


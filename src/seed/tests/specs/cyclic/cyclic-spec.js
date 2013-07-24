/**
 * test loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var d = window.location.href.replace(/[^/]*$/, "") + "../specs/";

    describe("loader-cyclic", function () {

        it("detect cyclic dependency", function () {

            // 弹框！
            if (S.UA.ie == 6) {
                return;
            }

            var old = KISSY.Config.base;
            KISSY.config({
                packages: [
                    {
                        name: "cyclic",
                        path: "/kissy/src/seed/tests/specs/"
                    }
                ]

            });
            var oldError = S.error, err = [];

            S.error = function (args) {
                err.push(args);
                oldError(args[0]);
            };

            KISSY.use("cyclic/a");

            waitsFor(function () {
                if (err.length == 1) {
                    return err[0] == 'find cyclic dependency between mods: cyclic/a,cyclic/b,cyclic/c,cyclic/a';
                }
            }, 10000);

            runs(function () {
                S.error = oldError;
                KISSY.Config.base = old;
            });
        });

    });


})(KISSY);


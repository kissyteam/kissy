/**
 * test loader
 * @author yiminghe@gmail.com
 */
/*jshint quotmark:false*/
(function () {
    var run=function(combine){
        describe("loader-cyclic "+ (combine ? 'at combo mode' : ''), function () {
            beforeEach(function () {
                KISSY.config('combine', !!combine);
            });

            afterEach(function () {
                KISSY.clearLoader();
            });
            it("can load cyclic dependency", function () {
                KISSY.config({
                    packages: [
                        {
                            name: "cyclic",
                            path: "/kissy/src/loader/tests/specs/"
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
    };
    run();
    run(1);
})(KISSY);


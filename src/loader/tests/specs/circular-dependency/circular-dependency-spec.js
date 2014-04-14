/**
 * test loader
 * @author yiminghe@gmail.com
 */
/*jshint quotmark:false*/
(function () {
    var run = function (combine) {
        describe("loader-cyclic " + (combine ? 'at combo mode' : ''), function () {
            beforeEach(function () {
                KISSY.config('combine', !!combine);
            });

            afterEach(function () {
                KISSY.clearLoader();
            });
            it("can load indirect circular dependency", function () {
                KISSY.config({
                    packages: {
                        'circular-dependency': {
                            base: "/kissy/src/loader/tests/specs/circular-dependency"
                        }
                    }
                });

                var ret;

                KISSY.use("circular-dependency/a", function (S, a) {
                    ret = a.get();
                });

                waitsFor(function () {
                    return ret;
                });

                runs(function () {
                    expect(ret).toBe('caba');
                });
            });

            it('can load direct circular dependency',function(){
                KISSY.config({
                    packages: {
                        'circular-dependency': {
                            base: "/kissy/src/loader/tests/specs/circular-dependency"
                        }
                    }
                });

                var ret;

                KISSY.use("circular-dependency/a1", function (S, a) {
                    ret = a.b();
                });

                waitsFor(function () {
                    return ret;
                });

                runs(function () {
                    expect(ret).toBe(3);
                });
            });
        });
    };
    run();
    run(1);
})(KISSY);


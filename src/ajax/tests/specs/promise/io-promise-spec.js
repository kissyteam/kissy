KISSY.use("ajax", function (S, io) {

    var Promise = S.Promise;

    var URL = '/kissy/src/ajax/tests/specs/promise/gen-json.jss';

    describe("S.io as a promise", function () {

        it('context should works as before', function () {
            var c = {}, ok = 0;
            io({
                url:URL,
                context:c,
                data:{
                    x:99
                },
                dataType:'json',
                success:function (d) {
                    expect(d.x).toBe('99');
                    expect(this).toBe(c);
                    ok = 1;
                }
            });
            waitsFor(function () {
                return ok;
            }, 10000);
        });

        it('should support then differently', function () {
            var ok = 0,
                r = io({
                    url:URL,
                    context:{},
                    data:{
                        x:99
                    },
                    dataType:'json'
                });
            r.then(function (v) {
                // S.log(arguments);
                ok++;
                expect(v[0].x).toBe('99');
                expect(this).toBe(window);
            });
            r.fin(function (v, ret) {
                // S.log(arguments);
                ok++;
                expect(ret).toBe(true);
                expect(v[0].x).toBe('99');
                expect(this).toBe(window);
            });
            waitsFor(function () {
                return ok == 2;
            }, 10000);
        });

        it('should support fail differently', function () {
            var ok = 0,
                r = io({
                    url:'404',
                    context:{},
                    data:{
                        x:99
                    },
                    dataType:'json'
                });
            r.then(function () {
            }, function (v) {
                // S.log(arguments);
                ok++;
                expect(v[1]).toBe("Not Found");
            });
            r.fail(function (v) {
                // S.log(arguments);
                ok++;
                expect(v[1]).toBe("Not Found");
            });
            r.fin(function (v, ret) {
                // S.log(arguments);
                ok++;
                expect(v[1]).toBe("Not Found");
                expect(ret).toBe(false);
            });
            waitsFor(function () {
                return ok == 3;
            }, 10000);
        });

        it("should support chained value", function () {
            var r = io({
                url:URL,
                context:{},
                data:{
                    x:99
                },
                dataType:'json'
            }), v2;

            r.then(
                function (v) {
                    return Number(v[0].x) + 1;
                }).then(function (v) {
                    v2 = v;
                });

            waitsFor(function () {
                return v2;
            }, 2000);

            runs(function () {
                expect(v2).toBe(100);
            });

        });

        it("should support nested promise", function () {
            var r = io({
                url:URL,
                context:{},
                data:{
                    x:99
                },
                dataType:'json'
            }), ret;

            r.then(function (v) {
                expect(v[0].x).toBe('99');
                return io({
                    url:URL,
                    context:{},
                    data:{
                        x:101
                    },
                    dataType:'json'
                });
            })

                .then(function (v) {
                    expect(v[0].x).toBe('101');
                    ret = 1;
                });

            waitsFor(function () {
                return ret;
            }, 2000);
        });

        it("should support Promise.all", function () {

            var r = io({
                url:URL,
                context:{},
                data:{
                    x:99
                },
                dataType:'json'
            });

            var r2 = io({
                url:URL,
                context:{},
                data:{
                    x:101
                },
                dataType:'json'
            });

            var ret;

            Promise.all([r, r2]).then(function (vs) {
                expect(vs[0][0].x).toBe('99');
                expect(vs[1][0].x).toBe('101');
                ret = 1;
            });

            waitsFor(function () {
                return ret;
            }, 2000);

        });

    });

});
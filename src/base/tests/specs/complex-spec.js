/**
 *  complex tc for base and attribute
 *  @author yiminghe@gmail.com
 */
KISSY.use("base", function (S, Base) {
    describe("base_complex", function () {

        it("can merge property value object from parent class", function () {
            function a() {
                a.superclass.constructor.apply(this, S.makeArray(arguments));
            }

            a.ATTRS = {
                x:{
                    getter:function () {
                        return 1;
                    }
                }
            };

            S.extend(a, Base);


            function b() {
                b.superclass.constructor.apply(this, S.makeArray(arguments));
            }

            b.ATTRS = {
                x:{
                    value:2
                }
            };
            S.extend(b, a);

            var t = new b();

            expect(t.get("x")).toBe(1);

        });


        it("support validator", function () {

            function a() {
                a.superclass.constructor.apply(this, S.makeArray(arguments));
            }

            a.ATTRS = {
                tt:{
                    validator:function (v) {
                        return v > 1;
                    }
                }
            };

            S.extend(a, Base);

            var t = new a();

            expect(t.set("tt", 10)).not.toBe(false);

            expect(t.get("tt")).toBe(10);

            expect(t.set("tt", 0)).toBe(false);

            expect(t.get("tt")).toBe(10);

        });


        it("support validators", function () {

            function Aa() {
                Aa.superclass.constructor.apply(this, S.makeArray(arguments));
            }

            Aa.ATTRS = {
                tt:{
                    validator:function (v, name, all) {
                        if (all && (v > all["t"])) {
                            return "tt>t!";
                        }
                    }
                },
                t:{
                    validator:function (v) {
                        if (v < 0) {
                            return "t<0!";
                        }
                    }
                }

            };

            S.extend(Aa, Base);

            var t = new Aa(),
                e1;

            expect(t.set("t", -1, {
                error:function (v) {
                    e1 = v;
                }
            })).toBe(false);

            expect(e1).toBe("t<0!");
            expect(t.get("t")).not.toBe(-1);

            var e2;

            expect(t.set({
                tt:2,
                t:-1
            }, {
                error:function (v) {
                    e2 = v;
                }
            })).toBe(false);

            expect(e2.sort()).toEqual(["t<0!", "tt>t!"].sort());
            expect(t.get("t")).not.toBe(-1);
            expect(t.get("tt")).not.toBe(2);

            var e3;
            expect(t.set({
                tt:3,
                t:4
            }, {
                error:function (v) {
                    e3 = v;
                }
            })).not.toBe(false);

            expect(e3).toBeUndefined();
            expect(t.get("t")).toBe(4);
            expect(t.get("tt")).toBe(3);

        });

        it("support sub attribute name", function () {

            function a() {
                a.superclass.constructor.apply(this, S.makeArray(arguments));
            }

            a.ATTRS = {
                tt:{
                    // do not  use this in real world code
                    // forbid changing value in getter
                    getter:function (v) {
                        this.__getter=1;
                        return v;
                    },
                    setter:function (v) {
                        v.x.y++;
                        return v;
                    }
                }
            };

            S.extend(a, Base);

            var t = new a({
                tt:{
                    x:{
                        y:1
                    }
                }
            });

            var ret = [];

            t.on("beforeTtChange", function (e) {
                ret.push(e.prevVal.x.y);
                ret.push(e.newVal.x.y);
            });

            t.on("afterTtChange", function (e) {
                ret.push(e.prevVal.x.y);
                ret.push(e.newVal.x.y);
            });

            // only can when tt is  a object (not custom object newed from custom clz)
            expect(t.get("tt.x.y")).toBe(2);

            expect(t.__getter).toBe(1);

            t.set("tt.x.y", 3);
            t.__getter=0;
            expect(t.get("tt.x.y")).toBe(4);
            expect(t.__getter).toBe(1);

            expect(ret).toEqual([2,3,2,4]);
        });

        it("set sub attr even if not exist attr", function () {
            function A() {
                A.superclass.constructor.apply(this, S.makeArray(arguments));
            }

            S.extend(A, Base);

            var a = new A();

            a.set("x.y", 1);

            expect(a.get("x")).toEqual({y:1});

            expect(a.get("x.y")).toBe(1);

        });

        it("set sub attr differently if declared previously", function () {
            function A() {
                A.superclass.constructor.apply(this, S.makeArray(arguments));
            }

            A.ATTRS = {
                "x.y":{}
            };

            S.extend(A, Base);

            var a = new A();

            a.set("x.y", 1);

            expect(a.get("x")).toBeUndefined();

            expect(a.get("x.y")).toBe(1);
        });

        it("validator works for subAttrs", function () {
            (function () {
                function A() {
                    A.superclass.constructor.apply(this, S.makeArray(arguments));
                }

                A.ATTRS = {
                    "x.y":{
                        validator:function (v) {
                            return v > 1;
                        }
                    }
                };

                S.extend(A, Base);

                var a = new A();

                a.set("x.y", 2);

                expect(a.get("x.y")).toBe(2);

                a.set("x.y", -1);

                expect(a.get("x.y")).toBe(2);


                a = new A();

                a.set({"x.y":2});

                expect(a.get("x.y")).toBe(2);

                a.set({"x.y":-1});

                expect(a.get("x.y")).toBe(2);
            })();

            (function () {
                function A() {
                    A.superclass.constructor.apply(this, S.makeArray(arguments));
                }

                A.ATTRS = {
                    "x":{
                        validator:function (v) {
                            return v.y > 10;
                        }
                    }
                };

                S.extend(A, Base);

                var a = new A();

                a.set("x.y", 20);

                expect(a.get("x.y")).toBe(20);

                a = new A();

                a.set({
                    "x.y":20
                });

                expect(a.get("x.y")).toBe(20);

                a.set({"x.y":9});

                expect(a.get("x.y")).toBe(20);
            })();
        });

        it("should fire *Change once for set({})", function () {
            function a() {
                a.superclass.constructor.apply(this, S.makeArray(arguments));
            }

            S.extend(a, Base);

            var aa = new a({x:1, y:{z:1}}),
                ok = 0,
                afterAttrChange = {};

            aa.on("*Change", function (e) {
                expect(e.newVal).toEqual([11, {z:22}]);
                expect(e.prevVal).toEqual([1, {z:1}]);
                expect(e.attrName).toEqual(["x", "y"]);
                expect(e.subAttrName).toEqual(["x", "y.z"]);
                ok++;
            });
            aa.on("afterXChange", function (e) {
                expect(e.attrName).toBe("x");
                expect(e.newVal).toBe(11);
                expect(e.prevVal).toBe(1);
                expect(e.subAttrName).toBe("x");
                afterAttrChange.x = 1;
            });
            aa.on("afterYChange", function (e) {
                expect(e.attrName).toBe("y");
                expect(e.newVal).toEqual({z:22});
                expect(e.prevVal).toEqual({z:1});
                expect(e.subAttrName).toBe("y.z");
                afterAttrChange.y = 1;
            });

            aa.set({
                x:11,
                "y.z":22
            });

            expect(aa.get("x")).toBe(11);
            expect(aa.get("y.z")).toBe(22);
            expect(ok).toBe(1);

            expect(afterAttrChange.x).toBe(1);
            expect(afterAttrChange.y).toBe(1);
        });


    });
});
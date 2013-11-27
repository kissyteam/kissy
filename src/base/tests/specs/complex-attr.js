/**
 *  complex tc for base and attribute
 *  @author yiminghe@gmail.com
 */
KISSY.add(function (S, Base) {
    describe("complex attr", function () {
        it("can merge property value object from parent class", function () {
            var A = Base.extend({}, {
                ATTRS: {
                    x: {
                        getter: function () {
                            return 1;
                        }
                    }
                }
            });

            var B = A.extend({}, {
                ATTRS: {
                    x: {
                        value: 2
                    }
                }
            });

            var t = new B();

            expect(t.get('x')).toBe(1);
        });

        it("support validator", function () {
            var A = Base.extend({}, {
                ATTRS: {
                    tt: {
                        validator: function (v) {
                            return v > 1;
                        }
                    }
                }
            });

            var t = new A();

            expect(t.set("tt", 10)).not.toBe(false);

            expect(t.get("tt")).toBe(10);

            expect(t.set("tt", 0)).toBe(false);

            expect(t.get("tt")).toBe(10);
        });

        it("support validators", function () {

            var validatorCalled = 0;

            var A = Base.extend({}, {
                ATTRS: {
                    tt: {
                        validator: function (v, name, all) {
                            validatorCalled++;
                            if (all && (v > all["t"])) {
                                return "tt>t!";
                            }
                        }
                    },
                    t: {
                        validator: function (v) {
                            if (v < 0) {
                                return "t<0!";
                            }
                        }
                    }

                }
            });

            var t = new A(),
                e1;

            validatorCalled = 0;
            expect(t.set("t", -1, {
                error: function (v) {
                    e1 = v;
                }
            })).toBe(false);
            expect(validatorCalled).toBe(0);
            expect(e1).toBe("t<0!");
            expect(t.get("t")).not.toBe(-1);

            var e2;

            validatorCalled = 0;
            expect(t.set({
                tt: 2,
                t: -1
            }, {
                error: function (v) {
                    e2 = v;
                }
            })).toBe(false);
            expect(validatorCalled).toBe(1);
            expect(e2.sort()).toEqual(["t<0!", "tt>t!"].sort());
            expect(t.get("t")).not.toBe(-1);
            expect(t.get("tt")).not.toBe(2);

            var e3;
            expect(t.set({
                tt: 3,
                t: 4
            }, {
                error: function (v) {
                    e3 = v;
                }
            })).not.toBe(false);

            expect(e3).toBeUndefined();
            expect(t.get("t")).toBe(4);
            expect(t.get("tt")).toBe(3);
        });

        it("support sub attribute name", function () {
            var A = Base.extend({}, {
                ATTRS: {
                    tt: {
                        // do not  use this in real world code
                        // forbid changing value in getter
                        getter: function (v) {
                            this.__getter = 1;
                            return v;
                        },
                        setter: function (v) {
                            v.x.y++;
                            return v;
                        }
                    }
                }
            });

            var t = new A({
                tt: {
                    x: {
                        y: 1
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
            t.__getter = 0;
            expect(t.get("tt.x.y")).toBe(4);
            expect(t.__getter).toBe(1);

            expect(ret).toEqual([2, 3, 2, 4]);
        });

        it("set sub attr even if not exist attr", function () {
            var A = Base.extend();

            var a = new A();

            a.set("x.y", 1);

            expect(a.get('x')).toEqual({y: 1});

            expect(a.get("x.y")).toBe(1);
        });

        it("validator works for subAttrs", function () {
            (function () {
                var A = Base.extend({}, {
                    ATTRS: {
                        'x': {
                            validator: function (v) {
                                return v > 1;
                            }
                        }
                    }
                });

                var a = new A();

                a.set('x', 2);

                expect(a.get('x')).toBe(2);

                a.set('x', -1);

                expect(a.get('x')).toBe(2);


                a = new A();

                a.set({'x': 2});

                expect(a.get('x')).toBe(2);

                a.set({'x': -1});

                expect(a.get('x')).toBe(2);
            })();

            (function () {
                var A = Base.extend({}, {
                    ATTRS: {
                        'x': {
                            validator: function (v) {
                                return v.y > 10;
                            }
                        }
                    }
                });

                var a = new A();

                a.set("x.y", 20);

                expect(a.get("x.y")).toBe(20);

                a = new A();

                a.set({
                    "x.y": 20
                });

                expect(a.get("x.y")).toBe(20);

                a.set({"x.y": 9});

                expect(a.get("x.y")).toBe(20);
            })();
        });

        it("should fire *Change once for set({})", function () {
            var A = Base.extend();

            var aa = new A({x: 1, y: {z: 1}}),
                ok = 0,
                afterAttrChange = {};

            aa.on("*Change", function (e) {
                expect(e.newVal).toEqual([11, {z: 22}]);
                expect(e.prevVal).toEqual([1, {z: 1}]);
                expect(e.attrName).toEqual(['x', 'y']);
                expect(e.subAttrName).toEqual(['x', "y.z"]);
                ok++;
            });
            aa.on("afterXChange", function (e) {
                expect(e.attrName).toBe('x');
                expect(e.newVal).toBe(11);
                expect(e.prevVal).toBe(1);
                expect(e.subAttrName).toBe('x');
                afterAttrChange.x = 1;
            });
            aa.on("afterYChange", function (e) {
                expect(e.attrName).toBe('y');
                expect(e.newVal).toEqual({z: 22});
                expect(e.prevVal).toEqual({z: 1});
                expect(e.subAttrName).toBe("y.z");
                afterAttrChange.y = 1;
            });

            aa.set({
                x: 11,
                "y.z": 22
            });

            expect(aa.get('x')).toBe(11);
            expect(aa.get("y.z")).toBe(22);
            expect(ok).toBe(1);

            expect(afterAttrChange.x).toBe(1);
            expect(afterAttrChange.y).toBe(1);
        });
    });
}, {
    requires: ['base']
});
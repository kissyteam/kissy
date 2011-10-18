/**
 *  complext tc for base and attribute
 *  @author yiminghe@gmail.com
 */
KISSY.use("base", function(S, Base) {
    describe("complex base/attribute", function() {

        it("can merge property value object from parent class", function() {
            function a() {
                a.superclass.constructor.apply(this, S.makeArray(arguments));
            }

            a.ATTRS = {
                x:{
                    getter:function() {
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


        it("support validator", function() {

            function a() {
                a.superclass.constructor.apply(this, S.makeArray(arguments));
            }

            a.ATTRS = {
                tt:{
                    validator:function(v) {
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

        it("support sub attribute name", function() {

            function a() {
                a.superclass.constructor.apply(this, S.makeArray(arguments));
            }

            a.ATTRS = {
                tt:{
                    // do not  use this in real world code
                    // forbid changing value in getter
                    getter:function(v) {
                        v.x.y++;
                        return v;
                    },
                    setter:function(v) {
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
            var ret = [],getterVal,setterVal;
            t.on("beforeTtChange", function(e) {
                ret.push(e.prevVal.x.y);
                ret.push(e.newVal.x.y);
            });
            t.on("afterTtChange", function(e) {
                ret.push(e.prevVal.x.y);
                ret.push(e.newVal.x.y);
            });

            // only can when tt is  a object (not custom object newed from custom clz)
            expect(t.get("tt.x.y")).toBe(3);

            t.set("tt.x.y", 3);

            expect(t.get("tt.x.y")).toBe(5);

            expect(ret).toEqual([4,3,4,4]);
        });


    });
});
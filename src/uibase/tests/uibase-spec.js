/**
 * uibase tc
 * @author yiminghe@gmaill.com
 */
KISSY.use("uibase", function(S, UIBase) {

    describe('uibase', function() {
        it(" will works as multi-inheritance", function() {

            var x = 0,y = 0,z = 0;

            function h1() {

            }

            h1.prototype.xx = function() {
                x = 1;
            };

            function h2() {

            }

            h2.prototype.yy = function() {
                y = 1;
            };


            var h3 = UIBase.create(h2, [h1], {
                zz:function() {
                    z = 1;
                }
            });


            var h = new h3();

            h.xx();
            h.yy();
            h.zz();

            expect(x).toBe(1);
            expect(y).toBe(1);
            expect(z).toBe(1);

        });


        describe("extension attr", function() {

            it("does not override main attr,and previous extension takes precedence", function() {

                function getter1() {
                }

                var x = function() {
                };
                x.ATTRS = {
                    y:{
                        value:1,
                        getter:getter1
                    }
                };

                var x3 = function() {
                };
                x3.ATTRS = {
                    y:{
                        value:4
                    }
                };

                var x2 = UIBase.create([x,x3], {

                }, {
                    ATTRS:{
                        y:{
                            value:2
                        },
                        z:{
                            value:9
                        }
                    }
                });

                var x2AttrsY = x2.ATTRS.y;

                expect(x2.ATTRS.z.value).toBe(9);
                expect(x2AttrsY.value).toBe(2);
                expect(x2AttrsY.getter).toBe(getter1);


            });

        });


        describe("extension method", function() {

            it("should run by order before main", function() {
                var ret = [];
                var x = function() {
                };

                x.prototype = {
                    __renderUI:function() {
                        ret.push(1);
                    }
                };

                var x3 = function() {
                };

                x3.prototype = {
                    __renderUI:function() {
                        ret.push(2);
                    }
                };

                var x2 = UIBase.create([x,x3], {
                    renderUI:function() {
                        ret.push(3);
                    }
                });

                new x2().render();

                expect(ret).toEqual([1,2,3]);

            });


        });

    });

});

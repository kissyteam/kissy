/**
 * uibase tc
 * @author yiminghe@gmaill.com
 */
KISSY.use("component/base,component/extension", function (S, Component, extension) {

    var UIBase = Component.UIBase, $ = S.all;

    describe('uibase', function () {


        it('override rich-base constructor', function () {

            expect(UIBase.prototype.constructor.toString().indexOf('decorateInternal'))
                .toBeGreaterThan(-1);

        });

        it(" will works as multi-inheritance", function () {

            var x = 0, y = 0, z = 0;

            function h1() {

            }

            h1.prototype.xx = function () {
                x = 1;
            };

            var h2 = UIBase.extend({});

            h2.prototype.yy = function () {
                y = 1;
            };


            var h3 = h2.extend([h1], {
                zz: function () {
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

        it('should sync attr in order', function () {
            var order = [];


            var h1 = UIBase.extend([], {
                _onSetA: function () {
                    order.push('a');
                },

                _onSetD: function () {
                    order.push('d');
                }
            }, {
                ATTRS: {
                    a: {

                    },
                    d: {

                    }
                }
            });

            var h2 = h1.extend({
                _onSetB: function () {
                    order.push('b');
                },

                _onSetC: function () {
                    order.push('c');
                }
            }, {
                ATTRS: {
                    b: {

                    },
                    c: {

                    },
                    // 不会重复调用
                    a: {

                    }
                }
            });


            var h = new h2({
                a: 1, b: 2, c: 3, d: 4
            });

            h.render();

            expect(h.get('a')).toBe(1);
            expect(h.get('b')).toBe(2);
            expect(h.get('c')).toBe(3);
            expect(h.get('d')).toBe(4);

            expect(order).toEqual(['a', 'd', 'b', 'c']);

        });

        describe("extension attr", function () {

            it("does not override main attr,and last extension takes precedence", function () {

                function getter1() {
                }

                var x = function () {
                };
                x.ATTRS = {
                    y: {
                        value: 1,
                        getter: getter1
                    },
                    x: {
                        value: 9
                    }
                };

                var x3 = function () {
                };
                x3.ATTRS = {
                    y: {
                        value: 4
                    },
                    x: {
                        value: 8
                    }
                };

                var x2 = UIBase.extend([x, x3], {

                }, {
                    ATTRS: {
                        y: {
                            value: 2
                        },
                        z: {
                            value: 9
                        }
                    }
                });

                var x2AttrsY = x2.ATTRS.y;

                expect(x2.ATTRS.z.value).toBe(9);
                expect(x2AttrsY.value).toBe(2);
                expect(x2AttrsY.getter).toBe(getter1);

                expect(x2.ATTRS.x.value).toBe(8);


            });

        });


        describe("extension method", function () {

            it("should run by order before main", function () {
                var ret = [];
                var x = function () {
                };

                x.prototype = {
                    __renderUI: function () {
                        ret.push(1);
                    }
                };

                var x3 = function () {
                };

                x3.prototype = {
                    __renderUI: function () {
                        ret.push(2);
                    }
                };

                var x2 = UIBase.extend([x, x3], {
                    renderUI: function () {
                        ret.push(3);
                    }
                });

                new x2().render();

                expect(ret).toEqual([1, 2, 3]);

            });

        });

        describe("srcNode", function () {

            var SrcNode = UIBase.extend({}, {
                HTML_PARSER: {
                    contentAttr: function (el) {
                        return el.attr("data-contentAttr")
                    }
                }
            });

            it("will get attribute from node", function () {

                var node = $("<div data-contentAttr='x'></div>").appendTo("body");

                var n = new SrcNode({
                    srcNode: node
                });

                expect(n.get("contentAttr")).toBe('x');

                node.remove();

            });

            it("will override attribute from node", function () {
                var node = $("<div data-contentAttr='x'></div>").appendTo("body");
                var n = new SrcNode({
                    srcNode: node,
                    "contentAttr": 'y'
                });
                expect(n.get("contentAttr")).toBe('y');
                node.remove();
            });

            var BoxController = Component.Controller;

            it("should get html", function () {
                var node = $("<div>123</div>").appendTo("body");
                var n = new BoxController({
                    srcNode: node
                });
                expect(n.get("content")).toBe('123');
                node.remove();
            });

            it("can not override html", function () {
                var node = $("<div>123</div>").appendTo("body");
                var n = new BoxController({
                    srcNode: node,
                    content: '4'
                });
                n.render();
                expect(n.get("content")).toBe('4');
                expect(node.html().toLowerCase()).toBe('123');
                node.remove();
            });

            it("html can be node without srcNode", function () {
                var n = new BoxController({
                    content: $('<span>4</span>')
                });
                n.render();
                expect(n.get("content").html()).toBe('4');
                expect(n.get("el").html().toLowerCase()).toBe('<span>4</span>');
                n.destroy();
            });
        });

        describe("contentEl", function () {

            var ContentEl = Component.Render.extend([,
                extension.ContentBox.Render], {}, {
                ATTRS: {
                    prefixCls: {
                        value: 'ks-'
                    }
                }
            }, {
                xclass: 'contentELTest'
            });

            describe("srcNode", function () {

                it('transform el without srcNode', function () {

                    var el = $("<div>23</div>").appendTo("body");

                    var content = new ContentEl({
                        srcNode: el
                    }).render();

                    expect(content.get("content")).toBe("23");

                    expect(el.html().toLowerCase().replace(/"/g, ""))
                        .toBe("<div class=ks-contentbox>23</div>");

                    el.remove();

                });

                it('can not transform el with string content', function () {
                    var el = $("<div>23</div>").appendTo("body");

                    var content = new ContentEl({
                        srcNode: el,
                        content: '4'
                    }).render();

                    expect(content.get("content")).toBe("4");

                    expect(el.html().toLowerCase().replace(/"/g, ""))
                        .toBe("<div class=ks-contentbox>23</div>");

                    el.remove();
                });

                it('can not transform el with node content', function () {

                    var el = $("<div>23</div>").appendTo("body");

                    var content = new ContentEl({
                        srcNode: el,
                        content: $('<s>4</s>')
                    }).render();

                    expect(content.get("content").html()).toBe("4");

                    expect(el.html().toLowerCase().replace(/"/g, ""))
                        .toBe("<div class=ks-contentbox>23</div>");

                    el.remove();

                });

            });


        });

    });

});

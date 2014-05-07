/**
 * component tc
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Control = require('component/control');
    var Container = require('component/container');

    /*jshint quotmark:false*/
    function invalidNode(n) {
        return n == null || n.nodeType === 11;
    }

    describe("container", function () {
        describe('container.destroy', function () {
            it('will remove node by default', function () {
                var my = new Container({
                    children: [
                        new Control({
                            content: '1'
                        }),
                        new Control({
                            content: '2'
                        })
                    ]
                }).render();
                expect(my.$el.text()).toBe('12');
                my.destroy();
                expect(my.$el.html()).toBe('');
                expect(invalidNode(my.el.parentNode)).toBe(true);
            });

            it('can keep node', function () {
                var my = new Container({
                    children: [
                        new Control({
                            content: '1'
                        }),
                        new Control({
                            content: '2'
                        })
                    ]
                }).render();
                my.destroy(false);
                expect(my.$el.text()).toBe('12');
                expect(invalidNode(my.el.parentNode)).toBe(false);
            });
        });

        describe('addChild/removeChild event', function () {

            it('can listen and preventDefault', function () {
                var c = new Container({
                    content: "xx"
                });

                var child = new Container({
                    content: "yy"
                });

                (function () {
                    var beforeCalled = 0,
                        afterCalled = 0;

                    c.on('beforeAddChild', {
                        fn: function (e) {
                            expect(e.component).toBe(child);
                            expect(e.index).toBe(0);
                            e.preventDefault();
                            beforeCalled = 1;
                        },
                        once: 1
                    });

                    c.on('afterAddChild', {
                        fn: function () {
                            afterCalled = 1;
                        },
                        once: 1
                    });

                    c.addChild(child);

                    expect(beforeCalled).toBe(1);
                    expect(afterCalled).toBe(0);
                    expect(c.get('children').length).toBe(0);

                    beforeCalled = 0;
                    afterCalled = 0;

                    c.on('beforeAddChild', {
                        fn: function (e) {
                            expect(e.component).toBe(child);
                            expect(e.index).toBe(0);
                            beforeCalled = 1;
                        },
                        once: 1
                    });

                    c.on('afterAddChild', {
                        fn: function (e) {
                            expect(e.component).toBe(child);
                            expect(e.index).toBe(0);
                            afterCalled = 1;
                        },
                        once: 1
                    });

                    c.addChild(child);

                    expect(beforeCalled).toBe(1);
                    expect(afterCalled).toBe(1);
                    expect(c.get('children').length).toBe(1);
                    expect(c.get('children')[0]).toBe(child);
                })();

                (function () {
                    var beforeCalled = 0,
                        afterCalled = 0;

                    c.on('beforeRemoveChild', {
                        fn: function (e) {
                            expect(e.component).toBe(child);
                            expect(e.index).toBe(0);
                            e.preventDefault();
                            beforeCalled = 1;
                        },
                        once: 1
                    });

                    c.on('afterRemoveChild', {
                        fn: function () {
                            afterCalled = 1;
                        },
                        once: 1
                    });

                    c.removeChild(child);

                    expect(beforeCalled).toBe(1);
                    expect(afterCalled).toBe(0);
                    expect(c.get('children').length).toBe(1);
                    expect(c.get('children')[0]).toBe(child);

                    beforeCalled = 0;
                    afterCalled = 0;

                    c.on('beforeRemoveChild', {
                        fn: function (e) {
                            expect(e.component).toBe(child);
                            expect(e.index).toBe(0);
                            beforeCalled = 1;
                        },
                        once: 1
                    });

                    c.on('afterRemoveChild', {
                        fn: function (e) {
                            expect(e.component).toBe(child);
                            expect(e.index).toBe(0);
                            afterCalled = 1;
                        },
                        once: 1
                    });

                    c.removeChild(child);

                    expect(beforeCalled).toBe(1);
                    expect(afterCalled).toBe(1);
                    expect(c.get('children').length).toBe(0);
                })();
            });


            it('can bubble', function () {
                var c = new Container({
                    content: "xx"
                });

                var child = new Container({
                    content: "yy"
                });

                var grandChild = new Container({
                    content: "zz"
                });

                c.addChild(child);

                var beforeCalled = 0,
                    afterCalled = 0;

                c.on('beforeAddChild', function () {
                    beforeCalled++;
                });

                c.on('afterAddChild', function () {
                    afterCalled++;
                });

                child.addChild(grandChild);

                expect(beforeCalled).toBe(1);
                expect(afterCalled).toBe(1);
            });
        });

        describe('parent', function () {

            it('parent can be changed', function () {

                var c1 = new Container({
                    content: "xx"
                });


                var c2 = new Container({
                    content: "xx"
                });

                var child = new Container({
                    content: "yy"
                });

                var xxCalledC1, xxCalledC2;
                xxCalledC1 = 0;
                xxCalledC2 = 0;

                c1.on('xx', function () {
                    xxCalledC1 = 1;
                });

                c2.on('xx', function () {
                    xxCalledC2 = 1;
                });

                expect(c1.get('children').length).toBe(0);
                c1.addChild(child);
                expect(c1.get('children').length).toBe(1);

                child.fire('xx');

                expect(xxCalledC1).toBe(1);
                expect(xxCalledC2).toBe(0);

                xxCalledC1 = 0;
                xxCalledC2 = 0;

                c1.removeChild(child, false);
                c2.addChild(child);
                expect(c1.get('children').length).toBe(0);
                expect(c2.get('children').length).toBe(1);

                child.fire('xx');

                expect(xxCalledC1).toBe(0);
                expect(xxCalledC2).toBe(1);

                expect(c1.get('el')).toBeFalsy();
            });


            it('parent can be changed after render', function () {

                var c1 = new Container({
                    content: "xx"
                }).render();

                var c2 = new Container({
                    content: "yy"
                }).render();

                var child = new Container({
                    content: "zz"
                }).render();

                var xxCalledC1, xxCalledC2;
                xxCalledC1 = 0;
                xxCalledC2 = 0;

                c1.on('xx', function () {
                    xxCalledC1 = 1;
                });

                c2.on('xx', function () {
                    xxCalledC2 = 1;
                });

                expect(c1.get('children').length).toBe(0);
                expect(c1.get('el')[0].children.length).toBe(0);
                c1.addChild(child);
                expect(c1.get('children').length).toBe(1);
                expect(c1.get('el')[0].children[0]).toBe(child.get('el')[0]);
                expect(c1.get('el')[0].children.length).toBe(1);


                child.fire('xx');

                expect(xxCalledC1).toBe(1);
                expect(xxCalledC2).toBe(0);

                xxCalledC1 = 0;
                xxCalledC2 = 0;

                c1.removeChild(child, false);
                c2.addChild(child);
                expect(c1.get('children').length).toBe(0);
                expect(c2.get('children').length).toBe(1);
                expect(c1.get('el')[0].children.length).toBe(0);
                expect(c2.get('el')[0].children.length).toBe(1);
                expect(c2.get('el')[0].children[0]).toBe(child.get('el')[0]);

                child.fire('xx');

                expect(xxCalledC1).toBe(0);
                expect(xxCalledC2).toBe(1);

                c1.destroy();
                c2.destroy();
            });

        });

        describe("xclass", function () {
            var A = Container.extend({

            }, {
                ATTRS: {
                    defaultChildCfg: {
                        valueFn: function () {
                            return {
                                prefixXClass: 'a-b'
                            };
                        }
                    }
                }
            }, {
                xclass: 'a'
            });

            var B = Container.extend({}, {
                xclass: 'a-b'
            });

            var C = B.extend({

            }, {
                xclass: 'a-b-c'
            });

            var D = B.extend({

            }, {
                xclass: 'a-b-d'
            });


            it('only xclass', function () {
                var a = new A({
                    children: [
                        {xclass: 'a-b-d'}
                    ]
                });
                a.render();
                var children = a.get('children');
                expect(children[0] instanceof D).toBe(true);
            });

            it('only prefixXClass', function () {
                var a = new A({
                    children: [
                        {}
                    ]
                });
                a.render();
                var children = a.get('children');
                expect(children[0] instanceof B).toBe(true);
            });

            it('prefixXClass + xtype', function () {
                var a = new A({
                    children: [
                        {xtype: 'c'}
                    ]
                });
                a.render();
                var children = a.get('children');
                expect(children[0] instanceof C).toBe(true);
            });

            it('xclass and prefixXClass + xtype', function () {
                var a = new A({
                    children: [
                        {xtype: 'c', xclass: 'a-b-d'}
                    ]
                });
                a.render();
                var children = a.get('children');
                expect(children[0] instanceof D).toBe(true);
            });
        });
    });
});
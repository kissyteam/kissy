KISSY.add(function (S, require) {
    var $ = require('node').all;
    var Control = require('component/control');

    /*jshint quotmark:false*/
    function invalidNode(n) {
        return n == null || n.nodeType === 11;
    }

    describe('测试控件生命周期', function () {
        describe('测试 control 的生成', function () {
            it('can be newed from html elements', function () {
                var node = $('<div></div>').appendTo('body');
                var order = [];
                var MyControl = Control.extend({}, {
                    ATTRS: {
                        x: {
                            parse: function () {
                                order.push(1);
                            }
                        },
                        y: {
                            parse: function () {
                                order.push(2);
                            }
                        }
                    }
                });
                var MyControl2 = MyControl.extend({}, {
                    ATTRS: {
                        x: {
                            parse: function () {
                                order.push(11);
                            }
                        },
                        y2: {
                            parse: function () {
                                order.push(33);
                            }
                        }
                    }
                });

                new MyControl2({
                    srcNode: node
                }).render();

                expect(order).toEqual([11, 33, 2]);

                node.remove();
            });

            it('control 生成', function () {

            });

            it('生成过程中的事件', function () {

            });

            it('测试延迟执行的函数', function () {

            });
        });

        describe('control.destroy', function () {
            it('will remove node by default', function () {
                var my = new Control({
                    content:'1'
                }).render();
                expect(my.$el.html()).toBe('1');
                my.destroy();
                expect(invalidNode(my.el.parentNode)).toBe(true);
            });

            it('can keep node', function () {
                var my = new Control({
                    content:'1'
                }).render();
                expect(my.$el.html()).toBe('1');
                my.destroy(false);
                expect(invalidNode(my.el.parentNode)).toBe(false);
            });
        });

        describe('测试控件与mixin', function () {
            it('测试mixin生效', function () {

            });

            it('测试mixin覆盖', function () {

            });
        });

        describe('测试控件与plugin', function () {
            it('测试Plugin的生成', function () {

            });
        });

        describe('测试控件与子控件', function () {
            it('测试父子包含关系', function () {

            });

            it('测试查找子控件', function () {

            });

            it('测试查找父控件', function () {

            });

            it('父子控件的mixin应用', function () {

            });
        });

        describe('测试控件生命周期', function () {
            it('测试control与mixin的执行顺序', function () {

            });

            it('测试control与plugin的执行顺序', function () {

            });

            it('测试control与子控件的执行顺序', function () {

            });

            describe('析构函数执行', function () {

            });
        });
    });

    describe('测试控件配置项', function () {

    });

    describe('测试tpl', function () {
        it('初始化配置tpl', function () {

        });

        it('修改tpl', function () {

        });
    });

    describe('测试控件基本操作', function () {
        describe('设置属性', function () {

        });

        describe('事件操作', function () {
            it('初始化时添加事件', function () {

            });

            it('注册事件', function () {

            });

            it('释放事件', function () {

            });
        });

        it('显示', function () {

        });

        it('隐藏', function () {

        });

        it('获取焦点', function () {

        });

        it('丢失焦点焦点', function () {

        });

        it('测试移动', function () {

        });
    });

    describe('测试控件事件', function () {
        it('鼠标点击', function () {

        });

        it('键盘事件', function () {

        });

        it('disabled状态下触发事件', function () {

        });
    });

    describe('测试继承及类管理', function () {
        it('继承extend静态方法', function () {

        });

        it('测试调试信息', function () {

        });

        it('获取类信息', function () {

        });
    });
});
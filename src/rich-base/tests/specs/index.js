KISSY.add(function (S, RichBase) {

    describe('rich-base', function () {

        it('support initializer and destructor', function () {

            var initializerCalled = 0,
                destructorCalled = 0;

            var T = RichBase.extend({
                initializer: function () {
                    initializerCalled++;
                },
                destructor: function () {
                    destructorCalled++;
                }
            },{
                name:'TestTT'
            });

            expect(T.toString().indexOf('TestTT')).not.toBe(-1);

            var t = new T();

            expect(initializerCalled).toBe(1);

            t.destroy();

            expect(destructorCalled).toBe(1);

        });

        it('support extension', function () {

            var initializer = [],
                destructor = [];

            function Ext1() {
                initializer.push(1);
            }

            Ext1.prototype = {
                constructor: Ext1,
                __destructor: function () {
                    destructor.push(1);
                }

            };

            function Ext2() {
                initializer.push(2);
            }

            Ext2.prototype = {
                constructor: Ext2,
                __destructor: function () {
                    destructor.push(2);
                }
            };

            var T = RichBase.extend([Ext1, Ext2], {
                initializer: function () {
                    initializer.push(3);
                },

                destructor: function () {
                    destructor.push(3);
                }
            });

            var t = new T();

            expect(initializer).toEqual([1, 2, 3]);

            t.destroy();

            expect(destructor).toEqual([3, 2, 1]);

        });

        it('support plugin config', function () {

            var initializer = [],
                destructor = [];

            function Plugin1() {

            }

            Plugin1.prototype = {

                constructor: Plugin1,

                pluginInitializer: function () {
                    initializer.push(1);
                },

                pluginDestructor: function () {
                    destructor.push(1);
                }

            };


            function Plugin2() {

            }

            Plugin2.prototype = {

                constructor: Plugin2,

                pluginInitializer: function () {
                    initializer.push(2);
                },

                pluginDestructor: function () {
                    destructor.push(2);
                }

            };

            var T = RichBase.extend({
                initializer: function () {
                    initializer.push(3);
                },
                destructor: function () {
                    destructor.push(3);
                }
            });

            var t = new T({
                plugins: [Plugin1, new Plugin2()]
            });

            expect(t.get('plugins').length).toBe(2);

            expect(initializer).toEqual([3, 1, 2]);

            t.destroy();

            expect(destructor).toEqual([1, 2, 3]);

        });


        it('support plug unplug', function () {

            var initializer = [],
                destructor = [];

            function Plugin1() {

            }

            Plugin1.prototype = {

                pluginId: 'plugin1',

                constructor: Plugin1,

                pluginInitializer: function (tt) {
                    expect(tt.isT).toBe(1);
                    initializer.push(1);
                },

                pluginDestructor: function (tt) {
                    expect(tt.isT).toBe(1);
                    destructor.push(1);
                }

            };


            function Plugin2() {

            }

            Plugin2.prototype = {

                constructor: Plugin2,

                pluginInitializer: function (tt) {
                    expect(tt.isT).toBe(1);
                    initializer.push(2);
                },

                pluginDestructor: function (tt) {
                    expect(tt.isT).toBe(1);
                    destructor.push(2);
                }

            };

            var T = RichBase.extend({
                isT: 1,
                initializer: function () {
                    initializer.push(3);
                },
                destructor: function () {
                    destructor.push(3);
                }
            });

            var t = new T();

            expect(initializer).toEqual([3]);

            expect(t.get('plugins').length).toBe(0);

            t.plug(Plugin1);

            expect(t.get('plugins').length).toBe(1);

            expect(initializer).toEqual([3, 1]);

            var p2;

            t.plug(p2 = new Plugin2());

            expect(t.get('plugins').length).toBe(2);

            expect(initializer).toEqual([3, 1, 2]);

            t.unplug(p2);

            expect(t.get('plugins').length).toBe(1);


            expect(destructor).toEqual([2]);

            t.unplug('plugin1');

            expect(t.get('plugins').length).toBe(0);

            expect(destructor).toEqual([2, 1]);

            t.destroy();

            expect(destructor).toEqual([2, 1, 3]);

        });

        it('support unplug all', function () {

            var initializer = [],
                destructor = [];

            function Plugin1() {

            }

            Plugin1.prototype = {

                constructor: Plugin1,

                pluginInitializer: function () {
                    initializer.push(1);
                },

                pluginDestructor: function () {
                    destructor.push(1);
                }

            };


            function Plugin2() {

            }

            Plugin2.prototype = {

                constructor: Plugin2,

                pluginInitializer: function () {
                    initializer.push(2);
                },

                pluginDestructor: function () {
                    destructor.push(2);
                }

            };

            var T = RichBase.extend({
                initializer: function () {
                    initializer.push(3);
                },
                destructor: function () {
                    destructor.push(3);
                }
            });

            var t = new T({
                plugins: [Plugin1, new Plugin2()]
            });

            t.unplug();

            expect(t.get('plugins').length).toBe(0);

            expect(destructor).toEqual([1, 2]);

        });

        it('support attr bind', function () {

            var xx = [];

            var T = RichBase.extend({
                _onSetXx: function (v) {
                    xx.push(v);
                }
            }, {
                ATTRS: {
                    xx: {}
                }
            });

            var t = new T({
                xx: 1
            });

            expect(xx).toEqual([1]);

            t.set('xx', 2);

            expect(xx).toEqual([1, 2]);


        });

        it('support parent', function() {
            var A = RichBase.extend({
                m: function(value) {
                    return 'a' + value;
                }
            });

            var B = A.extend({
                m: function(value) {
                    var parent = S.bind(this.parent, this);
                    var parent2 = S.bind(this.parent, arguments.callee, this);

                    // 普通的
                    var t0 = this.parent(value);

                    // 闭包情况下通过 caller 获取 parent
                    var t1;
                    (function() {
                        (function() {
                            (function() {
                                t1 = parent(1);
                            })();
                        })();
                    })();

                    // 递归情况下通过提前绑定 arguments.callee 获取 parent
                    var times = 0;
                    var t2 = '';
                    (function t() {
                        if (times++ >= 2) return;
                        t2 += parent2(2);
                        t();
                    })();

                    return t0 + t1 + t2 + 'b' + value;
                }
            });

            var C = B.extend({
            });

            var c = new C();

            expect(c.m(0)).toEqual('a0a1a2a2b0');
        });

    });

},{
    requires:['rich-base']
});
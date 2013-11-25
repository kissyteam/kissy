/**
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Attribute) {
    describe('attr', function () {
        it('拥有 Attribute 上的方法', function () {
            var A = Attribute.extend();

            var a = new A();

            // 属性的正常设置和获取
            a.set('xxx', 2);
            expect(a.get('xxx')).toBe(2);

            // 获取不存在的属性
            expect(a.get('non-exist')).toBeUndefined();

            // addAttr
            a.addAttr('attr1', {
                value: 1,
                setter: function (v) {
                    return parseInt(v);
                }
            });
            expect(a.get('attr1')).toBe(1);
            a.set('attr1', '2');
            expect(a.get('attr1')).toBe(2);

            // hasAttr
            expect(a.hasAttr('attr1')).toBeTruthy();
            expect(a.hasAttr('non-exist')).toBeFalsy();

            //reset
            a.reset('attr1');
            expect(a.get('attr1')).toBe(1);

            // removeAttr
            a.removeAttr('attr1');
            expect(a.hasAttr('attr1')).toBeFalsy();

            // 原子性
            expect(a.hasAttr('toString')).toBeFalsy();
        });

        it('addAttrs works', function () {
            var A = Attribute.extend();

            var a = new A();
            a.addAttrs({
                attr1: {
                    value: 0
                }
            });
            a.set({
                attr1: 1, attr2: 2
            });
            expect(a.get('attr1')).toBe(1);
            expect(a.get('attr2')).toBe(2);

            var B = Attribute.extend();

            var b = new B();
            b.addAttrs({
                attr1: {
                    value: 0
                },
                'b-attr': {
                    value: 'b'
                }
            });
            b.set({ 'b-attr': 3 });

            expect(b.get('b-attr')).toBe(3);
            expect(b.get('attr1')).toBe(0);
            expect(b.hasAttr('attr2')).toBeFalsy();
        });

        it('能正确触发 Attribute 的事件', function () {
            var A = Attribute.extend();

            var a = new A();

            // normal
            var firedCount = 0;
            a.on('beforeAttr1Change afterAttr1Change', function () {
                firedCount++;
            });
            a.set('attr1', 1);
            expect(firedCount).toBe(2);

            // use 'return false' to cancel set
            a.set('attr2', 2);
            a.on('beforeAttr2Change', function () {
                return false;
            });
            a.set('attr2', 3);
            expect(a.get('attr2')).toBe(2);

            // check event object
            a.set('attr3', 3);
            a.on('beforeAttr3Change', function (ev) {
                expect(ev.attrName).toBe('attr3');
                expect(ev.prevVal).toBe(3);
                expect(ev.newVal).toBe(4);
            });
            a.set('attr3', 4);
        });

        it('can preventDefault beforeChange to prevent set', function () {
            var A = Attribute.extend();

            var a = new A();

            // use 'return false' to cancel set
            a.set('attr2', 2);
            a.on('beforeAttr2Change', function (e) {
                e.preventDefault();
            });
            a.set('attr2', 3);
            expect(a.get('attr2')).toBe(2);
        });

        it('can stopImmediatePropagation beforeChange', function () {
            var A = Attribute.extend();

            var a = new A();

            // use 'return false' to cancel set
            a.set('attr2', 2);
            a.on('beforeAttr2Change', function (e) {
                e.stopImmediatePropagation();
            });
            a.on('beforeAttr2Change', function (e) {
                e.preventDefault();
            });
            a.set('attr2', 3);
            expect(a.get('attr2')).toBe(3);
        });

        it('transfer default value to value', function () {
            var A = Attribute.extend();

            var a = new A();
            a.addAttrs({
                a: {
                    value: 9
                }
            });

            a.get('a');

            expect(a['__attrVals']['a']).toBe(9);

            expect(a['__attrs']['a'].value).toBe(9);

            a.set('a', 7);

            expect(a['__attrVals']['a']).toBe(7);

            expect(a['__attrs']['a'].value).toBe(9);
        });

        it('support callSuper', function () {
            var A = Attribute.extend({
                m: function (value) {
                    return 'a' + value;
                },
                m2: function (value) {
                    return 'a' + value;
                }
            });

            var B = A.extend({
                m2: function (value) {
                    return 'b' + this.callSuper(value);
                },
                m: function (value) {
                    var superFn = S.bind(this.callSuper, arguments.callee, this);

                    // 普通的
                    var t0 = this.callSuper(value);

                    // 闭包情况下通过 caller 获取 callSuper
                    var t1 = '';
                    (function () {
                        (function () {
                            (function () {
                                t1 = superFn(1);
                            })();
                        })();
                    })();

                    // 递归情况下通过提前绑定 arguments.callee 获取 callSuper
                    var times = 0;
                    var t2 = '';
                    (function t() {
                        if (times++ >= 2) return;
                        t2 += superFn(2);
                        t();
                    })();

                    return t0 + t1 + t2 + 'b' + value;
                }
            });

            var C = B.extend({
                m2: function () {
                    return 'c' + this.callSuper.apply(this, arguments);
                }
            });

            var c = new C();
            expect(c.m(0)).toEqual('a0a1a2a2b0');
            expect(c.m2(0)).toBe('cba0');
        });

        it('support inheritedStatics', function () {
            var t = {};
            var t2 = {};
            var X = Attribute.extend({}, {
                inheritedStatics: {
                    t: t
                }
            });
            var Z = X.extend({}, {
                inheritedStatics: {
                    t2: t2
                }
            });
            var Y = Z.extend();
            expect(X.t).toBe(t);
            expect(Z.t).toBe(t);
            expect(Y.t2).toBe(t2);
            expect(Y.t).toBe(t);
        });
    });
}, {
    requires: ['attribute','./complex-attr']
});
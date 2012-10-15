/**
 * @author lifesinger@gmail.com
 */

KISSY.use("base", function (S, Base) {


    describe('base', function () {

        it('拥有 S.EventTarget 上的方法', function () {

            function A() {
                Base.call(this);
            }

            S.extend(A, Base);

            var a = new A();

            var fired;
            a.on('xxx', function () {
                fired = true;
            });
            a.fire('xxx');
            expect(fired).toBeTruthy();
        });

        it('拥有 S.Attribute 上的方法', function () {

            function A() {
                Base.call(this);
            }

            S.extend(A, Base);

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

        it('能解析 ATTRS 和 config', function () {

            function A(config) {
                Base.call(this, config);
            }

            S.extend(A, Base);
            A.ATTRS = {
                attr1: {
                    value: 0
                }
            };

            var a = new A({ attr1: 1, attr2: 2 });
            expect(a.get('attr1')).toBe(1);
            expect(a.get('attr2')).toBe(2);

            // 多重继承
            function B(config) {
                A.call(this, config);
            }

            S.extend(B, A);
            B.ATTRS = {
                'b-attr': {
                    value: 'b'
                }
            };

            var b = new B({ 'b-attr': 3 });
            expect(b.get('b-attr')).toBe(3);
            expect(b.get('attr1')).toBe(0);
            expect(b.hasAttr('attr2')).toBeFalsy();
        });

        it('能正确触发 S.Attribute 的事件', function () {

            function A() {
                Base.call(this);
            }

            S.extend(A, Base);

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

        it('transfer default value to value', function () {
            function A() {
                Base.call(this);
            }

            S.extend(A, Base);

            A.ATTRS = {
                a: {
                    value: 9
                }
            };

            var a = new A();

            a.get('a');

            expect(a['__attrVals']['a']).toBe(9);

            expect(a['__attrs']['a'].value).toBe(9);

            a.set('a', 7);

            expect(a['__attrVals']['a']).toBe(7);

            expect(a['__attrs']['a'].value).toBe(9);
        });

    });
});
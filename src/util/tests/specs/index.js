var util = require('util');
var UA = require('ua');
/*jshint quotmark:false*/
describe('util', function () {
    var host = typeof window !== undefined ? window : '';
    if (!host) {
        return;
    }
    var doc = host.document;
    var web = host.setInterval;

    function fn() {
    }

    function Fn() {
    }

    describe('util.mix', function () {
        it('can be tolerant', function () {
            util.mix({}, false);
            util.mix({}, null);
            util.mix({}, undefined);
        });

        it("works simply", function () {
            var o1 = { a: 1, b: 2 },
                o2 = { a: 1, b: 2 },
                o3 = { a: 1, b: 2 },
            //o4 = { a: 1, b: 2 },
                o = { a: 'a', c: true };

            util.mix(o1, o);
            expect(o1.a).toBe('a');

            // turn off override
            util.mix(o2, o, false);
            expect(o2.a).toBe(1);

            // whitelist
            util.mix(o3, o, true, ['c']);
            expect(o3.a).toBe(1);


            // deep object mix testcase
            var r = {
                x: 1,
                y: {
                    z: 1
                },
                q: [2, 5]
            };

            util.mix(r, {
                x: 2,
                y: {
                    s: 1
                },
                q: [6]
            });

            expect(r.x).toBe(2);
            expect(r.y.s).toBe(1);
            expect(r.y.z).toBeUndefined();
            expect(r.q + "").toBe([6] + "");
        });

        it('works for deep mix', function () {
            var r, r2;

            r = {
                x: 1,
                y: {
                    z: 1,
                    q: 4
                }
            };

            r2 = {
                x: 2,
                y: {
                    z: 3
                }
            };

            r2.y.w = r2;

            util.mix(r, r2, {
                deep: true,
                whitelist: ['x', 'y', 'z', 'w']
            });

            expect(r).toEqual({
                x: 2,
                y: {
                    z: 3,
                    q: 4,
                    w: r
                }
            });

            expect(r).toBe(r.y.w);

            r = {
                x: 1,
                y: {
                    z: 1
                },
                q: [2, 5]
            };

            util.mix(r, {
                x: 2,
                y: {
                    s: 1
                },
                q: [undefined, 6]
            }, undefined, undefined, true);

            expect(r.x).toBe(2);
            expect(r.y.s).toBe(1);
            expect(r.y.z).toBe(1);
            expect(r.q + "").toBe([2, 6] + "");

            r = {
                x: 1,
                y: {
                    z: 1
                },
                q: [2, 5]
            };

            util.mix(r, {
                x: 2,
                y: {
                    s: 1
                },
                q: [undefined, 6]
            }, {
                deep: true
            });

            expect(r.x).toBe(2);
            expect(r.y.s).toBe(1);
            expect(r.y.z).toBe(1);
            expect(r.q + "").toBe([2, 6] + "");

            r = {
                x: 1,
                y: {
                    z: 1
                },
                q: [2, 5]
            };

            util.mix(r, {
                x: 2,
                y: {
                    s: 1,
                    z: 2
                },
                q: [undefined, 6]
            }, {
                overwrite: false,
                deep: true
            });

            expect(r.x).toBe(1);
            expect(r.y.s).toBe(1);
            expect(r.y.z).toBe(1);
            expect(r.q + "").toBe([2, 5] + "");
        });

        it("can mix circular reference object", function () {
            var o = {};

            o.x = 1;

            o.y = {};

            o.y.z = 3;

            o.y.a = o;

            var n = {};

            util.mix(n, o, undefined, undefined, true);

            expect(n.x).toBe(1);

            expect(n.y.z).toBe(3);

            expect(n.y.a).toBe(n);

            expect(n.__MIX_CIRCULAR).toBeUndefined();
            expect(n.y.__MIX_CIRCULAR).toBeUndefined();
        });

        it('solve JsEnumBug', function () {
            function x() {
                return 1;
            }

            var v = {
                toString: x,
                isPrototypeOf: x,
                propertyIsEnumerable: x,
                toLocaleString: x,
                valueOf: x,
                constructor: x
            };
            var t = 'hasOwnProperty';
            v[t] = x;
            var z = {};
            util.mix(z, v);
            expect(z.toString).toBe(x);
            var fs = [], vs = [];
            util.each(v, function (v, k) {
                fs.push(k);
                if (typeof v === 'function') {
                    v = v();
                }
                vs.push(v);
            });
            fs.sort();
            expect(fs).toEqual(['toString',
                'hasOwnProperty', 'isPrototypeOf',
                'propertyIsEnumerable',
                'toLocaleString',
                'valueOf',
                'constructor'].sort());
            expect(vs).toEqual([1, 1, 1, 1, 1, 1, 1]);
        });

        it('does not ignore undefined value', function () {

            var x = {
                y: undefined
            };

            var z = util.mix({}, x);

            expect(z.y).toBeUndefined();
            expect('y' in z).toBe(true);

        });

        it('undefined does not overrite existing property', function () {
            var v = {
                x: 1
            };

            expect(util.mix(v, {
                x: undefined
            })).toEqual({
                x: 1
            });
        });

        describe('whitelist', function () {
            it('works for deep', function () {
                var a = {};
                var b = {
                    b1: 1,
                    b2: {
                        b22: 22
                    }
                };
                util.mix(a, b, true, ["b1", "b2"], true);

                expect(a).toEqual({
                    b1: 1,
                    b2: {}
                });


                a = {};
                b = {
                    b1: 1,
                    b2: {
                        b2: 22
                    }
                };
                util.mix(a, b, true, ["b1", "b2"], true);

                expect(a).toEqual({
                    b1: 1,
                    b2: {
                        b2: 22
                    }
                });
            });

            it('can be a function filter child', function () {
                var a = {},
                    b = {
                        b1: 1,
                        b2: {
                            b2: 22
                        }
                    };
                util.mix(a, b, {
                    deep: true,
                    whitelist: function (name, v) {
                        if (name === 'b1') {
                            return v;
                        }
                        if (this.b1 && name === 'b2') {
                            return v;
                        }
                        return undefined;
                    }
                });

                expect(a).toEqual({
                    b1: 1,
                    b2: {}
                });
            });

            it('can be a function filter parent', function () {
                var a = {},
                    b = {
                        b1: 1,
                        b2: {
                            b2: 22
                        }
                    };
                util.mix(a, b, {
                    deep: true,
                    whitelist: function (name, v) {
                        if (this.b1 && name === 'b2') {
                            return undefined;
                        }
                        return v;
                    }
                });

                expect(a).toEqual({
                    b1: 1
                });
            });
        });
    });

    it('util.merge', function () {
        var a = {
                'bool': false,
                'num': 0,
                'nul': null,
                'undef': undefined,
                'str': 'blabber'
            },
            b = {
                'bool': 'oops',
                'num': 'oops',
                'nul': 'oops',
                'undef': 'oops',
                'str': 'oops'
            };

        var c = util.merge(a, b);

        expect(c.bool).toBe('oops');
        expect(c.num).toBe('oops');
        expect(c.nul).toBe('oops');
        expect(c.undef).toBe('oops');
        expect(c.str).toBe('oops');
    });

    it('util.augment', function () {
        function Bird(name) {
            this.name = name;
        }

        Bird.prototype = {
            getName: function () {
                return this.name;
            },
            fly: function () {
            }
        };

        function Pig(name) {
            this.name = name;
        }

        util.augment(Pig, Bird, { prop: 'test prop' });
        util.augment(Pig, { weight: '100kg' });
        var pig = new Pig('Babe');

        expect(typeof pig.fly).toBe('function');
        expect(pig.prop).toBe('test prop');
        expect(pig.weight).toBe('100kg');
    });

    it('augment does not change constructor', function () {
        function X() {
        }

        function Y() {
        }

        util.augment(X, Y);
        expect(new X().constructor).toBe(X);
    });

    it('util.extend', function () {
        function Bird(name) {
            this.name = name;
        }

        Bird.prototype = {
            getName: function () {
                return this.name;
            }
        };

        function Chicken(name) {
            Chicken.superclass.constructor.call(this, name);
        }

        Chicken.prototype.featcher = 2;
        util.extend(Chicken, Bird);
        var chicken = new Chicken('Tom');

        expect(chicken.constructor).toBe(Chicken);
        expect(chicken.getName()).toBe('Tom');
        expect(chicken.featcher).toBe(2); // keep existed prototype members
    });

    it('util.namespace', function () {
        var ns;
        // normal
        ns = util.namespace('app1.Test');
        ns.name = 'foo1';
        /*global app1*/
        expect(app1.Test.name).toBe('foo1');

        var x = {};
        ns = util.namespace('app2.Test', x);
        ns.name = 'foo2';
        expect(x.app2.Test.name).toBe('foo2');
        expect(window.app2).toBeUndefined();
    });

    it('util.guid', function () {
        expect(typeof util.guid()).toBe('string');
        expect(util.guid() - util.guid()).toBe(-1);
    });

    it('util.makeArray', function () {
        var o;

        // 普通对象(无 length 属性)转换为 [obj]
        o = {a: 1};
        expect(util.makeArray(o)[0]).toBe(o);

        // string 转换为 [str]
        expect(util.makeArray('test')[0]).toBe('test');

        // function 转换为 [fn]
        o = fn;
        expect(util.makeArray(o)[0]).toBe(o);

        // array-like 对象，转换为数组
        expect(util.makeArray({'0': 0, '1': 1, length: 2}).length).toBe(2);
        expect(util.makeArray({'0': 0, '1': 1, length: 2})[1]).toBe(1);

        // nodeList 转换为普通数组
        o = document.getElementsByTagName('body');
        expect(util.makeArray(o).length).toBe(1);
        expect(util.makeArray(o)[0]).toBe(o[0]);
        expect('slice' in util.makeArray(o)).toBe(true);

        // arguments 转换为普通数组
        o = arguments;
        expect(util.makeArray(o).length).toBe(0);

        // 伪 array-like 对象
        o = util.makeArray({a: 1, b: 2, length: 2});
        expect(o.length).toBe(2);
        expect(o[0]).toBe(undefined);
        expect(o[1]).toBe(undefined);
    });

    it("util.escapeHtml", function () {
        expect(util.escapeHtml("<")).toBe("&lt;");
        expect(util.escapeHtml(">")).toBe("&gt;");
        expect(util.escapeHtml("&")).toBe("&amp;");
        expect(util.escapeHtml('"')).toBe("&quot;");
    });

    it("util.unEscapeHtml", function () {
        expect(util.unEscapeHtml("&lt;")).toBe("<");
        expect(util.unEscapeHtml("&gt;")).toBe(">");
        expect(util.unEscapeHtml("&amp;")).toBe("&");
        expect(util.unEscapeHtml('&quot;')).toBe('"');
        expect(util.unEscapeHtml('&#' + "b".charCodeAt(0) + ';')).toBe('b');
    });

    it('util.type', function () {
        expect(util.type(null)).toBe('null');

        expect(util.type(undefined)).toBe('undefined');
        expect(util.type()).toBe('undefined');

        expect(util.type(true)).toBe('boolean');
        expect(util.type(false)).toBe('boolean');
        expect(util.type(Boolean(true))).toBe('boolean');

        expect(util.type(1)).toBe('number');
        expect(util.type(0)).toBe('number');
        expect(util.type(Number(1))).toBe('number');

        expect(util.type('')).toBe('string');
        expect(util.type('a')).toBe('string');
        expect(util.type(String('a'))).toBe('string');

        expect(util.type({})).toBe('object');

        expect(util.type(/foo/)).toBe('regexp');
        expect(util.type(new RegExp('asdf'))).toBe('regexp');

        expect(util.type([1])).toBe('array');

        expect(util.type(new Date())).toBe('date');

        expect(util.type(function () {
        })).toBe('function');
        expect(util.type(fn)).toBe('function');

        expect(util.type(host)).toBe('object');

        if (web) {
            expect(util.type(doc)).toBe('object');
            expect(util.type(doc.body)).toBe('object');
            expect(util.type(doc.createTextNode('foo'))).toBe('object');
            expect(util.type(doc.getElementsByTagName('*'))).toBe('object');
        }
    });

    it('util.isArray', function () {
        expect(util.isArray([])).toBe(true);

        expect(util.isArray()).toBe(false);
        expect(util.isArray(arguments)).toBe(false);

        if (web) {
            expect(util.isArray(doc.getElementsByTagName('*'))).toBe(false);
        }

        // use native if possible
        if (Array.isArray) {
            expect(util.isArray).toBe(Array.isArray);
        }
    });

    it('util.isDate', function () {
        expect(util.isDate(new Date())).toBe(true);
        expect(util.isDate('2010/12/5')).toBe(false);
    });

    it('util.isRegExp', function () {
        expect(util.isRegExp(/s/)).toBe(true);
        expect(util.isRegExp(new RegExp('asdf'))).toBe(true);
    });

    it('util.isObject', function () {
        expect(util.isObject({})).toBe(true);
        expect(util.isObject(new Fn())).toBe(true);
        expect(util.isObject(host)).toBe(true);

        expect(util.isObject()).toBe(false);
        expect(util.isObject(null)).toBe(false);
        expect(util.isObject(1)).toBe(false);
        expect(util.isObject('a')).toBe(false);
        expect(util.isObject(true)).toBe(false);
    });

    it('util.isEmptyObject', function () {
        expect(util.isEmptyObject({})).toBe(true);

        expect(util.isEmptyObject({ a: 1 })).toBe(false);
        expect(util.isEmptyObject([])).toBe(true);

        // Failed in Safari/Opera
        //expect(util.isEmptyObject(fn)).toBe(true);
    });

    it('util.isPlainObject', function () {
        // The use case that we want to match
        expect(util.isPlainObject({})).toBe(true);

        expect(util.isPlainObject(new Fn())).toBe(false);

        // Not objects shouldn't be matched
        expect(util.isPlainObject('')).toBe(false);
        expect(util.isPlainObject(0)).toBe(false);
        expect(util.isPlainObject(1)).toBe(false);
        expect(util.isPlainObject(true)).toBe(false);
        expect(util.isPlainObject(null)).toBe(false);
        expect(util.isPlainObject(undefined)).toBe(false);
        expect(util.isPlainObject([])).toBe(false);
        expect(util.isPlainObject(new Date())).toBe(false);
        expect(util.isPlainObject(fn)).toBe(false);

        // Dom Element
        if (web) {
            expect(util.isPlainObject(doc.createElement('div'))).toBe(false);
        }


        function X() {
        }

        expect(util.isPlainObject(new X())).toBe(false);
        function Y() {
            this.x = 1;
        }

        Y.prototype.z = util.noop;
        expect(util.isPlainObject(new Y())).toBe(false);

        // Host
        expect(util.isPlainObject(host)).toBe(false);
    });

    it('util.clone', function () {
        // non array or plain object, just return
        expect(util.clone()).toBe(undefined);
        expect(util.clone(null)).toBe(null);
        expect(util.clone(1)).toBe(1);
        expect(util.clone(true)).toBe(true);
        expect(util.clone('a')).toBe('a');
        expect(util.clone(fn)).toBe(fn);

        var date = new Date();
        expect(util.clone(date)).toEqual(date);
        expect(util.clone(date)).not.toBe(date);


        var reg = /i/i;
        expect(util.clone(reg)).toEqual(reg);

        // phantomjs cache??
        if (!UA.phantomjs) {
            expect(util.clone(reg)).not.toBe(reg);
        }

        // clone plain object
        var t = { a: 0, b: { b1: 1, b2: 'a' } };
        var t2 = util.clone(t);
        t.a = 1;
        expect(t2.a).toBe(0);
        expect(t2.b.b1).toBe(1);
        t2.b.b2 = 'b';
        expect(t2.b.b2).toBe('b');

        // clone array
        var t3 = ['a', 2, 3, t];
        var t4 = util.clone(t3);
        t3[1] = 1;
        t3.push(5);
        expect(t4[1]).toBe(2);
        expect(t4.length).toBe(4);

        // recursive clone
        var CLONE_MARKER = '__~ks_cloned',
            Tom = {
                x: 1
            },
            Green = {
                father: Tom,
                x: 1
            };
        Tom.son = Green;

        var Tom2 = util.clone(Tom);
        expect(Tom2.son).toEqual(Green);
        expect(Tom2.son).not.toBe(Green);
        Tom2.son.x = 2;
        expect(Green.x).toBe(1);

        expect(Tom2[CLONE_MARKER]).toBeUndefined();

        var Green2 = util.clone(Green);
        expect(Green2.father).toEqual(Tom);
        expect(Green2.father).not.toBe(Tom);
        expect(Green2[CLONE_MARKER]).toBeUndefined();

        // filter function
        var t5 = [1, 2, 3, 4, 5, 6];
        var t6 = util.clone(t5, function (v) {
            return v % 2 === 0;
        });
        expect(t6.length).toBe(3);
        expect(t6[0]).toBe(2);
        expect(t6[1]).toBe(4);
        expect(t6[2]).toBe(6);


        // array of object
        var t7 = [],
            t20 = {x: 6},
            t21 = {x: 7},
            t22 = [t20, t21],
            t8 = {x: 1, z: t7, q: t22},
            t9 = {y: 1, z: t7, q: t22};
        t7.push(t8, t9);
        var t10 = util.clone(t7);
        expect(t10).not.toBe(t7);
        expect(t10).toEqual(t7);
        expect(t10 === t7).toBe(false);


        // 复制后仍是同一数组
        expect(t10[0].z === t10).toBe(true);
        expect(t10[0].z).toBe(t10);
        expect(t10[0].z).not.toBe(t7);
        expect(t10[0].z).toEqual(t7);

        // 复制后仍是同一数组
        expect(t10[1].q).toBe(t10[0].q);
        expect(t10[1].q).not.toBe(t22);
        expect(t10[1].q).toEqual(t22);

        t10[0].x = 2;
        t10[1].y = 2;
        // 不改变原始数据
        expect(t10.length).toBe(2);
        expect(t8.x).toBe(1);
        expect(t9.y).toBe(1);
    });

    it('util.trim', function () {
        var str = '    lots of spaces before and after    ';
        expect(util.trim(str)).toBe('lots of spaces before and after');

        // special
        expect(util.trim(false)).toBe('false');
        expect(util.trim(0)).toBe('0');
        expect(util.trim('')).toBe('');
        expect(util.trim(NaN)).toBe('NaN');
        expect(util.trim(null)).toBe('');
        expect(util.trim()).toBe('');
        expect(util.trim({})).toBe({}.toString());
    });

    it('util.substitute', function () {
        var myString = "{subject} is {property1} and {property2}.";
        var myObject = {subject: 'Jack Bauer', property1: 'our lord', property2: 'savior'};

        expect(util.substitute(myString, myObject)).toBe('Jack Bauer is our lord and savior.');

        expect(util.substitute(1)).toBe(1);
        expect(util.substitute()).toBe(undefined);
        expect(util.substitute('a', fn)).toBe('a');
        expect(util.substitute(fn)).toBe(fn);

        function T() {
            this.x = 1;
        }

        expect(util.substitute("{x}", new T())).toBe('1');

    });

    it('util.each', function () {
        var ret = 0;

        util.each([1, 2, 3, 4, 5], function (num) {
            ret += num;
        });

        expect(ret).toBe(15);

        // test context
        util.each([1], function () {
            expect(this).toBe(host);
        });
    });

    it('util.indexOf', function () {
        var a;

        expect(util.indexOf(6, [1, 2, 3, 4, 5])).toBe(-1);
        expect(util.indexOf(2, [1, 2, 3, 4, 5])).toBe(1);
        expect(util.indexOf(2, [1, 2, 3, 4, 5], 1)).toBe(1);
        expect(util.indexOf(2, [1, 2, 3, 4, 5], 2)).toBe(-1);

        expect(util.indexOf(a, [1, 2, 3, 4, undefined])).toBe(4);
        expect(util.indexOf({}, [1, 2, 3, 4, undefined])).toBe(-1);
    });

    it('util.lastIndexOf', function () {
        expect(util.indexOf(6, [1, 2, 3, 4, 5])).toBe(-1);
        expect(util.indexOf(2, [1, 2, 3, 4, 5])).toBe(1);
        expect(util.indexOf(2, [1, 2, 3, 4, 5], 1)).toBe(1);
        expect(util.indexOf(2, [1, 2, 3, 4, 5], 2)).toBe(-1);
        expect(util.indexOf(2, [1, 2, 3, 4, 5], 0)).toBe(1);
    });

    it('util.unique', function () {
        if (host.hostType === 'console') {
            return;
        } // BESENShell has bug for Array.prototype.splice

        expect(util.unique([1, 2, 1]).length).toBe(2);
        expect(util.unique([1, 2, '1']).length).toBe(3);
        expect(util.unique(['1', '1', '1']).length).toBe(1);

        expect(util.unique(['a', 'b', 'a'])[0]).toBe('a');
        expect(util.unique(['a', 'b', 'a'], true)[0]).toBe('b');
    });

    it('util.inArray', function () {
        var a;

        expect(util.inArray(2, [1, 2, 3, 4, 5])).toBe(true);
        expect(util.inArray(6, [1, 2, 3, 4, 5])).toBe(false);

        expect(util.inArray(a, [1, 2, 3, 4, undefined])).toBe(true);
        expect(util.inArray({}, [1, 2, 3, 4, {}])).toBe(false);
    });

    it('util.filter', function () {
        var ret = util.filter([1, 2, 3, 4, 5], function (item) {
            return item % 2 === 0;
        });

        expect(ret.length).toBe(2);
    });

    it('util.map', function () {
        function makePseudoPlural(single) {
            return single.replace(/o/g, "e");
        }

        var singles = ["foot", "goose", "moose"];
        var plurals = util.map(singles, makePseudoPlural);

        expect(plurals).toEqual(["feet", "geese", "meese"]);


        var a = util.map("Hello World",
            function (x) {
                return x.charCodeAt(0);
            });
        expect(a).toEqual([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);

    });

    it('util.reduce', function () {
        var r = util.reduce([0, 1, 2, 3, 4], function (previousValue, currentValue) {
            return previousValue + currentValue;
        });
        expect(r).toBe(10);


        r = util.reduce([0, 1, 2, 3, 4], function (previousValue, currentValue) {
            return previousValue + currentValue;
        }, 10);
        expect(r).toBe(20);
    });

    it("util.bind", function () {
        function x() {
            expect(this).toBe(window);
        }

        util.bind(x)();

        if (x.bind) {
            x.bind()();
        }

        function y(a, b, c) {
            expect(a).toBe(1);
            expect(b).toBe(2);
            expect(c).toBe(3);
            expect(this instanceof y).toBe(true);
        }

        var context = {};
        var t;
        // when new ,ignore context
        t = new (util.bind(y, context, 1, 2))(3);

        if (y.bind) {
            t = new (y.bind(context, 1, 2))(3);
        }

        if (1 > 2) {
            util.log(t);
        }

        function z(a, b, c) {
            expect(a).toBe(1);
            expect(b).toBe(2);
            expect(c).toBe(3);
            expect(this).toBe(context);
        }

        // consider context
        util.bind(z, context, 1, 2)(3);

        if (z.bind) {
            z.bind(context, 1, 2)(3);
        }
    });

    it('util.bind can be assigned to instance', function () {
        var y = {};
        var x = util.bind(function () {
            expect(this).toBe(y);
        });
        y.x = x;
        y.x();
    });

    it("util.rbind", function () {
        function x() {
            expect(this).toBe(window);
        }

        util.rbind(x)();

        function y(a, b, c) {
            expect(a).toBe(3);
            expect(b).toBe(1);
            expect(c).toBe(2);
            expect(this instanceof y).toBe(true);
        }

        var context = {};

        var t;

        // when new, ignore context
        t = new (util.rbind(y, context, 1, 2))(3);

        if (1 > 2) {
            console.log(t);
        }

        function z(a, b, c) {
            expect(a).toBe(3);
            expect(b).toBe(1);
            expect(c).toBe(2);
            expect(this).toBe(context);
        }

        // consider context
        util.rbind(z, context, 1, 2)(3);
    });

    it("util.throttle", function () {
        var i = 0, x = {};

        function t() {
            i++;
            expect(x).toBe(this);
        }

        var z = util.throttle(t, 300, x);
        z();
        expect(i).toBe(0);
        waits(500);
        runs(function () {
            z();
            expect(i).toBe(1);
            z();
            expect(i).toBe(1);
        });
        waits(500);
        runs(function () {
            z();
            expect(i).toBe(2);
            z();
            expect(i).toBe(2);
        });
    });

    it("util.buffer", function () {
        var i = 0, x = {};

        function t() {
            i++;
            expect(x).toBe(this);
        }

        var z = util.buffer(t, 300, x);
        z();
        expect(i).toBe(0);
        z();
        expect(i).toBe(0);
        waits(500);
        runs(function () {
            expect(i).toBe(1);
        });
        waits(500);
        runs(function () {
            expect(i).toBe(1);
        });
    });

    it("util.every", function () {
        function isBigEnough(element) {
            return (element >= 10);
        }

        var passed = util.every([12, 5, 8, 130, 44], isBigEnough);
        expect(passed).toBe(false);
        passed = util.every([12, 54, 18, 130, 44], isBigEnough);
        expect(passed).toBe(true);
    });

    it("util.some", function () {
        function isBigEnough(element) {
            return (element >= 10);
        }

        var passed = util.some([2, 5, 8, 1, 4], isBigEnough);
        // passed is false
        expect(passed).toBe(false);
        passed = util.some([12, 5, 8, 1, 4], isBigEnough);
        // passed is true
        expect(passed).toBe(true);
    });

    it('util.now', function () {
        expect(util.type(util.now())).toBe('number');
    });

    it('util.keys', function () {

        var x = {
            toString: function () {
                return "ha";
            },
            'x': 2
        };

        var ret = util.keys(x);

        ret.sort();

        expect(ret).toEqual(['x', "toString"].sort());
    });

    describe("util.ready", function () {
        it('util.ready simple works', function () {
            var r;
            util.ready(function () {
                r = 1;
            });

            waits(100);
            runs(function () {
                expect(r).toBe(1);
            });
        });

        // fix #89
        if (!KISSY.Config.debug) {
            it("util.ready should be independent from each other", function () {
                var r;
                util.ready(function () {
                    throw "1";
                });

                util.ready(function () {
                    r = 1;
                });

                waits(100);
                runs(function () {
                    expect(r).toBe(1);
                });
            });
        }
    });

    it('util.isWindow', function () {
        expect(util.isWindow(host)).toBe(true);
        expect(util.isWindow({})).toBe(false);
        expect(util.isWindow({
            setInterval: 1,
            setTimeout: 1,
            document: {
                nodeType: 9
            }
        })).toBe(false);
        expect(util.isWindow(document)).toBe(false);
        expect(util.isWindow(document.documentElement.firstChild)).toBe(false);
    });

    it('util.globalEval', function () {
        util.globalEval('var globalEvalTest = 1;');
        expect(host.globalEvalTest).toBe(1);
    });

    it('util.later', function () {
        var ok = false;

        util.later(function (data) {
            ok = true;
            expect(data.n).toBe(1);
        }, 20, false, null, { n: 1 });

        waitsFor(function () {
            return ok;
        });
        ok = false;

        var i = 1;
        var timer = util.later(function (data) {
            expect(data.n).toBe(1);
            if (i++ === 3) {
                timer.cancel();
                ok = true;
            }
        }, 500, true, null, { n: 1 });

        waitsFor(function () {
            return ok;
        });
        ok = false;
    });

    it('util.available', function () {
        var ret, t;

        t = document.createElement('DIV');
        t.id = 'test-available';
        document.body.appendChild(t);

        ret = 0;
        util.available('#test-available', function () {
            ret = 1;
        });
        expect(ret).toBe(0);

        util.later(function () {
            t = document.createElement('DIV');
            t.id = 'test-available2';
            document.body.appendChild(t);
        }, 100);

        ret = 0;
        util.available('test-available2', function () {
            ret = 1;
        });
        expect(ret).toBe(0);

        // 下面的语句不抛异常
        util.available();
        util.available('xxx');
    });

    it('util.equals', function () {
        var d = new Date();
        var d2 = new Date(d.getTime());
        expect(util.equals({x: 1}, {})).toBe(false);
        expect(util.equals({x: 1}, {x: 2})).toBe(false);
        expect(util.equals({x: 1}, {y: 1})).toBe(false);
        expect(util.equals({x: 1}, {x: 1})).toBe(true);
        expect(util.equals({x: [1]}, {x: [1, 2]})).toBe(false);
        expect(util.equals({x: [1, 2], y: 1}, {y: 1, x: [1, 2]})).toBe(true);
        expect(util.equals({x: [1, 2], y: 2}, {y: 1, x: [1, 2]})).toBe(false);
        expect(util.equals({x: d}, {x: d2})).toBe(true);
        expect(util.equals(d, d2)).toBe(true);
    });
});


/**
 * test common feature for xtemplate
 * @author yiminghe@gmail.com
 */

var XTemplate = require('xtemplate');
var util = require('util');

describe('feature', function () {
    it('support {{%%}}', function () {
        var tpl = '{{%{{my}}%}}';

        var render = new XTemplate(tpl).render({
            my: 1
        });

        expect(render).toBe('{{my}}');

        tpl = '{{%%}}';

        render = new XTemplate(tpl).render({
            my: 1
        });

        expect(render).toBe('');
    });

    it('not allow empty content', function () {
        var tpl = '';

        var data = {
            title: 'o'
        };

        try {
            new XTemplate(tpl, {
                name: 'tpl-empty-content'
            }).render(data);
        } catch (e) {
            expect(e.message.indexOf('syntax error') !== -1).toBeTruthy();
        }
    });

    it('support {{variable}}', function () {
        var tpl = 'this is class="t" {{title}}!';

        var data = {
            title: 'o'
        };

        var render = new XTemplate(tpl, {
            name: 'tpl-variable'
        }).render(data);

        expect(render).toBe('this is class="t" o!');
    });

    it('support double quote in content', function () {
        var tpl = '<a href="www.g.cn"></a>';
        var render = new XTemplate(tpl).render({});
        expect(render).toBe('<a href="www.g.cn"></a>');
    });

    describe('property', function () {
        it('support sub property', function () {
            var tpl = '{{data.x}}';

            var data = {
                data: {
                    x: 1
                }
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('1');
        });

        it('will render empty instead of undefined', function () {
            var tpl = '{{data.x}}';

            var data = {
                data: {
                    p: 1
                }
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('');
        });

        it('support array index', function () {
            var tpl = '{{data[1][1]}}';

            var data = {
                data: [1, [3, 2]]
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('2');
        });
    });

    it('support variable as index', function () {
        var tpl = '{{data[d]}}';

        var data = {
            data: {
                my: 1
            },
            d: 'my'
        };

        var render = new XTemplate(tpl).render(data);

        expect(render).toBe('1');
    });

    it('support express as index', function () {
        var tpl = '{{data["m"+"y"]}}';

        var data = {
            data: {
                my: 1
            },
            d: 'my'
        };

        var render = new XTemplate(tpl).render(data);

        expect(render).toBe('1');
    });

    describe('negative number and minus', function () {
        it('support 0-1', function () {
            var tpl = '{{#if( n===0-1)}}-1{{else}}1{{/if}}';

            var data = {
                n: -1
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('-1');

            tpl = '{{#if (n===1)}}-1{{else}}1{{/if}}';

            data = {
                n: 1
            };

            try {
                new XTemplate(tpl).render(data);
            } catch (e) {
                expect(e.message.indexOf('Syntax error') > -1).toBeTruthy();
            }
        });

        it('support simple -1', function () {
            var tpl = '{{-1}}';

            var render = new XTemplate(tpl).render();

            expect(render).toBe('-1');
        });

        it('support -1', function () {
            var tpl = '{{#if( n===-1)}}-1{{else}}1{{/if}}';

            var data = {
                n: -1
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('-1');
        });
    });

    describe('each', function () {
        it('support access parent scope', function () {
            var tpl = '{{#each (data)}}{{r}}{{xindex}}:{{this}}{{/each}}';
            var data = {
                r: '!',
                data: {
                    x: 1,
                    y: 2
                }
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('!x:1!y:2');
        });

        it('support xindex name', function () {
            var tpl = '{{#each(data, "v", "i")}}{{i}}: {{v}}{{/each}}';
            var data = {
                data: [1, 2]
            };
            var render = new XTemplate(tpl).render(data);
            expect(render).toBe('0: 11: 2');
        });

        it('support value name', function () {
            var tpl = '{{#each (data, "v")}}{{xindex}}: {{v}}{{/each}}';
            var data = {
                data: [1, 2]
            };
            var render = new XTemplate(tpl).render(data);
            expect(render).toBe('0: 11: 2');
        });

        it('support nest array', function () {
            var tpl = '{{#each (data)}}{{this[0]}}{{this[1]}}{{this}}{{/each}}';
            var data = {
                data: [
                    [1, 2]
                ]
            };
            var render = new XTemplate(tpl).render(data);
            expect(render).toBe('121,2');
        });

        it('support each object', function () {
            var tpl = '{{#each (data)}}{{xindex}}:{{this}}{{/each}}';
            var data = {
                data: {
                    x: 1,
                    y: 2
                }
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('x:1y:2');
        });

        it('allow empty content', function () {
            var tpl = '{{#each (l)}}{{/each}}';

            var data = {
                x: [
                    {
                        title: 5
                    }
                ]
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('');

            tpl = '{{#each( x)}}{{/each}}';

            data = {
                x: [
                    {
                        title: 5
                    }
                ]
            };

            render = new XTemplate(tpl).render(data);

            expect(render).toBe('');
        });

        it('support variable as index', function () {
            var tpl = '{{#each (data[d])}}{{this}}{{/each}}';
            var data = {
                data: {
                    my: [1, 2]
                },
                d: 'my'
            };
            var render = new XTemplate(tpl).render(data);
            expect(render).toBe('12');
        });

        it('ignore if not found', function () {
            var tpl = '{{#each( l)}}{{title}}{{/each}}';
            var data = {
                x: [
                    {
                        title: 5
                    }
                ]
            };
            var render = new XTemplate(tpl).render(data);
            expect(render).toBe('');
        });

        it('support array as render parameter', function () {
            var tpl = '!{{#each (this)}}{{this}}-{{/each}}!';
            var data = [1, 2];
            var render = new XTemplate(tpl, data).render(data);
            expect(render).toBe('!1-2-!');
        });

        it('support object in array', function () {
            var tpl = '{{#each( data)}}{{name}}-{{xindex}}/{{xcount}}|{{/each}}';
            var data = {
                data: [
                    {
                        name: 1
                    },
                    {
                        name: 2
                    }
                ]
            };
            var render = new XTemplate(tpl).render(data);
            expect(render).toBe('1-0/2|2-1/2|');
        });

        it('support simple array', function () {
            var tpl = '{{#each (data)}}{{this}}-{{xindex}}/{{xcount}}|{{/each}}';
            var data = {
                data: [1, 2]
            };
            var render = new XTemplate(tpl).render(data);
            expect(render).toBe('1-0/2|2-1/2|');
        });

        it('support nested each', function () {
            var tpl = '{{#each (outer)}}{{t}}{{#each (inner)}}{{this}}{{/each}}{{/each}}';
            var data = {
                outer: [
                    {
                        t: 1,
                        inner: [11, 12]
                    },
                    {
                        t: 2,
                        inner: [21, 22]
                    }
                ]
            };
            var render = new XTemplate(tpl).render(data);
            expect(render).toBe('1111222122');
        });

        describe('range', function () {
            it('support ascending order', function () {
                var tpl = '{{#each(range(0,3))}}{{this}}{{/each}}';
                var render = new XTemplate(tpl).render({});
                expect(render).toBe('012');
            });

            it('support descending order', function () {
                var tpl = '{{#each(range(3,0))}}{{this}}{{/each}}';
                var render = new XTemplate(tpl).render({});
                expect(render).toBe('321');
            });

            it('can specify step', function () {
                var tpl = '{{#each(range(5,0,-2))}}{{this}}{{/each}}';
                var render = new XTemplate(tpl).render({});
                expect(render).toBe('531');
            });

            it('can specify step', function () {
                var tpl = '{{#each(range(0,5,2))}}{{this}}{{/each}}';
                var render = new XTemplate(tpl).render({});
                expect(render).toBe('024');
            });
        });
    });

    describe('with', function () {
        it('support object in with', function () {
            var tpl = '{{#with (data)}}{{name}}-{{age}}{{/with}}';

            var data = {
                data: {
                    name: 'h',
                    age: 2
                }
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('h-2');
        });
    });

    describe('parent scope', function () {
        it('support access root scope', function () {
            var tpl = '{{#each (children)}}' +
                '{{name}}{{root.name}}' +
                '{{/each}}';
            var data = {
                name: 'x',
                children: [
                    {
                        name: 'x1'
                    },
                    {
                        name: 'x2'
                    }
                ]
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('x1xx2x');
        });

        // https://github.com/kissyteam/kissy/issues/517
        it('this will prevent scope finding', function () {
            var ret = new XTemplate('{{a}}^{{#each (b)}}|{{this.a}}{{/each}}$').render({
                a: 1,
                b: [
                    {
                        a: 2
                    },
                    {}
                ]
            });
            expect(ret).toBe('1^|2|$');
        });

        it('support for with', function () {
            var tpl = '{{#with( data)}}' +
                '{{#with (p)}}' +
                '{{name}}-{{age}}-{{../l2}}-{{../../l1}}' +
                '{{/with}}' +
                '{{/with}}';

            var data = {
                l1: 'l1',
                l2: 'l1_2',
                data: {
                    l1: 'l2_1',
                    l2: 'l2',
                    p: {
                        l1: 'l3_1',
                        l2: 'l3_2',
                        name: 'h',
                        age: 2
                    }

                }
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('h-2-l2-l1');
        });

        it('support for each', function () {
            var tpl = '{{#each (data)}}{{this}}-{{../total}}|{{/each}}';

            var data = {
                data: [1, 2],
                total: 3
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('1-3|2-3|');
        });

        //
        it('support with and each', function () {
            var tpl = '{{#with (a)}}{{#each (b)}}{{this}}{{../x}}{{../../x}}{{/each}}{{/with}}';

            var data = {
                a: {
                    b: [1],
                    x: 5
                },
                x: 6
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('156');
        });
    });

    it('support comment', function () {
        var tpl = 'my {{!\n' +
            'comment' +
            '\n}} {{title}}';

        var data = {
            title: 'oo'
        };


        var render = new XTemplate(tpl).render(data);

        expect(render).toBe('my  oo');
    });

    it('support set', function () {
        var tpl = '{{#each (data)}}' +
            '{{set (n2 = this*2, n3 = this*3)}}' +
            '{{n2}}-{{n3}}|' +
            '{{/each}}';

        var data = {
            data: [1, 2]
        };

        expect(new XTemplate(tpl).render(data)).toBe('2-3|4-6|');
    });

    it('support function as property value', function () {
        var tpl = '{{x.y(1,2)}}' +
            '{{#with(x)}}{{#with(z)}}{{../y(3,4)}}{{/with}}{{/with}}' +
            '{{#with(x)}}{{#with(z)}}{{../../x["y"](3,4)}}{{/with}}{{/with}}';

        var render = new XTemplate(tpl).render({
            x: {
                y: function (a, b) {
                    return a + b + this.salt;
                },
                salt: 1,
                z: {

                }
            }
        });

        expect(render).toBe('488');
    });

    it('support model object with function', function () {
        function Adder(cfg) {
            util.mix(this, cfg);
        }

        Adder.prototype.add = function (a, b) {
            return a + b + this.salt;
        };
        var tpl = '{{x.add(1,2)}}';

        var render = new XTemplate(tpl).render({
            x: new Adder({
                salt: 10
            })
        });
        expect(render).toBe('13');
    });

    describe('汉字', function () {
        it('允许汉字内容', function () {
            var tpl = '{{t}}出现了';
            var data = {
                t: 1
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('1出现了');
        });

        it('允许汉字参数', function () {
            var tpl = '{{t("出现了")}}';
            var data = {
            };

            var render = new XTemplate(tpl, {
                commands: {
                    t: function (scope, option) {
                        return option.params[0];
                    }
                }
            }).render(data);

            expect(render).toBe('出现了');
        });
    });
});
/**
 * test common feature for xtemplate
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var XTemplate = require('xtemplate');

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

        it('support cache', function () {
            var tpl = '{{title}}';
            expect(new XTemplate(tpl).tpl).toBe(new XTemplate(tpl).tpl);
            expect(new XTemplate(tpl,{
                cache:true
            }).tpl).toBe(new XTemplate(tpl).tpl);
            expect(new XTemplate(tpl,{
                cache:false
            }).tpl).not.toBe(new XTemplate(tpl).tpl);
        });

        it('support {{#if}} {{@', function () {
            var tpl = '{{#if(title)}}has title{{/if}}\n' +
                '{{@if(title2)}}has title2{{else}}not has title2{{/if}}';

            var data = {
                title: 'o',
                title2: ''
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('has title\n' +
                'not has title2');
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

        describe('if', function () {
            it('empty block works', function () {
                var tpl = '{{#if(t !== true)}}{{else}}true{{/if}}';
                var data = {
                    t: true
                };
                var render = new XTemplate(tpl).render(data);
                expect(render).toBe('true');
            });

            it('{{{if}}} is same as {{if}}', function () {
                var tpl = '{{{#if(t !== true)}}}{{else}}true{{{/if}}}';
                var data = {
                    t: true
                };
                var render = new XTemplate(tpl).render(data);
                expect(render).toBe('true');
            });

            it('support boolean', function () {
                var tpl = '{{#if(t === true)}}true{{else}}not true{{/if}}';
                var data = {
                    t: true
                };
                var render = new XTemplate(tpl).render(data);
                expect(render).toBe('true');
                data = {
                    t: 1
                };
                render = new XTemplate(tpl).render(data);
                expect(render).toBe('not true');
            });

            it('support access length attribute of array', function () {
                var tpl = '{{arr.length}} {{#if(arr.length)}}have elements{{else}}empty{{/if}}';
                var data = {
                    arr: ['a', 'b']
                };
                var render = new XTemplate(tpl).render(data);
                expect(render).toBe('2 have elements');
                render = new XTemplate(tpl).render({
                    arr: []
                });
                expect(render).toBe('0 empty');
            });

            it('support nested properties', function () {
                var tpl = '{{#with (z)}}{{#if (data.x)}}x{{else}}y{{/if}}{{/with}}';
                var data = {
                    data: null,
                    z: {
                        data: {
                            y: 1
                        }
                    }
                };
                var render = new XTemplate(tpl).render(data);
                expect(render).toBe('y');
            });

            it('can not get sub property data from parent scope', function () {
                var tpl = '{{#with (z)}}{{#if (data.x)}}x{{else}}y{{/if}}{{/with}}';
                var data = {
                    data: {
                        x: 1
                    },
                    z: {
                        data: {
                            y: 1
                        }
                    }
                };
                var render = new XTemplate(tpl).render(data);
                expect(render).toBe('y');
            });

            it('can not get sub property data from null', function () {
                var tpl = '{{#if (data.x)}}x{{else}}y{{/if}}';
                var data = {
                    data: null
                };
                var render = new XTemplate(tpl).render(data);
                expect(render).toBe('y');
            });
        });

        describe('each', function () {
            it('support xindex name', function () {
                var tpl = '{{#each( data, "v", "i")}}{{i}}: {{v}}{{/each}}';
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
                var tpl = '{{#each (data)}}{{this.0}}{{this.1}}{{this}}{{/each}}';
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

            it('support else', function () {
                var tpl = '{{#each (l)}}{{title}}{{else}}1{{/each}}';

                var data = {
                    x: [
                        {
                            title: 5
                        }
                    ]
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('1');
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
                var tpl = '{{#each( children)}}' +
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

        describe('escape', function () {
            it('support escape {{', function () {
                var tpl = 'my {{!\n' +
                    'comment' +
                    '\n}} \\{{title}}';

                var data = {
                    title: 'oo'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('my  {{title}}');

                render = new XTemplate('\\{{@').render({});

                expect(render).toBe('{{@');

            });

            it('support escape {{ more', function () {
                var tpl = 'my {{!\n' +
                    'comment' +
                    '\n}} \\{{title}}{{title}}';

                var data = {
                    title: 'oo'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('my  {{title}}oo');
            });

            it('escapeHtml works', function () {
                var tpl = 'my {{title}} is {{{title}}}';

                var data = {
                    title: '<a>'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('my &lt;a&gt; is <a>');
            });

            it('escape in inline command', function () {
                var tpl = 'my {{title()}} is {{{title()}}}';
                var render = new XTemplate(tpl, {
                    commands: {
                        title: function () {
                            return '<a>';
                        }
                    }
                }).render();

                expect(render).toBe('my &lt;a&gt; is <a>');
            });

            it('escape in inline command 2', function () {
                var tpl = 'my {{title(2)}} is {{{title(2)}}}';

                var render = new XTemplate(tpl, {
                    commands: {
                        title: function () {
                            return '<a>';
                        }
                    }
                }).render();

                expect(render).toBe('my &lt;a&gt; is <a>');
            });

            it('support escape " in tpl', function () {
                var tpl = '{{{"haha \\""}}}';

                var render = new XTemplate(tpl).render({});

                expect(render).toBe('haha "');
            });

            it('support escape \' in tpl', function () {
                var tpl = '{{{\'haha \\\'\'}}}';

                var render = new XTemplate(tpl).render({});

                expect(render).toBe('haha \'');
            });

            it('support escape \\\' in tpl', function () {
                var tpl = '{{{"haha \'"}}}';

                var render = new XTemplate(tpl).render({});
                /*jshint quotmark:false*/
                expect(render).toBe("haha '");
            });

            it('does support escape " in content', function () {
                var tpl = '"haha \\"';

                var render = new XTemplate(tpl).render({});

                expect(render).toBe('"haha \\"');
            });


            it('support escape escape', function () {
                var tpl = 'haha \\\\{{title}}';
                var data = {
                    title: 'a'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('haha \\a');


                tpl = 'haha \\\\\\{{title}}';
                data = {
                    title: 'a'
                };

                render = new XTemplate(tpl).render(data);

                expect(render).toBe('haha \\{{title}}');

                tpl = 'haha \\\\\\\\\\{{title}}';
                data = {
                    title: 'a'
                };

                render = new XTemplate(tpl).render(data);

                expect(render).toBe('haha \\\\{{title}}');
            });

        });

        describe('command', function () {
            it('../ or this can skip command finding', function () {
                var tpl = '{{this.title}}{{#with (d)}}{{../title}}{{/with}}';

                var data = {
                    title: '1',
                    d: {

                    }
                };

                var render = new XTemplate(tpl, {
                    commands: {
                        title: function () {
                            return '2';
                        }
                    }
                }).render(data);

                expect(render).toBe('11');
            });

            it('skip command in expression', function () {
                var tpl = '{{title+3}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl, {
                    commands: {
                        title: function () {
                            return '2';
                        }
                    }
                }).render(data);

                expect(render).toBe('13');
            });

            it('can skip property finding', function () {
                var tpl = '{{title (1)}}{{#with(d)}}{{title (2)}}{{/with}}';

                var data = {
                    title: '1',
                    d: {

                    }
                };

                var render = new XTemplate(tpl, {
                    commands: {
                        title: function () {
                            return 2;
                        }
                    }
                }).render(data);

                expect(render).toBe('22');
            });

            it('will only find property for param', function () {
                var tpl = '{{#with (title)}}{{c}}{{/with}}';

                var data = {
                    title: {
                        c: 1
                    }
                };

                var render = new XTemplate(tpl, {
                    commands: {
                        title: function () {
                            return {
                                c: 2
                            };
                        }
                    }
                }).render(data);

                expect(render).toBe('1');
            });

            it('support param function', function () {
                var tpl = '{{#with (title())}}{{c}}{{/with}}';

                var data = {
                    title: {
                        c: 1
                    }
                };

                var render = new XTemplate(tpl, {
                    commands: {
                        title: function () {
                            return {
                                c: 2
                            };
                        }
                    }
                }).render(data);

                expect(render).toBe('2');
            });

            it('support global command for variable', function () {
                XTemplate.addCommand('globalXcmd', function (scope, option) {
                    return 'global-' + option.params[0];
                });

                var tpl = 'my {{globalXcmd( title)}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('my global-1');

            });

            it('support namespace global command for variable', function () {

                XTemplate.addCommand('cmd', {
                    globalXcmd: function (scope, option) {
                        return 'global-' + option.params[0];
                    }
                });

                var tpl = '{{cmd.globalXcmd( title)}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('global-1');

            });

            it('support global command for block', function () {

                XTemplate.addCommand('global2_xcmd', function (scope, option, buffer) {
                    buffer.write('global2-');
                    return option.fn(scope, buffer);
                });

                var tpl = 'my {{#global2_xcmd()}}{{title}}{{/global2_xcmd}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('my global2-1');

            });

            it('support local command for variable', function () {

                var tpl = 'my {{global3(title)}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl, {
                    commands: {
                        'global3': function (scope, option) {
                            return 'global3-' + option.params[0];
                        }
                    }
                }).render(data);

                expect(render).toBe('my global3-1');

            });

            it('support namespace local command for variable', function () {

                var tpl = 'my {{global3.x(title)}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl, {
                    commands: {
                        'global3': {
                            x: function (scope, option) {
                                return 'global3-' + option.params[0];
                            }
                        }
                    }
                }).render(data);

                expect(render).toBe('my global3-1');

            });

            it('support local command for block', function () {

                var tpl = 'my {{#global4()}}{{title}}{{/global4}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl, {
                    commands: {
                        'global4': function (scope, option, buffer) {
                            buffer.write('global4-');
                            return option.fn(scope, buffer);
                        }
                    }
                }).render(data);

                expect(render).toBe('my global4-1');

            });

            it('support filter command', function () {
                var tpl = '{{ join (map (users)) }}';
                var render = new XTemplate(tpl, {
                    commands: {
                        'map': function (scope, option) {
                            return S.map(option.params[0], function (u) {
                                return u.name;
                            });
                        },
                        join: function (scope, option) {
                            return option.params[0].join('|');
                        }
                    }
                }).render({
                        users: [
                            {
                                name: '1'
                            },
                            {
                                name: '2'
                            }
                        ]
                    });

                expect(render).toBe('1|2');
            });
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
            var tpl = '{{data.d}}';

            var data = {
                z: '0',
                data: {
                    d: function () {
                        return this.z + '1';
                    }
                }
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('01');
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
});
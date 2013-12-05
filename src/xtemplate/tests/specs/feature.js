KISSY.add(function (S, require) {
    var XTemplate = require('xtemplate');

    describe('feature', function () {
        it('support {{%%}}', function () {
            var tpl = '{{%{{my}}%}}';

            var render = new XTemplate(tpl).render({
                my: 1
            });

            expect(render).toBe('{{my}}');

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
                expect(e.message.indexOf('Syntax error') !== -1).toBeTruthy();
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
                var tpl = '{{data.1.1}}';

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

        it('support cache', function () {
            var tpl = '{{title}}';
            expect(new XTemplate(tpl).tpl).toBe(new XTemplate(tpl).tpl);
        });

        it('support {{#if}} {{@', function () {
            var tpl = '{{#if title}}has title{{/if}}\n' +
                '{{@if title2}}has title2{{else}}not has title2{{/if}}';

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
                var tpl = '{{#if n===0-1}}-1{{else}}1{{/if}}';

                var data = {
                    n: -1
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('-1');

                tpl = '{{#if n===1}}-1{{else}}1{{/if}}';

                data = {
                    n: 1
                };

                try {
                    new XTemplate(tpl).render(data);
                } catch (e) {
                    expect(e.message.indexOf('Syntax error') > -1).toBeTruthy();
                }
            });

            it('support simple -1',function(){
                var tpl = '{{-1}}';

                var render = new XTemplate(tpl).render();

                expect(render).toBe('-1');
            });

            it('support -1', function () {
                var tpl = '{{#if n===-1}}-1{{else}}1{{/if}}';

                var data = {
                    n: -1
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('-1');
            });
        });

        describe('each', function () {
            it('support xindex name', function () {
                var tpl = '{{#each data "v" "i"}}{{i}}: {{v}}{{/each}}';
                var data = {
                    data: [1, 2]
                };
                var render = new XTemplate(tpl).render(data);
                expect(render).toBe('0: 11: 2');
            });

            it('support value name', function () {
                var tpl = '{{#each data "v"}}{{xindex}}: {{v}}{{/each}}';
                var data = {
                    data: [1, 2]
                };
                var render = new XTemplate(tpl).render(data);
                expect(render).toBe('0: 11: 2');
            });

            it('support nest array', function () {
                var tpl = '{{#each data}}{{this.0}}{{this.1}}{{.}}{{/each}}';
                var data = {
                    data: [
                        [1, 2]
                    ]
                };
                var render = new XTemplate(tpl).render(data);
                expect(render).toBe('121,2');
            });

            it('support each object', function () {
                var tpl = '{{#each data}}{{xindex}}:{{.}}{{/each}}';
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
                var tpl = '{{#each l}}{{/each}}';

                var data = {
                    x: [
                        {
                            title: 5
                        }
                    ]
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('');


                tpl = '{{#each x}}{{/each}}';

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
                var tpl = '{{#each data[d]}}{{.}}{{/each}}';

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
                var tpl = '{{#each l}}{{title}}{{/each}}';

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

            it('support {{^', function () {
                var tpl = '{{^each x}}wrong{{else}}{{title}}{{/each}}' +
                    '{{#if y===0}}0{{/if}}' +
                    '{{^if z===0}}1{{/if}}' +
                    '{{^if a!==1}}1{{/if}}' +
                    '{{#if a!==0}}1{{/if}}';

                var data = {
                    x: [
                        {
                            title: 5
                        },
                        {
                            title: 6
                        }
                    ],

                    y: 0,
                    z: 1,
                    a: 1
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('560111');
            });

            it('support else', function () {
                var tpl = '{{#each l}}{{title}}{{else}}1{{/each}}';

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
                var tpl = '!{{#each this}}{{this}}-{{/each}}!';

                var data = [1, 2];

                var render = new XTemplate(tpl, data).render(data);

                expect(render).toBe('!1-2-!');
            });

            it('support object in array', function () {
                var tpl = '{{#each data}}{{name}}-{{xindex}}/{{xcount}}|{{/each}}';

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
                var tpl = '{{#each data}}{{this}}-{{xindex}}/{{xcount}}|{{/each}}';

                var data = {
                    data: [1, 2]
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('1-0/2|2-1/2|');
            });


            it('support nested each', function () {
                var tpl = '{{#each outer}}{{t}}{{#each inner}}{{this}}{{/each}}{{/each}}';
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
                var tpl = '{{#with data}}{{name}}-{{age}}{{/with}}';

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
                var tpl = '{{#each children}}' +
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
                var ret = new XTemplate('{{a}}^{{#each b}}|{{this.a}}{{/each}}$').render({
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
                var tpl = '{{#with data}}' +
                    '{{#with p}}' +
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
                var tpl = '{{#each data}}{{this}}-{{../total}}|{{/each}}';

                var data = {
                    data: [1, 2],
                    total: 3
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('1-3|2-3|');
            });

            //
            it('support with and each', function () {
                var tpl = '{{#with a}}{{#each b}}{{this}}{{../x}}{{../../x}}{{/each}}{{/with}}';

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
                var tpl = 'my {{title}} is {{{title}}}';

                var render = new XTemplate(tpl, {
                    commands: {
                        title: function () {
                            return '<a>';
                        }
                    }
                }).render();

                expect(render).toBe('my &lt;a&gt; is <a>');
            });

            it('escape in inline command', function () {
                var tpl = 'my {{title 2}} is {{{title 2}}}';

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
                var tpl = '{{this.title}}{{#with d}}{{../title}}{{/with}}';

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

            it('skip command in expression',function(){
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
                var tpl = '{{title 1}}{{#with d}}{{title 2}}{{/with}}';

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

                expect(render).toBe('22');
            });

            it('will only find property for param', function () {
                var tpl = '{{#with title}}{{c}}{{/with}}';

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

            it('support global command for variable', function () {
                XTemplate.addCommand('globalXcmd', function (scope, config) {
                    return 'global-' + config.params[0];
                });

                var tpl = 'my {{globalXcmd title}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('my global-1');

            });


            it('support namespace global command for variable', function () {

                XTemplate.addCommand('cmd', {
                    globalXcmd: function (scope, config) {
                        return 'global-' + config.params[0];
                    }
                });

                var tpl = '{{cmd.globalXcmd title}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('global-1');

            });


            it('support global command for block', function () {

                XTemplate.addCommand('global2_xcmd', function (scope, config) {
                    return 'global2-' + config.fn(scope);
                });

                var tpl = 'my {{#global2_xcmd}}{{title}}{{/global2_xcmd}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('my global2-1');

            });


            it('support local command for variable', function () {

                var tpl = 'my {{global3 title}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl, {
                    commands: {
                        'global3': function (scope, config) {
                            return 'global3-' + config.params[0];
                        }
                    }
                }).render(data);

                expect(render).toBe('my global3-1');

            });

            it('support namespace local command for variable', function () {

                var tpl = 'my {{global3.x title}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl, {
                    commands: {
                        'global3': {
                            x: function (scope, config) {
                                return 'global3-' + config.params[0];
                            }
                        }
                    }
                }).render(data);

                expect(render).toBe('my global3-1');

            });


            it('support local command for block', function () {

                var tpl = 'my {{#global4}}{{title}}{{/global4}}';

                var data = {
                    title: '1'
                };

                var render = new XTemplate(tpl, {
                    commands: {
                        'global4': function (scope, config) {
                            return 'global4-' + config.fn(scope);
                        }
                    }
                }).render(data);

                expect(render).toBe('my global4-1');

            });

        });

        describe('support macro', function () {
            it('simple support', function () {
                var tpl = '{{#macro "test" "t"}}{{t}}{{/macro}}call {{macro "test" arg}}';
                var render = new XTemplate(tpl).render({
                    arg: 'macro'
                });
                expect(render).toBe('call macro');
            });

            it('support sub template macro define', function () {
                var tpl = '{{include "macro/x"}}call {{macro "test" arg}}';
                KISSY.add('macro/x', '{{#macro "test" "t"}}{{t}}{{/macro}}');
                var render = new XTemplate(tpl).render({
                    arg: 'macro'
                });
                expect(render).toBe('call macro');
            });

            it('support use macro from parent template', function () {
                var tpl = '{{#macro "test" "t"}}{{t}}2{{/macro}}{{include "macro/x2"}}';
                KISSY.add('macro/x2', 'call {{macro "test" arg}}');
                var render = new XTemplate(tpl).render({
                    arg: 'macro'
                });
                expect(render).toBe('call macro2');
            });

            it('support template extend', function () {
                KISSY.add('xtemplate/parent', '{{#macro "x"}}parent{{/macro}}' +
                    '{{macro "x"}}');
                var render = new XTemplate('{{#macro "x"}}{{content}}child{{/macro}}' +
                    '{{include "xtemplate/parent"}}').render({
                        title: 'title',
                        content: 'content'
                    });
                expect(render).toBe('child');
            });
        });

        describe('expression', function () {
            it('support unary expression', function () {
                var tpl = '{{#if !n}}1{{/if}}';
                expect(new XTemplate(tpl).render({
                    n: 1
                })).toBe('');
                expect(new XTemplate(tpl).render({
                    n: 0
                })).toBe('1');
            });

            it('support escapeHtml', function () {
                var tpl = '{{{"2<\\\\"+1}}} {{{"2<\\\\"+1}}}';
                expect(new XTemplate(tpl).render()).toBe('2<\\1 2<\\1');
            });

            it('differentiate negative number and minus', function () {
                var tpl = '{{n-1}}';

                var data = {
                    n: 10
                };

                expect(new XTemplate(tpl).render(data)).toBe('9');
            });

            it('support expression for variable', function () {

                var tpl = '{{n+3*4/2}}';

                var data = {
                    n: 1
                };

                expect(new XTemplate(tpl).render(data)).toBe('7');

            });

            it('support expression for variable even undefined', function () {
                var tpl = '{{n+3*4/2}}';
                var data = {
                    n2: 1
                };
                expect(new XTemplate(tpl).render(data)).toBe('NaN');
            });

            it('support expression for variable in string', function () {

                var tpl = '{{n+" is good"}}';

                var data = {
                    n: 'xtemplate'
                };

                expect(new XTemplate(tpl).render(data)).toBe('xtemplate is good');

            });

            it('support newline/quote for variable in string', function () {
                var tpl = '{{{"\n \\\' \\\\\\\'"}}} | \n \\\' \\\\\\\'';

                var data = {
                    n: 'xtemplate'
                };

                var content = new XTemplate(tpl).render(data);

                /*jshint quotmark: false*/
                expect(content).toBe("\n ' \\' | \n \\' \\\\\\'");

            });

            it('support relational expression', function () {

                var tpl = '{{#if n>n2+4/2}}' +
                    '{{n+1}}' +
                    '{{else}}' +
                    '{{n2+1}}' +
                    '{{/if}}';

                var tpl3 = '{{#if n===n2+4/2}}' +
                    '{{n+1}}' +
                    '{{else}}' +
                    '{{n2+1}}' +
                    '{{/if}}';


                var tpl4 = '{{#if n!==n2+4/2}}' +
                    '{{n+1}}' +
                    '{{else}}' +
                    '{{n2+1}}' +
                    '{{/if}}';

                var tpl5 = '{{#if n<5}}0{{else}}1{{/if}}';

                var tpl6 = '{{#if n>=4}}1{{else}}0{{/if}}';

                var data = {
                        n: 5,
                        n2: 2
                    }, data2 = {
                        n: 1,
                        n2: 2
                    },
                    data3 = {
                        n: 4,
                        n2: 2
                    };

                expect(new XTemplate(tpl).render(data)).toBe('6');

                expect(new XTemplate(tpl).render(data2)).toBe('3');

                expect(new XTemplate(tpl3).render(data3)).toBe('5');

                expect(new XTemplate(tpl4).render(data3)).toBe('3');

                expect(new XTemplate(tpl5).render({n: 5})).toBe('1');

                expect(new XTemplate(tpl6).render({n: 4})).toBe('1');
            });


            it('support relational expression in each', function () {
                var tpl = '{{#each data}}' +
                    '{{#if this>../limit+1}}' +
                    '{{this+1}}-{{xindex+1}}-{{xcount}}|' +
                    '{{/if}}' +
                    '{{/each}}' +
                    '';

                var data = {
                    data: [11, 5, 12, 6, 19, 0],
                    limit: 10
                };

                expect(new XTemplate(tpl).render(data)).toBe('13-3-6|20-5-6|');

            });

            it('support relational expression in with', function () {
                var tpl = '{{#with data}}' +
                    '{{#if n>../limit/5}}' +
                    '{{n+1}}' +
                    '{{/if}}' +
                    '{{/with}}';

                var data = {
                    data: {
                        n: 5
                    },
                    limit: 10
                };

                expect(new XTemplate(tpl).render(data)).toBe('6');

            });

            it('support conditional expression', function () {
                var tpl = '{{#if x>1&&x<10}}1{{else}}0{{/if}}' +
                    '{{#if q&&q.x<10}}1{{else}}0{{/if}}';

                expect(new XTemplate(tpl, {
                    name: 'conditional-expression'
                }).render({
                        x: 2
                    })).toBe('10');

                expect(new XTemplate(tpl).render({
                    x: 21,
                    q: {
                        x: 2
                    }
                })).toBe('01');
            });

        });

        it('support set', function () {
            var tpl = '{{#each data}}' +
                '{{set n2=this*2 n3=this*3}}' +
                '{{n2}}-{{n3}}|' +
                '{{/each}}';

            var data = {
                data: [1, 2]
            };

            expect(new XTemplate(tpl).render(data)).toBe('2-3|4-6|');
        });

        describe('support mustache', function () {

            it('support object', function () {
                var tpl = '{{#data}}{{name}}-{{age}}{{/data}}';

                var data = {
                    data: {
                        name: 'h',
                        age: 2
                    }
                };

                var renderFn = new XTemplate(tpl);

                var render = renderFn.render(data);

                expect(render).toBe('h-2');
            });


            it('support variable as index', function () {

                var tpl = '{{#data[d]}}{{.}}{{/data[d]}}';

                var data = {
                    data: {
                        my: [1, 2]
                    },
                    d: 'my'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('12');
            });

            it('support {{.}}', function () {

                var tpl = '{{.}}';

                var data = '1';

                var renderFn = new XTemplate(tpl);

                var render = renderFn.render(data);

                expect(render).toBe('1');


                tpl = '{{#.}}{{.}}{{/.}}';

                data = [
                    [1]
                ];

                renderFn = new XTemplate(tpl);

                render = renderFn.render(data);

                expect(render).toBe('1');
            });

            it('support array', function () {
                var tpl = '{{#data}}{{name}}-{{xindex}}/{{xcount}}|{{/data}}';

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

            it('can ignore unset array in silent mode', function () {
                var tpl = '{{#data}}{{name}}-{{xindex}}/{{xcount}}|{{/data}}';

                var data = {
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('');
            });

            it('will error when unset array in non-silent mode', function () {
                var tpl = '{{#data}}{{name}}-{{xindex}}/{{xcount}}|{{/data}}';

                var data = {
                };

                var r = '';

                try {
                    new XTemplate(tpl, {
                        silent: false
                    }).render(data);
                } catch (e) {
                    r = e.message;
                }
                if (KISSY.Config.debug) {
                    expect(r).toBe('can not find property: "data" at line 1');
                }
            });

            it('support simple # as if', function () {
                var tpl = '{{#data}}1{{/data}}';

                var data = {
                    data: true
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('1');
            });

            it('support {{^', function () {
                var tpl = '{{^xx}}1{{/xx}}';
                var render = new XTemplate(tpl).render({});

                expect(render).toBe('1');

                tpl = '{{^xx}}1{{else}}2{{/xx}}';

                render = new XTemplate(tpl).render({xx: 1});

                expect(render).toBe('2');
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

            it('support function as property value with right context', function () {
                var tpl = '{{#list}}{{fun}}{{/list}}';

                var data = {
                    list: [1, 2, 3],
                    'fun': function () {
                        return this;
                    }
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('123');
            });

            // no no
//                it('support . as array element', function () {
//                    var tpl = '{{#data}}{{.}}{{/data}}';
//
//                    var data = {
//                        data: ['1']
//                    };
//
//                    var render = new XTemplate(tpl).render(data);
//
//                    expect(render).toBe('1');
//                });

            it('support property lookup', function () {

                var tpl = '{{#data}}{{#data}}{{b}}{{/data}}{{/data}}';

                var data = {
                    b: '2',
                    data: {
                        b: '1',
                        data: {}
                    }
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('1');

            });

        });
    });
});
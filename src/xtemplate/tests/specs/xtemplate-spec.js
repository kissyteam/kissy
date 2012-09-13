/**
 * TC for KISSY XTemplate
 * @author yiminghe@gmail.com
 */
KISSY.use('xtemplate', function (S, XTemplate) {

    describe('xtemplate', function () {

        describe('feature', function () {

            it('support {{variable}}', function () {

                var tpl = 'this is {{title}}!';

                var data = {
                    title: 'o'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('this is o!');

            });


            it('support function as template', function () {

                var tpl = function (scopes) {
                    return 'this is ' + scopes[0].title + '!';
                };

                var data = {
                    title: 'o'
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('this is o!');

            });

            it('support cache', function () {

                var tpl = '{{title}}';

                expect(new XTemplate(tpl).compile()).toBe(new XTemplate(tpl).compile());

            });


            it('support {{#if}}', function () {
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

            describe('each', function () {
                it('support object', function () {

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

                it('support parent scope', function () {

                    var tpl = '{{#each data}}{{this}}-{{..\\total}}|{{/each}}';

                    var data = {
                        data: [1, 2],
                        total: 3
                    };

                    var render = new XTemplate(tpl).render(data);

                    expect(render).toBe('1-3|2-3|');

                });
            });


            describe('with', function () {

                it('support object', function () {

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

                it('support parent scope', function () {

                    var tpl = '{{#with data}}' +
                        '{{#with p}}' +
                        '{{name}}-{{age}}-{{..\\l2}}-{{..\\..\\l1}}' +
                        '{{/with}}' +
                        '{{/with}}';

                    var data = {
                        l1: 1,
                        data: {
                            l2: 2,
                            p: {
                                name: 'h',
                                age: 2
                            }

                        }
                    };

                    var render = new XTemplate(tpl).render(data);

                    expect(render).toBe('h-2-2-1');

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

                it('support escapeHTML', function () {

                    var tpl = 'my {{title}} is {{{title}}}';

                    var data = {
                        title: '<a>'
                    };

                    var render = new XTemplate(tpl).render(data);

                    expect(render).toBe('my &lt;a&gt; is <a>');

                });

            });


            describe('command', function () {

                it('support global command for variable', function () {

                    XTemplate.addCommand('global', function (scopes, option) {
                        return 'global-' + option.params[0];
                    });

                    var tpl = 'my {{global title}}';

                    var data = {
                        title: '1'
                    };

                    var render = new XTemplate(tpl).render(data);

                    expect(render).toBe('my global-1');

                });


                it('support global command for block', function () {

                    XTemplate.addCommand('global2', function (scopes, option) {
                        return 'global2-' + option.fn(scopes);
                    });

                    var tpl = 'my {{#global2}}{{title}}{{/global2}}';

                    var data = {
                        title: '1'
                    };

                    var render = new XTemplate(tpl).render(data);

                    expect(render).toBe('my global2-1');

                });


                it('support custom command for variable', function () {

                    var tpl = 'my {{global3 title}}';

                    var data = {
                        title: '1'
                    };

                    var render = new XTemplate(tpl, {
                        commands: {
                            'global3': function (scopes, option) {
                                return 'global3-' + option.params[0];
                            }
                        }
                    }).render(data);

                    expect(render).toBe('my global3-1');

                });


                it('support custom command for block', function () {

                    var tpl = 'my {{#global4}}{{title}}{{/global4}}';

                    var data = {
                        title: '1'
                    };

                    var render = new XTemplate(tpl, {
                        commands: {
                            'global4': function (scopes, option) {
                                return 'global4-' + option.fn(scopes);
                            }
                        }
                    }).render(data);

                    expect(render).toBe('my global4-1');

                });

            });

            describe('sub template', function () {

                it('support global sub template as string', function () {
                    XTemplate.addSubTpl('sub-tpl-1', '{{title}}');

                    var tpl = '{{include "sub-tpl-1"}}';

                    var data = {
                        title: '1'
                    };

                    var render = new XTemplate(tpl).render(data);

                    expect(render).toBe('1');
                });


                it('support global sub template as function', function () {
                    XTemplate.addSubTpl('sub-tpl-2', function (scopes) {
                        return scopes[0].title;
                    });

                    var tpl = '{{include "sub-tpl-2"}}';

                    var data = {
                        title: '1'
                    };

                    var render = new XTemplate(tpl).render(data);

                    expect(render).toBe('1');
                });


                it('support custom sub template as string', function () {
                    var tpl = '{{include "sub-tpl-3"}}';

                    var data = {
                        title: '1'
                    };

                    var render = new XTemplate(tpl, {
                        subTpls: {
                            'sub-tpl-3': '{{title}}'
                        }
                    }).render(data);

                    expect(render).toBe('1');
                });


                it('support custom sub template as function', function () {

                    var tpl = '{{include "sub-tpl-4"}}';

                    var data = {
                        title: '1'
                    };

                    var render = new XTemplate(tpl, {
                        subTpls: {
                            'sub-tpl-4': function (scopes) {
                                return scopes[0].title;
                            }
                        }
                    }).render(data);

                    expect(render).toBe('1');
                });

            });


            describe('expression', function () {

                it('support expression for variable', function () {

                    var tpl = '{{n+3*4/2}}';

                    var data = {
                        n: 1
                    };

                    expect(new XTemplate(tpl).render(data)).toBe('7');

                });


                it('support expression for variable in string', function () {

                    var tpl = '{{n+" is good"}}';

                    var data = {
                        n: 'xtemplate'
                    };

                    expect(new XTemplate(tpl).render(data)).toBe('xtemplate is good');

                });

                it('support relational expression', function () {

                    var tpl = '{{#if n > n2+4/2}}' +
                        '{{n+1}}' +
                        '{{else}}' +
                        '{{n2+1}}' +
                        '{{/if}}';

                    var tpl3 = '{{#if n === n2+4/2}}' +
                        '{{n+1}}' +
                        '{{else}}' +
                        '{{n2+1}}' +
                        '{{/if}}';


                    var tpl4 = '{{#if n !== n2+4/2}}' +
                        '{{n+1}}' +
                        '{{else}}' +
                        '{{n2+1}}' +
                        '{{/if}}';


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
                });


                it('support relational expression in each', function () {

                    var tpl = '{{#each data}}' +
                        '{{#if this > ..\\limit+1}}' +
                        '{{this+1}}|' +
                        '{{/if}}' +
                        '{{/each}}' +
                        '';

                    var data = {
                        data: [11, 5, 12, 6, 19, 0],
                        limit: 10
                    };

                    expect(new XTemplate(tpl).render(data)).toBe('13|20|');

                });


                it('support relational expression in with', function () {

                    var tpl = '{{#with data}}' +
                        '{{#if n > ..\\limit/5}}' +
                        '{{n+1}}' +
                        '{{/if}}' +
                        '{{/with}}' +

                        '';

                    var data = {
                        data: {
                            n: 5
                        },
                        limit: 10
                    };

                    expect(new XTemplate(tpl).render(data)).toBe('6');

                });

            });

        });


        describe('error detection', function () {

            it('detect un-closed block tag', function () {
                var tpl = '{{#if title}}\n' +
                    'shoot\n' +
                    '';
                var data = {
                    title: 'o'
                };

                expect(function () {
                    //try {
                    new XTemplate(tpl).render(data);
                    //} catch (e) {
                    //    S.log('!'+e.replace(/\n/g,'\\n').replace(/\r/g,'\\r')+'!');
                    //    throw e;
                    //}
                }).toThrow('parse error at line 3:\n' +
                    '{{#if title}} shoot\n\n' +
                    '--------------------^\n' +
                    'expect OPEN_END_BLOCK');
            });

            it('warn about missing property', function () {
                var log = S.log, msg2 = '';

                var tpl = 'this is \n' +
                    '{{title}}';

                var data = {
                    title2: 1
                };

                S.log = function (msg, type) {
                    if (type == 'warn') {
                        msg2 = msg;
                    }
                };

                var render = new XTemplate(tpl).render(data);

                expect(render).toBe('this is \n');

                expect(msg2).toBe("can not find property: 'title' at line 2");

                S.log = log;
            });

            it('detect unmatched', function () {
                var tpl = '{{#ifeq n n1}}' +
                    'n eq n1' +
                    '{{/if}}';

                var data = {
                    n: 1,
                    n1: 2
                };

                expect(function () {
                    try {
                        new XTemplate(tpl).render(data);
                    } catch (e) {
                        //S.log('!'+e.replace(/\n/g,'\\n').replace(/\r/g,'\\r')+'!');
                        throw e;
                    }
                }).toThrow('parse error at line 1:\n' +
                    'expect {{/ifeq}} not {{/if}}');

            });

        });

    });

});
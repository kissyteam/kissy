KISSY.use("template,dom", function(S, T,DOM) {

    describe('template', function() {

        it("slash and quote should be escaped", function() {
            expect(T('{{#if a=="a"}}{{b}}\\"{{/if}}').render({a:"a",b:"b"})).toBe('b\\"');
        });

        it("should ignore undefined variable", function() {
            expect(T('{{#if typeof a === "undefined" || a === "a"}}{{b}}{{/if}}').render({})).toBe('');
            expect(T('{{#if a}}{{a}}{{/if}}').render({})).toEqual('');
        });

        // KS_TEMPL.push(typeof (item.x||item.y) ==="undefined"?"":item.x||item.y)
        it("should support undefined variable in object", function() {
            expect(T('{{item.x||item.y}}').render({
                item:{x:0,y:2}
            })).toBe('2');
        });

        describe('variable', function() { // {{{
            it('should render a normal string', function() {
                expect(T('a').render()).toEqual('a');
                expect(T('a').render({})).toEqual('a');
                expect(T('"a').render({})).toEqual('"a');
                expect(T('>a').render({})).toEqual('>a');
            });
            it('should render a normal variable', function() {
                expect(T('{{a}},{{b}}').render({a: '1', b: '2'})).toEqual('1,2');
                expect(T('{{}}').render({})).toEqual('{{}}');
            });
        }); // }}}
        describe('statement', function() { // {{{

            describe('if', function() {
                it('support if statement', function() {
                    expect(T('{{#if a}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toEqual('b');
                    expect(T('{{#if a}}normal string{{b}}{{/if}}').render({a: 'a', b: 'b'})).toEqual('normal stringb');
                    expect(T('{{#if a==\'a\'}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toEqual('b');
                    expect(T('{{#if a==\'b\'}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toEqual('');
                    expect(T('{{#if a!=\'b\'}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toEqual('b');
                    expect(T('{{#if a == " "}}{{b}}{{/if}}').render({a: ' ', b: 'b'})).toEqual('b');
                });
            });

            describe('else', function() {
                it('support else statement', function() {
                    expect(T('{{#if a}}{{b}}{{#else}}{{c}}{{/if}}').render({a: 'a', b: 'b', c: 'c'})).toEqual('b');
                    expect(T('{{#if a}}{{b}}{{#else}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toEqual('c');
                    expect(T('{{#if a==\'b\'}}{{b}}{{#else}}{{c}}{{/if}}').render({a: 'a', b: 'b', c: 'c'})).toEqual('c');
                });
            });

            describe('elseif', function() {
                it('support elseif statement', function() {
                    expect(T('{{#if a}}{{b}}{{#elseif true}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toEqual('c');
                    expect(T('{{#if a}}{{b}}{{#elseif false}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toEqual('');
                    expect(T('{{#if !a}}{{b}}{{#elseif false}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toEqual('b');
                    expect(T('{{#if a}}{{b}}{{#elseif !!b}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toEqual('c');
                });
            });

            describe('each', function() {
                it('support each function', function() {
                    expect(T('{{#each a}}<{{_ks_value.a}}{{/each}}').render({a: [
                        {a: 1},
                        {a: 2},
                        {a: 3}
                    ]})).toEqual('<1<2<3');
                    expect(T('{{#each a}}{{#if _ks_value.a > 1}}{{_ks_value.a}}{{/if}}{{/each}}').render({a: [
                        {a: 1},
                        {a: 2},
                        {a: 3}
                    ]})).toEqual('23');
                });
                it('support custom value, index', function() {
                    expect(T('{{#each a as}}<{{_ks_value.a}}{{/each}}').render({a: [
                        {a: 1},
                        {a: 2},
                        {a: 3}
                    ]})).toEqual('<1<2<3');
                    expect(T('{{#each a as value}}<{{value.a}}{{/each}}').render({a: [
                        {a: 1},
                        {a: 2},
                        {a: 3}
                    ]})).toEqual('<1<2<3');
                    expect(T('{{#each a as value index}}<{{index}}:{{value.a}}{{/each}}').render({a: [
                        {a: 1},
                        {a: 2},
                        {a: 3}
                    ]})).toEqual('<0:1<1:2<2:3');
                });
            });

        }); // }}}
        describe('cache', function() { // {{{
            it('have template cache', function() {
                var t = T('{{#each a}}<{{_ks_value.a}}{{/each}}');
                f = T('{{#each a}}<{{_ks_value.a}}{{/each}}');
                expect(t).toEqual(f);
            });
        }); // }}}
        describe('error', function() { // {{{
            it('can handle syntax template error', function() {
                expect(T('{{-}}').render().indexOf('Syntax Error.')).not.toEqual(-1);
            });
        }); // }}}
        describe('log', function() { // {{{
            it('can log all compiled template code', function() {
                T.log('{{}}');
            });
        }); // }}}
        describe('node', function() { // {{{
            it('have chain support for KISSY.Node', function() {
                S.one(S.DOM.create([
                    '<script type="text/x-kissy-template" id="template">',
                    '<div id="render">{{#each a}}{{_ks_value.a}}{{/each}}</div>',
                    '</script><div id="container"></div>'
                ].join(''))).appendTo(document.body);
                S.one(T(S.one('#template').html()).render({
                    a: [
                        {a: 1},
                        {a: 2},
                        {a: 3}
                    ],
                    b: [
                        {a: 4},
                        {a: 5},
                        {a: 6}
                    ]
                })).appendTo('#container');
                expect(S.one('#render').html()).toEqual('123');
                S.one('#container').html('');
            });
        }); // }}}
        describe('comments', function() { // {{{
            it('supports comments', function() {
                expect(T('{{#! here is a comment tag}}').render()).toEqual('');
            });
        }); // }}}
        describe('nested', function() { // {{{
            it('supports nested', function() {
                expect(T('Hello, {{#each users}}' +
                    '{{#if _ks_value.show}}{{_ks_value.name}}{{/if}}' +
                    '{{#each _ks_value.friends}} <i>{{_ks_value.name}}</i> {{/each}} {{/each}}.')
                    .render({users: [
                        {
                            show: false,
                            name: 'Frank',
                            friends: [
                                { name: 'jolin' },
                                { name: 'jolin2' }
                            ]
                        },
                        {
                            show: true,
                            name: 'yyfrankyy',
                            friends: [
                                { name: 'angela' }
                            ]
                        }
                    ]})).toEqual('Hello,  <i>jolin</i>  <i>jolin2</i>  yyfrankyy <i>angela</i>  .');
            });
            it('supports nested with different each variable name', function() {
                expect(T('Hello, {{#each users as user}}' +
                    '{{#if user.show}}{{user.name}}{{/if}}' +
                    '{{#each user.friends as friend}} <i>{{friend.name}}</i> {{/each}} {{/each}}.')
                    .render({users: [
                        {
                            show: false,
                            name: 'Frank',
                            friends: [
                                { name: 'jolin' },
                                { name: 'jolin2' }
                            ]
                        },
                        {
                            show: true,
                            name: 'yyfrankyy',
                            friends: [
                                { name: 'angela' }
                            ]
                        }
                    ]})).toEqual('Hello,  <i>jolin</i>  <i>jolin2</i>  yyfrankyy <i>angela</i>  .');
            });
        });

    });
});
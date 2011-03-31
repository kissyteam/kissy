describe('template', function() {
    var S = KISSY, T = S.Template;

    describe('variable', function() { // {{{
        it('should render a normal string', function() {
            expect(T('a').render()).toBe('a');
            expect(T('a').render({})).toBe('a');
            expect(T('"a').render({})).toBe('"a');
            expect(T('>a').render({})).toBe('>a');
        });
        it('should render a normal variable', function() {
            expect(T('{{a}},{{b}}').render({a: '1', b: '2'})).toBe('1,2');
            expect(T('{{}}').render({})).toBe('{{}}');
        });
    }); // }}}

    describe('statement', function() {

        describe('if', function() {
            it('support if statement', function() {
                expect(T('{{#if a}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('b');
                expect(T('{{#if a}}normal string{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('normal stringb');
                expect(T('{{#if a==\'a\'}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('b');
                expect(T('{{#if a==\'b\'}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('');
                expect(T('{{#if a!=\'b\'}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('b');
                expect(T('{{#if a == " "}}{{b}}{{/if}}').render({a: ' ', b: 'b'})).toBe('b');
            });
        });

        describe('else', function() {
            it('support else statement', function() {
                expect(T('{{#if a}}{{b}}{{#else}}{{c}}{{/if}}').render({a: 'a', b: 'b', c: 'c'})).toBe('b');
                expect(T('{{#if a}}{{b}}{{#else}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('c');
                expect(T('{{#if a==\'b\'}}{{b}}{{#else}}{{c}}{{/if}}').render({a: 'a', b: 'b', c: 'c'})).toBe('c');
            });
        });

        describe('elseif', function() {
            it('support elseif statement', function() {
                expect(T('{{#if a}}{{b}}{{#elseif true}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('c');
                expect(T('{{#if a}}{{b}}{{#elseif false}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('');
                expect(T('{{#if !a}}{{b}}{{#elseif false}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('b');
                expect(T('{{#if a}}{{b}}{{#elseif !!b}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('c');
            });
        });

        describe('each', function() {
            it('support each function', function() {
                expect(T('{{#each a}}<{{_ks_value.a}}{{/each}}').render({a: [{a: 1}, {a: 2}, {a: 3}]})).toBe('<1<2<3');
                expect(T('{{#each a}}{{#if _ks_value.a > 1}}{{_ks_value.a}}{{/if}}{{/each}}').render({a: [{a: 1}, {a: 2}, {a: 3}]})).toBe('23');
            });
            it('support custom value, index', function() {
                expect(T('{{#each a as value}}<{{v.a}}{{/each}}').render({a: [{a: 1}, {a: 2}, {a: 3}]})).toBe('<1<2<3');
            });
        });

    });

    describe('cache', function() { // {{{
        it('have template cache', function() {
            var t = T('{{#each a}}<{{_ks_value.a}}{{/each}}');
                f = T('{{#each a}}<{{_ks_value.a}}{{/each}}');
            expect(t).toEqual(f);
        });
    }); // }}}
    describe('error', function() { // {{{
        it('can handle syntax template error', function() {
            expect(T('{{-}}').render().indexOf('Syntax Error.')).not.toBe(-1);
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
            S.tmpl('#template', {
                a: [{a: 1}, {a: 2}, {a: 3}],
                b: [{a: 4}, {a: 5}, {a: 6}]
            }).appendTo('#container');
            expect(S.one('#render').html()).toEqual('123');
            S.one('#container').html('');
        });
    }); // }}}
    describe('comments', function() { // {{{
        it('supports comments', function() {
            expect(T('{{#! here is a comment tag}}').render()).toBe('');
        });
    }); // }}}
    describe('nested', function() { // {{{
        it('supports nested', function() {
            KISSY.Template('Hello, {{#each users}}' +
                '{{#if _ks_value.show}}{{_ks_value.name}}{{/if}}' +
                '{{#each _ks_value.sub}} <i>{{_ks_value.sub.f}}</i> {{/each}} {{/each}}.')
            .render({users: [{
                show: false,
                name: 'Frank',
                sub: [{ f: 'jolin' }, { f: 'jolin2' }]
            }, {
                show: true,
                name: 'yyfrankyy',
                sub: [{ f: 'angela' }]
            }]});
        });
    }); // }}}

    describe('config', function() {});

});

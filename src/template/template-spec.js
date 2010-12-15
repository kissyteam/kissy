describe('template', function() {
    var S = KISSY, T = S.Template;

    describe('variable', function() {

        it('should render a normal string', function() {
            expect(T('a').render({})).toBe('a');
            expect(T('"a').render({})).toBe('"a');
            expect(T('>a').render({})).toBe('>a');
        });

        it('should render a normal variable', function() {
            expect(T('{{a}},{{b}}').render({a: '1', b: '2'})).toBe('1,2');
        });

    });

    describe('statement', function() {

        it('should support if statement', function() {
            expect(T('{{#if a}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('b');
            expect(T('{{#if a}}normal string{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('normal stringb');
        });

        it('should support else statement', function() {
            expect(T('{{#if a}}{{b}}{{#else}}{{c}}{{/if}}').render({a: 'a', b: 'b', c: 'c'})).toBe('b');
            expect(T('{{#if a}}{{b}}{{#else}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('c');
        });

        it('should support elseif statement', function() {
            expect(T('{{#if a}}{{b}}{{#elseif true}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('c');
        });

        it('should support each function', function() {
            expect(T('{{#each a}}<{{_ks_value.a}}{{/each}}').render({a: [{a: 1}, {a: 2}, {a: 3}]})).toBe('<1<2<3');
        });

    });

});

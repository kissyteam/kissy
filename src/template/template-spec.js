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

        describe('if', function() {
            it('should support if statement', function() {
                expect(T('{{#if a}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('b');
                expect(T('{{#if a}}normal string{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('normal stringb');
                expect(T('{{#if a==\'a\'}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('b');
                expect(T('{{#if a==\'b\'}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('');
                expect(T('{{#if a!=\'b\'}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('b');
            });
        });

        describe('else', function() {
            it('should support else statement', function() {
                expect(T('{{#if a}}{{b}}{{#else}}{{c}}{{/if}}').render({a: 'a', b: 'b', c: 'c'})).toBe('b');
                expect(T('{{#if a}}{{b}}{{#else}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('c');
                expect(T('{{#if a==\'b\'}}{{b}}{{#else}}{{c}}{{/if}}').render({a: 'a', b: 'b', c: 'c'})).toBe('c');
            });
        });

        describe('elseif', function() {
            it('should support elseif statement', function() {
                expect(T('{{#if a}}{{b}}{{#elseif true}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('c');
                expect(T('{{#if a}}{{b}}{{#elseif false}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('');
                expect(T('{{#if !a}}{{b}}{{#elseif false}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('b');
                expect(T('{{#if a}}{{b}}{{#elseif !!b}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('c');
            });
        });

        describe('each', function() {
            it('should support each function', function() {
                expect(T('{{#each a}}<{{_ks_value.a}}{{/each}}').render({a: [{a: 1}, {a: 2}, {a: 3}]})).toBe('<1<2<3');
                expect(T('{{#each a}}{{#if _ks_value.a > 1}}{{_ks_value.a}}{{/if}}{{/each}}').render({a: [{a: 1}, {a: 2}, {a: 3}]})).toBe('23');
            });
        });

    });

    describe('cache', function() {

        it('should have template cache', function() {
            var t = T('{{#each a}}<{{_ks_value.a}}{{/each}}');
                f = T('{{#each a}}<{{_ks_value.a}}{{/each}}');

            expect(t).toEqual(f);
        });

    });

    describe('config', function() {

        it('should support custom name', function() {
            var custom_name = 'ks_data_custom_name',
                t = T('{{#each a}}<{{_ks_value.a}}{{/each}}', {name: custom_name});

            expect(t.name).toEqual(custom_name);
        });

    });

});

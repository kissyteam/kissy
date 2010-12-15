describe('template', function() {
    var S = KISSY, T = S.Template;

    describe('variable', function() {

        it('should render a normal string', function() {
            expect(T('a').render({})).toBe('a');
        });

        it('should render a normal variable', function() {
            expect(T('{{a}},{{b}}').render({a: 'a', b: 'b'})).toBe('a,b');
        });

    });

    describe('statement', function() {

        it('should support if statement', function() {
            expect(T('{{#if a}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('b');
        });

        it('should support else statement', function() {
            expect(T('{{#if a}}{{b}}{{#else}}{{c}}{{/if}}').render({a: 'a', b: 'b', c: 'c'})).toBe('b');
            expect(T('{{#if a}}{{b}}{{#else}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('c');
        });

        it('should support else statement', function() {
            expect(T('{{#if a}}{{b}}{{#else}}{{c}}{{/if}}').render({a: 'a', b: 'b', c: 'c'})).toBe('b');
            expect(T('{{#if a}}{{b}}{{#else}}{{c}}{{/if}}').render({a: false, b: 'b', c: 'c'})).toBe('c');
        });

    });
});

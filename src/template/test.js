describe('template', function() {
    var S = KISSY, T = S.Template;

    describe('variable', function() {

        it('render a normal string', function() {
            expect(T('a').render({})).toBe('a');
        });

        it('render a normal variable', function() {
            expect(T('{{a}},{{b}}').render({a: 'a', b: 'b'})).toBe('a,b');
        });

    });

    describe('statement', function() {

        it('support if statement', function() {
            expect(T('{{#if a}}{{b}}{{/if}}').render({a: 'a', b: 'b'})).toBe('b');
        });

    });
});

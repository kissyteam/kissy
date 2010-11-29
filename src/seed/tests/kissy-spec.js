describe('seed', function() {

    var S = KISSY;

    describe('S.mix', function() {

        it('在常用场景下正常工作', function() {
            var o1 = { a: 1, b: 2 },
                o2 = { a: 1, b: 2 },
                o3 = { a: 1, b: 2 },
                o4 = { a: 'a', c: true };

            S.mix(o1, o4);
            expect(o1.a).toBe('a');

            S.mix(o2, o4, false);
            expect(o2.a).toBe(1);

            S.mix(o3, o4, true, ['c']);
            expect(o3.a).toBe(1);
        });
    });
});

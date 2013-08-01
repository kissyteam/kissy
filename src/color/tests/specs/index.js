KISSY.add(function (S, Color) {
    describe('color', function () {
        it('parse rgba right', function () {
            var rgba=Color.parse('rgba(1,2,3,0.4)');
            expect(rgba.get('r')).toBe(1);
            expect(rgba.get('g')).toBe(2);
            expect(rgba.get('b')).toBe(3);
            expect(rgba.get('a')).toBe(0.4);
        });
    });
}, {
    requires: ['color']
});
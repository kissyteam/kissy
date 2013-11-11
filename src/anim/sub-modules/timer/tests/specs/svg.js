KISSY.add(function (S, Dom, Anim, Color) {
    describe('svg works', function () {
        it('support svg attribute', function () {
            var div = Dom.create('<div></div>');
            document.body.appendChild(div);
            div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' +
                '<circle ' +
                'cx="100" ' +
                'cy="50" ' +
                'r="40" ' +
                'opacity="1" ' +
                'stroke="black" ' +
                'stroke-width="2" ' +
                'fill="#000"/>' +
                '</svg>';
            var circle = div.firstChild.firstChild;
            new Anim(circle, {
                fill: {
                    type: 'attr',
                    fxType: 'color',
                    value: '#fff'
                },
                opacity: {
                    type: 'attr',
                    value: '0'
                }
            }, {
                duration: 0.5
            }).run();
            waits(100);
            runs(function () {
                var fill = Color.parse(circle.getAttribute('fill')).toHex();
                var opacity =circle.getAttribute('opacity');
                expect(opacity).not.toBe('0');
                expect(opacity).not.toBe('1');
                expect(fill).not.toBe('#000000');
                expect(fill).not.toBe('#ffffff');
            });
            waits(5000);
            runs(function () {
                var fill = Color.parse(circle.getAttribute('fill')).toHex();
                var opacity =circle.getAttribute('opacity');
                expect(opacity).toBe('0');
                expect(fill).toBe('#ffffff');
                document.body.removeChild(div);
            });
        });
    });
}, {
    requires: ['dom', 'anim', 'color']
});
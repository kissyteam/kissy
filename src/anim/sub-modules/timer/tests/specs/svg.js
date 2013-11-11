KISSY.add(function (S, Dom, Anim, Color) {
    describe('svg works', function () {
        it('support svg attribute', function () {
            var div = Dom.create('<div></div>');
            document.body.appendChild(div);
            div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' +
                '<circle cx="100" cy="50" r="40" stroke="black" ' +
                'stroke-width="2" fill="#000"/></svg>';
            var circle = div.firstChild.firstChild;
            new Anim(circle, {
                fill: {
                    type: 'attr',
                    fxType: 'color',
                    value: '#fff'
                }
            }, {
                duration: 0.5
            }).run();
            waits(100);
            runs(function () {
                var fill = Color.parse(circle.getAttribute('fill')).toHex();
                expect(fill).not.toBe('#000000');
                expect(fill).not.toBe('#ffffff');
            });
            waits(5000);
            runs(function () {
                var fill = Color.parse(circle.getAttribute('fill')).toHex();
                expect(fill).toBe('#ffffff');
                document.body.removeChild(div);
            });
        });
    });
}, {
    requires: ['dom', 'anim', 'color']
});
KISSY.add(function (S, Node, Anim) {
    var $ = Node.all;
    describe('promise api', function () {
        it('support progress', function () {
            var d = $('<div style="width:100px"></div>').appendTo('body');
            var ok = 0;
            var anim = new Anim(d[0], {
                width: 200
            }, {
                duration: 0.3,
                complete: function () {
                    ok = 1;
                    d.remove();
                }
            }).run();
            var ps = [];
            anim.progress(function (v) {
                ps.push(v[1]);
            });
            waitsFor(function () {
                return ok;
            });
            runs(function () {
                expect(ps.length).toBeGreaterThan(10);
                expect(ps[0]).toBeLessThan(0.3);
                expect(ps[ps.length - 1]).toBeGreaterThan(0.9);
            });
        });
    });
}, {
    requires: ['node', 'anim']
});
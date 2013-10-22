KISSY.add(function (S, Anim, Node) {
    var $ = Node.all;

    describe('anim support promise api', function () {
        it('support then and complete callback', function () {
            var d = $('<div style="width:100px"></div>').appendTo(document.body);
            var ok = 0;
            new Anim(d[0], {
                width: 200
            }, {
                duration: 0.1,
                complete: function () {
                    expect(d.css('width')).toBe('200px');
                    ok++;
                }
            }).run().then(function () {
                    expect(d.css('width')).toBe('200px');
                    ok++;
                });
            waitsFor(function () {
                return ok == 2;
            });
            runs(function () {
                d.remove();
            });
        });

        it('support fail', function () {
            var d = $('<div style="width:100px"></div>').appendTo(document.body);
            var fail = 0;
            var complete = 0;
            var anim = new Anim(d[0], {
                width: 200
            }, {
                duration: 0.3,
                complete: function () {
                    complete = 1;
                }
            }).run();
            anim.fail(function () {
                fail = 1;
            });
            waits(100);
            runs(function () {
                anim.stop();
            });
            waits(10);
            runs(function () {
                expect(fail).toBe(1);
                expect(complete).toBe(0);
                expect(d.css('width')).not.toBe('100px');
                expect(d.css('width')).not.toBe('200px');
            });
            waits(300);
            runs(function () {
                expect(fail).toBe(1);
                expect(complete).toBe(0);
                expect(d.css('width')).not.toBe('100px');
                expect(d.css('width')).not.toBe('200px');
                d.remove();
            });
        });
    });
}, {
    requires: ['anim', 'node']
});
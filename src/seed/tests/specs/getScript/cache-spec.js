describe("getScript when cache", function () {
    var S = KISSY;
    // ie6
    it('can solve getScript error when cache', function () {
        var ok = 0;
        window.x=0;
        var js='/kissy/src/seed/tests/specs/getScript/x.jss';
        S.getScript(js, {
            charset: 'utf-8',
            success: function () {
                expect(window.x).toBe(1);
                setTimeout(function () {
                    S.getScript(js, {
                        charset: 'utf-8',
                        success: function () {
                            expect(window.x).toBe(2);
                            ok = 1;
                        }
                    });
                }, 500);
            }
        });
        waitsFor(function () {
            return ok == 1;
        });
    });
});
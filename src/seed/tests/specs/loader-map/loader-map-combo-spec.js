describe('loader-map for combo', function () {

    var S = KISSY;

    it('use map to modify single url', function () {

        var url = '';

        KISSY.config({
            packages: {
                a: {
                    base: window['PACKAGE_LOADER_MAP_COMBO_A_PATH'] || '../specs/loader-map'
                }
            },
            map: [
                [/(.+)a\/a.js(.+)$/, function (m, m1, m2) {
                    url = m;
                    return m1 + 'a/1.0/a.js' + m2;
                }]
            ]
        });

        var ret = 0;

        S.use('a/a,a/b', function (S, a, b) {
            expect(a).toBe(1);
            expect(b).toBe(2);
            ret = 1;
        });

        waitsFor(function () {
            return ret;
        });

        runs(function () {
            expect(url.indexOf('src/seed/tests/specs/loader-map/a/a.js?t=') != -1)
                .toBeTruthy();
        });
    });

});
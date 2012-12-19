KISSY.use('ajax', function (S, io) {
    describe('IO', function () {
        it('does not encode url query', function () {

            var ok = 0;

            var p = window.UnEncodePath || '../specs/un-encode/t.jss';
            io({
                url: p + '?t=1,2',
                success: function (data) {
                    expect(data.originalUrl).toBe("/kissy/src/ajax/tests/specs/un-encode/t.jss?t=1,2");
                    expect(data.query).toBe('1,2');
                    ok = 1;
                }
            });

            waitsFor(function () {
                return ok;
            });

        });

        it('encode data query', function () {

            var ok = 0;
            var p = window.UnEncodePath || '../specs/un-encode/t.jss';
            io({
                url: p,
                data: {
                    t: '1,2'
                },
                success: function (data) {
                    expect(data.originalUrl.toLowerCase()).toBe("/kissy/src/ajax/tests/specs/un-encode/t.jss?t=1%2c2");
                    expect(data.query).toBe('1,2');
                    ok = 1;
                }
            });

            waitsFor(function () {
                return ok;
            });

        });
    });
});
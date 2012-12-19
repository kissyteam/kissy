KISSY.use('ajax', function (S, io) {
    describe('IO', function () {
        it('does not encode url query and encode data query', function () {

            var ok = 0;

            var p = window.UnEncodePath || '../specs/un-encode/t.jss';
            io({
                url: p + '?t=1,2',
                data: {
                    y: '3,4'
                },
                success: function (data) {
                    expect(data.originalUrl.toLowerCase()).toBe("/kissy/src/ajax/tests/specs/un-encode/t.jss?y=3%2c4&t=1,2");
                    expect(data.t).toBe('1,2');
                    expect(data.y).toBe('3,4');
                    ok = 1;
                }
            });

            waitsFor(function () {
                return ok;
            });

        });
    });
});
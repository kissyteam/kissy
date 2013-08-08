describe('allow sync loading', function () {
    it('default to async', function () {
        KISSY.clearLoader();

        KISSY.add('test-sync', function () {
            return 1;
        });

        var t = undefined;


        KISSY.use('test-sync', function (S, x) {
            t = x;
        });

        expect(t).toBe(undefined);

        waits(50);

        runs(function () {
            expect(t).toBe(1);
        });
    });

    it('can be sync', function () {
        KISSY.clearLoader();

        KISSY.add('test-sync', function () {
            return 1;
        });

        var t = undefined;

        KISSY.use('test-sync', {
            success: function (S, x) {
                t = x;
            },
            sync: 1
        });

        expect(t).toBe(1);
    });
});
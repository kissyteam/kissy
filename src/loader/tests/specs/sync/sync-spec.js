var run = function (combine) {
    describe('allow sync loading ' + (combine ? 'at combo mode' : ''), function () {

        beforeEach(function () {
            KISSY.config('combine', !!combine);
        });

        afterEach(function () {
            KISSY.clearLoader();
        });

        it('default to async', function () {
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
};

run();
run(1);

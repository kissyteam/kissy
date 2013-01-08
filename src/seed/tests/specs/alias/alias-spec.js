describe("KISSY Loader alias", function () {

    it('alias works', function () {

        KISSY.config({
            packages: {
                a: {
                    base: window.ALIAS_PATH || '../specs/alias/'
                }
            },
            modules: {
                'alias-a/x': {
                    alias: ['alias-a/b', 'alias-a/c']
                },
                'alias-a/d': {
                    alias: ['alias-a/d/e', 'alias-a/d/f']
                },
                'alias-a/b': {
                    requires: ['alias-a/d']
                }
            }
        });


        var ret = 0;

        KISSY.use('alias-a/x', function (S, X) {
            var r = S.require('alias-a/x');
            expect(r).toBe('alias-a/b');
            expect(X).toBe('alias-a/b');
            ret = 1;
        });

        waitsFor(function () {
            return ret;
        });

    });

});
var run = function (combine) {
    /*jshint quotmark:false*/
    describe("KISSY Loader alias" + (combine ? 'at combo mode' : ''), function () {
        beforeEach(function () {
            KISSY.config('combine', !!combine);
        });

        afterEach(function () {
            KISSY.clearLoader();
        });
        it('works for package alias', function () {
            var modules = {
                'alias-a/x': ['alias-a/b', 'alias-a/c'],
                'alias-a/d': ['alias-a/d/e', 'alias-a/d/f']
            };
            KISSY.config({
                packages: {
                    'alias-a': {
                        base: window.ALIAS_PATH || '../specs/alias/',
                        alias: function (name) {
                            return modules[name];
                        }
                    }
                }
            });
            var ret = 0;

            KISSY.use('alias-a/x', function (S, X) {
                expect(X).toBe('alias-a/b');
                ret = 1;
            });

            waitsFor(function () {
                return ret;
            });
        });

        it('works for global alias', function () {
            var modules = {
                'alias-a/x': ['alias-a/b', 'alias-a/c'],
                'alias-a/d': ['alias-a/d/e', 'alias-a/d/f']
            };
            KISSY.config({
                alias: function (name) {
                    return modules[name];
                },
                packages: {
                    'alias-a': {
                        base: window.ALIAS_PATH || '../specs/alias/'
                    }
                }
            });
            var ret = 0;

            KISSY.use('alias-a/x', function (S, X) {
                expect(X).toBe('alias-a/b');
                ret = 1;
            });

            waitsFor(function () {
                return ret;
            });
        });

        it('alias works for module', function () {
            KISSY.config({
                packages: {
                    'alias-a': {
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
                expect(X).toBe('alias-a/b');
                ret = 1;
            });

            waitsFor(function () {
                return ret;
            });
        });
    });
};
run();
run(1);
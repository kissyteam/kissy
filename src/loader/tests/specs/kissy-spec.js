describe('kissy', function () {
    var S = KISSY;
    describe('utils', function () {
        it('S.error', function () {
            try {
                S.error('wrong');
            } catch (e) {
                expect(e.message).toBe('wrong');
            }
        });

        it('S.setImmediate works', function () {
            var order = [];
            S.setImmediate(function () {
                order.push(2);
                S.setImmediate(function () {
                    order.push(4);
                });
            });
            S.setImmediate(function () {
                order.push(3);
            });
            order.push(1);
            waits(100);
            runs(function () {
                expect(order).toEqual([1, 2, 3, 4]);
            });
        });
    });
    describe('S.getLogger', function () {
        var S = KISSY;
        var loggerCfg = S.config('logger');
        afterEach(function () {
            S.config('logger', loggerCfg);
        });
        it('default works', function () {
            var logger = S.getLogger('my');
            expect(logger.debug('x')).toBe('my: x');
            // default exclude s/.*
            logger = S.getLogger('s/xx');
            expect(logger.debug('x')).toBeFalsy();
        });
        it('includes works', function () {
            S.config('logger', {
                includes: [
                    {logger: /^xx\//}
                ]
            });
            var logger = S.getLogger('xx/y');
            expect(logger.debug('x')).toBe('xx/y: x');
            logger = S.getLogger('zz/x');
            expect(logger.debug('x')).toBeFalsy();
        });
        it('excludes works', function () {
            S.config('logger', {
                excludes: [
                    {logger: /^yy\//}
                ]
            });
            var logger = S.getLogger('xx/y');
            expect(logger.debug('x')).toBe('xx/y: x');
            logger = S.getLogger('yy/x');
            expect(logger.debug('x')).toBeFalsy();
        });
        it('includes precede excludes works', function () {
            S.config('logger', {
                includes: [
                    {logger: /^xx\//}
                ],
                excludes: [
                    {logger: /^xx\//}
                ]
            });
            var logger = S.getLogger('xx/y');
            expect(logger.debug('x')).toBe('xx/y: x');
            logger = S.getLogger('yy/x');
            expect(logger.debug('x')).toBeFalsy();
        });
        it('level works', function () {
            S.config('logger', {
                excludes: [
                    {
                        logger: /^xx\//,
                        maxLevel: 'info'
                    }
                ]
            });
            var logger = S.getLogger('xx/y');
            expect(logger.debug('x')).toBeFalsy();
            expect(logger.info('x')).toBeFalsy();
            expect(logger.warn('x')).toBe('xx/y: x');
            expect(logger.error('x')).toBe('xx/y: x');
        });
    });
});

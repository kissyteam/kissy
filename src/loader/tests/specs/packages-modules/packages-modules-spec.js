/**
 * tc for modules config
 * @author yiminghe@gmail.com
 */
// --no-module-wrap--
describe('modules and packages', function () {
    var locationPrefix = location.protocol + '//' + location.host;
    var build = (location.href.indexOf('build') !== -1) ||
        (location.href.indexOf('min') !== -1);

    beforeEach(function () {
        KISSY.config('combine', true);
    });

    afterEach(function () {
        KISSY.clearLoader();
    });

    it('can get base correctly', function () {
        expect(KISSY.config('base')).toBe(locationPrefix +
            (build ? '/kissy/build/' : '/kissy/src/loader/src/'));
    });

    it('does not depend on order', function () {
        KISSY.config({
            'modules': {
                'x/x': {
                    requires: ['x/y']
                }
            }
        });

        KISSY.config('packages', {
            x: {
                base: '../specs/packages-modules/x'
            }
        });

        var ret;

        KISSY.use('x/x', function (S, X) {
            expect(X).toBe(8);
            ret = X;
        });

        waitsFor(function () {
            return ret === 8;
        }, 5000);

    });

    it('package can has same path', function () {
        var ret = 0;
        KISSY.config({
            packages: {
                y: {
                    base: '../specs/packages-modules/y'
                },
                z: {
                    base: '../specs/packages-modules/z'
                }
            }
        });

        KISSY.use('y/y,z/z', function (S, y, z) {
            expect(y).toBe(2);
            expect(z).toBe(1);
            ret = 1;
        });

        waitsFor(function () {
            return ret;
        });
    });
});
var XTemplate = require('../lib/xtemplate');
var S = require('../lib/seed');
var cwd = process.cwd();
S.config('packages', {
    nodejsXtemplate: {
        ignorePackageNameInUri: 1,
        base: cwd + '/src/xtemplate/tests/specs/xtpls/'
    }
});

describe('xtemplate on nodejs', function () {
    it('can load from file', function () {
        var xtemplate = XTemplate.loadFromModuleName('nodejsXtemplate/a-xtpl');

        expect(xtemplate.render({
            a: 1,
            d: 3,
            b: {
                c: 2
            }
        })).toBe('123');
    });

    it('custom command works', function () {
        var xtemplate = XTemplate.loadFromModuleName('nodejsXtemplate/custom-command-xtpl', {
            commands: {
                command: function () {
                    return 'yiminghe';
                }
            }
        });
        expect(xtemplate.render()).toBe('i am yiminghe!');
    });
});
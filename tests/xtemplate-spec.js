var XTemplate = require('../lib/xtemplate');
var cwd = process.cwd();

describe('xtemplate on nodejs', function () {
    var base = cwd + '/src/xtemplate/tests/xtpls/';
    it('can load from file', function () {
        var ret = 0;
        XTemplate.renderFile(base + 'a-xtpl.html', {
            a: 1,
            d: 3,
            b: {
                c: 2
            }
        }, function (err, content) {
            ret = 1;
            expect(content).toBe('123');
        });
        waitsFor(function () {
            return ret;
        });
    });

    it('custom command works', function () {
        var ret = 0;
        XTemplate.XTemplate.addCommand('command', function () {
            return 'yiminghe';
        });
        XTemplate.renderFile(base + 'custom-command-xtpl.html', {
        }, function (err, content) {
            ret = 1;
            expect(content).toBe('i am yiminghe!');
        });
        waitsFor(function () {
            return ret;
        });
    });
});
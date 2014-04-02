var XTemplate = require('../lib/xtemplate');
var cwd = process.cwd();

describe('xtemplate on nodejs', function () {
    var base = cwd + '/src/xtemplate/tests/specs/xtpls/';
    it('can load from file', function () {
        var ret = 0;
        XTemplate.load(base + 'a-xtpl.html', function (err, xtemplate) {
            xtemplate.render({
                a: 1,
                d: 3,
                b: {
                    c: 2
                }
            }, function (err, content) {
                ret = 1;
                expect(content).toBe('123');
            });
        });
        waitsFor(function () {
            return ret;
        });
    });

    it('custom command works', function () {
        var ret = 0;
        XTemplate.load(base + 'custom-command-xtpl.html', {
            commands: {
                command: function () {
                    return 'yiminghe';
                }
            }
        }, function (err, xtemplate) {
            xtemplate.render({}, function (err, content) {
                ret = 1;
                expect(content).toBe('i am yiminghe!');
            });
        });
        waitsFor(function () {
            return ret;
        });
    });
});
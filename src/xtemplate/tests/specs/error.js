/**
 * error test tc
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    /*jshint quotmark:false*/
    var XTemplate = require('xtemplate');
    var util = require('util');

    describe('error detection', function () {
        // https://github.com/kissyteam/kissy/issues/516
        it('error when string encounter \\', function () {
            var ret;
            try {
                ret = new XTemplate("{{'\\'}}").render();
            } catch (e) {
                ret = e.message;
            }
            expect(ret.indexOf('expect LPAREN')).not.toBe(-1);
        });

        it('detect lexer error', function () {
            var ret;
            try {
                ret = new XTemplate("{{'}}").render();
            } catch (e) {
                ret = e.message;
            }
            expect(ret.indexOf('expect LPAREN')).not.toBe(-1);
        });

        it('detect un-closed block tag', function () {
            var tpl = '{{#if(title)}}\n' +
                    'shoot\n' +
                    '',
                data = {
                    title: 'o'
                }, info;


            try {
                new XTemplate(tpl).render(data);
            } catch (e) {
                info = e.message;

            }
            if (S.config('debug')) {
                expect(util.startsWith(info, 'Syntax error at line 3:\n' +
                    '{{#if(title)}} shoot\n\n' +
                    '--------------------^\n' +
                    'expect'));
                // OPEN_END_BLOCK
            }
        });

        it('detect unmatched', function () {
            if (!KISSY.config('debug')) {
                return;
            }
            var tpl = '{{#if(n === n1)}}\n' +
                'n eq n1\n' +
                '{{/with}}';

            var data = {
                n: 1,
                n1: 2
            };

            expect(function () {
                try {
                    new XTemplate(tpl).render(data);
                } catch (e) {
                    //S.log('!'+e.replace(/\n/g,'\\n').replace(/\r/g,'\\r')+'!');
                    throw e;
                }
            }).toThrow('Syntax error at line 3:\n' +
                'expect {{/if}} not {{/with}}');
        });

        it('detect unmatched custom command', function () {
            if (!KISSY.config('debug')) {
                return;
            }
            var tpl = '{{#x.y()}}\n{{/x}}';

            expect(function () {
                try {
                    new XTemplate(tpl).render();
                } catch (e) {
                    throw e;
                }
            }).toThrow('Syntax error at line 2:\n' +
                'expect {{/x,y}} not {{/x}}');
        });

        it('will report file information ' +
            'when render compiled template error', function () {
            if (1) {
                return;
            }

            var path;

            if (typeof process !== 'undefined') {
                path = S.config('packages').src.base + 'xtemplate/tests/specs/';

                S.config('packages', {
                    xtpls: {
                        base: path
                    }
                });
            } else {
                KISSY.config('packages', {
                    'xtpls': {
                        base: '/kissy/src/xtemplate/tests/specs/'
                    }
                });
            }

            var ok = 0;

            S.use('xtpls/custom-command-xtpl', function (S, tpl) {
                ok = 1;
                expect(function () {
                    new XTemplate(tpl, {
                        commands: {
                            command: function () {
                                throw new Error('error in custom-command');
                            }
                        }
                    }).render();
                }).toThrow('in file: xtpls/custom-command-xtpl error in custom-command:' +
                    ' "command" at line 1');
            });

            waitsFor(function () {
                return ok;
            });
        });
    });
});
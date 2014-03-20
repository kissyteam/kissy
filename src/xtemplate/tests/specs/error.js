KISSY.add(function (S, require) {
    var XTemplate = require('xtemplate');

    describe('error detection', function () {
        // https://github.com/kissyteam/kissy/issues/516
        it('error when string encounter \\', function () {
            /*jshint quotmark:false*/
            var ret;
            try {
                ret = new XTemplate("{{'\\'}}").render();
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
                expect(S.startsWith(info, 'Syntax error at line 3:\n' +
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

        it('will report file information ' +
            'when render compiled template error', function () {
            if (1) {
                return;
            }

            var path;

            if (S.UA.nodejs) {
                path = S.config('packages').src.uri
                    .resolve('../src/xtemplate/tests/specs/')
                    .getPath();

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
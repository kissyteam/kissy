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
                ret = e.toString();
            }
            expect(ret.indexOf('expect LPAREN')).not.toBe(-1);
        });

        it('detect un-closed block tag', function () {
            var tpl = '{{#if title}}\n' +
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
                    '{{#if title}} shoot\n\n' +
                    '--------------------^\n' +
                    'expect'));
                // OPEN_END_BLOCK
            }
        });

        it('warn about missing property', function () {
            var log = S.log, msg2 = '';

            var tpl = 'this is \n' +
                '{{title}}';

            var data = {
                title2: 1
            };

            S.log = function (msg, type) {
                if (type === 'info') {
                    msg2 = msg;
                }
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('this is \n');

            expect(msg2).toBe('can not find property: "title" at line 2');

            S.log = log;
        });

        it('throw error if missing property', function () {
            if (!KISSY.config('debug')) {
                return;
            }

            var tpl = 'this is \n' +
                '{{title}}';

            var data = {
                title2: 1
            };

            var msg;

            try {
                new XTemplate(tpl, {
                    silent: 0
                }).render(data);
            } catch (e) {
                msg = e.message;
            }

            expect(msg).toBe('can not find property: "title" at line 2');
        });

        it('detect unmatched', function () {
            if (!KISSY.config('debug')) {
                return;
            }
            var tpl = '{{#if n===n1}}\n' +
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

    });
});
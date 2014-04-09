/**
 * test escape for xtemplate
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var XTemplate = require('xtemplate');

    describe('escape', function () {
        it('can escape {{{', function () {
            var tpl = '\\{{{x}}\\}';
            var render = new XTemplate(tpl).render({x: 1});
            expect(render).toBe('{{{x}}\\}');
        });

        it('can output {escape}', function () {
            var tpl = '{{"{"+x+"}"}}';
            var render = new XTemplate(tpl).render({x: '<'});
            expect(render).toBe('{&lt;}');
        });

        it('support escape {{', function () {
            var tpl = 'my {{!\n' +
                'comment' +
                '\n}} \\{{title}}';

            var data = {
                title: 'oo'
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('my  {{title}}');

            render = new XTemplate('\\{{@').render({});

            expect(render).toBe('{{@');

        });

        it('support escape {{ more', function () {
            var tpl = 'my {{!\n' +
                'comment' +
                '\n}} \\{{title}}{{title}}';

            var data = {
                title: 'oo'
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('my  {{title}}oo');
        });

        it('escapeHtml works', function () {
            var tpl = 'my {{title}} is {{{title}}}';

            var data = {
                title: '<a>'
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('my &lt;a&gt; is <a>');
        });

        it('escape in inline command', function () {
            var tpl = 'my {{title()}} is {{{title()}}}';
            var render = new XTemplate(tpl, {
                commands: {
                    title: function () {
                        return '<a>';
                    }
                }
            }).render();

            expect(render).toBe('my &lt;a&gt; is <a>');
        });

        it('escape in inline command 2', function () {
            var tpl = 'my {{title(2)}} is {{{title(2)}}}';

            var render = new XTemplate(tpl, {
                commands: {
                    title: function () {
                        return '<a>';
                    }
                }
            }).render();

            expect(render).toBe('my &lt;a&gt; is <a>');
        });

        it('support escape " in tpl', function () {
            var tpl = '{{{"haha \\""}}}';

            var render = new XTemplate(tpl).render({});

            expect(render).toBe('haha "');
        });

        it('support escape \' in tpl', function () {
            var tpl = '{{{\'haha \\\'\'}}}';

            var render = new XTemplate(tpl).render({});

            expect(render).toBe('haha \'');
        });

        it('support escape \\\' in tpl', function () {
            var tpl = '{{{"haha \'"}}}';

            var render = new XTemplate(tpl).render({});
            /*jshint quotmark:false*/
            expect(render).toBe("haha '");
        });

        it('does support escape " in content', function () {
            var tpl = '"haha \\"';

            var render = new XTemplate(tpl).render({});

            expect(render).toBe('"haha \\"');
        });


        it('support escape escape', function () {
            var tpl = 'haha \\\\{{title}}';
            var data = {
                title: 'a'
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('haha \\a');


            tpl = 'haha \\\\\\{{title}}';
            data = {
                title: 'a'
            };

            render = new XTemplate(tpl).render(data);

            expect(render).toBe('haha \\{{title}}');

            tpl = 'haha \\\\\\\\\\{{title}}';
            data = {
                title: 'a'
            };

            render = new XTemplate(tpl).render(data);

            expect(render).toBe('haha \\\\{{title}}');
        });

    });
});
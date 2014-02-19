/**
 * extend system for XTemplate
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var XTemplate = require('xtemplate');

    describe('inheritance', function () {
        var mods = ['template_inheritance/base', 'template_inheritance/base2', 'template_inheritance/base3', 'template_inheritance/base4'];

        beforeEach(function () {
            S.each(mods, function (mod) {
                delete S.Env.mods[mod];
            });
        });

        it('support block', function () {
            var base = 'title {{#block "name"}}{{content}}{{/block}}';

            var sub = '{{extend "template_inheritance/base"}} {{#block "name"}}sub {{content}}{{/block}}';

            KISSY.add('template_inheritance/base', base);

            var result = new XTemplate(sub).render({
                content: 1
            });

            expect(result).toBe('title sub 1');
        });

        it('support block append', function () {
            var base = 'title {{#block "name"}}{{content}}{{/block}}';

            var base2 = '{{extend "template_inheritance/base"}} {{#block "append" "name"}} append base2 {{/block}}';

            KISSY.add('template_inheritance/base', base);

            KISSY.add('template_inheritance/base2', base2);

            var sub = '{{extend "template_inheritance/base2"}} {{#block "append" "name"}} append sub {{/block}}';

            var result = new XTemplate(sub).render({
                content: 1
            });

            expect(result).toBe('title 1 append base2  append sub ');
        });

        it('support block prepend', function () {
            var base = 'title {{#block "name"}}{{content}}{{/block}}';

            var base2 = '{{extend "template_inheritance/base"}} {{#block "prepend" "name"}} prepend base2 {{/block}}';

            KISSY.add('template_inheritance/base', base);

            KISSY.add('template_inheritance/base2', base2);

            var sub = '{{extend "template_inheritance/base2"}} {{#block "prepend" "name"}} prepend sub {{/block}}';

            var result = new XTemplate(sub).render({
                content: 1
            });

            expect(result).toBe('title  prepend sub  prepend base2 1');
        });

        it('support mixing prepend and append', function () {
            var base = 'title {{#block "name"}}{{content}}{{/block}}';

            var base2 = '{{extend "template_inheritance/base"}} {{#block "prepend" "name"}} prepend base2 {{/block}}';

            var base3 = '{{extend "template_inheritance/base2"}} {{#block "append" "name"}} append base3 {{/block}}';

            KISSY.add('template_inheritance/base', base);

            KISSY.add('template_inheritance/base2', base2);

            KISSY.add('template_inheritance/base3', base3);

            var sub = '{{extend "template_inheritance/base3"}} {{#block "prepend" "name"}} prepend sub< {{/block}}';

            var result = new XTemplate(sub).render({
                content: 1
            });

            expect(result).toBe('title  prepend sub<  prepend base2 1 append base3 ');
        });
    });
});
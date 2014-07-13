/**
 * extend system for XTemplate
 * @author yiminghe@gmail.com
 */

var XTemplate = require('xtemplate');
var util = require('util');

describe('extend', function () {
    var mods = ['template_extend/base', 'template_extend/base2', 'template_extend/base3', 'template_extend/base4'];

    beforeEach(function () {
        util.each(mods, function (mod) {
            delete XTemplate.loader.cache[mod];
            delete KISSY.Env.mods[mod];
        });
    });

    it('support block', function () {
        var base = 'title {{#block ("name")}}{{content}}{{/block}}';

        var sub = '{{extend("template_extend/base")}}{{#block ("name")}}sub {{content}}{{/block}}';

        KISSY.add('template_extend/base', base);

        var result = new XTemplate(sub).render({
            content: 1
        });

        expect(result).toBe('title sub 1');
    });

    it('support block append', function () {
        var base = 'title {{#block( "name")}}{{content}}{{/block}}';

        var base2 = '{{extend ("template_extend/base")}}{{#block ("append", "name")}} append base2 {{/block}}';

        KISSY.add('template_extend/base', base);

        KISSY.add('template_extend/base2', base2);

        var sub = '{{extend ("template_extend/base2")}}{{#block ("append", "name")}} append sub {{/block}}';

        var result = new XTemplate(sub).render({
            content: 1
        });

        expect(result).toBe('title 1 append base2  append sub ');
    });

    it('support block prepend', function () {
        var base = 'title {{#block ("name")}}{{content}}{{/block}}';

        var base2 = '{{extend ("template_extend/base")}}{{#block( "prepend", "name")}} prepend base2 {{/block}}';

        KISSY.add('template_extend/base', base);

        KISSY.add('template_extend/base2', base2);

        var sub = '{{extend ("template_extend/base2")}}{{#block( "prepend", "name")}} prepend sub {{/block}}';

        var result = new XTemplate(sub).render({
            content: 1
        });

        expect(result).toBe('title  prepend sub  prepend base2 1');
    });

    it('support mixing prepend and append', function () {
        var base = 'title {{#block ("name")}}{{content}}{{/block}}';

        var base2 = '{{extend ("template_extend/base")}}{{#block ("prepend", "name")}} prepend base2 {{/block}}';

        var base3 = '{{extend ("template_extend/base2")}}{{#block( "append", "name")}} append base3 {{/block}}';

        KISSY.add('template_extend/base', base);

        KISSY.add('template_extend/base2', base2);

        KISSY.add('template_extend/base3', base3);

        var sub = '{{extend( "template_extend/base3")}}{{#block ("prepend", "name")}} prepend sub< {{/block}}';

        var result = new XTemplate(sub).render({
            content: 1
        });

        expect(result).toBe('title  prepend sub<  prepend base2 1 append base3 ');
    });
});
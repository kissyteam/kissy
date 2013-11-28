/**
 * TC for KISSY XTemplate
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var XTemplate = require('xtemplate');
    require('./error');
    require('./feature');
    if (S.UA.nodejs) {
        require('./node');
    }
    require('./sub-template');

    describe('汉字', function () {
        it('允许汉字内容', function () {
            var tpl = '{{t}}出现了';
            var data = {
                t: 1
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('1出现了');
        });

        it('允许汉字参数', function () {
            var tpl = '{{t "出现了"}}';
            var data = {
            };

            var render = new XTemplate(tpl, {
                commands: {
                    t: function (scope, option) {
                        return option.params[0];
                    }
                }
            }).render(data);

            expect(render).toBe('出现了');
        });
    });
});
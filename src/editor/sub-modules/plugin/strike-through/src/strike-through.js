/**
 * @ignore
 * strikeThrough button
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var ui = require('./font/ui');
    var cmd = require('./strike-through/cmd');
    require('./button');
    function StrikeThrough() {
    }

    S.augment(StrikeThrough, {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            editor.addButton('strikeThrough', {
                cmdType: 'strikeThrough',
                tooltip: '删除线'
            }, ui.Button);
        }
    });

    return StrikeThrough;
});
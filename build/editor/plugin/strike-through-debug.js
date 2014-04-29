/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:06
*/
/*
combined modules:
editor/plugin/strike-through
*/
/**
 * @ignore
 * strikeThrough button
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/strike-through', [
    './font/ui',
    './strike-through/cmd',
    './button'
], function (S, require) {
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
                tooltip: '\u5220\u9664\u7EBF'
            }, ui.Button);
        }
    });
    return StrikeThrough;
});



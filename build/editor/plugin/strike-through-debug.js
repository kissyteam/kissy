/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
/*
combined modules:
editor/plugin/strike-through
*/
KISSY.add('editor/plugin/strike-through', [
    './font/ui',
    './strike-through/cmd',
    './button'
], function (S, require, exports, module) {
    /**
 * @ignore
 * strikeThrough button
 * @author yiminghe@gmail.com
 */
    var ui = require('./font/ui');
    var cmd = require('./strike-through/cmd');
    require('./button');
    function StrikeThrough() {
    }
    StrikeThrough.prototype = {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            editor.addButton('strikeThrough', {
                cmdType: 'strikeThrough',
                tooltip: '\u5220\u9664\u7EBF'
            }, ui.Button);
        }
    };
    module.exports = StrikeThrough;
});



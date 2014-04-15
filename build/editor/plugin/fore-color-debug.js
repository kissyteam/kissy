/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:47
*/
/*
combined files : 

editor/plugin/fore-color

*/
/**
 * @ignore
 * foreColor button.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/fore-color',['./color/btn', './fore-color/cmd'], function (S, require) {
    var Button = require('./color/btn');
    var cmd = require('./fore-color/cmd');


    function ForeColorPlugin(config) {
        this.config = config || {};
    }

    S.augment(ForeColorPlugin, {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            Button.init(editor, {
                cmdType: 'foreColor',
                defaultColor: 'rgb(204, 0, 0)',
                tooltip: '文本颜色'
            });
        }
    });

    return ForeColorPlugin;
});

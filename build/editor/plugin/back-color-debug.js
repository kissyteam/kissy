/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:44
*/
/*
combined files : 

editor/plugin/back-color

*/
/**
 * @ignore
 * backColor button.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/back-color',['./color/btn', './back-color/cmd'], function (S,require) {
    var Button=require('./color/btn');
    var cmd=require('./back-color/cmd');
    function backColor(config) {
        this.config = config || {};
    }

    S.augment(backColor, {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            Button.init(editor, {
                defaultColor: 'rgb(255, 217, 102)',
                cmdType: 'backColor',
                tooltip: '背景颜色'
            });
        }
    });

    return backColor;
});

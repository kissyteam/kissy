/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:01
*/
/*
combined modules:
editor/plugin/dialog
*/
/**
 * @ignore
 * custom dialog for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/dialog', [
    'editor',
    'overlay',
    './focus-fix',
    'dd/plugin/constrain',
    'component/plugin/drag',
    'dom'
], function (S, require) {
    var Editor = require('editor');
    var Overlay = require('overlay');
    var focusFix = require('./focus-fix');
    var ConstrainPlugin = require('dd/plugin/constrain');
    var DragPlugin = require('component/plugin/drag');
    var Dom = require('dom');
    return Overlay.Dialog.extend({
        initializer: function () {
            this.plug(new DragPlugin({
                handlers: ['.ks-editor-dialog-header'],
                plugins: [new ConstrainPlugin({ constrain: window })]
            }));
        },
        bindUI: function () {
            focusFix.init(this);
        },
        show: function () {
            var self = this;    //在 show 之前调用
            //在 show 之前调用
            self.center();
            var y = self.get('y');    //居中有点偏下
            //居中有点偏下
            if (y - Dom.scrollTop() > 200) {
                y = Dom.scrollTop() + 200;
                self.set('y', y);
            }
            self.callSuper();
        }
    }, {
        ATTRS: {
            prefixCls: { value: 'ks-editor-' },
            'zIndex': { value: Editor.baseZIndex(Editor.ZIndexManager.OVERLAY) }
        }
    });
});






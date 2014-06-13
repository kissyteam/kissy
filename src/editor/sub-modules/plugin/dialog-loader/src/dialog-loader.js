/**
 * @ignore
 * load editor's dialog dynamically
 * @author yiminghe@gmail.com
 */

var Editor = require('editor');
var Overlay = require('overlay');
var Dom = require('dom');
var UA = require('ua');
var globalMask,
    loadMask = {
        loading: function (prefixCls) {
            if (!globalMask) {
                globalMask = new Overlay({
                    x: 0,
                    width: UA.ie === 6 ? Dom.docWidth() : '100%',
                    y: 0,
                    // 指定全局 loading zIndex 值
                    'zIndex': Editor.baseZIndex(Editor.ZIndexManager.LOADING),
                    prefixCls: prefixCls + 'editor-',
                    elCls: prefixCls + 'editor-global-loading'
                });
            }
            globalMask.set('height', Dom.docHeight());
            globalMask.show();
            globalMask.loading();
        },
        unloading: function () {
            globalMask.hide();
        }
    };

module.exports = {
    useDialog: function (editor, name, config, args) {
        // restore focus in editor
        // make dialog remember
        editor.focus();
        var prefixCls = editor.get('prefixCls');
        if (editor.getControl(name + '/dialog')) {
            setTimeout(function () {
                editor.showDialog(name, args);
            }, 0);
            return;
        }
        loadMask.loading(prefixCls);
        require(['editor/plugin/' + name + '/dialog'], function (Dialog) {
            loadMask.unloading();
            editor.addControl(name + '/dialog', new Dialog(editor, config));
            editor.showDialog(name, args);
        });
    }
};
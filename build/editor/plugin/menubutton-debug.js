/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:47
*/
/*
combined modules:
editor/plugin/menubutton
*/
KISSY.add('editor/plugin/menubutton', [
    'editor',
    'util',
    'menubutton'
], function (S, require, exports, module) {
    /**
 * @ignore
 * select component for kissy editor.
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    var util = require('util');
    var MenuButton = require('menubutton');    /**
 * add select to editor toolbar
 * @param {String} id control id
 * @param {Object} cfg select config
 * @param {Function} SelectType Select constructor. needs to extend {@link KISSY.MenuButton.Select}, Defaults to {@link KISSY.MenuButton.Select}.
 * @member KISSY.Editor
 */
    /**
 * add select to editor toolbar
 * @param {String} id control id
 * @param {Object} cfg select config
 * @param {Function} SelectType Select constructor. needs to extend {@link KISSY.MenuButton.Select}, Defaults to {@link KISSY.MenuButton.Select}.
 * @member KISSY.Editor
 */
    Editor.prototype.addSelect = function (id, cfg, SelectType) {
        SelectType = SelectType || MenuButton.Select;
        var self = this, prefixCls = self.get('prefixCls') + 'editor-';
        if (cfg) {
            cfg.editor = self;
            if (cfg.menu) {
                cfg.menu.zIndex = Editor.baseZIndex(Editor.ZIndexManager.SELECT);
            }
            if (cfg.elCls) {
                cfg.elCls = prefixCls + cfg.elCls;
            }
        }
        var s = new SelectType(util.mix({
                render: self.get('toolBarEl'),
                prefixCls: prefixCls
            }, cfg)).render();
        if (cfg.mode === Editor.Mode.WYSIWYG_MODE) {
            self.on('wysiwygMode', function () {
                s.set('disabled', false);
            });
            self.on('sourceMode', function () {
                s.set('disabled', true);
            });
        }
        self.addControl(id + '/select', s);
        return s;
    };
    module.exports = MenuButton;
});



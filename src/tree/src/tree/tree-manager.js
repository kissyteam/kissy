/**
 * @ignore
 * tree management utils
 * @author yiminghe@gmail.com
 */
var DelegateChildrenExtension = require('component/extension/delegate-children');
var TapGesture = require('event/gesture/tap');
var util = require('util');

/**
 * Manage tree node for tree root
 * @class KISSY.Tree.Manager
 */
function TreeManager() {
}

TreeManager.ATTRS = {
    allowTextSelection: {
        value: true
    },

    focusable: {
        value: true
    },

    handleGestureEvents: {
        value: true
    },

    /**
     * Whether show root node.
     * Defaults to: true.
     * @cfg {Boolean} showRootNode
     */
    /**
     * @ignore
     */
    showRootNode: {
        value: true,
        render: 1
    },
    /**
     * Current selected tree node.
     * @property {KISSY.Tree.Node} selectedItem
     * @readonly
     */
    /**
     * @ignore
     */
    selectedItem: {}
};

util.augment(TreeManager, DelegateChildrenExtension, {
    isTree: 1,

    __bindUI: function () {
        var self = this,
            prefixCls = self.get('prefixCls'),
            delegateCls = prefixCls + 'tree-node';

        self.$el.delegate(TapGesture.TAP, '.' + delegateCls,
            self.handleChildrenEvents, self);
    },

    // 单选
    _onSetSelectedItem: function (n, ev) {
        // 仅用于排他性
        if (n && ev.prevVal) {
            ev.prevVal.set('selected', false, {
                data: {
                    byPassSetTreeSelectedItem: 1
                }
            });
        }
    },

    _onSetShowRootNode: function (v) {
        this.get('rowEl')[v ? 'show' : 'hide']();
    }
});

module.exports = TreeManager;